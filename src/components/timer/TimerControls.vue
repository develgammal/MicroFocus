<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { computed } from 'vue'
import { useTimerStore } from '@/stores/timer.store'
import { useSettingsStore } from '@/stores/settings.store'
import BaseButton from '@/components/ui/BaseButton.vue'

const { t } = useI18n()
const timerStore = useTimerStore()
const settingsStore = useSettingsStore()

defineEmits<{
  toggle: []
  endSession: []
}>()

const mainButtonLabel = computed(() => {
  if (timerStore.isBreak) return t('timer.resumeSession')
  if (timerStore.isRunning) return t('rating.takeBreak')
  if (timerStore.hasBeenPaused(settingsStore.intervalMinutes)) return t('timer.resumeFocus')
  return t('timer.startFocus')
})

const mainButtonVariant = computed<'primary' | 'secondary' | 'accent' | 'ghost'>(() => {
  if (timerStore.isBreak) return 'secondary'
  if (timerStore.isRunning) return 'ghost'
  return 'primary'
})

const showEndSessionButton = computed(() => {
  return timerStore.isRunning || timerStore.isBreak
})
</script>

<template>
  <div class="flex justify-center gap-3 mt-4 md:mt-6">
    <BaseButton :variant="mainButtonVariant" size="lg" @click="$emit('toggle')">
      {{ mainButtonLabel }}
    </BaseButton>
    <BaseButton
      v-if="showEndSessionButton"
      variant="accent"
      size="lg"
      @click="$emit('endSession')"
    >
      {{ t('timer.endSession') }}
    </BaseButton>
  </div>
</template>
