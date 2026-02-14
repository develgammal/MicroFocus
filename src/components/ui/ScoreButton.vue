<script setup lang="ts">
import { useI18n } from 'vue-i18n'

interface Props {
  score: number
}

const props = defineProps<Props>()

const { t } = useI18n()

defineEmits<{
  select: [score: number]
}>()

function getScoreColorClasses(score: number): string {
  if (score <= 2)
    return 'border-score-low text-score-low hover:bg-score-low hover:text-text-inverse'
  if (score <= 4)
    return 'border-score-mid-low text-score-mid-low hover:bg-score-mid-low hover:text-text-inverse'
  if (score <= 6)
    return 'border-score-mid text-score-mid hover:bg-score-mid hover:text-text-inverse'
  if (score <= 8)
    return 'border-score-mid-high text-score-mid-high hover:bg-score-mid-high hover:text-text-inverse'
  return 'border-score-high text-score-high hover:bg-score-high hover:text-text-inverse'
}

function getScoreEmoji(score: number): string {
  const emojiMap: Record<number, string> = {
    1: '😫',
    2: '😞',
    3: '😕',
    4: '🙁',
    5: '😐',
    6: '🙂',
    7: '😊',
    8: '😃',
    9: '😄',
    10: '🤩'
  }
  return emojiMap[score] || '😐'
}
</script>

<template>
  <button
    :aria-label="t('a11y.scoreButton', { score: props.score })"
    :class="[
      'w-16 h-16 md:w-20 md:h-20 rounded-full border-2 font-bold',
      'transition-all duration-200 hover:scale-110 active:scale-95 cursor-pointer',
      'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary',
      'bg-surface flex flex-col items-center justify-center',
      getScoreColorClasses(props.score),
    ]"
    @click="$emit('select', props.score)"
  >
    <span class="text-2xl md:text-3xl leading-none mb-0.5">{{ getScoreEmoji(props.score) }}</span>
    <span class="text-xs md:text-sm">{{ props.score }}</span>
  </button>
</template>
