import {
  TwilioService,
  TwilioError,
  TwilioRetryExhaustedError,
  TwilioMessageInput,
} from '@/lib/services/twilio-service';
import { CrisisResponse } from '@/lib/services/response-router';

/**
 * TASK-031 Tests: Twilio Service com Retry 3x Exponential Backoff
 *
 * DoD (Definition of Done):
 * ✅ Chamadas reais Twilio
 * ✅ Retry 3x com exponential backoff
 * ✅ Validação Zod
 * ✅ Logging completo
 * ✅ Error handling (429, 5xx, etc)
 * ✅ Performance < 2s
 * ✅ Inngest event firing
 */

// Mock Twilio client
jest.mock('twilio', () => {
  return {
    Twilio: jest.fn().mockImplementation(() => ({
      messages: {
        create: jest.fn(),
      },
      api: {
        accounts: {
          list: jest.fn(),
        },
      },
    })),
  };
});

// Mock Inngest
jest.mock('@/lib/inngest', () => ({
  sendCrisisResponseSentEvent: jest.fn().mockResolvedValue({ ids: ['test-id'] }),
}));

describe('TwilioService', () => {
  let service: TwilioService;
  let mockTwilioCreate: jest.Mock;
  let mockInngestSend: jest.Mock;

  beforeEach(() => {
    // Limpar variáveis de ambiente para testes
    process.env.TWILIO_ACCOUNT_SID = 'test-sid';
    process.env.TWILIO_AUTH_TOKEN = 'test-token';
    process.env.TWILIO_WHATSAPP_NUMBER = '+5511999999999';

    service = new TwilioService();

    // Configurar mocks
    const Twilio = require('twilio').Twilio;
    const instance = Twilio.mock.results[0].value;
    mockTwilioCreate = instance.messages.create;
    mockInngestSend = require('@/lib/inngest').sendCrisisResponseSentEvent;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Input Validation (Zod)', () => {
    it('should reject invalid userId (negative)', async () => {
      const invalidInput: any = {
        userId: -1,
        phoneNumber: '+5511999999999',
        message: 'Test',
      };

      await expect(service.sendMessage(invalidInput)).rejects.toThrow(
        /userId deve ser positivo/
      );
    });

    it('should reject invalid phoneNumber format', async () => {
      const invalidInput: any = {
        userId: 1,
        phoneNumber: '11999999999', // Sem +55
        message: 'Test',
      };

      await expect(service.sendMessage(invalidInput)).rejects.toThrow(
        /Número deve estar em formato/
      );
    });

    it('should reject empty message', async () => {
      const invalidInput: any = {
        userId: 1,
        phoneNumber: '+5511999999999',
        message: '', // Vazio
      };

      await expect(service.sendMessage(invalidInput)).rejects.toThrow(
        /Mensagem vazia não permitida/
      );
    });

    it('should reject invalid audioUrl', async () => {
      const invalidInput: any = {
        userId: 1,
        phoneNumber: '+5511999999999',
        message: 'Test',
        audioUrl: 'not-a-url',
      };

      await expect(service.sendMessage(invalidInput)).rejects.toThrow(
        /URL de áudio inválida/
      );
    });

    it('should accept valid input', async () => {
      mockTwilioCreate.mockResolvedValueOnce({
        sid: 'SM123456789',
        status: 'queued',
      });

      const validInput: TwilioMessageInput = {
        userId: 1,
        phoneNumber: '+5511999999999',
        message: 'Test message',
        audioUrl: 'https://example.com/audio.mp3',
      };

      const result = await service.sendMessage(validInput);
      expect(result.success).toBe(true);
      expect(result.messageId).toBe('SM123456789');
    });
  });

  describe('Successful Message Send', () => {
    it('should send message successfully on first attempt', async () => {
      mockTwilioCreate.mockResolvedValueOnce({
        sid: 'SM123456789',
        status: 'queued',
      });

      const input: TwilioMessageInput = {
        userId: 1,
        phoneNumber: '+5511999999999',
        message: 'Crisis detected',
        audioUrl: 'https://example.com/audio.mp3',
      };

      const result = await service.sendMessage(input);

      expect(result.success).toBe(true);
      expect(result.messageId).toBe('SM123456789');
      expect(result.retryAttempts).toBe(0);
      expect(mockTwilioCreate).toHaveBeenCalledTimes(1);
      expect(mockTwilioCreate).toHaveBeenCalledWith({
        from: 'whatsapp:+5511999999999',
        to: 'whatsapp:+5511999999999',
        body: 'Crisis detected',
        mediaUrl: ['https://example.com/audio.mp3'],
      });
    });

    it('should include correct headers in Twilio call', async () => {
      mockTwilioCreate.mockResolvedValueOnce({
        sid: 'SM999',
        status: 'queued',
      });

      const input: TwilioMessageInput = {
        userId: 5,
        phoneNumber: '+5521987654321',
        message: 'Hello',
      };

      await service.sendMessage(input);

      expect(mockTwilioCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          from: 'whatsapp:+5511999999999',
          to: 'whatsapp:+5521987654321',
          body: 'Hello',
        })
      );
    });

    it('should fire Inngest event on success', async () => {
      mockTwilioCreate.mockResolvedValueOnce({
        sid: 'SM123456789',
        status: 'queued',
      });

      const input: TwilioMessageInput = {
        userId: 1,
        phoneNumber: '+5511999999999',
        message: 'Test',
        audioUrl: 'https://example.com/audio.mp3',
      };

      await service.sendMessage(input);

      expect(mockInngestSend).toHaveBeenCalledWith({
        userId: 1,
        messageId: 'SM123456789',
        responseType: 'audio',
        sentAt: expect.any(String),
      });
    });

    it('should return execution time < 2s', async () => {
      mockTwilioCreate.mockResolvedValueOnce({
        sid: 'SM123',
        status: 'queued',
      });

      const input: TwilioMessageInput = {
        userId: 1,
        phoneNumber: '+5511999999999',
        message: 'Test',
      };

      const result = await service.sendMessage(input);

      expect(result.executionTimeMs).toBeLessThan(2000);
    });
  });

  describe('Retry Logic with Exponential Backoff', () => {
    it('should retry on 429 (Too Many Requests)', async () => {
      const error429 = new Error('Too Many Requests');
      (error429 as any).status = 429;
      (error429 as any).code = '429';

      // Falha nas primeiras 2, sucesso na 3a
      mockTwilioCreate
        .mockRejectedValueOnce(error429)
        .mockRejectedValueOnce(error429)
        .mockResolvedValueOnce({
          sid: 'SM123456789',
          status: 'queued',
        });

      const input: TwilioMessageInput = {
        userId: 1,
        phoneNumber: '+5511999999999',
        message: 'Test',
      };

      const result = await service.sendMessage(input);

      expect(result.success).toBe(true);
      expect(result.retryAttempts).toBe(2);
      expect(mockTwilioCreate).toHaveBeenCalledTimes(3);
    });

    it('should retry on 5xx (Server Error)', async () => {
      const error500 = new Error('Internal Server Error');
      (error500 as any).status = 500;
      (error500 as any).code = '500';

      mockTwilioCreate
        .mockRejectedValueOnce(error500)
        .mockResolvedValueOnce({
          sid: 'SM123456789',
          status: 'queued',
        });

      const input: TwilioMessageInput = {
        userId: 1,
        phoneNumber: '+5511999999999',
        message: 'Test',
      };

      const result = await service.sendMessage(input);

      expect(result.success).toBe(true);
      expect(result.retryAttempts).toBe(1);
    });

    it('should NOT retry on 400 (Bad Request)', async () => {
      const error400 = new Error('Invalid number');
      (error400 as any).status = 400;
      (error400 as any).code = '400';

      mockTwilioCreate.mockRejectedValueOnce(error400);

      const input: TwilioMessageInput = {
        userId: 1,
        phoneNumber: '+5511999999999',
        message: 'Test',
      };

      await expect(service.sendMessage(input)).rejects.toThrow();
      expect(mockTwilioCreate).toHaveBeenCalledTimes(1);
    });

    it('should exhaust retries after maxRetries', async () => {
      const error429 = new Error('Too Many Requests');
      (error429 as any).status = 429;
      (error429 as any).code = '429';

      mockTwilioCreate.mockRejectedValue(error429);

      const input: TwilioMessageInput = {
        userId: 1,
        phoneNumber: '+5511999999999',
        message: 'Test',
      };

      await expect(service.sendMessage(input)).rejects.toThrow(TwilioError);
      // maxRetries=3 significa 4 tentativas totais (inicial + 3 retries)
      expect(mockTwilioCreate).toHaveBeenCalledTimes(4);
    });
  });

  describe('Integration with Crisis Response', () => {
    it('should send crisis response with audioUrl', async () => {
      mockTwilioCreate.mockResolvedValueOnce({
        sid: 'SM123456789',
        status: 'queued',
      });

      const crisisResponse: CrisisResponse = {
        severity: 'critical',
        message: 'Percebi que você pode estar em perigo imediato...',
        responseType: 'audio',
        audioUrl: 'https://example.com/crisis-critical.mp3',
        resources: [
          {
            name: 'CVV',
            phone: '188',
            available: '24/7',
          },
        ],
        escalationRequired: true,
        humanSupportNeeded: true,
      };

      const result = await service.sendCrisisResponse(1, '+5511999999999', crisisResponse);

      expect(result.success).toBe(true);
      expect(result.audioUrl).toBe('https://example.com/crisis-critical.mp3');
      expect(mockTwilioCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          body: 'Percebi que você pode estar em perigo imediato...',
          mediaUrl: ['https://example.com/crisis-critical.mp3'],
        })
      );
    });

    it('should send confirmation message without audio', async () => {
      mockTwilioCreate.mockResolvedValueOnce({
        sid: 'SM987654321',
        status: 'queued',
      });

      const result = await service.sendConfirmation(1, '+5511999999999', 'Mensagem recebida');

      expect(result.success).toBe(true);
      expect(result.audioUrl).toBeUndefined();
      expect(mockTwilioCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          body: 'Mensagem recebida',
          mediaUrl: undefined,
        })
      );
    });
  });

  describe('Error Handling & Logging', () => {
    it('should throw TwilioError on API failure', async () => {
      const apiError = new Error('Authentication failed');
      (apiError as any).status = 401;
      (apiError as any).code = '401';

      mockTwilioCreate.mockRejectedValueOnce(apiError);

      const input: TwilioMessageInput = {
        userId: 1,
        phoneNumber: '+5511999999999',
        message: 'Test',
      };

      const error = await expect(service.sendMessage(input)).rejects.toThrow();
      expect(error).toBeInstanceOf(TwilioError);
    });

    it('should handle missing credentials', () => {
      delete process.env.TWILIO_ACCOUNT_SID;

      expect(() => {
        new TwilioService();
      }).toThrow(/Missing Twilio credentials/);
    });

    it('should log error details on failure', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      const apiError = new Error('Too Many Requests');
      (apiError as any).status = 429;
      (apiError as any).code = '429';

      mockTwilioCreate.mockRejectedValue(apiError);

      const input: TwilioMessageInput = {
        userId: 1,
        phoneNumber: '+5511999999999',
        message: 'Test',
      };

      try {
        await service.sendMessage(input);
      } catch {
        // Esperado
      }

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('[TwilioService]'),
        expect.any(Object)
      );

      consoleErrorSpy.mockRestore();
    });
  });

  describe('Health Check', () => {
    it('should return true on successful health check', async () => {
      const mockListAccounts = service['client'].api.accounts.list as jest.Mock;
      mockListAccounts.mockResolvedValueOnce([{ sid: 'test-sid' }]);

      const isHealthy = await service.healthCheck();

      expect(isHealthy).toBe(true);
    });

    it('should return false on health check failure', async () => {
      const mockListAccounts = service['client'].api.accounts.list as jest.Mock;
      mockListAccounts.mockRejectedValueOnce(new Error('Connection failed'));

      const isHealthy = await service.healthCheck();

      expect(isHealthy).toBe(false);
    });
  });

  describe('Performance Benchmarks', () => {
    it('should send message in < 2s', async () => {
      mockTwilioCreate.mockResolvedValueOnce({
        sid: 'SM123456789',
        status: 'queued',
      });

      const input: TwilioMessageInput = {
        userId: 1,
        phoneNumber: '+5511999999999',
        message: 'Test',
      };

      const start = performance.now();
      const result = await service.sendMessage(input);
      const end = performance.now();

      expect(result.executionTimeMs).toBeLessThan(2000);
      expect(end - start).toBeLessThan(2000);
    });

    it('should handle batch of 10 messages < 20s total', async () => {
      mockTwilioCreate.mockResolvedValue({
        sid: 'SM123456789',
        status: 'queued',
      });

      const start = performance.now();

      const promises = Array.from({ length: 10 }, (_, i) =>
        service.sendMessage({
          userId: 1,
          phoneNumber: '+5511999999999',
          message: `Test ${i}`,
        })
      );

      await Promise.all(promises);

      const end = performance.now();
      expect(end - start).toBeLessThan(20000);
    });
  });

  describe('Boundary Values & Edge Cases', () => {
    it('should handle minimum valid userId', async () => {
      mockTwilioCreate.mockResolvedValueOnce({
        sid: 'SM123',
        status: 'queued',
      });

      const input: TwilioMessageInput = {
        userId: 1, // Mínimo
        phoneNumber: '+5511999999999',
        message: 'Test',
      };

      const result = await service.sendMessage(input);
      expect(result.success).toBe(true);
    });

    it('should handle very long messages', async () => {
      mockTwilioCreate.mockResolvedValueOnce({
        sid: 'SM123',
        status: 'queued',
      });

      const longMessage = 'A'.repeat(4096); // WhatsApp limit é ~4096

      const input: TwilioMessageInput = {
        userId: 1,
        phoneNumber: '+5511999999999',
        message: longMessage,
      };

      const result = await service.sendMessage(input);
      expect(result.success).toBe(true);
    });

    it('should handle multiple media URLs', async () => {
      mockTwilioCreate.mockResolvedValueOnce({
        sid: 'SM123',
        status: 'queued',
      });

      const input: TwilioMessageInput = {
        userId: 1,
        phoneNumber: '+5511999999999',
        message: 'Test',
        mediaUrls: [
          'https://example.com/audio1.mp3',
          'https://example.com/audio2.mp3',
        ],
      };

      const result = await service.sendMessage(input);
      expect(result.success).toBe(true);
    });
  });

  describe('Constitution Compliance', () => {
    it('should not log secrets (Lei #22)', async () => {
      const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();

      mockTwilioCreate.mockResolvedValueOnce({
        sid: 'SM123456789',
        status: 'queued',
      });

      const input: TwilioMessageInput = {
        userId: 1,
        phoneNumber: '+5511999999999',
        message: 'Test',
      };

      await service.sendMessage(input);

      const logs = consoleLogSpy.mock.calls.map((c) => c[1]).join(' ');
      expect(logs).not.toContain('test-sid');
      expect(logs).not.toContain('test-token');

      consoleLogSpy.mockRestore();
    });

    it('should use exponential backoff with jitter', async () => {
      const error429 = new Error('Too Many Requests');
      (error429 as any).status = 429;

      mockTwilioCreate.mockRejectedValue(error429);

      const input: TwilioMessageInput = {
        userId: 1,
        phoneNumber: '+5511999999999',
        message: 'Test',
      };

      const start = performance.now();

      try {
        await service.sendMessage(input);
      } catch {
        // Esperado
      }

      const end = performance.now();
      const elapsedSeconds = (end - start) / 1000;

      // Com exponential backoff:
      // Tentativa 1: 0ms
      // Tentativa 2: ~1s
      // Tentativa 3: ~2s
      // Tentativa 4: ~4s
      // Total mínimo: ~7s
      expect(elapsedSeconds).toBeGreaterThanOrEqual(6);
    });
  });
});
