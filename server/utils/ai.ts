// server/utils/ai.ts
import OpenAI from "openai";

export async function askAI(prompt: string): Promise<string> {
  const provider = process.env.AI_PROVIDER || "ollama";

  try {
    let client: OpenAI;
    let modelName = "llama3.1";

    if (provider === "groq") {
      const apiKey = process.env.GROQ_API_KEY;
      if (!apiKey) throw new Error("GROQ_API_KEY is missing");

      client = new OpenAI({
        baseURL: "https://api.groq.com/openai/v1",
        apiKey: apiKey,
      });
      modelName = "llama3-8b-8192";
    } else {
      // 👇 ВАЖНО: Проверяем, какой URL мы используем
      const ollamaUrl = process.env.OLLAMA_URL || "http://localhost:11434/v1";
      console.log(`🔍 [AI Debug] Connecting to Ollama at: ${ollamaUrl}`);

      client = new OpenAI({
        baseURL: ollamaUrl,
        apiKey: "ollama",
      });
    }

    console.log(`🤖 [AI Debug] Sending prompt to model: ${modelName}`);

    const completion = await client.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: modelName,
      temperature: 0.7,
      timeout: 10000, // 👈 Таймаут 10 секунд, чтобы не висело вечно
    });

    return completion.choices[0].message.content || "";
  } catch (error: any) {
    console.error("❌ [AI Error] Full details:", error.message);
    if (error.cause) console.error("❌ [AI Error] Cause:", error.cause);
    return "The spirits are silent... (AI Error)";
  }
}
