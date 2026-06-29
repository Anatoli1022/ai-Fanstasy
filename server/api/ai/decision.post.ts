export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { prompt, systemPrompt } = body;

  if (!prompt) {
    throw createError({ statusCode: 400, statusMessage: 'Prompt required' });
  }

  const { getAIService } = await import('../../utils/ai');
  const ai = getAIService();

  try {
    const content = await ai.askAI(prompt, systemPrompt);
    return { content };
  } catch (e) {
    throw createError({ statusCode: 500, statusMessage: 'AI request failed' });
  }
});
