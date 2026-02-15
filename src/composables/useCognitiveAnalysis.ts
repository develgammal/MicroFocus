/**
 * Cognitive Fatigue Detection Module
 *
 * Implements a psychology-backed algorithm for detecting cognitive fatigue
 * using a rolling window of focus session scores. Based on:
 * - Basic Rest-Activity Cycle (BRAC) ultradian rhythms
 * - Vigilance Decrement (Mackworth, 1948)
 * - Yerkes-Dodson Law (eustress vs distress)
 * - Minimal Important Difference (MID) psychometrics
 * - Flow Theory (Csíkszentmihalyi, 1975)
 *
 * Uses OLS linear regression slope over N sessions to classify:
 *   Steep Crash, Exhaustion, Stagnation, Warm-Up, Flow, Continue
 *
 * The state detection is data-driven via a priority-ordered rules table,
 * making it trivial to add, remove, or reorder states without touching logic.
 */

import { COGNITIVE_CONSTANTS } from '@/constants/app.constants'
import { CognitiveState } from '@/interfaces'
import type { IFocusSession, IBreakSuggestion, IReboundResult, ISessionEntry } from '@/interfaces'

// ---------------------------------------------------------------------------
// Lookups & Configuration Tables
// ---------------------------------------------------------------------------

/** Maps crash states to their recommended break duration in minutes. */
const BREAK_DURATION_MAP: Partial<Record<CognitiveState, number>> = {
  [CognitiveState.SteepCrash]: COGNITIVE_CONSTANTS.BREAK_DURATION_STEEP_CRASH,
  [CognitiveState.Exhaustion]: COGNITIVE_CONSTANTS.BREAK_DURATION_EXHAUSTION,
  [CognitiveState.Stagnation]: COGNITIVE_CONSTANTS.BREAK_DURATION_STAGNATION,
}

/** States that warrant a break suggestion (O(1) lookup). */
const CRASH_STATES: ReadonlySet<CognitiveState> = new Set([
  CognitiveState.SteepCrash,
  CognitiveState.Exhaustion,
  CognitiveState.Stagnation,
  CognitiveState.InsufficientBreak,
])

// ---------------------------------------------------------------------------
// Data-driven cognitive state rules engine
// ---------------------------------------------------------------------------

/** Input metrics computed once per evaluation window. */
interface IWindowMetrics {
  slope: number
  currentScore: number
  percentDecline: number
  windowMinutes: number
}

/**
 * A single rule in the priority-ordered cognitive state evaluation table.
 * Rules are tested top-to-bottom; the first match wins.
 */
interface ICognitiveRule {
  state: CognitiveState
  match: (m: IWindowMetrics) => boolean
}

/**
 * Priority-ordered rules table.
 * To add a new cognitive state, append a rule at the desired priority.
 */
const COGNITIVE_RULES: readonly ICognitiveRule[] = [
  // 1. Steep Crash — rapid vigilance decrement
  {
    state: CognitiveState.SteepCrash,
    match: (m) => m.slope <= COGNITIVE_CONSTANTS.STEEP_CRASH_SLOPE,
  },
  // 2. Exhaustion — moderate decline landing in distress
  {
    state: CognitiveState.Exhaustion,
    match: (m) =>
      m.slope <= COGNITIVE_CONSTANTS.EXHAUSTION_SLOPE &&
      m.currentScore <= COGNITIVE_CONSTANTS.DISTRESS_THRESHOLD,
  },
  // 3. Stagnation — stuck at bottom with no improvement
  {
    state: CognitiveState.Stagnation,
    match: (m) =>
      m.slope <= 0 &&
      m.currentScore <= COGNITIVE_CONSTANTS.STAGNATION_THRESHOLD,
  },
  // 4. Warm-Up — low but improving (protect flow onset)
  {
    state: CognitiveState.WarmUp,
    match: (m) =>
      m.slope >= COGNITIVE_CONSTANTS.WARMUP_SLOPE &&
      m.currentScore <= COGNITIVE_CONSTANTS.DISTRESS_THRESHOLD,
  },
  // 5. Flow — high and stable
  {
    state: CognitiveState.Flow,
    match: (m) =>
      m.slope >= COGNITIVE_CONSTANTS.FLOW_SLOPE_MIN &&
      m.currentScore >= COGNITIVE_CONSTANTS.FLOW_SCORE_MIN,
  },
]

// ---------------------------------------------------------------------------
// Session history helpers
// ---------------------------------------------------------------------------

/**
 * Find the index of the last entry matching a given type, walking backwards.
 * Returns -1 when no match is found.
 */
function findLastIndexByType(sessions: ISessionEntry[], type: 'focus' | 'break'): number {
  for (let i = sessions.length - 1; i >= 0; i--) {
    if (sessions[i]!.type === type) return i
  }
  return -1
}

/**
 * Extract focus sessions that occurred after the most recent break.
 * This naturally resets the analysis window after every break.
 */
export function getFocusSessionsSinceLastBreak(sessions: ISessionEntry[]): IFocusSession[] {
  const lastBreakIndex = findLastIndexByType(sessions, 'break')
  const afterBreak = lastBreakIndex >= 0 ? sessions.slice(lastBreakIndex + 1) : sessions
  return afterBreak.filter((s): s is IFocusSession => s.type === 'focus')
}

/**
 * Get the score of the focus session immediately before the last break.
 * Used for calculating rebound after the break ends.
 */
export function getLastPreBreakScore(sessions: ISessionEntry[]): number | null {
  const lastBreakIndex = findLastIndexByType(sessions, 'break')
  if (lastBreakIndex < 0) return null

  for (let i = lastBreakIndex - 1; i >= 0; i--) {
    const entry = sessions[i]!
    if (entry.type === 'focus') return entry.score
  }
  return null
}

/**
 * Get the duration in minutes of the last break session.
 */
export function getLastBreakDuration(sessions: ISessionEntry[]): number | null {
  for (let i = sessions.length - 1; i >= 0; i--) {
    const entry = sessions[i]!
    if (entry.type === 'break') return entry.duration
  }
  return null
}

// ---------------------------------------------------------------------------
// Lookups
// ---------------------------------------------------------------------------

/**
 * Map a cognitive state to a recommended break duration in minutes.
 * Returns null for non-crash states.
 */
export function calculateRecommendedBreakMinutes(state: CognitiveState): number | null {
  return BREAK_DURATION_MAP[state] ?? null
}

/** Check whether a cognitive state warrants a break suggestion. */
export function isCrashState(state: CognitiveState): boolean {
  return CRASH_STATES.has(state)
}

// ---------------------------------------------------------------------------
// Core analysis
// ---------------------------------------------------------------------------

/**
 * Compute OLS window metrics from the trailing N focus sessions.
 * Returns null when the data is insufficient for reliable analysis.
 */
function computeWindowMetrics(sessions: IFocusSession[]): IWindowMetrics | null {
  const N = COGNITIVE_CONSTANTS.ROLLING_WINDOW_SIZE
  if (sessions.length < N) return null

  const window = sessions.slice(-N)
  const y1 = window[0]!.score
  const yN = window[N - 1]!.score

  // OLS slope for equally-spaced points with N=3: β₁ = (yN − y1) / 2
  const slope = (yN - y1) / 2.0
  const percentDecline = y1 !== 0 ? Math.round(((yN - y1) / y1) * 100) : 0
  const windowMinutes = Math.round(window.reduce((sum, s) => sum + s.duration, 0))

  // Suppress analysis when sessions are too short for reliable OLS
  if (windowMinutes < COGNITIVE_CONSTANTS.MIN_WINDOW_MINUTES) return null

  return { slope, currentScore: yN, percentDecline, windowMinutes }
}

/**
 * Build a standardised break suggestion from window metrics and a matched state.
 */
function buildSuggestion(state: CognitiveState, metrics: IWindowMetrics): IBreakSuggestion {
  return {
    state,
    slopePerSession: metrics.slope,
    percentDecline: metrics.percentDecline,
    windowMinutes: metrics.windowMinutes,
    currentScore: metrics.currentScore,
    recommendedBreakMinutes: calculateRecommendedBreakMinutes(state),
  }
}

/**
 * Evaluate the user's cognitive state based on the rolling window
 * of focus sessions since their last break.
 *
 * Returns a break suggestion for actionable states (crash / warm-up / flow),
 * or null when there's insufficient data or no intervention is needed.
 */
export function evaluateCognitiveState(
  focusSessionsSinceBreak: IFocusSession[],
): IBreakSuggestion | null {
  const metrics = computeWindowMetrics(focusSessionsSinceBreak)
  if (!metrics) return null

  // First matching rule wins (priority order)
  const matched = COGNITIVE_RULES.find((rule) => rule.match(metrics))
  return matched ? buildSuggestion(matched.state, metrics) : null
}

// ---------------------------------------------------------------------------
// Post-break analysis
// ---------------------------------------------------------------------------

/**
 * Evaluate whether the user's post-break recovery was sufficient.
 *
 * Called on the first focus session after a break that was triggered by
 * a break suggestion. Returns an InsufficientBreak suggestion when the
 * score didn't improve, or null when recovery was successful.
 */
export function evaluatePostBreakRecovery(
  preBreakScore: number | null,
  postBreakScore: number,
  actualBreakMinutes: number,
  _recommendedBreakMinutes: number,
): IBreakSuggestion | null {
  if (preBreakScore === null || preBreakScore <= 0) return null
  if (postBreakScore > preBreakScore) return null

  return {
    state: CognitiveState.InsufficientBreak,
    slopePerSession: 0,
    percentDecline: Math.round(((postBreakScore - preBreakScore) / preBreakScore) * 100),
    windowMinutes: Math.round(actualBreakMinutes),
    currentScore: postBreakScore,
    recommendedBreakMinutes: COGNITIVE_CONSTANTS.BREAK_DURATION_MACRO,
  }
}

/**
 * Calculate the rebound effect after a break.
 *
 * Compares the first post-break session score against the last pre-break
 * session score using: R∆ = ((S_post − S_pre) / S_pre) × 100
 *
 * Returns null when rebound is zero or negative (per research:
 * hide negative rebound to avoid demoralization).
 */
export function calculateRebound(
  preBreakScore: number,
  postBreakScore: number,
  breakDurationMinutes: number,
): IReboundResult | null {
  if (preBreakScore <= 0 || postBreakScore <= 0) return null

  const percentChange = Math.round(((postBreakScore - preBreakScore) / preBreakScore) * 100)
  if (percentChange <= 0) return null

  return {
    percentChange,
    preBreakScore,
    postBreakScore,
    breakDurationMinutes: Math.round(breakDurationMinutes),
  }
}
