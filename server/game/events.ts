import type { WorldState, WorldEvent } from '#shared/types/world';
import { getEventPrompt } from '../ai/prompts/eventGenerator';
import { getAIQueue } from '../ai/queue';
import { aiCache } from '../ai/cache';

export function rollEventChance(chance = 0.1): boolean {
  return Math.random() < chance;
}

export async function generateUniqueEvent(world: WorldState, forcedType?: string): Promise<WorldEvent | null> {
  const prompt = getEventPrompt(
    {
      day: world.day,
      era: world.era,
      races: Array.from(world.resources.keys()),
      recentEvents: world.events.slice(-5).map((e) => e.type),
      weather: 'clear',
    },
    forcedType
  );

  const cached = aiCache.get(prompt);
  if (cached) {
    return parseEvent(world.id, cached);
  }

  const queue = getAIQueue();
  const raw = await queue.add(prompt, 'You are a fantasy world event generator. Always output valid JSON.');
  aiCache.set(prompt, undefined, raw);

  return parseEvent(world.id, raw);
}

function parseEvent(worldId: string, raw: string): WorldEvent | null {
  try {
    const data = JSON.parse(raw) as Omit<WorldEvent, 'id' | 'worldId' | 'day' | 'resolved'>;
    return {
      ...data,
      id: `${worldId}-${Date.now()}`,
      worldId,
      day: 0,
      resolved: false,
    } as WorldEvent;
  } catch {
    return null;
  }
}

export function applyEventEffects(world: WorldState, event: WorldEvent) {
  if (!event.effects) return;

  for (const [race, changes] of Object.entries(event.effects.resources ?? {})) {
    if (!world.resources[race as any]) continue;
    for (const [resource, delta] of Object.entries(changes as Record<string, number>)) {
      world.resources[race as any][resource] = (world.resources[race as any][resource] || 0) + delta;
    }
  }

  for (const spawn of event.effects.agents?.spawn ?? []) {
    // handled in game loop via agent queue
  }

  for (const kill of event.effects.agents?.kill ?? []) {
    // handled in game loop
  }

  for (const [pair, delta] of Object.entries(event.effects.relations ?? {})) {
    // update relations in world context
  }

  for (const [race, territory] of Object.entries(event.effects.territory ?? {})) {
    // expand/shrink territory
  }
}
