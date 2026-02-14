import { onBeforeUnmount } from 'vue'
import type { TimerWorkerMessage } from '@/interfaces'

/**
 * Composable to manage the Web Worker for timer ticks.
 * Uses Vite's native Worker support with `?worker` suffix.
 */
export function useTimerWorker() {
  let worker: Worker | null = null
  let tickCallback: (() => void) | null = null

  function startWorker(): void {
    if (worker) return

    // Vite supports importing workers with ?worker suffix
    worker = new Worker(new URL('../workers/timer.worker.ts', import.meta.url), {
      type: 'module',
    })

    worker.onmessage = (e: MessageEvent<TimerWorkerMessage>) => {
      const data = e.data
      if (data === 'tick' && tickCallback) {
        tickCallback()
      }
    }

    worker.postMessage('start')
  }

  function stopWorker(): void {
    if (worker) {
      worker.postMessage('stop')
      worker.terminate()
      worker = null
    }
  }

  function onTick(callback: () => void): void {
    tickCallback = callback
  }

  onBeforeUnmount(() => {
    stopWorker()
  })

  return {
    startWorker,
    stopWorker,
    onTick,
  }
}
