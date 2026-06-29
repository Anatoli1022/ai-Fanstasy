// server/api/world/create.post.ts
import { readBody } from "h3";
import { getUserByEmail, createWorld } from "~/server/db/queries";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { name, seed, era } = body;

  if (!name || !seed) {
    throw createError({
      statusCode: 400,
      statusMessage: "Name and seed required",
    });
  }

  // 1. Находим нашего админа
  const user = await getUserByEmail("admin@local.dev");
  if (!user) {
    throw createError({
      statusCode: 500,
      statusMessage: "Admin user not found. Run init-db script.",
    });
  }

  // 2. Создаем мир от его имени
  const world = await createWorld(user.id, name, BigInt(seed), era ?? 1);

  return { id: world.id, name: world.name, seed: world.seed, era: world.era };
});
