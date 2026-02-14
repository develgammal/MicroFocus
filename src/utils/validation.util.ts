/**
 * Validation utilities for input sanitization and validation
 */

import {
  TIMER_CONSTANTS,
  SOUND_CONSTANTS,
  SCORE_CONSTANTS,
  VALIDATION_CONSTRAINTS,
} from '@/constants/app.constants'

/**
 * Validates and sanitizes interval minutes input
 * @param value - Raw input value
 * @returns Validated interval value
 */
export function validateInterval(value: number | string): number {
  const parsed = typeof value === 'string' ? parseFloat(value) : value

  if (isNaN(parsed) || parsed < TIMER_CONSTANTS.MIN_INTERVAL_MINUTES) {
    return TIMER_CONSTANTS.MIN_INTERVAL_MINUTES
  }

  return Math.max(VALIDATION_CONSTRAINTS.MIN_SAFE_INTERVAL, parsed)
}

/**
 * Validates and sanitizes sound repeat seconds input
 * @param value - Raw input value
 * @returns Validated sound repeat value
 */
export function validateSoundRepeat(value: number | string): number {
  const parsed = typeof value === 'string' ? parseFloat(value) : value

  if (isNaN(parsed) || parsed < SOUND_CONSTANTS.MIN_REPEAT_SECONDS) {
    return SOUND_CONSTANTS.MIN_REPEAT_SECONDS
  }

  return parsed
}

/**
 * Validates and sanitizes max repetition seconds input
 * @param value - Raw input value
 * @returns Validated max repetition value
 */
export function validateMaxRepetition(value: number | string): number {
  const parsed = typeof value === 'string' ? parseFloat(value) : value

  if (isNaN(parsed) || parsed < SOUND_CONSTANTS.MIN_MAX_SECONDS) {
    return SOUND_CONSTANTS.MIN_MAX_SECONDS
  }

  return parsed
}

/**
 * Validates focus score
 * @param score - Score value to validate
 * @returns True if score is valid
 */
export function isValidScore(score: number): boolean {
  return (
    Number.isInteger(score) &&
    score >= SCORE_CONSTANTS.MIN_SCORE &&
    score <= SCORE_CONSTANTS.MAX_SCORE
  )
}

/**
 * Validates and sanitizes motivational quote
 * @param quote - Raw quote text
 * @returns Sanitized quote
 */
export function validateQuote(quote: string): string {
  if (typeof quote !== 'string') {
    return ''
  }

  return quote.slice(0, VALIDATION_CONSTRAINTS.MAX_QUOTE_LENGTH).trim()
}

/**
 * Checks if a value is a positive number
 * @param value - Value to check
 * @returns True if positive number
 */
export function isPositiveNumber(value: unknown): value is number {
  return typeof value === 'number' && !isNaN(value) && value > 0
}
