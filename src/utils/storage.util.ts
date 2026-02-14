import { SoundscapeKey } from '@/interfaces'
import type { IPersistedState } from '@/interfaces'

const APP_STORAGE_KEY = 'microfocus_v1'

export function loadFromStorage(): IPersistedState | null {
  try {
    const raw = localStorage.getItem(APP_STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw) as IPersistedState
  } catch {
    return null
  }
}

export function saveToStorage(data: IPersistedState): void {
  try {
    localStorage.setItem(APP_STORAGE_KEY, JSON.stringify(data))
  } catch {
    // Storage quota exceeded — silently fail
  }
}

export function clearStorage(): void {
  localStorage.removeItem(APP_STORAGE_KEY)
}

/**
 * Migrate from the old proof-of-concept storage key.
 * Returns the old history data if found, then removes the old key.
 */
export function migrateFromLegacy(): IPersistedState | null {
  const LEGACY_KEY = 'focusFlowData_v6'
  try {
    const raw = localStorage.getItem(LEGACY_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Record<string, unknown>

    const migrated: IPersistedState = {
      history: Array.isArray(parsed['history']) ? parsed['history'] : [],
      settings: {
        intervalMinutes:
          typeof parsed['intervalMinutes'] === 'number' ? parsed['intervalMinutes'] : 25,
        soundRepeatSeconds:
          typeof parsed['soundRepeatSeconds'] === 'number' ? parsed['soundRepeatSeconds'] : 5,
        maxRepetitionSeconds:
          typeof parsed['maxRepetitionSeconds'] === 'number' ? parsed['maxRepetitionSeconds'] : 30,
        soundPreference:
          typeof parsed['soundPreference'] === 'string'
            ? (parsed['soundPreference'] as SoundscapeKey)
            : SoundscapeKey.Gong,
        quote: typeof parsed['quote'] === 'string' ? parsed['quote'] : '',
        voiceURI: typeof parsed['voiceURI'] === 'string' ? parsed['voiceURI'] : '',
        darkMode: typeof parsed['darkMode'] === 'boolean' ? parsed['darkMode'] : false,
      },
    }

    localStorage.removeItem(LEGACY_KEY)
    return migrated
  } catch {
    return null
  }
}
