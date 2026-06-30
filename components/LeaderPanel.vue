<template>
  <div class="leader-panel">
    <h3 class="panel-title">Leader</h3>
    <div v-if="leader" class="leader-info">
      <div class="leader-header">
        <span class="leader-name">{{ leader.name }}</span>
        <span class="leader-race">{{ leader.race }}</span>
      </div>

      <!-- Показываем роль и базовые статы -->
      <div class="stats">
        <div class="stat-row">
          <span class="stat-label">Role:</span>
          <span class="stat-value capitalize">{{ leader.role }}</span>
        </div>
        <div class="stat-row">
          <span class="stat-label">Health:</span>
          <div class="stat-bar-bg">
            <div
              class="stat-fill"
              :style="{ width: (leader.stats?.health || 0) + '%' }"
            ></div>
          </div>
        </div>
        <div class="stat-row">
          <span class="stat-label">Hunger:</span>
          <div class="stat-bar-bg">
            <div
              class="stat-fill hunger"
              :style="{ width: (leader.stats?.hunger || 0) + '%' }"
            ></div>
          </div>
        </div>
      </div>

      <div class="leader-mood">
        Status:
        <span class="mood-value">{{ leader.stats?.lastAction || "Idle" }}</span>
      </div>
    </div>
    <div v-else class="no-leader">
      <p>No leader assigned yet.</p>
      <p class="hint">Leaders are chosen based on strength and wisdom.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  leader?: any | null;
}>();
</script>

<style scoped>
.leader-panel {
  background: linear-gradient(180deg, #1a1510 0%, #0d0a07 100%);
  border-bottom: 1px solid #8b7355;
  padding: 16px;
}

.panel-title {
  font-family: "MedievalSharp", cursive;
  color: #ffd700;
  font-size: 1.1rem;
  margin-bottom: 12px;
  text-align: center;
  border-bottom: 1px solid rgba(139, 115, 85, 0.3);
  padding-bottom: 8px;
}

.leader-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.leader-name {
  font-family: "MedievalSharp", cursive;
  color: #ffd700;
  font-size: 1.2rem;
}

.leader-race {
  background: #8b7355;
  color: #fff;
  font-size: 0.7rem;
  padding: 2px 8px;
  border-radius: 10px;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.stats {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.stat-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.stat-label {
  color: #a8a29e;
  font-size: 0.75rem;
  text-transform: uppercase;
  width: 60px;
}

.stat-value {
  color: #e7e5e4;
  font-size: 0.85rem;
}

.stat-bar-bg {
  flex: 1;
  height: 6px;
  background: rgba(0, 0, 0, 0.4);
  border-radius: 3px;
  overflow: hidden;
}

.stat-fill {
  height: 100%;
  background: linear-gradient(90deg, #ef4444, #22c55e);
  border-radius: 3px;
  transition: width 0.5s ease;
}

.stat-fill.hunger {
  background: linear-gradient(90deg, #f97316, #fbbf24);
}

.leader-mood {
  margin-top: 12px;
  padding-top: 8px;
  border-top: 1px solid rgba(139, 115, 85, 0.2);
  color: #c4b49a;
  font-size: 0.85rem;
}

.mood-value {
  color: #ffd700;
  font-family: "MedievalSharp", cursive;
}

.no-leader {
  text-align: center;
  color: #78716c;
  padding: 12px 0;
  font-size: 0.9rem;
}

.hint {
  font-size: 0.75rem;
  margin-top: 4px;
  opacity: 0.7;
}
</style>
