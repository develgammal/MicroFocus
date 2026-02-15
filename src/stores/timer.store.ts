import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { TimerMode } from '@/interfaces'
import { formatTime } from '@/utils/time.util'
import { TIMER_CONSTANTS } from '@/constants/app.constants'

export const useTimerStore = defineStore('timer', () => {
  // --- State ---
  const timeLeft = ref<number>(TIMER_CONSTANTS.DEFAULT_INTERVAL_MINUTES * TIMER_CONSTANTS.SECONDS_PER_MINUTE)
  const breakElapsed = ref<number>(0)
  const isRunning = ref<boolean>(false)
  const mode = ref<TimerMode>(TimerMode.Focus)

  /** Total seconds for a countdown break (0 = stopwatch mode) */
  const breakCountdownTotal = ref<number>(0)

  // Drift correction anchors
  let startTime: number | null = null
  let initialSnapshot: number | null = null

  // --- Getters ---
  const isBreak = computed(() => mode.value === TimerMode.Break)
  const isFocus = computed(() => mode.value === TimerMode.Focus)
  const isBreakCountdown = computed(() => breakCountdownTotal.value > 0 && isBreak.value)
  const isStopwatchBreak = computed(() => isBreak.value && breakCountdownTotal.value === 0)

  const displaySeconds = computed(() => {
    return isStopwatchBreak.value ? breakElapsed.value : Math.max(0, timeLeft.value)
  })

  const displayTime = computed(() => formatTime(displaySeconds.value))

  // --- Internal helpers ---

  /** Resets drift-correction anchors. */
  function resetAnchors(): void {
    startTime = null
    initialSnapshot = null
  }

  /** Converts minutes to total seconds. */
  function toSeconds(minutes: number): number {
    return minutes * TIMER_CONSTANTS.SECONDS_PER_MINUTE
  }

  /**
   * Sets all state fields required when entering a break mode.
   * Encapsulates the shared logic between stopwatch and countdown breaks.
   */
  function enterBreakMode(countdownSeconds: number): void {
    mode.value = TimerMode.Break
    breakElapsed.value = 0
    breakCountdownTotal.value = countdownSeconds
    if (countdownSeconds > 0) {
      timeLeft.value = countdownSeconds
    }
    isRunning.value = false
    resetAnchors()
  }

  // --- Tick strategies ---

  /** Tick handler for countdown modes (focus timer and countdown break). */
  function tickCountdown(delta: number): boolean {
    timeLeft.value = initialSnapshot! - delta

    if (isBreakCountdown.value) {
      breakElapsed.value = breakCountdownTotal.value - timeLeft.value
    }

    if (timeLeft.value <= 0) {
      timeLeft.value = 0
      if (isBreakCountdown.value) {
        breakElapsed.value = breakCountdownTotal.value
      }
      isRunning.value = false
      return true
    }
    return false
  }

  /** Tick handler for stopwatch break (counts up, never completes). */
  function tickStopwatch(delta: number): boolean {
    breakElapsed.value = initialSnapshot! + delta
    return false
  }

  // --- Actions ---
  function start(): void {
    isRunning.value = true
    startTime = Date.now()
    initialSnapshot = isStopwatchBreak.value ? breakElapsed.value : timeLeft.value
  }

  function pause(): void {
    isRunning.value = false
    resetAnchors()
  }

  function tick(): boolean {
    if (!startTime || initialSnapshot === null) return false
    const delta = (Date.now() - startTime) / TIMER_CONSTANTS.MS_PER_SECOND
    return isStopwatchBreak.value ? tickStopwatch(delta) : tickCountdown(delta)
  }

  function startBreak(): void {
    enterBreakMode(0)
  }

  function startBreakCountdown(durationMinutes: number): void {
    enterBreakMode(toSeconds(durationMinutes))
  }

  function resetToFocus(intervalMinutes: number): void {
    mode.value = TimerMode.Focus
    isRunning.value = false
    timeLeft.value = toSeconds(intervalMinutes)
    breakElapsed.value = 0
    breakCountdownTotal.value = 0
    resetAnchors()
  }

  function resetToBreak(intervalMinutes: number): void {
    mode.value = TimerMode.Break
    isRunning.value = false
    breakElapsed.value = 0
    breakCountdownTotal.value = 0
    timeLeft.value = toSeconds(intervalMinutes)
    resetAnchors()
  }

  function getBreakDurationMinutes(): number {
    return breakElapsed.value / TIMER_CONSTANTS.SECONDS_PER_MINUTE
  }

  function getFocusDurationMinutes(intervalMinutes: number): number {
    const elapsedSeconds = toSeconds(intervalMinutes) - timeLeft.value
    return elapsedSeconds / TIMER_CONSTANTS.SECONDS_PER_MINUTE
  }

  function hasBeenPaused(intervalMinutes: number): boolean {
    return timeLeft.value < toSeconds(intervalMinutes)
  }

  return {
    // State
    timeLeft,
    breakElapsed,
    isRunning,
    mode,
    breakCountdownTotal,
    // Getters
    isBreak,
    isFocus,
    isBreakCountdown,
    displayTime,
    displaySeconds,
    // Actions
    start,
    pause,
    tick,
    startBreak,
    startBreakCountdown,
    resetToFocus,
    resetToBreak,
    getBreakDurationMinutes,
    getFocusDurationMinutes,
    hasBeenPaused,
  }
})
