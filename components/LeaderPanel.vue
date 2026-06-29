<template>
  <div class="leader-panel">
    <h3 class="panel-title">Leader</h3>
    <div v-if="leader" class="leader-info">
      <div class="leader-header">
        <span class="leader-name">{{ leader.name }}</span>
        <span class="leader-race">{{ leader.race }}</span>
      </div>
      <div class="stats">
        <div class="stat">
          <span class="stat-label">Wisdom</span>
          <div class="stat-bar"><div class="stat-fill" :style="{ width: leader.wisdom + '%' }" /></div>
        </div>
        <div class="stat">
          <span class="stat-label">Charisma</span>
          <div class="stat-bar"><div class="stat-fill" :style="{ width: leader.charisma + '%' }" /></div>
        </div>
        <div class="stat">
          <span class="stat-label">Might</span>
          <div class="stat-bar"><div class="stat-fill" :style="{ width: leader.might + '%' }" /></div>
        </div>
      </div>
      <div class="leader-mood">
        Mood: <span class="mood-value">{{ leader.mood }}</span>
      </div>
    </div>
    <div v-else class="no-leader">No leader assigned</div>
  </div>
</template>

<script setup lang="ts">
import type { LeaderState } from '#shared/types/world'

const props = defineProps<{
  leader?: LeaderState | null
}>()
</script>

<style scoped>
.leader-panel {
  background: linear-gradient(180deg, #1a1510 0%, #0d0a07 100%);
  border: 2px solid #8b7355;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 12px;
}

.panel-title {
  font-family: 'MedievalSharp', cursive;
  color: #ffd700;
  font-size: 1.1rem;
  margin-bottom: 8px;
  text-align: center;
}

.leader-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.leader-name {
  font-family: 'MedievalSharp', cursive;
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
}

.stats {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.stat {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.stat-label {
  color: #a8a29e;
  font-size: 0.7rem;
  text-transform: uppercase;
}

.stat-bar {
  height: 6px;
  background: rgba(0, 0, 0, 0.4);
  border-radius: 3px;
  overflow: hidden;
}

.stat-fill {
  height: 100%;
  background: linear-gradient(90deg, #8b7355, #ffd700);
  border-radius: 3px;
  transition: width 0.5s ease;
}

.leader-mood {
  margin-top: 8px;
  color: #c4b49a;
  font-size: 0.9rem;
}

.mood-value {
  color: #ffd700;
  font-family: 'MedievalSharp', cursive;
}

.no-leader {
  text-align: center;
  color: #78716c;
  padding: 12px 0;
}
</style>
