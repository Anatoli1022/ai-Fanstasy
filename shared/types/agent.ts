export type Race = 'elf' | 'dwarf' | 'orc' | 'human' | 'fae' | 'troll';

export type ResourceType =
  | 'food'
  | 'wood'
  | 'stone'
  | 'gold'
  | 'magic'
  | 'ore';

export interface CellState {
  x: number;
  y: number;
  biome: 'plains' | 'forest' | 'mountain' | 'water' | 'desert' | 'swamp';
  owner: Race | null;
  structure: 'none' | 'village' | 'farm' | 'mine' | 'tower' | 'portal';
  agentCount: number;
}

export interface SpriteState {
  x: number;
  y: number;
  race: Race;
  role: 'leader' | 'builder' | 'farmer' | 'miner' | 'soldier';
  state: 'idle' | 'moving' | 'working' | 'fighting';
  targetX?: number;
  targetY?: number;
  animation: string;
}

export interface AgentTask {
  id: string;
  type: 'gather' | 'build' | 'scout' | 'attack' | 'defend' | 'craft';
  targetX: number;
  targetY: number;
  priority: number;
  status: 'pending' | 'active' | 'completed' | 'failed';
}
