import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useSettingsStore } from '@/stores/settings.store'
import { SoundscapeKey } from '@/interfaces'

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

describe('settings.store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    localStorageMock.clear()
    vi.clearAllMocks()
  })

  it('has correct default values', () => {
    const store = useSettingsStore()
    expect(store.intervalMinutes).toBe(25)
    expect(store.soundRepeatSeconds).toBe(5)
    expect(store.maxRepetitionSeconds).toBe(30)
    expect(store.soundPreference).toBe(SoundscapeKey.Gong)
    expect(store.quote).toBe('')
    expect(store.voiceURI).toBe('')
    expect(store.darkMode).toBe(false)
  })

  it('updates interval with validation', () => {
    const store = useSettingsStore()

    store.updateInterval(10)
    expect(store.intervalMinutes).toBe(10)

    store.updateInterval(-5)
    expect(store.intervalMinutes).toBe(0.1)

    store.updateInterval(NaN)
    expect(store.intervalMinutes).toBe(0.1)
  })

  it('updates sound repeat with validation', () => {
    const store = useSettingsStore()

    store.updateSoundRepeat(10)
    expect(store.soundRepeatSeconds).toBe(10)

    store.updateSoundRepeat(1)
    expect(store.soundRepeatSeconds).toBe(2)
  })

  it('updates max repetition with validation', () => {
    const store = useSettingsStore()

    store.updateMaxRepetition(60)
    expect(store.maxRepetitionSeconds).toBe(60)

    store.updateMaxRepetition(3)
    expect(store.maxRepetitionSeconds).toBe(5)
  })

  it('toggles dark mode', () => {
    const store = useSettingsStore()

    expect(store.darkMode).toBe(false)
    store.toggleDarkMode()
    expect(store.darkMode).toBe(true)
    store.toggleDarkMode()
    expect(store.darkMode).toBe(false)
  })

  it('returns current settings as IAppSettings', () => {
    const store = useSettingsStore()
    const settings = store.currentSettings()

    expect(settings).toEqual({
      intervalMinutes: 25,
      soundRepeatSeconds: 5,
      maxRepetitionSeconds: 30,
      soundPreference: 'gong',
      quote: '',
      voiceURI: '',
      darkMode: false,
    })
  })
})
