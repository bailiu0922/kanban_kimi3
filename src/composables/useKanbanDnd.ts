import { reactive, readonly } from 'vue'
import type { TaskStatus } from '../types'

export interface DropIndicator {
  status: TaskStatus
  index: number
}

interface DndState {
  draggingId: string | null
  indicator: DropIndicator | null
}

/** 看板拖拽共享状态（模块级单例，列/卡片组件共用） */
const state = reactive<DndState>({
  draggingId: null,
  indicator: null,
})

export function useKanbanDnd() {
  function startDrag(id: string): void {
    state.draggingId = id
  }

  function endDrag(): void {
    state.draggingId = null
    state.indicator = null
  }

  function setIndicator(indicator: DropIndicator): void {
    state.indicator = indicator
  }

  function clearIndicator(status?: TaskStatus): void {
    if (!status || state.indicator?.status === status) state.indicator = null
  }

  return {
    dnd: readonly(state),
    startDrag,
    endDrag,
    setIndicator,
    clearIndicator,
  }
}