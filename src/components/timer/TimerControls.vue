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
}>()

const buttonLabel = computed(() => {
  if (timerStore.isBreak) return t('timer.endBreak')
  if (timerStore.isRunning) return t('timer.pause')
  if (timerStore.hasBeenPaused(settingsStore.intervalMinutes)) return t('timer.resumeFocus')
  return t('timer.startFocus')
})

const buttonVariant = computed<'primary' | 'secondary' | 'accent'>(() => {
  if (timerStore.isBreak) return 'secondary'
  if (timerStore.isRunning) return 'accent'
  return 'primary'
})
</script>

<template>
  <div class="flex justify-center mt-4 md:mt-6">
    <BaseButton :variant="buttonVariant" size="lg" @click="$emit('toggle')">
      {{ buttonLabel }}
    </BaseButton>
  </div>
</template>
