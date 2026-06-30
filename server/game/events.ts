// server/game/events.ts
import { db } from "../db";
import { events as eventsTable } from "../db/schema";
import { eq } from "drizzle-orm";

export async function createWorldEvent(
  worldId: string,
  day: number,
  type: string,
  description: string,
) {
  const [event] = await db
    .insert(eventsTable)
    .values({
      worldId,
      day,
      type,
      description,
      aiGenerated: false,
    })
    .returning();

  return event;
}

export async function getRecentEvents(worldId: string, limit = 20) {
  return await db
    .select()
    .from(eventsTable)
    .where(eq(eventsTable.worldId, worldId))
    .orderBy(eventsTable.createdAt)
    .limit(limit);
}
