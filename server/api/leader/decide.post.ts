// server/api/leader/decide.post.ts
import { readBody } from "h3";
import { declareWar } from "../../game/loop";

const conversationHistory = new Map<
  string,
  Array<{ role: string; content: string }>
>();

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { leaderName, race, recentEvents, worldId, message } = body;

  console.log(
    `📥 [API] Received request: leader=${leaderName}, race=${race}, worldId=${worldId}`,
  );

  if (!worldId || !race) {
    console.error(`❌ [API] Missing worldId or race`);
    return { command: "I do not know who I am." };
  }

  const historyKey = `${worldId}_${race}`;
  if (!conversationHistory.has(historyKey)) {
    conversationHistory.set(historyKey, []);
    console.log(`📝 [API] Created new history for ${historyKey}`);
  }
  const history = conversationHistory.get(historyKey)!;

  if (message) {
    history.push({ role: "user", content: message });
    console.log(`💬 [API] Added user message: "${message}"`);
  }

  const systemPrompt = `You are ${leaderName}, the wise leader of the ${race} race.
Current events: ${recentEvents ? recentEvents.join(", ") : "Peaceful times."}

Your goal is to guide your people. Keep responses short (under 15 words).
Respond in plain text as a strategic command or statement.`;

  const messages = [
    { role: "system", content: systemPrompt },
    ...history.slice(-6),
  ];

  console.log(`🤖 [API] Calling AI with ${messages.length} messages...`);

  try {
    const startTime = Date.now();
    const response = await askAIWithMessages(messages);
    const elapsed = Date.now() - startTime;

    console.log(`✅ [API] AI responded in ${elapsed}ms: "${response}"`);

    if (!response || response.trim() === "") {
      console.warn(`⚠️ [API] Empty response from AI`);
      return { command: "The spirits are silent..." };
    }

    // Проверяем на специальные команды
    if (response.includes("DECLARE_WAR:")) {
      const targetRace = response.split("DECLARE_WAR:")[1].trim().split(" ")[0];
      declareWar(worldId, race, targetRace, 5);
      const command = `I declare WAR on the ${targetRace}!`;
      history.push({ role: "assistant", content: command });
      return { command };
    }

    // Обрабатываем REINFORCE_BORDER и другие команды
    if (response.includes("REINFORCE_BORDER:")) {
      const command = response.split("REINFORCE_BORDER:")[1].trim();
      history.push({ role: "assistant", content: command });
      return { command };
    }

    // Если ответ содержит другие специальные форматы
    if (response.match(/^[A-Z_]+:/)) {
      const colonIndex = response.indexOf(":");
      const command = response.substring(colonIndex + 1).trim();
      history.push({ role: "assistant", content: command });
      return { command };
    }

    // Обычный текст
    history.push({ role: "assistant", content: response });
    return { command: response };
  } catch (e: any) {
    console.error(`❌ [API] AI Failed:`, e.message);
    if (e.cause) console.error(`❌ [API] Cause:`, e.cause);
    if (e.stack) console.error(`❌ [API] Stack:`, e.stack);
    return { command: "The spirits are silent..." };
  }
});

async function askAIWithMessages(messages: any[]): Promise<string> {
  const provider = process.env.AI_PROVIDER || "ollama";
  console.log(`🔧 [AI] Using provider: ${provider}`);

  let client: any;
  let modelName = "llama3.1";

  try {
    if (provider === "groq") {
      const OpenAI = (await import("openai")).OpenAI;
      client = new OpenAI({
        baseURL: "https://api.groq.com/openai/v1",
        apiKey: process.env.GROQ_API_KEY,
      });
      modelName = "llama3-8b-8192";
    } else {
      const OpenAI = (await import("openai")).OpenAI;
      const ollamaUrl = process.env.OLLAMA_URL || "http://localhost:11434/v1";
      console.log(`🔧 [AI] Connecting to Ollama at: ${ollamaUrl}`);

      client = new OpenAI({
        baseURL: ollamaUrl,
        apiKey: "ollama",
      });
    }

    console.log(`🔧 [AI] Sending request to model: ${modelName}`);
    console.log(`🔧 [AI] Messages:`, JSON.stringify(messages, null, 2));

    const completion = await client.chat.completions.create({
      messages,
      model: modelName,
      temperature: 0.7,
      timeout: 60000, // 👈 Увеличили до 60 секунд
    });

    console.log(`✅ [AI] Received completion`);
    const content = completion.choices[0]?.message?.content || "";
    console.log(`✅ [AI] Content: "${content}"`);

    return content;
  } catch (error: any) {
    console.error(`❌ [AI] Error in askAIWithMessages:`, error.message);
    if (error.cause) console.error(`❌ [AI] Cause:`, error.cause);
    throw error;
  }
}
