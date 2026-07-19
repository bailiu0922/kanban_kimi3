<script setup lang="ts">
import type { Task } from '../../types'
import { useKanbanDnd } from '../../composables/useKanbanDnd'

const props = defineProps<{ task: Task }>()
const emit = defineEmits<{ edit: [task: Task]; remove: [task: Task] }>()

const { dnd, startDrag, endDrag } = useKanbanDnd()

function onDragStart(e: DragEvent): void {
  startDrag(props.task.id)
  e.dataTransfer?.setData('text/plain', props.task.id)
  if (e.dataTransfer) e.dataTransfer.effectAllowed = 'move'
}
</script>

<template>
  <article
    class="kanban-card"
    :class="{ dragging: dnd.draggingId === task.id }"
    draggable="true"
    tabindex="0"
    :aria-label="`任务：${task.title}，按回车编辑`"
    @dragstart="onDragStart"
    @dragend="endDrag"
    @click="emit('edit', task)"
    @keydown.enter="emit('edit', task)"
  >
    <h4 class="card-title">{{ task.title }}</h4>
    <p v-if="task.description" class="card-desc">{{ task.description }}</p>
    <footer class="card-footer">
      <span class="card-pomodoros" :aria-label="`番茄进度 ${task.completedPomodoros} / ${task.estimate}`">
        🍅 {{ task.completedPomodoros }}/{{ task.estimate }}
      </span>
      <button
        type="button"
        class="btn-icon card-delete"
        :aria-label="`删除任务 ${task.title}`"
        @click.stop="emit('remove', task)"
      >
        🗑
      </button>
    </footer>
  </article>
</template>

<style scoped lang="scss">
.kanban-card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: 10px 12px;
  cursor: grab;
  box-shadow: var(--shadow-sm);
  animation: card-in var(--transition-base);
  transition:
    box-shadow var(--transition-fast),
    opacity var(--transition-fast),
    border-color var(--transition-fast);

  &:hover {
    box-shadow: var(--shadow-md);
  }

  &:focus-visible {
    outline: none;
    border-color: var(--color-primary);
  }

  &.dragging {
    opacity: 0.45;
    cursor: grabbing;
  }
}

@keyframes card-in {
  from {
    opacity: 0;
    transform: translateY(6px);
  }

  to {
    opacity: 1;
    transform: none;
  }
}

.card-title {
  font-size: 14px;
  line-height: 1.4;
  word-break: break-word;
}

.card-desc {
  margin-top: 4px;
  font-size: 12px;
  color: var(--color-text-muted);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  word-break: break-word;
}

.card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 8px;
}

.card-pomodoros {
  font-size: 12px;
  color: var(--color-text-muted);
}

.card-delete {
  opacity: 0;
  transition: opacity var(--transition-fast);

  .kanban-card:hover &,
  .kanban-card:focus-within & {
    opacity: 1;
  }
}

@media (hover: none) {
  .card-delete {
    opacity: 1;
  }
}
</style>