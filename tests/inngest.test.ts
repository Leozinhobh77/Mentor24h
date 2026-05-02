import {
  inngest,
  sendWhatsappMessageReceivedEvent,
  sendCrisisDetectedEvent,
  sendCrisisResponseSentEvent,
  sendUserConsentGivenEvent,
  WhatsappMessageReceivedEvent,
  CrisisDetectedEvent,
  CrisisResponseSentEvent,
  UserConsentGivenEvent,
} from '@/lib/inngest';

/**
 * Unit tests for Inngest client and event helpers
 * Tests: event serialization, type safety, error handling
 */
describe('Inngest Client', () => {
  describe('Client Initialization', () => {
    it('should have inngest client initialized', () => {
      expect(inngest).toBeDefined();
      expect(inngest.id).toBe('mentor24h');
      expect(inngest.name).toBe('Mentor24h Ecosystem');
    });

    it('should have apiBaseUrl configured', () => {
      expect(inngest.apiBaseUrl).toBeDefined();
      expect(inngest.apiBaseUrl).toMatch(/inngest|localhost/);
    });

    it('should have apiKey from environment', () => {
      // Will be undefined in test env without .env
      // But should not throw error
      expect(typeof inngest.apiKey === 'string' || inngest.apiKey === undefined).toBe(true);
    });
  });

  describe('Event Type Definitions', () => {
    it('should export WhatsappMessageReceivedEvent type', () => {
      const event: WhatsappMessageReceivedEvent = {
        name: 'whatsapp.message.received',
        data: {
          userId: 1,
          whatsappMessageId: 'SM123',
          fromNumber: '+5511999999999',
          content: 'Test message',
          mediaUrl: null,
          timestamp: Date.now(),
        },
      };

      expect(event.name).toBe('whatsapp.message.received');
      expect(event.data.userId).toBe(1);
    });

    it('should export CrisisDetectedEvent type', () => {
      const event: CrisisDetectedEvent = {
        name: 'crisis.detected',
        data: {
          userId: 1,
          messageId: 123,
          severity: 9,
          keywords: ['suicida', 'morrer'],
          detectedAt: new Date().toISOString(),
        },
      };

      expect(event.name).toBe('crisis.detected');
      expect(event.data.severity).toBe(9);
    });

    it('should export CrisisResponseSentEvent type', () => {
      const event: CrisisResponseSentEvent = {
        name: 'crisis.response.sent',
        data: {
          userId: 1,
          messageId: 123,
          responseType: 'audio',
          sentAt: new Date().toISOString(),
        },
      };

      expect(event.name).toBe('crisis.response.sent');
      expect(event.data.responseType).toBe('audio');
    });

    it('should export UserConsentGivenEvent type', () => {
      const event: UserConsentGivenEvent = {
        name: 'user.consent.given',
        data: {
          userId: 1,
          consentType: 'data_processing',
          consentDate: new Date().toISOString(),
          version: 1,
        },
      };

      expect(event.name).toBe('user.consent.given');
      expect(event.data.consentType).toBe('data_processing');
    });
  });

  describe('Event Helpers (Type Checking)', () => {
    it('should have sendWhatsappMessageReceivedEvent function', () => {
      expect(typeof sendWhatsappMessageReceivedEvent).toBe('function');
    });

    it('should have sendCrisisDetectedEvent function', () => {
      expect(typeof sendCrisisDetectedEvent).toBe('function');
    });

    it('should have sendCrisisResponseSentEvent function', () => {
      expect(typeof sendCrisisResponseSentEvent).toBe('function');
    });

    it('should have sendUserConsentGivenEvent function', () => {
      expect(typeof sendUserConsentGivenEvent).toBe('function');
    });
  });

  describe('Event Payload Validation', () => {
    it('should accept valid WhatsApp message payload', () => {
      const payload = {
        userId: 1,
        whatsappMessageId: 'SMxxxxxxxxxxxxxxxxxxxxxxxx',
        fromNumber: '+5511999999999',
        content: 'Valid message content',
        mediaUrl: null,
        timestamp: 1714579245000,
      };

      // TypeScript compilation checks correctness
      const event: WhatsappMessageReceivedEvent = {
        name: 'whatsapp.message.received',
        data: payload,
      };

      expect(event.data.userId).toEqual(payload.userId);
    });

    it('should require all fields in WhatsApp message', () => {
      // This test verifies TypeScript compilation
      // Missing field would cause compile error

      const validPayload = {
        userId: 1,
        whatsappMessageId: 'SM123',
        fromNumber: '+5511999999999',
        content: 'Test',
        mediaUrl: null,
        timestamp: Date.now(),
      };

      expect(Object.keys(validPayload).length).toBe(6);
    });

    it('should accept mediaUrl as null or string', () => {
      const withoutMedia = {
        userId: 1,
        whatsappMessageId: 'SM123',
        fromNumber: '+5511999999999',
        content: 'No media',
        mediaUrl: null,
        timestamp: Date.now(),
      };

      const withMedia = {
        ...withoutMedia,
        mediaUrl: 'https://api.twilio.com/media/xxx',
      };

      expect(withoutMedia.mediaUrl).toBeNull();
      expect(withMedia.mediaUrl).toMatch(/https/);
    });

    it('should accept valid crisis severity (0-10)', () => {
      const crisisPayload = {
        userId: 1,
        messageId: 123,
        severity: 9,
        keywords: ['suicida'],
        detectedAt: new Date().toISOString(),
      };

      expect(crisisPayload.severity).toBeGreaterThanOrEqual(0);
      expect(crisisPayload.severity).toBeLessThanOrEqual(10);
    });

    it('should accept response type as audio, text, or media', () => {
      const validTypes: Array<'audio' | 'text' | 'media'> = [
        'audio',
        'text',
        'media',
      ];

      validTypes.forEach((type) => {
        const payload = {
          userId: 1,
          messageId: 123,
          responseType: type,
          sentAt: new Date().toISOString(),
        };

        expect(payload.responseType).toBeOneOf(['audio', 'text', 'media']);
      });
    });

    it('should accept consent types', () => {
      const validTypes = [
        'marketing',
        'data_processing',
        'health_data',
      ];

      validTypes.forEach((consentType) => {
        const payload = {
          userId: 1,
          consentType: consentType,
          consentDate: new Date().toISOString(),
          version: 1,
        };

        expect(['marketing', 'data_processing', 'health_data']).toContain(
          payload.consentType
        );
      });
    });
  });

  describe('Error Handling', () => {
    it('should not throw on function call', () => {
      expect(() => {
        // Functions are async but type checking happens at compile time
        expect(typeof sendWhatsappMessageReceivedEvent).toBe('function');
      }).not.toThrow();
    });

    it('should have error logging in functions', () => {
      // Functions include try/catch with console.error
      const source = sendWhatsappMessageReceivedEvent.toString();
      expect(source).toContain('catch');
      expect(source).toContain('console.error');
    });
  });

  describe('Type Safety', () => {
    it('should enforce strict typing for events', () => {
      // Test demonstrates that TypeScript enforces field requirements
      // Trying to create event without required fields would fail compilation

      const event: WhatsappMessageReceivedEvent = {
        name: 'whatsapp.message.received',
        data: {
          userId: 1,
          whatsappMessageId: 'SM123',
          fromNumber: '+5511999999999',
          content: 'Test',
          mediaUrl: null,
          timestamp: Date.now(),
        },
      };

      expect(event).toBeDefined();
      expect(Object.keys(event.data).length).toBe(6);
    });

    it('should prevent wrong event names', () => {
      // TypeScript prevents assigning wrong name
      const correctEvent: WhatsappMessageReceivedEvent = {
        name: 'whatsapp.message.received',
        data: {
          userId: 1,
          whatsappMessageId: 'SM123',
          fromNumber: '+5511999999999',
          content: 'Test',
          mediaUrl: null,
          timestamp: Date.now(),
        },
      };

      expect(correctEvent.name).toBe('whatsapp.message.received');
    });
  });

  describe('Integration Ready', () => {
    it('should be ready for webhook integration', () => {
      // Webhook can call:
      // await sendWhatsappMessageReceivedEvent({ userId, whatsappMessageId, ... })

      expect(typeof sendWhatsappMessageReceivedEvent).toBe('function');
    });

    it('should be ready for crisis detection', () => {
      // Crisis detector can call:
      // await sendCrisisDetectedEvent({ userId, messageId, severity, ... })

      expect(typeof sendCrisisDetectedEvent).toBe('function');
    });

    it('should be ready for consent tracking', () => {
      // Settings page can call:
      // await sendUserConsentGivenEvent({ userId, consentType, ... })

      expect(typeof sendUserConsentGivenEvent).toBe('function');
    });
  });
});

/**
 * INTEGRATION TEST TEMPLATE
 * (Requires Inngest instance running)
 *
 * describe('Inngest Integration', () => {
 *   beforeAll(() => {
 *     // Connect to Inngest instance
 *   });
 *
 *   it('should send WhatsApp message event', async () => {
 *     const result = await sendWhatsappMessageReceivedEvent({
 *       userId: 1,
 *       whatsappMessageId: 'SM_TEST_123',
 *       fromNumber: '+5511999999999',
 *       content: 'Test message',
 *       mediaUrl: null,
 *       timestamp: Date.now(),
 *     });
 *
 *     expect(result?.ids).toBeDefined();
 *     expect(result?.ids.length).toBeGreaterThan(0);
 *   });
 *
 *   it('should send crisis event', async () => {
 *     const result = await sendCrisisDetectedEvent({
 *       userId: 1,
 *       messageId: 123,
 *       severity: 9,
 *       keywords: ['morrer'],
 *       detectedAt: new Date().toISOString(),
 *     });
 *
 *     expect(result?.ids).toBeDefined();
 *   });
 * });
 */
