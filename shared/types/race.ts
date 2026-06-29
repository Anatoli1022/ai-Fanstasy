export type Race = 'elf' | 'dwarf' | 'orc' | 'human' | 'fae' | 'troll';

export const RACE_CONFIG: Record<Race, {
  name: string;
  description: string;
  color: string;
  startingBias: string[];
  strengths: string[];
  weaknesses: string[];
  leaderStyle: string;
  adjectives: string[];
}> = {
  elf: {
    name: 'Elves',
    description: 'Ancient forest dwellers attuned to nature magic.',
    color: '#4ade80',
    startingBias: ['forest'],
    strengths: ['magic', 'diplomacy', 'research'],
    weaknesses: ['might', 'resource_gathering'],
    leaderStyle: 'wise and patient',
    adjectives: ['ethereal', 'ancient', 'melancholy', 'serene'],
  },
  dwarf: {
    name: 'Dwarves',
    description: 'Stout mountain miners and master craftsmen.',
    color: '#f97316',
    startingBias: ['mountain'],
    strengths: ['crafting', 'mining', 'might'],
    weaknesses: ['magic', 'diplomacy'],
    leaderStyle: 'gruff and pragmatic',
    adjectives: ['stout', 'determined', 'crafty', 'proud'],
  },
  orc: {
    name: 'Orcs',
    description: 'Warrior clans driven by honor and conquest.',
    color: '#ef4444',
    startingBias: ['plains'],
    strengths: ['might', 'population', 'raiding'],
    weaknesses: ['magic', 'crafting', 'diplomacy'],
    leaderStyle: 'brash and honorable',
    adjectives: ['fierce', 'battle-hardened', 'loyal', 'aggressive'],
  },
  human: {
    name: 'Humans',
    description: 'Adaptable builders with rapid expansion capability.',
    color: '#fbbf24',
    startingBias: ['plains', 'forest'],
    strengths: ['adaptability', 'trade', 'research'],
    weaknesses: ['magic', 'defense'],
    leaderStyle: 'ambitious and resourceful',
    adjectives: ['cunning', 'driven', 'diverse', 'innovative'],
  },
  fae: {
    name: 'Fae',
    description: 'Trickster spirits of the wild with unpredictable magic.',
    color: '#a78bfa',
    startingBias: ['swamp', 'forest'],
    strengths: ['magic', 'subterfuge', 'research'],
    weaknesses: ['might', 'population', 'crafting'],
    leaderStyle: 'playful yet cunning',
    adjectives: ['trickster', 'luminous', 'enigmatic', 'chaotic'],
  },
  troll: {
    name: 'Trolls',
    description: 'Regenerating giants of the marshes and mountains.',
    color: '#22c55e',
    startingBias: ['swamp', 'mountain'],
    strengths: ['might', 'regeneration', 'territory'],
    weaknesses: ['magic', 'crafting', 'diplomacy', 'research'],
    leaderStyle: 'brutish but territorial',
    adjectives: ['massive', 'brutish', 'resilient', 'territorial'],
  },
};
