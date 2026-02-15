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
  STORAGE_KEY: 'focusFlowData_v8',
  /** Legacy storage key for migration from v7 */
  LEGACY_STORAGE_KEY_V7: 'focusFlowData_v7',
  /** Legacy storage key for migration from v6 */
  LEGACY_STORAGE_KEY_V6: 'focusFlowData_v6',
  /** Maximum number of hourly session entries to keep (visual limit) */
  MAX_HOURLY_SESSIONS: 100,
  /** Maximum number of daily average entries to keep (visual limit) */
  MAX_DAILY_AVERAGES: 60,
  /** Storage capacity threshold in MB to trigger aggressive cleanup */
  STORAGE_THRESHOLD_MB: 4,
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

// Cognitive Fatigue Detection (Psychology-backed defaults)
// Based on BRAC ultradian rhythms, Vigilance Decrement research,
// and Minimal Important Difference (MID) psychometrics.
export const COGNITIVE_CONSTANTS = {
  /** Rolling window size in sessions (aligned with 90-min BRAC cycle) */
  ROLLING_WINDOW_SIZE: 3,
  /** Steep crash slope threshold (rapid vigilance decrement) */
  STEEP_CRASH_SLOPE: -1.5,
  /** Exhaustion slope threshold (slow drain into distress) */
  EXHAUSTION_SLOPE: -0.5,
  /** Distress threshold — scores at or below indicate Yerkes-Dodson distress */
  DISTRESS_THRESHOLD: 5,
  /** Stagnation threshold — bottom-tier indicating total burnout */
  STAGNATION_THRESHOLD: 4,
  /** Warm-up slope — positive momentum indicating flow onset */
  WARMUP_SLOPE: 0.5,
  /** Minimum score to consider user in flow state */
  FLOW_SCORE_MIN: 7,
  /** Minimum slope to maintain flow state (slight dip allowed) */
  FLOW_SLOPE_MIN: -0.4,
  /** Auto-dismiss duration for rebound banner in ms */
  REBOUND_BANNER_DURATION_MS: 8000,
  /** Auto-dismiss duration for warm-up banner in ms */
  WARMUP_BANNER_DURATION_MS: 5000,
  /** Minimum total window duration in minutes for reliable OLS analysis */
  MIN_WINDOW_MINUTES: 45,
  /** Recommended break duration for steep crash (minutes) */
  BREAK_DURATION_STEEP_CRASH: 20,
  /** Recommended break duration for exhaustion (minutes) */
  BREAK_DURATION_EXHAUSTION: 15,
  /** Recommended break duration for stagnation (minutes) */
  BREAK_DURATION_STAGNATION: 10,
  /** Ratio of actual/recommended break below which recovery is flagged */
  INSUFFICIENT_BREAK_RATIO: 0.7,
  /** Extended macro-break for insufficient recovery (minutes) */
  BREAK_DURATION_MACRO: 30,
} as const

// Validation Constraints
export const VALIDATION_CONSTRAINTS = {
  /** Maximum length for motivational quote */
  MAX_QUOTE_LENGTH: 500,
  /** Minimum interval value to prevent division by zero */
  MIN_SAFE_INTERVAL: 0.01,
} as const
