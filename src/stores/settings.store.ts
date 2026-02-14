import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import { SoundscapeKey } from '@/interfaces'
import type { IAppSettings } from '@/interfaces'
import { loadFromStorage, saveToStorage, migrateFromLegacy } from '@/utils/storage.util'
import { useHistoryStore } from './history.store'
import { TIMER_CONSTANTS, SOUND_CONSTANTS } from '@/constants/app.constants'
import {
  validateInterval,
  validateSoundRepeat,
  validateMaxRepetition,
} from '@/utils/validation.util'

export const useSettingsStore = defineStore('settings', () => {
  // --- State ---
  const intervalMinutes = ref<number>(TIMER_CONSTANTS.DEFAULT_INTERVAL_MINUTES)
  const soundRepeatSeconds = ref<number>(SOUND_CONSTANTS.DEFAULT_REPEAT_SECONDS)
  const maxRepetitionSeconds = ref<number>(SOUND_CONSTANTS.DEFAULT_MAX_SECONDS)
  const soundPreference = ref<SoundscapeKey>(SoundscapeKey.Gong)
  const quote = ref('')
  const voiceURI = ref('')
  const darkMode = ref(false)

  // --- Actions ---
  function loadSettings(): void {
    // Try loading from new storage first, then migrate from legacy
    const saved = loadFromStorage()
    const data = saved ?? migrateFromLegacy()

    if (data) {
      const s = data.settings
      intervalMinutes.value = s.intervalMinutes
      soundRepeatSeconds.value = s.soundRepeatSeconds
      maxRepetitionSeconds.value = s.maxRepetitionSeconds
      soundPreference.value = s.soundPreference as SoundscapeKey
      quote.value = s.quote
      voiceURI.value = s.voiceURI
      darkMode.value = s.darkMode

      // Load history data
      const historyStore = useHistoryStore()
      if (data.history.length > 0) {
        historyStore.loadSessions(data.history)
      }
      if (data.dailyAverages && data.dailyAverages.length > 0) {
        historyStore.loadDailyAverages(data.dailyAverages)
      }
    }
  }

  function persistAll(): void {
    const historyStore = useHistoryStore()
    saveToStorage({
      history: historyStore.sessions,
      dailyAverages: historyStore.dailyAverages,
      settings: currentSettings(),
    })
  }

  function currentSettings(): IAppSettings {
    return {
      intervalMinutes: intervalMinutes.value,
      soundRepeatSeconds: soundRepeatSeconds.value,
      maxRepetitionSeconds: maxRepetitionSeconds.value,
      soundPreference: soundPreference.value,
      quote: quote.value,
      voiceURI: voiceURI.value,
      darkMode: darkMode.value,
    }
  }

  function toggleDarkMode(): void {
    darkMode.value = !darkMode.value
  }

  function updateInterval(value: number): void {
    intervalMinutes.value = validateInterval(value)
  }

  function updateSoundRepeat(value: number): void {
    soundRepeatSeconds.value = validateSoundRepeat(value)
  }

  function updateMaxRepetition(value: number): void {
    maxRepetitionSeconds.value = validateMaxRepetition(value)
  }

  // Auto-persist on every setting change
  watch(
    [
      intervalMinutes,
      soundRepeatSeconds,
      maxRepetitionSeconds,
      soundPreference,
      quote,
      voiceURI,
      darkMode,
    ],
    () => {
      persistAll()
    },
  )

  return {
    // State
    intervalMinutes,
    soundRepeatSeconds,
    maxRepetitionSeconds,
    soundPreference,
    quote,
    voiceURI,
    darkMode,
    // Actions
    loadSettings,
    persistAll,
    currentSettings,
    toggleDarkMode,
    updateInterval,
    updateSoundRepeat,
    updateMaxRepetition,
  }
})
