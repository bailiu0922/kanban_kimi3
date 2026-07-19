<script setup lang="ts">
import BaseModal from './BaseModal.vue'

withDefaults(
  defineProps<{ open: boolean; title: string; message: string; confirmText?: string }>(),
  { confirmText: '确认删除' },
)

const emit = defineEmits<{ confirm: []; cancel: [] }>()
</script>

<template>
  <BaseModal :open="open" :title="title" @close="emit('cancel')">
    <p class="confirm-message">{{ message }}</p>
    <template #footer>
      <button type="button" class="btn btn-ghost" @click="emit('cancel')">取消</button>
      <button type="button" class="btn btn-danger" @click="emit('confirm')">{{ confirmText }}</button>
    </template>
  </BaseModal>
</template>

<style scoped>
.confirm-message {
  color: var(--color-text);
  line-height: 1.7;
}
</style>