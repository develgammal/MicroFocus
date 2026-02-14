import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { TimerMode } from '@/interfaces'
import { formatTime } from '@/utils/time.util'

export const useTimerStore = defineStore('timer', () => {
  // --- State ---
  const timeLeft = ref(25 * 60)
  const breakElapsed = ref(0)
  const isRunning = ref(false)
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

    const deltaSeconds = (Date.now() - startTime) / 1000

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
    timeLeft.value = intervalMinutes * 60
    breakElapsed.value = 0
    startTime = null
    initialSnapshot = null
  }

  function resetToBreak(intervalMinutes: number): void {
    mode.value = TimerMode.Break
    isRunning.value = false
    breakElapsed.value = 0
    timeLeft.value = intervalMinutes * 60
    startTime = null
    initialSnapshot = null
  }

  function getBreakDurationMinutes(): number {
    return breakElapsed.value / 60
  }

  function hasBeenPaused(intervalMinutes: number): boolean {
    return timeLeft.value < intervalMinutes * 60
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
    hasBeenPaused,
  }
})
