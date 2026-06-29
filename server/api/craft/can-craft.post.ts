import { canCraft } from '#server/game/crafting';

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { agentId, recipeName } = body;

  if (!agentId || !recipeName) {
    throw createError({ statusCode: 400, statusMessage: 'agentId and recipeName required' });
  }

  const recipes = (await import('#shared/types/crafting')).RECIPES;
  const recipe = recipes.find((r) => r.name === recipeName);
  if (!recipe) {
    throw createError({ statusCode: 404, statusMessage: 'Recipe not found' });
  }

  // Placeholder: fetch agent from DB
  const agent = {
    id: agentId,
    inventory: { wood: 0, iron: 0, gold: 0, mana_crystal: 0, herb: 0 },
  };

  return { canCraft: canCraft(agent as any, recipe) };
});
