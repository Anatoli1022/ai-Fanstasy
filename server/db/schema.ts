import {
  pgTable,
  uuid,
  varchar,
  integer,
  bigint,
  timestamp,
  jsonb,
  index,
  unique,
  primaryKey,
  boolean,
} from 'drizzle-orm/pg-core';
import { relations as drizzleRelations } from 'drizzle-orm/relations';

export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: varchar('password_hash', { length: 255 }).notNull(),
  boostyTier: integer('boosty_tier').default(0).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const worlds = pgTable(
  'worlds',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    name: varchar('name', { length: 255 }).notNull(),
    seed: bigint('seed', { mode: 'number' }).notNull(),
    era: integer('era').default(1).notNull(),
    state: jsonb('state')
      .$type<Record<string, unknown>>()
      .default({})
      .notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    lastActive: timestamp('last_active').defaultNow().notNull(),
  },
  (table) => ({
    userIdIdx: index('worlds_user_id_idx').on(table.userId),
    createdAtIdx: index('worlds_created_at_idx').on(table.createdAt),
  })
);

export const agents = pgTable(
  'agents',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    worldId: uuid('world_id')
      .notNull()
      .references(() => worlds.id, { onDelete: 'cascade' }),
    name: varchar('name', { length: 255 }).notNull(),
    race: varchar('race', { length: 50 }).notNull(),
    role: varchar('role', { length: 50 }).notNull(),
    stats: jsonb('stats')
      .$type<Record<string, unknown>>()
      .default({})
      .notNull(),
    positionX: integer('position_x').notNull(),
    positionY: integer('position_y').notNull(),
  },
  (table) => ({
    worldIdIdx: index('agents_world_id_idx').on(table.worldId),
    positionIdx: index('agents_position_idx').on(
      table.worldId,
      table.positionX,
      table.positionY
    ),
  })
);

export const events = pgTable(
  'events',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    worldId: uuid('world_id')
      .notNull()
      .references(() => worlds.id, { onDelete: 'cascade' }),
    day: integer('day').notNull(),
    type: varchar('type', { length: 100 }).notNull(),
    description: varchar('description', { length: 255 }).notNull(),
    aiGenerated: boolean('ai_generated').default(false).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => ({
    worldIdIdx: index('events_world_id_idx').on(table.worldId),
    worldDayIdx: index('events_world_day_idx').on(table.worldId, table.day),
  })
);

export const relations = pgTable(
  'relations',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    race1: varchar('race1', { length: 50 }).notNull(),
    race2: varchar('race2', { length: 50 }).notNull(),
    value: integer('value').notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => ({
    racePairIdx: unique('relations_race_pair_idx').on(
      table.race1,
      table.race2
    ),
    race1Idx: index('relations_race1_idx').on(table.race1),
    race2Idx: index('relations_race2_idx').on(table.race2),
  })
);

export const usersRelations = drizzleRelations(users, ({ many }) => ({
  worlds: many(worlds),
}));

export const worldsRelations = drizzleRelations(worlds, ({ one, many }) => ({
  user: one(users, {
    fields: [worlds.userId],
    references: [users.id],
  }),
  agents: many(agents),
  events: many(events),
}));

export const agentsRelations = drizzleRelations(agents, ({ one }) => ({
  world: one(worlds, {
    fields: [agents.worldId],
    references: [worlds.id],
  }),
}));

export const eventsRelations = drizzleRelations(events, ({ one }) => ({
  world: one(worlds, {
    fields: [events.worldId],
    references: [worlds.id],
  }),
}));

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type World = typeof worlds.$inferSelect;
export type NewWorld = typeof worlds.$inferInsert;

export type Agent = typeof agents.$inferSelect;
export type NewAgent = typeof agents.$inferInsert;

export type Event = typeof events.$inferSelect;
export type NewEvent = typeof events.$inferInsert;

export type Relation = typeof relations.$inferSelect;
export type NewRelation = typeof relations.$inferInsert;
