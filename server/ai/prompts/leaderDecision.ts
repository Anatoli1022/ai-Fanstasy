export function getLeaderDecisionPrompt(
  leader: {
    name: string;
    race: string;
    mood: string;
    stats: { wisdom: number; charisma: number; might: number };
  },
  worldState: {
    day: number;
    resources: Record<string, Record<string, number>>;
    relations: Record<string, number>;
    threats: string[];
    opportunities: string[];
  }
): string {
  return `You are ${leader.name}, leader of the ${leader.race}. Your current mood: ${leader.mood}.
Stats: wisdom ${leader.stats.wisdom}, charisma ${leader.stats.charisma}, might ${leader.stats.might}.

World state day ${worldState.day}:
- Resources: ${JSON.stringify(worldState.resources)}
- Relations: ${JSON.stringify(worldState.relations)}
- Threats: ${worldState.threats.join(', ') || 'None'}
- Opportunities: ${worldState.opportunities.join(', ') || 'None'}

Options: expand, defend, raid, trade, build, research.

Rules:
- Output ONLY a valid JSON object.
- No markdown, no explanations.
- Choose exactly one action type.
- reasoning must reflect your race personality and current mood.

JSON schema:
{
  "type": "expand|defend|raid|trade|build|research",
  "targetRace": "string or null",
  "targetCell": { "x": number, "y": number } or null,
  "reasoning": "string"
}`;
}
