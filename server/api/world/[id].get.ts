import { getWorldById, getAgentsByWorldId } from '../../db/queries';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default defineEventHandler(async (event) => {
  const worldId = getRouterParam(event, 'id');
  if (!worldId) throw createError({ statusCode: 400, statusMessage: 'World id required' });
  if (!UUID_REGEX.test(worldId)) throw createError({ statusCode: 400, statusMessage: 'Invalid world id format' });

  const world = await getWorldById(worldId);
  if (!world) throw createError({ statusCode: 404, statusMessage: 'World not found' });

  const agents = await getAgentsByWorldId(worldId);

  const worldState = {
    id: world.id,
    name: world.name,
    day: 1,
    era: world.era,
    seed: Number(world.seed),
    config: { width: 20, height: 20, maxAgents: 100, eventChance: 0.1 },
    cells: [],
    sprites: [],
    resources: {},
    leader: null,
    pendingQuotes: [],
    events: [],
    alive: true,
    players: [],
  };

  return { world: worldState, agents };
});
