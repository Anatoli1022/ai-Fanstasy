<template>
  <div class="resource-panel">
    <h3 class="panel-title">Resources</h3>
    <div class="resources-grid">
      <div
        v-for="resource in resourceList"
        :key="resource.key"
        class="resource-item"
        @click="emit('resource-click', resource.key)"
      >
        <div class="resource-icon">
          <span class="icon-placeholder">{{ resource.icon }}</span>
        </div>
        <div class="resource-info">
          <span class="resource-name">{{ resource.label }}</span>
          <span class="resource-value" :class="{ 'value-changed': resource.changed }">
            {{ displayValue(resource.key) }}
          </span>
        </div>
        <div class="resource-bar">
          <div
            class="resource-bar-fill"
            :style="{ width: getResourcePercent(resource.key) + '%' }"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface ResourceItem {
  key: string;
  label: string;
  icon: string;
}

const props = withDefaults(defineProps<{
  resources?: Record<string, number>
}>(), {
  resources: () => ({})
})

const emit = defineEmits<{
  (e: 'resource-click', resource: string): void
}>()

const resourceList: ResourceItem[] = [
  { key: 'food', label: 'Food', icon: '🍞' },
  { key: 'gold', label: 'Gold', icon: '🪙' },
  { key: 'mana', label: 'Mana', icon: '🔮' },
  { key: 'wood', label: 'Wood', icon: '🪵' },
  { key: 'iron', label: 'Iron', icon: '⚙️' },
]

const previousValues: Record<string, number> = {}
const animatedValues: Record<string, number> = {}
const changedFlags: Record<string, boolean> = {}

function displayValue(key: string): number {
  return Math.floor(animatedValues[key] ?? props.resources[key] ?? 0)
}

function getResourcePercent(key: string): number {
  const value = props.resources[key] ?? 0
  const max = key === 'gold' || key === 'mana' ? 200 : 100
  return Math.min(100, Math.max(0, (value / max) * 100))
}

function animateValues() {
  let needsUpdate = false

  for (const key of resourceList.map((r) => r.key)) {
    const target = props.resources[key] ?? 0
    const current = animatedValues[key] ?? target

    if (Math.abs(current - target) > 0.01) {
      animatedValues[key] = current + (target - current) * 0.15
      changedFlags[key] = true
      needsUpdate = true
    } else {
      animatedValues[key] = target
      if (changedFlags[key]) {
        changedFlags[key] = false
        needsUpdate = true
      }
    }
  }

  if (needsUpdate) {
    requestAnimationFrame(animateValues)
  }
}

onMounted(() => {
  for (const item of resourceList) {
    animatedValues[item.key] = props.resources[item.key] ?? 0
  }
  animateValues()
})

watch(
  () => props.resources,
  () => {
    animateValues()
  },
  { deep: true }
)
</script>

<style scoped>
.resource-panel {
  background: linear-gradient(180deg, #1a1510 0%, #0d0a07 100%);
  border: 2px solid #8b7355;
  border-radius: 8px;
  padding: 16px;
  box-shadow:
    inset 0 0 20px rgba(139, 115, 85, 0.2),
    0 4px 12px rgba(0, 0, 0, 0.5);
}

.panel-title {
  font-family: 'MedievalSharp', cursive;
  color: #ffd700;
  font-size: 1.3rem;
  margin-bottom: 12px;
  text-align: center;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.6);
  border-bottom: 1px solid #5c4a32;
  padding-bottom: 8px;
}

.resources-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 10px;
}

.resource-item {
  background: linear-gradient(135deg, rgba(60, 50, 35, 0.8), rgba(30, 25, 18, 0.9));
  border: 1px solid #6b5842;
  border-radius: 6px;
  padding: 10px;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.resource-item:hover {
  border-color: #ffd700;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(255, 215, 0, 0.2);
}

.resource-item::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, transparent, #ffd700, transparent);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.resource-item:hover::before {
  opacity: 1;
}

.resource-icon {
  font-size: 1.5rem;
  text-align: center;
  margin-bottom: 4px;
}

.icon-placeholder {
  display: inline-block;
  width: 32px;
  height: 32px;
  background: radial-gradient(circle, rgba(255, 215, 0, 0.2), transparent);
  border-radius: 50%;
  line-height: 32px;
}

.resource-info {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: 6px;
}

.resource-name {
  font-family: 'MedievalSharp', cursive;
  color: #c4b49a;
  font-size: 0.85rem;
  text-transform: capitalize;
}

.resource-value {
  font-family: 'MedievalSharp', cursive;
  color: #ffd700;
  font-size: 0.95rem;
  font-weight: bold;
  transition: color 0.3s ease;
}

.value-changed {
  color: #ffeb3b;
  text-shadow: 0 0 8px rgba(255, 235, 59, 0.6);
  animation: pulse 0.4s ease-out;
}

@keyframes pulse {
  0% {
    transform: scale(1.2);
    opacity: 0.7;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

.resource-bar {
  height: 4px;
  background: rgba(0, 0, 0, 0.4);
  border-radius: 2px;
  overflow: hidden;
}

.resource-bar-fill {
  height: 100%;
  background: linear-gradient(90deg, #8b7355, #ffd700);
  border-radius: 2px;
  transition: width 0.8s ease-out;
}
</style>
