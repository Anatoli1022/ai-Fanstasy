export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { worldId, forcedType } = body;

  if (!worldId) {
    throw createError({ statusCode: 400, statusMessage: "worldId required" });
  }

  // Placeholder: real impl would fetch WorldState from DB
  const worldState = {
    day: 1,
    era: 1,
    races: ["elf", "dwarf", "orc", "human", "fae", "troll"],
    recentEvents: [],
    weather: "clear",
  };

  const { generateUniqueEvent } = await import("../../game/events");
  const gameEvent = await generateUniqueEvent(worldState as any, forcedType);

  if (!gameEvent) {
    return { event: null };
  }

  return { event: gameEvent };
});
