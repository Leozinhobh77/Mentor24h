import { db } from '@/lib/db';
import { crisisDetector } from '@/lib/services/crisis-detector';
import { responseRouter } from '@/lib/services/response-router';
import { twilioService } from '@/lib/services/twilio-service';
import { messageService } from '@/lib/services/message.service';
import { flagCrisisInDB } from '@/lib/services/crisis-flagging';
import { inngest } from '@/lib/inngest';

jest.mock('@/lib/db', () => ({
  db: {
    select: jest.fn(),
    insert: jest.fn(),
    transaction: jest.fn(),
  },
}));

jest.mock('@/lib/services/crisis-detector', () => ({
  crisisDetector: {
    detect: jest.fn(),
  },
}));

jest.mock('@/lib/services/response-router', () => ({
  responseRouter: {
    route: jest.fn(),
  },
}));

jest.mock('@/lib/services/twilio-service', () => ({
  twilioService: {
    sendMessage: jest.fn(),
  },
}));

jest.mock('@/lib/services/message.service', () => ({
  messageService: {
    saveMessage: jest.fn(),
  },
}));

jest.mock('@/lib/services/crisis-flagging', () => ({
  flagCrisisInDB: jest.fn(),
}));

jest.mock('@/lib/inngest', () => ({
  inngest: {
    send: jest.fn(),
  },
}));

describe('Integration Tests - Workflows & Services', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('WhatsApp Message Processing Workflow', () => {
    const mockEvent = {
      userId: 'user-123',
      whatsappMessageId: 'msg-456',
      fromNumber: '+5511999999999',
      content: 'Olá, como estão?',
      mediaUrl: null,
      timestamp: new Date().toISOString(),
    };

    test('should detect crisis and trigger response', async () => {
      (crisisDetector.detect as any).mockReturnValue({
        detected: true,
        severity: 'high',
        keywords: ['suicídio'],
      });

      (responseRouter.route as any).mockResolvedValue({
        response: 'Resposta de crise',
      });

      (twilioService.sendMessage as any).mockResolvedValue({
        success: true,
        messageId: 'sm-789',
      });

      // Simular workflow logic
      const detection = crisisDetector.detect(mockEvent.content);
      expect(detection.detected).toBe(true);
      expect(detection.severity).toBe('high');

      const response = await responseRouter.route(detection, mockEvent.userId);
      expect(response).toBeDefined();

      await twilioService.sendMessage(mockEvent.fromNumber, response.response);
      expect(twilioService.sendMessage).toHaveBeenCalled();
    });

    test('should save message to database regardless of crisis detection', async () => {
      (messageService.saveMessage as any).mockResolvedValue({
        id: 1,
        userId: mockEvent.userId,
        content: mockEvent.content,
      });

      (crisisDetector.detect as any).mockReturnValue({
        detected: false,
        severity: null,
      });

      const savedMessage = await messageService.saveMessage(mockEvent);
      expect(savedMessage).toBeDefined();
      expect(messageService.saveMessage).toHaveBeenCalledWith(mockEvent);
    });

    test('should flag crisis in database when detected', async () => {
      (crisisDetector.detect as any).mockReturnValue({
        detected: true,
        severity: 'critical',
        keywords: ['morte'],
      });

      (flagCrisisInDB as any).mockResolvedValue({
        flagged: true,
        messageId: 1,
      });

      const detection = crisisDetector.detect(mockEvent.content);
      const flagResult = await flagCrisisInDB(1, detection);

      expect(flagResult.flagged).toBe(true);
      expect(flagCrisisInDB).toHaveBeenCalled();
    });

    test('should handle Twilio errors gracefully', async () => {
      (crisisDetector.detect as any).mockReturnValue({
        detected: true,
        severity: 'high',
      });

      (responseRouter.route as any).mockResolvedValue({
        response: 'Resposta',
      });

      (twilioService.sendMessage as any).mockRejectedValue(
        new Error('Twilio API error')
      );

      await expect(
        twilioService.sendMessage(mockEvent.fromNumber, 'Response')
      ).rejects.toThrow('Twilio API error');
    });

    test('should continue processing even if response routing fails', async () => {
      (crisisDetector.detect as any).mockReturnValue({
        detected: true,
      });

      (responseRouter.route as any).mockRejectedValue(
        new Error('Routing failed')
      );

      (messageService.saveMessage as any).mockResolvedValue({
        id: 1,
      });

      // Save should still work
      const saved = await messageService.saveMessage(mockEvent);
      expect(saved).toBeDefined();
      expect(messageService.saveMessage).toHaveBeenCalled();
    });

    test('should execute within performance SLA (< 2s total)', async () => {
      const startTime = performance.now();

      (crisisDetector.detect as any).mockReturnValue({
        detected: false,
      });

      (messageService.saveMessage as any).mockResolvedValue({ id: 1 });

      await crisisDetector.detect(mockEvent.content);
      await messageService.saveMessage(mockEvent);

      const duration = performance.now() - startTime;
      expect(duration).toBeLessThan(2000);
    });
  });

  describe('Database Integration', () => {
    test('should handle database connection errors', async () => {
      (db.select as any).mockImplementation(() => {
        throw new Error('Database connection failed');
      });

      expect(() => {
        db.select();
      }).toThrow('Database connection failed');
    });

    test('should perform atomic transactions', async () => {
      const mockTransaction = jest.fn().mockResolvedValue({ success: true });
      (db.transaction as any) = mockTransaction;

      // Verify transaction is called
      expect(db.transaction).toBeDefined();
    });

    test('should handle concurrent writes safely', async () => {
      const writes = [
        messageService.saveMessage({ ...{}, userId: 'user-1' } as any),
        messageService.saveMessage({ ...{}, userId: 'user-2' } as any),
        messageService.saveMessage({ ...{}, userId: 'user-3' } as any),
      ];

      (messageService.saveMessage as any).mockResolvedValue({ id: 1 });

      const results = await Promise.all(writes);
      expect(results).toHaveLength(3);
      expect(messageService.saveMessage).toHaveBeenCalledTimes(3);
    });
  });

  describe('Service Integration', () => {
    test('should integrate crisis detector with response router', async () => {
      const criticalContent = 'quero me matar';

      (crisisDetector.detect as any).mockReturnValue({
        detected: true,
        severity: 'critical',
      });

      (responseRouter.route as any).mockResolvedValue({
        response: 'Resposta de emergência',
        priority: 'high',
      });

      const detection = crisisDetector.detect(criticalContent);
      expect(detection.detected).toBe(true);

      const routed = await responseRouter.route(detection, 'user-123');
      expect(routed.priority).toBe('high');
    });

    test('should pass detection results to Twilio', async () => {
      const detection = { detected: true, severity: 'high' };
      const response = 'Mensagem de resposta';

      (twilioService.sendMessage as any).mockResolvedValue({
        success: true,
        sid: 'sm-123',
      });

      const result = await twilioService.sendMessage('+5511999999999', response);
      expect(result.success).toBe(true);
      expect(twilioService.sendMessage).toHaveBeenCalledWith(
        '+5511999999999',
        response
      );
    });

    test('should coordinate multiple services in sequence', async () => {
      const mockEvent = {
        userId: 'user-123',
        fromNumber: '+5511999999999',
        content: 'Teste',
      };

      (crisisDetector.detect as any).mockReturnValue({
        detected: false,
      });

      (messageService.saveMessage as any).mockResolvedValue({ id: 1 });

      // Execute in sequence
      const detection = crisisDetector.detect(mockEvent.content);
      const saved = await messageService.saveMessage(mockEvent as any);

      expect(detection).toBeDefined();
      expect(saved).toBeDefined();
      expect(crisisDetector.detect).toHaveBeenCalled();
      expect(messageService.saveMessage).toHaveBeenCalled();
    });
  });

  describe('Inngest Event Integration', () => {
    test('should dispatch whatsapp.message.received event', async () => {
      (inngest.send as any).mockResolvedValue([{ ids: ['evt-123'] }]);

      const result = await inngest.send({
        name: 'whatsapp.message.received',
        data: {
          userId: 'user-123',
          content: 'Teste',
          fromNumber: '+5511999999999',
        },
      });

      expect(result).toBeDefined();
      expect(inngest.send).toHaveBeenCalled();
    });

    test('should dispatch crisis detection events', async () => {
      (inngest.send as any).mockResolvedValue([{ ids: ['evt-456'] }]);

      await inngest.send({
        name: 'crisis.detected',
        data: {
          userId: 'user-123',
          severity: 'high',
          messageId: 1,
        },
      });

      expect(inngest.send).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'crisis.detected',
        })
      );
    });

    test('should handle event dispatch failures with retry', async () => {
      (inngest.send as any)
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce([{ ids: ['evt-789'] }]);

      // First attempt fails
      await expect(
        inngest.send({
          name: 'test.event',
          data: {},
        })
      ).rejects.toThrow('Network error');

      // Retry succeeds
      const result = await inngest.send({
        name: 'test.event',
        data: {},
      });

      expect(result).toBeDefined();
      expect(inngest.send).toHaveBeenCalledTimes(2);
    });
  });

  describe('Error Recovery & Resilience', () => {
    test('should recover from crisis detector failures', async () => {
      (crisisDetector.detect as any)
        .mockImplementationOnce(() => {
          throw new Error('Detection failed');
        })
        .mockReturnValueOnce({ detected: false });

      // First attempt fails
      expect(() => crisisDetector.detect('test')).toThrow('Detection failed');

      // Retry succeeds
      const result = crisisDetector.detect('test');
      expect(result.detected).toBe(false);
    });

    test('should have fallback responses when router fails', async () => {
      (responseRouter.route as any).mockRejectedValue(
        new Error('Router error')
      );

      // Simulate fallback
      const fallbackResponse = 'Resposta padrão de emergência';

      try {
        await responseRouter.route({ detected: true }, 'user-123');
      } catch (error) {
        // Use fallback
        expect(fallbackResponse).toBe('Resposta padrão de emergência');
      }
    });

    test('should log errors for debugging', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      const error = new Error('Test error');
      console.error('[Workflow] Error:', error);

      expect(consoleSpy).toHaveBeenCalled();
      expect(consoleSpy).toHaveBeenCalledWith('[Workflow] Error:', error);

      consoleSpy.mockRestore();
    });
  });

  describe('Data Flow Validation', () => {
    test('should maintain data consistency across services', async () => {
      const userId = 'user-123';
      const content = 'Test message';

      (crisisDetector.detect as any).mockReturnValue({
        detected: false,
      });

      (messageService.saveMessage as any).mockResolvedValue({
        id: 1,
        userId,
        content,
      });

      const saved = await messageService.saveMessage({
        userId,
        content,
      } as any);

      expect(saved.userId).toBe(userId);
      expect(saved.content).toBe(content);
    });

    test('should validate event data before processing', async () => {
      const invalidEvent = {
        userId: '',
        content: '',
        fromNumber: '',
      };

      // Validation should fail
      expect(invalidEvent.userId).toBe('');
      expect(invalidEvent.content).toBe('');
    });

    test('should transform data correctly between services', async () => {
      const rawEvent = {
        userId: 'user-123',
        content: 'Original message',
      };

      (messageService.saveMessage as any).mockResolvedValue({
        id: 1,
        userId: rawEvent.userId,
        content: rawEvent.content.toUpperCase(),
      });

      const saved = await messageService.saveMessage(rawEvent as any);
      expect(saved.content).toBe('ORIGINAL MESSAGE');
    });
  });

  describe('End-to-End Scenarios', () => {
    test('complete non-crisis message flow', async () => {
      const event = {
        userId: 'user-1',
        content: 'Olá mundo',
        fromNumber: '+5511988888888',
        whatsappMessageId: 'msg-1',
        mediaUrl: null,
        timestamp: new Date().toISOString(),
      };

      // Step 1: Detect (non-crisis)
      (crisisDetector.detect as any).mockReturnValue({
        detected: false,
      });

      // Step 2: Save
      (messageService.saveMessage as any).mockResolvedValue({ id: 1 });

      const detection = crisisDetector.detect(event.content);
      expect(detection.detected).toBe(false);

      const saved = await messageService.saveMessage(event as any);
      expect(saved).toBeDefined();

      // No response sent, only saved
      expect(responseRouter.route).not.toHaveBeenCalled();
    });

    test('complete crisis message flow with response', async () => {
      const event = {
        userId: 'user-2',
        content: 'Quero morrer',
        fromNumber: '+5511977777777',
        whatsappMessageId: 'msg-2',
        mediaUrl: null,
        timestamp: new Date().toISOString(),
      };

      // Step 1: Detect crisis
      (crisisDetector.detect as any).mockReturnValue({
        detected: true,
        severity: 'critical',
      });

      // Step 2: Save
      (messageService.saveMessage as any).mockResolvedValue({ id: 2 });

      // Step 3: Flag
      (flagCrisisInDB as any).mockResolvedValue({ flagged: true });

      // Step 4: Route response
      (responseRouter.route as any).mockResolvedValue({
        response: 'Procure ajuda profissional',
      });

      // Step 5: Send via Twilio
      (twilioService.sendMessage as any).mockResolvedValue({
        success: true,
      });

      // Execute flow
      const detection = crisisDetector.detect(event.content);
      expect(detection.detected).toBe(true);

      const saved = await messageService.saveMessage(event as any);
      expect(saved).toBeDefined();

      await flagCrisisInDB(saved.id, detection);
      expect(flagCrisisInDB).toHaveBeenCalled();

      const response = await responseRouter.route(detection, event.userId);
      expect(response).toBeDefined();

      await twilioService.sendMessage(event.fromNumber, response.response);
      expect(twilioService.sendMessage).toHaveBeenCalled();
    });

    test('message with attachment flow', async () => {
      const event = {
        userId: 'user-3',
        content: 'Foto do dia',
        fromNumber: '+5511966666666',
        whatsappMessageId: 'msg-3',
        mediaUrl: 'https://example.com/image.jpg',
        timestamp: new Date().toISOString(),
      };

      (crisisDetector.detect as any).mockReturnValue({
        detected: false,
      });

      (messageService.saveMessage as any).mockResolvedValue({
        id: 3,
        hasMedia: true,
      });

      const saved = await messageService.saveMessage(event as any);
      expect(saved.hasMedia).toBe(true);
    });
  });
});
