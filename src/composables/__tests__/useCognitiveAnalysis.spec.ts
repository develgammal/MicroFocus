import { describe, it, expect } from 'vitest'
import {
  evaluateCognitiveState,
  evaluatePostBreakRecovery,
  calculateRecommendedBreakMinutes,
  calculateRebound,
  getFocusSessionsSinceLastBreak,
  getLastPreBreakScore,
  getLastBreakDuration,
  isCrashState,
} from '@/composables/useCognitiveAnalysis'
import { CognitiveState } from '@/interfaces'
import type { IFocusSession, IBreakSession, ISessionEntry } from '@/interfaces'

/** Helper to create a focus session with defaults */
function focus(score: number, duration = 25, id = Date.now()): IFocusSession {
  return { id, type: 'focus', score, timestamp: '10:00', duration }
}

/** Helper to create a break session */
function brk(duration = 5, id = Date.now()): IBreakSession {
  return { id, type: 'break', score: 0, timestamp: '10:25', duration }
}

describe('useCognitiveAnalysis', () => {
  // =============================================
  // evaluateCognitiveState
  // =============================================
  describe('evaluateCognitiveState', () => {
    it('returns null when fewer than 3 sessions (insufficient data)', () => {
      expect(evaluateCognitiveState([])).toBeNull()
      expect(evaluateCognitiveState([focus(7)])).toBeNull()
      expect(evaluateCognitiveState([focus(7), focus(6)])).toBeNull()
    })

    it('detects Steep Crash when slope ≤ -1.5', () => {
      // Scores: 9, 7, 5 → slope = (5 - 9) / 2 = -2.0
      const sessions = [focus(9), focus(7), focus(5)]
      const result = evaluateCognitiveState(sessions)

      expect(result).not.toBeNull()
      expect(result!.state).toBe(CognitiveState.SteepCrash)
      expect(result!.slopePerSession).toBe(-2.0)
      expect(result!.currentScore).toBe(5)
    })

    it('detects Steep Crash regardless of absolute score', () => {
      // Scores: 10, 8, 6 → slope = (6 - 10) / 2 = -2.0
      const sessions = [focus(10), focus(8), focus(6)]
      const result = evaluateCognitiveState(sessions)

      expect(result).not.toBeNull()
      expect(result!.state).toBe(CognitiveState.SteepCrash)
    })

    it('detects Exhaustion when slope ≤ -0.5 AND y3 ≤ 5', () => {
      // Scores: 6, 5, 4 → slope = (4 - 6) / 2 = -1.0
      const sessions = [focus(6), focus(5), focus(4)]
      const result = evaluateCognitiveState(sessions)

      expect(result).not.toBeNull()
      expect(result!.state).toBe(CognitiveState.Exhaustion)
      expect(result!.slopePerSession).toBe(-1.0)
      expect(result!.currentScore).toBe(4)
    })

    it('detects Stagnation when slope ≤ 0 AND y3 ≤ 4', () => {
      // Scores: 3, 3, 3 → slope = 0
      const sessions = [focus(3), focus(3), focus(3)]
      const result = evaluateCognitiveState(sessions)

      expect(result).not.toBeNull()
      expect(result!.state).toBe(CognitiveState.Stagnation)
      expect(result!.slopePerSession).toBe(0)
      expect(result!.currentScore).toBe(3)
    })

    it('detects Stagnation when score is declining to very low', () => {
      // Scores: 4, 3, 4 → slope = (4 - 4) / 2 = 0, y3 = 4
      const sessions = [focus(4), focus(3), focus(4)]
      const result = evaluateCognitiveState(sessions)

      expect(result).not.toBeNull()
      expect(result!.state).toBe(CognitiveState.Stagnation)
    })

    it('detects Warm-Up when slope ≥ 0.5 AND y3 ≤ 5', () => {
      // Scores: 2, 3, 4 → slope = (4 - 2) / 2 = 1.0
      const sessions = [focus(2), focus(3), focus(4)]
      const result = evaluateCognitiveState(sessions)

      expect(result).not.toBeNull()
      expect(result!.state).toBe(CognitiveState.WarmUp)
      expect(result!.slopePerSession).toBe(1.0)
    })

    it('detects Flow when slope ≥ -0.4 AND y3 ≥ 7', () => {
      // Scores: 8, 8, 9 → slope = (9 - 8) / 2 = 0.5
      const sessions = [focus(8), focus(8), focus(9)]
      const result = evaluateCognitiveState(sessions)

      expect(result).not.toBeNull()
      expect(result!.state).toBe(CognitiveState.Flow)
    })

    it('returns null for stable moderate work (no intervention)', () => {
      // Scores: 6, 6, 6 → slope = 0, y3 = 6 (not ≤ 4, not ≥ 7)
      const sessions = [focus(6), focus(6), focus(6)]
      const result = evaluateCognitiveState(sessions)

      expect(result).toBeNull()
    })

    it('uses only the last 3 sessions from a longer history', () => {
      // Window: [8, 5, 2] from [10, 9, 8, 5, 2]
      const sessions = [focus(10), focus(9), focus(8), focus(5), focus(2)]
      const result = evaluateCognitiveState(sessions)

      expect(result).not.toBeNull()
      // slope = (2 - 8) / 2 = -3.0 → Steep Crash
      expect(result!.state).toBe(CognitiveState.SteepCrash)
      expect(result!.slopePerSession).toBe(-3.0)
      expect(result!.currentScore).toBe(2)
    })

    it('calculates percent decline correctly', () => {
      // Scores: 8, 6, 4 → percentDecline = ((4 - 8) / 8) * 100 = -50
      const sessions = [focus(8), focus(6), focus(4)]
      const result = evaluateCognitiveState(sessions)

      expect(result).not.toBeNull()
      expect(result!.percentDecline).toBe(-50)
    })

    it('returns null when window duration is below MIN_WINDOW_MINUTES (45)', () => {
      // Three 10-min sessions = 30 min < 45 min threshold
      const sessions = [focus(9, 10), focus(7, 10), focus(5, 10)]
      const result = evaluateCognitiveState(sessions)
      expect(result).toBeNull()
    })

    it('includes recommendedBreakMinutes for crash states', () => {
      // Steep Crash → 20 min recommended
      const sessions = [focus(9), focus(7), focus(5)]
      const result = evaluateCognitiveState(sessions)
      expect(result).not.toBeNull()
      expect(result!.state).toBe(CognitiveState.SteepCrash)
      expect(result!.recommendedBreakMinutes).toBe(20)
    })

    it('returns null recommendedBreakMinutes for non-crash states', () => {
      // Flow state
      const sessions = [focus(8), focus(8), focus(9)]
      const result = evaluateCognitiveState(sessions)
      expect(result).not.toBeNull()
      expect(result!.state).toBe(CognitiveState.Flow)
      expect(result!.recommendedBreakMinutes).toBeNull()
    })

    it('calculates window minutes from session durations', () => {
      const sessions = [focus(9, 25), focus(7, 25), focus(5, 25)]
      const result = evaluateCognitiveState(sessions)

      expect(result).not.toBeNull()
      expect(result!.windowMinutes).toBe(75)
    })

    it('priority: Steep Crash over Exhaustion', () => {
      // Scores: 8, 5, 4 → slope = (4 - 8) / 2 = -2.0
      // Matches both SteepCrash (slope ≤ -1.5) and Exhaustion (slope ≤ -0.5, y3 ≤ 5)
      // SteepCrash should win (checked first)
      const sessions = [focus(8), focus(5), focus(4)]
      const result = evaluateCognitiveState(sessions)

      expect(result!.state).toBe(CognitiveState.SteepCrash)
    })
  })

  // =============================================
  // calculateRebound
  // =============================================
  describe('calculateRebound', () => {
    it('returns positive rebound correctly', () => {
      // pre=4, post=7 → (7-4)/4 * 100 = 75%
      const result = calculateRebound(4, 7, 10)

      expect(result).not.toBeNull()
      expect(result!.percentChange).toBe(75)
      expect(result!.preBreakScore).toBe(4)
      expect(result!.postBreakScore).toBe(7)
      expect(result!.breakDurationMinutes).toBe(10)
    })

    it('returns null for negative rebound (hides demoralization)', () => {
      const result = calculateRebound(7, 5, 10)
      expect(result).toBeNull()
    })

    it('returns null for zero rebound', () => {
      const result = calculateRebound(5, 5, 10)
      expect(result).toBeNull()
    })

    it('returns null for invalid scores', () => {
      expect(calculateRebound(0, 5, 10)).toBeNull()
      expect(calculateRebound(5, 0, 10)).toBeNull()
    })

    it('rounds break duration', () => {
      const result = calculateRebound(3, 8, 7.6)
      expect(result).not.toBeNull()
      expect(result!.breakDurationMinutes).toBe(8)
    })
  })

  // =============================================
  // getFocusSessionsSinceLastBreak
  // =============================================
  describe('getFocusSessionsSinceLastBreak', () => {
    it('returns all focus sessions when no breaks exist', () => {
      const sessions: ISessionEntry[] = [focus(8, 25, 1), focus(7, 25, 2), focus(6, 25, 3)]
      const result = getFocusSessionsSinceLastBreak(sessions)

      expect(result).toHaveLength(3)
      expect(result.map((s) => s.score)).toEqual([8, 7, 6])
    })

    it('returns only focus sessions after the last break', () => {
      const sessions: ISessionEntry[] = [
        focus(8, 25, 1),
        focus(7, 25, 2),
        brk(5, 3),
        focus(6, 25, 4),
        focus(5, 25, 5),
      ]
      const result = getFocusSessionsSinceLastBreak(sessions)

      expect(result).toHaveLength(2)
      expect(result.map((s) => s.score)).toEqual([6, 5])
    })

    it('returns empty array when break is the last entry', () => {
      const sessions: ISessionEntry[] = [focus(8, 25, 1), focus(7, 25, 2), brk(5, 3)]
      const result = getFocusSessionsSinceLastBreak(sessions)

      expect(result).toHaveLength(0)
    })

    it('handles multiple breaks correctly (uses last one)', () => {
      const sessions: ISessionEntry[] = [
        focus(9, 25, 1),
        brk(5, 2),
        focus(6, 25, 3),
        brk(10, 4),
        focus(7, 25, 5),
      ]
      const result = getFocusSessionsSinceLastBreak(sessions)

      expect(result).toHaveLength(1)
      expect(result[0]?.score).toBe(7)
    })

    it('returns empty array for empty input', () => {
      expect(getFocusSessionsSinceLastBreak([])).toHaveLength(0)
    })
  })

  // =============================================
  // getLastPreBreakScore
  // =============================================
  describe('getLastPreBreakScore', () => {
    it('returns the focus score before the last break', () => {
      const sessions: ISessionEntry[] = [
        focus(8, 25, 1),
        focus(5, 25, 2),
        brk(10, 3),
        focus(7, 25, 4),
      ]
      expect(getLastPreBreakScore(sessions)).toBe(5)
    })

    it('returns null when no breaks exist', () => {
      const sessions: ISessionEntry[] = [focus(8, 25, 1), focus(7, 25, 2)]
      expect(getLastPreBreakScore(sessions)).toBeNull()
    })

    it('returns null when no focus sessions before break', () => {
      const sessions: ISessionEntry[] = [brk(5, 1), focus(7, 25, 2)]
      expect(getLastPreBreakScore(sessions)).toBeNull()
    })
  })

  // =============================================
  // getLastBreakDuration
  // =============================================
  describe('getLastBreakDuration', () => {
    it('returns the last break duration', () => {
      const sessions: ISessionEntry[] = [focus(8, 25, 1), brk(15, 2), focus(7, 25, 3)]
      expect(getLastBreakDuration(sessions)).toBe(15)
    })

    it('returns null when no breaks exist', () => {
      expect(getLastBreakDuration([focus(8, 25, 1)])).toBeNull()
    })
  })

  // =============================================
  // isCrashState
  // =============================================
  describe('isCrashState', () => {
    it('returns true for crash states', () => {
      expect(isCrashState(CognitiveState.SteepCrash)).toBe(true)
      expect(isCrashState(CognitiveState.Exhaustion)).toBe(true)
      expect(isCrashState(CognitiveState.Stagnation)).toBe(true)
      expect(isCrashState(CognitiveState.InsufficientBreak)).toBe(true)
    })

    it('returns false for non-crash states', () => {
      expect(isCrashState(CognitiveState.WarmUp)).toBe(false)
      expect(isCrashState(CognitiveState.Flow)).toBe(false)
      expect(isCrashState(CognitiveState.Continue)).toBe(false)
      expect(isCrashState(CognitiveState.InsufficientData)).toBe(false)
    })
  })

  // =============================================
  // calculateRecommendedBreakMinutes
  // =============================================
  describe('calculateRecommendedBreakMinutes', () => {
    it('returns 20 min for SteepCrash', () => {
      expect(calculateRecommendedBreakMinutes(CognitiveState.SteepCrash)).toBe(20)
    })

    it('returns 15 min for Exhaustion', () => {
      expect(calculateRecommendedBreakMinutes(CognitiveState.Exhaustion)).toBe(15)
    })

    it('returns 10 min for Stagnation', () => {
      expect(calculateRecommendedBreakMinutes(CognitiveState.Stagnation)).toBe(10)
    })

    it('returns null for non-crash states', () => {
      expect(calculateRecommendedBreakMinutes(CognitiveState.Flow)).toBeNull()
      expect(calculateRecommendedBreakMinutes(CognitiveState.WarmUp)).toBeNull()
      expect(calculateRecommendedBreakMinutes(CognitiveState.Continue)).toBeNull()
    })
  })

  // =============================================
  // evaluatePostBreakRecovery
  // =============================================
  describe('evaluatePostBreakRecovery', () => {
    it('returns null when post-break score improved', () => {
      // Pre=4, Post=6 → recovery was successful
      const result = evaluatePostBreakRecovery(4, 6, 15, 20)
      expect(result).toBeNull()
    })

    it('returns InsufficientBreak when score stayed the same', () => {
      // Pre=4, Post=4 → no improvement
      const result = evaluatePostBreakRecovery(4, 4, 10, 20)
      expect(result).not.toBeNull()
      expect(result!.state).toBe(CognitiveState.InsufficientBreak)
      expect(result!.recommendedBreakMinutes).toBe(30) // macro break
      expect(result!.percentDecline).toBe(0)
    })

    it('returns InsufficientBreak when score declined further', () => {
      // Pre=5, Post=3 → got worse
      const result = evaluatePostBreakRecovery(5, 3, 8, 20)
      expect(result).not.toBeNull()
      expect(result!.state).toBe(CognitiveState.InsufficientBreak)
      expect(result!.percentDecline).toBe(-40) // (3-5)/5 * 100
      expect(result!.currentScore).toBe(3)
    })

    it('returns null when preBreakScore is null', () => {
      expect(evaluatePostBreakRecovery(null, 5, 10, 20)).toBeNull()
    })

    it('returns null when preBreakScore is zero or negative', () => {
      expect(evaluatePostBreakRecovery(0, 5, 10, 20)).toBeNull()
    })

    it('recommends 30-min macro break for insufficient recovery', () => {
      const result = evaluatePostBreakRecovery(6, 4, 5, 15)
      expect(result).not.toBeNull()
      expect(result!.recommendedBreakMinutes).toBe(30)
    })

    it('includes actual break duration in windowMinutes', () => {
      const result = evaluatePostBreakRecovery(5, 3, 7.3, 15)
      expect(result).not.toBeNull()
      expect(result!.windowMinutes).toBe(7) // rounded
    })
  })
})
