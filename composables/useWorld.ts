// composables/useWorld.ts
import { computed } from "vue";

export const useWorld = () => {
  const world = useState<any | null>("world", () => null);
  const agents = useState<any[]>("agents", () => []);
  const thoughts = useState<string[]>("thoughts", () => []);
  const currentDay = useState<number>("day", () => 1);
  const mapResources = useState<any[]>("mapResources", () => []);

  const leaders = useState<any[]>("leaders", () => []);
  const selectedLeaderId = useState<string | null>(
    "selectedLeaderId",
    () => null,
  );

  const loading = useState<boolean>("worldLoading", () => false);
  const error = useState<string | null>("worldError", () => null);

  const day = computed(() => currentDay.value ?? 1);

  const selectedLeader = computed(() => {
    if (selectedLeaderId.value) {
      return leaders.value.find((l) => l.id === selectedLeaderId.value);
    }
    return leaders.value[0] || null;
  });

  async function initWorld(worldId: string) {
    if (!worldId || worldId.length < 10) return;
    loading.value = true;

    try {
      const data = await $fetch(`/api/world/${worldId}`);
      world.value = data.world;
      agents.value = data.agents ?? [];

      updateLeadersList(agents.value);
      setupDirectWebSocket(worldId);
    } catch (e) {
      error.value = "Failed to load world";
    } finally {
      loading.value = false;
    }
  }

  function selectLeader(leaderId: string) {
    selectedLeaderId.value = leaderId;
  }

  function updateLeadersList(currentAgents: any[]) {
    const newLeaders = currentAgents.filter((a) => a.role === "leader");
    leaders.value = newLeaders;

    if (
      !selectedLeaderId.value ||
      !newLeaders.find((l) => l.id === selectedLeaderId.value)
    ) {
      if (newLeaders.length > 0) {
        selectedLeaderId.value = newLeaders[0].id;
      } else {
        selectedLeaderId.value = null;
      }
    }
  }

  function setupDirectWebSocket(worldId: string) {
    const wsUrl = `ws://${window.location.host}/_ws`;
    console.log(`🔌 Connecting to ${wsUrl}...`);

    const socket = new WebSocket(wsUrl);

    socket.onopen = () => {
      console.log("✅ WebSocket Connected!");
      const joinMsg = JSON.stringify({
        type: "join-world",
        payload: { worldId },
      });
      socket.send(joinMsg);
    };

    socket.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);

        if (message.type === "world-update" && message.payload) {
          const {
            agents: newAgents,
            thoughts: newThoughts,
            day: newDay,
            resources: newResources,
          } = message.payload;

          if (newAgents) {
            agents.value = [...newAgents];
            updateLeadersList(newAgents);
            console.log(
              "🔄 WS Update:",
              newAgents[0]?.positionX,
              newAgents[0]?.positionY,
            );
          }

          if (newThoughts) thoughts.value = [...newThoughts];
          if (newDay) currentDay.value = newDay;
          if (newResources) mapResources.value = newResources; // 👈 Обновляем ресурсы
        }
      } catch (e) {
        console.error("WS Parse Error:", e);
      }
    };

    socket.onerror = (err) => {
      console.error("❌ WebSocket Error:", err);
    };
  }

  return {
    world,
    agents,
    thoughts,
    day,
    loading,
    error,
    initWorld,
    leaders,
    selectedLeader,
    selectLeader,
    mapResources,
  };
};
