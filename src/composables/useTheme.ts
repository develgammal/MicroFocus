import { ref } from 'vue'
import { useStorage } from '@vueuse/core'

/**
 * Detect system dark mode preference
 */
function getSystemDarkMode(): boolean {
  return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
}

/**
 * Composable for managing dark/light theme.
 * Persists preference and toggles .dark class on <html>.
 * Uses browser/system preference as default.
 */
export function useTheme() {
  const isDark = useStorage('microfocus-dark-mode', getSystemDarkMode())
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
