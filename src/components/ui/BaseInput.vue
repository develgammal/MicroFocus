<script setup lang="ts">
interface Props {
  modelValue: string | number
  type?: 'text' | 'number'
  label: string
  id: string
  placeholder?: string
  min?: number
  max?: number
  step?: string
}

withDefaults(defineProps<Props>(), {
  type: 'text',
  placeholder: '',
  min: undefined,
  max: undefined,
  step: undefined,
})

defineEmits<{
  'update:modelValue': [value: string | number]
}>()
</script>

<template>
  <div class="flex flex-col gap-1">
    <label :for="id" class="text-caption font-medium text-text-muted">
      {{ label }}
    </label>
    <input
      :id="id"
      :type="type"
      :value="modelValue"
      :placeholder="placeholder"
      :min="min"
      :max="max"
      :step="step"
      class="w-full px-3 py-2 rounded-md border border-border bg-surface text-text transition-colors duration-200 focus:ring-2 focus:ring-primary focus:border-primary focus:outline-none"
      @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
    />
  </div>
</template>
