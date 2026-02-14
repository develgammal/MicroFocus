import { describe, it, expect } from 'vitest'
import { formatTime, formatTotalWork, currentTimestamp } from '@/utils/time.util'

describe('formatTime', () => {
  it('formats zero seconds as 00:00', () => {
    expect(formatTime(0)).toBe('00:00')
  })

  it('formats negative seconds as 00:00', () => {
    expect(formatTime(-5)).toBe('00:00')
  })

  it('formats 60 seconds as 01:00', () => {
    expect(formatTime(60)).toBe('01:00')
  })

  it('formats 90 seconds as 01:30', () => {
    expect(formatTime(90)).toBe('01:30')
  })

  it('formats 25 minutes (1500s) as 25:00', () => {
    expect(formatTime(1500)).toBe('25:00')
  })

  it('formats fractional seconds by flooring', () => {
    expect(formatTime(61.9)).toBe('01:01')
  })

  it('pads single-digit minutes and seconds', () => {
    expect(formatTime(65)).toBe('01:05')
  })

  it('handles large values', () => {
    expect(formatTime(3661)).toBe('61:01')
  })
})

describe('formatTotalWork', () => {
  it('returns "0m" for zero minutes', () => {
    expect(formatTotalWork(0)).toBe('0m')
  })

  it('returns "0m" for negative minutes', () => {
    expect(formatTotalWork(-10)).toBe('0m')
  })

  it('returns minutes-only for sub-hour values', () => {
    expect(formatTotalWork(45)).toBe('45m')
  })

  it('returns hours-only when minutes are exactly divisible', () => {
    expect(formatTotalWork(120)).toBe('2h')
  })

  it('returns combined hours and minutes', () => {
    expect(formatTotalWork(135)).toBe('2h 15m')
  })

  it('handles fractional minutes by rounding', () => {
    expect(formatTotalWork(0.3)).toBe('1m')
  })

  it('handles 1 minute', () => {
    expect(formatTotalWork(1)).toBe('1m')
  })
})

describe('currentTimestamp', () => {
  it('returns a string in HH:MM format', () => {
    const ts = currentTimestamp()
    expect(ts).toMatch(/\d{1,2}:\d{2}/)
  })
})
