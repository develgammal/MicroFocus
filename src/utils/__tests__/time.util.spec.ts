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
  it('returns "0 mins" for zero minutes', () => {
    expect(formatTotalWork(0)).toBe('0 mins')
  })

  it('returns "0 mins" for negative minutes', () => {
    expect(formatTotalWork(-10)).toBe('0 mins')
  })

  it('returns minutes-only for sub-hour values', () => {
    expect(formatTotalWork(45)).toBe('45 mins')
  })

  it('returns hours-only when minutes are exactly divisible', () => {
    expect(formatTotalWork(120)).toBe('2 hrs')
  })

  it('returns combined hours and minutes', () => {
    expect(formatTotalWork(135)).toBe('2 hrs 15 mins')
  })

  it('handles fractional minutes by rounding', () => {
    expect(formatTotalWork(0.3)).toBe('1 min')
  })

  it('handles 1 minute', () => {
    expect(formatTotalWork(1)).toBe('1 min')
  })

  it('handles 1 hour', () => {
    expect(formatTotalWork(60)).toBe('1 hr')
  })

  it('handles 1 hour 1 minute', () => {
    expect(formatTotalWork(61)).toBe('1 hr 1 min')
  })
})

describe('currentTimestamp', () => {
  it('returns a string in HH:MM format', () => {
    const ts = currentTimestamp()
    expect(ts).toMatch(/\d{1,2}:\d{2}/)
  })
})
