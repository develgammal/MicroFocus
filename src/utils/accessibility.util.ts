/**
 * ARIA live region announcer for timer state changes.
 * Creates a visually-hidden live region that screen readers pick up.
 */
let announcer: HTMLElement | null = null

function getAnnouncer(): HTMLElement {
  if (announcer) return announcer

  announcer = document.createElement('div')
  announcer.setAttribute('role', 'status')
  announcer.setAttribute('aria-live', 'polite')
  announcer.setAttribute('aria-atomic', 'true')
  announcer.className = 'sr-only'
  document.body.appendChild(announcer)

  return announcer
}

export function announce(message: string): void {
  const el = getAnnouncer()
  // Clear and reset to trigger screen reader re-announcement
  el.textContent = ''
  requestAnimationFrame(() => {
    el.textContent = message
  })
}
