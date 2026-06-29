export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { worldId, name, race, role, x, y } = body;

  if (!worldId || !name || !race || !role || x == null || y == null) {
    throw createError({
      statusCode: 400,
      statusMessage: "Missing required fields",
    });
  }

  const { createAgent } = await import("../../db/queries");
  const agent = await createAgent(worldId, name, race, role, x, y);
  return agent;
});
