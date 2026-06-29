export const useSpriteLoader = () => {
  const cache = useState<Record<string, string>>('spriteCache', () => ({}))

  async function load(race: string, role: string, animation: string): Promise<string> {
    const key = `${race}-${role}-${animation}`
    if (cache.value[key]) return cache.value[key]

    const runtime = useRuntimeConfig()
    const baseUrl = runtime.public.baseURL || '/'
    const url = `${baseUrl}sprites/${race}/${role}/${animation}.png`

    try {
      const image = await useImage(url, { imgbOptions: { preload: true } })
      cache.value[key] = url
      return url
    } catch {
      return '/sprites/placeholder.png'
    }
  }

  function clearCache() {
    cache.value = {}
  }

  return {
    load,
    clearCache,
  }
}
