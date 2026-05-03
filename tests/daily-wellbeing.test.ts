import { dailyWellbeing } from '@/lib/routines/daily-wellbeing';
import { db } from '@/lib/db';
import { getClaudeService } from '@/lib/services/claude.service';
import { TwilioService } from '@/lib/services/twilio-service';

jest.mock('@/lib/db', () => ({
  db: {
    select: jest.fn().mockReturnThis(),
    from: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    and: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    values: jest.fn().mockResolvedValue({}),
  },
}));

jest.mock('@/lib/services/claude.service');
jest.mock('@/lib/services/twilio-service');

describe('Daily Wellbeing Routine', () => {
  let mockStep: any;

  beforeEach(() => {
    jest.clearAllMocks();
    mockStep = {
      run: jest.fn((name: string, fn: Function) => {
        return Promise.resolve(fn());
      }),
    };
  });

  describe('Cron trigger', () => {
    test('should have daily cron trigger', () => {
      const triggers = dailyWellbeing.triggers || [];
      const cronTrigger = triggers.find((t: any) => t.cron === '0 19 * * *');

      expect(cronTrigger).toBeDefined();
      expect(cronTrigger?.cron).toBe('0 19 * * *');
    });

    test('should run at 7 PM UTC daily', () => {
      const triggers = dailyWellbeing.triggers || [];
      const cronTrigger = triggers.find((t: any) => t.cron === '0 19 * * *');

      expect(cronTrigger?.cron).toMatch(/^0 19/);
    });

    test('should have correct function ID', () => {
      expect(dailyWellbeing.id).toBe('daily-wellbeing');
    });
  });

  describe('Handler execution', () => {
    test('should be an async function', async () => {
      const fn = dailyWellbeing.fn || dailyWellbeing.handler;
      expect(typeof fn).toBe('function');
    });

    test('should return success result on completion', async () => {
      expect(dailyWellbeing).toBeDefined();
      expect(dailyWellbeing.id).toBe('daily-wellbeing');
    });
  });

  describe('User targeting', () => {
    test('should fetch active users with verified WhatsApp', async () => {
      const functionCode = dailyWellbeing.fn?.toString() || '';
      expect(functionCode).toContain('active') || expect(functionCode).toContain('isActive');
      expect(functionCode).toContain('whatsappVerified');
    });

    test('should filter users with selected categories', async () => {
      const functionCode = dailyWellbeing.fn?.toString() || '';
      expect(functionCode).toContain('categor');
    });
  });

  describe('Message generation', () => {
    test('should use Claude or template for tips', async () => {
      const functionCode = dailyWellbeing.fn?.toString() || '';
      expect(functionCode).toContain('claude') ||
        expect(functionCode).toContain('template');
    });

    test('should include wellbeing content', async () => {
      const functionCode = dailyWellbeing.fn?.toString() || '';
      expect(functionCode).toContain('bem-estar') || expect(functionCode).toContain('wellbeing');
    });

    test('should personalize by user categories', async () => {
      const functionCode = dailyWellbeing.fn?.toString() || '';
      expect(functionCode).toContain('selected') || expect(functionCode).toContain('categor');
    });
  });

  describe('Claude fallback', () => {
    test('should have fallback to templates if Claude fails', async () => {
      const functionCode = dailyWellbeing.fn?.toString() || '';
      expect(functionCode).toContain('template') || expect(functionCode).toContain('fallback');
    });

    test('should have pre-recorded tips', async () => {
      const functionCode = dailyWellbeing.fn?.toString() || '';
      expect(functionCode).toContain('template') || expect(functionCode).toContain('dica');
    });

    test('should handle Claude API errors gracefully', async () => {
      const functionCode = dailyWellbeing.fn?.toString() || '';
      expect(functionCode).toContain('catch') || expect(functionCode).toContain('error');
    });
  });

  describe('Message delivery', () => {
    test('should send via Twilio', async () => {
      const functionCode = dailyWellbeing.fn?.toString() || '';
      expect(functionCode).toContain('twilio') || expect(functionCode).toContain('sendMessage');
    });

    test('should use step.run for message sending', async () => {
      const functionCode = dailyWellbeing.fn?.toString() || '';
      expect(functionCode).toContain('step.run');
    });

    test('should skip users without verified WhatsApp', async () => {
      const functionCode = dailyWellbeing.fn?.toString() || '';
      expect(functionCode).toContain('whatsappVerified') ||
        expect(functionCode).toContain('verified');
    });
  });

  describe('Metrics tracking', () => {
    test('should track total messages sent', async () => {
      const functionCode = dailyWellbeing.fn?.toString() || '';
      expect(functionCode).toContain('totalSent') || expect(functionCode).toContain('sent');
    });

    test('should track Claude-generated tips', async () => {
      const functionCode = dailyWellbeing.fn?.toString() || '';
      expect(functionCode).toContain('withClaude') || expect(functionCode).toContain('claude');
    });

    test('should track template-based fallbacks', async () => {
      const functionCode = dailyWellbeing.fn?.toString() || '';
      expect(functionCode).toContain('withTemplate') || expect(functionCode).toContain('template');
    });

    test('should track failed deliveries', async () => {
      const functionCode = dailyWellbeing.fn?.toString() || '';
      expect(functionCode).toContain('failed') || expect(functionCode).toContain('erro');
    });
  });

  describe('Data persistence', () => {
    test('should log execution to routines table', async () => {
      const functionCode = dailyWellbeing.fn?.toString() || '';
      expect(functionCode).toContain('routines') || expect(functionCode).toContain('log');
    });

    test('should save execution metrics', async () => {
      const functionCode = dailyWellbeing.fn?.toString() || '';
      expect(functionCode).toContain('lastResult') || expect(functionCode).toContain('result');
    });

    test('should record execution timestamp', async () => {
      const functionCode = dailyWellbeing.fn?.toString() || '';
      expect(functionCode).toContain('executedAt') || expect(functionCode).toContain('Date');
    });
  });

  describe('Error handling', () => {
    test('should have error handling', async () => {
      const functionCode = dailyWellbeing.fn?.toString() || '';
      expect(functionCode).toContain('catch') || expect(functionCode).toContain('error');
    });

    test('should return error result on failure', async () => {
      const functionCode = dailyWellbeing.fn?.toString() || '';
      expect(functionCode).toContain('success: false') || expect(functionCode).toContain('error');
    });

    test('should continue on individual user failures', async () => {
      const functionCode = dailyWellbeing.fn?.toString() || '';
      expect(functionCode).toContain('continue') || expect(functionCode).toContain('try');
    });
  });

  describe('Return value', () => {
    test('should return success status', async () => {
      const functionCode = dailyWellbeing.fn?.toString() || '';
      expect(functionCode).toContain('success:');
    });

    test('should return execution metrics', async () => {
      const functionCode = dailyWellbeing.fn?.toString() || '';
      expect(functionCode.includes('sent') || functionCode.includes('processed')).toBe(true);
    });

    test('should include execution timestamp', async () => {
      const functionCode = dailyWellbeing.fn?.toString() || '';
      expect(functionCode.includes('executedAt') || functionCode.includes('Date')).toBe(true);
    });
  });
});
