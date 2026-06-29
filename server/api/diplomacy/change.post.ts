import { changeRelation } from '#server/game/diplomacy';

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { race1, race2, delta } = body;

  if (!race1 || !race2 || delta == null) {
    throw createError({ statusCode: 400, statusMessage: 'race1, race2, and delta required' });
  }

  // Placeholder: load relations from DB
  const relations: any[] = [];
  const updated = changeRelation(relations, race1, race2, delta);
  return { relations: updated };
});
