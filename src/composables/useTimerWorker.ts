import { ref, onBeforeUnmount } from 'vue'

type TickCallback = () => void

/**
 * Composable that manages the Web Worker for the timer.
 * Uses Vite's native Worker syntax for proper TypeScript bundling.
 */
export function useTimerWorker() {
  const isWorkerRunning = ref(false)
  let worker: Worker | null = null
  let tickCallback: TickCallback | null = null

  function ensureWorker(): Worker {
    if (!worker) {
      worker = new Worker(new URL('../workers/timer.worker.ts', import.meta.url), {
        type: 'module',
      })
      worker.onmessage = (e: MessageEvent<string>) => {
        if (e.data === 'tick' && tickCallback) {
          tickCallback()
        }
      }
    }
    return worker
  }

  function startWorker(): void {
    const w = ensureWorker()
    w.postMessage('start')
    isWorkerRunning.value = true
  }

  function stopWorker(): void {
    if (worker) {
      worker.postMessage('stop')
    }
    isWorkerRunning.value = false
  }

  function onTick(callback: TickCallback): void {
    tickCallback = callback
  }

  function terminateWorker(): void {
    stopWorker()
    if (worker) {
      worker.terminate()
      worker = null
    }
  }

  onBeforeUnmount(() => {
    terminateWorker()
  })

  return {
    isWorkerRunning,
    startWorker,
    stopWorker,
    onTick,
    terminateWorker,
  }
}
