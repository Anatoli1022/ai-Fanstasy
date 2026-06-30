// server/game/loop.ts
import { eq } from "drizzle-orm";
import { db } from "../db";
import { resources as resourcesTable } from "../db/schema";
import { updateWorldAgents } from "./agents";
import { createWorldEvent } from "./events";
import { socketServer } from "../ws";

const activeLoops = new Map<string, NodeJS.Timeout>();
const worldDays = new Map<string, number>();
const worldMaps = new Map<string, any>();

export async function startWorldLoop(worldId: string) {
  if (activeLoops.has(worldId)) return;

  console.log(`🌍 Starting game loop for world: ${worldId}`);

  if (!worldMaps.has(worldId)) {
    const dbResources = await db
      .select()
      .from(resourcesTable)
      .where(eq(resourcesTable.worldId, worldId));

    // 👇 Инициализируем территории и отношения
    worldMaps.set(worldId, {
      resources: dbResources.map((r) => ({
        id: r.id,
        x: r.x,
        y: r.y,
        type: r.type,
        amount: r.amount,
      })),
      // 👇 НОВЫЕ ТЕРРИТОРИИ - углы карты
      territories: {
        dwarf: { xMin: 0, xMax: 5, yMin: 0, yMax: 5 }, // 🏔️ Верх-лево
        elf: { xMin: 15, xMax: 19, yMin: 0, yMax: 5 }, // 🌲 Верх-право
        orc: { xMin: 0, xMax: 5, yMin: 15, yMax: 19 }, // 🏚️ Низ-лево
        human: { xMin: 15, xMax: 19, yMin: 15, yMax: 19 }, // 🏰 Низ-право
      },
      relations: {
        dwarf: { elf: "neutral", orc: "hostile", human: "neutral" },
        elf: { dwarf: "neutral", orc: "hostile", human: "ally" },
        orc: { dwarf: "hostile", elf: "hostile", human: "hostile" },
        human: { dwarf: "neutral", elf: "ally", orc: "hostile" },
      },
      warDeclarations: [],
    });

    console.log(
      `🗺️ Loaded ${dbResources.length} resources for world ${worldId}`,
    );
  }

  worldDays.set(worldId, 1);
  let tickCount = 0;

  const interval = setInterval(async () => {
    try {
      const map = worldMaps.get(worldId)!;
      const day = worldDays.get(worldId)!;
      tickCount++;

      // Чистим устаревшие объявления войны
      const now = Date.now();
      map.warDeclarations = map.warDeclarations.filter(
        (w: any) => w.until > now,
      );

      const result = await updateWorldAgents(worldId, map);

      if (tickCount % 60 === 0) {
        const newDay = day + 1;
        worldDays.set(worldId, newDay);
        await createWorldEvent(
          worldId,
          newDay,
          "day_passed",
          `Day ${newDay} begins`,
        );
        console.log(`📅 Day changed to ${newDay}`);
      }

      if (tickCount % 10 === 0) {
        const leader = result.agents.find((a: any) => a.role === "leader");
        if (leader) {
          $fetch("/api/leader/decide", {
            method: "POST",
            body: {
              worldId,
              leaderName: leader.name,
              race: leader.race,
              recentEvents: result.thoughts.slice(0, 5),
            },
          })
            .then((res) => res.json())
            .then((data) => {
              console.log(`🧠 Leader ${leader.name} says: "${data.command}"`);
              result.thoughts.push(`👑 Leader ${leader.name}: ${data.command}`);
            })
            .catch((err) => console.error("AI Leader Error:", err));
        }
      }

      socketServer.toWorld(worldId, {
        type: "world-update",
        payload: {
          agents: result.agents,
          thoughts: result.thoughts,
          day: worldDays.get(worldId),
          resources: map.resources,
        },
      });
    } catch (error) {
      console.error(`Error in world loop ${worldId}:`, error);
    }
  }, 1000);

  activeLoops.set(worldId, interval);
}

// 🆕 Функция для объявления войны из API
export function declareWar(
  worldId: string,
  attacker: string,
  defender: string,
  durationMinutes: number = 5,
) {
  const map = worldMaps.get(worldId);
  if (!map) return false;

  const until = Date.now() + durationMinutes * 60 * 1000;
  map.warDeclarations.push({ attacker, defender, until });

  console.log(
    `⚔️ WAR DECLARED: ${attacker} vs ${defender} for ${durationMinutes} minutes`,
  );
  return true;
}

// 🆕 Функция для изменения отношений
export function setRelation(
  worldId: string,
  race1: string,
  race2: string,
  relation: "ally" | "neutral" | "hostile",
) {
  const map = worldMaps.get(worldId);
  if (!map) return false;

  if (!map.relations[race1]) map.relations[race1] = {};
  if (!map.relations[race2]) map.relations[race2] = {};

  map.relations[race1][race2] = relation;
  map.relations[race2][race1] = relation;

  console.log(`🤝 Relation set: ${race1} <-> ${race2} = ${relation}`);
  return true;
}

export function stopWorldLoop(worldId: string) {
  const interval = activeLoops.get(worldId);
  if (interval) {
    clearInterval(interval);
    activeLoops.delete(worldId);
    worldDays.delete(worldId);
    worldMaps.delete(worldId);
    console.log(`⏹ Stopped game loop for world: ${worldId}`);
  }
}
