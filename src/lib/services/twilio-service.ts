import { Twilio } from 'twilio';
import { z } from 'zod';
import { CrisisResponse } from './response-router';
import { sendCrisisResponseSentEvent } from '@/lib/inngest';

/**
 * TASK-031: Twilio Service com Retry 3x Exponential Backoff
 *
 * Lei #12 (CONSTITUTION): Pattern Matching é Autoridade
 * Lei #22: Secrets em .env, nunca em código
 *
 * Requisito: Enviar mensagens WhatsApp com retry automático
 * Performance: < 2s por mensagem (com retry)
 */

export type ResponseType = 'audio' | 'text' | 'media';

export interface TwilioMessageInput {
  userId: number;
  phoneNumber: string; // formato: +55XXXXXXXXXXXX (Brasil)
  message: string; // corpo da mensagem de texto
  audioUrl?: string; // URL do áudio pré-gravado (se crisis)
  mediaUrls?: string[]; // URLs adicionais de mídia
}

export interface TwilioMessageResult {
  success: boolean;
  messageId?: string; // Twilio SID
  phoneNumber: string;
  content: string;
  audioUrl?: string;
  executionTimeMs: number;
  retryAttempts: number;
  sentAt: string;
}

// Validação Zod para entrada
const twilioMessageSchema = z.object({
  userId: z.number().positive('userId deve ser positivo'),
  phoneNumber: z
    .string()
    .regex(/^\+55\d{10,11}$/, 'Número deve estar em formato: +55XXXXXXXXXX ou +55XXXXXXXXXXX'),
  message: z.string().min(1, 'Mensagem vazia não permitida'),
  audioUrl: z.string().url('URL de áudio inválida').optional(),
  mediaUrls: z.array(z.string().url()).optional(),
});

/**
 * Custom error types para Twilio
 */
export class TwilioError extends Error {
  constructor(
    public code: string,
    public statusCode: number,
    message: string
  ) {
    super(message);
    this.name = 'TwilioError';
  }
}

export class TwilioRetryExhaustedError extends Error {
  constructor(
    public attempts: number,
    public lastError: TwilioError
  ) {
    super(`Twilio retry exhausted after ${attempts} attempts`);
    this.name = 'TwilioRetryExhaustedError';
  }
}

/**
 * Configuração de retry com exponential backoff
 */
interface RetryConfig {
  maxRetries: number;
  initialDelayMs: number;
  maxDelayMs: number;
  backoffFactor: number; // multiplicador entre tentativas
}

const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  initialDelayMs: 1000,
  maxDelayMs: 10000,
  backoffFactor: 2,
};

/**
 * Helper: Delay com Promise
 */
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Helper: Calcular próximo delay com exponential backoff + jitter
 * Jitter previne "thundering herd" (múltiplas requisições simultâneas)
 */
function calculateNextDelay(
  attempt: number,
  config: RetryConfig
): number {
  const exponentialDelay = config.initialDelayMs * Math.pow(config.backoffFactor, attempt);
  const cappedDelay = Math.min(exponentialDelay, config.maxDelayMs);
  const jitter = Math.random() * 0.1 * cappedDelay; // ±10% jitter
  return Math.round(cappedDelay + jitter);
}

/**
 * Service principal: Twilio com Retry
 */
export class TwilioService {
  private client: Twilio;
  private fromNumber: string;
  private retryConfig: RetryConfig;

  constructor(retryConfig?: Partial<RetryConfig>) {
    // Validar credentials
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const fromNumber = process.env.TWILIO_WHATSAPP_NUMBER;

    if (!accountSid || !authToken || !fromNumber) {
      throw new Error(
        'Missing Twilio credentials: TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_WHATSAPP_NUMBER'
      );
    }

    this.client = new Twilio(accountSid, authToken);
    this.fromNumber = fromNumber;
    this.retryConfig = { ...DEFAULT_RETRY_CONFIG, ...retryConfig };
  }

  /**
   * Enviar mensagem WhatsApp com retry automático
   *
   * Fluxo:
   * 1. Validar entrada (Zod)
   * 2. Tentar enviar via Twilio
   * 3. Se falhar, retry com exponential backoff
   * 4. Log de performance e sucesso
   * 5. Disparar evento Inngest (crisis.response.sent)
   */
  async sendMessage(input: TwilioMessageInput): Promise<TwilioMessageResult> {
    const startTime = performance.now();

    try {
      // Validação (Lei #9: Zod validation)
      const validated = twilioMessageSchema.parse(input);

      console.log('[TwilioService] Iniciando envio:', {
        userId: validated.userId,
        phoneNumber: validated.phoneNumber,
        hasAudio: !!validated.audioUrl,
      });

      let lastError: TwilioError | null = null;
      let messageId: string | undefined;

      // Loop de retry
      for (let attempt = 0; attempt <= this.retryConfig.maxRetries; attempt++) {
        try {
          // Enviar mensagem via Twilio
          const response = await this.client.messages.create({
            from: `whatsapp:${this.fromNumber}`,
            to: `whatsapp:${validated.phoneNumber}`,
            body: validated.message,
            mediaUrl: validated.audioUrl ? [validated.audioUrl] : undefined,
          });

          messageId = response.sid;

          const endTime = performance.now();
          const executionTimeMs = endTime - startTime;

          // Log de sucesso
          console.log('[TwilioService] ✅ Mensagem enviada:', {
            messageId: response.sid,
            phoneNumber: validated.phoneNumber,
            executionTimeMs: executionTimeMs.toFixed(2),
            attempt,
            status: response.status,
          });

          // Disparar evento Inngest (Lei #12: rastreabilidade)
          try {
            await sendCrisisResponseSentEvent({
              userId: validated.userId,
              messageId: response.sid as any, // FIXME: tipo esperado é number
              responseType: validated.audioUrl ? 'audio' : 'text',
              sentAt: new Date().toISOString(),
            });
          } catch (eventError) {
            console.warn('[TwilioService] Falha ao enviar evento Inngest (não bloqueia):', eventError);
          }

          return {
            success: true,
            messageId: response.sid,
            phoneNumber: validated.phoneNumber,
            content: validated.message,
            audioUrl: validated.audioUrl,
            executionTimeMs,
            retryAttempts: attempt,
            sentAt: new Date().toISOString(),
          };
        } catch (error) {
          // Classificar erro
          if (error instanceof Error) {
            const statusCode = (error as any).status || 500;
            const code = (error as any).code || 'UNKNOWN';

            lastError = new TwilioError(code, statusCode, error.message);

            // 429 (Too Many Requests) sempre pode ser retried
            // 5xx também podem ser retried
            // 4xx geralmente não devem ser retried (exceto 429, 408)
            const isRetryable =
              statusCode === 429 ||
              statusCode === 408 ||
              (statusCode >= 500 && statusCode < 600);

            if (!isRetryable || attempt === this.retryConfig.maxRetries) {
              throw lastError;
            }

            // Esperar antes de próxima tentativa
            const nextDelay = calculateNextDelay(attempt, this.retryConfig);
            console.warn(
              `[TwilioService] ⚠️ Tentativa ${attempt + 1} falhou (${statusCode}). Retry em ${nextDelay}ms...`,
              {
                code,
                message: error.message,
              }
            );

            await delay(nextDelay);
          } else {
            throw error;
          }
        }
      }

      // Nunca deve chegar aqui (a tentativa final vai throw)
      throw lastError || new Error('Desconhecido');
    } catch (error) {
      const endTime = performance.now();
      const executionTimeMs = endTime - startTime;

      // Log de erro
      if (error instanceof TwilioError) {
        console.error('[TwilioService] ❌ Erro Twilio após retries:', {
          code: error.code,
          statusCode: error.statusCode,
          message: error.message,
          userId: input.userId,
          phoneNumber: input.phoneNumber,
          executionTimeMs: executionTimeMs.toFixed(2),
        });
      } else if (error instanceof z.ZodError) {
        console.error('[TwilioService] ❌ Validação falhou:', {
          errors: error.errors.map((e) => ({ path: e.path, message: e.message })),
        });
      } else {
        console.error('[TwilioService] ❌ Erro desconhecido:', error);
      }

      // Traduzir erro para tipo apropriado
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido ao enviar via Twilio';

      if (error instanceof z.ZodError) {
        throw new Error(`Validação falhou: ${error.errors[0].message}`);
      } else if (error instanceof TwilioError) {
        throw error;
      } else {
        throw new Error(errorMessage);
      }
    }
  }

  /**
   * Enviar com resposta de crise (conveniente)
   * Integração direta com response-router (TASK-029)
   */
  async sendCrisisResponse(
    userId: number,
    phoneNumber: string,
    crisisResponse: CrisisResponse
  ): Promise<TwilioMessageResult> {
    return this.sendMessage({
      userId,
      phoneNumber,
      message: crisisResponse.message,
      audioUrl: crisisResponse.audioUrl,
    });
  }

  /**
   * Enviar mensagem de confirmação (sem áudio)
   */
  async sendConfirmation(
    userId: number,
    phoneNumber: string,
    message: string
  ): Promise<TwilioMessageResult> {
    return this.sendMessage({
      userId,
      phoneNumber,
      message,
    });
  }

  /**
   * Health check: verificar conexão com Twilio
   */
  async healthCheck(): Promise<boolean> {
    try {
      const account = await this.client.api.accounts.list({ limit: 1 });
      return account.length > 0;
    } catch (error) {
      console.error('[TwilioService] Health check failed:', error);
      return false;
    }
  }
}

/**
 * Singleton exportado
 */
export const twilioService = new TwilioService();

export default twilioService;
