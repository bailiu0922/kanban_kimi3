<script setup lang="ts">
import { useSettingsStore } from '../../stores/settings'
import type { ViewKey } from '../../types'

const view = defineModel<ViewKey>({ required: true })
const settingsStore = useSettingsStore()

const NAV_ITEMS: { key: ViewKey; label: string; icon: string }[] = [
  { key: 'kanban', label: '看板', icon: '🗂️' },
  { key: 'timer', label: '番茄钟', icon: '🍅' },
  { key: 'stats', label: '统计', icon: '📊' },
  { key: 'settings', label: '设置', icon: '⚙️' },
]
</script>

<template>
  <header class="app-nav">
    <div class="brand">
      <span class="brand-logo" aria-hidden="true">🍅</span>
      <span class="brand-name">FocusFlow</span>
    </div>

    <nav class="nav-tabs" aria-label="主导航">
      <button
        v-for="item in NAV_ITEMS"
        :key="item.key"
        type="button"
        class="nav-tab"
        :class="{ active: view === item.key }"
        :aria-current="view === item.key ? 'page' : undefined"
        :aria-label="`切换到${item.label}视图`"
        @click="view = item.key"
      >
        <span aria-hidden="true">{{ item.icon }}</span>
        <span class="tab-label">{{ item.label }}</span>
      </button>
    </nav>

    <button
      type="button"
      class="btn-icon theme-toggle"
      :aria-label="settingsStore.settings.theme === 'dark' ? '切换到浅色模式' : '切换到深色模式'"
      @click="settingsStore.toggleTheme()"
    >
      {{ settingsStore.settings.theme === 'dark' ? '🌞' : '🌙' }}
    </button>
  </header>
</template>

<style scoped lang="scss">
.app-nav {
  position: sticky;
  top: 0;
  z-index: 50;
  display: flex;
  align-items: center;
  gap: var(--space-4);
  padding: var(--space-3) var(--space-4);
  background: var(--color-surface);
  border-bottom: 1px solid var(--color-border);
}

.brand {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-weight: 700;
  font-size: 16px;
  margin-right: var(--space-3);
}

.brand-logo {
  font-size: 20px;
}

.nav-tabs {
  display: flex;
  gap: var(--space-1);
  flex: 1;
  overflow-x: auto;
}

.nav-tab {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  border: none;
  border-radius: var(--radius-md);
  background: transparent;
  color: var(--color-text-muted);
  font: inherit;
  white-space: nowrap;
  cursor: pointer;
  transition:
    background-color var(--transition-fast),
    color var(--transition-fast);

  &:hover {
    background: var(--color-surface-2);
  }

  &.active {
    background: var(--color-primary-soft);
    color: var(--color-primary);
    font-weight: 600;
  }
}

.theme-toggle {
  font-size: 16px;
  flex-shrink: 0;
}

@media (max-width: 768px) {
  .brand-name {
    display: none;
  }

  .nav-tab {
    padding: 8px 10px;
  }
}
</style>