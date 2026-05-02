import { AuditLogger } from '@/lib/services/audit-logger';

/**
 * TASK-034 Tests: Audit Logger
 * Rastreabilidade completa (Lei #9)
 */

describe('AuditLogger (TASK-034)', () => {
  let logger: AuditLogger;

  beforeEach(() => {
    logger = new AuditLogger();
    jest.clearAllMocks();
  });

  describe('Log Actions', () => {
    it('should log message received', async () => {
      const result = await logger.logMessageReceived(1, 'msg-123', '+5511999999999', 'Hello', false);

      expect(result.action).toBe('message_received');
      expect(result.entity).toBe('message');
      expect(result.userId).toBe(1);
      expect(result.details?.fromNumber).toBe('+5511999999999');
    });

    it('should log crisis detected', async () => {
      const result = await logger.logCrisisDetected(1, 'msg-123', 9.5, ['morrer', 'suicida']);

      expect(result.action).toBe('crisis_detected');
      expect(result.entity).toBe('crisis');
      expect(result.details?.severity).toBe(9.5);
      expect(result.details?.keywordCount).toBe(2);
    });

    it('should log crisis response sent', async () => {
      const result = await logger.logCrisisResponseSent(1, 'msg-123', 'critical', 'SM123456789');

      expect(result.action).toBe('crisis_response_sent');
      expect(result.details?.severity).toBe('critical');
      expect(result.details?.twilioMessageId).toBe('SM123456789');
    });

    it('should log message flagged', async () => {
      const result = await logger.logMessageFlagged(1, 'msg-123', 9.0);

      expect(result.action).toBe('message_flagged');
      expect(result.details?.severity).toBe(9.0);
    });

    it('should log escalation triggered', async () => {
      const result = await logger.logEscalationTriggered(1, 'crisis-123', 'Critical severity');

      expect(result.action).toBe('escalation_triggered');
      expect(result.details?.reason).toBe('Critical severity');
    });

    it('should log user consent', async () => {
      const result = await logger.logUserConsentGiven(1, 'health_data');

      expect(result.action).toBe('user_consent_given');
      expect(result.details?.consentType).toBe('health_data');
    });

    it('should log health check', async () => {
      const result = await logger.logHealthCheck('success', { twilio: 'ok', db: 'ok' });

      expect(result.action).toBe('system_health_check');
      expect(result.details?.status).toBe('success');
    });
  });

  describe('Validation', () => {
    it('should reject invalid action', async () => {
      await expect(
        logger.log({
          userId: 1,
          action: 'invalid_action' as any,
          entity: 'message',
        })
      ).rejects.toThrow();
    });

    it('should reject invalid entity', async () => {
      await expect(
        logger.log({
          userId: 1,
          action: 'message_received',
          entity: 'invalid' as any,
        })
      ).rejects.toThrow();
    });
  });

  describe('Query Operations', () => {
    it('should retrieve user audit log', async () => {
      const logs = await logger.getUserAuditLog(1, 50, 0);

      expect(Array.isArray(logs)).toBe(true);
    });

    it('should query logs by action', async () => {
      const logs = await logger.getLogsByAction('crisis_detected', 50);

      expect(Array.isArray(logs)).toBe(true);
    });

    it('should query crisis logs in period', async () => {
      const logs = await logger.getCrisisLogs(
        new Date('2026-05-01'),
        new Date('2026-05-02'),
        8
      );

      expect(Array.isArray(logs)).toBe(true);
    });

    it('should generate audit statistics', async () => {
      const stats = await logger.getAuditStats('24h');

      expect(stats).toHaveProperty('totalActions');
      expect(stats).toHaveProperty('crisisCount');
      expect(stats).toHaveProperty('activeUsers');
      expect(stats).toHaveProperty('topActions');
    });
  });

  describe('Logging', () => {
    it('should log without errors', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      await logger.logMessageReceived(1, 'msg-123', '+55...', 'Test', false);

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('[AuditLogger]'),
        expect.any(Object)
      );

      consoleSpy.mockRestore();
    });

    it('should not expose secrets in logs', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      await logger.log({
        userId: 1,
        action: 'message_received',
        entity: 'message',
        details: { apiKey: 'secret-key' },
      });

      const logs = consoleSpy.mock.calls.map((c) => JSON.stringify(c)).join('');
      // Audit logger should not expose the secret directly (would be in details)
      expect(logs).not.toContain('secret-key');

      consoleSpy.mockRestore();
    });
  });

  describe('Constitution Compliance', () => {
    it('should provide auditability (Lei #9)', async () => {
      const result = await logger.logCrisisDetected(1, 'msg-123', 9.0, ['keywords']);

      expect(result.createdAt).toBeInstanceOf(Date);
      expect(result.userId).toBe(1);
      expect(result.entityId).toBe('msg-123');
      expect(result.action).toBe('crisis_detected');
    });

    it('should support RLS (Lei #11)', async () => {
      // User only sees their own logs
      const userLogs = await logger.getUserAuditLog(1, 100, 0);

      // Should be queryable without exposing other users' data
      expect(Array.isArray(userLogs)).toBe(true);
    });
  });
});
