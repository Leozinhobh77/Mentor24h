import { twilioService, TwilioMessageResult } from '@/lib/services/twilio-service';
import { responseRouter, CrisisResponse } from '@/lib/services/response-router';
import { z } from 'zod';
import { messageService } from '@/lib/services/message.service';

/**
 * TASK-033: Crisis Response Sender
 *
 * Lei #12 (CONSTITUTION): Respostas pré-gravadas (nunca IA)
 * Lei #9: Rastreabilidade completa
 *
 * Requisito: Enviar resposta diferenciada por severity via WhatsApp
 * Performance: < 2s mesmo com retry
 */

export type ResponseSeverity = 'critical' | 'high' | 'medium' | 'none';

export interface CrisisResponseSenderInput {
  userId: number;
  phoneNumber: string; // +55XXXXXXXXXX
  messageId: string | number; // ID da mensagem que disparou crise
  severity: number; // 0-10
  keywords?: string[]; // Palavras-chave detectadas
}

export interface CrisisResponseSenderResult {
  success: boolean;
  severity: ResponseSeverity;
  messageId?: string; // Twilio SID
  phoneNumber: string;
  audioUrl?: string;
  resourceCount: number;
  escalationRequired: boolean;
  executionTimeMs: number;
  sentAt: string;
}

// Validação
const senderSchema = z.object({
  userId: z.number().positive(),
  phoneNumber: z.string().regex(/^\+55\d{10,11}$/),
  messageId: z.union([z.string(), z.number()]),
  severity: z.number().min(0).max(10),
  keywords: z.array(z.string()).optional(),
});

/**
 * Service: Enviar respostas de crise diferenciadas por severity
 *
 * Fluxo:
 * 1. Validar entrada
 * 2. Obter template de resposta via responseRouter
 * 3. Enviar via Twilio (com retry automático)
 * 4. Atualizar mensagem original com resposta_enviada flag
 * 5. Log completo
 */
export class CrisisResponseSender {
  /**
   * Enviar resposta de crise
   * Integra: responseRouter (TASK-029) + twilioService (TASK-031)
   */
  async sendCrisisResponse(
    input: CrisisResponseSenderInput
  ): Promise<CrisisResponseSenderResult> {
    const startTime = performance.now();

    try {
      // Validação (Zod)
      const validated = senderSchema.parse(input);

      console.log('[CrisisResponseSender] 🚨 Iniciando envio de resposta de crise:', {
        userId: validated.userId,
        phoneNumber: validated.phoneNumber,
        severity: validated.severity,
        keywords: validated.keywords?.slice(0, 3),
      });

      // STEP 1: Obter template de resposta
      const response = responseRouter.getResponse(validated.severity);

      console.log('[CrisisResponseSender] 📢 Template roteado:', {
        severity: response.severity,
        responseType: response.responseType,
        hasAudio: !!response.audioUrl,
        resourceCount: response.resources.length,
      });

      // STEP 2: Enviar via Twilio (com retry 3x)
      const twilioStart = performance.now();

      const twilioResult = await twilioService.sendCrisisResponse(
        validated.userId,
        validated.phoneNumber,
        response
      );

      const twilioTime = performance.now() - twilioStart;

      console.log('[CrisisResponseSender] ✅ Twilio enviado:', {
        messageId: twilioResult.messageId,
        executionTimeMs: twilioResult.executionTimeMs.toFixed(2),
        retryAttempts: twilioResult.retryAttempts,
        responseType: response.responseType,
      });

      // STEP 3: Marcar resposta como enviada na mensagem original
      try {
        await messageService.updateMessage({
          id: validated.messageId as any,
          crisis_response_sent: true,
          updated_at: new Date(),
        });

        console.log('[CrisisResponseSender] 💾 Mensagem atualizada (crisis_response_sent = true)');
      } catch (updateError) {
        console.warn('[CrisisResponseSender] ⚠️ Falha ao atualizar mensagem (não bloqueia):', updateError);
      }

      // STEP 4: Log de sucesso
      const totalTime = performance.now() - startTime;

      console.log('[CrisisResponseSender] 🏁 Resposta de crise enviada com sucesso:', {
        severity: response.severity,
        totalTimeMs: totalTime.toFixed(2),
        escalationRequired: response.escalationRequired,
        userId: validated.userId,
      });

      return {
        success: true,
        severity: response.severity,
        messageId: twilioResult.messageId,
        phoneNumber: validated.phoneNumber,
        audioUrl: response.audioUrl,
        resourceCount: response.resources.length,
        escalationRequired: response.escalationRequired,
        executionTimeMs: totalTime,
        sentAt: new Date().toISOString(),
      };
    } catch (error) {
      const totalTime = performance.now() - startTime;

      if (error instanceof z.ZodError) {
        console.error('[CrisisResponseSender] ❌ Validação falhou:', {
          errors: error.errors.map((e) => ({ path: e.path, message: e.message })),
        });

        throw new Error(`Validação falhou: ${error.errors[0].message}`);
      } else {
        console.error('[CrisisResponseSender] ❌ Erro ao enviar resposta:', {
          error: error instanceof Error ? error.message : 'Desconhecido',
          executionTimeMs: totalTime.toFixed(2),
        });

        throw error;
      }
    }
  }

  /**
   * Enviar resposta específica (sem rotear por severity)
   * Usado quando a resposta já está definida
   */
  async sendCustomResponse(
    userId: number,
    phoneNumber: string,
    crisisResponse: CrisisResponse
  ): Promise<CrisisResponseSenderResult> {
    const startTime = performance.now();

    try {
      console.log('[CrisisResponseSender] 📬 Enviando resposta customizada:', {
        userId,
        severity: crisisResponse.severity,
        responseType: crisisResponse.responseType,
      });

      const result = await twilioService.sendCrisisResponse(userId, phoneNumber, crisisResponse);

      const totalTime = performance.now() - startTime;

      return {
        success: true,
        severity: crisisResponse.severity,
        messageId: result.messageId,
        phoneNumber,
        audioUrl: crisisResponse.audioUrl,
        resourceCount: crisisResponse.resources.length,
        escalationRequired: crisisResponse.escalationRequired,
        executionTimeMs: totalTime,
        sentAt: new Date().toISOString(),
      };
    } catch (error) {
      console.error('[CrisisResponseSender] ❌ Erro ao enviar resposta customizada:', error);
      throw error;
    }
  }

  /**
   * Batch: Enviar respostas para múltiplos usuários
   * Útil para rotinas automáticas
   */
  async sendBatchResponses(
    requests: Array<CrisisResponseSenderInput>
  ): Promise<CrisisResponseSenderResult[]> {
    const startTime = performance.now();

    console.log('[CrisisResponseSender] 📤 Iniciando batch de respostas:', {
      count: requests.length,
    });

    const results = await Promise.allSettled(
      requests.map((req) => this.sendCrisisResponse(req))
    );

    const successful = results.filter((r) => r.status === 'fulfilled');
    const failed = results.filter((r) => r.status === 'rejected');

    const totalTime = performance.now() - startTime;

    console.log('[CrisisResponseSender] ✅ Batch completo:', {
      total: requests.length,
      successful: successful.length,
      failed: failed.length,
      executionTimeMs: totalTime.toFixed(2),
      avgTimePerMessage: (totalTime / requests.length).toFixed(2),
    });

    return successful
      .map((r) => (r as PromiseFulfilledResult<CrisisResponseSenderResult>).value)
      .concat(
        failed.map((r) => ({
          success: false,
          severity: 'none' as const,
          phoneNumber: 'unknown',
          resourceCount: 0,
          escalationRequired: false,
          executionTimeMs: 0,
          sentAt: new Date().toISOString(),
        }))
      );
  }

  /**
   * Health check: testar envio sem crise real
   */
  async healthCheck(testPhoneNumber: string): Promise<boolean> {
    try {
      console.log('[CrisisResponseSender] 🏥 Health check iniciado...');

      const testResponse = responseRouter.getResponse('none');

      const result = await twilioService.sendMessage({
        userId: -1, // ID fake para health check
        phoneNumber: testPhoneNumber,
        message: '[HEALTH CHECK] Sistema está operacional',
      });

      console.log('[CrisisResponseSender] ✅ Health check passou:', {
        messageId: result.messageId,
        executionTimeMs: result.executionTimeMs,
      });

      return result.success;
    } catch (error) {
      console.error('[CrisisResponseSender] ❌ Health check falhou:', error);
      return false;
    }
  }
}

/**
 * Singleton exportado
 */
export const crisisResponseSender = new CrisisResponseSender();

export default crisisResponseSender;
