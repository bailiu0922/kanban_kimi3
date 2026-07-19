<script setup lang="ts">
import { computed } from 'vue'
import type { EChartsCoreOption } from 'echarts/core'
import { useStatsStore } from '../../stores/stats'
import { useSettingsStore } from '../../stores/settings'
import EChart from '../common/EChart.vue'

const statsStore = useStatsStore()
const settingsStore = useSettingsStore()

function cssVar(name: string): string {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim()
}

const option = computed<EChartsCoreOption>(() => {
  // 依赖主题：切换深/浅色时重算图表配色
  void settingsStore.settings.theme
  const text = cssVar('--color-text-muted')
  const border = cssVar('--color-border')
  const data = statsStore.last7Days
  return {
    grid: { left: 36, right: 16, top: 24, bottom: 28 },
    tooltip: { trigger: 'axis' },
    xAxis: {
      type: 'category',
      data: data.map((d) => d.date.slice(5)),
      axisLine: { lineStyle: { color: border } },
      axisTick: { show: false },
      axisLabel: { color: text },
    },
    yAxis: {
      type: 'value',
      minInterval: 1,
      splitLine: { lineStyle: { color: border } },
      axisLabel: { color: text },
    },
    series: [
      {
        type: 'bar',
        name: '完成番茄',
        data: data.map((d) => d.count),
        barMaxWidth: 32,
        itemStyle: { color: cssVar('--color-primary'), borderRadius: [6, 6, 0, 0] },
      },
    ],
  }
})
</script>

<template>
  <section class="panel" aria-label="近 7 日完成番茄柱状图">
    <h3 class="panel-title">近 7 日专注<span class="panel-subtitle">每天完成的番茄数</span></h3>
    <EChart :option="option" />
  </section>
</template>