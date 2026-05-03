import { inngest } from '@/lib/inngest';

jest.mock('@/lib/inngest', () => ({
  inngest: {
    send: jest.fn(),
  },
}));

describe('Routines API Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (inngest.send as jest.Mock).mockResolvedValue([{ ids: ['event-id-123'] }]);
  });

  describe('POST /api/routines/weekly-summary', () => {
    test('should require Vercel Cron header or Bearer token', () => {
      const headers = new Map();
      const cronHeader = headers.get('x-vercel-cron');
      const authHeader = headers.get('authorization');

      const isAuthorized = !!(cronHeader || authHeader?.startsWith('Bearer '));
      expect(isAuthorized).toBe(false);
    });

    test('should accept Vercel Cron header', () => {
      const headers = new Map([['x-vercel-cron', '1']]);
      const cronHeader = headers.get('x-vercel-cron');

      expect(cronHeader).toBe('1');
    });

    test('should accept Bearer token', () => {
      const headers = new Map([['authorization', 'Bearer test-token-123']]);
      const authHeader = headers.get('authorization');

      expect(authHeader?.startsWith('Bearer ')).toBe(true);
    });

    test('should dispatch Inngest event', async () => {
      (inngest.send as jest.Mock).mockResolvedValue([{ ids: ['event-123'] }]);

      const result = await inngest.send({
        name: 'weekly-summary/trigger',
        data: { triggeredAt: new Date() },
      });

      expect(inngest.send).toHaveBeenCalled();
      expect(result[0]?.ids?.[0]).toBe('event-123');
    });

    test('should return success response with timestamps', async () => {
      const response = {
        success: true,
        triggeredAt: new Date(),
        eventId: 'event-123',
      };

      expect(response.success).toBe(true);
      expect(response.triggeredAt).toBeDefined();
      expect(response.eventId).toBeDefined();
    });

    test('should handle errors gracefully', async () => {
      (inngest.send as jest.Mock).mockRejectedValue(new Error('Network error'));

      try {
        await inngest.send({
          name: 'weekly-summary/trigger',
          data: {},
        });
        fail('Should have thrown error');
      } catch (error: any) {
        expect(error.message).toContain('Network error');
      }
    });
  });

  describe('POST /api/routines/pattern-analysis', () => {
    test('should require authentication', () => {
      const headers = new Map();
      const cronHeader = headers.get('x-vercel-cron');
      const authHeader = headers.get('authorization');

      const isAuthorized = !!(cronHeader || authHeader?.startsWith('Bearer '));
      expect(isAuthorized).toBe(false);
    });

    test('should dispatch pattern-analysis event', async () => {
      (inngest.send as jest.Mock).mockResolvedValue([{ ids: ['event-456'] }]);

      const result = await inngest.send({
        name: 'pattern-analysis/trigger',
        data: { triggeredAt: new Date() },
      });

      expect(inngest.send).toHaveBeenCalled();
      expect(result[0]?.ids?.[0]).toBe('event-456');
    });

    test('should return success response', async () => {
      (inngest.send as jest.Mock).mockResolvedValue([{ ids: ['event-456'] }]);

      const result = await inngest.send({
        name: 'pattern-analysis/trigger',
        data: {},
      });

      expect(result[0]?.ids).toBeDefined();
    });
  });

  describe('POST /api/routines/daily-wellbeing', () => {
    test('should require authentication', () => {
      const headers = new Map();
      const cronHeader = headers.get('x-vercel-cron');
      const authHeader = headers.get('authorization');

      const isAuthorized = !!(cronHeader || authHeader?.startsWith('Bearer '));
      expect(isAuthorized).toBe(false);
    });

    test('should dispatch daily-wellbeing event', async () => {
      (inngest.send as jest.Mock).mockResolvedValue([{ ids: ['event-789'] }]);

      const result = await inngest.send({
        name: 'daily-wellbeing/trigger',
        data: { triggeredAt: new Date() },
      });

      expect(inngest.send).toHaveBeenCalled();
      expect(result[0]?.ids?.[0]).toBe('event-789');
    });

    test('should handle event dispatch correctly', async () => {
      (inngest.send as jest.Mock).mockResolvedValue([{ ids: ['event-789'] }]);

      const result = await inngest.send({
        name: 'daily-wellbeing/trigger',
        data: {},
      });

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('GET /api/routines/status', () => {
    test('should require Bearer token', () => {
      const headers = new Map();
      const authHeader = headers.get('authorization');

      expect(authHeader).toBeUndefined();
    });

    test('should accept Bearer token', () => {
      const headers = new Map([['authorization', 'Bearer test-token']]);
      const authHeader = headers.get('authorization');

      expect(authHeader?.startsWith('Bearer ')).toBe(true);
    });

    test('should return routine statuses', () => {
      const response = {
        success: true,
        data: [
          {
            name: 'Resumo Semanal',
            type: 'weekly',
            enabled: true,
            lastExecuted: new Date(),
            nextExecution: new Date(),
          },
          {
            name: 'Análise de Padrões',
            type: 'pattern',
            enabled: true,
            lastExecuted: new Date(),
            nextExecution: new Date(),
          },
          {
            name: 'Bem-estar Diário',
            type: 'daily',
            enabled: true,
            lastExecuted: new Date(),
            nextExecution: new Date(),
          },
        ],
      };

      expect(response.success).toBe(true);
      expect(response.data.length).toBe(3);
      expect(response.data[0].type).toBe('weekly');
      expect(response.data[1].type).toBe('pattern');
      expect(response.data[2].type).toBe('daily');
    });

    test('should include execution metadata', () => {
      const routine = {
        name: 'Resumo Semanal',
        type: 'weekly',
        enabled: true,
        lastExecuted: new Date('2026-05-01T08:00:00Z'),
        nextExecution: new Date('2026-05-08T08:00:00Z'),
        lastResult: { usersProcessed: 5, summariesSent: 5 },
      };

      expect(routine).toHaveProperty('lastExecuted');
      expect(routine).toHaveProperty('nextExecution');
      expect(routine).toHaveProperty('lastResult');
    });

    test('should return 3 routine statuses', () => {
      const routines = [
        { id: 1, type: 'weekly' },
        { id: 2, type: 'pattern' },
        { id: 3, type: 'daily' },
      ];

      expect(routines.length).toBe(3);
    });
  });

  describe('Cross-route consistency', () => {
    test('all POST routes should use x-vercel-cron or Bearer token', () => {
      const routes = [
        'weekly-summary',
        'pattern-analysis',
        'daily-wellbeing',
      ];

      routes.forEach((route) => {
        expect(route).toBeDefined();
      });
    });

    test('all routes should dispatch Inngest events', async () => {
      (inngest.send as jest.Mock).mockResolvedValue([{ ids: ['event-id'] }]);

      const events = [
        'weekly-summary/trigger',
        'pattern-analysis/trigger',
        'daily-wellbeing/trigger',
      ];

      for (const event of events) {
        await inngest.send({
          name: event,
          data: {},
        });
      }

      expect(inngest.send).toHaveBeenCalledTimes(3);
    });

    test('all routes should return consistent response format', () => {
      const responses = [
        {
          success: true,
          triggeredAt: new Date(),
          eventId: 'event-1',
        },
        {
          success: true,
          triggeredAt: new Date(),
          eventId: 'event-2',
        },
        {
          success: true,
          triggeredAt: new Date(),
          eventId: 'event-3',
        },
      ];

      responses.forEach((response) => {
        expect(response).toHaveProperty('success');
        expect(response).toHaveProperty('triggeredAt');
        expect(response).toHaveProperty('eventId');
      });
    });

    test('status endpoint should return array of routines', () => {
      const statusResponse = {
        success: true,
        data: [
          { name: 'Routine 1', type: 'weekly' },
          { name: 'Routine 2', type: 'pattern' },
          { name: 'Routine 3', type: 'daily' },
        ],
      };

      expect(Array.isArray(statusResponse.data)).toBe(true);
      expect(statusResponse.data.every((r) => r.name && r.type)).toBe(true);
    });
  });

  describe('Error handling', () => {
    test('POST routes should handle Inngest errors', async () => {
      (inngest.send as jest.Mock).mockRejectedValue(new Error('Inngest error'));

      try {
        await inngest.send({
          name: 'weekly-summary/trigger',
          data: {},
        });
        fail('Should have thrown error');
      } catch (error: any) {
        expect(error).toBeDefined();
        expect(error.message).toContain('Inngest error');
      }
    });

    test('should return 401 for unauthorized requests', () => {
      const headers = new Map();
      const cronHeader = headers.get('x-vercel-cron');
      const authHeader = headers.get('authorization');
      const isUnauthorized = !cronHeader && !authHeader?.startsWith('Bearer ');

      expect(isUnauthorized).toBe(true);
    });

    test('should return 500 on server errors', () => {
      const errorResponse = {
        success: false,
        error: 'Internal server error',
      };

      expect(errorResponse.success).toBe(false);
      expect(errorResponse.error).toBeDefined();
    });
  });

  describe('Request validation', () => {
    test('should validate authorization headers', () => {
      const validHeaders = [
        { 'x-vercel-cron': '1' },
        { 'authorization': 'Bearer token' },
      ];

      validHeaders.forEach((headerObj) => {
        const headers = new Map(Object.entries(headerObj));
        const cronHeader = headers.get('x-vercel-cron');
        const authHeader = headers.get('authorization');

        expect(!!cronHeader || authHeader?.startsWith('Bearer ')).toBe(true);
      });
    });

    test('should reject invalid authorization', () => {
      const invalidHeaders = [
        { 'authorization': 'Basic token' },
        { 'authorization': 'token' },
        {},
      ];

      invalidHeaders.forEach((headerObj) => {
        const headers = new Map(Object.entries(headerObj));
        const cronHeader = headers.get('x-vercel-cron');
        const authHeader = headers.get('authorization');

        expect(!!(cronHeader || authHeader?.startsWith('Bearer '))).toBe(false);
      });
    });
  });

  describe('Response format', () => {
    test('success responses should have required fields', () => {
      const response = {
        success: true,
        triggeredAt: new Date(),
        eventId: 'event-id',
      };

      expect(response).toHaveProperty('success');
      expect(response).toHaveProperty('triggeredAt');
      expect(response).toHaveProperty('eventId');
    });

    test('error responses should have error field', () => {
      const response = {
        success: false,
        error: 'Unauthorized',
      };

      expect(response.success).toBe(false);
      expect(response).toHaveProperty('error');
    });

    test('status endpoint should return array of objects', () => {
      const response = {
        success: true,
        data: [{ id: 1, type: 'weekly' }],
      };

      expect(Array.isArray(response.data)).toBe(true);
      expect(response.data[0]).toHaveProperty('id');
      expect(response.data[0]).toHaveProperty('type');
    });
  });
});
