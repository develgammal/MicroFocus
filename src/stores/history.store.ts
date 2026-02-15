import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { ISessionEntry, IFocusSession, IChartDataPoint, IDailyAverage } from '@/interfaces'
import { formatTotalWork } from '@/utils/time.util'
import { STORAGE_CONSTANTS } from '@/constants/app.constants'
import { isStorageNearCapacity } from '@/utils/storage.util'

export const useHistoryStore = defineStore('history', () => {
  // --- State ---
  const sessions = ref<ISessionEntry[]>([])
  const dailyAverages = ref<IDailyAverage[]>([])
  let midnightTimeout: ReturnType<typeof setTimeout> | null = null

  // --- Cognitive fatigue detection state (in-memory only, resets on page load) ---
  /** Score of the last focus session before the most recent break */
  const lastPreBreakScore = ref<number | null>(null)
  /** Duration of the most recent break in minutes */
  const lastBreakDuration = ref<number | null>(null)
  /** Whether the next post-break session should check for rebound */
  const pendingReboundCheck = ref(false)
  /** Recommended break minutes from the last break suggestion (for post-break recovery eval) */
  const lastRecommendedBreakMinutes = ref<number | null>(null)

  // --- Getters ---
  const focusSessions = computed<IFocusSession[]>(() =>
    sessions.value.filter((s): s is IFocusSession => s.type === 'focus'),
  )

  const sessionCount = computed(() => focusSessions.value.length)

  const averageScore = computed(() => {
    const items = focusSessions.value
    if (items.length === 0) return null
    const sum = items.reduce((acc, s) => acc + s.score, 0)
    return parseFloat((sum / items.length).toFixed(1))
  })

  const totalWorkMinutes = computed(() =>
    focusSessions.value.reduce((acc, s) => acc + s.duration, 0),
  )

  const totalWorkFormatted = computed(() => formatTotalWork(totalWorkMinutes.value))

  const chartData = computed<IChartDataPoint[]>(() =>
    sessions.value.map((s) => ({
      label: s.timestamp,
      value: s.type === 'break' ? 0 : s.score,
    })),
  )

  const dailyChartData = computed<IChartDataPoint[]>(() =>
    dailyAverages.value.map((d) => ({
      label: d.date,
      value: d.avgScore,
    })),
  )

  // --- Actions ---
  function addSession(entry: ISessionEntry): void {
    sessions.value.push(entry)
    trimHistory()
  }

  function addDailyAverage(date: string, avgScore: number, sessionCount: number): void {
    // Check if daily average already exists for this date
    const existingIndex = dailyAverages.value.findIndex((d) => d.date === date)
    if (existingIndex !== -1) {
      // Update existing entry
      dailyAverages.value[existingIndex] = { date, avgScore, sessionCount }
    } else {
      // Add new entry
      dailyAverages.value.push({ date, avgScore, sessionCount })
    }
    trimDailyAverages()
  }

  function loadSessions(data: ISessionEntry[]): void {
    sessions.value = data
    trimHistory()
  }

  function loadDailyAverages(data: IDailyAverage[]): void {
    dailyAverages.value = data
    trimDailyAverages()
  }

  function clearHistory(): void {
    sessions.value = []
    dailyAverages.value = []
    lastPreBreakScore.value = null
    lastBreakDuration.value = null
    pendingReboundCheck.value = false
    lastRecommendedBreakMinutes.value = null
    if (midnightTimeout) {
      clearTimeout(midnightTimeout)
      midnightTimeout = null
    }
  }

  function trimHistory(): void {
    const storageNearCapacity = isStorageNearCapacity()
    const maxEntries = storageNearCapacity
      ? Math.floor(STORAGE_CONSTANTS.MAX_HOURLY_SESSIONS / 2)
      : STORAGE_CONSTANTS.MAX_HOURLY_SESSIONS

    if (sessions.value.length > maxEntries) {
      sessions.value = sessions.value.slice(sessions.value.length - maxEntries)
    }
  }

  function trimDailyAverages(): void {
    const storageNearCapacity = isStorageNearCapacity()
    const maxEntries = storageNearCapacity
      ? Math.floor(STORAGE_CONSTANTS.MAX_DAILY_AVERAGES / 2)
      : STORAGE_CONSTANTS.MAX_DAILY_AVERAGES

    if (dailyAverages.value.length > maxEntries) {
      // Remove oldest entries (assuming array is chronologically ordered)
      dailyAverages.value = dailyAverages.value.slice(dailyAverages.value.length - maxEntries)
    }
  }

  /**
   * Calculate and log daily average at midnight
   */
  function logDailyAverage(): void {
    const now = new Date()
    const yesterday = new Date(now)
    yesterday.setDate(yesterday.getDate() - 1)
    const dateStr = yesterday.toISOString().split('T')[0] // YYYY-MM-DD

    // Ensure dateStr is defined
    if (!dateStr) {
      scheduleMidnightAggregation()
      return
    }

    // Get all focus sessions from yesterday
    const yesterdayStart = new Date(yesterday)
    yesterdayStart.setHours(0, 0, 0, 0)
    const yesterdayEnd = new Date(yesterday)
    yesterdayEnd.setHours(23, 59, 59, 999)

    const focusSessionsYesterday = focusSessions.value.filter((s) => {
      const sessionDate = new Date(s.id) // id is timestamp
      return sessionDate >= yesterdayStart && sessionDate <= yesterdayEnd
    })

    if (focusSessionsYesterday.length > 0) {
      const avgScore =
        focusSessionsYesterday.reduce((sum, s) => sum + s.score, 0) / focusSessionsYesterday.length
      const roundedAvg = parseFloat(avgScore.toFixed(1))
      addDailyAverage(dateStr, roundedAvg, focusSessionsYesterday.length)
    }

    // Schedule next midnight
    scheduleMidnightAggregation()
  }

  /**
   * Schedule next midnight aggregation
   */
  function scheduleMidnightAggregation(): void {
    // Clear existing timeout
    if (midnightTimeout) {
      clearTimeout(midnightTimeout)
    }

    // Calculate time until next midnight
    const now = new Date()
    const nextMidnight = new Date(now)
    nextMidnight.setHours(24, 0, 0, 0) // Next midnight
    const msUntilMidnight = nextMidnight.getTime() - now.getTime()

    // Schedule the midnight aggregation
    midnightTimeout = setTimeout(() => {
      logDailyAverage()
    }, msUntilMidnight)
  }

  // Initialize midnight scheduler on store creation
  scheduleMidnightAggregation()

  // --- Cognitive fatigue helpers ---

  /** Save the pre-break score before a break starts */
  function savePreBreakState(score: number): void {
    lastPreBreakScore.value = score
  }

  /** Save break duration when break ends, flag rebound check */
  function saveBreakDuration(duration: number): void {
    lastBreakDuration.value = Math.round(duration)
    pendingReboundCheck.value = true
  }

  /** Save the recommended break duration when user accepts a break suggestion */
  function saveRecommendedBreak(minutes: number): void {
    lastRecommendedBreakMinutes.value = minutes
  }

  /** Clear pre-break state after rebound is shown or dismissed */
  function clearPreBreakState(): void {
    lastPreBreakScore.value = null
    lastBreakDuration.value = null
    pendingReboundCheck.value = false
    lastRecommendedBreakMinutes.value = null
  }

  return {
    // State
    sessions,
    dailyAverages,
    lastPreBreakScore,
    lastBreakDuration,
    pendingReboundCheck,
    lastRecommendedBreakMinutes,
    // Getters
    focusSessions,
    sessionCount,
    averageScore,
    totalWorkMinutes,
    totalWorkFormatted,
    chartData,
    dailyChartData,
    // Actions
    addSession,
    addDailyAverage,
    loadSessions,
    loadDailyAverages,
    clearHistory,
    scheduleMidnightAggregation,
    savePreBreakState,
    saveBreakDuration,
    saveRecommendedBreak,
    clearPreBreakState,
  }
})
