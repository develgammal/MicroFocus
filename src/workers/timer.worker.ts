import type { TimerWorkerCommand, TimerWorkerMessage } from '@/interfaces'

let intervalId: ReturnType<typeof setInterval> | null = null

self.onmessage = (e: MessageEvent<TimerWorkerCommand>) => {
  const command = e.data

  if (command === 'start') {
    if (intervalId) return
    intervalId = setInterval(() => {
      const message: TimerWorkerMessage = 'tick'
      self.postMessage(message)
    }, 1000)
  } else if (command === 'stop') {
    if (intervalId) {
      clearInterval(intervalId)
      intervalId = null
    }
  }
}

// Prevent errors due to external TS compilation scope
export {}
