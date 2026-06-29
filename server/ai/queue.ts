import OpenAI from 'openai';

export class RequestQueue {
  private queue: Array<{
    resolve: (value: string) => void;
    reject: (error: Error) => void;
    prompt: string;
    systemPrompt?: string;
  }> = [];
  private processing = false;
  private concurrency: number;

  constructor(concurrency = 2) {
    this.concurrency = concurrency;
  }

  async add(prompt: string, systemPrompt?: string): Promise<string> {
    return new Promise((resolve, reject) => {
      this.queue.push({ resolve, reject, prompt, systemPrompt });
      this.process();
    });
  }

  private async process() {
    if (this.processing) return;
    this.processing = true;

    while (this.queue.length > 0) {
      const item = this.queue.shift();
      if (!item) break;

      try {
        const result = await this.execute(item.prompt, item.systemPrompt);
        item.resolve(result);
      } catch (error) {
        item.reject(error instanceof Error ? error : new Error(String(error)));
      }
    }

    this.processing = false;
  }

  private async execute(prompt: string, systemPrompt?: string): Promise<string> {
    const ollamaUrl = process.env.OLLAMA_URL || 'http://localhost:11434/v1';
    const groqKey = process.env.GROQ_API_KEY || '';

    const providers: Array<{ client: OpenAI; model: string; name: string }> = [
      { client: new OpenAI({ baseURL: ollamaUrl, apiKey: 'ollama' }), model: 'llama3', name: 'ollama' },
      { client: new OpenAI({ baseURL: 'https://api.groq.com/openai/v1', apiKey: groqKey }), model: 'llama3-8b-8192', name: 'groq' },
    ];

    for (const provider of providers) {
      try {
        const completion = await provider.client.chat.completions.create({
          model: provider.model,
          messages: [
            ...(systemPrompt ? [{ role: 'system' as const, content: systemPrompt }] : []),
            { role: 'user' as const, content: prompt },
          ],
          temperature: 0.7,
          max_tokens: 2000,
        });
        const content = completion.choices?.[0]?.message?.content;
        if (content) return content;
      } catch (error) {
        console.warn(`Provider ${provider.name} failed:`, error);
      }
    }

    throw new Error('All AI providers failed');
  }
}

let queueInstance: RequestQueue | null = null;

export function getAIQueue(): RequestQueue {
  if (!queueInstance) {
    queueInstance = new RequestQueue(2);
  }
  return queueInstance;
}
