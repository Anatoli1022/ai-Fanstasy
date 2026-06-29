import OpenAI from 'openai';
import { OllamaProvider } from '../ai/providers/ollama';
import { GroqProvider } from '../ai/providers/groq';

export interface AIResponse {
  content: string;
  provider: string;
  cached: boolean;
  latencyMs: number;
}

export class AIFallbackError extends Error {
  constructor(
    public message: string,
    public provider: string,
    public originalError?: Error
  ) {
    super(message);
    this.name = 'AIFallbackError';
  }
}

export class AIService {
  private providers: Array<{ client: OpenAI; name: string }> = [];

  constructor() {
    const ollamaUrl = process.env.OLLAMA_URL || 'http://localhost:11434/v1';
    const groqKey = process.env.GROQ_API_KEY || '';
    const providerEnv = process.env.AI_PROVIDER || 'ollama';

    const ollamaProvider = new OllamaProvider(ollamaUrl);
    const groqProvider = new GroqProvider(groqKey);

    if (providerEnv === 'ollama') {
      this.providers.push({ client: ollamaProvider.getClient(), name: 'ollama' });
      this.providers.push({ client: groqProvider.getClient(), name: 'groq' });
    } else {
      this.providers.push({ client: groqProvider.getClient(), name: 'groq' });
      this.providers.push({ client: ollamaProvider.getClient(), name: 'ollama' });
    }
  }

  async askAI(prompt: string, systemPrompt?: string): Promise<string> {
    return this.runWithFallback(prompt, systemPrompt);
  }

  async askAIForJSON<T>(
    prompt: string,
    systemPrompt?: string
  ): Promise<T> {
    const jsonSystemPrompt = systemPrompt || 'You are a JSON generator. Output only valid JSON, no markdown, no explanations.';

    const response = await this.runWithFallback(prompt, jsonSystemPrompt);

    const cleaned = this.extractJSON(response);
    try {
      return JSON.parse(cleaned) as T;
    } catch (error) {
      throw new AIFallbackError(
        `Failed to parse AI response as JSON: ${error}`,
        'parser',
        error instanceof Error ? error : new Error(String(error))
      );
    }
  }

  private async runWithFallback(
    prompt: string,
    systemPrompt?: string
  ): Promise<string> {
    const errors: AIFallbackError[] = [];

    for (const provider of this.providers) {
      try {
        const completion = await provider.client.chat.completions.create({
          model: provider.name === 'ollama' ? 'llama3' : 'llama3-8b-8192',
          messages: [
            ...(systemPrompt ? [{ role: 'system' as const, content: systemPrompt }] : []),
            { role: 'user' as const, content: prompt },
          ],
          temperature: 0.7,
          max_tokens: 2000,
        });

        const content = completion.choices?.[0]?.message?.content;
        if (!content) {
          throw new AIFallbackError('Empty response from provider', provider.name);
        }

        return content;
      } catch (error) {
        const aiError = new AIFallbackError(
          error instanceof Error ? error.message : String(error),
          provider.name,
          error instanceof Error ? error : new Error(String(error))
        );
        errors.push(aiError);
        console.warn(`Provider ${provider.name} failed:`, aiError.message);
      }
    }

    throw new AIFallbackError(
      `All providers failed: ${errors.map(e => `${e.provider}: ${e.message}`).join(', ')}`,
      'all'
    );
  }

  private extractJSON(text: string): string {
    const trimmed = text.trim();
    const jsonMatch = trimmed.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return jsonMatch[0];
    }
    const arrayMatch = trimmed.match(/\[[\s\S]*\]/);
    if (arrayMatch) {
      return arrayMatch[0];
    }
    return trimmed;
  }
}

let aiServiceInstance: AIService | null = null;

export function getAIService(): AIService {
  if (!aiServiceInstance) {
    aiServiceInstance = new AIService();
  }
  return aiServiceInstance;
}
