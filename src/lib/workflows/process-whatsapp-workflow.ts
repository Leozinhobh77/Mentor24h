import { inngest } from '@/lib/inngest';
import { crisisDetector } from '@/lib/services/crisis-detector';
import { responseRouter } from '@/lib/services/response-router';
import { twilioService } from '@/lib/services/twilio-service';
import { flagCrisisInDB } from '@/lib/services/crisis-flagging';
import { db } from '@/lib/db';
import { messages } from '@/lib/db/schema';

/**
 * TASK-032: Inngest Workflow — WhatsApp Message Processing
 *
 * Lei #12 (CONSTITUTION): Pattern Matching é Autoridade
 * Lei #9: Rastreabilidade via logs
 *
 * Fluxo completo:
 * 1. Receber whatsapp.message.received event
 * 2. Detectar crise (pattern matching)
 * 3. Se detectado: salvar na DB, enviar resposta
 * 4. Se não detectado: apenas salvar
 * 5. Logging em cada passo
 *
 * Performance: < 2s polling (Inngest garante)
 */

export const processWhatsappMessage = inngest.createFunction(
  {
    id: 'process-whatsapp-message',
    name: 'Process WhatsApp Message',
  },
  { event: 'whatsapp.message.received' },
  async ({ event, step }) => {
    const { userId, whatsappMessageId, fromNumber, content, mediaUrl } = event.data;

    const workflowStart = performance.now();

    console.log('[Workflow] 🟢 Iniciando processamento:', {
      userId,
      whatsappMessageId,
      fromNumber,
      contentPreview: content.substring(0, 50),
      hasMedia: !!mediaUrl,
    });

    try {
      // ─────────────────────────────────────────────────────────────
      // STEP 1: Detectar Crise (Pattern Matching)
      // ─────────────────────────────────────────────────────────────

      const crisisDetectionStart = performance.now();

      const detection = await step.run('detect-crisis', () => {
        console.log('[Workflow] 📊 Detectando crise com pattern matching...');
        return crisisDetector.detect(content);
      });

      const crisisDetectionTime = performance.now() - crisisDetectionStart;

      console.log('[Workflow] 🔍 Resultado detecção:', {
        detected: detection.detected,
        severity: detection.severity,
        keywords: detection.keywords,
        executionTimeMs: crisisDetectionTime.toFixed(2),
      });

      // ─────────────────────────────────────────────────────────────
      // STEP 2: Salvar Mensagem na DB (sempre)
      // ─────────────────────────────────────────────────────────────

      const dbSaveStart = performance.now();

      // Criar ou atualizar usuário baseado no número WhatsApp
      const user = await db.query.users.findFirst({
        where: (users, { eq }) => eq(users.whatsappNumber, fromNumber),
      });

      const userIdToSave = user?.id || userId;

      const savedMessage = await step.run('save-message', async () => {
        console.log('[Workflow] 💾 Salvando mensagem no banco...');

        // Salvar mensagem
        const messageData = {
          userId: userIdToSave,
          whatsappMessageId: whatsappMessageId,
          content: content,
          direction: 'inbound' as const,
          mediaUrl: mediaUrl || null,
          severity: detection.severity,
          isCrisis: detection.detected,
          crisisKeywords: detection.detected ? detection.keywords : null,
          crisisDetected: detection.detected,
          crisisDetectedAt: detection.detected ? new Date() : null,
          status: 'received' as const,
        };

        // Usando drizzle insert
        const result = await db
          .insert(messages)
          .values(messageData)
          .returning();

        return result[0];
      });

      const dbSaveTime = performance.now() - dbSaveStart;

      console.log('[Workflow] ✅ Mensagem salva:', {
        messageId: savedMessage?.id,
        severity: savedMessage?.severity,
        isCrisis: savedMessage?.isCrisis,
        executionTimeMs: dbSaveTime.toFixed(2),
      });

      // ─────────────────────────────────────────────────────────────
      // STEP 3: Se Crise Detectada → Obter Resposta + Enviar
      // ─────────────────────────────────────────────────────────────

      if (detection.detected) {
        // STEP 3A: Rotear Resposta
        const routingStart = performance.now();

        const response = await step.run('route-response', () => {
          console.log('[Workflow] 🎯 Roteando resposta para severity:', detection.severity);
          return responseRouter.getResponse(detection.severity);
        });

        const routingTime = performance.now() - routingStart;

        console.log('[Workflow] 📢 Resposta roteada:', {
          severity: response.severity,
          responseType: response.responseType,
          hasAudio: !!response.audioUrl,
          escalationRequired: response.escalationRequired,
          executionTimeMs: routingTime.toFixed(2),
        });

        // STEP 3B: Marcar Crise no DB
        const flaggingStart = performance.now();

        await step.run('flag-crisis', async () => {
          console.log('[Workflow] 🚨 Marcando como crise no DB...');

          if (savedMessage?.id) {
            await flagCrisisInDB({
              messageId: savedMessage.id as any, // FIXME: tipo esperado é number
              userId: userIdToSave,
              severity: detection.severity,
              keywords: detection.keywords,
            });
          }
        });

        const flaggingTime = performance.now() - flaggingStart;
        console.log('[Workflow] ✅ Crise marcada (executionTimeMs: ' + flaggingTime.toFixed(2) + ')');

        // STEP 3C: Enviar Resposta via Twilio
        const twilioResult = await step.run('send-twilio-response', async () => {
          console.log('[Workflow] 📱 Enviando resposta via Twilio...');

          try {
            const result = await twilioService.sendCrisisResponse(
              userIdToSave,
              fromNumber,
              response
            );

            console.log('[Workflow] ✅ Resposta enviada via Twilio:', {
              messageId: result.messageId,
              executionTimeMs: result.executionTimeMs.toFixed(2),
              retryAttempts: result.retryAttempts,
            });

            return result;
          } catch (error) {
            console.error('[Workflow] ❌ Falha ao enviar via Twilio:', error);
            // Não bloqueia o workflow, apenas loga
            return null;
          }
        });

        // STEP 3D: Disparar Evento de Resposta Enviada
        if (twilioResult) {
          await step.run('emit-response-sent-event', () => {
            console.log('[Workflow] 📡 Disparando evento crisis.response.sent...');

            return inngest.send({
              name: 'crisis.response.sent',
              data: {
                userId: userIdToSave,
                messageId: savedMessage?.id as any,
                responseType: response.responseType,
                sentAt: new Date().toISOString(),
              },
            });
          });
        }

        const totalCrisisHandlingTime = performance.now() - workflowStart;

        console.log('[Workflow] 🏁 Fluxo de crise completo:', {
          severity: detection.severity,
          responseType: response.responseType,
          twilioSent: !!twilioResult,
          totalTimeMs: totalCrisisHandlingTime.toFixed(2),
        });

        return {
          success: true,
          wasCrisis: true,
          severity: detection.severity,
          responseType: response.responseType,
          twilioSent: !!twilioResult,
          executionTimeMs: totalCrisisHandlingTime,
        };
      } else {
        // ─────────────────────────────────────────────────────────────
        // STEP 4: Se NÃO é Crise → Apenas Salvar
        // ─────────────────────────────────────────────────────────────

        const totalNormalMessageTime = performance.now() - workflowStart;

        console.log('[Workflow] ✅ Mensagem normal processada:', {
          messageId: savedMessage?.id,
          totalTimeMs: totalNormalMessageTime.toFixed(2),
        });

        return {
          success: true,
          wasCrisis: false,
          severity: 0,
          responseType: 'none' as const,
          twilioSent: false,
          executionTimeMs: totalNormalMessageTime,
        };
      }
    } catch (error) {
      const totalErrorTime = performance.now() - workflowStart;

      console.error('[Workflow] ❌ Erro no processamento:', {
        error: error instanceof Error ? error.message : 'Desconhecido',
        userId,
        whatsappMessageId,
        executionTimeMs: totalErrorTime.toFixed(2),
      });

      throw error;
    }
  }
);

export const workflowExports = {
  processWhatsappMessage,
};

export default processWhatsappMessage;
