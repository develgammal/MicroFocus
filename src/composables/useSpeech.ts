import { ref, onMounted } from 'vue'
import type { IVoiceOption } from '@/interfaces'

/**
 * Composable for Text-to-Speech functionality.
 * Wraps the Web Speech API with reactive voice list and speak/cancel methods.
 */
export function useSpeech() {
  const availableVoices = ref<IVoiceOption[]>([])
  const isSpeaking = ref(false)

  function refreshVoices(): void {
    if (!window.speechSynthesis) return

    const voices = window.speechSynthesis.getVoices()
    const langNames = new Intl.DisplayNames(['en'], { type: 'language' })

    availableVoices.value = voices.map((voice) => {
      let displayLang = voice.lang
      try {
        displayLang = langNames.of(voice.lang) ?? voice.lang
      } catch {
        // Fallback to raw lang code
      }

      return {
        voiceURI: voice.voiceURI,
        name: voice.name,
        lang: voice.lang,
        displayName: `${displayLang} — ${voice.name}`,
      }
    })
  }

  function speak(text: string, voiceURI: string): Promise<void> {
    return new Promise((resolve) => {
      if (!window.speechSynthesis || !text.trim()) {
        resolve()
        return
      }

      window.speechSynthesis.cancel()

      const utterance = new SpeechSynthesisUtterance(text)

      if (voiceURI) {
        const voices = window.speechSynthesis.getVoices()
        const selected = voices.find((v) => v.voiceURI === voiceURI)
        if (selected) utterance.voice = selected
      }

      utterance.onstart = () => {
        isSpeaking.value = true
      }
      utterance.onend = () => {
        isSpeaking.value = false
        resolve()
      }
      utterance.onerror = () => {
        isSpeaking.value = false
        resolve()
      }

      window.speechSynthesis.speak(utterance)
    })
  }

  function cancelSpeech(): void {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel()
    }
    isSpeaking.value = false
  }

  onMounted(() => {
    refreshVoices()
    if (window.speechSynthesis) {
      window.speechSynthesis.onvoiceschanged = refreshVoices
    }
  })

  return {
    availableVoices,
    isSpeaking,
    speak,
    cancelSpeech,
    refreshVoices,
  }
}
