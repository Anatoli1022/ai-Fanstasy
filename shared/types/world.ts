import type { Race } from './agent';

export interface WorldConfig {
  width: number;
  height: number;
  seed: number;
  tickRate: number;
  maxTicksPerDay: number;
  dayLength: number;
}

export interface WorldState {
  id: string;
  config: WorldConfig;
  day: number;
  tick: number;
  cells: Map<string, import('./agent').CellState>;
  sprites: import('./agent').SpriteState[];
  resources: Record<Race, Record<string, number>>;
  leader: LeaderState | null;
  alive: boolean;
  createdBy: string;
  createdAt: Date;
}

export interface LeaderState {
  id: string;
  name: string;
  race: Race;
  personality: string;
  mood: 'content' | 'anxious' | 'ambitious' | 'vengeful' | 'curious' | 'tired';
  wisdom: number;
  charisma: number;
  might: number;
  decisions: LeaderDecision[];
}

export interface LeaderDecision {
  id: string;
  type: 'expand' | 'defend' | 'raid' | 'trade' | 'build' | 'research';
  targetRace?: Race;
  targetCell?: { x: number; y: number };
  reasoning: string;
  timestamp: Date;
  executed: boolean;
}
