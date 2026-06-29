// scripts/init-db.ts
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from '../server/db/schema';
import bcrypt from 'bcrypt';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/ai_fantasy?schema=public'
});

const db = drizzle(pool, { schema });

async function init() {
  console.log('🚀 Initializing database...');

  try {
    // 1. Создаем тестового пользователя
    const email = 'admin@local.dev';
    const password = 'admin';
    const passwordHash = await bcrypt.hash(password, 10);

    console.log(`Creating user: ${email}...`);
    
    // Используем insert с игнорированием конфликтов, чтобы скрипт можно было запускать много раз
    await db.insert(schema.users).values({
      email,
      passwordHash,
      boostyTier: 1
    }).onConflictDoNothing();

    console.log('✅ User created (or already exists).');
    console.log('🎉 Database is ready!');
    
  } catch (error) {
    console.error('❌ Initialization failed:', error);
  } finally {
    await pool.end();
    process.exit(0);
  }
}

init();