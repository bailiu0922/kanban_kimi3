import { computed, ref, watch } from 'vue'
import { defineStore } from 'pinia'
import type { FocusLog } from '../types'
import { STORAGE_KEYS, loadJSON, saveJSON } from '../utils/storage'
import { addDays, lastNDays, startOfWeekMonday, toDateKey, todayKey } from '../utils/date'
import { uid } from '../utils/id'

export interface DayCount {
  date: string
  count: number
}

export interface HeatCell {
  date: string
  count: number
  /** 今天之后的未来日期（占位展示） */
  future: boolean
}

export const useStatsStore = defineStore('stats', () => {
  const logs = ref<FocusLog[]>(loadJSON<FocusLog[]>(STORAGE_KEYS.logs, []))

  watch(logs, (v) => saveJSON(STORAGE_KEYS.logs, v), { deep: true })

  function addLog(input: Omit<FocusLog, 'id' | 'endedAt'>): void {
    logs.value.push({ ...input, id: uid(), endedAt: Date.now() })
  }

  /** 每个日期完成的番茄数 */
  const countByDate = computed(() => {
    const map = new Map<string, number>()
    for (const log of logs.value) {
      map.set(log.date, (map.get(log.date) ?? 0) + 1)
    }
    return map
  })

  const todayLogs = computed(() => logs.value.filter((l) => l.date === todayKey()))
  const todayPomodoros = computed(() => todayLogs.value.length)
  const todayMinutes = computed(() => todayLogs.value.reduce((sum, l) => sum + l.minutes, 0))

  /** 近 7 日（含今天，升序）的番茄数 */
  const last7Days = computed<DayCount[]>(() =>
    lastNDays(7).map((date) => ({ date, count: countByDate.value.get(date) ?? 0 })),
  )

  /** GitHub 风格热力图数据：weeks 列 × 7 行（周一开头，最后一列含今天） */
  function heatmap(weeks = 15): HeatCell[][] {
    const monday = startOfWeekMonday(new Date())
    const first = addDays(monday, -(weeks - 1) * 7)
    const today = todayKey()
    const out: HeatCell[][] = []
    for (let w = 0; w < weeks; w++) {
      const col: HeatCell[] = []
      for (let d = 0; d < 7; d++) {
        const date = toDateKey(addDays(first, w * 7 + d))
        col.push({ date, count: countByDate.value.get(date) ?? 0, future: date > today })
      }
      out.push(col)
    }
    return out
  }

  return { logs, addLog, countByDate, todayPomodoros, todayMinutes, last7Days, heatmap }
})