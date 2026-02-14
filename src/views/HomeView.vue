<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useSettingsStore } from '@/stores/settings.store'
import { useTimerStore } from '@/stores/timer.store'
import { useHistoryStore } from '@/stores/history.store'
import { useTimerWorker } from '@/composables/useTimerWorker'
import { useAlarmLoop } from '@/composables/useAlarmLoop'
import { useTheme } from '@/composables/useTheme'
import { useAudioSynth } from '@/composables/useAudioSynth'
import { announce } from '@/utils/accessibility.util'
import { currentTimestamp } from '@/utils/time.util'
import type { IFocusSession, IBreakSession } from '@/interfaces'
import { TimerMode } from '@/interfaces'

import BaseCard from '@/components/ui/BaseCard.vue'
import AppHeader from '@/components/layout/AppHeader.vue'
import AppFooter from '@/components/layout/AppFooter.vue'
import SettingsPanel from '@/components/settings/SettingsPanel.vue'
import TimerDisplay from '@/components/timer/TimerDisplay.vue'
import TimerControls from '@/components/timer/TimerControls.vue'
import RatingOverlay from '@/components/timer/RatingOverlay.vue'
import ProductivityChart from '@/components/stats/ProductivityChart.vue'

const { t } = useI18n()
const settingsStore = useSettingsStore()
const timerStore = useTimerStore()
const historyStore = useHistoryStore()
const { startWorker, stopWorker, onTick } = useTimerWorker()
const { startAlarmLoop, stopAlarm } = useAlarmLoop()
const { init: initTheme } = useTheme()
const { ensureContext } = useAudioSynth()

const showSettings = ref(false)
const showRating = ref(false)
const isManualEndSession = ref(false)

// --- Lifecycle ---
onMounted(() => {
  settingsStore.loadSettings()
  initTheme()
  timerStore.resetToFocus(settingsStore.intervalMinutes)
})

// Update document title reactively
watch(
  [() => timerStore.displayTime, () => timerStore.isRunning, () => timerStore.mode],
  ([time, running, mode]) => {
    if (running) {
      const modeLabel = mode === TimerMode.Break ? 'Break' : 'Focus'
      document.title = `(${time}) ${modeLabel} — MicroFocus`
    } else {
      document.title = 'MicroFocus'
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

// --- Timer Worker Handling ---
onTick(() => {
  const completed = timerStore.tick()
  if (completed) {
    handleTimerComplete()
  }
})

// --- Actions ---
function handleToggleTimer(): void {
  // Ensure AudioContext on first user interaction
  ensureContext()

  if (timerStore.isBreak) {
    handleEndBreak()
    return
  }

  if (timerStore.isRunning) {
    // If running, directly start break without rating (manual break)
    timerStore.pause()
    stopWorker()
    stopAlarm()
    handleStartBreak()
  } else {
    // If not running, start the timer
    handleStart()
  }
}

function handleEndSession(): void {
  // Ensure AudioContext on first user interaction
  ensureContext()

  if (timerStore.isBreak) {
    // During break: silently end break and reset to focus (no modal, no history)
    stopWorker()
    stopAlarm()
    showRating.value = false
    timerStore.resetToFocus(settingsStore.intervalMinutes)
    announce(t('a11y.focusModeActive'))
  } else {
    // During focus: stop timer and show rating to save partial session
    stopWorker()
    stopAlarm()
    isManualEndSession.value = true
    showRating.value = true
    timerStore.pause()
    announce(t('a11y.timerCompleted'))
  }
}

function handleStart(): void {
  timerStore.start()
  startWorker()
  announce(t('a11y.timerStarted'))
}

function handlePause(): void {
  timerStore.pause()
  stopWorker()
  announce(t('a11y.timerPaused'))
}

function handleTimerComplete(): void {
  stopWorker()
  isManualEndSession.value = false
  showRating.value = true
  announce(t('a11y.timerCompleted'))

  startAlarmLoop({
    sound: settingsStore.soundPreference,
    quote: settingsStore.quote,
    voiceURI: settingsStore.voiceURI,
    silenceSeconds: settingsStore.soundRepeatSeconds,
    maxSeconds: settingsStore.maxRepetitionSeconds,
  })
}

function handleScore(score: number): void {
  stopAlarm()
  showRating.value = false

  const entry: IFocusSession = {
    id: Date.now(),
    type: 'focus',
    score,
    timestamp: currentTimestamp(),
    duration: settingsStore.intervalMinutes,
  }
  historyStore.addSession(entry)
  settingsStore.persistAll()
  announce(t('a11y.sessionRated', { score }))

  if (isManualEndSession.value) {
    // Manual end: reset to idle, don't auto-start
    timerStore.resetToFocus(settingsStore.intervalMinutes)
    isManualEndSession.value = false
  } else {
    // Natural completion: reset and auto-start next session
    timerStore.resetToFocus(settingsStore.intervalMinutes)
    handleStart()
  }
}

function handleStartBreak(): void {
  stopAlarm()
  showRating.value = false

  // Don't save an incomplete focus session when manually taking break
  timerStore.startBreak()
  timerStore.start()
  startWorker()
  announce(t('a11y.breakModeActive'))
}

function handleEndBreak(): void {
  stopWorker()

  const entry: IBreakSession = {
    id: Date.now(),
    type: 'break',
    score: 0,
    timestamp: currentTimestamp(),
    duration: timerStore.getBreakDurationMinutes(),
  }
  historyStore.addSession(entry)
  settingsStore.persistAll()

  // Reset to focus and auto-start
  timerStore.resetToFocus(settingsStore.intervalMinutes)
  handleStart()
}

function handleSettingsChanged(): void {
  if (!timerStore.isRunning && timerStore.isFocus) {
    timerStore.resetToFocus(settingsStore.intervalMinutes)
  }
}
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

      <TimerDisplay />
      <TimerControls @toggle="handleToggleTimer" @end-session="handleEndSession" />

      <RatingOverlay
        v-if="showRating"
        :show-break-option="!isManualEndSession"
        @score="handleScore"
        @break="handleStartBreak"
      />

      <ProductivityChart />
    </BaseCard>

    <AppFooter />
  </div>
</template>
