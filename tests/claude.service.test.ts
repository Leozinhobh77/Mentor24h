import { ClaudeService, getClaudeService } from '@/lib/services/claude.service';

// Mock Anthropic before importing ClaudeService
jest.mock('@anthropic-ai/sdk', () => {
  return jest.fn().mockImplementation(() => ({
    messages: {
      create: jest.fn()
    }
  }));
});

describe('ClaudeService', () => {
  const mockApiKey = 'sk-ant-test-key-12345';

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.CLAUDE_API_KEY = mockApiKey;
  });

  afterEach(() => {
    delete process.env.CLAUDE_API_KEY;
  });

  describe('Initialization', () => {
    test('should throw error if CLAUDE_API_KEY missing', () => {
      delete process.env.CLAUDE_API_KEY;

      expect(() => {
        new ClaudeService();
      }).toThrow('CLAUDE_API_KEY not configured');
    });

    test('should throw descriptive error message', () => {
      delete process.env.CLAUDE_API_KEY;

      try {
        new ClaudeService();
        fail('Should have thrown error');
      } catch (error: any) {
        expect(error.message).toContain('CLAUDE_API_KEY');
      }
    });

    test('should initialize with valid API key', () => {
      expect(() => {
        new ClaudeService();
      }).not.toThrow();
    });
  });

  describe('Service Methods', () => {
    test('should have generateSummary method', () => {
      const service = new ClaudeService();
      expect(typeof service.generateSummary).toBe('function');
    });

    test('should have generateAnalysis method', () => {
      const service = new ClaudeService();
      expect(typeof service.generateAnalysis).toBe('function');
    });
  });

  describe('Error Handling', () => {
    test('should not crash with invalid API key format', () => {
      process.env.CLAUDE_API_KEY = 'not-a-valid-key-format';

      expect(() => {
        new ClaudeService();
      }).not.toThrow();
    });

    test('should validate API key presence on init', () => {
      delete process.env.CLAUDE_API_KEY;

      const thrownError = () => {
        try {
          new ClaudeService();
        } catch (e) {
          throw e;
        }
      };

      expect(thrownError).toThrow();
    });
  });

  describe('generateSummary', () => {
    test('should be callable as async function', async () => {
      const service = new ClaudeService();

      const Anthropic = require('@anthropic-ai/sdk');
      const mockClient = new Anthropic();

      mockClient.messages.create.mockResolvedValue({
        content: [{ type: 'text', text: 'Summary text' }],
        usage: { input_tokens: 100, output_tokens: 200 }
      });

      // Replace internal client for this test
      (service as any).client = mockClient;

      const result = await service.generateSummary('Test prompt');
      expect(result).toBe('Summary text');
    });

    test('should handle empty prompt', async () => {
      const service = new ClaudeService();

      const Anthropic = require('@anthropic-ai/sdk');
      const mockClient = new Anthropic();

      mockClient.messages.create.mockResolvedValue({
        content: [{ type: 'text', text: '' }],
        usage: { input_tokens: 5, output_tokens: 0 }
      });

      (service as any).client = mockClient;

      const result = await service.generateSummary('');
      expect(result).toBe('');
    });

    test('should propagate API errors', async () => {
      const service = new ClaudeService();

      const Anthropic = require('@anthropic-ai/sdk');
      const mockClient = new Anthropic();

      mockClient.messages.create.mockRejectedValue(new Error('API Error'));

      (service as any).client = mockClient;

      await expect(service.generateSummary('Test')).rejects.toThrow('API Error');
    });
  });

  describe('generateAnalysis', () => {
    test('should be callable with custom max tokens', async () => {
      const service = new ClaudeService();

      const Anthropic = require('@anthropic-ai/sdk');
      const mockClient = new Anthropic();

      mockClient.messages.create.mockResolvedValue({
        content: [{ type: 'text', text: 'Analysis' }],
        usage: { input_tokens: 100, output_tokens: 2000 }
      });

      (service as any).client = mockClient;

      const result = await service.generateAnalysis('Test', 4096);
      expect(result).toBe('Analysis');
    });

    test('should default max tokens when not provided', async () => {
      const service = new ClaudeService();

      const Anthropic = require('@anthropic-ai/sdk');
      const mockClient = new Anthropic();

      mockClient.messages.create.mockResolvedValue({
        content: [{ type: 'text', text: 'Result' }],
        usage: { input_tokens: 100, output_tokens: 500 }
      });

      (service as any).client = mockClient;

      const result = await service.generateAnalysis('Test');
      expect(result).toBe('Result');
    });
  });
});

describe('getClaudeService', () => {
  beforeEach(() => {
    process.env.CLAUDE_API_KEY = 'sk-ant-test-key';
  });

  afterEach(() => {
    delete process.env.CLAUDE_API_KEY;
  });

  test('should return a ClaudeService instance', () => {
    const service = getClaudeService();
    expect(service).toBeInstanceOf(ClaudeService);
  });

  test('should initialize service on first call', () => {
    const service = getClaudeService();
    expect(service).toBeDefined();
  });

  test('should return same instance on subsequent calls (singleton)', () => {
    const service1 = getClaudeService();
    const service2 = getClaudeService();

    expect(service1).toBe(service2);
  });

  test('should validate API key is required in constructor', () => {
    delete process.env.CLAUDE_API_KEY;

    expect(() => {
      new ClaudeService();
    }).toThrow('CLAUDE_API_KEY not configured');
  });
});
