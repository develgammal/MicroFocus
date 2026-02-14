/**
 * Format seconds into MM:SS display string.
 */
export function formatTime(totalSeconds: number): string {
  const safe = Math.max(0, totalSeconds)
  const minutes = Math.floor(safe / 60)
  const seconds = Math.floor(safe % 60)
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
}

/**
 * Format total minutes into a human-readable duration string.
 * e.g. 135 → "2h 15m", 45 → "45m", 0.5 → "1m"
 */
export function formatTotalWork(totalMinutes: number): string {
  if (totalMinutes <= 0) return '0m'

  const h = Math.floor(totalMinutes / 60)
  const m = Math.round(totalMinutes % 60)

  if (h === 0) return `${m || 1}m`
  if (m === 0) return `${h}h`
  return `${h}h ${m}m`
}

/**
 * Generate a timestamp string for the current time.
 * e.g. "14:30"
 */
export function currentTimestamp(): string {
  return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}
