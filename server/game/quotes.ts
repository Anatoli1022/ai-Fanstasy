import { getQuotePrompt } from '../ai/prompts/quotes';
import { getAIQueue } from '../ai/queue';

export interface Quote {
  agentId: string;
  agentName: string;
  race: string;
  quote: string;
  mood: string;
  timestamp: number;
}

export async function generateAgentQuote(params: {
  agentName: string;
  race: string;
  role: string;
  mood: string;
  recentEvent?: string;
}): Promise<Quote> {
  const prompt = getQuotePrompt(params);

  const queue = getAIQueue();
  const raw = await queue.add(prompt, 'You are a fantasy NPC quote generator. Always output valid JSON.');

  try {
    const data = JSON.parse(raw) as { quote: string };
    return {
      agentId: '',
      agentName: params.agentName,
      race: params.race,
      quote: data.quote,
      mood: params.mood,
      timestamp: Date.now(),
    };
  } catch {
    return {
      agentId: '',
      agentName: params.agentName,
      race: params.race,
      quote: '...',
      mood: params.mood,
      timestamp: Date.now(),
    };
  }
}

export function rollQuoteChance(ticksSinceLastQuote: number): boolean {
  return ticksSinceLastQuote > 30 && Math.random() < 0.3;
}
