import type { PlayerWhisperMessage } from '#shared/types/websocket'

type Listener = (message: unknown) => void

export const useWebSocket = () => {
  let ws: WebSocket | null = null
  const listeners = new Map<string, Set<Listener>>()
  let reconnectTimer: ReturnType<typeof setTimeout> | null = null

  function connect(worldId: string) {
    if (ws?.readyState === WebSocket.OPEN) {
      ws.close()
    }

    const url = useRuntimeConfig().public.wsUrl
    ws = new WebSocket(`${url}/ws?worldId=${encodeURIComponent(worldId)}`)

    ws.onopen = () => {
      ws?.send(JSON.stringify({ type: 'join-world', worldId }))
    }

    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data)
        const handlers = listeners.get(message.type)
        if (handlers) {
          handlers.forEach((fn) => fn(message))
        }
      } catch {
        // ignore malformed messages
      }
    }

    ws.onclose = () => {
      scheduleReconnect(worldId)
    }

    ws.onerror = () => {
      ws?.close()
    }
  }

  function scheduleReconnect(worldId: string) {
    if (reconnectTimer) clearTimeout(reconnectTimer)
    reconnectTimer = setTimeout(() => connect(worldId), 3000)
  }

  function sendWhisper(message: string) {
    if (!ws || ws.readyState !== WebSocket.OPEN) return
    const payload: PlayerWhisperMessage = {
      type: 'player-whisper',
      worldId: '',
      timestamp: Date.now(),
      payload: {
        playerId: 'player',
        message,
      },
    }
    ws.send(JSON.stringify(payload))
  }

  function onMessage(type: string, fn: Listener) {
    if (!listeners.has(type)) {
      listeners.set(type, new Set())
    }
    listeners.get(type)!.add(fn)

    return () => {
      listeners.get(type)?.delete(fn)
    }
  }

  function offMessage(type: string, fn: Listener) {
    listeners.get(type)?.delete(fn)
  }

  onUnmounted(() => {
    if (reconnectTimer) clearTimeout(reconnectTimer)
    ws?.close()
  })

  return {
    connect,
    sendWhisper,
    onMessage,
    offMessage,
    get isConnected() {
      return ws?.readyState === WebSocket.OPEN
    },
  }
}
