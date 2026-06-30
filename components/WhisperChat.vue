<template>
  <div class="p-4 border-b border-gray-700 bg-gray-800/50">
    <div class="flex justify-between items-center mb-2">
      <h3 class="text-sm font-bold text-amber-400">Whisper to Leader</h3>

      <!-- 👇 ВЫБОР ЛИДЕРА -->
      <select
        v-if="leaders.length > 1"
        v-model="currentLeaderId"
        @change="selectLeader(currentLeaderId)"
        class="bg-gray-900 text-xs text-gray-300 border border-gray-600 rounded px-2 py-1 outline-none"
      >
        <option v-for="l in leaders" :key="l.id" :value="l.id">
          {{ l.name }} ({{ l.race }})
        </option>
      </select>
    </div>

    <div v-if="leader" class="text-xs text-gray-500 mb-2 capitalize">
      Current focus: <span class="text-amber-500">{{ leader.name }}</span>
    </div>

    <form @submit.prevent="sendWhisper" class="flex gap-2">
      <input
        v-model="message"
        type="text"
        placeholder="Give a command..."
        :disabled="isLoading || !leader"
        class="flex-1 bg-gray-900 border border-gray-600 rounded px-2 py-1 text-sm text-white focus:border-amber-500 outline-none disabled:opacity-50"
      />
      <button
        type="submit"
        :disabled="!message || isLoading || !leader"
        class="bg-amber-600 hover:bg-amber-500 text-white px-3 py-1 rounded text-sm disabled:opacity-50 transition-colors"
      >
        {{ isLoading ? "Thinking..." : "Send" }}
      </button>
    </form>

    <div
      v-if="lastResponse"
      class="mt-3 p-2 bg-gray-900/50 rounded border-l-2 border-amber-500"
    >
      <p class="text-xs text-gray-300 italic">"{{ lastResponse }}"</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { useRoute } from "vue-router";
import { useWorld } from "~/composables/useWorld";

const route = useRoute();
const worldId = route.params.worldId as string;
const { leaders, selectedLeader, selectLeader, thoughts } = useWorld();

const leader = computed(() => selectedLeader.value);
const currentLeaderId = ref(selectedLeader.value?.id || "");

const message = ref("");
const isLoading = ref(false);
const lastResponse = ref("");

async function sendWhisper() {
  if (!message.value || !leader.value) return;

  const currentL = leader.value;
  isLoading.value = true;

  try {
    const res = await $fetch("/api/leader/decide", {
      method: "POST",
      body: {
        worldId,
        message: message.value,
        leaderName: currentL.name,
        race: currentL.race,
        recentEvents: thoughts.value.slice(0, 5),
      },
    });

    lastResponse.value = res.command;
    message.value = "";
  } catch (e) {
    console.error(e);
    lastResponse.value = "The spirits are silent...";
  } finally {
    isLoading.value = false;
  }
}
</script>
