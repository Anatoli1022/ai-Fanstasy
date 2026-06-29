<template>
  <div class="game-canvas-container">
    <canvas ref="canvasRef" class="game-canvas" />
    <div v-if="loading" class="loading-overlay">Loading world...</div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  world?: { id: string; seed: number; width: number; height: number }
  sprites?: Array<{ id: string; x: number; y: number; race: string; role: string; state: string }>
}>()

const canvasRef = ref<HTMLCanvasElement | null>(null)
const loading = ref(false)

watch(
  () => props.sprites,
  () => draw(),
  { deep: true }
)

function draw() {
  if (!canvasRef.value) return
  const ctx = canvasRef.value.getContext('2d')
  if (!ctx) return

  const width = props.world?.width ?? 20
  const height = props.world?.height ?? 20
  const cellSize = 32

  canvasRef.value.width = width * cellSize
  canvasRef.value.height = height * cellSize

  ctx.fillStyle = '#0f172a'
  ctx.fillRect(0, 0, canvasRef.value.width, canvasRef.value.height)

  for (let x = 0; x < width; x++) {
    for (let y = 0; y < height; y++) {
      ctx.fillStyle = (x + y) % 2 === 0 ? '#1e293b' : '#334155'
      ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize)
    }
  }

  for (const sprite of props.sprites ?? []) {
    ctx.fillStyle = getRaceColor(sprite.race)
    ctx.beginPath()
    ctx.arc(
      sprite.x * cellSize + cellSize / 2,
      sprite.y * cellSize + cellSize / 2,
      cellSize / 3,
      0,
      Math.PI * 2
    )
    ctx.fill()
  }
}

function getRaceColor(race: string): string {
  const colors: Record<string, string> = {
    elf: '#4ade80',
    dwarf: '#f97316',
    orc: '#ef4444',
    human: '#fbbf24',
    fae: '#a78bfa',
    troll: '#22c55e',
  }
  return colors[race] ?? '#ffffff'
}

onMounted(() => {
  draw()
  loading.value = false
})
</script>

<style scoped>
.game-canvas-container {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  background: #0f172a;
}

.game-canvas {
  display: block;
  width: 100%;
  height: 100%;
}

.loading-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.5);
  color: #ffd700;
  font-family: 'MedievalSharp', cursive;
  font-size: 1.5rem;
}
</style>
