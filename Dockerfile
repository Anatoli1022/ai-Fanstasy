# Dockerfile
FROM node:20-alpine AS base

# Stage 1: Install dependencies
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json ./
# Копируем lock только если он есть, но npm install сам его обновит при необходимости
COPY package-lock.json* ./ 
RUN npm install --legacy-peer-deps

# Stage 2: Build the application
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NODE_ENV=production
RUN npx nuxi build

# Stage 3: Production runner
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nuxt

COPY --from=builder /app/.output ./.output

USER nuxt
EXPOSE 3000

CMD ["node", ".output/server/index.mjs"]