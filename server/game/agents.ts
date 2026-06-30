// server/game/agents.ts
import { db } from "../db";
import {
  agents as agentsTable,
  events as eventsTable,
  resources as resourcesTable,
} from "../db/schema";
import { eq, and, desc } from "drizzle-orm";

export interface AgentState {
  id: string;
  worldId: string;
  positionX: number;
  positionY: number;
  race: string;
  role: string;
  name: string;
  stats: Record<string, any>;
}

export interface WorldResource {
  id?: string;
  x: number;
  y: number;
  type: string;
  amount: number;
}

export interface WorldMap {
  resources: WorldResource[];
  territories: Record<
    string,
    { xMin: number; xMax: number; yMin: number; yMax: number }
  >;
  relations: Record<string, Record<string, "ally" | "neutral" | "hostile">>;
  warDeclarations: Array<{ attacker: string; defender: string; until: number }>;
}

// Расовые предрасположенности
const RACE_PREFERENCES: Record<string, string> = {
  dwarf: "iron",
  elf: "wood",
  orc: "gold",
  human: "food",
  fae: "gold",
  troll: "iron",
};

// Базовая агрессия расы (0-1, чем выше, тем агрессивнее)
const RACE_AGGRESSION: Record<string, number> = {
  orc: 0.8,
  troll: 0.6,
  human: 0.3,
  dwarf: 0.4,
  elf: 0.2,
  fae: 0.1,
};

// Логика принятия решений агентом
export function updateAgentLogic(
  agent: AgentState,
  map: WorldMap,
  allAgents: AgentState[],
) {
  let newX = agent.positionX;
  let newY = agent.positionY;
  let action = "idle";
  let thought = "";

  const hunger = agent.stats.hunger || 100;
  const health = agent.stats.health || 100;
  const inventory = agent.stats.inventory || {
    food: 0,
    wood: 0,
    iron: 0,
    gold: 0,
  };
  const rage = agent.stats.rage || 0; // Накопленная ярость (месть)

  const now = Date.now();
  const lastAttackTime = agent.stats.lastAttackTime || 0;
  const isReadyToAttack = now - lastAttackTime > 3000;

  // === МЁРТВЫЕ НЕ ДУМАЮТ ===
  if (health <= 0) {
    return {
      positionX: agent.positionX,
      positionY: agent.positionY,
      stats: { ...agent.stats, lastAction: "dead" },
      thought: `${agent.name} has fallen.`,
    };
  }

  // === ПОБЕГ ПРИ НИЗКОМ HP ===
  if (health < 25) {
    thought = `${agent.name} is fleeing in terror!`;
    action = "fleeing";
    const moveX = Math.floor(Math.random() * 5) - 2;
    const moveY = Math.floor(Math.random() * 5) - 2;
    newX = Math.max(0, Math.min(19, agent.positionX + moveX));
    newY = Math.max(0, Math.min(19, agent.positionY + moveY));

    return {
      positionX: newX,
      positionY: newY,
      stats: {
        ...agent.stats,
        lastAction: "fleeing",
        health: Math.min(100, health + 1),
        hunger: Math.max(0, hunger - 1),
      },
      thought,
    };
  }

  // === ГОЛОД ===
  if (hunger < 60 || inventory.food < 3) {
    const nearbyFood = findClosestResource(
      map.resources,
      "food",
      agent.positionX,
      agent.positionY,
      20,
    );
    if (nearbyFood) {
      const { dx, dy, reached } = calculateStep(
        agent.positionX,
        agent.positionY,
        nearbyFood.x,
        nearbyFood.y,
      );
      newX = Math.max(0, Math.min(19, agent.positionX + dx));
      newY = Math.max(0, Math.min(19, agent.positionY + dy));

      if (reached || (newX === nearbyFood.x && newY === nearbyFood.y)) {
        const gathered = Math.min(10, nearbyFood.amount);
        inventory.food += gathered;
        nearbyFood.amount -= gathered;
        thought = `${agent.name} gathers food`;
        action = "gathering";
      } else {
        thought = `${agent.name} seeks food`;
        action = "moving";
      }

      return {
        positionX: newX,
        positionY: newY,
        stats: {
          ...agent.stats,
          hunger: Math.max(0, hunger - 1),
          inventory,
          lastAction: action,
        },
        thought,
      };
    }
  }

  // === РАСОВАЯ РАБОТА ===
  const targetType = RACE_PREFERENCES[agent.race] || "food";
  const targetResource = findClosestResource(
    map.resources,
    targetType,
    agent.positionX,
    agent.positionY,
    10,
  );

  if (targetResource && targetResource.amount > 0) {
    const { dx, dy, reached } = calculateStep(
      agent.positionX,
      agent.positionY,
      targetResource.x,
      targetResource.y,
    );
    newX = Math.max(0, Math.min(19, agent.positionX + dx));
    newY = Math.max(0, Math.min(19, agent.positionY + dy));

    if (reached || (newX === targetResource.x && newY === targetResource.y)) {
      const gathered = Math.min(5, targetResource.amount);
      inventory[targetType] = (inventory[targetType] || 0) + gathered;
      targetResource.amount -= gathered;
      thought = `${agent.name} gathers ${targetType}`;
      action = "gathering";
    } else {
      thought = `${agent.name} moves to ${targetType}`;
      action = "moving";
    }

    return {
      positionX: newX,
      positionY: newY,
      stats: {
        ...agent.stats,
        hunger: Math.max(0, hunger - 1),
        inventory,
        lastAction: action,
      },
      thought,
    };
  }

  // === 🆕 НОВАЯ ЛОГИКА ВОЙНЫ ===
  const nearbyEnemies = allAgents.filter(
    (a) =>
      a.id !== agent.id &&
      a.race !== agent.race &&
      (a.stats.health || 100) > 0 &&
      Math.abs(a.positionX - agent.positionX) <= 2 &&
      Math.abs(a.positionY - agent.positionY) <= 2,
  );

  if (nearbyEnemies.length > 0 && isReadyToAttack) {
    const target = nearbyEnemies[0];
    const shouldFight = shouldAgentFight(agent, target, map, rage);

    if (shouldFight) {
      const damage = Math.floor(Math.random() * 15) + 5;
      const reason = getFightReason(agent, target, map, rage);

      thought = `${agent.name} (${agent.race}) attacks ${target.name}! ${reason}`;
      action = "combat";

      return {
        positionX: agent.positionX,
        positionY: agent.positionY,
        stats: {
          ...agent.stats,
          lastAction: "combat",
          lastAttackTime: now,
          target: target.id,
          damageDealt: damage,
          hunger: Math.max(0, hunger - 2),
          rage: Math.max(0, rage - 10), // Тратим ярость на удар
        },
        thought,
      };
    }
  }

  // === БЛУЖДАНИЕ ===
  const moveX = Math.floor(Math.random() * 3) - 1;
  const moveY = Math.floor(Math.random() * 3) - 1;
  newX = Math.max(0, Math.min(19, agent.positionX + moveX));
  newY = Math.max(0, Math.min(19, agent.positionY + moveY));
  thought = `${agent.name} wanders`;

  return {
    positionX: newX,
    positionY: newY,
    stats: {
      ...agent.stats,
      hunger: Math.max(0, hunger - 1),
      health: Math.min(100, health + 1),
      inventory,
      rage: Math.max(0, rage - 1), // Ярость постепенно спадает
      lastAction: "wandering",
    },
    thought,
  };
}

// === 🆕 НОВАЯ ФУНКЦИЯ: Решение об атаке ===
function shouldAgentFight(
  agent: AgentState,
  target: AgentState,
  map: WorldMap,
  rage: number,
): boolean {
  const relation = getRelation(agent.race, target.race, map);

  // 1. Если расы в состоянии войны — ВСЕГДА атакуем
  if (relation === "hostile") return true;

  // 2. Если расы в союзе — НИКОГДА не атакуем
  if (relation === "ally") return false;

  // 3. Защита территории: враг на нашей земле
  const myTerritory = map.territories[agent.race];
  if (
    myTerritory &&
    isInTerritory(target.positionX, target.positionY, myTerritory)
  ) {
    return true; // Защищаем родные земли!
  }

  // 4. Месть: если накоплена ярость (убили сородича)
  if (rage > 50) return true;

  // 5. Базовая агрессия расы (шанс)
  const aggression = RACE_AGGRESSION[agent.race] || 0.3;
  return Math.random() < aggression;
}

// === 🆕 ФУНКЦИЯ: Причина атаки (для красивых логов) ===
function getFightReason(
  agent: AgentState,
  target: AgentState,
  map: WorldMap,
  rage: number,
): string {
  const relation = getRelation(agent.race, target.race, map);
  if (relation === "hostile") return "⚔️ By order of war!";

  const myTerritory = map.territories[agent.race];
  if (
    myTerritory &&
    isInTerritory(target.positionX, target.positionY, myTerritory)
  ) {
    return "🛡️ Defending homeland!";
  }

  if (rage > 50) return "💢 For vengeance!";

  return "";
}

// === 🆕 ФУНКЦИЯ: Получение отношений между расами ===
function getRelation(
  race1: string,
  race2: string,
  map: WorldMap,
): "ally" | "neutral" | "hostile" {
  // Проверяем активные объявления войны
  const now = Date.now();
  const activeWar = map.warDeclarations.find(
    (w) =>
      ((w.attacker === race1 && w.defender === race2) ||
        (w.attacker === race2 && w.defender === race1)) &&
      w.until > now,
  );
  if (activeWar) return "hostile";

  // Проверяем базовые отношения
  return map.relations[race1]?.[race2] || "neutral";
}

// === 🆕 ФУНКЦИЯ: Проверка, находится ли точка в территории ===
function isInTerritory(
  x: number,
  y: number,
  territory: { xMin: number; xMax: number; yMin: number; yMax: number },
): boolean {
  return (
    x >= territory.xMin &&
    x <= territory.xMax &&
    y >= territory.yMin &&
    y <= territory.yMax
  );
}

// === Вспомогательные функции ===

function findClosestResource(
  resources: WorldResource[],
  type: string,
  x: number,
  y: number,
  maxDistance: number,
): WorldResource | null {
  let closest: WorldResource | null = null;
  let minDist = Infinity;

  for (const r of resources) {
    if (r.type !== type || r.amount <= 0) continue;
    const dist = Math.abs(r.x - x) + Math.abs(r.y - y);
    if (dist <= maxDistance && dist < minDist) {
      minDist = dist;
      closest = r;
    }
  }
  return closest;
}

function calculateStep(fromX: number, fromY: number, toX: number, toY: number) {
  const dx = Math.sign(toX - fromX);
  const dy = Math.sign(toY - fromY);
  const reached = fromX === toX && fromY === toY;
  return { dx, dy, reached };
}

// === ОБНОВЛЕНИЕ: Теперь накапливаем ярость при смерти сородича ===
export async function updateWorldAgents(worldId: string, map: WorldMap) {
  const allAgents = await db
    .select()
    .from(agentsTable)
    .where(eq(agentsTable.worldId, worldId));

  const updates = [];
  const combatEvents = [];
  const thoughts = [];
  const deadAgents: string[] = [];

  for (const agent of allAgents) {
    const result = updateAgentLogic(agent as any, map, allAgents as any[]);

    // Применяем урон
    if (result.stats.lastAction === "combat" && result.stats.target) {
      const targetAgent = allAgents.find((a) => a.id === result.stats.target);
      if (targetAgent) {
        const newHealth = Math.max(
          0,
          (targetAgent.stats.health || 100) - result.stats.damageDealt,
        );
        targetAgent.stats.health = newHealth;

        // 🆕 Если цель умирает, её сородичи получают ярость
        if (newHealth <= 0) {
          deadAgents.push(targetAgent.id);
          // Накапливаем ярость у всех живых сородичей рядом
          for (const ally of allAgents) {
            if (
              ally.race === targetAgent.race &&
              ally.id !== targetAgent.id &&
              (ally.stats.health || 100) > 0 &&
              Math.abs(ally.positionX - targetAgent.positionX) <= 5 &&
              Math.abs(ally.positionY - targetAgent.positionY) <= 5
            ) {
              ally.stats.rage = (ally.stats.rage || 0) + 30;
            }
          }
        }
      }

      combatEvents.push({
        attacker: agent.name,
        target: result.stats.target,
        damage: result.stats.damageDealt,
        race: agent.race,
      });
    }

    updates.push(
      db
        .update(agentsTable)
        .set({
          positionX: result.positionX,
          positionY: result.positionY,
          stats: result.stats,
        })
        .where(eq(agentsTable.id, agent.id)),
    );

    if (result.thought) thoughts.push(result.thought);
  }

  // Удаляем мёртвых
  for (const deadId of deadAgents) {
    await db.delete(agentsTable).where(eq(agentsTable.id, deadId));
    thoughts.push(`💀 A warrior has fallen. Their kin are enraged!`);
  }

  // Обновляем ресурсы
  for (const res of map.resources) {
    if (res.id) {
      await db
        .update(resourcesTable)
        .set({ amount: res.amount })
        .where(eq(resourcesTable.id, res.id));
    }
  }

  if (updates.length > 0) await Promise.all(updates);

  for (const combat of combatEvents) {
    await db.insert(eventsTable).values({
      worldId,
      day: 1,
      type: "combat",
      description: `${combat.attacker} (${combat.race}) dealt ${combat.damage} damage`,
      aiGenerated: false,
    });
  }

  const updatedAgents = await db
    .select()
    .from(agentsTable)
    .where(eq(agentsTable.worldId, worldId));

  return {
    agents: updatedAgents,
    thoughts,
    events: combatEvents,
    resources: map.resources,
  };
}

// server/game/agents.ts

export async function assignLeaders(worldId: string) {
  const races = ["elf", "dwarf", "orc", "human", "fae", "troll"];

  for (const race of races) {
    // Ищем самого "здорового" агента расы, который еще не лидер
    const candidates = await db
      .select()
      .from(agentsTable)
      .where(
        and(
          eq(agentsTable.worldId, worldId),
          eq(agentsTable.race, race),
          eq(agentsTable.role, "worker"), // Берем только рабочих
        ),
      )
      .orderBy(desc(agentsTable.stats)) // Сортируем (упрощенно)
      .limit(1);

    if (candidates.length > 0) {
      const leader = candidates[0];
      // Повышаем до лидера
      await db
        .update(agentsTable)
        .set({ role: "leader" })
        .where(eq(agentsTable.id, leader.id));

      console.log(`👑 Leader assigned for ${race}: ${leader.name}`);
    }
  }
}
