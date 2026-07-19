<script setup lang="ts">
import { computed } from 'vue'
import { useStatsStore } from '../../stores/stats'
import { useTasksStore } from '../../stores/tasks'
import { formatMinutes } from '../../utils/date'

const statsStore = useStatsStore()
const tasksStore = useTasksStore()

const cards = computed(() => [
  { icon: '🍅', label: '今日完成番茄', value: String(statsStore.todayPomodoros) },
  { icon: '⏱️', label: '今日专注时长', value: formatMinutes(statsStore.todayMinutes) },
  { icon: '✅', label: '今日完成任务', value: String(tasksStore.doneTodayCount) },
])
</script>

<template>
  <div class="overview-cards">
    <div v-for="card in cards" :key="card.label" class="stat-card">
      <span class="stat-icon" aria-hidden="true">{{ card.icon }}</span>
      <div>
        <div class="stat-value">{{ card.value }}</div>
        <div class="stat-label">{{ card.label }}</div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.overview-cards {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-4);
}

.stat-card {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--space-4) var(--space-5);
  box-shadow: var(--shadow-sm);
}

.stat-icon {
  font-size: 26px;
}

.stat-value {
  font-size: 20px;
  font-weight: 700;
  line-height: 1.3;
}

.stat-label {
  font-size: 12px;
  color: var(--color-text-muted);
}

@media (max-width: 768px) {
  .overview-cards {
    grid-template-columns: 1fr;
  }
}
</style>