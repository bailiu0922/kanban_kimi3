import { computed, ref, watch } from 'vue'
import { defineStore } from 'pinia'
import type { Phase, TimerStatus } from '../types'
import { useSettingsStore } from './settings'
import { useTasksStore } from './tasks'
import { useStatsStore } from './stats'
import { playChime, primeAudio } from '../utils/audio'
import { todayKey } from '../utils/date'
import { STORAGE_KEYS, loadJSON, saveJSON } from '../utils/storage'

const DEFAULT_TITLE = 'FocusFlow'
const TICK_MS = 250
/** 每完成 4 个番茄触发一次长休息 */
const CYCLE_SIZE = 4

export const PHASE_LABEL: Record<Phase, string> = {
  focus: '专注中',
  short: '短休息',
  long: '长休息',
}

export const useTimerStore = defineStore('timer', () => {
  const settingsStore = useSettingsStore()
  const tasksStore = useTasksStore()
  const statsStore = useStatsStore()

  const phase = ref<Phase>('focus')
  const status = ref<TimerStatus>('idle')
  const remainingSec = ref(settingsStore.settings.focusMinutes * 60)
  /** 结束时间戳：基于它计算剩余时间，避免 interval 漂移与后台节流误差 */
  const endAt = ref<number | null>(null)
  const currentTaskId = ref<string | null>(null)
  const currentTaskText = ref('')
  /** 累计完成的专注番茄数（持久化，用于长休息判定） */
  const completedFocusCycles = ref<number>(loadJSON<number>(STORAGE_KEYS.cycles, 0))

  let intervalId: number | undefined

  watch(completedFocusCycles, (v) => saveJSON(STORAGE_KEYS.cycles, v))

  const phaseDurationSec = computed(() => {
    const s = settingsStore.settings
    const minutes =
      phase.value === 'focus' ? s.focusMinutes : phase.value === 'short' ? s.shortMinutes : s.longMinutes
    return minutes * 60
  })

  const remainingLabel = computed(() => {
    const m = Math.floor(remainingSec.value / 60)
    const s = remainingSec.value % 60
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  })

  /** 已进行比例 0~1 */
  const progress = computed(() => {
    if (phaseDurationSec.value === 0) return 0
    return 1 - remainingSec.value / phaseDurationSec.value
  })

  const currentTaskTitle = computed(() => {
    if (currentTaskId.value) {
      const task = tasksStore.tasks.find((t) => t.id === currentTaskId.value)
      if (task) return task.title
    }
    return currentTaskText.value.trim()
  })

  const cyclePosition = computed(() => completedFocusCycles.value % CYCLE_SIZE)

  // 空闲时跟随设置中的阶段时长（例如在设置页修改了专注时长）
  watch(phaseDurationSec, (v) => {
    if (status.value === 'idle') remainingSec.value = v
  })

  // 阶段提示：同步浏览器标题
  watch([remainingLabel, phase, status], () => {
    if (status.value === 'idle') {
      document.title = DEFAULT_TITLE
      return
    }
    const icon = phase.value === 'focus' ? '\u{1F345}' : '☕'
    const paused = status.value === 'paused' ? '⏸ ' : ''
    document.title = `${paused}${icon} ${PHASE_LABEL[phase.value]} ${remainingLabel.value}`
  })

  function selectTask(id: string | null, text = ''): void {
    currentTaskId.value = id
    currentTaskText.value = text
  }

  function start(): void {
    if (status.value === 'running') return
    primeAudio()
    if (status.value === 'idle') remainingSec.value = phaseDurationSec.value
    endAt.value = Date.now() + remainingSec.value * 1000
    status.value = 'running'
    window.clearInterval(intervalId)
    intervalId = window.setInterval(tick, TICK_MS)
  }

  function pause(): void {
    if (status.value !== 'running') return
    syncRemaining()
    status.value = 'paused'
    endAt.value = null
    window.clearInterval(intervalId)
  }

  function reset(): void {
    window.clearInterval(intervalId)
    status.value = 'idle'
    endAt.value = null
    remainingSec.value = phaseDurationSec.value
  }

  /** 跳过当前休息，直接进入下一轮专注 */
  function skipBreak(): void {
    if (phase.value === 'focus') return
    window.clearInterval(intervalId)
    phase.value = 'focus'
    status.value = 'idle'
    remainingSec.value = phaseDurationSec.value
    start()
  }

  function tick(): void {
    syncRemaining()
    if (remainingSec.value <= 0) completePhase()
  }

  function syncRemaining(): void {
    if (endAt.value !== null) {
      remainingSec.value = Math.max(0, Math.round((endAt.value - Date.now()) / 1000))
    }
  }

  function completePhase(): void {
    window.clearInterval(intervalId)
    const finished = phase.value
    if (finished === 'focus') {
      completedFocusCycles.value += 1
      tasksStore.incrementPomodoro(currentTaskId.value)
      statsStore.addLog({
        date: todayKey(),
        taskId: currentTaskId.value,
        taskTitle: currentTaskTitle.value || '未关联任务',
        minutes: settingsStore.settings.focusMinutes,
        type: 'focus',
      })
      phase.value = completedFocusCycles.value % CYCLE_SIZE === 0 ? 'long' : 'short'
    } else {
      phase.value = 'focus'
    }
    status.value = 'idle'
    endAt.value = null
    remainingSec.value = phaseDurationSec.value
    if (settingsStore.settings.soundEnabled) playChime()
    if (settingsStore.settings.autoStartNext) start()
  }

  return {
    phase,
    status,
    remainingSec,
    remainingLabel,
    progress,
    phaseDurationSec,
    currentTaskId,
    currentTaskText,
    currentTaskTitle,
    completedFocusCycles,
    cyclePosition,
    selectTask,
    start,
    pause,
    reset,
    skipBreak,
  }
})