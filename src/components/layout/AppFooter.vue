<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useHistoryStore } from '@/stores/history.store'

const { t } = useI18n()
const historyStore = useHistoryStore()
</script>

<template>
  <footer
    class="mt-4 text-text-muted text-body flex flex-wrap justify-center gap-x-4 gap-y-1"
    role="contentinfo"
  >
    <div class="font-semibold">
      {{ t('stats.dailyStats') }}
    </div>
    <div>
      {{ t('stats.avgScore') }}:
      <span class="font-bold text-text">
        {{ historyStore.averageScore ?? t('stats.noData') }}
      </span>
    </div>
    <div class="text-border-strong hidden sm:block" aria-hidden="true">|</div>
    <div>
      {{ t('stats.sessions') }}:
      <span class="font-bold text-text">
        {{ historyStore.sessionCount }}
      </span>
    </div>
    <div class="text-border-strong hidden sm:block" aria-hidden="true">|</div>
    <div>
      {{ t('stats.totalProductivity') }}:
      <span class="font-bold text-text">
        {{ historyStore.totalWorkFormatted }}
      </span>
    </div>
  </footer>
</template>
