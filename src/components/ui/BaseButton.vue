<script setup lang="ts">
interface Props {
  variant?: 'primary' | 'secondary' | 'accent' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  type?: 'button' | 'submit' | 'reset'
  ariaLabel?: string
}

withDefaults(defineProps<Props>(), {
  variant: 'primary',
  size: 'md',
  disabled: false,
  type: 'button',
  ariaLabel: undefined,
})

defineEmits<{
  click: [event: MouseEvent]
}>()
</script>

<template>
  <button
    :type="type"
    :disabled="disabled"
    :aria-label="ariaLabel"
    :class="[
      'inline-flex items-center justify-center font-medium rounded-full transition-all duration-200 active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 cursor-pointer',
      {
        // Sizes
        'px-4 py-1.5 text-sm': size === 'sm',
        'px-6 py-2.5 text-base': size === 'md',
        'px-8 py-3 text-lg': size === 'lg',
        // Variants
        'bg-primary text-text-inverse hover:bg-primary-hover shadow-lg focus-visible:outline-primary':
          variant === 'primary',
        'bg-secondary text-text-inverse hover:bg-secondary-hover shadow-lg focus-visible:outline-secondary':
          variant === 'secondary',
        'bg-accent text-text-inverse hover:bg-accent-hover shadow-lg focus-visible:outline-accent':
          variant === 'accent',
        'bg-surface text-text hover:bg-border/50 border border-border focus-visible:outline-primary':
          variant === 'ghost',
        'bg-danger text-text-inverse hover:bg-danger-hover shadow-lg focus-visible:outline-danger':
          variant === 'danger',
        // Disabled
        'opacity-50 cursor-not-allowed pointer-events-none': disabled,
      },
    ]"
    @click="$emit('click', $event)"
  >
    <slot />
  </button>
</template>
