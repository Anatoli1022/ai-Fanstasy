export function getQuotePrompt(agent: {
  name: string;
  race: string;
  role: string;
  mood: string;
  recentEvent?: string;
}): string {
  return `Generate a short quote (5-12 words) spoken by ${agent.name}, a ${agent.role} of the ${agent.race}.
Current mood: ${agent.mood}.
${agent.recentEvent ? `Recent event: ${agent.recentEvent}.` : ''}

Rules:
- Output ONLY the quote as a single JSON object.
- No markdown, no explanations, no extra text.

JSON schema:
{
  "quote": "string"
}`;
}
