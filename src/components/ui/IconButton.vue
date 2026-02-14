<script setup lang="ts">
interface Props {
  ariaLabel: string
}

defineProps<Props>()

defineEmits<{
  click: [event: MouseEvent]
}>()
</script>

<template>
  <button
    :aria-label="ariaLabel"
    class="p-2 rounded-lg text-text-muted hover:text-primary transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-primary cursor-pointer"
    @click="$emit('click', $event)"
  >
    <slot />
  </button>
</template>
