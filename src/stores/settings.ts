import { ref, watch } from 'vue'
import { defineStore } from 'pinia'
import { DEFAULT_SETTINGS, type Settings, type ThemeMode } from '../types'
import { STORAGE_KEYS, loadJSON, saveJSON } from '../utils/storage'

function applyTheme(theme: ThemeMode): void {
  if (theme === 'dark') document.documentElement.dataset.theme = 'dark'
  else delete document.documentElement.dataset.theme
}

export const useSettingsStore = defineStore('settings', () => {
  const settings = ref<Settings>({
    ...DEFAULT_SETTINGS,
    ...loadJSON<Partial<Settings>>(STORAGE_KEYS.settings, {}),
  })

  watch(settings, (v) => saveJSON(STORAGE_KEYS.settings, v), { deep: true })
  watch(() => settings.value.theme, applyTheme, { immediate: true })

  function update(patch: Partial<Settings>): void {
    Object.assign(settings.value, patch)
  }

  function toggleTheme(): void {
    settings.value.theme = settings.value.theme === 'dark' ? 'light' : 'dark'
  }

  return { settings, update, toggleTheme }
})