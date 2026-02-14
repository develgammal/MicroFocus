import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { ISessionEntry, IFocusSession, IChartDataPoint } from '@/interfaces'
import { formatTotalWork } from '@/utils/time.util'

const MAX_HISTORY_ITEMS = 1000

export const useHistoryStore = defineStore('history', () => {
  // --- State ---
  const sessions = ref<ISessionEntry[]>([])

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

  // --- Actions ---
  function addSession(entry: ISessionEntry): void {
    sessions.value.push(entry)
    trimHistory()
  }

  function loadSessions(data: ISessionEntry[]): void {
    sessions.value = data
    trimHistory()
  }

  function clearHistory(): void {
    sessions.value = []
  }

  function trimHistory(): void {
    if (sessions.value.length > MAX_HISTORY_ITEMS) {
      sessions.value = sessions.value.slice(sessions.value.length - MAX_HISTORY_ITEMS)
    }
  }

  return {
    // State
    sessions,
    // Getters
    focusSessions,
    sessionCount,
    averageScore,
    totalWorkMinutes,
    totalWorkFormatted,
    chartData,
    // Actions
    addSession,
    loadSessions,
    clearHistory,
  }
})
