<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import ScoreButton from '@/components/ui/ScoreButton.vue'
import BaseButton from '@/components/ui/BaseButton.vue'

const { t } = useI18n()

defineProps<{
  showBreakOption?: boolean
  sessionDurationMinutes?: number
}>()

defineEmits<{
  score: [value: number]
  break: []
}>()

const scores = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
</script>

<template>
  <div
    class="absolute inset-0 bg-surface/95 backdrop-blur-sm z-10 flex flex-col items-center justify-center p-4"
    role="dialog"
    :aria-label="t('rating.sessionComplete')"
    aria-modal="true"
  >
    <h2 class="text-heading text-text mb-2">
      {{ t('rating.sessionComplete') }}
    </h2>
    <p class="text-body text-text-muted mb-6">
      {{ sessionDurationMinutes
        ? t('rating.rateProductivity', { duration: Math.round(sessionDurationMinutes) })
        : t('rating.rateOrBreak')
      }}
    </p>

    <div class="grid grid-cols-5 gap-3 mb-6">
      <ScoreButton v-for="s in scores" :key="s" :score="s" @select="$emit('score', s)" />
    </div>

    <BaseButton
      v-if="showBreakOption !== false"
      variant="ghost"
      size="lg"
      class="w-full min-w-[200px] max-w-xs"
      @click="$emit('break')"
    >
      {{ t('rating.takeBreak') }}
    </BaseButton>
  </div>
</template>
