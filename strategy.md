🤖 AI Strategy
Local (Dev/MVP): Ollama + Llama 3.1 8B (Free, ~2-5s latency).
Production (Scale): Groq Cloud API (Free tier initially, ~0.3s latency, Llama 3.1 70B).
Hierarchy:
Leaders (LLM): Make strategic decisions every "game day" (60s).
Subordinates (Code): Execute orders, move, fight, gather resources (every tick).
Optimization: Prompt caching, batch requests, fallback to simple logic if LLM fails.
🎨 Visual Strategy
Style: Top-down Pixel Art (16x16 / 32x32).
Assets: Pre-generated using Stable Diffusion/Leonardo.AI + Aseprite.
Rendering: PixiJS for high-performance 2D rendering.
Events: Unique visual effects triggered by AI-generated events.
💬 NPC Quote System
Characters speak based on race personality and current situation.
Generated in batches by LLM, cached, and displayed as speech bubbles.
Types: Idle, Working, Combat, Reaction, Death, Leader Speech.
📝 Key Prompts (English)
A. Leader Decision
"You are the leader of [RACE]. Current state: [STATE]. Spirit's Whisper: [WHISPER]. Make a strategic decision. Respond in JSON: {priority, orders, speech}."
B. Unique Event Generation
"Create a unique fantasy event. Logical, atmospheric, affects gameplay. Respond in JSON: {id, type, title, description, effects, visual}."
C. NPC Quotes
"Generate 5 short quotes for a [RACE] [ROLE] in [SITUATION]. Reflect race personality. Respond in JSON: {quotes: [{text, mood}]}."

🗺️ Development Roadmap
Phase 1: Core MVP (Local)
Project Structure (Nuxt 3 Fullstack)
Ollama Integration & Test
Chunked Map Generation (Simplex Noise) & PixiJS Rendering
Agent System (FSM, Movement, Needs)
Basic Game Loop & WebSocket
Phase 2: AI & Content
Leader AI Decisions (LLM)
Event Generation System
NPC Quote System
Pre-generated Sprite Assets
Phase 3: Player Interaction
"Spirit" Mechanics (Whispers, Blessings)
Race Selection & Reincarnation
UI Polish (Resource Panel, Event Log)
Phase 4: Persistence & Monetization
PostgreSQL Schema & Drizzle ORM
Auth (JWT) & World Saving
Freemium Limits (Boosty Integration)
Phase 5: Deploy & Launch
Docker Compose Setup
VPS Deployment (Hetzner/Selectel)
itch.io & Boosty Pages
Marketing (Reddit, Twitter, TikTok)

🛠️ Tech Details
DB: PostgreSQL with Drizzle ORM.
Real-time: Nitro WebSockets.
State: Pinia (Frontend), In-memory + DB (Backend).
AI Provider: openai SDK compatible with both Ollama and Groq.

⚠️ Important Notes for AI Assistant
Always use TypeScript with strict typing.
Follow Nuxt 3 conventions (auto-imports, file-based routing).
Keep imports relative to the new flat structure (no frontend/ prefix).
Prioritize performance in the game loop (avoid heavy LLM calls in ticks).
Use English for code comments and prompts, Russian for UI text if specified.