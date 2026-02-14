import { ref } from 'vue'
import { useStorage } from '@vueuse/core'

/**
 * Composable for managing dark/light theme.
 * Persists preference and toggles .dark class on <html>.
 */
export function useTheme() {
  const isDark = useStorage('microfocus-dark-mode', false)
  const isInitialised = ref(false)

  function applyTheme(): void {
    const html = document.documentElement
    if (isDark.value) {
      html.classList.add('dark')
    } else {
      html.classList.remove('dark')
    }
  }

  function toggle(): void {
    isDark.value = !isDark.value
    applyTheme()
  }

  function setDark(value: boolean): void {
    isDark.value = value
    applyTheme()
  }

  function init(): void {
    if (isInitialised.value) return
    applyTheme()
    isInitialised.value = true
  }

  return {
    isDark,
    toggle,
    setDark,
    init,
  }
}
