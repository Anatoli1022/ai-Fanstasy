export function getEventPrompt(worldState: {
  day: number;
  era: number;
  races: string[];
  recentEvents: string[];
  weather: string;
}, eventType?: string): string {
  const types = eventType || 'nature, diplomacy, war, discovery, internal, divine, economy';
  return `You are the narrator of a fantasy civilization simulator.
Generate a unique world event for day ${worldState.day} in era ${worldState.era}.
Races present: ${worldState.races.join(', ')}.
Recent events: ${worldState.recentEvents.join('; ') || 'None'}.
Weather: ${worldState.weather}.

Event type: ${types}.

Rules:
- Output ONLY a valid JSON object.
- No markdown, no explanations, no leading/trailing text.
- Keep description to max 255 characters.
- Effects must be logical for the event type.
- Never introduce mechanics outside established lore.

JSON schema:
{
  "type": "discovery|war|diaster|diplomacy|invention|migration|mystical",
  "title": "string",
  "description": "string",
  "affectedRaces": ["string"],
  "effects": {
    "resources": { "race": { "resource": delta_number } },
    "agents": { "spawn": [{ "race": "string", "role": "string", "count": number }], "kill": [{ "race": "string", "count": number }] },
    "relations": { "race1|race2": delta_number },
    "territory": { "race": { "expand": number, "shrink": number } }
  },
  "visual": { "sprite": "string", "animation": "string", "duration": number },
  "narrative": "string"
}`;
}
