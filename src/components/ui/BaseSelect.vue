<script setup lang="ts">
import type { ISelectOption } from '@/interfaces'

interface Props {
  modelValue: string
  options: ISelectOption[]
  label: string
  id: string
}

defineProps<Props>()

defineEmits<{
  'update:modelValue': [value: string]
}>()
</script>

<template>
  <div class="flex flex-col gap-1">
    <label :for="id" class="text-caption font-medium text-text-muted">
      {{ label }}
    </label>
    <select
      :id="id"
      :value="modelValue"
      class="w-full px-3 py-2 rounded-md border border-border bg-surface text-text transition-colors duration-200 focus:ring-2 focus:ring-primary focus:border-primary focus:outline-none"
      @change="$emit('update:modelValue', ($event.target as HTMLSelectElement).value)"
    >
      <option v-for="option in options" :key="option.value" :value="option.value">
        {{ option.label }}
      </option>
    </select>
  </div>
</template>
