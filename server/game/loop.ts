import type { WorldState, WorldEvent } from './world';
import { createWorld, serializeWorldState } from './world';
import { tickAgent } from './agents';
import { rollEventChance, generateUniqueEvent, applyEventEffects } from './events';
import { rollQuoteChance, generateAgentQuote } from './quotes';
import { requestLeaderDecision } from './leaders';
import { worldScheduler } from './scheduler';
import { socketServer } from '../ws';
import { db } from '../db';

export type GameLoopHooks = {
  onTick?: (world: WorldState) => void;
  onDay?: (world: WorldState) => void;
  onEvent?: (world: WorldState, event: WorldEvent) => void;
  onQuote?: (world: WorldState, quote: ReturnType<typeof generateAgentQuote>) => void;
};

export function startWorldLoop(id: string, config: { width: number; height: number; tickRate: number; dayLength: number } = { width: 20, height: 20, tickRate: 1000, dayLength: 60 }) {
  const world = createWorld(id, config);

  worldScheduler.scheduleWorld(id, config.tickRate, (payload) => {
    if (!world.alive) {
      worldScheduler.clearWorld(id);
      return;
    }

    world.tick = payload.tick;
    world.day = payload.day;
    world.updatedAt = Date.now();

    // 1. Update agents
    const blocked = new Set<string>();
    for (const sprite of world.sprites.values()) {
      blocked.add(`${sprite.x},${sprite.y}`);
    }

    // In a real impl you'd iterate over agents array here.
    // Placeholder for agent tick logic.
    for (const [agentId, sprite] of world.sprites) {
      // apply FSM / hunger / movement
    }

    // 2. Check for events
    if (rollEventChance()) {
      handleWorldEvent(world);
    }

    // 3. Generate quotes occasionally
    if (rollQuoteChance(world.tick)) {
      handleAgentQuote(world);
    }

    // 4. Leader decisions every day
    if (world.tick % config.dayLength === 0) {
      handleDayUpdate(world);
    }

    const snapshot = serializeWorldState(world);
    socketServer.toWorld(id, {
      type: 'world-update',
      worldId: id,
      timestamp: Date.now(),
      payload: {
        day: world.day,
        tick: world.tick,
        cells: Array.from(world.cells.entries()),
        sprites: Array.from(world.sprites.values()).map((s) => ({ ...s })),
        resources: world.resources,
      },
    });

    // Persist world state to DB (placeholder — add real serialization)
    // await db.update(world);
  });

  return world;
}

async function handleWorldEvent(world: WorldState) {
  const event = await generateUniqueEvent(world);
  if (!event) return;
  world.events.push(event);
  applyEventEffects(world, event);

  socketServer.toWorld(world.id, {
    type: 'unique-event',
    worldId: world.id,
    timestamp: Date.now(),
    payload: event,
  });
}

async function handleDayUpdate(world: WorldState) {
  if (!world.leader) return;
  const decision = await requestLeaderDecision(world.leader, {
    resources: world.resources,
    relations: {},
    threats: [],
    opportunities: [],
  });

  // Apply decision logic based on decision.type
}
