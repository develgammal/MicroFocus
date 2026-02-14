<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import ThemeToggle from '@/components/ui/ThemeToggle.vue'
import IconButton from '@/components/ui/IconButton.vue'

const { t } = useI18n()

defineEmits<{
  toggleSettings: []
}>()
</script>

<template>
  <header class="flex justify-between items-center mb-4 sm:mb-6 md:mb-8 gap-2">
    <div class="flex items-center gap-1 flex-shrink-0">
      <IconButton :ariaLabel="t('a11y.openSettings')" @click="$emit('toggleSettings')">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
          />
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
      </IconButton>

      <ThemeToggle />
    </div>

    <h1 class="text-lg sm:text-xl md:text-2xl font-light tracking-wide text-text-muted truncate">
      {{ t('common.appTagline')
      }}<span class="font-bold text-primary">{{ t('common.appTaglineBold') }}</span>
    </h1>
  </header>
</template>
