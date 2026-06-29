<template>
  <div
    class="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 text-white flex flex-col items-center justify-center p-4"
  >
    <h1
      class="text-6xl font-bold mb-4 bg-gradient-to-r from-amber-300 to-purple-400 bg-clip-text text-transparent"
    >
      AI Fantasy
    </h1>
    <p class="text-gray-400 text-center max-w-lg mb-12">
      A fantasy civilization simulator. Inhabit a race, guide its leaders, and
      watch emergent stories unfold.
    </p>

    <div class="flex flex-col gap-4 w-full max-w-sm">
      <button
        @click="startNewGame"
        :disabled="isLoading"
        class="w-full py-4 px-6 bg-amber-500 hover:bg-amber-400 text-gray-900 rounded-lg font-bold text-lg transition-colors disabled:opacity-50"
      >
        {{ isLoading ? "Generating World..." : "New Game" }}
      </button>

      <button
        class="w-full py-4 px-6 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-semibold transition-colors"
      >
        Load Game
      </button>
      <button
        class="w-full py-4 px-6 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-semibold transition-colors"
      >
        Settings
      </button>
    </div>

    <footer class="absolute bottom-4 text-gray-600 text-sm">
      Powered by Nuxt 3 + Ollama
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";

definePageMeta({
  layout: "empty",
});

const router = useRouter();
const isLoading = ref(false);

async function startNewGame() {
  isLoading.value = true;
  const userId = localStorage.getItem("userId"); // Берем сохраненный ID

  if (!userId) {
    alert("Please register first via Console (F12)");
    isLoading.value = false;
    return;
  }

  try {
    const seed = Math.floor(Math.random() * 1000000);
    const response = await $fetch("/api/world/create", {
      method: "POST",
      body: {
        name: "My First World",
        seed: Math.floor(Math.random() * 1000000),
        era: 1,
      },
    });
    router.push(`/game/${response.id}`);
  } catch (error) {
    console.error(error);
    alert("Failed to create world");
  } finally {
    isLoading.value = false;
  }
}
</script>
