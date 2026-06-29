import { db } from '../db/index';
import { users, worlds, agents, relations } from '../db/schema';

const seeds = [
  {
    email: 'king@elf.io',
    password: 'password',
    worldName: 'Luminara',
    seed: 12345,
    agentCount: 5,
  },
];

async function main() {
  for (const s of seeds) {
    const [user] = await db.insert(users).values({ email: s.email, passwordHash: s.password }).returning();
    const [world] = await db.insert(worlds).values({ userId: user.id, name: s.worldName, seed: BigInt(s.seed), era: 1 }).returning();

    for (let i = 0; i < s.agentCount; i++) {
      await db.insert(agents).values({
        worldId: world.id,
        name: `Agent ${i}`,
        race: 'elf',
        role: 'worker',
        positionX: Math.floor(Math.random() * 20),
        positionY: Math.floor(Math.random() * 20),
      });
    }

    for (let i = 0; i < seeds.length; i++) {
      await db.insert(relations).values({ race1: 'elf', race2: 'dwarf', value: Math.floor(Math.random() * 100) });
    }
  }

  console.log('Database seeded');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
