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
const LEGACY_KEY = STORAGE_CONSTANTS.LEGACY_STORAGE_KEY

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
  safeLocalStorageRemove(LEGACY_KEY)
}

/**
 * Migrate old POC data format to new structure
 */
export function migrateFromLegacy(): IPersistedState | null {
  const raw = safeLocalStorageGet(LEGACY_KEY)
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
  }

  // Save migrated data in new format
  saveToStorage(migrated)

  // Remove legacy key
  safeLocalStorageRemove(LEGACY_KEY)

  return migrated
}
