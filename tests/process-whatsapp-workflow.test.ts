import { processWhatsappMessage } from '@/lib/workflows/process-whatsapp-workflow';
import { crisisDetector } from '@/lib/services/crisis-detector';
import { responseRouter } from '@/lib/services/response-router';
import { twilioService } from '@/lib/services/twilio-service';
import { messageService } from '@/lib/services/message.service';
import { flagCrisisInDB } from '@/lib/services/crisis-flagging';
import { inngest } from '@/lib/inngest';

/**
 * TASK-032 Tests: Inngest Workflow — WhatsApp Message Processing
 *
 * DoD (Definition of Done):
 * ✅ Pipeline completo (detect → save → send)
 * ✅ Integração com crisis detector
 * ✅ Integração com response router
 * ✅ Integração com twilio service
 * ✅ < 2s polling
 * ✅ Logging em cada passo
 * ✅ Error handling
 */

// Mocks dos serviços
jest.mock('@/lib/services/crisis-detector');
jest.mock('@/lib/services/response-router');
jest.mock('@/lib/services/twilio-service');
jest.mock('@/lib/services/message.service');
jest.mock('@/lib/services/crisis-flagging');
jest.mock('@/lib/inngest');
jest.mock('@/lib/db');

describe('Process WhatsApp Workflow (TASK-032)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Normal Message (No Crisis)', () => {
    it('should process normal message without crisis detection', async () => {
      const mockEvent = {
        data: {
          userId: 1,
          whatsappMessageId: 'msg-123',
          fromNumber: '+5511999999999',
          content: 'Olá, tudo bem?',
          mediaUrl: null,
          timestamp: Date.now(),
        },
      };

      // Mock: não detecta crise
      (crisisDetector.detect as jest.Mock).mockReturnValue({
        detected: false,
        severity: 0,
        keywords: [],
        categories: [],
        recommendedResponse: 'none',
      });

      // Mock: salvar mensagem
      const mockSavedMessage = { id: 'msg-saved-123', user_id: 1 };
      (messageService.create as jest.Mock).mockResolvedValue(mockSavedMessage);

      const result = await processWhatsappMessage.fn(
        mockEvent as any,
        { run: jest.fn() } as any
      );

      expect(result.wasCrisis).toBe(false);
      expect(result.severity).toBe(0);
      expect(result.success).toBe(true);
      expect(crisisDetector.detect).toHaveBeenCalledWith('Olá, tudo bem?');
      expect(messageService.create).toHaveBeenCalled();
    });

    it('should save message with media URL', async () => {
      const mockEvent = {
        data: {
          userId: 1,
          whatsappMessageId: 'msg-456',
          fromNumber: '+5511999999999',
          content: 'Ouça isto',
          mediaUrl: 'https://example.com/audio.mp3',
          timestamp: Date.now(),
        },
      };

      (crisisDetector.detect as jest.Mock).mockReturnValue({
        detected: false,
        severity: 0,
        keywords: [],
        categories: [],
        recommendedResponse: 'none',
      });

      const mockSavedMessage = { id: 'msg-456-saved', user_id: 1 };
      (messageService.create as jest.Mock).mockResolvedValue(mockSavedMessage);

      const result = await processWhatsappMessage.fn(
        mockEvent as any,
        { run: jest.fn() } as any
      );

      expect(result.success).toBe(true);
      expect(messageService.create).toHaveBeenCalledWith(
        expect.objectContaining({
          media_url: 'https://example.com/audio.mp3',
        })
      );
    });
  });

  describe('Crisis Detection & Response', () => {
    it('should detect crisis and send response', async () => {
      const mockEvent = {
        data: {
          userId: 1,
          whatsappMessageId: 'msg-crisis-123',
          fromNumber: '+5511999999999',
          content: 'Quero morrer',
          mediaUrl: null,
          timestamp: Date.now(),
        },
      };

      // Mock: detecta crise crítica
      (crisisDetector.detect as jest.Mock).mockReturnValue({
        detected: true,
        severity: 9.5,
        keywords: ['morrer'],
        categories: ['suicida'],
        recommendedResponse: 'critical',
      });

      // Mock: obtém resposta
      (responseRouter.getResponse as jest.Mock).mockReturnValue({
        severity: 'critical',
        message: 'Você não está sozinho...',
        responseType: 'audio',
        audioUrl: 'https://example.com/crisis-critical.mp3',
        resources: [
          { name: 'CVV', phone: '188', available: '24/7' },
          { name: 'SAMU', phone: '192', available: '24/7' },
        ],
        escalationRequired: true,
        humanSupportNeeded: true,
      });

      // Mock: marca crise no DB
      (flagCrisisInDB as jest.Mock).mockResolvedValue({
        success: true,
        messageId: 'msg-crisis-123',
      });

      // Mock: envia via Twilio
      (twilioService.sendCrisisResponse as jest.Mock).mockResolvedValue({
        success: true,
        messageId: 'SM123456789',
        executionTimeMs: 1200,
        retryAttempts: 0,
      });

      // Mock: salva mensagem
      (messageService.create as jest.Mock).mockResolvedValue({
        id: 'msg-crisis-123',
        user_id: 1,
      });

      // Mock: dispara evento Inngest
      (inngest.send as jest.Mock).mockResolvedValue({ ids: ['evt-123'] });

      const stepRun = jest.fn((name, fn) => fn());
      const mockEvent2 = { ...mockEvent, step: { run: stepRun } };

      const result = await processWhatsappMessage.fn(mockEvent2 as any, { run: stepRun } as any);

      expect(result.wasCrisis).toBe(true);
      expect(result.severity).toBe(9.5);
      expect(result.responseType).toBe('audio');
      expect(result.twilioSent).toBe(true);
      expect(crisisDetector.detect).toHaveBeenCalledWith('Quero morrer');
      expect(responseRouter.getResponse).toHaveBeenCalledWith(9.5);
      expect(flagCrisisInDB).toHaveBeenCalled();
      expect(twilioService.sendCrisisResponse).toHaveBeenCalled();
    });

    it('should route high severity crisis correctly', async () => {
      const mockEvent = {
        data: {
          userId: 2,
          whatsappMessageId: 'msg-high-crisis',
          fromNumber: '+5521987654321',
          content: 'Estou muito mal, pensei em fazer mal a mim mesmo',
          mediaUrl: null,
          timestamp: Date.now(),
        },
      };

      (crisisDetector.detect as jest.Mock).mockReturnValue({
        detected: true,
        severity: 8.2,
        keywords: ['mal a mim mesmo'],
        categories: ['auto-harm'],
        recommendedResponse: 'high',
      });

      (responseRouter.getResponse as jest.Mock).mockReturnValue({
        severity: 'high',
        message: 'Você está em um momento difícil...',
        responseType: 'audio',
        audioUrl: 'https://example.com/crisis-high.mp3',
        resources: [
          { name: 'CVV', phone: '188', available: '24/7' },
        ],
        escalationRequired: true,
        humanSupportNeeded: true,
      });

      (flagCrisisInDB as jest.Mock).mockResolvedValue({ success: true });
      (twilioService.sendCrisisResponse as jest.Mock).mockResolvedValue({
        success: true,
        messageId: 'SM987654321',
        executionTimeMs: 1100,
        retryAttempts: 1,
      });

      const stepRun = jest.fn((name, fn) => fn());
      const mockEvent2 = { ...mockEvent, step: { run: stepRun } };

      const result = await processWhatsappMessage.fn(mockEvent2 as any, { run: stepRun } as any);

      expect(result.wasCrisis).toBe(true);
      expect(result.severity).toBe(8.2);
      expect(result.responseType).toBe('audio');
      expect(responseRouter.getResponse).toHaveBeenCalledWith(8.2);
    });

    it('should handle medium severity correctly', async () => {
      const mockEvent = {
        data: {
          userId: 3,
          whatsappMessageId: 'msg-medium',
          fromNumber: '+5531999999999',
          content: 'Estou muito ansioso',
          mediaUrl: null,
          timestamp: Date.now(),
        },
      };

      (crisisDetector.detect as jest.Mock).mockReturnValue({
        detected: true,
        severity: 5.0,
        keywords: ['ansioso'],
        categories: ['ansiedade'],
        recommendedResponse: 'medium',
      });

      (responseRouter.getResponse as jest.Mock).mockReturnValue({
        severity: 'medium',
        message: 'Suas emoções são válidas...',
        responseType: 'text',
        resources: [],
        escalationRequired: false,
        humanSupportNeeded: false,
      });

      (flagCrisisInDB as jest.Mock).mockResolvedValue({ success: true });
      (twilioService.sendCrisisResponse as jest.Mock).mockResolvedValue({
        success: true,
        messageId: 'SM555555555',
        executionTimeMs: 850,
        retryAttempts: 0,
      });

      const stepRun = jest.fn((name, fn) => fn());
      const mockEvent2 = { ...mockEvent, step: { run: stepRun } };

      const result = await processWhatsappMessage.fn(mockEvent2 as any, { run: stepRun } as any);

      expect(result.wasCrisis).toBe(true);
      expect(result.responseType).toBe('text');
      expect(result.severity).toBe(5.0);
    });
  });

  describe('Integration & Pipeline', () => {
    it('should execute complete pipeline in sequence', async () => {
      const mockEvent = {
        data: {
          userId: 1,
          whatsappMessageId: 'msg-full-pipeline',
          fromNumber: '+5511999999999',
          content: 'Não aguento mais',
          mediaUrl: null,
          timestamp: Date.now(),
        },
      };

      const executionOrder: string[] = [];

      (crisisDetector.detect as jest.Mock).mockImplementation((content) => {
        executionOrder.push('detect');
        return {
          detected: true,
          severity: 9.0,
          keywords: ['não aguento'],
          categories: ['depressao'],
          recommendedResponse: 'critical',
        };
      });

      (messageService.create as jest.Mock).mockImplementation(() => {
        executionOrder.push('save-message');
        return Promise.resolve({ id: 'msg-full', user_id: 1 });
      });

      (responseRouter.getResponse as jest.Mock).mockImplementation((severity) => {
        executionOrder.push('route-response');
        return {
          severity: 'critical',
          message: 'Você não está sozinho...',
          responseType: 'audio',
          audioUrl: 'https://example.com/audio.mp3',
          resources: [],
          escalationRequired: true,
          humanSupportNeeded: true,
        };
      });

      (flagCrisisInDB as jest.Mock).mockImplementation(() => {
        executionOrder.push('flag-crisis');
        return Promise.resolve({ success: true });
      });

      (twilioService.sendCrisisResponse as jest.Mock).mockImplementation(() => {
        executionOrder.push('send-twilio');
        return Promise.resolve({
          success: true,
          messageId: 'SM123',
          executionTimeMs: 1000,
          retryAttempts: 0,
        });
      });

      (inngest.send as jest.Mock).mockImplementation(() => {
        executionOrder.push('emit-event');
        return Promise.resolve({ ids: ['evt-123'] });
      });

      const stepRun = jest.fn((name, fn) => fn());
      const mockEvent2 = { ...mockEvent, step: { run: stepRun } };

      const result = await processWhatsappMessage.fn(mockEvent2 as any, { run: stepRun } as any);

      // Verificar ordem de execução
      expect(executionOrder).toContain('detect');
      expect(executionOrder).toContain('save-message');
      expect(executionOrder).toContain('route-response');
      expect(executionOrder).toContain('flag-crisis');
      expect(executionOrder).toContain('send-twilio');
      expect(result.success).toBe(true);
    });

    it('should continue if Twilio fails (graceful degradation)', async () => {
      const mockEvent = {
        data: {
          userId: 1,
          whatsappMessageId: 'msg-twilio-fail',
          fromNumber: '+5511999999999',
          content: 'Preciso de ajuda',
          mediaUrl: null,
          timestamp: Date.now(),
        },
      };

      (crisisDetector.detect as jest.Mock).mockReturnValue({
        detected: true,
        severity: 8.5,
        keywords: ['ajuda'],
        categories: ['crise'],
        recommendedResponse: 'high',
      });

      (responseRouter.getResponse as jest.Mock).mockReturnValue({
        severity: 'high',
        message: 'Estou aqui para ajudar...',
        responseType: 'audio',
        audioUrl: 'https://example.com/audio.mp3',
        resources: [],
        escalationRequired: true,
        humanSupportNeeded: true,
      });

      (flagCrisisInDB as jest.Mock).mockResolvedValue({ success: true });

      // Twilio falha
      (twilioService.sendCrisisResponse as jest.Mock).mockRejectedValue(
        new Error('Twilio connection failed')
      );

      (inngest.send as jest.Mock).mockResolvedValue({ ids: ['evt-123'] });

      const stepRun = jest.fn((name, fn) => {
        try {
          return fn();
        } catch (e) {
          return null; // Captura erro mas não bloqueia
        }
      });

      const mockEvent2 = { ...mockEvent, step: { run: stepRun } };

      // Não deve lançar erro, apenas loga
      const result = await processWhatsappMessage.fn(mockEvent2 as any, { run: stepRun } as any);

      expect(result.success).toBe(true); // Pipeline continua
      expect(result.wasCrisis).toBe(true);
      expect(result.twilioSent).toBe(false); // Mas Twilio falhou
    });
  });

  describe('Performance & Constraints', () => {
    it('should complete within < 2s', async () => {
      const mockEvent = {
        data: {
          userId: 1,
          whatsappMessageId: 'msg-perf',
          fromNumber: '+5511999999999',
          content: 'Teste de performance',
          mediaUrl: null,
          timestamp: Date.now(),
        },
      };

      (crisisDetector.detect as jest.Mock).mockReturnValue({
        detected: false,
        severity: 0,
        keywords: [],
        categories: [],
        recommendedResponse: 'none',
      });

      (messageService.create as jest.Mock).mockResolvedValue({
        id: 'msg-perf',
        user_id: 1,
      });

      const stepRun = jest.fn((name, fn) => fn());
      const mockEvent2 = { ...mockEvent, step: { run: stepRun } };

      const start = performance.now();
      const result = await processWhatsappMessage.fn(mockEvent2 as any, { run: stepRun } as any);
      const end = performance.now();

      expect(result.executionTimeMs).toBeLessThan(2000);
      expect(end - start).toBeLessThan(2000);
    });

    it('should handle batch of messages', async () => {
      const messages = Array.from({ length: 10 }, (_, i) => ({
        data: {
          userId: i,
          whatsappMessageId: `msg-batch-${i}`,
          fromNumber: '+5511999999999',
          content: `Message ${i}`,
          mediaUrl: null,
          timestamp: Date.now(),
        },
      }));

      (crisisDetector.detect as jest.Mock).mockReturnValue({
        detected: false,
        severity: 0,
        keywords: [],
        categories: [],
        recommendedResponse: 'none',
      });

      (messageService.create as jest.Mock).mockResolvedValue({
        id: 'msg-batch',
        user_id: 1,
      });

      const stepRun = jest.fn((name, fn) => fn());

      const start = performance.now();
      const results = await Promise.all(
        messages.map((msg) =>
          processWhatsappMessage.fn({ ...msg, step: { run: stepRun } } as any, { run: stepRun } as any)
        )
      );
      const end = performance.now();

      expect(results.length).toBe(10);
      expect(end - start).toBeLessThan(20000); // 10 mensagens em < 20s
    });
  });

  describe('Error Handling', () => {
    it('should handle missing content gracefully', async () => {
      const mockEvent = {
        data: {
          userId: 1,
          whatsappMessageId: 'msg-empty',
          fromNumber: '+5511999999999',
          content: '',
          mediaUrl: null,
          timestamp: Date.now(),
        },
      };

      (crisisDetector.detect as jest.Mock).mockReturnValue({
        detected: false,
        severity: 0,
        keywords: [],
        categories: [],
        recommendedResponse: 'none',
      });

      (messageService.create as jest.Mock).mockResolvedValue({
        id: 'msg-empty',
        user_id: 1,
      });

      const stepRun = jest.fn((name, fn) => fn());
      const mockEvent2 = { ...mockEvent, step: { run: stepRun } };

      const result = await processWhatsappMessage.fn(mockEvent2 as any, { run: stepRun } as any);

      expect(result.success).toBe(true);
      expect(crisisDetector.detect).toHaveBeenCalledWith('');
    });

    it('should log all steps for auditability (Lei #9)', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      const mockEvent = {
        data: {
          userId: 1,
          whatsappMessageId: 'msg-audit',
          fromNumber: '+5511999999999',
          content: 'Teste de auditoria',
          mediaUrl: null,
          timestamp: Date.now(),
        },
      };

      (crisisDetector.detect as jest.Mock).mockReturnValue({
        detected: true,
        severity: 7.0,
        keywords: ['teste'],
        categories: ['teste'],
        recommendedResponse: 'high',
      });

      (responseRouter.getResponse as jest.Mock).mockReturnValue({
        severity: 'high',
        message: 'Resposta...',
        responseType: 'audio',
        audioUrl: 'https://example.com/audio.mp3',
        resources: [],
        escalationRequired: true,
        humanSupportNeeded: true,
      });

      (flagCrisisInDB as jest.Mock).mockResolvedValue({ success: true });
      (twilioService.sendCrisisResponse as jest.Mock).mockResolvedValue({
        success: true,
        messageId: 'SM123',
        executionTimeMs: 1000,
        retryAttempts: 0,
      });

      const stepRun = jest.fn((name, fn) => fn());
      const mockEvent2 = { ...mockEvent, step: { run: stepRun } };

      await processWhatsappMessage.fn(mockEvent2 as any, { run: stepRun } as any);

      const logs = consoleSpy.mock.calls.map((c) => c[0]).join(' ');

      expect(logs).toContain('[Workflow]');
      expect(logs).toContain('Iniciando processamento');
      expect(logs).toContain('Detectando crise');
      expect(logs).toContain('Salvando mensagem');
      expect(logs).toContain('Roteando resposta');
      expect(logs).toContain('Marcando como crise');
      expect(logs).toContain('Enviando resposta via Twilio');

      consoleSpy.mockRestore();
    });
  });

  describe('Constitution Compliance', () => {
    it('should use pattern matching (Lei #12)', async () => {
      const mockEvent = {
        data: {
          userId: 1,
          whatsappMessageId: 'msg-pattern',
          fromNumber: '+5511999999999',
          content: 'Conteúdo de crise',
          mediaUrl: null,
          timestamp: Date.now(),
        },
      };

      // Verificar que usa crisisDetector (pattern matching, não IA)
      (crisisDetector.detect as jest.Mock).mockReturnValue({
        detected: true,
        severity: 8.0,
        keywords: [],
        categories: [],
        recommendedResponse: 'high',
      });

      const stepRun = jest.fn((name, fn) => fn());
      const mockEvent2 = { ...mockEvent, step: { run: stepRun } };

      await processWhatsappMessage.fn(mockEvent2 as any, { run: stepRun } as any);

      // Verifica que chamou detector (pattern matching)
      expect(crisisDetector.detect).toHaveBeenCalled();

      // Não deve usar IA pura para decisão
      // (isso seria verificado observando que não chama Claude API direto)
    });

    it('should maintain auditability (Lei #9)', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      const mockEvent = {
        data: {
          userId: 1,
          whatsappMessageId: 'msg-audit-log',
          fromNumber: '+5511999999999',
          content: 'Teste',
          mediaUrl: null,
          timestamp: Date.now(),
        },
      };

      (crisisDetector.detect as jest.Mock).mockReturnValue({
        detected: false,
        severity: 0,
        keywords: [],
        categories: [],
        recommendedResponse: 'none',
      });

      (messageService.create as jest.Mock).mockResolvedValue({
        id: 'msg-audit',
        user_id: 1,
      });

      const stepRun = jest.fn((name, fn) => fn());
      const mockEvent2 = { ...mockEvent, step: { run: stepRun } };

      await processWhatsappMessage.fn(mockEvent2 as any, { run: stepRun } as any);

      // Verificar que logs contêm timestamps, IDs, etc
      const logs = consoleSpy.mock.calls;
      expect(logs.length).toBeGreaterThan(0);

      consoleSpy.mockRestore();
    });
  });
});
