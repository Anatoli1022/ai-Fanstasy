import type { Agent } from './agents';

export interface CraftingResult {
  success: boolean;
  message: string;
  consumed?: Record<string, number>;
  produced?: Record<string, number>;
}

export function canCraft(agent: Agent, recipe: {
  ingredients: Array<{ item: string; count: number }>;
}): boolean {
  for (const ingredient of recipe.ingredients) {
    const have = agent.inventory[ingredient.item] || 0;
    if (have < ingredient.count) return false;
  }
  return true;
}

export function performCraft(agent: Agent, recipe: {
  name: string;
  ingredients: Array<{ item: string; count: number }>;
  result: { item: string; count: number };
}): CraftingResult {
  if (!canCraft(agent, recipe)) {
    return { success: false, message: 'Missing ingredients' };
  }

  const consumed: Record<string, number> = {};
  for (const ingredient of recipe.ingredients) {
    agent.inventory[ingredient.item] -= ingredient.count;
    consumed[ingredient.item] = ingredient.count;
  }

  agent.inventory[recipe.result.item] = (agent.inventory[recipe.result.item] || 0) + recipe.result.count;

  return {
    success: true,
    message: `Crafted ${recipe.name}`,
    consumed,
    produced: { [recipe.result.item]: recipe.result.count },
  };
}
