import type { Race } from '#shared/types/agent';
import { getLeaderDecisionPrompt } from '../ai/prompts/leaderDecision';
import { getAIQueue } from '../ai/queue';

export interface LeaderState {
  id: string;
  name: string;
  race: Race;
  mood: 'content' | 'anxious' | 'ambitious' | 'vengeful' | 'curious' | 'tired';
  wisdom: number;
  charisma: number;
  might: number;
  personality: string;
}

export async function requestLeaderDecision(
  leader: LeaderState,
  worldState: {
    resources: Record<Race, Record<string, number>>;
    relations: Record<string, number>;
    threats: string[];
    opportunities: string[];
  }
) {
  const prompt = getLeaderDecisionPrompt(leader, {
    ...worldState,
    day: 1,
  });

  const queue = getAIQueue();
  const response = await queue.add(prompt, 'You are a fantasy civilization leader AI. Always output valid JSON.');
  try {
    return JSON.parse(response);
  } catch {
    return null;
  }
}

export function adjustMood(leader: LeaderState, events: Array<{ positive: boolean; severity: number }>): LeaderState {
  let score = 0;
  for (const e of events) {
    score += e.positive ? e.severity : -e.severity;
  }

  const currentMood = leader.mood;
  if (score > 5) {
    if (currentMood === 'anxious') return { ...leader, mood: 'curious' };
    if (currentMood === 'tired') return { ...leader, mood: 'content' };
  } else if (score < -5) {
    if (currentMood === 'content') return { ...leader, mood: 'anxious' };
    if (currentMood === 'curious') return { ...leader, mood: 'tired' };
  }

  return leader;
}
