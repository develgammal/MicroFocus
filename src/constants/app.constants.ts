/**
 * Application-wide constants
 * Centralized configuration values for the MicroFocus application
 */

// Timer Configuration
export const TIMER_CONSTANTS = {
  /** Default focus interval in minutes */
  DEFAULT_INTERVAL_MINUTES: 25,
  /** Minimum allowed interval in minutes */
  MIN_INTERVAL_MINUTES: 0.1,
  /** Seconds per minute conversion */
  SECONDS_PER_MINUTE: 60,
  /** Milliseconds per second conversion */
  MS_PER_SECOND: 1000,
} as const

// Sound Configuration
export const SOUND_CONSTANTS = {
  /** Default silence between alarm loops in seconds */
  DEFAULT_REPEAT_SECONDS: 5,
  /** Minimum silence between alarm loops in seconds */
  MIN_REPEAT_SECONDS: 2,
  /** Default maximum alarm duration in seconds */
  DEFAULT_MAX_SECONDS: 30,
  /** Minimum maximum alarm duration in seconds */
  MIN_MAX_SECONDS: 5,
} as const

// Storage Configuration
export const STORAGE_CONSTANTS = {
  /** Main storage key for persisted state */
  STORAGE_KEY: 'focusFlowData_v7',
  /** Legacy storage key for migration */
  LEGACY_STORAGE_KEY: 'focusFlowData_v6',
  /** Maximum number of history entries to keep (FIFO) */
  MAX_HISTORY_ENTRIES: 1000,
} as const

// Application Metadata
export const APP_CONSTANTS = {
  /** Application name */
  APP_NAME: 'MicroFocus',
  /** Application title */
  APP_TITLE: 'MicroFocus',
  /** Default theme color */
  THEME_COLOR: '#4f46e5',
} as const

// Score Configuration
export const SCORE_CONSTANTS = {
  /** Minimum focus score */
  MIN_SCORE: 1,
  /** Maximum focus score */
  MAX_SCORE: 10,
  /** Default break score (breaks don't get rated) */
  DEFAULT_BREAK_SCORE: 0,
} as const

// Validation Constraints
export const VALIDATION_CONSTRAINTS = {
  /** Maximum length for motivational quote */
  MAX_QUOTE_LENGTH: 500,
  /** Minimum interval value to prevent division by zero */
  MIN_SAFE_INTERVAL: 0.01,
} as const
