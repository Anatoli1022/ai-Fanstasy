<template>
  <div class="event-log-fixed">
    <h3 class="log-title">Event Log</h3>
    <div class="log-list">
      <div
        v-for="(thought, index) in recentEvents"
        :key="index"
        class="log-item severity-minor"
      >
        <span class="event-day">Day {{ day }}</span>
        <span class="event-desc">{{ thought }}</span>
      </div>

      <div v-if="recentEvents.length === 0" class="log-item empty">
        <span class="event-title">No events yet</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useWorld } from "~/composables/useWorld";

const { thoughts, day } = useWorld();
const recentEvents = computed(() => thoughts.value.slice(-15));
</script>

<style scoped>
.event-log-fixed {
  /* ЖЕСТКАЯ ФИКСАЦИЯ ВЫСОТЫ */
  height: 12rem; /* Это ровно h-48 (192px) */
  max-height: 12rem;

  background: linear-gradient(180deg, #1a1510 0%, #0d0a07 100%);
  border-top: 2px solid #8b7355;
  padding: 12px 16px;
  display: flex;
  flex-direction: column;
  overflow: hidden; /* Обрезаем всё, что вылезает за 12rem */
}

.log-title {
  font-family: "MedievalSharp", cursive;
  color: #ffd700;
  font-size: 1.1rem;
  margin-bottom: 8px;
  flex-shrink: 0;
}

.log-list {
  flex: 1;
  overflow-y: auto; /* СКРОЛЛ ТОЛЬКО ЗДЕСЬ */
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding-right: 5px; /* Место для скроллбара */
}

.log-item {
  background: rgba(20, 18, 15, 0.6);
  border-left: 3px solid #8b7355;
  padding: 6px 10px;
  border-radius: 4px;
  font-size: 0.85rem;
  line-height: 1.4;
  flex-shrink: 0; /* Элементы не сжимаются */
}

.event-day {
  color: #a8a29e;
  font-size: 0.7rem;
  margin-right: 8px;
  font-weight: bold;
}

.event-desc {
  color: #e7e5e4;
}

.empty {
  text-align: center;
  color: #57534e;
  font-style: italic;
  border: none;
  background: transparent;
}

/* Стилизация скроллбара, чтобы он был узким */
.log-list::-webkit-scrollbar {
  width: 6px;
}
.log-list::-webkit-scrollbar-track {
  background: #0d0a07;
}
.log-list::-webkit-scrollbar-thumb {
  background: #8b7355;
  border-radius: 3px;
}
</style>
