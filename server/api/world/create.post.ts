// server/api/world/create.post.ts
import { readBody } from "h3";
import { db } from "../../db";
import {
  worlds,
  agents as agentsTable,
  resources as resourcesTable,
} from "../../db/schema";
import { startWorldLoop } from "../../game/loop";
import { assignLeaders } from "../../game/agents";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const worldName = body.name || "New World";
  const worldId = crypto.randomUUID();

  // 1. Создаем мир
  await db.insert(worlds).values({
    id: worldId,
    name: worldName,
    userId: null,
    seed: Math.floor(Math.random() * 1000000),
    era: 1,
    state: {},
  });

  // 2. Генерируем ресурсы (Биомы)
  const resourcesToCreate = [];

  // 🏔️ Горы (Железо) - ВЕРХНИЙ ЛЕВЫЙ угол (0-4, 0-4)
  for (let i = 0; i < 6; i++) {
    resourcesToCreate.push({
      worldId,
      x: Math.floor(Math.random() * 5),
      y: Math.floor(Math.random() * 5),
      type: "iron",
      amount: 100,
    });
  }

  // 🌲 Лес (Дерево) - ВЕРХНИЙ ПРАВЫЙ угол (16-19, 0-4)
  for (let i = 0; i < 6; i++) {
    resourcesToCreate.push({
      worldId,
      x: 16 + Math.floor(Math.random() * 4),
      y: Math.floor(Math.random() * 5),
      type: "wood",
      amount: 100,
    });
  }

  // 🏚️ Болота (Золото) - НИЖНИЙ ЛЕВЫЙ угол (0-4, 16-19)
  for (let i = 0; i < 4; i++) {
    resourcesToCreate.push({
      worldId,
      x: Math.floor(Math.random() * 5),
      y: 16 + Math.floor(Math.random() * 4),
      type: "gold",
      amount: 50,
    });
  }

  // 🏰 Равнины (Еда) - НИЖНИЙ ПРАВЫЙ угол (16-19, 16-19)
  for (let i = 0; i < 4; i++) {
    resourcesToCreate.push({
      worldId,
      x: 16 + Math.floor(Math.random() * 4),
      y: 16 + Math.floor(Math.random() * 4),
      type: "food",
      amount: 80,
    });
  }

  // 🍞 НЕЙТРАЛЬНАЯ ЗОНА (Еда) - ЦЕНТР (7-13, 7-13)
  for (let i = 0; i < 10; i++) {
    resourcesToCreate.push({
      worldId,
      x: 7 + Math.floor(Math.random() * 7),
      y: 7 + Math.floor(Math.random() * 7),
      type: "food",
      amount: 60,
    });
  }

  if (resourcesToCreate.length > 0) {
    await db.insert(resourcesTable).values(resourcesToCreate);
  }

  // 3. Создаем агентов в их "родных" зонах (углы карты)
  const races = [
    { name: "dwarf", xMin: 0, xMax: 4, yMin: 0, yMax: 4 }, // 🏔️ Верх-лево
    { name: "elf", xMin: 16, xMax: 19, yMin: 0, yMax: 4 }, // 🌲 Верх-право
    { name: "orc", xMin: 0, xMax: 4, yMin: 16, yMax: 19 }, // 🏚️ Низ-лево
    { name: "human", xMin: 16, xMax: 19, yMin: 16, yMax: 19 }, // 🏰 Низ-право
  ];

  const agentsToCreate = [];

  for (const raceConfig of races) {
    for (let i = 0; i < 4; i++) {
      const x =
        raceConfig.xMin +
        Math.floor(Math.random() * (raceConfig.xMax - raceConfig.xMin + 1));
      const y =
        raceConfig.yMin +
        Math.floor(Math.random() * (raceConfig.yMax - raceConfig.yMin + 1));

      agentsToCreate.push({
        id: crypto.randomUUID(),
        worldId,
        name: `${raceConfig.name}-${i}`,
        race: raceConfig.name,
        role: "worker",
        positionX: x,
        positionY: y,
        stats: {
          health: 100,
          hunger: 100,
          inventory: { food: 0, wood: 0, iron: 0, gold: 0 },
        },
      });
    }
  }

  if (agentsToCreate.length > 0) {
    await db.insert(agentsTable).values(agentsToCreate);
  }

  // 4. Назначаем лидеров
  await assignLeaders(worldId);

  // 5. Запускаем игровой цикл
  startWorldLoop(worldId);

  return { id: worldId, name: worldName };
});
