export type WSMessageType =
  | 'join-world'
  | 'world-update'
  | 'agent-quote'
  | 'unique-event'
  | 'player-whisper';

export interface WSMessage {
  type: WSMessageType;
  payload: unknown;
  worldId: string;
  timestamp: number;
}

export interface JoinWorldMessage {
  type: 'join-world';
  payload: { playerId: string; worldId: string };
  worldId: string;
  timestamp: number;
}

export interface WorldUpdateMessage {
  type: 'world-update';
  payload: {
    day: number;
    tick: number;
    cells: Record<string, { owner: string | null; structure: string; agentCount: number }>;
    sprites: {
      id: string;
      x: number;
      y: number;
      race: string;
      role: string;
      state: string;
      animation: string;
    }[];
    resources: Record<string, Record<string, number>>;
  };
  worldId: string;
  timestamp: number;
}

export interface AgentQuoteMessage {
  type: 'agent-quote';
  payload: {
    agentId: string;
    agentName: string;
    race: string;
    quote: string;
    mood: string;
  };
  worldId: string;
  timestamp: number;
}

export interface UniqueEventMessage {
  type: 'unique-event';
  payload: {
    id: string;
    day: number;
    category: string;
    severity: string;
    title: string;
    description: string;
    races: string[];
    effects: { type: string; race?: string; value: number; description: string }[];
    quote?: string;
  };
  worldId: string;
  timestamp: number;
}

export interface PlayerWhisperMessage {
  type: 'player-whisper';
  payload: {
    playerId: string;
    message: string;
  };
  worldId: string;
  timestamp: number;
}
