export type RelationStatus = 'allied' | 'neutral' | 'hostile';

export type Race = 'elf' | 'dwarf' | 'orc' | 'human' | 'fae' | 'troll';

export interface Relation {
  race1: Race;
  race2: Race;
  value: number;
  status: RelationStatus;
  lastUpdated: number;
}

export interface RelationChangePayload {
  race1: Race;
  race2: Race;
  delta: number;
  reason?: string;
}

export interface RelationResponse {
  relations: Array<{
    race1: Race;
    race2: Race;
    value: number;
    status: RelationStatus;
  }>;
}
