export interface CraftingRecipe {
  name: string;
  ingredients: Array<{ item: string; count: number }>;
  result: { item: string; count: number };
  requiredRole?: string;
  description?: string;
}

export interface CraftingResult {
  success: boolean;
  message: string;
  consumed?: Record<string, number>;
  produced?: Record<string, number>;
  recipeName?: string;
}

export interface AgentInventory {
  items: Record<string, number>;
}

export const RECIPES: CraftingRecipe[] = [
  {
    name: 'Wooden Sword',
    description: 'A basic melee weapon for warriors',
    ingredients: [
      { item: 'wood', count: 3 },
    ],
    result: { item: 'wooden_sword', count: 1 },
    requiredRole: 'warrior',
  },
  {
    name: 'Iron Sword',
    description: 'A sturdy iron blade',
    ingredients: [
      { item: 'iron', count: 2 },
      { item: 'wood', count: 1 },
    ],
    result: { item: 'iron_sword', count: 1 },
    requiredRole: 'warrior',
  },
  {
    name: 'Health Potion',
    description: 'Restores health when consumed',
    ingredients: [
      { item: 'herb', count: 2 },
      { item: 'mana_crystal', count: 1 },
    ],
    result: { item: 'health_potion', count: 1 },
    requiredRole: 'mage',
  },
  {
    name: 'Iron Pickaxe',
    description: 'Used for mining ore',
    ingredients: [
      { item: 'iron', count: 2 },
      { item: 'wood', count: 1 },
    ],
    result: { item: 'iron_pickaxe', count: 1 },
    requiredRole: 'worker',
  },
  {
    name: 'Gold Ring',
    description: 'A decorative piece of jewelry',
    ingredients: [
      { item: 'gold', count: 2 },
    ],
    result: { item: 'gold_ring', count: 1 },
  },
  {
    name: 'Magic Staff',
    description: 'Amplifies magical abilities',
    ingredients: [
      { item: 'wood', count: 2 },
      { item: 'mana_crystal', count: 3 },
    ],
    result: { item: 'magic_staff', count: 1 },
    requiredRole: 'mage',
  },
];

export const RESOURCE_TYPES = [
  'wood',
  'iron',
  'gold',
  'mana_crystal',
  'herb',
] as const;

export type ResourceType = (typeof RESOURCE_TYPES)[number];

export const ITEMS: Record<string, { type: 'resource' | 'tool' | 'weapon' | 'consumable'; description: string }> = {
  wood: { type: 'resource', description: 'Basic building material' },
  iron: { type: 'resource', description: 'Metal for crafting' },
  gold: { type: 'resource', description: 'Precious metal' },
  mana_crystal: { type: 'resource', description: 'Magical energy source' },
  herb: { type: 'resource', description: 'Medicinal plant' },
  wooden_sword: { type: 'weapon', description: 'Basic melee weapon' },
  iron_sword: { type: 'weapon', description: 'Sturdy iron blade' },
  health_potion: { type: 'consumable', description: 'Restores health' },
  iron_pickaxe: { type: 'tool', description: 'Mining tool' },
  gold_ring: { type: 'tool', description: 'Decorative jewelry' },
  magic_staff: { type: 'weapon', description: 'Magical amplifier' },
};
