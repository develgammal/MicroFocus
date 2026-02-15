<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useAutoDismiss } from '@/composables/useAutoDismiss'
import { COGNITIVE_CONSTANTS } from '@/constants/app.constants'

const { t } = useI18n()

defineProps<{
  percentChange: number
  breakDurationMinutes: number
}>()

const emit = defineEmits<{
  dismiss: []
}>()

useAutoDismiss(() => emit('dismiss'), COGNITIVE_CONSTANTS.REBOUND_BANNER_DURATION_MS)
</script>

<template>
  <Transition name="fade-slide">
    <div
      class="w-full rounded-xl bg-secondary-soft border border-secondary/20 px-4 py-3 mb-4 cursor-pointer"
      role="status"
      aria-live="polite"
      @click="$emit('dismiss')"
    >
      <p class="text-center text-sm text-text">
        <span class="font-extrabold text-secondary text-lg">+{{ percentChange }}%</span>
        <span class="mx-1">&mdash;</span>
        {{ t('cognitive.reboundMessage', {
          percent: percentChange,
          minutes: breakDurationMinutes,
          breakMinutes: breakDurationMinutes,
        }) }}
      </p>
    </div>
  </Transition>
</template>
