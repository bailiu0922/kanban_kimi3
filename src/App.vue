<script setup lang="ts">
import { computed, ref } from 'vue'
import type { ViewKey } from './types'
import AppNav from './components/layout/AppNav.vue'
import KanbanBoard from './components/kanban/KanbanBoard.vue'
import TimerView from './components/timer/TimerView.vue'
import StatsView from './components/stats/StatsView.vue'
import SettingsView from './components/settings/SettingsView.vue'

const currentView = ref<ViewKey>('kanban')

const viewComponent = computed(() => {
  switch (currentView.value) {
    case 'timer':
      return TimerView
    case 'stats':
      return StatsView
    case 'settings':
      return SettingsView
    default:
      return KanbanBoard
  }
})
</script>

<template>
  <AppNav v-model="currentView" />
  <main class="app-main">
    <KeepAlive>
      <component :is="viewComponent" />
    </KeepAlive>
  </main>
</template>