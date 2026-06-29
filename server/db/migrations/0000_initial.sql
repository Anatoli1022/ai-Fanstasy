CREATE TABLE IF NOT EXISTS "users" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "email" varchar(255) NOT NULL,
    "password_hash" varchar(255) NOT NULL,
    "boosty_tier" integer DEFAULT 0 NOT NULL,
    "created_at" timestamp DEFAULT now() NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS "users_email_key" ON "users" ("email");

CREATE TABLE IF NOT EXISTS "relations" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "race1" varchar(50) NOT NULL,
    "race2" varchar(50) NOT NULL,
    "value" integer NOT NULL,
    "updated_at" timestamp DEFAULT now() NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS "relations_race_pair_idx" ON "relations" ("race1", "race2");
CREATE INDEX IF NOT EXISTS "relations_race1_idx" ON "relations" ("race1");
CREATE INDEX IF NOT EXISTS "relations_race2_idx" ON "relations" ("race2");

CREATE TABLE IF NOT EXISTS "worlds" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "user_id" uuid NOT NULL,
    "name" varchar(255) NOT NULL,
    "seed" bigint NOT NULL,
    "era" integer DEFAULT 1 NOT NULL,
    "state" jsonb DEFAULT '{}' NOT NULL,
    "created_at" timestamp DEFAULT now() NOT NULL,
    "last_active" timestamp DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "worlds_user_id_idx" ON "worlds" ("user_id");
CREATE INDEX IF NOT EXISTS "worlds_created_at_idx" ON "worlds" ("created_at");

ALTER TABLE "worlds" ADD CONSTRAINT "worlds_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE cascade;

CREATE TABLE IF NOT EXISTS "agents" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "world_id" uuid NOT NULL,
    "name" varchar(255) NOT NULL,
    "race" varchar(50) NOT NULL,
    "role" varchar(50) NOT NULL,
    "stats" jsonb DEFAULT '{}' NOT NULL,
    "position_x" integer NOT NULL,
    "position_y" integer NOT NULL
);

CREATE INDEX IF NOT EXISTS "agents_world_id_idx" ON "agents" ("world_id");
CREATE INDEX IF NOT EXISTS "agents_position_idx" ON "agents" ("world_id", "position_x", "position_y");

ALTER TABLE "agents" ADD CONSTRAINT "agents_world_id_worlds_id_fk" FOREIGN KEY ("world_id") REFERENCES "worlds"("id") ON DELETE cascade;

CREATE TABLE IF NOT EXISTS "events" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "world_id" uuid NOT NULL,
    "day" integer NOT NULL,
    "type" varchar(100) NOT NULL,
    "description" varchar(255) NOT NULL,
    "ai_generated" boolean DEFAULT false NOT NULL,
    "created_at" timestamp DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "events_world_id_idx" ON "events" ("world_id");
CREATE INDEX IF NOT EXISTS "events_world_day_idx" ON "events" ("world_id", "day");

ALTER TABLE "events" ADD CONSTRAINT "events_world_id_worlds_id_fk" FOREIGN KEY ("world_id") REFERENCES "worlds"("id") ON DELETE cascade;
