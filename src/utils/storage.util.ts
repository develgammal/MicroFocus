import type { IPersistedState } from '@/interfaces'
import { SoundscapeKey } from '@/interfaces'
import { STORAGE_CONSTANTS, TIMER_CONSTANTS, SOUND_CONSTANTS } from '@/constants/app.constants'
import {
  safeLocalStorageGet,
  safeLocalStorageSet,
  safeLocalStorageRemove,
  safeJSONParse,
  safeJSONStringify,
} from '@/utils/error.util'

const STORAGE_KEY = STORAGE_CONSTANTS.STORAGE_KEY
const LEGACY_KEY_V7 = STORAGE_CONSTANTS.LEGACY_STORAGE_KEY_V7
const LEGACY_KEY_V6 = STORAGE_CONSTANTS.LEGACY_STORAGE_KEY_V6

/**
 * Get current localStorage usage in MB
 */
export function getStorageSize(): number {
  try {
    let total = 0
    for (const key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        const value = localStorage[key]
        // UTF-16 encoding: 2 bytes per character
        total += (key.length + value.length) * 2
      }
    }
    return total / (1024 * 1024) // Convert to MB
  } catch {
    return 0
  }
}

/**
 * Check if localStorage is near capacity
 */
export function isStorageNearCapacity(thresholdMB = STORAGE_CONSTANTS.STORAGE_THRESHOLD_MB): boolean {
  return getStorageSize() >= thresholdMB
}

/**
 * Load persisted state from localStorage
 */
export function loadFromStorage(): IPersistedState | null {
  const raw = safeLocalStorageGet(STORAGE_KEY)
  if (!raw) return null

  const parsed = safeJSONParse<IPersistedState>(raw, null as never)
  return parsed || null
}

/**
 * Save state to localStorage
 */
export function saveToStorage(data: IPersistedState): void {
  const json = safeJSONStringify(data)
  safeLocalStorageSet(STORAGE_KEY, json)
}

/**
 * Clear all app data from localStorage
 */
export function clearStorage(): void {
  safeLocalStorageRemove(STORAGE_KEY)
  safeLocalStorageRemove(LEGACY_KEY_V7)
  safeLocalStorageRemove(LEGACY_KEY_V6)
}

/**
 * Migrate v7 data to v8 format (adds dailyAverages array)
 */
function migrateFromV7(): IPersistedState | null {
  const raw = safeLocalStorageGet(LEGACY_KEY_V7)
  if (!raw) return null

  const v7Data = safeJSONParse<{ history: unknown[]; settings: unknown }>(raw, null as never)
  if (!v7Data || typeof v7Data !== 'object') return null

  // Add empty dailyAverages array
  const migrated: IPersistedState = {
    history: (Array.isArray(v7Data.history) ? v7Data.history : []) as IPersistedState['history'],
    dailyAverages: [],
    settings: v7Data.settings as IPersistedState['settings'],
  }

  // Save migrated data in new format
  saveToStorage(migrated)

  // Remove legacy key
  safeLocalStorageRemove(LEGACY_KEY_V7)

  return migrated
}

/**
 * Migrate old v6 data format to v8 structure
 */
function migrateFromV6(): IPersistedState | null {
  const raw = safeLocalStorageGet(LEGACY_KEY_V6)
  if (!raw) return null

  const legacy = safeJSONParse<Record<string, unknown>>(raw, {})
  if (!legacy || typeof legacy !== 'object') return null

  // Map legacy structure to new IPersistedState with defaults from constants
  const migrated: IPersistedState = {
    settings: {
      intervalMinutes: (legacy.intervalMinutes as number) ?? TIMER_CONSTANTS.DEFAULT_INTERVAL_MINUTES,
      maxRepetitionSeconds: (legacy.maxRepetitionSeconds as number) ?? SOUND_CONSTANTS.DEFAULT_MAX_SECONDS,
      soundPreference: ((legacy.soundPreference ?? SoundscapeKey.Gong) as SoundscapeKey),
      soundRepeatSeconds: (legacy.soundRepetitionSeconds as number) ?? SOUND_CONSTANTS.DEFAULT_REPEAT_SECONDS,
      quote: (legacy.quote as string) ?? '',
      voiceURI: (legacy.voiceURI as string) ?? '',
      darkMode: (legacy.darkMode as boolean) ?? false,
    },
    history: Array.isArray(legacy.history) ? legacy.history : [],
    dailyAverages: [],
  }

  // Save migrated data in new format
  saveToStorage(migrated)

  // Remove legacy key
  safeLocalStorageRemove(LEGACY_KEY_V6)

  return migrated
}

/**
 * Attempt to migrate from legacy formats (tries v7 first, then v6)
 */
export function migrateFromLegacy(): IPersistedState | null {
  return migrateFromV7() || migrateFromV6()
}
