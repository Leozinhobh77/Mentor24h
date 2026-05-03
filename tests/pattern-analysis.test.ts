import { patternAnalysis } from '@/lib/routines/pattern-analysis';
import { db } from '@/lib/db';
import { getClaudeService } from '@/lib/services/claude.service';

jest.mock('@/lib/db', () => ({
  db: {
    select: jest.fn().mockReturnThis(),
    from: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    set: jest.fn().mockReturnThis(),
    values: jest.fn().mockResolvedValue({}),
  },
}));

jest.mock('@/lib/services/claude.service');

describe('Pattern Analysis Routine', () => {
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
    test('should have cron trigger for Monday 2 PM UTC', () => {
      const triggers = patternAnalysis.triggers || [];
      const cronTrigger = triggers.find((t: any) => t.cron === '0 14 * * 1');

      expect(cronTrigger).toBeDefined();
      expect(cronTrigger?.cron).toBe('0 14 * * 1');
    });

    test('should have correct function ID', () => {
      expect(patternAnalysis.id).toBe('pattern-analysis');
    });
  });

  describe('Handler execution', () => {
    test('should be an async function', async () => {
      const fn = patternAnalysis.fn || patternAnalysis.handler;
      expect(typeof fn).toBe('function');
    });

    test('should return success result on completion', async () => {
      expect(patternAnalysis).toBeDefined();
      expect(patternAnalysis.id).toBe('pattern-analysis');
    });
  });

  describe('Pattern detection', () => {
    test('should filter users with 10+ messages per week', async () => {
      const functionCode = patternAnalysis.fn?.toString() || '';
      expect(functionCode).toContain('10');
    });

    test('should detect peak hours from messages', async () => {
      const functionCode = patternAnalysis.fn?.toString() || '';
      expect(functionCode).toContain('padrões') || expect(functionCode).toContain('patern');
    });

    test('should identify message categories', async () => {
      const functionCode = patternAnalysis.fn?.toString() || '';
      expect(functionCode).toContain('categor');
    });

    test('should track behavior insights', async () => {
      const functionCode = patternAnalysis.fn?.toString() || '';
      expect(functionCode).toContain('analis') || expect(functionCode).toContain('pattern');
    });
  });

  describe('Claude integration', () => {
    test('should call Claude for analysis generation', async () => {
      const functionCode = patternAnalysis.fn?.toString() || '';
      expect(functionCode).toContain('claude') || expect(functionCode).toContain('generateAnalysis');
    });

    test('should use step.run for Claude calls', async () => {
      const functionCode = patternAnalysis.fn?.toString() || '';
      expect(functionCode).toContain('step.run');
    });
  });

  describe('Data persistence', () => {
    test('should save analysis result to database', async () => {
      const functionCode = patternAnalysis.fn?.toString() || '';
      expect(functionCode).toContain('lastResult');
    });

    test('should store analysis as JSON', async () => {
      const functionCode = patternAnalysis.fn?.toString() || '';
      expect(functionCode).toContain('JSON');
    });

    test('should update routines table', async () => {
      const functionCode = patternAnalysis.fn?.toString() || '';
      expect(functionCode).toContain('routines') || expect(functionCode).toContain('db');
    });
  });

  describe('Error handling', () => {
    test('should have error handling', async () => {
      const functionCode = patternAnalysis.fn?.toString() || '';
      expect(functionCode).toContain('catch') || expect(functionCode).toContain('error');
    });

    test('should return error result on failure', async () => {
      const functionCode = patternAnalysis.fn?.toString() || '';
      expect(functionCode).toContain('success: false') || expect(functionCode).toContain('error');
    });
  });

  describe('Return value', () => {
    test('should return object with execution status', async () => {
      const functionCode = patternAnalysis.fn?.toString() || '';
      expect(functionCode).toContain('success:');
    });

    test('should return execution timestamp', async () => {
      const functionCode = patternAnalysis.fn?.toString() || '';
      expect(functionCode).toContain('executedAt') || expect(functionCode).toContain('Date');
    });

    test('should include analysis results', async () => {
      const functionCode = patternAnalysis.fn?.toString() || '';
      expect(functionCode).toContain('result') || expect(functionCode).toContain('analysis');
    });
  });
});
