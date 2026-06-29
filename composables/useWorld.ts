export const useWorld = () => {
  const world = useState<any | null>("world", () => null);
  const agents = useState<any[]>("agents", () => []);
  const loading = useState<boolean>("worldLoading", () => false);
  const error = useState<string | null>("worldError", () => null);

  const day = computed(() => world.value?.day ?? 1);

  async function initWorld(worldId: string) {

    if (!worldId || worldId === "test" || worldId.length < 10) {
      console.warn("Invalid World ID provided:", worldId);
      error.value = "Invalid World ID. Please use a valid UUID from the URL.";
      loading.value = false;
      return;
    }

    loading.value = true;
    error.value = null;

    try {
      console.log(`Fetching world data for ID: ${worldId}...`); // Для отладки
      const data = await $fetch(`/api/world/${worldId}`);
      world.value = data.world;
      agents.value = data.agents ?? [];
    } catch (e) {
      console.error("Failed to load world:", e);
      error.value = e instanceof Error ? e.message : "Failed to load world";
    } finally {
      loading.value = false;
    }
  }

  function updateSnapshot(patch: Record<string, unknown>) {
    if (!world.value) return;
    world.value = { ...world.value, ...patch };
  }

  function addAgent(agent: unknown) {
    agents.value = [...agents.value, agent];
  }

  function refreshAgents() {
    if (!world.value?.id) return;
    // Re-fetch agents from server when needed
  }

  return {
    world,
    agents,
    loading,
    error,
    day,
    initWorld,
    updateSnapshot,
    addAgent,
    refreshAgents,
  };
};
