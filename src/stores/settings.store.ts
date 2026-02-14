import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import { SoundscapeKey } from '@/interfaces'
import type { IAppSettings } from '@/interfaces'
import { loadFromStorage, saveToStorage, migrateFromLegacy } from '@/utils/storage.util'
import { useHistoryStore } from './history.store'

export const useSettingsStore = defineStore('settings', () => {
  // --- State ---
  const intervalMinutes = ref(25)
  const soundRepeatSeconds = ref(5)
  const maxRepetitionSeconds = ref(30)
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

      // Also load history if migrating
      if (!saved && data.history.length > 0) {
        const historyStore = useHistoryStore()
        historyStore.loadSessions(data.history)
      }
    }
  }

  function persistAll(): void {
    const historyStore = useHistoryStore()
    saveToStorage({
      history: historyStore.sessions,
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
    const v = parseFloat(String(value))
    intervalMinutes.value = isNaN(v) || v < 0.1 ? 0.1 : v
  }

  function updateSoundRepeat(value: number): void {
    const v = parseFloat(String(value))
    soundRepeatSeconds.value = isNaN(v) || v < 2 ? 2 : v
  }

  function updateMaxRepetition(value: number): void {
    const v = parseFloat(String(value))
    maxRepetitionSeconds.value = isNaN(v) || v < 5 ? 5 : v
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
