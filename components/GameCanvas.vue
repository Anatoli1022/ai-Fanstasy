<template>
  <div
    ref="canvasContainer"
    class="w-full h-full bg-gray-900 relative overflow-hidden"
  ></div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from "vue";
import * as PIXI from "pixi.js";
import { useWorld } from "~/composables/useWorld";

const canvasContainer = ref<HTMLDivElement>();
const { agents, mapResources } = useWorld();

let app: PIXI.Application | null = null;
const spriteMap = new Map<string, PIXI.Graphics>();
const resourceSpriteMap = new Map<string, PIXI.Graphics>(); // Отдельный кэш для ресурсов

onMounted(async () => {
  if (!canvasContainer.value) return;

  // 👇 СНАЧАЛА инициализируем PixiJS
  app = new PIXI.Application();
  await app.init({
    resizeTo: canvasContainer.value,
    backgroundColor: 0x1a1a2e,
    antialias: true,
  });

  if (canvasContainer.value && app?.canvas) {
    canvasContainer.value.appendChild(app.canvas);
  }

  // 👇 ПОТОМ рисуем начальные ресурсы (если уже загружены)
  if (mapResources.value.length > 0) {
    renderResources(mapResources.value);
  }

  // Следим за агентами
  watch(
    agents,
    (newAgents) => {
      updateSprites(newAgents);
    },
    { deep: true },
  );

  // 👇 Следим за ресурсами
  watch(
    mapResources,
    (newResources) => {
      if (newResources) renderResources(newResources);
    },
    { deep: true },
  );
});

function renderResources(resources: any[]) {
  if (!app) return;

  // Удаляем старые спрайты ресурсов
  for (const sprite of resourceSpriteMap.values()) {
    app.stage.removeChild(sprite);
  }
  resourceSpriteMap.clear();

  // Рисуем новые
  resources.forEach((res, index) => {
    if (res.amount <= 0) return; // Не рисуем исчерпанные

    const resSprite = new PIXI.Graphics();
    let color = 0xffffff;
    if (res.type === "food") color = 0x22c55e;
    else if (res.type === "iron") color = 0x94a3b8;
    else if (res.type === "wood") color = 0xa87141;
    else if (res.type === "gold") color = 0xfbbf24;

    resSprite.rect(0, 0, 8, 8).fill(color);
    resSprite.x = res.x * 20 + 6;
    resSprite.y = res.y * 20 + 6;

    app.stage.addChildAt(resSprite, 0); // Рисуем ПОД агентами
    resourceSpriteMap.set(res.id || `res-${index}`, resSprite);
  });
}

function updateSprites(agentList: any[]) {
  if (!app) {
    console.warn("Pixi app not initialized yet!");
    return;
  }

  console.log(
    "🎨 Rendering",
    agentList.length,
    "agents. First pos:",
    agentList[0]?.positionX,
    agentList[0]?.positionY,
  );

  agentList.forEach((agent) => {
    let sprite = spriteMap.get(agent.id);

    if (!sprite) {
      sprite = new PIXI.Graphics();
      let color = 0xffffff;

      if (agent.race === "elf") color = 0x4ade80;
      else if (agent.race === "dwarf") color = 0xfbbf24;
      else if (agent.race === "orc") color = 0xef4444;
      else if (agent.race === "troll") color = 0xa855f7;
      else if (agent.race === "human") color = 0x60a5fa;
      else if (agent.race === "fae") color = 0xe879f9;

      sprite.circle(0, 0, 6).fill(color);
      app.stage.addChild(sprite);
      spriteMap.set(agent.id, sprite);
    }

    sprite.x = agent.positionX * 20 + 10;
    sprite.y = agent.positionY * 20 + 10;
  });

  // Удаляем спрайты умерших агентов
  const currentIds = new Set(agentList.map((a) => a.id));
  for (const [id, sprite] of spriteMap) {
    if (!currentIds.has(id)) {
      app.stage.removeChild(sprite);
      spriteMap.delete(id);
    }
  }
}
</script>
