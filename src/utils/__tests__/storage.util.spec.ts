import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  loadFromStorage,
  saveToStorage,
  clearStorage,
  migrateFromLegacy,
} from '@/utils/storage.util'
import { SoundscapeKey } from '@/interfaces'
import type { IPersistedState } from '@/interfaces'

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: vi.fn((key: string) => store[key] ?? null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key]
    }),
    clear: vi.fn(() => {
      store = {}
    }),
  }
})()

Object.defineProperty(globalThis, 'localStorage', { value: localStorageMock })

describe('storage.util', () => {
  beforeEach(() => {
    localStorageMock.clear()
    vi.clearAllMocks()
  })

  describe('saveToStorage / loadFromStorage', () => {
    it('saves and loads persisted state', () => {
      const data: IPersistedState = {
        history: [
          {
            id: 1,
            type: 'focus',
            score: 8,
            timestamp: '14:00',
            duration: 25,
          },
        ],
        dailyAverages: [],
        settings: {
          intervalMinutes: 25,
          soundRepeatSeconds: 5,
          maxRepetitionSeconds: 30,
          soundPreference: SoundscapeKey.Gong,
          quote: '',
          voiceURI: '',
          darkMode: false,
        },
      }

      saveToStorage(data)
      const loaded = loadFromStorage()
      expect(loaded).toEqual(data)
    })

    it('returns null when nothing is stored', () => {
      expect(loadFromStorage()).toBeNull()
    })
  })

  describe('clearStorage', () => {
    it('removes stored data', () => {
      const data: IPersistedState = {
        history: [],
        dailyAverages: [],
        settings: {
          intervalMinutes: 25,
          soundRepeatSeconds: 5,
          maxRepetitionSeconds: 30,
          soundPreference: SoundscapeKey.Gong,
          quote: '',
          voiceURI: '',
          darkMode: false,
        },
      }

      saveToStorage(data)
      clearStorage()
      expect(loadFromStorage()).toBeNull()
    })
  })

  describe('migrateFromLegacy', () => {
    it('migrates data from legacy key and removes old key', () => {
      const legacyData = {
        history: [{ id: 1, type: 'focus', score: 7, timestamp: '10:00', duration: 25 }],
        intervalMinutes: 30,
        soundRepeatSeconds: 3,
        maxRepetitionSeconds: 60,
        soundPreference: 'bell',
        quote: 'Keep going',
        voiceURI: 'some-voice',
        darkMode: true,
      }

      localStorageMock.setItem('focusFlowData_v6', JSON.stringify(legacyData))

      const result = migrateFromLegacy()

      expect(result).not.toBeNull()
      expect(result!.settings.intervalMinutes).toBe(30)
      expect(result!.settings.soundPreference).toBe('bell')
      expect(result!.settings.darkMode).toBe(true)
      expect(result!.history).toHaveLength(1)
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('focusFlowData_v6')
    })

    it('returns null when no legacy data exists', () => {
      expect(migrateFromLegacy()).toBeNull()
    })
  })
})
