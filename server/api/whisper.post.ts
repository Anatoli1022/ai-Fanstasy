// server/api/whisper.post.ts
import { readBody } from "h3";
import { askAI } from "../utils/ai"; // Теперь это сработает
import { createWorldEvent } from "../game/events";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { worldId, message, race } = body;

  if (!worldId || !message || !race) {
    throw createError({ statusCode: 400, statusMessage: "Missing parameters" });
  }

  const prompt = `You are the leader of the ${race} race. 
A spirit whispers: "${message}". 
Respond briefly (1 sentence).`;

  try {
    const response = await askAI(prompt);

    // Сохраняем ответ лидера в события
    await createWorldEvent(
      worldId,
      1,
      "leader_speech",
      `${race} Leader: ${response}`,
    );

    return { response };
  } catch (error) {
    throw createError({ statusCode: 500, statusMessage: "AI failed" });
  }
});
