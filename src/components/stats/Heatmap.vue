<script setup lang="ts">
import { computed } from 'vue'
import { useStatsStore } from '../../stores/stats'

const statsStore = useStatsStore()
const weeks = computed(() => statsStore.heatmap(15))

function level(count: number): number {
  if (count <= 0) return 0
  if (count <= 2) return 1
  if (count <= 4) return 2
  if (count <= 6) return 3
  return 4
}
</script>

<template>
  <section class="panel" aria-label="专注热力图">
    <h3 class="panel-title">专注热力图<span class="panel-subtitle">近 15 周</span></h3>
    <div class="heatmap" role="img" aria-label="近 15 周每日专注强度热力图">
      <div v-for="(week, wi) in weeks" :key="wi" class="heatmap-col">
        <div
          v-for="cell in week"
          :key="cell.date"
          class="heat-cell"
          :class="[`lv-${level(cell.count)}`, { future: cell.future }]"
          :title="cell.future ? '' : `${cell.date}：${cell.count} 个番茄`"
        ></div>
      </div>
    </div>
    <div class="heat-legend" aria-hidden="true">
      <span>少</span>
      <i v-for="l in 5" :key="l" class="heat-cell" :class="`lv-${l - 1}`"></i>
      <span>多</span>
    </div>
  </section>
</template>

<style scoped lang="scss">
.heatmap {
  display: flex;
  gap: 3px;
  overflow-x: auto;
  padding-bottom: 4px;
}

.heatmap-col {
  display: grid;
  grid-template-rows: repeat(7, 12px);
  gap: 3px;
}

.heat-cell {
  width: 12px;
  height: 12px;
  border-radius: 2px;
  background: var(--heat-0);

  &.lv-1 {
    background: var(--heat-1);
  }

  &.lv-2 {
    background: var(--heat-2);
  }

  &.lv-3 {
    background: var(--heat-3);
  }

  &.lv-4 {
    background: var(--heat-4);
  }

  &.future {
    opacity: 0.25;
  }
}

.heat-legend {
  display: flex;
  align-items: center;
  gap: 3px;
  margin-top: var(--space-2);
  font-size: 12px;
  color: var(--color-text-muted);

  .heat-cell {
    display: inline-block;
  }
}
</style>