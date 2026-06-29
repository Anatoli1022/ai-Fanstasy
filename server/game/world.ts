import type { Race } from '#shared/types/agent';

export interface WorldState {
  id: string;
  name: string;
  seed: number;
  day: number;
  tick: number;
  tickRate: number;
  dayLength: number;
  era: number;
  config: {
    width: number;
    height: number;
    maxAgents: number;
    eventChance: number;
  };
  cells: Map<string, { owner: Race | null; structure: string; agentCount: number }>;
  sprites: Map<string, { id: string; x: number; y: number; race: Race; role: string; state: string; animation: string }>;
  resources: Record<Race, Record<string, number>>;
  leader: { id: string; name: string; race: Race; mood: string } | null;
  orderQueue: Array<{ agentId: string; type: string; target?: { x: number; y: number } }>;
  events: Array<{ id: string; day: number; type: string; description: string; resolved: boolean }>;
  pendingQuotes: Array<{ agentId: string; agentName: string; race: Race; quote: string; mood: string }>;
  alive: boolean;
  running: boolean;
  options: { maxPlayers: number; allowPvP: boolean; difficulty: number };
  players: Map<string, { id: string; name: string; joinedAt: number }>;
  createdAt: number;
  updatedAt: number;
  startedAt?: number;
}

export type WorldEventType =
  | 'nature'
  | 'war'
  | 'diplomacy'
  | 'discovery'
  | 'internal'
  | 'divine'
  | 'economy';

export interface WorldEvent {
  id: string;
  worldId: string;
  day: number;
  category: WorldEventType;
  severity: 'minor' | 'moderate' | 'major' | 'catastrophic';
  title: string;
  description: string;
  races: Race[];
  effects: { type: string; race?: Race; value: number; description: string }[];
  quote?: string;
  resolved: boolean;
}

export interface WorldConfig {
  width: number;
  height: number;
  seed: number;
  tickRate: number;
  dayLength: number;
  maxAgents: number;
  eventChance: number;
  maxPlayers: number;
  allowPvP: boolean;
  difficulty: number;
}

export function createWorld(id: string, config: WorldConfig, name = 'Unnamed World', seed = Math.floor(Math.random() * 1000000)): WorldState {
  const cells = new Map<string, { owner: Race | null; structure: string; agentCount: number }>();
  const sprites = new Map<string, { id: string; x: number; y: number; race: Race; role: string; state: string; animation: string }>();

  for (let y = 0; y < config.height; y++) {
    for (let x = 0; x < config.width; x++) {
      cells.set(`${x},${y}`, {
        owner: null,
        structure: 'none',
        agentCount: 0,
      });
    }
  }

  const resources: Record<string, Record<string, number>> = {};
  for (const race of ['elf', 'dwarf', 'orc', 'human', 'fae', 'troll']) {
    resources[race as Race] = {
      food: 100,
      wood: 50,
      stone: 50,
      gold: 20,
      magic: race === 'fae' || race === 'elf' ? 50 : 10,
      ore: race === 'dwarf' ? 50 : 10,
    };
  }

  return {
    id,
    name,
    seed,
    day: 1,
    tick: 0,
    tickRate: config.tickRate || 1000,
    dayLength: config.dayLength || 60,
    era: 1,
    config: {
      width: config.width || 20,
      height: config.height || 20,
      maxAgents: config.maxAgents || 100,
      eventChance: config.eventChance || 0.1,
    },
    cells,
    sprites,
    resources,
    leader: null,
    orderQueue: [],
    events: [],
    pendingQuotes: [],
    alive: true,
    running: false,
    options: {
      maxPlayers: config.maxPlayers || 4,
      allowPvP: config.allowPvP ?? false,
      difficulty: config.difficulty || 1,
    },
    players: new Map(),
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
}

export interface SerializedWorldState {
  id: string;
  name: string;
  day: number;
  tick: number;
  era: number;
  config: WorldConfig;
  cells: Array<{ key: string; owner: Race | null; structure: string; agentCount: number }>;
  sprites: Array<{ id: string; x: number; y: number; race: Race; role: string; state: string; animation: string }>;
  resources: Record<Race, Record<string, number>>;
  leader: { id: string; name: string; race: Race; mood: string } | null;
  pendingQuotes: Array<{ agentId: string; agentName: string; race: Race; quote: string; mood: string }>;
  events: Array<{ id: string; day: number; type: string; description: string; resolved: boolean }>;
  alive: boolean;
  players: Array<{ id: string; name: string; joinedAt: number }>;
  startedAt?: number;
}

export function serializeWorldState(world: WorldState): SerializedWorldState {
  return {
    id: world.id,
    name: world.name,
    day: world.day,
    tick: world.tick,
    era: world.era,
    config: world.config,
    cells: Array.from(world.cells.entries()).map(([key, cell]) => ({ key, ...cell })),
    sprites: Array.from(world.sprites.values()),
    resources: world.resources,
    leader: world.leader,
    pendingQuotes: world.pendingQuotes,
    events: world.events.filter((e) => e.day === world.day).slice(-5),
    alive: world.alive,
    players: Array.from(world.players.values()),
    startedAt: world.startedAt,
  };
}
