let timerInterval: ReturnType<typeof setInterval> | null = null

self.onmessage = function (e: MessageEvent<'start' | 'stop'>) {
  if (e.data === 'start') {
    if (timerInterval) clearInterval(timerInterval)
    timerInterval = setInterval(() => {
      self.postMessage('tick')
    }, 1000)
  } else if (e.data === 'stop') {
    if (timerInterval) {
      clearInterval(timerInterval)
      timerInterval = null
    }
  }
}
