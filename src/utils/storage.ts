import type { FocusLog, Settings, Task } from '../types'

const PREFIX = 'focusflow:'

export const STORAGE_KEYS = {
  tasks: `${PREFIX}tasks`,
  logs: `${PREFIX}logs`,
  settings: `${PREFIX}settings`,
  cycles: `${PREFIX}cycles`,
} as const

export function loadJSON<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return fallback
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

export function saveJSON(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // 存储已满或被禁用时静默失败，应用仍可在内存中运行
  }
}

export interface ExportPayload {
  app: 'focusflow'
  exportedAt: string
  tasks: Task[]
  logs: FocusLog[]
  settings: Settings
}

export function buildExportPayload(tasks: Task[], logs: FocusLog[], settings: Settings): string {
  const payload: ExportPayload = {
    app: 'focusflow',
    exportedAt: new Date().toISOString(),
    tasks,
    logs,
    settings,
  }
  return JSON.stringify(payload, null, 2)
}

export function clearAllData(): void {
  Object.values(STORAGE_KEYS).forEach((key) => localStorage.removeItem(key))
}