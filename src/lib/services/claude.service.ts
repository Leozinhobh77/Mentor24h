import Anthropic from '@anthropic-ai/sdk';

class ClaudeService {
  private client: Anthropic;

  constructor() {
    if (!process.env.CLAUDE_API_KEY) {
      throw new Error('CLAUDE_API_KEY not configured');
    }
    this.client = new Anthropic({ apiKey: process.env.CLAUDE_API_KEY });
  }

  async generateSummary(prompt: string): Promise<string> {
    const message = await this.client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }],
    });
    return (message.content[0] as { text: string }).text;
  }

  async generateAnalysis(prompt: string, maxTokens: number = 2048): Promise<string> {
    const message = await this.client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: maxTokens,
      messages: [{ role: 'user', content: prompt }],
    });
    return (message.content[0] as { text: string }).text;
  }
}

let _claudeService: ClaudeService | null = null;

export { ClaudeService };

export function getClaudeService(): ClaudeService {
  if (!_claudeService) _claudeService = new ClaudeService();
  return _claudeService;
}
