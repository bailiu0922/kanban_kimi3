<script setup lang="ts">
import { computed } from 'vue'
import { PHASE_LABEL, useTimerStore } from '../../stores/timer'
import ProgressRing from './ProgressRing.vue'
import TaskPicker from './TaskPicker.vue'

const timerStore = useTimerStore()

const ringColor = computed(() =>
  timerStore.phase === 'focus' ? 'var(--color-focus)' : 'var(--color-break)',
)

const primaryAction = computed(() =>
  timerStore.status === 'running' ? '暂停' : timerStore.status === 'paused' ? '继续' : '开始',
)

function onPrimary(): void {
  if (timerStore.status === 'running') timerStore.pause()
  else timerStore.start()
}
</script>

<template>
  <div class="timer-view">
    <div class="view-header">
      <div>
        <h2>番茄钟</h2>
        <p class="view-subtitle">每完成 4 个番茄，自动进入一次长休息</p>
      </div>
    </div>

    <section class="timer-panel" aria-label="番茄钟计时器">
      <div class="phase-badge" :data-phase="timerStore.phase">
        <Transition name="fade" mode="out-in">
          <span :key="timerStore.phase">{{ PHASE_LABEL[timerStore.phase] }}</span>
        </Transition>
      </div>

      <ProgressRing :progress="timerStore.progress" :color="ringColor">
        <div class="ring-center">
          <div class="ring-time" aria-live="off">{{ timerStore.remainingLabel }}</div>
          <div class="ring-task" :title="timerStore.currentTaskTitle">
            {{ timerStore.currentTaskTitle || '未关联任务' }}
          </div>
        </div>
      </ProgressRing>

      <div
        class="cycle-dots"
        role="img"
        :aria-label="`当前 4 番茄周期已完成 ${timerStore.cyclePosition} 个`"
      >
        <span
          v-for="i in 4"
          :key="i"
          class="cycle-dot"
          :class="{ filled: i <= timerStore.cyclePosition }"
          aria-hidden="true"
        >🍅</span>
      </div>

      <div class="timer-controls">
        <button
          type="button"
          class="btn btn-primary btn-lg"
          :aria-label="`${primaryAction}计时`"
          @click="onPrimary"
        >
          {{ timerStore.status === 'running' ? '⏸' : '▶' }} {{ primaryAction }}
        </button>
        <button
          type="button"
          class="btn btn-ghost"
          aria-label="重置计时器"
          :disabled="timerStore.status === 'idle'"
          @click="timerStore.reset()"
        >
          ↺ 重置
        </button>
        <button
          v-if="timerStore.phase !== 'focus'"
          type="button"
          class="btn btn-ghost"
          aria-label="跳过当前休息"
          @click="timerStore.skipBreak()"
        >
          ⏭ 跳过休息
        </button>
      </div>

      <TaskPicker />
    </section>
  </div>
</template>

<style scoped lang="scss">
.timer-view {
  display: flex;
  flex-direction: column;
}

.timer-panel {
  align-self: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-4);
  width: min(520px, 100%);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--space-6);
  box-shadow: var(--shadow-sm);
}

.phase-badge span {
  display: inline-block;
  padding: 4px 16px;
  border-radius: 999px;
  font-weight: 600;
  font-size: 13px;
}

.phase-badge[data-phase='focus'] span {
  background: var(--color-focus-soft);
  color: var(--color-focus);
}

.phase-badge[data-phase='short'] span,
.phase-badge[data-phase='long'] span {
  background: var(--color-break-soft);
  color: var(--color-break);
}

.ring-center {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-2);
}

.ring-time {
  font-size: 54px;
  font-weight: 700;
  letter-spacing: 2px;
  font-variant-numeric: tabular-nums;
  line-height: 1.1;
}

.ring-task {
  font-size: 13px;
  color: var(--color-text-muted);
  max-width: 180px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.cycle-dots {
  display: flex;
  gap: var(--space-2);
  font-size: 16px;
}

.cycle-dot {
  opacity: 0.25;
  filter: grayscale(1);
  transition:
    opacity var(--transition-base),
    filter var(--transition-base);

  &.filled {
    opacity: 1;
    filter: none;
  }
}

.timer-controls {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: var(--space-3);
}

@media (max-width: 768px) {
  .timer-panel {
    padding: var(--space-5) var(--space-4);
  }

  .ring-time {
    font-size: 42px;
  }
}
</style>