import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useHistoryStore } from '@/stores/history.store'
import type { IFocusSession, IBreakSession } from '@/interfaces'

describe('history.store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('starts with empty sessions', () => {
    const store = useHistoryStore()
    expect(store.sessions).toEqual([])
    expect(store.sessionCount).toBe(0)
    expect(store.averageScore).toBeNull()
  })

  it('adds a focus session and updates computed values', () => {
    const store = useHistoryStore()

    const entry: IFocusSession = {
      id: 1,
      type: 'focus',
      score: 8,
      timestamp: '10:00',
      duration: 25,
    }

    store.addSession(entry)

    expect(store.sessions).toHaveLength(1)
    expect(store.sessionCount).toBe(1)
    expect(store.averageScore).toBe(8)
    expect(store.totalWorkMinutes).toBe(25)
  })

  it('calculates correct average score for multiple sessions', () => {
    const store = useHistoryStore()

    const entries: IFocusSession[] = [
      { id: 1, type: 'focus', score: 6, timestamp: '10:00', duration: 25 },
      { id: 2, type: 'focus', score: 8, timestamp: '10:30', duration: 25 },
      { id: 3, type: 'focus', score: 10, timestamp: '11:00', duration: 25 },
    ]

    entries.forEach((e) => store.addSession(e))

    expect(store.averageScore).toBe(8)
    expect(store.sessionCount).toBe(3)
    expect(store.totalWorkMinutes).toBe(75)
  })

  it('excludes break sessions from average score and session count', () => {
    const store = useHistoryStore()

    const focus: IFocusSession = {
      id: 1,
      type: 'focus',
      score: 7,
      timestamp: '10:00',
      duration: 25,
    }
    const breakEntry: IBreakSession = {
      id: 2,
      type: 'break',
      score: 0,
      timestamp: '10:30',
      duration: 5,
    }

    store.addSession(focus)
    store.addSession(breakEntry)

    expect(store.sessionCount).toBe(1)
    expect(store.averageScore).toBe(7)
    expect(store.totalWorkMinutes).toBe(25)
  })

  it('generates correct chart data', () => {
    const store = useHistoryStore()

    store.addSession({
      id: 1,
      type: 'focus',
      score: 9,
      timestamp: '10:00',
      duration: 25,
    })
    store.addSession({
      id: 2,
      type: 'break',
      score: 0,
      timestamp: '10:25',
      duration: 5,
    })

    expect(store.chartData).toEqual([
      { label: '10:00', value: 9 },
      { label: '10:25', value: 0 },
    ])
  })

  it('trims history to 1000 items', () => {
    const store = useHistoryStore()

    const entries: IFocusSession[] = Array.from({ length: 1005 }, (_, i) => ({
      id: i,
      type: 'focus' as const,
      score: 5,
      timestamp: '10:00',
      duration: 25,
    }))

    store.loadSessions(entries)
    expect(store.sessions).toHaveLength(1000)
  })

  it('clears history', () => {
    const store = useHistoryStore()

    store.addSession({
      id: 1,
      type: 'focus',
      score: 7,
      timestamp: '10:00',
      duration: 25,
    })

    store.clearHistory()
    expect(store.sessions).toHaveLength(0)
    expect(store.sessionCount).toBe(0)
  })

  it('formats total work time correctly', () => {
    const store = useHistoryStore()

    // Add 75 minutes of work (3 x 25min sessions)
    for (let i = 0; i < 3; i++) {
      store.addSession({
        id: i,
        type: 'focus',
        score: 7,
        timestamp: '10:00',
        duration: 25,
      })
    }

    expect(store.totalWorkFormatted).toBe('1h 15m')
  })
})
