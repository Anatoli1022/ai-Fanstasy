// nuxt.config.ts
import { defineNuxtConfig } from "nuxt/config";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineNuxtConfig({
  compatibilityDate: "2024-11-01",
  devtools: { enabled: true },

  css: ["~/assets/css/main.css"],

  modules: ["@nuxtjs/tailwindcss"],

  alias: {
    "#shared": resolve(__dirname, "./shared"),
  },

  nitro: {
    experimental: {
      websocket: true,
    },
    // Если alias выше не сработает для сервера, добавляем сюда
    alias: {
      "#shared": resolve(__dirname, "./shared"),
    },
  } as any, // 👈 Добавляем 'as any', чтобы заглушить ошибку TS, если типизация строгая

  runtimeConfig: {
    aiProvider: process.env.AI_PROVIDER || "ollama",
    ollamaUrl: process.env.OLLAMA_URL || "http://localhost:11434/v1",
    groqApiKey: process.env.GROQ_API_KEY || "",
    databaseUrl:
      process.env.DATABASE_URL ||
      "postgresql://postgres:pass@localhost:5432/ai_fantasy",
    jwtSecret: process.env.JWT_SECRET || "change-me-in-production",

    public: {
      apiBase: "/api",
      wsUrl: process.env.NUXT_WS_URL || "ws://localhost:3000/ws",
      aiProvider: process.env.NUXT_AI_PROVIDER || "ollama",
      ollamaUrl: process.env.NUXT_OLLAMA_URL || "http://localhost:11434/v1",
      groqApiKey: process.env.NUXT_GROQ_API_KEY || "",
    },
  },
});
