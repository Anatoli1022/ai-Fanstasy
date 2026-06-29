import { eq, and, desc } from 'drizzle-orm';
import { db } from './index';
import { users, worlds, agents, events, relations } from './schema';

export async function createUser(email: string, passwordHash: string) {
  const [user] = await db.insert(users).values({ email, passwordHash }).returning();
  return user;
}

export async function getUserByEmail(email: string) {
  const [user] = await db.select().from(users).where(eq(users.email, email));
  return user;
}

export async function getWorldsByUserId(userId: string) {
  return db.select().from(worlds).where(eq(worlds.userId, userId)).orderBy(desc(worlds.lastActive));
}

export async function getWorldById(id: string) {
  const [world] = await db.select().from(worlds).where(eq(worlds.id, id));
  return world;
}

export async function getOrCreateAnonymousUser(): Promise<User> {
  const [existing] = await db.select().from(users).where(eq(users.email, 'anonymous@local'));
  if (existing) return existing;
  return (await db.insert(users).values({ email: 'anonymous@local', passwordHash: '' }).returning())[0];
}

export async function createWorld(userId: string, name: string, seed: bigint, era: number) {
  const [world] = await db
    .insert(worlds)
    .values({ userId, name, seed, era, state: {} })
    .returning();
  return world;
}

export async function getAgentsByWorldId(worldId: string) {
  return db.select().from(agents).where(eq(agents.worldId, worldId));
}

export async function createAgent(
  worldId: string,
  name: string,
  race: string,
  role: string,
  positionX: number,
  positionY: number
) {
  const [agent] = await db
    .insert(agents)
    .values({ worldId, name, race, role, positionX, positionY, stats: {} })
    .returning();
  return agent;
}

export async function getEventsByWorldId(worldId: string, limit = 50) {
  return db
    .select()
    .from(events)
    .where(eq(events.worldId, worldId))
    .orderBy(desc(events.createdAt))
    .limit(limit);
}

export async function createEvent(
  worldId: string,
  day: number,
  type: string,
  description: string,
  aiGenerated = false
) {
  const [event] = await db
    .insert(events)
    .values({ worldId, day, type, description, aiGenerated })
    .returning();
  return event;
}

export async function getRelation(race1: string, race2: string) {
  const [relation] = await db
    .select()
    .from(relations)
    .where(and(eq(relations.race1, race1), eq(relations.race2, race2)));
  return relation;
}

export async function upsertRelation(race1: string, race2: string, value: number) {
  const [relation] = await db
    .insert(relations)
    .values({ race1, race2, value })
    .onConflictDoUpdate({
      target: [relations.race1, relations.race2],
      set: { value },
    })
    .returning();
  return relation;
}
