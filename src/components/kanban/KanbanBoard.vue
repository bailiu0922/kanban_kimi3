<script setup lang="ts">
import { computed, ref } from 'vue'
import type { Task, TaskStatus } from '../../types'
import { TASK_STATUS_ORDER } from '../../types'
import { useTasksStore } from '../../stores/tasks'
import KanbanColumn from './KanbanColumn.vue'
import TaskFormModal from './TaskFormModal.vue'
import ConfirmDialog from '../common/ConfirmDialog.vue'

const tasksStore = useTasksStore()

const formOpen = ref(false)
const editingTask = ref<Task | null>(null)
const defaultStatus = ref<TaskStatus>('todo')

const confirmOpen = ref(false)
const deletingTask = ref<Task | null>(null)

const isEmpty = computed(() => tasksStore.tasks.length === 0)

function openCreate(status: TaskStatus = 'todo'): void {
  editingTask.value = null
  defaultStatus.value = status
  formOpen.value = true
}

function openEdit(task: Task): void {
  editingTask.value = task
  formOpen.value = true
}

function askDelete(task: Task): void {
  deletingTask.value = task
  confirmOpen.value = true
}

function confirmDelete(): void {
  if (deletingTask.value) tasksStore.removeTask(deletingTask.value.id)
  confirmOpen.value = false
  deletingTask.value = null
}
</script>

<template>
  <div class="kanban-view">
    <div class="view-header">
      <div>
        <h2>任务看板</h2>
        <p class="view-subtitle">点击卡片编辑，拖拽卡片在列之间移动或调整顺序</p>
      </div>
      <button type="button" class="btn btn-primary" aria-label="新建任务" @click="openCreate()">
        ＋ 新建任务
      </button>
    </div>

    <div v-if="isEmpty" class="empty-hero">
      <div class="empty-icon" aria-hidden="true">🗒️</div>
      <h3>看板还是空的</h3>
      <p>创建第一个任务，搭配番茄钟开始高效专注吧！</p>
      <button type="button" class="btn btn-primary" @click="openCreate()">创建任务</button>
    </div>

    <div v-else class="kanban-board">
      <KanbanColumn
        v-for="status in TASK_STATUS_ORDER"
        :key="status"
        :status="status"
        :tasks="tasksStore.tasksByStatus(status)"
        @edit="openEdit"
        @remove="askDelete"
        @create="openCreate"
      />
    </div>

    <TaskFormModal
      :open="formOpen"
      :task="editingTask"
      :default-status="defaultStatus"
      @close="formOpen = false"
    />

    <ConfirmDialog
      :open="confirmOpen"
      title="删除任务"
      :message="`确定要删除任务「${deletingTask?.title ?? ''}」吗？此操作不可恢复。`"
      confirm-text="删除"
      @confirm="confirmDelete"
      @cancel="confirmOpen = false"
    />
  </div>
</template>

<style scoped lang="scss">
.kanban-board {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: var(--space-4);
  align-items: start;
}

@media (max-width: 768px) {
  .kanban-board {
    grid-template-columns: 1fr;
  }
}
</style>