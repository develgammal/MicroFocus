<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import ScoreButton from '@/components/ui/ScoreButton.vue'
import BaseButton from '@/components/ui/BaseButton.vue'

const { t } = useI18n()

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
      {{ t('rating.rateOrBreak') }}
    </p>

    <div class="grid grid-cols-5 gap-3 mb-6">
      <ScoreButton v-for="s in scores" :key="s" :score="s" @select="$emit('score', s)" />
    </div>

    <BaseButton variant="ghost" size="lg" class="w-full max-w-xs" @click="$emit('break')">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="h-5 w-5 mr-2"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        aria-hidden="true"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
        />
      </svg>
      {{ t('rating.takeBreak') }}
    </BaseButton>
  </div>
</template>
