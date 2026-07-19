/** 任务状态：待办 / 进行中 / 已完成 */
export type TaskStatus = 'todo' | 'doing' | 'done'

export const TASK_STATUS_ORDER: TaskStatus[] = ['todo', 'doing', 'done']

export const TASK_STATUS_LABEL: Record<TaskStatus, string> = {
  todo: '待办',
  doing: '进行中',
  done: '已完成',
}

export interface Task {
  id: string
  title: string
  description: string
  /** 预估番茄数 */
  estimate: number
  /** 已完成番茄数 */
  completedPomodoros: number
  status: TaskStatus
  /** 列内排序权重，越小越靠前 */
  order: number
  createdAt: number
  /** 进入 Done 列的时间，用于统计“今日完成任务” */
  completedAt: number | null
}

/** 番茄钟阶段：专注 / 短休息 / 长休息 */
export type Phase = 'focus' | 'short' | 'long'

export type TimerStatus = 'idle' | 'running' | 'paused'

export interface FocusLog {
  id: string
  /** 本地日期键，格式 YYYY-MM-DD */
  date: string
  taskId: string | null
  /** 任务标题快照（任务删除后日志仍可展示） */
  taskTitle: string
  minutes: number
  type: 'focus'
  endedAt: number
}

export type ThemeMode = 'light' | 'dark'

export interface Settings {
  focusMinutes: number
  shortMinutes: number
  longMinutes: number
  autoStartNext: boolean
  soundEnabled: boolean
  theme: ThemeMode
}

export const DEFAULT_SETTINGS: Settings = {
  focusMinutes: 25,
  shortMinutes: 5,
  longMinutes: 15,
  autoStartNext: false,
  soundEnabled: true,
  theme: 'light',
}

/** 顶部导航四个视图 */
export type ViewKey = 'kanban' | 'timer' | 'stats' | 'settings'