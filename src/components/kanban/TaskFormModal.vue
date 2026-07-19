<script setup lang="ts">
import { reactive, ref, watch } from 'vue'
import type { Task, TaskStatus } from '../../types'
import { TASK_STATUS_LABEL, TASK_STATUS_ORDER } from '../../types'
import { useTasksStore } from '../../stores/tasks'
import BaseModal from '../common/BaseModal.vue'

const props = defineProps<{ open: boolean; task: Task | null; defaultStatus: TaskStatus }>()
const emit = defineEmits<{ close: [] }>()

const tasksStore = useTasksStore()

const TITLE_MAX = 50

const form = reactive({
  title: '',
  description: '',
  estimate: 1,
  status: 'todo' as TaskStatus,
})
const error = ref('')

watch(
  () => props.open,
  (open) => {
    if (!open) return
    error.value = ''
    if (props.task) {
      form.title = props.task.title
      form.description = props.task.description
      form.estimate = props.task.estimate
      form.status = props.task.status
    } else {
      form.title = ''
      form.description = ''
      form.estimate = 1
      form.status = props.defaultStatus
    }
  },
)

function validate(): string {
  const title = form.title.trim()
  if (!title) return '请输入任务标题'
  if (title.length > TITLE_MAX) return `标题不能超过 ${TITLE_MAX} 字`
  if (!Number.isInteger(form.estimate) || form.estimate < 1) return '预估番茄数需为不小于 1 的整数'
  if (form.estimate > 99) return '预估番茄数最大为 99'
  return ''
}

function submit(): void {
  error.value = validate()
  if (error.value) return
  if (props.task) {
    tasksStore.updateTask(props.task.id, {
      title: form.title,
      description: form.description,
      estimate: form.estimate,
      status: form.status,
    })
  } else {
    tasksStore.addTask({
      title: form.title,
      description: form.description,
      estimate: form.estimate,
      status: form.status,
    })
  }
  emit('close')
}
</script>

<template>
  <BaseModal :open="open" :title="task ? '编辑任务' : '新建任务'" @close="emit('close')">
    <form class="task-form" @submit.prevent="submit">
      <label class="form-field">
        <span class="form-label">标题 <span class="required" aria-hidden="true">*</span></span>
        <input
          v-model="form.title"
          type="text"
          :maxlength="TITLE_MAX"
          placeholder="要做什么？"
          required
          aria-required="true"
        />
        <span class="form-hint">{{ form.title.trim().length }}/{{ TITLE_MAX }}</span>
      </label>

      <label class="form-field">
        <span class="form-label">描述</span>
        <textarea v-model="form.description" rows="3" placeholder="补充细节（可选）"></textarea>
      </label>

      <div class="form-row">
        <label class="form-field">
          <span class="form-label">预估番茄数</span>
          <input v-model.number="form.estimate" type="number" min="1" max="99" step="1" />
        </label>
        <label class="form-field">
          <span class="form-label">所在列</span>
          <select v-model="form.status" aria-label="任务所在列">
            <option v-for="s in TASK_STATUS_ORDER" :key="s" :value="s">
              {{ TASK_STATUS_LABEL[s] }}
            </option>
          </select>
        </label>
      </div>

      <p v-if="error" class="form-error" role="alert">{{ error }}</p>
    </form>

    <template #footer>
      <button type="button" class="btn btn-ghost" @click="emit('close')">取消</button>
      <button type="button" class="btn btn-primary" @click="submit">
        {{ task ? '保存' : '创建' }}
      </button>
    </template>
  </BaseModal>
</template>

<style scoped lang="scss">
.task-form {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.required {
  color: var(--color-danger);
}
</style>