import { onMounted, onUnmounted } from 'vue'

/**
 * Auto-dismiss composable.
 *
 * Calls the provided callback after `ms` milliseconds once the component
 * mounts, and cleans up the timer when the component unmounts. Designed
 * for transient banners/notifications that disappear on their own.
 */
export function useAutoDismiss(callback: () => void, ms: number): void {
  let timer: ReturnType<typeof setTimeout> | null = null

  onMounted(() => {
    timer = setTimeout(callback, ms)
  })

  onUnmounted(() => {
    if (timer) clearTimeout(timer)
  })
}
