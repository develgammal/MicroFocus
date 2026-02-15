<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import BaseButton from '@/components/ui/BaseButton.vue'
import { CognitiveState } from '@/interfaces'

const { t } = useI18n()

const props = defineProps<{
  percentDecline: number
  windowMinutes: number
  cognitiveState: CognitiveState
  recommendedBreakMinutes: number | null
}>()

defineEmits<{
  break: []
  dismiss: []
}>()

/** Maps cognitive states to their i18n headline keys. */
const HEADLINE_KEYS: Partial<Record<CognitiveState, string>> = {
  [CognitiveState.SteepCrash]: 'cognitive.steepCrash',
  [CognitiveState.Exhaustion]: 'cognitive.exhaustion',
  [CognitiveState.Stagnation]: 'cognitive.stagnation',
  [CognitiveState.InsufficientBreak]: 'cognitive.insufficientBreak',
}

const headline = computed(() =>
  t(HEADLINE_KEYS[props.cognitiveState] ?? 'cognitive.productivityDeclining'),
)

const absPercent = computed(() => Math.abs(props.percentDecline))
const showDeclineStats = computed(() => props.cognitiveState !== CognitiveState.InsufficientBreak)

const breakButtonLabel = computed(() => {
  if (props.recommendedBreakMinutes) {
    return t('cognitive.suggestBreakWithDuration', { minutes: props.recommendedBreakMinutes })
  }
  return t('rating.takeBreak')
})
</script>

<template>
  <div
    class="absolute inset-0 bg-surface/95 backdrop-blur-sm z-10 flex flex-col items-center justify-center p-4"
    role="alertdialog"
    :aria-label="t('cognitive.breakSuggested')"
    aria-modal="true"
  >
    <h2 class="text-heading text-text mb-3 text-center">
      {{ headline }}
    </h2>

    <p
      v-if="showDeclineStats"
      class="text-3xl sm:text-4xl font-extrabold text-accent mb-2 text-center tracking-tight"
    >
      &darr; {{ absPercent }}% {{ t('cognitive.declineStats', { percent: absPercent, minutes: windowMinutes }).replace(`↓ ${absPercent}% `, '') }}
    </p>

    <p class="text-body text-text-muted mb-2 text-center">
      {{ t('cognitive.suggestBreak') }}
    </p>

    <p
      v-if="recommendedBreakMinutes"
      class="text-sm text-text-muted mb-6 text-center"
    >
      {{ t('cognitive.recommendedBreak', { minutes: recommendedBreakMinutes }) }}
    </p>
    <div v-else class="mb-6" />

    <div class="flex flex-col items-center gap-3 w-full max-w-xs">
      <BaseButton variant="primary" size="lg" class="w-full" @click="$emit('break')">
        {{ breakButtonLabel }}
      </BaseButton>
      <BaseButton variant="ghost" size="lg" class="w-full" @click="$emit('dismiss')">
        {{ t('cognitive.continueWorking') }}
      </BaseButton>
    </div>
  </div>
</template>
