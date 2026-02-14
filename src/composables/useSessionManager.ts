/**
 * Session Manager Composable
 * Handles all timer session lifecycle logic
 */

import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useSettingsStore } from '@/stores/settings.store'
import { useTimerStore } from '@/stores/timer.store'
import { useHistoryStore } from '@/stores/history.store'
import { useTimerWorker } from '@/composables/useTimerWorker'
import { useAlarmLoop } from '@/composables/useAlarmLoop'
import { useAudioSynth } from '@/composables/useAudioSynth'
import { announce } from '@/utils/accessibility.util'
import { currentTimestamp } from '@/utils/time.util'
import { SCORE_CONSTANTS } from '@/constants/app.constants'
import type { IFocusSession, IBreakSession } from '@/interfaces'

export interface ISessionManagerState {
  showRating: boolean
  isManualEndSession: boolean
}

export function useSessionManager() {
  const { t } = useI18n()
  const settingsStore = useSettingsStore()
  const timerStore = useTimerStore()
  const historyStore = useHistoryStore()
  const { startWorker, stopWorker, onTick } = useTimerWorker()
  const { startAlarmLoop, stopAlarm } = useAlarmLoop()
  const { ensureContext } = useAudioSynth()

  // State
  const showRating = ref(false)
  const isManualEndSession = ref(false)

  /**
   * Initializes timer tick handler
   */
  function initializeTimerTick(): void {
    onTick(() => {
      const completed = timerStore.tick()
      if (completed) {
        handleTimerComplete()
      }
    })
  }

  /**
   * Starts the timer
   */
  function startTimer(): void {
    timerStore.start()
    startWorker()
    announce(t('a11y.timerStarted'))
  }

  /**
   * Stops all timer-related activities
   */
  function stopAllTimerActivity(): void {
    stopWorker()
    stopAlarm()
  }

  /**
   * Handles main timer/break toggle action
   */
  function handleToggleTimer(): void {
    ensureContext()

    if (timerStore.isBreak) {
      handleEndBreak()
      return
    }

    if (timerStore.isRunning) {
      // If running focus, start break without rating
      handleManualBreak()
    } else {
      // If idle, start timer
      startTimer()
    }
  }

  /**
   * Handles manual break (Take a Break button)
   */
  function handleManualBreak(): void {
    timerStore.pause()
    stopAllTimerActivity()
    handleStartBreak()
  }

  /**
   * Handles end session button click
   */
  function handleEndSession(): void {
    ensureContext()

    if (timerStore.isBreak) {
      // During break: silently end and reset
      handleSilentBreakEnd()
    } else {
      // During focus: show rating to save partial session
      handlePartialSessionEnd()
    }
  }

  /**
   * Silently ends break without saving to history
   */
  function handleSilentBreakEnd(): void {
    stopAllTimerActivity()
    showRating.value = false
    timerStore.resetToFocus(settingsStore.intervalMinutes)
    announce(t('a11y.focusModeActive'))
  }

  /**
   * Ends focus session early with rating
   */
  function handlePartialSessionEnd(): void {
    stopAllTimerActivity()
    isManualEndSession.value = true
    showRating.value = true
    timerStore.pause()
    announce(t('a11y.timerCompleted'))
  }

  /**
   * Handles natural timer completion
   */
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

  /**
   * Handles focus session rating
   */
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
      handleManualSessionReset()
    } else {
      // Natural completion: reset and auto-start next session
      handleNaturalSessionContinue()
    }
  }

  /**
   * Resets to idle after manual session end
   */
  function handleManualSessionReset(): void {
    timerStore.resetToFocus(settingsStore.intervalMinutes)
    isManualEndSession.value = false
  }

  /**
   * Continues to next session after natural completion
   */
  function handleNaturalSessionContinue(): void {
    timerStore.resetToFocus(settingsStore.intervalMinutes)
    startTimer()
  }

  /**
   * Starts a break session
   */
  function handleStartBreak(): void {
    stopAlarm()
    showRating.value = false
    timerStore.startBreak()
    timerStore.start()
    startWorker()
    announce(t('a11y.breakModeActive'))
  }

  /**
   * Ends a break session and starts new focus
   */
  function handleEndBreak(): void {
    stopWorker()

    const entry: IBreakSession = {
      id: Date.now(),
      type: 'break',
      score: SCORE_CONSTANTS.DEFAULT_BREAK_SCORE,
      timestamp: currentTimestamp(),
      duration: timerStore.getBreakDurationMinutes(),
    }

    historyStore.addSession(entry)
    settingsStore.persistAll()

    // Reset to focus and auto-start
    timerStore.resetToFocus(settingsStore.intervalMinutes)
    startTimer()
  }

  /**
   * Handles settings changes during idle
   */
  function handleSettingsChanged(): void {
    if (!timerStore.isRunning && timerStore.isFocus) {
      timerStore.resetToFocus(settingsStore.intervalMinutes)
    }
  }

  return {
    // State
    showRating,
    isManualEndSession,
    // Initialization
    initializeTimerTick,
    // Actions
    handleToggleTimer,
    handleEndSession,
    handleScore,
    handleStartBreak,
    handleSettingsChanged,
    stopAllTimerActivity,
  }
}
