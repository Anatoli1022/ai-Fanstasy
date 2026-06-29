export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id');
  if (!id) throw createError({ statusCode: 400, statusMessage: 'Agent id required' });

  // Placeholder: real impl would fetch from DB
  // const agent = await getAgentById(id);
  return { id, name: 'Unknown', race: 'human', role: 'worker', health: 100 };
});
