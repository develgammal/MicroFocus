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
 * e.g. 135 → "2 hrs 15 mins", 45 → "45 mins", 0.5 → "1 min"
 */
export function formatTotalWork(totalMinutes: number): string {
  if (totalMinutes <= 0) return '0 mins'

  const h = Math.floor(totalMinutes / 60)
  const m = Math.round(totalMinutes % 60)

  if (h === 0) {
    const mins = m || 1
    return mins === 1 ? '1 min' : `${mins} mins`
  }
  if (m === 0) {
    return h === 1 ? '1 hr' : `${h} hrs`
  }
  const hrLabel = h === 1 ? 'hr' : 'hrs'
  const minLabel = m === 1 ? 'min' : 'mins'
  return `${h} ${hrLabel} ${m} ${minLabel}`
}

/**
 * Generate a timestamp string for the current time.
 * e.g. "14:30"
 */
export function currentTimestamp(): string {
  return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}
