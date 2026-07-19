<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useTasksStore } from '../../stores/tasks'
import { useTimerStore } from '../../stores/timer'

const timerStore = useTimerStore()
const tasksStore = useTasksStore()

const doingTasks = computed(() => tasksStore.tasksByStatus('doing'))
const selection = ref<string>('none')
const customText = ref('')

const running = computed(() => timerStore.status === 'running')

// 与 timer store 双向同步（视图缓存恢复时保持选择一致）
watch(
  () => timerStore.currentTaskId,
  (id) => {
    if (id && doingTasks.value.some((t) => t.id === id)) {
      selection.value = id
    } else if (!id && timerStore.currentTaskText) {
      selection.value = 'custom'
      customText.value = timerStore.currentTaskText
    } else if (!id) {
      selection.value = 'none'
    }
  },
  { immediate: true },
)

watch([selection, customText], ([sel, text]) => {
  if (sel === 'none') timerStore.selectTask(null, '')
  else if (sel === 'custom') timerStore.selectTask(null, text)
  else timerStore.selectTask(sel, '')
})
</script>

<template>
  <div class="task-picker">
    <label class="form-field">
      <span class="form-label">关联任务</span>
      <select v-model="selection" :disabled="running" aria-label="选择关联任务">
        <option value="none">不关联任务</option>
        <option v-for="t in doingTasks" :key="t.id" :value="t.id">
          {{ t.title }}（🍅 {{ t.completedPomodoros }}/{{ t.estimate }}）
        </option>
        <option value="custom">自定义任务名…</option>
      </select>
    </label>

    <input
      v-if="selection === 'custom'"
      v-model="customText"
      type="text"
      maxlength="50"
      placeholder="输入本次专注的任务名"
      :disabled="running"
      aria-label="自定义任务名"
    />

    <p v-if="doingTasks.length === 0 && selection === 'none'" class="picker-hint">
      「进行中」列暂无任务：可把看板任务拖入该列后关联，或选择自定义任务名
    </p>
  </div>
</template>

<style scoped lang="scss">
.task-picker {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.picker-hint {
  font-size: 12px;
  color: var(--color-text-muted);
}
</style>