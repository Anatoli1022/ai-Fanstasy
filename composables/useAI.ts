export const useAI = () => {
  const pending = useState<boolean>('aiPending', () => false)
  const lastError = useState<string | null>('aiLastError', () => null)

  async function ask(prompt: string, systemPrompt?: string) {
    pending.value = true
    lastError.value = null
    try {
      const response = await $fetch('/api/ai/decision', {
        method: 'POST',
        body: { prompt, systemPrompt },
      })
      return response
    } catch (e) {
      lastError.value = e instanceof Error ? e.message : 'AI request failed'
      throw e
    } finally {
      pending.value = false
    }
  }

  async function generateEvent(payload: unknown) {
    pending.value = true
    lastError.value = null
    try {
      const response = await $fetch('/api/event/generate', {
        method: 'POST',
        body: payload,
      })
      return response
    } catch (e) {
      lastError.value = e instanceof Error ? e.message : 'Event generation failed'
      throw e
    } finally {
      pending.value = false
    }
  }

  return {
    pending,
    lastError,
    ask,
    generateEvent,
  }
}
