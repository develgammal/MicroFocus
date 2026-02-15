/**
 * Session Manager Composable
 * Handles all timer session lifecycle logic including cognitive fatigue detection.
 */

import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useSettingsStore } from '@/stores/settings.store'
import { useTimerStore } from '@/stores/timer.store'
import { useHistoryStore } from '@/stores/history.store'
import { useTimerWorker } from '@/composables/useTimerWorker'
import { useAlarmLoop } from '@/composables/useAlarmLoop'
import { useAudioSynth } from '@/composables/useAudioSynth'
import {
  evaluateCognitiveState,
  evaluatePostBreakRecovery,
  getFocusSessionsSinceLastBreak,
  calculateRebound,
  isCrashState,
} from '@/composables/useCognitiveAnalysis'
import { announce } from '@/utils/accessibility.util'
import { currentTimestamp } from '@/utils/time.util'
import { SCORE_CONSTANTS } from '@/constants/app.constants'
import { CognitiveState } from '@/interfaces'
import type { IFocusSession, IBreakSession, IBreakSuggestion, IReboundResult } from '@/interfaces'

export interface ISessionManagerState {
  showRating: boolean
  isManualEndSession: boolean
  actualSessionDuration: number
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
  const actualSessionDuration = ref(0)

  // Cognitive fatigue detection state
  const breakSuggestion = ref<IBreakSuggestion | null>(null)
  const reboundResult = ref<IReboundResult | null>(null)
  const showWarmUp = ref(false)
  /** Tracks whether cognitive analysis should defer auto-start */
  let pendingAutoStart = false

  // ---------------------------------------------------------------------------
  // Timer lifecycle
  // ---------------------------------------------------------------------------

  /** Initializes timer tick handler */
  function initializeTimerTick(): void {
    onTick(() => {
      const completed = timerStore.tick()
      if (completed) {
        timerStore.isBreak ? handleBreakCountdownComplete() : handleTimerComplete()
      }
    })
  }

  /** Starts the timer */
  function startTimer(): void {
    stopAlarm()
    timerStore.start()
    startWorker()
    announce(t('a11y.timerStarted'))
  }

  /** Stops all timer-related activities */
  function stopAllTimerActivity(): void {
    stopWorker()
    stopAlarm()
  }

  // ---------------------------------------------------------------------------
  // Alarm helpers
  // ---------------------------------------------------------------------------

  /** Plays the alarm with current user preferences. */
  function playAlarm(): void {
    startAlarmLoop({
      sound: settingsStore.soundPreference,
      quote: settingsStore.quote,
      voiceURI: settingsStore.voiceURI,
      silenceSeconds: settingsStore.soundRepeatSeconds,
      maxSeconds: settingsStore.maxRepetitionSeconds,
    })
  }

  // ---------------------------------------------------------------------------
  // Break session helpers (DRY shared logic)
  // ---------------------------------------------------------------------------

  /** Creates a break session entry from the current timer state. */
  function createBreakEntry(breakDuration: number): IBreakSession {
    return {
      id: Date.now(),
      type: 'break',
      score: SCORE_CONSTANTS.DEFAULT_BREAK_SCORE,
      timestamp: currentTimestamp(),
      duration: breakDuration,
    }
  }

  /** Common pre-break setup: clears overlays & saves pre-break state for rebound tracking. */
  function prepareForBreak(): void {
    stopAlarm()
    showRating.value = false
    breakSuggestion.value = null
    pendingAutoStart = false

    const focusSessions = historyStore.focusSessions
    if (focusSessions.length > 0) {
      historyStore.savePreBreakState(focusSessions[focusSessions.length - 1]!.score)
    }
  }

  /** Persists a break session and its duration to history. */
  function finaliseBreak(breakDuration: number): void {
    historyStore.addSession(createBreakEntry(breakDuration))
    historyStore.saveBreakDuration(breakDuration)
    settingsStore.persistAll()
  }

  // ---------------------------------------------------------------------------
  // Post-rating continuation (manual vs natural)
  // ---------------------------------------------------------------------------

  /**
   * Decides how to continue after rating, respecting break-suggestion interrupts.
   * When `suggestion` is truthy, shows it and defers auto-start; otherwise
   * proceeds normally (manual → idle, natural → auto-start next session).
   */
  function continueAfterRating(suggestion?: IBreakSuggestion | null): void {
    if (suggestion) {
      breakSuggestion.value = suggestion
      if (isManualEndSession.value) {
        handleManualSessionReset()
      } else {
        timerStore.resetToFocus(settingsStore.intervalMinutes)
        pendingAutoStart = true
      }
      return
    }

    if (isManualEndSession.value) {
      handleManualSessionReset()
    } else {
      handleNaturalSessionContinue()
    }
  }

  // ---------------------------------------------------------------------------
  // Toggle / end session handlers
  // ---------------------------------------------------------------------------

  /** Main timer/break toggle action */
  function handleToggleTimer(): void {
    ensureContext()

    if (timerStore.isBreak) {
      handleEndBreak()
      return
    }

    if (timerStore.isRunning) {
      handleManualBreak()
    } else {
      startTimer()
    }
  }

  /** Manual break (Take a Break button) */
  function handleManualBreak(): void {
    timerStore.pause()
    stopAllTimerActivity()
    handleStartBreak()
  }

  /** End session button click */
  function handleEndSession(): void {
    ensureContext()

    if (timerStore.isBreak) {
      handleSilentBreakEnd()
    } else {
      handlePartialSessionEnd()
    }
  }

  /** Silently ends break without saving to history */
  function handleSilentBreakEnd(): void {
    stopAllTimerActivity()
    showRating.value = false
    timerStore.resetToFocus(settingsStore.intervalMinutes)
    announce(t('a11y.focusModeActive'))
  }

  /** Ends focus session early with rating */
  function handlePartialSessionEnd(): void {
    timerStore.tick()
    timerStore.pause()
    stopAllTimerActivity()
    isManualEndSession.value = true
    actualSessionDuration.value = timerStore.getFocusDurationMinutes(settingsStore.intervalMinutes)
    showRating.value = true
    announce(t('a11y.timerCompleted'))
  }

  // ---------------------------------------------------------------------------
  // Timer completion handlers
  // ---------------------------------------------------------------------------

  /** Handles natural focus timer completion */
  function handleTimerComplete(): void {
    stopWorker()
    isManualEndSession.value = false
    actualSessionDuration.value = settingsStore.intervalMinutes
    showRating.value = true
    announce(t('a11y.timerCompleted'))
    playAlarm()
  }

  /** Handles break countdown timer completion */
  function handleBreakCountdownComplete(): void {
    stopWorker()
    finaliseBreak(timerStore.getBreakDurationMinutes())
    playAlarm()
    timerStore.resetToFocus(settingsStore.intervalMinutes)
    announce(t('cognitive.breakComplete'))
  }

  // ---------------------------------------------------------------------------
  // Rating & cognitive analysis pipeline
  // ---------------------------------------------------------------------------

  /**
   * Handles focus session rating.
   *
   * Pipeline:
   *   1. Save session to history
   *   2. Check for post-break rebound (positive feedback banner)
   *   3. Check for insufficient break recovery → suggest longer break
   *   4. Run cognitive fatigue analysis → suggest break or show warm-up
   *   5. Continue normally if no intervention needed
   */
  function handleScore(score: number): void {
    stopAlarm()
    showRating.value = false

    // 1. Persist the focus session
    const entry: IFocusSession = {
      id: Date.now(),
      type: 'focus',
      score,
      timestamp: currentTimestamp(),
      duration: actualSessionDuration.value,
    }
    historyStore.addSession(entry)
    settingsStore.persistAll()
    announce(t('a11y.sessionRated', { score }))

    // 2. Post-break rebound check
    const reboundContext = checkPostBreakRebound(score)

    // 3. Insufficient break recovery → short-circuit with macro-break suggestion
    const recoverySuggestion = checkInsufficientRecovery(score, reboundContext)
    if (recoverySuggestion) {
      continueAfterRating(recoverySuggestion)
      return
    }

    // 4. Cognitive fatigue analysis on the rolling window
    const fatigueSuggestion = checkCognitiveFatigue()
    if (fatigueSuggestion) {
      continueAfterRating(fatigueSuggestion)
      return
    }

    // 5. No intervention — proceed normally
    continueAfterRating()
  }

  /**
   * Checks for a positive rebound after a break and surfaces the banner.
   * Returns the saved pre-break context for downstream recovery checks.
   */
  function checkPostBreakRebound(postScore: number): {
    preBreakScore: number | null
    breakDuration: number | null
    recommendedBreak: number | null
  } {
    const ctx = {
      preBreakScore: null as number | null,
      breakDuration: null as number | null,
      recommendedBreak: null as number | null,
    }

    if (!historyStore.pendingReboundCheck || historyStore.lastPreBreakScore === null) {
      return ctx
    }

    ctx.preBreakScore = historyStore.lastPreBreakScore
    ctx.breakDuration = historyStore.lastBreakDuration
    ctx.recommendedBreak = historyStore.lastRecommendedBreakMinutes

    const rebound = calculateRebound(ctx.preBreakScore, postScore, ctx.breakDuration ?? 0)
    if (rebound) {
      reboundResult.value = rebound
    }
    historyStore.clearPreBreakState()

    return ctx
  }

  /**
   * Checks if the user didn't recover sufficiently after a recommended break.
   * Returns a break suggestion for a longer macro-break, or null.
   */
  function checkInsufficientRecovery(
    postScore: number,
    ctx: { preBreakScore: number | null; breakDuration: number | null; recommendedBreak: number | null },
  ): IBreakSuggestion | null {
    if (ctx.recommendedBreak === null || ctx.preBreakScore === null) return null

    return evaluatePostBreakRecovery(
      ctx.preBreakScore,
      postScore,
      ctx.breakDuration ?? 0,
      ctx.recommendedBreak,
    )
  }

  /**
   * Runs rolling-window cognitive fatigue analysis.
   * May also trigger the warm-up banner as a side effect.
   * Returns a break suggestion if a crash state is detected, or null.
   */
  function checkCognitiveFatigue(): IBreakSuggestion | null {
    const focusSinceBreak = getFocusSessionsSinceLastBreak(historyStore.sessions)
    const analysis = evaluateCognitiveState(focusSinceBreak)

    if (analysis && isCrashState(analysis.state)) return analysis

    if (analysis?.state === CognitiveState.WarmUp) {
      showWarmUp.value = true
    }

    return null
  }

  // ---------------------------------------------------------------------------
  // Session reset helpers
  // ---------------------------------------------------------------------------

  /** Resets to idle after manual session end */
  function handleManualSessionReset(): void {
    timerStore.resetToFocus(settingsStore.intervalMinutes)
    isManualEndSession.value = false
  }

  /** Continues to next session after natural completion */
  function handleNaturalSessionContinue(): void {
    timerStore.resetToFocus(settingsStore.intervalMinutes)
    startTimer()
  }

  // ---------------------------------------------------------------------------
  // Break handlers
  // ---------------------------------------------------------------------------

  /** Starts a stopwatch break session (manual or from rating overlay) */
  function handleStartBreak(): void {
    prepareForBreak()
    timerStore.startBreak()
    timerStore.start()
    startWorker()
    announce(t('a11y.breakModeActive'))
  }

  /** Starts a countdown break with a specific duration (from break suggestion) */
  function handleStartBreakCountdown(durationMinutes: number): void {
    prepareForBreak()
    timerStore.startBreakCountdown(durationMinutes)
    timerStore.start()
    startWorker()
    announce(t('a11y.breakModeActive'))
  }

  /** Ends a stopwatch break session and starts new focus */
  function handleEndBreak(): void {
    stopWorker()
    finaliseBreak(timerStore.getBreakDurationMinutes())
    timerStore.resetToFocus(settingsStore.intervalMinutes)
    startTimer()
  }

  /** Handles settings changes during idle */
  function handleSettingsChanged(): void {
    if (!timerStore.isRunning && timerStore.isFocus) {
      timerStore.resetToFocus(settingsStore.intervalMinutes)
    }
  }

  // ---------------------------------------------------------------------------
  // Cognitive fatigue UI handlers
  // ---------------------------------------------------------------------------

  /** User dismissed the break suggestion — continue working */
  function handleSuggestionDismiss(): void {
    breakSuggestion.value = null
    if (pendingAutoStart) {
      pendingAutoStart = false
      startTimer()
    }
  }

  /** User accepted the break suggestion — start break (countdown when duration available) */
  function handleSuggestionBreak(): void {
    const recommendedMinutes = breakSuggestion.value?.recommendedBreakMinutes ?? null

    if (recommendedMinutes) {
      historyStore.saveRecommendedBreak(recommendedMinutes)
      handleStartBreakCountdown(recommendedMinutes)
    } else {
      handleStartBreak()
    }
  }

  /** User dismissed the rebound banner */
  function handleReboundDismiss(): void {
    reboundResult.value = null
  }

  /** User dismissed the warm-up encouragement banner */
  function handleWarmUpDismiss(): void {
    showWarmUp.value = false
  }

  return {
    // State
    showRating,
    isManualEndSession,
    actualSessionDuration,
    breakSuggestion,
    reboundResult,
    showWarmUp,
    // Initialization
    initializeTimerTick,
    // Actions
    handleToggleTimer,
    handleEndSession,
    handleScore,
    handleStartBreak,
    handleSettingsChanged,
    stopAllTimerActivity,
    // Cognitive fatigue handlers
    handleSuggestionDismiss,
    handleSuggestionBreak,
    handleReboundDismiss,
    handleWarmUpDismiss,
  }
}
