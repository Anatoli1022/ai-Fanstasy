import type { Race } from './agent';

export type EventSeverity = 'minor' | 'moderate' | 'major' | 'catastrophic';

export type EventCategory =
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
  category: EventCategory;
  severity: EventSeverity;
  title: string;
  description: string;
  races: Race[];
  effects: EventEffect[];
  quote?: string;
  resolved: boolean;
  metadata: Record<string, unknown>;
}

export interface EventEffect {
  type: 'resource' | 'mood' | 'population' | 'territory' | 'relation';
  race?: Race;
  value: number;
  description: string;
}

export interface EventChoice {
  id: string;
  eventId: string;
  label: string;
  description: string;
  requiredResource?: { type: string; amount: number };
  effects: EventEffect[];
}

export const EVENT_POOL: WorldEvent[] = [];
