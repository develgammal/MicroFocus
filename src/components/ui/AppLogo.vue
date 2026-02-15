<script setup lang="ts">
interface Props {
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

const props = withDefaults(defineProps<Props>(), {
  size: 'md',
})

const sizeClasses = {
  sm: 'h-6 w-6',
  md: 'h-8 w-8',
  lg: 'h-12 w-12',
  xl: 'h-16 w-16',
}
</script>

<template>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 32 32"
    :class="[sizeClasses[size], 'flex-shrink-0']"
    aria-hidden="true"
  >
    <!-- Background circle -->
    <circle cx="16" cy="16" r="16" fill="currentColor" class="text-primary" />
    <!-- Outer ring (focus waves) -->
    <circle
      cx="16"
      cy="16"
      r="13"
      fill="none"
      stroke="currentColor"
      stroke-width="1.5"
      opacity="0.4"
      class="text-white dark:text-white"
    />
    <!-- Middle ring -->
    <circle
      cx="16"
      cy="16"
      r="9"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      opacity="0.6"
      class="text-white dark:text-white"
    />
    <!-- Inner circle (focus point) -->
    <circle cx="16" cy="16" r="5" fill="currentColor" class="text-white dark:text-white" />
    <!-- Center dot -->
    <circle cx="16" cy="16" r="2" fill="currentColor" class="text-primary" />
  </svg>
</template>
