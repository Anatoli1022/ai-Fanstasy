import OpenAI from 'openai';

export class OllamaProvider {
  private client: OpenAI;

  constructor(private baseUrl: string) {
    this.client = new OpenAI({
      baseURL: baseUrl,
      apiKey: 'ollama',
    });
  }

  getClient(): OpenAI {
    return this.client;
  }

  async generate(prompt: string, systemPrompt?: string) {
    return this.client.chat.completions.create({
      model: 'llama3',
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
      const response = await fetch(`${this.baseUrl.replace('/v1', '')}/api/tags`);
      return response.ok;
    } catch {
      return false;
    }
  }
}
