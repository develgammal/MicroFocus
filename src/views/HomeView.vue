<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useSettingsStore } from '@/stores/settings.store'
import { useTimerStore } from '@/stores/timer.store'
import { useTheme } from '@/composables/useTheme'
import { useSessionManager } from '@/composables/useSessionManager'
import { TimerMode } from '@/interfaces'
import { APP_CONSTANTS } from '@/constants/app.constants'

import BaseCard from '@/components/ui/BaseCard.vue'
import AppHeader from '@/components/layout/AppHeader.vue'
import AppFooter from '@/components/layout/AppFooter.vue'
import SettingsPanel from '@/components/settings/SettingsPanel.vue'
import TimerDisplay from '@/components/timer/TimerDisplay.vue'
import TimerControls from '@/components/timer/TimerControls.vue'
import RatingOverlay from '@/components/timer/RatingOverlay.vue'
import BreakSuggestionOverlay from '@/components/timer/BreakSuggestionOverlay.vue'
import ReboundBanner from '@/components/timer/ReboundBanner.vue'
import WarmUpBanner from '@/components/timer/WarmUpBanner.vue'
import ProductivityChart from '@/components/stats/ProductivityChart.vue'

const settingsStore = useSettingsStore()
const timerStore = useTimerStore()
const { init: initTheme } = useTheme()

// Use session manager for all business logic
const sessionManager = useSessionManager()
const {
  showRating,
  isManualEndSession,
  actualSessionDuration,
  breakSuggestion,
  reboundResult,
  showWarmUp,
  initializeTimerTick,
  handleToggleTimer,
  handleEndSession,
  handleScore,
  handleStartBreak,
  handleSettingsChanged,
  handleSuggestionDismiss,
  handleSuggestionBreak,
  handleReboundDismiss,
  handleWarmUpDismiss,
} = sessionManager

const showSettings = ref(false)

// --- Lifecycle ---
onMounted(() => {
  settingsStore.loadSettings()
  initTheme()
  timerStore.resetToFocus(settingsStore.intervalMinutes)
  initializeTimerTick()
})

// Update document title reactively
watch(
  [() => timerStore.displayTime, () => timerStore.isRunning, () => timerStore.mode],
  ([time, running, mode]) => {
    if (running) {
      const modeLabel = mode === TimerMode.Break ? 'Break' : 'Focus'
      document.title = `(${time}) ${modeLabel} — ${APP_CONSTANTS.APP_NAME}`
    } else {
      document.title = APP_CONSTANTS.APP_TITLE
    }
  },
)

// When settings interval changes, reset timer if not running
watch(
  () => settingsStore.intervalMinutes,
  (newVal) => {
    if (!timerStore.isRunning && timerStore.isFocus) {
      timerStore.resetToFocus(newVal)
    }
  },
)
</script>

<template>
  <div
    class="min-h-screen flex flex-col items-center px-3 py-4 sm:px-4 md:px-6 lg:px-8 transition-colors duration-500"
    :class="timerStore.isBreak ? 'break-mode' : ''"
  >
    <BaseCard class="w-full max-w-4xl min-w-[320px] mt-4 md:mt-10">
      <AppHeader @toggle-settings="showSettings = !showSettings" />

      <Transition name="slide-left">
        <SettingsPanel
          v-if="showSettings"
          @settings-changed="handleSettingsChanged"
          @close="showSettings = false"
        />
      </Transition>

      <ReboundBanner
        v-if="reboundResult"
        :percent-change="reboundResult.percentChange"
        :break-duration-minutes="reboundResult.breakDurationMinutes"
        @dismiss="handleReboundDismiss"
      />

      <WarmUpBanner
        v-if="showWarmUp"
        @dismiss="handleWarmUpDismiss"
      />

      <TimerDisplay />
      <TimerControls @toggle="handleToggleTimer" @end-session="handleEndSession" />

      <RatingOverlay
        v-if="showRating"
        :show-break-option="!isManualEndSession"
        :session-duration-minutes="actualSessionDuration"
        @score="handleScore"
        @break="handleStartBreak"
      />

      <BreakSuggestionOverlay
        v-if="breakSuggestion"
        :percent-decline="breakSuggestion.percentDecline"
        :window-minutes="breakSuggestion.windowMinutes"
        :cognitive-state="breakSuggestion.state"
        :recommended-break-minutes="breakSuggestion.recommendedBreakMinutes"
        @break="handleSuggestionBreak"
        @dismiss="handleSuggestionDismiss"
      />

      <ProductivityChart />
    </BaseCard>

    <AppFooter />
  </div>
</template>
