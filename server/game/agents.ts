import type { Race, AgentTask } from '#shared/types/agent';
import { updateFSM } from './fsm';
import { moveTowards, aStar } from './pathfinding';

export interface Agent {
  id: string;
  worldId: string;
  name: string;
  race: Race;
  role: string;
  stats: Record<string, number>;
  positionX: number;
  positionY: number;
  health: number;
  hunger: number;
  state: 'idle' | 'working' | 'moving' | 'resting' | 'combat' | 'dead';
  inventory: Record<string, number>;
  goal?: { x: number; y: number } | null;
  path: { x: number; y: number }[];
  task: AgentTask | null;
}

export function createAgent(
  id: string,
  worldId: string,
  name: string,
  race: Race,
  role: string,
  x: number,
  y: number
): Agent {
  return {
    id,
    worldId,
    name,
    race,
    role,
    stats: { strength: 10, agility: 10, intelligence: 10 },
    positionX: x,
    positionY: y,
    health: 100,
    hunger: 80,
    state: 'idle',
    inventory: { wood: 0, iron: 0, gold: 0, mana_crystal: 0, herb: 0 },
    goal: null,
    path: [],
    task: null,
  };
}

export function tickAgent(agent: Agent, width: number, height: number, blocked: Set<string>): Agent {
  if (agent.state === 'dead') return agent;

  const ctx: AgentStateContext = {
    state: agent.state,
    race: agent.race,
    role: agent.role as AgentRole,
    health: agent.health,
    hunger: agent.hunger,
    target: agent.goal,
  };

  let newState = updateFSM(ctx);
  if (newState === 'dead') {
    return { ...agent, state: 'dead', health: 0 };
  }

  let positionX = agent.positionX;
  let positionY = agent.positionY;
  let goal = agent.goal;
  let path = agent.path;

  if (newState === 'moving' && goal) {
    if (path.length === 0) {
      const result = aStar(
        { x: positionX, y: positionY },
        goal,
        width,
        height,
        blocked
      );
      path = result ?? [];
    }

    if (path.length > 0) {
      const next = path[0];
      if (next.x === positionX && next.y === positionY) {
        path.shift();
      } else {
        positionX = next.x;
        positionY = next.y;
      }
    } else {
      goal = null;
      newState = 'idle';
    }
  }

  agent.hunger = Math.max(0, agent.hunger - 0.2);
  if (agent.hunger < 20) {
    agent.health = Math.max(0, agent.health - 0.5);
  }

  agent.health = Math.max(0, Math.min(100, agent.health));

  return {
    ...agent,
    state: newState,
    positionX,
    positionY,
    goal,
    path,
    health: agent.health,
    hunger: agent.hunger,
  };
}
