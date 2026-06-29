import OpenAI from 'openai';

export class GroqProvider {
  private client: OpenAI;

  constructor(private apiKey: string) {
    this.client = new OpenAI({
      baseURL: 'https://api.groq.com/openai/v1',
      apiKey,
    });
  }

  getClient(): OpenAI {
    return this.client;
  }

  async generate(prompt: string, systemPrompt?: string) {
    return this.client.chat.completions.create({
      model: 'llama3-8b-8192',
      messages: [
        ...(systemPrompt ? [{ role: 'system' as const, content: systemPrompt }] : []),
        { role: 'user' as const, content: prompt },
      ],
      temperature: 0.7,
      max_tokens: 2000,
    });
  }

  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch('https://api.groq.com/openai/v1/models', {
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
        },
      });
      return response.ok;
    } catch {
      return false;
    }
  }
}
