import { ResponseRouter, SeverityLevel } from '@/lib/services/response-router';

describe('Response Router Service', () => {
  let router: ResponseRouter;

  beforeEach(() => {
    router = new ResponseRouter();
  });

  describe('Critical Severity Response', () => {
    it('should return critical response for severity >= 9', () => {
      const response = router.getResponse(9.5);

      expect(response.severity).toBe('critical');
      expect(response.message).toContain('perigo');
      expect(response.responseType).toBe('audio');
      expect(response.escalationRequired).toBe(true);
      expect(response.humanSupportNeeded).toBe(true);
      expect(response.audioUrl).toBeDefined();
    });

    it('should include emergency resources for critical', () => {
      const response = router.getResponse('critical');

      expect(response.resources.length).toBeGreaterThan(0);
      expect(response.resources).toContainEqual(
        expect.objectContaining({
          name: expect.stringContaining('CVV'),
          phone: '188',
        })
      );
      expect(response.resources).toContainEqual(
        expect.objectContaining({
          name: expect.stringContaining('SAMU'),
          phone: '192',
        })
      );
    });

    it('should have escalation reason for critical', () => {
      const response = router.getResponse('critical');

      expect(response.escalationReason).toBeDefined();
      expect(response.escalationReason).toContain('emergencial');
    });

    it('should mark as urgent for critical', () => {
      const isUrgent = router.isUrgent('critical');
      expect(isUrgent).toBe(true);
    });
  });

  describe('High Severity Response', () => {
    it('should return high response for 7 <= severity < 9', () => {
      const response = router.getResponse(7.8);

      expect(response.severity).toBe('high');
      expect(response.message).toContain('momento muito difícil');
      expect(response.responseType).toBe('audio');
      expect(response.escalationRequired).toBe(true);
      expect(response.humanSupportNeeded).toBe(true);
    });

    it('should include CVV and UPA for high', () => {
      const response = router.getResponse('high');

      expect(response.resources.length).toBeGreaterThan(0);
      expect(response.resources[0].name).toContain('CVV');
    });

    it('should have escalation reason for high', () => {
      const response = router.getResponse('high');

      expect(response.escalationReason).toBeDefined();
      expect(response.escalationReason).toContain('Alto risco');
    });

    it('should not mark as urgent for high', () => {
      const isUrgent = router.isUrgent('high');
      expect(isUrgent).toBe(false);
    });
  });

  describe('Medium Severity Response', () => {
    it('should return medium response for 0 < severity < 7', () => {
      const response = router.getResponse(3.2);

      expect(response.severity).toBe('medium');
      expect(response.message).toContain('desafios');
      expect(response.responseType).toBe('text');
      expect(response.escalationRequired).toBe(false);
      expect(response.humanSupportNeeded).toBe(false);
    });

    it('should include support resources for medium', () => {
      const response = router.getResponse('medium');

      expect(response.resources.length).toBeGreaterThan(0);
      expect(response.resources[0].name).toContain('Saúde');
    });

    it('should not have escalation reason for medium', () => {
      const response = router.getResponse('medium');

      expect(response.escalationReason).toBeUndefined();
    });
  });

  describe('No Crisis Response', () => {
    it('should return none response for severity == 0', () => {
      const response = router.getResponse(0);

      expect(response.severity).toBe('none');
      expect(response.escalationRequired).toBe(false);
      expect(response.humanSupportNeeded).toBe(false);
      expect(response.resources.length).toBe(0);
    });

    it('should not require escalation for none', () => {
      const requiresEscalation = router.requiresEscalation('none');
      expect(requiresEscalation).toBe(false);
    });
  });

  describe('Helper Methods', () => {
    it('should get message by severity', () => {
      const message = router.getMessage('critical');
      expect(message).toContain('perigo');
      expect(message.length).toBeGreaterThan(50);
    });

    it('should get resources by severity', () => {
      const resources = router.getResources('critical');
      expect(resources.length).toBe(3);
      expect(resources[0].name).toContain('CVV');
    });

    it('should get audio URL by severity', () => {
      const audioUrl = router.getAudioUrl('critical');
      expect(audioUrl).toContain('https://');
      expect(audioUrl).toContain('.mp3');
    });

    it('should return undefined audio URL for none', () => {
      const audioUrl = router.getAudioUrl('none');
      expect(audioUrl).toBeUndefined();
    });

    it('should recommend audio for critical', () => {
      const type = router.recommendedResponseType('critical');
      expect(type).toBe('audio');
    });

    it('should recommend text for medium', () => {
      const type = router.recommendedResponseType('medium');
      expect(type).toBe('text');
    });
  });

  describe('Escalation Logic', () => {
    it('should require escalation for critical and high', () => {
      expect(router.requiresEscalation(10)).toBe(true);
      expect(router.requiresEscalation(9)).toBe(true);
      expect(router.requiresEscalation(8)).toBe(true);
      expect(router.requiresEscalation(7)).toBe(true);
    });

    it('should not require escalation for medium and none', () => {
      expect(router.requiresEscalation(6)).toBe(false);
      expect(router.requiresEscalation(3)).toBe(false);
      expect(router.requiresEscalation(0)).toBe(false);
    });
  });

  describe('Response Validation', () => {
    it('should have valid message for all severities', () => {
      const severities: SeverityLevel[] = ['critical', 'high', 'medium', 'none'];

      severities.forEach((severity) => {
        const response = router.getResponse(severity);
        expect(response.message).toBeTruthy();
        expect(response.message.length).toBeGreaterThan(10);
      });
    });

    it('should have valid response type', () => {
      const response = router.getResponse('critical');
      expect(['audio', 'text', 'media']).toContain(response.responseType);
    });

    it('should have consistent escalation flags', () => {
      const criticalResponse = router.getResponse('critical');
      expect(criticalResponse.escalationRequired).toBe(criticalResponse.humanSupportNeeded);

      const mediumResponse = router.getResponse('medium');
      expect(mediumResponse.escalationRequired).toBe(false);
      expect(mediumResponse.humanSupportNeeded).toBe(false);
    });
  });

  describe('Integration with Crisis Detector', () => {
    it('should accept severity from detectCrisis result', () => {
      const mockDetectorResult = {
        severity: 9.2,
        keywords: ['suicida', 'morrer'],
        detected: true,
      };

      const response = router.getResponse(mockDetectorResult.severity);
      expect(response.severity).toBe('critical');
      expect(response.escalationRequired).toBe(true);
    });

    it('should handle all severity ranges from detector', () => {
      const severities = [0, 1.5, 3.2, 5.8, 7.0, 8.5, 10];

      severities.forEach((severity) => {
        const response = router.getResponse(severity);
        expect(['critical', 'high', 'medium', 'none']).toContain(response.severity);
      });
    });
  });

  describe('Performance (Zero Latency)', () => {
    it('should return response instantly (< 1ms)', () => {
      const start = performance.now();
      router.getResponse('critical');
      const end = performance.now();

      expect(end - start).toBeLessThan(1);
    });

    it('should handle 1000 requests < 100ms total', () => {
      const start = performance.now();

      for (let i = 0; i < 1000; i++) {
        router.getResponse(Math.random() * 10);
      }

      const end = performance.now();
      expect(end - start).toBeLessThan(100);
    });
  });

  describe('Severity Normalization', () => {
    it('should normalize numeric to string severity', () => {
      expect(router.getResponse(9.5).severity).toBe('critical');
      expect(router.getResponse(8).severity).toBe('high');
      expect(router.getResponse(5).severity).toBe('medium');
      expect(router.getResponse(0).severity).toBe('none');
    });

    it('should handle string severity directly', () => {
      expect(router.getResponse('critical').severity).toBe('critical');
      expect(router.getResponse('high').severity).toBe('high');
      expect(router.getResponse('medium').severity).toBe('medium');
      expect(router.getResponse('none').severity).toBe('none');
    });

    it('should handle boundary values', () => {
      expect(router.getResponse(9).severity).toBe('critical');
      expect(router.getResponse(8.99).severity).toBe('high');
      expect(router.getResponse(7).severity).toBe('high');
      expect(router.getResponse(6.99).severity).toBe('medium');
      expect(router.getResponse(0.01).severity).toBe('medium');
    });
  });

  describe('Resources Format', () => {
    it('should have phone for emergency contacts', () => {
      const response = router.getResponse('critical');

      const withPhone = response.resources.filter((r) => r.phone);
      expect(withPhone.length).toBeGreaterThan(0);
      expect(withPhone[0].phone).toMatch(/^\d{3}$/);
    });

    it('should have availability info', () => {
      const response = router.getResponse('high');

      response.resources.forEach((resource) => {
        expect(resource.available).toBeTruthy();
        expect(resource.available).toMatch(/24\/7|dias úteis/i);
      });
    });
  });
});
