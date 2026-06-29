<template>
  <div class="whisper-chat">
    <h3 class="chat-title">Whisper to Leader</h3>
    <div class="messages">
      <div v-for="msg in messages" :key="msg.timestamp" class="message" :class="msg.role">
        <span class="msg-role">{{ msg.role === 'player' ? 'You' : 'Leader' }}</span>
        <p class="msg-text">{{ msg.text }}</p>
      </div>
    </div>
    <form class="chat-form" @submit.prevent="send">
      <input
        v-model="input"
        placeholder="Speak to your leader..."
        class="chat-input"
        :disabled="!connected"
      />
      <button type="submit" class="chat-send" :disabled="!connected || !input.trim()">
        Send
      </button>
    </form>
  </div>
</template>

<script setup lang="ts">
import { useWebSocket } from '~/composables/useWebSocket'

const props = defineProps<{
  worldId: string
}>()

const emit = defineEmits<{
  (e: 'send', message: string): void
}>()

const ws = useWebSocket()
const connected = computed(() => ws.isConnected)
const input = ref('')
const messages = ref<Array<{ role: 'player' | 'leader'; text: string; timestamp: number }>>([])

watch(
  () => props.worldId,
  () => {
    messages.value = []
    input.value = ''
  }
)

onMounted(() => {
  ws.onMessage('player-whisper', (msg: any) => {
    messages.value.push({
      role: 'leader',
      text: msg.payload.message,
      timestamp: Date.now(),
    })
  })
})

function send() {
  const text = input.value.trim()
  if (!text) return
  messages.value.push({ role: 'player', text, timestamp: Date.now() })
  ws.sendWhisper(text)
  input.value = ''
}
</script>

<style scoped>
.chat-title {
  font-family: 'MedievalSharp', cursive;
  color: #ffd700;
  font-size: 1rem;
  text-align: center;
}

.messages {
  flex: 1;
  max-height: 120px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.message {
  padding: 6px 8px;
  border-radius: 6px;
  max-width: 85%;
}

.message.player {
  align-self: flex-end;
  background: #4a3b2a;
  border: 1px solid #6b5842;
}

.message.leader {
  align-self: flex-start;
  background: #2d2416;
  border: 1px solid #8b7355;
}

.msg-role {
  font-size: 0.7rem;
  color: #a8a29e;
  display: block;
}

.msg-text {
  margin: 2px 0 0;
  font-size: 0.9rem;
  color: #e7e5e4;
}

.chat-form {
  display: flex;
  gap: 6px;
}

.chat-input {
  flex: 1;
  background: #0f172a;
  border: 1px solid #6b5842;
  border-radius: 4px;
  padding: 6px 10px;
  color: #e7e5e4;
  font-size: 0.9rem;
  outline: none;
}

.chat-input:focus {
  border-color: #ffd700;
}

.chat-send {
  background: #8b7355;
  color: #fff;
  border: none;
  border-radius: 4px;
  padding: 6px 12px;
  cursor: pointer;
  font-weight: bold;
  transition: background 0.2s ease;
}

.chat-send:hover:not(:disabled) {
  background: #ffd700;
  color: #0f172a;
}

.chat-send:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.chat-input:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
