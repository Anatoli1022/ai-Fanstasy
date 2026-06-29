import type { Race } from '#shared/types/agent';

export type RelationStatus = 'allied' | 'neutral' | 'hostile';

export interface Relation {
  race1: Race;
  race2: Race;
  value: number;
}

export const DEFAULT_RELATIONS: Relation[] = [
  { race1: 'elf', race2: 'dwarf', value: 0 },
  { race1: 'elf', race2: 'orc', value: -30 },
  { race1: 'elf', race2: 'human', value: 10 },
  { race1: 'elf', race2: 'fae', value: 20 },
  { race1: 'elf', race2: 'troll', value: -40 },
  { race1: 'dwarf', race2: 'orc', value: -20 },
  { race1: 'dwarf', race2: 'human', value: 10 },
  { race1: 'dwarf', race2: 'fae', value: 0 },
  { race1: 'dwarf', race2: 'troll', value: -20 },
  { race1: 'orc', race2: 'human', value: -50 },
  { race1: 'orc', race2: 'fae', value: -20 },
  { race1: 'orc', race2: 'troll', value: 30 },
  { race1: 'human', race2: 'fae', value: 10 },
  { race1: 'human', race2: 'troll', value: -30 },
  { race1: 'fae', race2: 'troll', value: -10 },
];

export function getRelationValue(relations: Relation[], race1: Race, race2: Race): number {
  if (race1 === race2) return 100;
  const rel = relations.find(
    (r) => (r.race1 === race1 && r.race2 === race2) || (r.race1 === race2 && r.race2 === race1)
  );
  return rel?.value ?? 0;
}

export function changeRelation(relations: Relation[], race1: Race, race2: Race, delta: number): Relation[] {
  if (race1 === race2) return relations;
  const existing = relations.find(
    (r) => (r.race1 === race1 && r.race2 === race2) || (r.race1 === race2 && r.race2 === race1)
  );
  if (existing) {
    existing.value = Math.max(-100, Math.min(100, existing.value + delta));
    return [...relations];
  }
  return [...relations, { race1, race2, value: Math.max(-100, Math.min(100, delta)) }];
}

export function getRelationStatus(value: number): RelationStatus {
  if (value < -50) return 'hostile';
  if (value > 80) return 'allied';
  return 'neutral';
}

export function allRelations(relations: Relation[]): Array<{ race1: Race; race2: Race; value: number; status: RelationStatus }> {
  return DEFAULT_RELATIONS.map((pair) => {
    const value = getRelationValue(relations, pair.race1, pair.race2);
    return {
      race1: pair.race1,
      race2: pair.race2,
      value,
      status: getRelationStatus(value),
    };
  });
}
