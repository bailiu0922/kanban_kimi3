import { computed, ref, watch } from 'vue'
import { defineStore } from 'pinia'
import type { Task, TaskStatus } from '../types'
import { STORAGE_KEYS, loadJSON, saveJSON } from '../utils/storage'
import { uid } from '../utils/id'
import { toDateKey, todayKey } from '../utils/date'

export interface TaskInput {
  title: string
  description: string
  estimate: number
  status: TaskStatus
}

export const useTasksStore = defineStore('tasks', () => {
  const tasks = ref<Task[]>(loadJSON<Task[]>(STORAGE_KEYS.tasks, []))

  watch(tasks, (v) => saveJSON(STORAGE_KEYS.tasks, v), { deep: true })

  /** 按列分组且按 order 排序的任务列表 */
  const sortedByStatus = computed<Record<TaskStatus, Task[]>>(() => {
    const map: Record<TaskStatus, Task[]> = { todo: [], doing: [], done: [] }
    for (const task of tasks.value) map[task.status].push(task)
    for (const key of Object.keys(map) as TaskStatus[]) {
      map[key].sort((a, b) => a.order - b.order || a.createdAt - b.createdAt)
    }
    return map
  })

  function tasksByStatus(status: TaskStatus): Task[] {
    return sortedByStatus.value[status]
  }

  function countByStatus(status: TaskStatus): number {
    return sortedByStatus.value[status].length
  }

  function nextOrder(status: TaskStatus): number {
    const list = sortedByStatus.value[status]
    return list.length ? Math.max(...list.map((t) => t.order)) + 1 : 0
  }

  function reindex(status: TaskStatus): void {
    sortedByStatus.value[status].forEach((t, i) => {
      t.order = i
    })
  }

  function addTask(input: TaskInput): Task {
    const task: Task = {
      id: uid(),
      title: input.title.trim(),
      description: input.description.trim(),
      estimate: input.estimate,
      completedPomodoros: 0,
      status: input.status,
      order: nextOrder(input.status),
      createdAt: Date.now(),
      completedAt: input.status === 'done' ? Date.now() : null,
    }
    tasks.value.push(task)
    return task
  }

  function updateTask(id: string, patch: Partial<TaskInput>): void {
    const task = tasks.value.find((t) => t.id === id)
    if (!task) return
    const prevStatus = task.status
    if (patch.title !== undefined) task.title = patch.title.trim()
    if (patch.description !== undefined) task.description = patch.description.trim()
    if (patch.estimate !== undefined) task.estimate = patch.estimate
    if (patch.status && patch.status !== prevStatus) {
      task.status = patch.status
      task.completedAt = patch.status === 'done' ? Date.now() : null
      task.order = nextOrder(patch.status)
      reindex(prevStatus)
    }
  }

  function removeTask(id: string): void {
    const task = tasks.value.find((t) => t.id === id)
    if (!task) return
    tasks.value = tasks.value.filter((t) => t.id !== id)
    reindex(task.status)
  }

  /** 拖拽落点更新：支持跨列移动与同列重排 */
  function moveTask(id: string, toStatus: TaskStatus, toIndex: number): void {
    const task = tasks.value.find((t) => t.id === id)
    if (!task) return
    const fromStatus = task.status
    const target = sortedByStatus.value[toStatus].filter((t) => t.id !== id)
    const index = Math.max(0, Math.min(toIndex, target.length))
    target.splice(index, 0, task)
    task.status = toStatus
    task.completedAt = toStatus === 'done' ? (task.completedAt ?? Date.now()) : null
    target.forEach((t, i) => {
      t.order = i
    })
    if (fromStatus !== toStatus) reindex(fromStatus)
  }

  function incrementPomodoro(id: string | null): void {
    if (!id) return
    const task = tasks.value.find((t) => t.id === id)
    if (task) task.completedPomodoros += 1
  }

  /** 今日完成的任务数（按 completedAt 归属日期） */
  const doneTodayCount = computed(
    () =>
      tasks.value.filter(
        (t) => t.completedAt !== null && toDateKey(new Date(t.completedAt)) === todayKey(),
      ).length,
  )

  return {
    tasks,
    sortedByStatus,
    tasksByStatus,
    countByStatus,
    doneTodayCount,
    addTask,
    updateTask,
    removeTask,
    moveTask,
    incrementPomodoro,
  }
})