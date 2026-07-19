<script setup lang="ts">
import { computed } from 'vue'
import type { EChartsCoreOption } from 'echarts/core'
import { TASK_STATUS_LABEL, TASK_STATUS_ORDER } from '../../types'
import { useTasksStore } from '../../stores/tasks'
import { useSettingsStore } from '../../stores/settings'
import EChart from '../common/EChart.vue'

const tasksStore = useTasksStore()
const settingsStore = useSettingsStore()

const option = computed<EChartsCoreOption>(() => {
  void settingsStore.settings.theme
  const css = (name: string) =>
    getComputedStyle(document.documentElement).getPropertyValue(name).trim()
  const data = TASK_STATUS_ORDER.map((status) => ({
    name: TASK_STATUS_LABEL[status],
    value: tasksStore.countByStatus(status),
    itemStyle: { color: css(`--color-${status}`) },
  }))
  return {
    tooltip: { trigger: 'item' },
    legend: { bottom: 0, textStyle: { color: css('--color-text-muted') } },
    series: [
      {
        type: 'pie',
        name: '任务状态',
        radius: ['52%', '74%'],
        center: ['50%', '42%'],
        label: { show: false },
        data,
      },
    ],
  }
})
</script>

<template>
  <section class="panel" aria-label="任务状态分布">
    <h3 class="panel-title">任务状态分布<span class="panel-subtitle">三列任务小计</span></h3>
    <EChart v-if="tasksStore.tasks.length > 0" :option="option" />
    <p v-else class="panel-empty">暂无任务，先看板创建任务后这里会显示分布</p>
  </section>
</template>