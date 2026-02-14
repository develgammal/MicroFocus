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

  // Drift correction anchors
  let startTime: number | null = null
  let initialSnapshot: number | null = null

  // --- Getters ---
  const isBreak = computed(() => mode.value === TimerMode.Break)
  const isFocus = computed(() => mode.value === TimerMode.Focus)

  const displayTime = computed(() => {
    const val = isBreak.value ? breakElapsed.value : Math.max(0, timeLeft.value)
    return formatTime(val)
  })

  const displaySeconds = computed(() => {
    return isBreak.value ? breakElapsed.value : Math.max(0, timeLeft.value)
  })

  // --- Actions ---
  function start(): void {
    isRunning.value = true
    startTime = Date.now()
    initialSnapshot = isBreak.value ? breakElapsed.value : timeLeft.value
  }

  function pause(): void {
    isRunning.value = false
    startTime = null
    initialSnapshot = null
  }

  function tick(): boolean {
    if (!startTime || initialSnapshot === null) return false

    const deltaSeconds = (Date.now() - startTime) / TIMER_CONSTANTS.MS_PER_SECOND

    if (isBreak.value) {
      breakElapsed.value = initialSnapshot + deltaSeconds
      return false
    } else {
      timeLeft.value = initialSnapshot - deltaSeconds
      if (timeLeft.value <= 0) {
        timeLeft.value = 0
        isRunning.value = false
        return true // Timer completed
      }
      return false
    }
  }

  function startBreak(): void {
    mode.value = TimerMode.Break
    breakElapsed.value = 0
    isRunning.value = false
    startTime = null
    initialSnapshot = null
  }

  function resetToFocus(intervalMinutes: number): void {
    mode.value = TimerMode.Focus
    isRunning.value = false
    timeLeft.value = intervalMinutes * TIMER_CONSTANTS.SECONDS_PER_MINUTE
    breakElapsed.value = 0
    startTime = null
    initialSnapshot = null
  }

  function resetToBreak(intervalMinutes: number): void {
    mode.value = TimerMode.Break
    isRunning.value = false
    breakElapsed.value = 0
    timeLeft.value = intervalMinutes * TIMER_CONSTANTS.SECONDS_PER_MINUTE
    startTime = null
    initialSnapshot = null
  }

  function getBreakDurationMinutes(): number {
    return breakElapsed.value / TIMER_CONSTANTS.SECONDS_PER_MINUTE
  }

  function getFocusDurationMinutes(intervalMinutes: number): number {
    const totalSeconds = intervalMinutes * TIMER_CONSTANTS.SECONDS_PER_MINUTE
    const elapsedSeconds = totalSeconds - timeLeft.value
    return elapsedSeconds / TIMER_CONSTANTS.SECONDS_PER_MINUTE
  }

  function hasBeenPaused(intervalMinutes: number): boolean {
    return timeLeft.value < intervalMinutes * TIMER_CONSTANTS.SECONDS_PER_MINUTE
  }

  return {
    // State
    timeLeft,
    breakElapsed,
    isRunning,
    mode,
    // Getters
    isBreak,
    isFocus,
    displayTime,
    displaySeconds,
    // Actions
    start,
    pause,
    tick,
    startBreak,
    resetToFocus,
    resetToBreak,
    getBreakDurationMinutes,
    getFocusDurationMinutes,
    hasBeenPaused,
  }
})
