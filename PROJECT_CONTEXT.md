# 🏰 AI Fantasy Civilization - Project Context & Roadmap

## 🎯 Project Overview
**Genre:** God Game + Artificial Life + Emergent Gameplay  
**Setting:** Deep Fantasy World (Single Era, No Progression to Sci-Fi)  
**Races:** Elves, Dwarves, Orcs, Humans, Fae, Trolls  
**Player Role:** Immortal Spirit inhabiting a race, influencing leaders via "Whispers".  
**Key Mechanic:** Hierarchical AI (LLM Leaders make strategic decisions → Code-controlled Subordinates execute them).  
**Tech Stack:** Nuxt 3 (Fullstack), Vue 3, TypeScript, PixiJS, PostgreSQL, WebSocket, Ollama/Groq.

## 🏗️ Architecture (Nuxt 3 Fullstack)
The project is a **monolithic Nuxt 3 application**. There are NO separate `frontend/` and `server/` projects.
- **Root:** Contains `package.json`, `nuxt.config.ts`, `tsconfig.json`.
- **`pages/`, `components/`, `composables/`:** Frontend logic (Vue 3 + PixiJS).
- **`server/`:** Backend logic (Nitro API, WebSocket, Game Loop, AI Integration).
- **`shared/`:** Common TypeScript types used by both front and back.
- **`scripts/`:** Utility scripts for asset/event generation.

### Directory Structure
```text
ai-fantasy/
├── app.vue
├── nuxt.config.ts
├── package.json
├── pages/              # Routes
├── components/         # Vue Components (GameCanvas, UI, etc.)
├── composables/        # Logic hooks (useWorld, useWebSocket)
├── assets/             # CSS, Fonts
├── public/             # Static assets (Sprites)
├── server/             # BACKEND (Nitro)
│   ├── api/            # API Endpoints (/api/...)
│   ├── ai/             # AI Providers (Ollama, Groq), Prompts, Cache
│   ├── game/           # Game Logic (Loop, Agents, Leaders, Events)
│   ├── utils/          # Server utilities (DB, AI wrapper)
│   └── ws/             # WebSocket Handler
├── shared/             # Common Types
└── scripts/            # Generation scripts