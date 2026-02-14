<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useTimerStore } from '@/stores/timer.store'

const { t } = useI18n()
const timerStore = useTimerStore()
</script>

<template>
  <div
    class="text-center py-4 md:py-6"
    role="timer"
    :aria-label="t('a11y.timerDisplay', { time: timerStore.displayTime })"
  >
    <div
      class="text-subheading mb-2 transition-colors duration-300"
      :class="timerStore.isBreak ? 'text-secondary' : 'text-primary'"
    >
      {{ timerStore.isBreak ? t('timer.breakTime') : t('timer.focusSession') }}
    </div>

    <div
      class="text-display transition-colors duration-300"
      :class="timerStore.isBreak ? 'text-secondary' : 'text-text'"
      aria-live="off"
    >
      {{ timerStore.displayTime }}
    </div>
  </div>
</template>
