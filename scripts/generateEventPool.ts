const fs = require('fs');
const path = require('path');

const outputPath = path.join(__dirname, '..', 'shared', 'types', 'event.ts');

const categories = ['nature', 'war', 'diplomacy', 'discovery', 'internal', 'divine', 'economy'];
const severities = ['minor', 'moderate', 'major', 'catastrophic'];
const races = ['elf', 'dwarf', 'orc', 'human', 'fae', 'troll'];

const events: any[] = [];
for (let i = 0; i < 200; i++) {
  events.push({
    id: `event-${i}`,
    category: categories[i % categories.length],
    severity: severities[Math.floor(Math.random() * severities.length)],
    races: [races[i % races.length], races[(i + 1) % races.length]],
  });
}

const content = `import type { Race } from './agent';

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

export const EVENT_POOL = ${JSON.stringify(events, null, 2)} as const;
`;

fs.writeFileSync(outputPath, content);
console.log('Generated event pool at', outputPath);
