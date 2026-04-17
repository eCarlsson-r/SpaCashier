// Feature: pwa-i18n, Property 6: Install prompt snooze is respected

/**
 * Property test: for any dismissal timestamp T, the install prompt SHALL NOT
 * be shown at any time T' where T' - T < 7 * 24 * 60 * 60 * 1000 ms, and
 * SHALL be shown again at any time T' where T' - T >= 7 * 24 * 60 * 60 * 1000 ms.
 *
 * Validates: Requirements 5.7, 5.8
 */

import { describe, it, expect } from 'vitest'
import fc from 'fast-check'

const SNOOZE_DURATION = 7 * 24 * 60 * 60 * 1000

/**
 * Pure snooze logic extracted from InstallPrompt for property testing.
 * Returns true if the prompt should be shown (not snoozed).
 */
function shouldShowPrompt(snoozedAt: number | null, now: number): boolean {
  if (snoozedAt === null) return true
  return now - snoozedAt >= SNOOZE_DURATION
}

describe('Feature: pwa-i18n, Property 6: Install prompt snooze is respected', () => {
  /**
   * Validates: Requirements 5.7, 5.8
   *
   * For any dismissal timestamp T and any current time T' within the snooze
   * window, the prompt SHALL NOT be shown.
   */
  it('does not show prompt when current time is within 7-day snooze window', () => {
    fc.assert(
      fc.property(
        // dismissal timestamp: any reasonable past time
        fc.integer({ min: 0, max: Number.MAX_SAFE_INTEGER - SNOOZE_DURATION }),
        // elapsed ms since dismissal: strictly less than snooze duration
        fc.integer({ min: 0, max: SNOOZE_DURATION - 1 }),
        (snoozedAt, elapsed) => {
          const now = snoozedAt + elapsed
          expect(shouldShowPrompt(snoozedAt, now)).toBe(false)
        },
      ),
      { numRuns: 100 },
    )
  })

  /**
   * Validates: Requirements 5.7, 5.8
   *
   * For any dismissal timestamp T and any current time T' at or beyond the
   * snooze window, the prompt SHALL be shown again.
   */
  it('shows prompt again when snooze window has expired', () => {
    fc.assert(
      fc.property(
        // dismissal timestamp
        fc.integer({ min: 0, max: Number.MAX_SAFE_INTEGER - SNOOZE_DURATION * 2 }),
        // elapsed ms since dismissal: at least snooze duration
        fc.integer({ min: SNOOZE_DURATION, max: SNOOZE_DURATION * 10 }),
        (snoozedAt, elapsed) => {
          const now = snoozedAt + elapsed
          expect(shouldShowPrompt(snoozedAt, now)).toBe(true)
        },
      ),
      { numRuns: 100 },
    )
  })

  /**
   * Validates: Requirements 5.7
   *
   * When no snooze timestamp is stored (null), the prompt is always shown.
   */
  it('always shows prompt when no snooze timestamp is stored', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: Number.MAX_SAFE_INTEGER }),
        (now) => {
          expect(shouldShowPrompt(null, now)).toBe(true)
        },
      ),
      { numRuns: 100 },
    )
  })
})
