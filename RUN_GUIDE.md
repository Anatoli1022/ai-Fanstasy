Вот полная инструкция по локальному запуску твоего проекта **AI Fantasy**. Сохрани её как `RUN_LOCAL.md` или просто держи под рукой.

---

# 🏰 AI Fantasy: Инструкция по запуску

## 1. Предварительные требования

Убедись, что на твоем компьютере установлены:

- **Docker Desktop** (запущен и работает)
- **Node.js 20+** (для локальной разработки вне Docker)
- **Git**

## 2. Быстрый старт (Docker)

Это рекомендуемый способ запуска, так как он включает все сервисы (БД, Redis, Ollama).

### Первый запуск

```powershell
# 1. Создай файл .env из примера (если еще не создан)
copy .env.example .env

# 2. Запусти сборку и все контейнеры
docker compose up -d --build

# 3. Скачай модель ИИ (выполняется ОДИН РАЗ)
docker exec -it aifantasy-ollama-1 ollama pull llama3.1
```

### Ежедневный запуск

```powershell
# Запустить все сервисы
docker compose up -d
# ребилд
docker compose up -d --build app
# Открыть игру в браузере
start http://localhost:3000
```

### Остановка проекта

```powershell
docker compose down
```

---

## 3. Локальная разработка (Без Docker)

Если ты хочешь разрабатывать с горячей перезагрузкой (HMR), но использовать Docker только для инфраструктуры.

### Шаг 1: Запусти только инфраструктуру

Создай файл `docker-compose.dev.yml`:

```yaml
services:
  postgres:
    image: postgres:16-alpine
    ports: ["5432:5432"]
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: ai_fantasy
    volumes: [pgdata:/var/lib/postgresql/data]

  redis:
    image: redis:7-alpine
    ports: ["6379:6379"]

  ollama:
    image: ollama/ollama:latest
    ports: ["11434:11434"]
    volumes: [ollamadata:/root/.ollama]

volumes:
  pgdata:
  ollamadata:
```

Запусти его:

```powershell
docker compose -f docker-compose.dev.yml up -d
```

### Шаг 2: Настрой `.env` для локального режима

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/ai_fantasy
REDIS_URL=redis://localhost:6379
AI_PROVIDER=ollama
OLLAMA_URL=http://localhost:11434/v1
NODE_ENV=development
```

### Шаг 3: Запусти Nuxt

```powershell
npm install
npm run dev
```

---

## 4. Управление базой данных

### Применение миграций

```powershell
# Внутри Docker-контейнера app
docker exec -it aifantasy-app-1 npx drizzle-kit push

# Или локально
npx drizzle-kit push
```

### Сброс базы данных (ОСТОРОЖНО!)

```powershell
docker compose down -v  # Удаляет все тома, включая БД
docker compose up -d --build
```

---

## 5. Полезные команды

| Команда                                          | Описание                           |
| :----------------------------------------------- | :--------------------------------- |
| `docker ps`                                      | Показать работающие контейнеры     |
| `docker logs -f aifantasy-app-1`                 | Логи приложения в реальном времени |
| `docker logs -f aifantasy-ollama-1`              | Логи ИИ                            |
| `docker exec -it aifantasy-ollama-1 ollama list` | Список установленных моделей       |
| `docker compose restart app`                     | Перезапуск только приложения       |
| `docker compose up -d --build app`               | Пересборка и запуск приложения     |

---

## 6. Устранение неполадок

### ❌ "Container ollama is unhealthy"

Это частая проблема Windows. Если `http://localhost:11434` открывается в браузере и показывает "Ollama is running", игнорируйте статус. Измените в `docker-compose.yml`:

```yaml
depends_on:
  ollama:
    condition: service_started # вместо service_healthy
```

### ❌ "The spirits are silent (AI Error)"

1. Проверьте, скачана ли модель: `docker exec -it aifantasy-ollama-1 ollama list`
2. Проверьте переменную `OLLAMA_URL` в `docker-compose.yml` (должна заканчиваться на `/v1`)
3. Посмотрите логи: `docker logs aifantasy-app-1 --tail 50`

### ❌ База данных не подключается

Убедитесь, что в `.env` указан правильный хост:

- В Docker: `postgres`
- Локально: `localhost`

### ❌ Медленный ответ ИИ

Модель `llama3.1` тяжелая для CPU. Переключитесь на быструю версию:

```powershell
docker exec -it aifantasy-ollama-1 ollama pull llama3.2:3b
```

И измените `modelName` в `server/utils/ai.ts` на `llama3.2:3b`.

---

## 7. Структура проекта

```
ai-fantasy/
├── components/       # Vue-компоненты UI
├── composables/      # useWorld, useWebSocket
├── pages/            # Роуты (index, game/[worldId])
├── server/
│   ├── api/          # API эндпоинты (/leader/decide, /world)
│   ├── game/         # Игровой цикл, логика агентов
│   ├── utils/        # ai.ts, db.ts
│   └── ws/           # WebSocket сервер
├── shared/types/     # Общие типы
├── docker-compose.yml
├── Dockerfile
└── .env
```

---

> 💡 **Совет:** Никогда не коммитьте файл `.env` в Git. Используйте `.env.example` как шаблон.

Удачи в развитии твоей цивилизации, Анатолий! 🏰⚔️🧠
