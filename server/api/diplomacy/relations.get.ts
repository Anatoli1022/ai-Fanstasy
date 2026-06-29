import { allRelations, DEFAULT_RELATIONS } from '#server/game/diplomacy';

export default defineEventHandler(async () => {
  // Placeholder: fetch relations from DB
  const relations: any[] = [];
  return { relations: allRelations(relations) };
});
