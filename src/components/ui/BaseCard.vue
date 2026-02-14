<script setup lang="ts">
interface Props {
  padding?: 'sm' | 'md' | 'lg'
}

withDefaults(defineProps<Props>(), {
  padding: 'md',
})
</script>

<template>
  <div
    :class="[
      'bg-surface rounded-2xl shadow-xl transition-colors duration-500 relative overflow-hidden',
      {
        'p-3 sm:p-4': padding === 'sm',
        'p-4 sm:p-6 md:p-8': padding === 'md',
        'p-6 sm:p-8 md:p-10': padding === 'lg',
      },
    ]"
  >
    <slot />
  </div>
</template>
