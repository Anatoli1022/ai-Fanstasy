type CacheEntry = {
  value: string;
  expiresAt: number;
};

export class AICache {
  private store = new Map<string, CacheEntry>();
  private ttlMs: number;

  constructor(ttlMs = 1000 * 60 * 60) {
    this.ttlMs = ttlMs;
  }

  private key(prompt: string, systemPrompt?: string): string {
    return `${systemPrompt ?? ''}\n${prompt}`;
  }

  get(prompt: string, systemPrompt?: string): string | null {
    const entry = this.store.get(this.key(prompt, systemPrompt));
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      this.store.delete(this.key(prompt, systemPrompt));
      return null;
    }
    return entry.value;
  }

  set(prompt: string, systemPrompt: string | undefined, value: string) {
    const entry: CacheEntry = {
      value,
      expiresAt: Date.now() + this.ttlMs,
    };
    this.store.set(this.key(prompt, systemPrompt), entry);
  }

  clear() {
    this.store.clear();
  }
}

export const aiCache = new AICache();
