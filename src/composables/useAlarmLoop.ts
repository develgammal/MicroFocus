import { ref, onBeforeUnmount } from 'vue'
import { useAudioSynth } from './useAudioSynth'
import { useSpeech } from './useSpeech'
import type { SoundscapeKey } from '@/interfaces'

/**
 * Composable that orchestrates the alarm loop:
 * sound → wait → TTS quote → wait → sound → ... until max duration cutoff.
 */
export function useAlarmLoop() {
  const { playSound } = useAudioSynth()
  const { speak, cancelSpeech, isSpeaking } = useSpeech()

  const isAlarming = ref(false)

  let loopTimeout: ReturnType<typeof setTimeout> | null = null
  let maxDurationTimeout: ReturnType<typeof setTimeout> | null = null
  let maxDurationReached = false
  let nextAction: 'sound' | 'quote' = 'sound'

  // Current alarm config (set when starting)
  let currentSound: SoundscapeKey = 'gong' as SoundscapeKey
  let currentQuote = ''
  let currentVoiceURI = ''
  let currentSilenceSeconds = 5
  let currentMaxSeconds = 30

  function startAlarmLoop(config: {
    sound: SoundscapeKey
    quote: string
    voiceURI: string
    silenceSeconds: number
    maxSeconds: number
  }): void {
    stopAlarm()

    currentSound = config.sound
    currentQuote = config.quote
    currentVoiceURI = config.voiceURI
    currentSilenceSeconds = config.silenceSeconds
    currentMaxSeconds = config.maxSeconds

    isAlarming.value = true
    maxDurationReached = false
    nextAction = 'sound'

    // Safety cutoff
    if (currentMaxSeconds > 0) {
      maxDurationTimeout = setTimeout(() => {
        maxDurationReached = true
        if (!isSpeaking.value) {
          stopAlarm()
        }
      }, currentMaxSeconds * 1000)
    }

    executeStep()
  }

  function executeStep(): void {
    if (maxDurationReached) return

    if (nextAction === 'sound') {
      playSound(currentSound)

      // Determine next step
      if (currentQuote.trim()) {
        nextAction = 'quote'
      }

      loopTimeout = setTimeout(executeStep, currentSilenceSeconds * 1000)
    } else if (nextAction === 'quote') {
      void speak(currentQuote, currentVoiceURI).then(() => {
        if (maxDurationReached) {
          stopAlarm()
        } else {
          nextAction = 'sound'
          loopTimeout = setTimeout(executeStep, currentSilenceSeconds * 1000)
        }
      })
    }
  }

  function stopAlarm(): void {
    if (loopTimeout) clearTimeout(loopTimeout)
    if (maxDurationTimeout) clearTimeout(maxDurationTimeout)
    loopTimeout = null
    maxDurationTimeout = null
    cancelSpeech()
    isAlarming.value = false
  }

  onBeforeUnmount(() => {
    stopAlarm()
  })

  return {
    isAlarming,
    startAlarmLoop,
    stopAlarm,
  }
}
