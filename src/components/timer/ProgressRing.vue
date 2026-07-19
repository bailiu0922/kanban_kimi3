<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    /** 已进行比例 0~1 */
    progress: number
    size?: number
    stroke?: number
    color: string
  }>(),
  { size: 260, stroke: 12 },
)

const radius = computed(() => (props.size - props.stroke) / 2)
const circumference = computed(() => 2 * Math.PI * radius.value)
const dashOffset = computed(
  () => circumference.value * (1 - Math.min(1, Math.max(0, props.progress))),
)
const percent = computed(() => Math.round(Math.min(1, Math.max(0, props.progress)) * 100))
</script>

<template>
  <div
    class="progress-ring"
    role="progressbar"
    :aria-valuenow="percent"
    aria-valuemin="0"
    aria-valuemax="100"
    aria-label="番茄钟进度"
  >
    <svg :width="size" :height="size" :viewBox="`0 0 ${size} ${size}`">
      <circle
        class="ring-track"
        :cx="size / 2"
        :cy="size / 2"
        :r="radius"
        :stroke-width="stroke"
        fill="none"
      />
      <circle
        class="ring-value"
        :cx="size / 2"
        :cy="size / 2"
        :r="radius"
        :stroke-width="stroke"
        :stroke="color"
        fill="none"
        stroke-linecap="round"
        :stroke-dasharray="circumference"
        :stroke-dashoffset="dashOffset"
        :transform="`rotate(-90 ${size / 2} ${size / 2})`"
      />
    </svg>
    <div class="ring-content">
      <slot />
    </div>
  </div>
</template>

<style scoped lang="scss">
.progress-ring {
  position: relative;
  display: inline-grid;
  place-items: center;
  max-width: 100%;

  svg {
    max-width: 100%;
    height: auto;
  }
}

.ring-track {
  stroke: var(--color-surface-2);
}

.ring-value {
  transition:
    stroke-dashoffset 0.3s linear,
    stroke var(--transition-base);
}

.ring-content {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  text-align: center;
  padding: calc(var(--space-5) * 2);
}
</style>