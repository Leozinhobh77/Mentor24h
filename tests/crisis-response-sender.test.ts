import { CrisisResponseSender } from '@/lib/services/crisis-response-sender';
import { responseRouter } from '@/lib/services/response-router';
import { twilioService } from '@/lib/services/twilio-service';
import { messageService } from '@/lib/services/message.service';

/**
 * TASK-033 Tests: Crisis Response Sender
 * Respostas diferenciadas por severity
 */

jest.mock('@/lib/services/response-router');
jest.mock('@/lib/services/twilio-service');
jest.mock('@/lib/services/message.service');

describe('CrisisResponseSender (TASK-033)', () => {
  let sender: CrisisResponseSender;

  beforeEach(() => {
    sender = new CrisisResponseSender();
    jest.clearAllMocks();
  });

  describe('Send Crisis Response', () => {
    it('should send critical response with audio', async () => {
      (responseRouter.getResponse as jest.Mock).mockReturnValue({
        severity: 'critical',
        message: 'Você não está sozinho...',
        responseType: 'audio',
        audioUrl: 'https://example.com/critical.mp3',
        resources: [
          { name: 'CVV', phone: '188', available: '24/7' },
          { name: 'SAMU', phone: '192', available: '24/7' },
          { name: 'Polícia', phone: '190', available: '24/7' },
        ],
        escalationRequired: true,
        humanSupportNeeded: true,
      });

      (twilioService.sendCrisisResponse as jest.Mock).mockResolvedValue({
        success: true,
        messageId: 'SM123456789',
        executionTimeMs: 1200,
        retryAttempts: 1,
      });

      const result = await sender.sendCrisisResponse({
        userId: 1,
        phoneNumber: '+5511999999999',
        messageId: 'msg-123',
        severity: 9.5,
        keywords: ['morrer'],
      });

      expect(result.success).toBe(true);
      expect(result.severity).toBe('critical');
      expect(result.audioUrl).toBe('https://example.com/critical.mp3');
      expect(result.resourceCount).toBe(3);
      expect(result.escalationRequired).toBe(true);
      expect(result.executionTimeMs).toBeLessThan(2000);
    });

    it('should send high severity response', async () => {
      (responseRouter.getResponse as jest.Mock).mockReturnValue({
        severity: 'high',
        message: 'Você está em um momento difícil...',
        responseType: 'audio',
        audioUrl: 'https://example.com/high.mp3',
        resources: [
          { name: 'CVV', phone: '188', available: '24/7' },
          { name: 'UPA', available: '24/7' },
        ],
        escalationRequired: true,
        humanSupportNeeded: true,
      });

      (twilioService.sendCrisisResponse as jest.Mock).mockResolvedValue({
        success: true,
        messageId: 'SM987654321',
        executionTimeMs: 1100,
        retryAttempts: 0,
      });

      const result = await sender.sendCrisisResponse({
        userId: 2,
        phoneNumber: '+5521987654321',
        messageId: 'msg-456',
        severity: 8.0,
        keywords: ['mal', 'difícil'],
      });

      expect(result.severity).toBe('high');
      expect(result.resourceCount).toBe(2);
    });

    it('should send medium severity response without audio', async () => {
      (responseRouter.getResponse as jest.Mock).mockReturnValue({
        severity: 'medium',
        message: 'Vejo que você está passando por desafios...',
        responseType: 'text',
        audioUrl: undefined,
        resources: [
          { name: 'Posto de Saúde', available: 'Dias úteis' },
          { name: 'CVV', phone: '188', available: '24/7' },
        ],
        escalationRequired: false,
        humanSupportNeeded: false,
      });

      (twilioService.sendCrisisResponse as jest.Mock).mockResolvedValue({
        success: true,
        messageId: 'SM555555555',
        executionTimeMs: 950,
        retryAttempts: 0,
      });

      const result = await sender.sendCrisisResponse({
        userId: 3,
        phoneNumber: '+5531999999999',
        messageId: 'msg-789',
        severity: 5.0,
        keywords: ['ansioso'],
      });

      expect(result.severity).toBe('medium');
      expect(result.audioUrl).toBeUndefined();
      expect(result.escalationRequired).toBe(false);
    });

    it('should update message with crisis_response_sent flag', async () => {
      (responseRouter.getResponse as jest.Mock).mockReturnValue({
        severity: 'critical',
        message: 'Resposta...',
        responseType: 'audio',
        audioUrl: 'https://example.com/audio.mp3',
        resources: [],
        escalationRequired: true,
        humanSupportNeeded: true,
      });

      (twilioService.sendCrisisResponse as jest.Mock).mockResolvedValue({
        success: true,
        messageId: 'SM123',
        executionTimeMs: 1100,
        retryAttempts: 0,
      });

      await sender.sendCrisisResponse({
        userId: 1,
        phoneNumber: '+5511999999999',
        messageId: 'msg-update',
        severity: 9.0,
      });

      expect(messageService.updateMessage).toHaveBeenCalledWith({
        id: 'msg-update',
        crisis_response_sent: true,
        updated_at: expect.any(Date),
      });
    });

    it('should handle validation errors', async () => {
      const invalidInput = {
        userId: -1, // inválido
        phoneNumber: '+5511999999999',
        messageId: 'msg-123',
        severity: 9.0,
      };

      await expect(sender.sendCrisisResponse(invalidInput as any)).rejects.toThrow();
    });

    it('should validate phoneNumber format', async () => {
      const invalidPhone = {
        userId: 1,
        phoneNumber: '11999999999', // Sem +55
        messageId: 'msg-123',
        severity: 9.0,
      };

      await expect(sender.sendCrisisResponse(invalidPhone as any)).rejects.toThrow();
    });
  });

  describe('Send Custom Response', () => {
    it('should send custom CrisisResponse object', async () => {
      const customResponse = {
        severity: 'critical' as const,
        message: 'Custom response',
        responseType: 'audio' as const,
        audioUrl: 'https://example.com/custom.mp3',
        resources: [],
        escalationRequired: true,
        humanSupportNeeded: true,
      };

      (twilioService.sendCrisisResponse as jest.Mock).mockResolvedValue({
        success: true,
        messageId: 'SM123',
        executionTimeMs: 1000,
        retryAttempts: 0,
      });

      const result = await sender.sendCustomResponse(
        1,
        '+5511999999999',
        customResponse
      );

      expect(result.success).toBe(true);
      expect(result.audioUrl).toBe('https://example.com/custom.mp3');
      expect(twilioService.sendCrisisResponse).toHaveBeenCalledWith(
        1,
        '+5511999999999',
        customResponse
      );
    });
  });

  describe('Batch Responses', () => {
    it('should send multiple responses', async () => {
      (responseRouter.getResponse as jest.Mock).mockReturnValue({
        severity: 'critical',
        message: 'Resposta...',
        responseType: 'audio',
        audioUrl: 'https://example.com/audio.mp3',
        resources: [],
        escalationRequired: true,
        humanSupportNeeded: true,
      });

      (twilioService.sendCrisisResponse as jest.Mock).mockResolvedValue({
        success: true,
        messageId: 'SM123',
        executionTimeMs: 1100,
        retryAttempts: 0,
      });

      const requests = [
        { userId: 1, phoneNumber: '+5511999999999', messageId: 'msg-1', severity: 9.0 },
        { userId: 2, phoneNumber: '+5521999999999', messageId: 'msg-2', severity: 8.0 },
        { userId: 3, phoneNumber: '+5531999999999', messageId: 'msg-3', severity: 7.0 },
      ];

      const results = await sender.sendBatchResponses(requests);

      expect(results.length).toBeGreaterThan(0);
      expect(results.every((r) => r.severity === 'critical')).toBe(true);
    });

    it('should handle batch with some failures', async () => {
      (responseRouter.getResponse as jest.Mock).mockReturnValue({
        severity: 'critical',
        message: 'Resposta...',
        responseType: 'audio',
        audioUrl: 'https://example.com/audio.mp3',
        resources: [],
        escalationRequired: true,
        humanSupportNeeded: true,
      });

      (twilioService.sendCrisisResponse as jest.Mock)
        .mockResolvedValueOnce({
          success: true,
          messageId: 'SM123',
          executionTimeMs: 1100,
          retryAttempts: 0,
        })
        .mockRejectedValueOnce(new Error('Twilio failed'))
        .mockResolvedValueOnce({
          success: true,
          messageId: 'SM456',
          executionTimeMs: 1200,
          retryAttempts: 0,
        });

      const requests = [
        { userId: 1, phoneNumber: '+5511999999999', messageId: 'msg-1', severity: 9.0 },
        { userId: 2, phoneNumber: '+5521999999999', messageId: 'msg-2', severity: 8.0 },
        { userId: 3, phoneNumber: '+5531999999999', messageId: 'msg-3', severity: 7.0 },
      ];

      const results = await sender.sendBatchResponses(requests);

      // Alguns sucessos, alguns falhos
      expect(results.length).toBe(3);
    });

    it('batch should complete < 5s for 10 messages', async () => {
      (responseRouter.getResponse as jest.Mock).mockReturnValue({
        severity: 'high',
        message: 'Resposta...',
        responseType: 'audio',
        audioUrl: 'https://example.com/audio.mp3',
        resources: [],
        escalationRequired: true,
        humanSupportNeeded: true,
      });

      (twilioService.sendCrisisResponse as jest.Mock).mockResolvedValue({
        success: true,
        messageId: 'SM123',
        executionTimeMs: 1100,
        retryAttempts: 0,
      });

      const requests = Array.from({ length: 10 }, (_, i) => ({
        userId: i,
        phoneNumber: '+5511999999999',
        messageId: `msg-${i}`,
        severity: 8.0,
      }));

      const start = performance.now();
      const results = await sender.sendBatchResponses(requests);
      const end = performance.now();

      expect(end - start).toBeLessThan(5000);
      expect(results.length).toBe(10);
    });
  });

  describe('Health Check', () => {
    it('should check system health', async () => {
      (responseRouter.getResponse as jest.Mock).mockReturnValue({
        severity: 'none',
        message: 'Health check',
        responseType: 'text',
        audioUrl: undefined,
        resources: [],
        escalationRequired: false,
        humanSupportNeeded: false,
      });

      (twilioService.sendMessage as jest.Mock).mockResolvedValue({
        success: true,
        messageId: 'SM123',
        executionTimeMs: 500,
        retryAttempts: 0,
        sentAt: new Date().toISOString(),
      });

      const isHealthy = await sender.healthCheck('+5511999999999');

      expect(isHealthy).toBe(true);
    });

    it('should return false on health check failure', async () => {
      (responseRouter.getResponse as jest.Mock).mockReturnValue({
        severity: 'none',
        message: 'Health check',
        responseType: 'text',
        audioUrl: undefined,
        resources: [],
        escalationRequired: false,
        humanSupportNeeded: false,
      });

      (twilioService.sendMessage as jest.Mock).mockRejectedValue(
        new Error('Twilio unavailable')
      );

      const isHealthy = await sender.healthCheck('+5511999999999');

      expect(isHealthy).toBe(false);
    });
  });

  describe('Performance', () => {
    it('should send response < 2s', async () => {
      (responseRouter.getResponse as jest.Mock).mockReturnValue({
        severity: 'critical',
        message: 'Resposta...',
        responseType: 'audio',
        audioUrl: 'https://example.com/audio.mp3',
        resources: [],
        escalationRequired: true,
        humanSupportNeeded: true,
      });

      (twilioService.sendCrisisResponse as jest.Mock).mockResolvedValue({
        success: true,
        messageId: 'SM123',
        executionTimeMs: 1150,
        retryAttempts: 0,
      });

      const start = performance.now();
      const result = await sender.sendCrisisResponse({
        userId: 1,
        phoneNumber: '+5511999999999',
        messageId: 'msg-perf',
        severity: 9.0,
      });
      const end = performance.now();

      expect(result.executionTimeMs).toBeLessThan(2000);
      expect(end - start).toBeLessThan(2000);
    });
  });

  describe('Constitution Compliance', () => {
    it('should use pre-recorded responses (Lei #12)', async () => {
      (responseRouter.getResponse as jest.Mock).mockReturnValue({
        severity: 'critical',
        message: 'Pré-gravada',
        responseType: 'audio',
        audioUrl: 'https://example.com/audio.mp3',
        resources: [],
        escalationRequired: true,
        humanSupportNeeded: true,
      });

      (twilioService.sendCrisisResponse as jest.Mock).mockResolvedValue({
        success: true,
        messageId: 'SM123',
        executionTimeMs: 1100,
        retryAttempts: 0,
      });

      const result = await sender.sendCrisisResponse({
        userId: 1,
        phoneNumber: '+5511999999999',
        messageId: 'msg-law',
        severity: 9.0,
      });

      // Verifica que usa responseRouter (pré-gravada, não IA)
      expect(responseRouter.getResponse).toHaveBeenCalled();
      expect(result.audioUrl).toBe('https://example.com/audio.mp3');
    });

    it('should log all operations (Lei #9)', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      (responseRouter.getResponse as jest.Mock).mockReturnValue({
        severity: 'critical',
        message: 'Resposta...',
        responseType: 'audio',
        audioUrl: 'https://example.com/audio.mp3',
        resources: [],
        escalationRequired: true,
        humanSupportNeeded: true,
      });

      (twilioService.sendCrisisResponse as jest.Mock).mockResolvedValue({
        success: true,
        messageId: 'SM123',
        executionTimeMs: 1100,
        retryAttempts: 0,
      });

      await sender.sendCrisisResponse({
        userId: 1,
        phoneNumber: '+5511999999999',
        messageId: 'msg-audit',
        severity: 9.0,
      });

      const logs = consoleSpy.mock.calls.map((c) => c[0]).join(' ');
      expect(logs).toContain('[CrisisResponseSender]');
      expect(logs).toContain('Iniciando envio');
      expect(logs).toContain('Template roteado');
      expect(logs).toContain('Twilio enviado');

      consoleSpy.mockRestore();
    });
  });
});
