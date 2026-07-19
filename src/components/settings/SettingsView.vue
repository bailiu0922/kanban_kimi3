<script setup lang="ts">
import { computed, ref } from 'vue'
import { useSettingsStore } from '../../stores/settings'
import { useTasksStore } from '../../stores/tasks'
import { useStatsStore } from '../../stores/stats'
import { buildExportPayload, clearAllData } from '../../utils/storage'
import ConfirmDialog from '../common/ConfirmDialog.vue'

const settingsStore = useSettingsStore()
const tasksStore = useTasksStore()
const statsStore = useStatsStore()

function clampInt(v: number, min: number, max: number): number {
  const n = Math.round(Number(v) || min)
  return Math.min(max, Math.max(min, n))
}

function durationField(key: 'focusMinutes' | 'shortMinutes' | 'longMinutes', min: number, max: number) {
  return computed({
    get: () => settingsStore.settings[key],
    set: (v: number) => settingsStore.update({ [key]: clampInt(v, min, max) }),
  })
}

const focusMinutes = durationField('focusMinutes', 5, 60)
const shortMinutes = durationField('shortMinutes', 1, 30)
const longMinutes = durationField('longMinutes', 1, 60)

const autoStartNext = computed({
  get: () => settingsStore.settings.autoStartNext,
  set: (v: boolean) => settingsStore.update({ autoStartNext: v }),
})

const soundEnabled = computed({
  get: () => settingsStore.settings.soundEnabled,
  set: (v: boolean) => settingsStore.update({ soundEnabled: v }),
})

const confirmClearOpen = ref(false)

function exportData(): void {
  const json = buildExportPayload(tasksStore.tasks, statsStore.logs, settingsStore.settings)
  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `focusflow-backup-${new Date().toISOString().slice(0, 10)}.json`
  a.click()
  URL.revokeObjectURL(url)
}

function clearData(): void {
  clearAllData()
  location.reload()
}
</script>

<template>
  <div class="settings-view">
    <div class="view-header">
      <div>
        <h2>设置</h2>
        <p class="view-subtitle">所有设置即时生效并持久化到本地</p>
      </div>
    </div>

    <section class="panel settings-group" aria-label="计时设置">
      <h3 class="panel-title">计时</h3>

      <div class="settings-row">
        <div>
          <div class="row-label">专注时长（分钟）</div>
          <div class="row-desc">范围 5–60，默认 25</div>
        </div>
        <input v-model.number="focusMinutes" type="number" min="5" max="60" step="1" aria-label="专注时长（分钟）" />
      </div>

      <div class="settings-row">
        <div>
          <div class="row-label">短休息（分钟）</div>
          <div class="row-desc">范围 1–30，默认 5</div>
        </div>
        <input v-model.number="shortMinutes" type="number" min="1" max="30" step="1" aria-label="短休息时长（分钟）" />
      </div>

      <div class="settings-row">
        <div>
          <div class="row-label">长休息（分钟）</div>
          <div class="row-desc">范围 1–60，默认 15，每 4 个番茄触发</div>
        </div>
        <input v-model.number="longMinutes" type="number" min="1" max="60" step="1" aria-label="长休息时长（分钟）" />
      </div>
    </section>

    <section class="panel settings-group" aria-label="偏好设置">
      <h3 class="panel-title">偏好</h3>

      <div class="settings-row">
        <div>
          <div class="row-label">自动开始下一阶段</div>
          <div class="row-desc">阶段结束后无需手动点击，直接进入下一阶段</div>
        </div>
        <input v-model="autoStartNext" type="checkbox" class="switch" role="switch" aria-label="自动开始下一阶段" />
      </div>

      <div class="settings-row">
        <div>
          <div class="row-label">提示音</div>
          <div class="row-desc">阶段切换时播放提示音（WebAudio 合成）</div>
        </div>
        <input v-model="soundEnabled" type="checkbox" class="switch" role="switch" aria-label="提示音开关" />
      </div>
    </section>

    <section class="panel settings-group" aria-label="数据管理">
      <h3 class="panel-title">数据</h3>

      <div class="settings-row">
        <div>
          <div class="row-label">导出数据</div>
          <div class="row-desc">任务、专注日志与设置导出为 JSON 文件</div>
        </div>
        <button type="button" class="btn btn-ghost" aria-label="导出全部数据" @click="exportData">
          ⬇ 导出 JSON
        </button>
      </div>

      <div class="settings-row">
        <div>
          <div class="row-label">清空数据</div>
          <div class="row-desc">删除全部本地数据并重置应用，不可恢复</div>
        </div>
        <button type="button" class="btn btn-danger" aria-label="清空全部数据" @click="confirmClearOpen = true">
          🗑 清空重置
        </button>
      </div>
    </section>

    <ConfirmDialog
      :open="confirmClearOpen"
      title="清空全部数据"
      message="将删除所有任务、专注日志与设置，且不可恢复。建议先导出备份。确定继续吗？"
      confirm-text="清空并重置"
      @confirm="clearData"
      @cancel="confirmClearOpen = false"
    />
  </div>
</template>

<style scoped lang="scss">
.settings-view {
  max-width: 640px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.settings-group {
  display: flex;
  flex-direction: column;
}

.settings-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-4);
  padding: var(--space-3) 0;
  border-bottom: 1px solid var(--color-border);

  &:last-child {
    border-bottom: none;
  }

  input[type='number'] {
    width: 90px;
    flex-shrink: 0;
  }

  .btn {
    flex-shrink: 0;
  }
}

.row-label {
  font-weight: 500;
}

.row-desc {
  font-size: 12px;
  color: var(--color-text-muted);
  margin-top: 2px;
}

.switch {
  appearance: none;
  position: relative;
  width: 44px;
  height: 24px;
  flex-shrink: 0;
  border: none;
  border-radius: 999px;
  background: var(--color-border);
  cursor: pointer;
  transition: background-color var(--transition-fast);

  &::after {
    content: '';
    position: absolute;
    top: 3px;
    left: 3px;
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: #fff;
    transition: transform var(--transition-fast);
  }

  &:checked {
    background: var(--color-primary);
  }

  &:checked::after {
    transform: translateX(20px);
  }

  &:focus-visible {
    outline: 2px solid var(--color-primary);
    outline-offset: 2px;
  }
}
</style>