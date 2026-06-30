<template>
  <div
    class="h-screen w-screen flex flex-col bg-gray-900 text-white overflow-hidden"
  >
    <header
      class="h-14 bg-gray-800 border-b border-gray-700 flex items-center px-4 shrink-0"
    >
      <h2 class="text-lg font-semibold text-amber-400">World: {{ worldId }}</h2>
      <span class="ml-4 text-gray-400">Day {{ day }}</span>
    </header>

    <main class="flex-1 flex overflow-hidden">
      <ClientOnly>
        <GameCanvas class="flex-1" />
      </ClientOnly>
      <aside
        class="w-80 bg-gray-800 border-l border-gray-700 flex flex-col overflow-hidden"
      >
        <LeaderPanel :leader="world?.leader" />
        <ResourcePanel :resources="world?.resources" />
        <AgentBubble />
        <WhisperChat :world-id="worldId" />
      </aside>
    </main>

    <EventLog class="h-48 shrink-0" />
  </div>
</template>

<script setup lang="ts">
import { useRoute } from "vue-router";
import { computed, onMounted } from "vue";
import { useWorld } from "~/composables/useWorld";
import { useWebSocket } from "~/composables/useWebSocket";

const route = useRoute();
const worldId = computed(() => route.params.worldId as string);

const { world, day, initWorld, agents, thoughts } = useWorld();
const { connect } = useWebSocket();

onMounted(async () => {
  await initWorld(worldId.value);
  connect(worldId.value);

  // 👇 ДОБАВЬ ЭТИ ДВЕ СТРОКИ ДЛЯ ОТЛАДКИ
  setInterval(() => {
    console.log(
      "🔍 Agents:",
      agents.value.length,
      agents.value[0]?.positionX,
      agents.value[0]?.positionY,
    );
    console.log("💭 Thoughts:", thoughts.value);
  }, 2000);
});
</script>
