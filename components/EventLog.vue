<template>
  <div class="event-log">
    <h3 class="log-title">Event Log</h3>
    <div class="log-list">
      <div v-for="event in events" :key="event.id" class="log-item" :class="[`severity-${event.severity}`]">
        <span class="event-day">Day {{ event.day }}</span>
        <span class="event-title">{{ event.title }}</span>
        <p class="event-desc">{{ event.description }}</p>
      </div>
      <div v-if="!events || events.length === 0" class="log-item">
        <span class="event-title">No events yet</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { WorldEvent } from '#shared/types/event'

withDefaults(defineProps<{
  events?: WorldEvent[]
}>(), {
  events: () => []
})
</script>

<style scoped>
.event-log {
  background: linear-gradient(180deg, #1a1510 0%, #0d0a07 100%);
  border-top: 2px solid #8b7355;
  padding: 12px 16px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.log-title {
  font-family: 'MedievalSharp', cursive;
  color: #ffd700;
  font-size: 1.1rem;
  margin-bottom: 8px;
}

.log-list {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.log-item {
  background: rgba(20, 18, 15, 0.8);
  border-left: 3px solid #8b7355;
  padding: 8px 10px;
  border-radius: 4px;
  transition: background 0.2s ease;
}

.log-item:hover {
  background: rgba(40, 35, 28, 0.9);
}

.severity-minor {
  border-left-color: #6b7280;
}

.severity-moderate {
  border-left-color: #fbbf24;
}

.severity-major {
  border-left-color: #f97316;
}

.severity-catastrophic {
  border-left-color: #ef4444;
}

.event-day {
  color: #a8a29e;
  font-size: 0.75rem;
  margin-right: 8px;
}

.event-title {
  font-family: 'MedievalSharp', cursive;
  color: #e7e5e4;
  font-size: 0.95rem;
}

.event-desc {
  color: #a8a29e;
  font-size: 0.8rem;
  margin-top: 2px;
}
</style>
