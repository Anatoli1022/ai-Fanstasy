import type { Race } from '#shared/types/agent';

export type AgentState = 'idle' | 'working' | 'moving' | 'resting' | 'combat' | 'dead';

export type AgentRole = 'warrior' | 'worker' | 'scout' | 'mage' | 'builder' | 'leader';

export interface AgentStateContext {
  state: AgentState;
  race: Race;
  role: AgentRole;
  health: number;
  hunger: number;
  target?: { x: number; y: number } | null;
}

export type Transition = (ctx: AgentStateContext) => AgentState;

export const transitions: Record<AgentState, Transition> = {
  idle: (ctx) => {
    if (ctx.hunger < 20) return 'resting';
    if (ctx.target) return 'moving';
    if (Math.random() < 0.1) return 'working';
    return 'idle';
  },
  working: (ctx) => {
    if (ctx.health < 20) return 'resting';
    if (ctx.hunger < 10) return 'resting';
    if (Math.random() < 0.05) return 'combat';
    return 'working';
  },
  moving: (ctx) => {
    if (!ctx.target) return 'idle';
    if (ctx.hunger < 15) return 'resting';
    if (ctx.health < 15) return 'resting';
    if (Math.random() < 0.02) return 'combat';
    return 'moving';
  },
  resting: (ctx) => {
    if (ctx.health > 80 && ctx.hunger > 50) return 'idle';
    return 'resting';
  },
  combat: (ctx) => {
    if (ctx.health <= 0) return 'dead';
    if (Math.random() < 0.3) return 'idle';
    return 'combat';
  },
  dead: () => 'dead',
};

export function updateFSM(ctx: AgentStateContext): AgentState {
  return transitions[ctx.state](ctx);
}
