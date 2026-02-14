import type { IPersistedState } from '@/interfaces'

const STORAGE_KEY = 'microfocus_v1'
const LEGACY_KEY = 'focusFlowData_v6'

/**
 * Load persisted state from localStorage
 */
export function loadFromStorage(): IPersistedState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw) as IPersistedState
  } catch {
    return null
  }
}

/**
 * Save state to localStorage
 */
export function saveToStorage(data: IPersistedState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch (err) {
    console.error('Failed to save to localStorage:', err)
  }
}

/**
 * Clear all app data from localStorage
 */
export function clearStorage(): void {
  try {
    localStorage.removeItem(STORAGE_KEY)
    localStorage.removeItem(LEGACY_KEY)
  } catch (err) {
    console.error('Failed to clear localStorage:', err)
  }
}

/**
 * Migrate old POC data format to new structure
 */
export function migrateFromLegacy(): IPersistedState | null {
  try {
    const raw = localStorage.getItem(LEGACY_KEY)
    if (!raw) return null

    const legacy = JSON.parse(raw)
    if (!legacy || typeof legacy !== 'object') return null

    // Map legacy structure to new IPersistedState
    const migrated: IPersistedState = {
      settings: {
        intervalMinutes: legacy.intervalMinutes ?? 25,
        maxRepetitionSeconds: legacy.maxRepetitionSeconds ?? 30,
        soundPreference: legacy.soundPreference ?? 'gong',
        soundRepeatSeconds: legacy.soundRepetitionSeconds ?? 5,
        quote: legacy.quote ?? '',
        voiceURI: legacy.voiceURI ?? '',
        darkMode: false,
      },
      history: Array.isArray(legacy.sessions) ? legacy.sessions : [],
    }

    // Save migrated data in new format
    saveToStorage(migrated)

    // Remove legacy key
    localStorage.removeItem(LEGACY_KEY)

    return migrated
  } catch (err) {
    console.error('Failed to migrate legacy storage:', err)
    return null
  }
}
