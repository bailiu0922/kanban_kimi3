<script setup lang="ts">
import { ref } from 'vue'
import type { Task, TaskStatus } from '../../types'
import { TASK_STATUS_LABEL } from '../../types'
import { useTasksStore } from '../../stores/tasks'
import { useKanbanDnd } from '../../composables/useKanbanDnd'
import KanbanCard from './KanbanCard.vue'

const props = defineProps<{ status: TaskStatus; tasks: Task[] }>()
const emit = defineEmits<{
  edit: [task: Task]
  remove: [task: Task]
  create: [status: TaskStatus]
}>()

const tasksStore = useTasksStore()
const { dnd, endDrag, setIndicator, clearIndicator } = useKanbanDnd()
const listRef = ref<HTMLElement | null>(null)

/** 根据鼠标 Y 坐标计算插入位置（支持列内重排） */
function computeInsertIndex(e: DragEvent): number {
  const list = listRef.value
  if (!list) return props.tasks.length
  const cards = Array.from(list.querySelectorAll<HTMLElement>('.kanban-card'))
  for (let i = 0; i < cards.length; i++) {
    const rect = cards[i].getBoundingClientRect()
    if (e.clientY < rect.top + rect.height / 2) return i
  }
  return cards.length
}

function onDragOver(e: DragEvent): void {
  if (!dnd.draggingId) return
  e.preventDefault()
  if (e.dataTransfer) e.dataTransfer.dropEffect = 'move'
  setIndicator({ status: props.status, index: computeInsertIndex(e) })
}

function onDragLeave(e: DragEvent): void {
  const related = e.relatedTarget as Node | null
  if (!(e.currentTarget as HTMLElement).contains(related)) {
    clearIndicator(props.status)
  }
}

function onDrop(e: DragEvent): void {
  e.preventDefault()
  const id = e.dataTransfer?.getData('text/plain') || dnd.draggingId
  if (id) tasksStore.moveTask(id, props.status, computeInsertIndex(e))
  endDrag()
}

function showIndicatorAt(index: number): boolean {
  return dnd.indicator?.status === props.status && dnd.indicator.index === index
}
</script>

<template>
  <section
    class="kanban-column"
    :class="`col-${status}`"
    :aria-label="`${TASK_STATUS_LABEL[status]}列，共 ${tasks.length} 个任务`"
    @dragover="onDragOver"
    @dragleave="onDragLeave"
    @drop="onDrop"
  >
    <header class="column-header">
      <span class="column-dot" aria-hidden="true"></span>
      <h3 class="column-title">{{ TASK_STATUS_LABEL[status] }}</h3>
      <span class="column-count">{{ tasks.length }}</span>
      <button
        type="button"
        class="btn-icon column-add"
        :aria-label="`在「${TASK_STATUS_LABEL[status]}」中新建任务`"
        @click="emit('create', status)"
      >
        ＋
      </button>
    </header>

    <div ref="listRef" class="column-list">
      <template v-for="(task, i) in tasks" :key="task.id">
        <div v-if="showIndicatorAt(i)" class="insert-indicator" aria-hidden="true"></div>
        <KanbanCard
          :task="task"
          @edit="emit('edit', $event)"
          @remove="emit('remove', $event)"
        />
      </template>
      <div v-if="showIndicatorAt(tasks.length)" class="insert-indicator" aria-hidden="true"></div>
      <p v-if="tasks.length === 0 && dnd.indicator?.status !== status" class="column-empty">
        暂无任务，可拖拽卡片到此处
      </p>
    </div>
  </section>
</template>

<style scoped lang="scss">
.kanban-column {
  background: var(--color-surface-2);
  border-radius: var(--radius-lg);
  padding: var(--space-3);
}

.column-header {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: 4px 6px 10px;
}

.column-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;

  .col-todo & {
    background: var(--color-todo);
  }

  .col-doing & {
    background: var(--color-doing);
  }

  .col-done & {
    background: var(--color-done);
  }
}

.column-title {
  font-size: 14px;
}

.column-count {
  min-width: 22px;
  text-align: center;
  font-size: 12px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 999px;
  padding: 0 8px;
  color: var(--color-text-muted);
}

.column-add {
  margin-left: auto;
}

.column-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  min-height: 80px;
}

.column-empty {
  text-align: center;
  color: var(--color-text-muted);
  font-size: 13px;
  padding: var(--space-4) var(--space-2);
  border: 1px dashed var(--color-border);
  border-radius: var(--radius-md);
}

.insert-indicator {
  height: 3px;
  border-radius: 2px;
  background: var(--color-primary);
  animation: indicator-in var(--transition-fast);
}

@keyframes indicator-in {
  from {
    opacity: 0;
    transform: scaleX(0.6);
  }

  to {
    opacity: 1;
    transform: none;
  }
}
</style>