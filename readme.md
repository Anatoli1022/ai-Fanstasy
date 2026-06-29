Отлично! Давай соберём всё в единый документ-план. Сначала добавим систему реплик персонажей, потом все промпты переведу на английский, и в конце — МЕГА-ПЛАН всего проекта.

---

## 💬 1. Система реплик персонажей (NPC Comments)

Персонажи должны "говорить" — это оживляет мир. Реплики генерируются ИИ периодически или при событиях.

### Архитектура реплик:

```typescript
// shared/types/quotes.ts
export interface AgentQuote {
  id: string;
  agentId: number;
  agentName: string;
  race: string;
  role: string;
  text: string;
  type: 'idle' | 'working' | 'combat' | 'reaction' | 'death' | 'leader';
  timestamp: number;
  position: { x: number; y: number };
  duration: number; // секунд на экране
}

// Реплики по типам
export const QUOTE_TYPES = {
  idle: 'Случайная реплика в покое',
  working: 'Во время работы (сбор ресурсов, строительство)',
  combat: 'В бою (атака, защита, побег)',
  reaction: 'Реакция на событие (нашли артефакт, началась война)',
  death: 'Предсмертные слова',
  leader: 'Речь лидера (после решения ИИ)'
};
```

### Промпт для генерации реплик (на английском):

```typescript
// server/ai/prompts/quotes.ts

export function getQuotesPrompt(context: {
  agentName: string;
  race: string;
  role: string;
  situation: string;
  recentEvents: string[];
}): string {
  return `You are a creative writer for a fantasy civilization game.

Generate 5 short quotes (1-2 sentences each) for a character in the game.

Character:
- Name: ${context.agentName}
- Race: ${context.race}
- Role: ${context.role}
- Current situation: ${context.situation}

Recent world events:
${context.recentEvents.map(e => `- ${e}`).join('\n')}

Race personality:
- Elves: wise, poetic, connected to nature, speak elegantly
- Dwarves: gruff, practical, love stone and metal, speak bluntly
- Orcs: aggressive, honor-bound, value strength, speak roughly
- Humans: adaptable, ambitious, diverse speech patterns
- Fae: mischievous, cryptic, speak in riddles
- Trolls: slow, simple, grumpy, speak in short sentences

Requirements:
- Each quote should reflect the character's race personality
- Quotes should be contextually relevant to the situation
- Mix of serious, funny, and dramatic tones
- No modern slang, keep fantasy atmosphere

Respond STRICTLY in JSON format:
{
  "quotes": [
    {
      "text": "The quote text here",
      "mood": "happy|sad|angry|neutral|excited|fearful",
      "priority": "low|medium|high"
    }
  ]
}`;
}
```

### Отображение реплик на фронте:

```vue
<!-- frontend/components/AgentBubble.vue -->
<template>
  <div 
    v-if="quote"
    class="speech-bubble"
    :class="quote.mood"
    :style="{ left: quote.position.x + 'px', top: quote.position.y + 'px' }"
  >
    <div class="agent-name">{{ quote.agentName }}</div>
    <div class="quote-text">"{{ quote.text }}"</div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  quote: AgentQuote | null;
}>();
</script>

<style scoped>
.speech-bubble {
  position: absolute;
  background: rgba(0, 0, 0, 0.85);
  border: 2px solid #d4af37;
  border-radius: 8px;
  padding: 8px 12px;
  max-width: 250px;
  color: #fff;
  font-family: 'MedievalSharp', serif;
  animation: fadeIn 0.3s ease-out;
  pointer-events: none;
  z-index: 100;
}

.speech-bubble.happy { border-color: #4ade80; }
.speech-bubble.sad { border-color: #60a5fa; }
.speech-bubble.angry { border-color: #ef4444; }
.speech-bubble.excited { border-color: #fbbf24; }

.agent-name {
  font-weight: bold;
  color: #d4af37;
  font-size: 12px;
  margin-bottom: 4px;
}

.quote-text {
  font-size: 14px;
  font-style: italic;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
```

### Интеграция в игровой цикл:

```typescript
// server/game/quotes.ts
import { askAIForJSON } from '../utils/ai';
import { getQuotesPrompt } from '../ai/prompts/quotes';

// Кэш реплик (генерируем пачками, не по одной)
const quoteCache = new Map<string, string[]>();

export async function generateQuotesForAgent(agent: Agent, situation: string): Promise<string[]> {
  const cacheKey = `${agent.race}_${agent.role}_${situation}`;
  
  if (quoteCache.has(cacheKey)) {
    const cached = quoteCache.get(cacheKey)!;
    // Возвращаем случайную из кэша
    return [cached[Math.floor(Math.random() * cached.length)]];
  }
  
  const prompt = getQuotesPrompt({
    agentName: agent.name,
    race: agent.race,
    role: agent.role,
    situation,
    recentEvents: agent.world.recentEvents
  });
  
  const result = await askAIForJSON<{ quotes: Array<{ text: string; mood: string; priority: string }> }>(prompt);
  
  // Кэшируем все сгенерированные реплики
  quoteCache.set(cacheKey, result.quotes.map(q => q.text));
  
  return [result.quotes[0].text];
}

// Триггерим реплику при событии
export async function triggerAgentQuote(agent: Agent, eventType: string) {
  const quotes = await generateQuotesForAgent(agent, eventType);
  
  // Отправляем клиентам
  io.to(`world-${agent.worldId}`).emit('agent-quote', {
    agentId: agent.id,
    agentName: agent.name,
    race: agent.race,
    text: quotes[0],
    position: { x: agent.x, y: agent.y },
    duration: 5
  });
}
```

---

## 📝 2. Промпты на английском (все в одном месте)

### Промпт A: Генерация кода

```
You are a senior TypeScript developer specializing in Nuxt 3 and game mechanics.

Task: Write code for [FEATURE_DESCRIPTION]

Requirements:
- TypeScript with strict typing
- Nuxt 3 (Composition API, <script setup>)
- Modular design (split into functions/components)
- Error handling
- Comments in English

Project context:
- Fantasy civilization simulator game
- 6 races: elves, dwarves, orcs, humans, fae, trolls
- Map: tile-based, chunked system
- Agents: each has role, health, hunger, position
- AI (Ollama) makes decisions for race leaders every minute

Project structure:
- frontend/ — Nuxt 3 + PixiJS
- server/ — Nuxt server routes
- shared/ — common types

Write code for: [DETAILED_DESCRIPTION]

Return ONLY code, no explanations. If multiple files needed, separate with comments:
// === FILE: server/api/example.ts ===
```

### Промпт B: Генерация уникальных событий

```
You are a master of unique events for a fantasy game.

World state:
- Day: [DAY_NUMBER]
- Weather: [WEATHER]
- Active races: [RACES_LIST]
- Recent events: [RECENT_EVENTS]

Create a UNIQUE event (do not repeat recent ones).

Requirements:
- Event must affect gameplay (change resources, relations, territory)
- Must be logical (no "sudden dragon" if dragons not in lore)
- Include atmospheric description (2-3 sentences, fantasy style)
- Specify affected races
- Specify effects (resource changes, agent spawn/kill)

Response format (STRICT JSON):
{
  "id": "unique_event_id",
  "type": "discovery|war|disaster|diplomacy|invention|migration|mystical",
  "title": "Short event title (5-7 words)",
  "description": "Atmospheric description (2-3 sentences)",
  "affectedRaces": ["race1", "race2"],
  "effects": {
    "resources": {
      "elves": { "food": -10, "mana": +5 }
    },
    "agents": {
      "spawn": [{ "race": "elf", "role": "mage", "count": 2 }],
      "kill": [{ "race": "orc", "count": 5 }]
    },
    "relations": {
      "elves-dwarves": +10
    }
  },
  "visual": {
    "sprite": "event_mystical_portal",
    "animation": "pulse",
    "duration": 5
  },
  "narrative": "Epic description for logs (1 sentence)"
}
```

### Промпт C: Решения лидеров рас

```
You are the leader of the [RACE_NAME] in a fantasy world.
Your task is to make strategic decisions for your people's survival and prosperity.

RACE CHARACTERISTICS:
[RACE_PERSONALITY]

Current state:
- Population: [POPULATION]
- Resources: [RESOURCES_JSON]
- Territory: center ([X], [Y]), radius [RADIUS]
- Relations with other races: [RELATIONS_JSON]
- Threats: [THREATS]
- Recent events: [RECENT_EVENTS]

SPIRIT'S WHISPER (secret visions to the leader):
[PLAYER_WHISPERS]
The leader may listen to this voice or ignore it.
This depends on race character and persuasiveness.

Make your decision. Respond STRICTLY in JSON:
{
  "priority": "expand|defend|develop|diplomacy|war",
  "orders": [
    {
      "type": "move|build|gather|attack|explore|research",
      "target": { "x": 0, "y": 0 },
      "count": 5,
      "reason": "Why this action"
    }
  ],
  "speech": "Leader's speech to their people (optional, for atmosphere)"
}
```

### Промпт D: Генерация спрайтов (для Stable Diffusion)

```
Top-down pixel art, 16x16 sprite, [CHARACTER_TYPE], 
fantasy RPG style, transparent background, clean edges, 
consistent lighting, game asset, no shadows, flat colors,
16-bit aesthetic, [SPECIFIC_DETAILS]

Negative prompt: 3d, realistic, shadows, gradient, blurry, 
low quality, modern, sci-fi, text, watermark
```

---

## 📚 3. МЕГА-ПЛАН ПРОЕКТА "AI Fantasy Civilization"

### 🎯 Концепция игры

**Жанр:** God Game + Artificial Life + Emergent Gameplay  
**Сеттинг:** Фэнтези (один глубокий мир, без эпох)  
**Расы:** Эльфы, Дворфы, Орк, Люди, Феи, Тролли  
**Роль игрока:** Бессмертный Дух, вселяющийся в расу  
**Ключевая механика:** Иерархический ИИ (лидеры-LLM → подчинённые-код)

---

### 🏗️ Архитектура проекта

```
ai-fantasy/
├── frontend/              # Nuxt 3 + PixiJS
│   ├── pages/
│   ├── components/
│   ├── composables/
│   └── public/sprites/    # заранее сгенерированные спрайты
├── server/                # Nuxt server routes
│   ├── api/
│   ├── ai/
│   │   ├── providers/     # Ollama, Groq, etc.
│   │   ├── prompts/       # все промпты на английском
│   │   └── cache.ts
│   ├── game/
│   │   ├── loop.ts        # игровой цикл
│   │   ├── agents.ts      # логика агентов
│   │   ├── leaders.ts     # лидеры рас (LLM)
│   │   ├── events.ts      # система событий
│   │   └── quotes.ts      # реплики NPC
│   ├── utils/
│   │   ├── ai.ts          # работа с Ollama
│   │   └── db.ts          # PostgreSQL
│   └── ws/                # WebSocket
├── shared/                # общие типы
├── scripts/               # скрипты генерации
│   ├── generateSprites.ts
│   └── generateEventPool.ts
├── docker-compose.yml
└── README.md
```

---

### 🗺️ Фазы разработки

#### **ФАЗА 1: Локальная разработка (2-3 недели)**

**Неделя 1: Каркас**
- [ ] Установить Ollama, загрузить `llama3.1:8b`
- [ ] Создать Nuxt проект (`npx nuxi@latest init ai-fantasy`)
- [ ] Настроить структуру папок
- [ ] Написать `server/utils/ai.ts` (интеграция с Ollama)
- [ ] Тестовый запрос к ИИ (проверка работы)

**Неделя 2: Карта**
- [ ] Процедурная генерация чанков (simplex-noise)
- [ ] Рендер чанков в PixiJS
- [ ] Движение камеры (drag + zoom)
- [ ] Система загрузки/выгрузки чанков
- [ ] Базовые тайлы (трава, вода, лес, горы)

**Неделя 3: Агенты**
- [ ] Создание агентов (6 рас × разные роли)
- [ ] Базовая логика (движение, голод, здоровье)
- [ ] FSM для подчинённых (без ИИ)
- [ ] WebSocket для real-time обновлений
- [ ] Простой UI (лог событий)

**Неделя 4: ИИ-лидеры**
- [ ] Промпт для лидеров рас (на английском)
- [ ] Запрос к Ollama раз в минуту
- [ ] Применение решений к подчинённым
- [ ] Очередь запросов (чтобы не перегружать)
- [ ] Fallback когда ИИ не отвечает

---

#### **ФАЗА 2: Визуал и контент (2-3 недели)**

**Неделя 5: Спрайты**
- [ ] Сгенерировать базовые спрайты (персонажи, здания, ресурсы)
- [ ] Сгенерировать спрайты событий (порталы, драконы, руины)
- [ ] Обработка (удаление фона, приведение к 16x16/32x32)
- [ ] Загрузка в спрайт-атлас (TexturePacker)
- [ ] Интеграция в PixiJS

**Неделя 6: События**
- [ ] Промпт для генерации уникальных событий
- [ ] Система пула событий (генерация 100 событий заранее)
- [ ] Визуализация событий на карте
- [ ] Анимации (pulse, fade, shake)
- [ ] Лог событий в UI

**Неделя 7: Реплики NPC**
- [ ] Промпт для генерации реплик
- [ ] Система кэша реплик
- [ ] Триггеры реплик (работа, бой, события, смерть)
- [ ] UI speech bubbles над агентами
- [ ] Речи лидеров (после решений ИИ)

---

#### **ФАЗА 3: Роль игрока (2 недели)**

**Неделя 8: Дух расы**
- [ ] Экран выбора расы при входе
- [ ] Механика "Шёпот" (чат → LLM-лидеру)
- [ ] Влияние шёпота на решения лидера
- [ ] Благословения/проклятия (маленькие бонусы)
- [ ] Отслеживание статистики игрока

**Неделя 9: Перерождение**
- [ ] Механика смены расы
- [ ] Сохранение прогресса (какие расы испытаны)
- [ ] Уникальные бонусы за мастерство расы
- [ ] Анимация перерождения
- [ ] Достижения

---

#### **ФАЗА 4: Сохранения и пользователи (2 недели)**

**Неделя 10: База данных**
- [ ] PostgreSQL схема (users, worlds, agents, events)
- [ ] Регистрация/логин (JWT)
- [ ] Автосохранение миров (каждые 30 сек)
- [ ] Загрузка мира при входе
- [ ] Список сохранений игрока

**Неделя 11: Freemium модель**
- [ ] Ограничения по расам/уровням
- [ ] Бесплатно: до 50 агентов, 3 расы
- [ ] Платно: все расы, 500+ агентов, ускорение
- [ ] Интеграция с Boosty API
- [ ] Проверка подписки в middleware

---

#### **ФАЗА 5: Деплой MVP (1-2 недели)**

**Неделя 12: Подготовка**
- [ ] Docker Compose (Nuxt + PostgreSQL + Redis + Ollama)
- [ ] Арендовать VPS (Hetzner/Selectel, €5/мес)
- [ ] Настройка домена + SSL (Nginx)
- [ ] Деплой на сервер
- [ ] Тестирование на проде

**Неделя 13: Платформы**
- [ ] Регистрация на itch.io (загрузка билда)
- [ ] Создание страницы на Boosty (3 уровня подписки)
- [ ] PWA для мобильных (опционально)
- [ ] Настройка аналитики (Plausible/Umami)

---

#### **ФАЗА 6: Продвижение и монетизация (постоянно)**

**Контент-план:**
- [ ] Twitter/X: ежедневные посты (#gamedev #indiedev)
- [ ] TikTok/Shorts: таймлапсы развития цивилизаций
- [ ] Reddit: r/gamedev, r/indiegaming, r/webgames
- [ ] Telegram-канал: devlog
- [ ] Discord-сервер: комьюнити

**Монетизация:**
- [ ] Boosty: 3 уровня подписки (199₽/499₽/999₽)
- [ ] itch.io: "Name your own price"
- [ ] Разовые донаты
- [ ] Мерч (когда будет аудитория)

---

### 🤖 AI-стратегия

**Локально (MVP):**
- Ollama + Llama 3.1 8B
- Бесплатно, 2-5 сек на запрос

**Первый деплой:**
- Groq (бесплатный лимит)
- Llama 3.1 70B
- 0.3 сек на запрос

**Масштабирование:**
- OpenRouter с fallback
- Или свой GPU-сервер с vLLM

**Оптимизация:**
- Кэширование промптов
- Batch-запросы (все расы за раз)
- Маленькая модель для рутины, большая для важного
- Fallback когда ИИ не отвечает

---

### 🎨 Визуал-стратегия

**Заранее (один раз):**
- Базовые спрайты (персонажи, здания, ресурсы)
- Спрайты событий (порталы, драконы, руины)
- Тайлы (трава, вода, лес, горы)
- UI-иконки

**На лету (ИИ):**
- Описания событий (текст + эффекты)
- Реплики NPC
- Решения лидеров
- Нарратив дня

**Инструменты:**
- Stable Diffusion / Leonardo.AI для спрайтов
- Aseprite для обработки
- TexturePacker для атласов

---

### 💰 Монетизация (детально)

**Boosty уровни:**
```
💚 Supporter (199₽/мес):
- Ранний доступ к обновлениям
- Закрытый Discord
- Голосование за фичи

🔶 Beta Tester (499₽/мес):
- Всё выше +
- Доступ к бета-версиям
- Упоминание в титрах
- Персональный NPC

🌟 God Tier (999₽/мес):
- Всё выше +
- Создание своего народа
- Консультации по разработке
- Мерч (стикеры)
```

**Freemium в игре:**
```
Free:
- 3 расы (эльфы, дворфы, орки)
- До 50 агентов
- Скорость x1
- 3 AI-события в день

Supporter:
- Все 6 рас
- До 200 агентов
- Скорость x3
- 20 AI-событий в день

God:
- Все расы + кастомные
- До 1000 агентов
- Скорость x10
- Безлимитные события
```

---

### 📊 Метрики успеха

**MVP (первый месяц):**
- 100+ регистраций
- 10+ активных игроков
- 5+ подписчиков на Boosty
- 1000+ сгенерированных событий

**Рост (3 месяца):**
- 1000+ регистраций
- 100+ активных игроков
- 50+ подписчиков на Boosty
- Позитивный фидбек

**Масштабирование (6 месяцев):**
- 10000+ регистраций
- 1000+ активных игроков
- Покрытие расходов на сервер
- Рассмотреть Steam

---

### ⚠️ Риски и решения

**Риск 1: ИИ слишком медленный**
- Решение: Groq (облако) или кэширование

**Риск 2: ИИ генерирует мусор**
- Решение: Fallback на простой код, модерация промптов

**Риск 3: Сервер не тянет нагрузку**
- Решение: Горизонтальное масштабирование, разделение LLM на отдельный сервер

**Риск 4: Игрокам скучно**
- Решение: Уникальные события, реплики NPC, перерождение

**Риск 5: Нет денег на сервер**
- Решение: Boosty + донаты + бесплатные лимиты Groq

---

### 🎯 Первые шаги (ПРЯМО СЕЙЧАС)

**Сегодня:**
1. Установить Ollama
2. Загрузить модель: `ollama pull llama3.1:8b`
3. Запустить сервер: `ollama serve`
4. Написать тестовый скрипт

**Завтра:**
1. Создать Nuxt проект
2. Настроить структуру
3. Написать `server/utils/ai.ts`
4. Сделать первый запрос к ИИ

**Через неделю:**
1. Рабочая карта с чанками
2. 10-20 агентов на карте
3. ИИ-лидер принимает решения
4. Лог событий

**Через месяц:**
1. Деплой на VPS
2. Страница на itch.io
3. Boosty страница
4. Первые посты в соцсетях

---

### 📁 Полезные ссылки

**Инструменты:**
- Ollama: https://ollama.com
- Groq: https://console.groq.com
- OpenRouter: https://openrouter.ai
- Leonardo.AI: https://leonardo.ai
- Kenney Assets: https://kenney.nl

**Платформы:**
- itch.io: https://itch.io
- Boosty: https://boosty.to
- Vast.ai (GPU): https://vast.ai
- Hetzner (VPS): https://hetzner.com

**Сообщества:**
- r/gamedev, r/indiegaming, r/webgames
- Twitter: #gamedev #indiedev
- Discord: инди-геймдев серверы

---

## 🎁 Итого

У тебя теперь есть **полный план** от идеи до первых денег. Сохрани этот документ как `ROADMAP.md` в корне проекта и иди по нему шаг за шагом.

**Главное:**
1. Начинай с MVP (текстовый лог + 1 раса + ИИ)
2. Не пытайся сделать всё идеально сразу
3. Выпусти рано, итерируйся часто
4. Слушай первых игроков

Если нужна помощь с конкретным шагом (например, "напиши полный код для чанковой карты" или "помоги с промптом для Stable Diffusion") — спрашивай, разберём детально! 🚀🏰⚔️