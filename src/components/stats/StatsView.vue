<script setup lang="ts">
import { useStatsStore } from '../../stores/stats'
import OverviewCards from './OverviewCards.vue'
import WeeklyBarChart from './WeeklyBarChart.vue'
import TaskDistribution from './TaskDistribution.vue'
import Heatmap from './Heatmap.vue'

const statsStore = useStatsStore()
</script>

<template>
  <div class="stats-view">
    <div class="view-header">
      <div>
        <h2>专注统计</h2>
        <p class="view-subtitle">每完成一个番茄，都会记录一条专注日志</p>
      </div>
    </div>

    <OverviewCards />

    <div v-if="statsStore.logs.length === 0" class="empty-hero">
      <div class="empty-icon" aria-hidden="true">📈</div>
      <h3>还没有专注数据</h3>
      <p>去番茄钟完成第一个专注周期，这里就会出现图表啦</p>
    </div>

    <template v-else>
      <div class="stats-grid">
        <WeeklyBarChart />
        <TaskDistribution />
      </div>
      <Heatmap />
    </template>
  </div>
</template>

<style scoped lang="scss">
.stats-view {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);

  .view-header {
    margin-bottom: 0;
  }
}

.stats-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-4);
}

@media (max-width: 768px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }
}
</style>