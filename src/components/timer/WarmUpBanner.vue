<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useAutoDismiss } from '@/composables/useAutoDismiss'
import { COGNITIVE_CONSTANTS } from '@/constants/app.constants'

const { t } = useI18n()

const emit = defineEmits<{
  dismiss: []
}>()

useAutoDismiss(() => emit('dismiss'), COGNITIVE_CONSTANTS.WARMUP_BANNER_DURATION_MS)
</script>

<template>
  <Transition name="fade-slide">
    <div
      class="w-full rounded-xl bg-primary-soft border border-primary/20 px-4 py-3 mb-4 cursor-pointer"
      role="status"
      aria-live="polite"
      @click="$emit('dismiss')"
    >
      <p class="text-center text-sm text-text font-medium">
        <span class="text-primary font-bold">&uarr;</span>
        {{ t('cognitive.warmUpMessage') }}
      </p>
    </div>
  </Transition>
</template>
