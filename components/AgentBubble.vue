<template>
  <div class="agent-bubble">
    <Transition name="fade">
      <div v-if="quote" class="bubble">
        <div class="bubble-arrow" />
        <div class="bubble-content">
          <span class="agent-name">{{ quote.agentName }}</span>
          <p class="quote-text">"{{ quote.quote }}"</p>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import type { AgentQuoteMessage } from '#shared/types/websocket'

const props = defineProps<{
  quote?: {
    agentName: string;
    quote: string;
    mood: string;
  } | null
}>()
</script>

<style scoped>
.agent-bubble {
  position: relative;
  min-height: 60px;
}

.bubble {
  position: relative;
}

.bubble-arrow {
  position: absolute;
  top: -8px;
  left: 20px;
  width: 0;
  height: 0;
  border-left: 8px solid transparent;
  border-right: 8px solid transparent;
  border-bottom: 8px solid #2d2416;
}

.bubble-content {
  background: #2d2416;
  border: 1px solid #8b7355;
  border-radius: 10px;
  padding: 10px 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
}

.agent-name {
  display: block;
  font-family: 'MedievalSharp', cursive;
  color: #ffd700;
  font-size: 0.85rem;
  margin-bottom: 4px;
}

.quote-text {
  color: #e7e5e4;
  font-size: 0.95rem;
  line-height: 1.4;
  margin: 0;
  font-style: italic;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
