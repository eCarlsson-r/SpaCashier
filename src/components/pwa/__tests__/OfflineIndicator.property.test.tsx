// Feature: pwa-i18n, Property 5: Offline indicator count matches queue length

/**
 * Property test: for any offline queue state with N pending operations,
 * the count displayed in the offline indicator SHALL equal N.
 *
 * Validates: Requirements 4.9, 4.10, 10.1, 10.2
 */

import 'fake-indexeddb/auto'
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import fc from 'fast-check'
import { createOfflineQueue } from '@/lib/offlineQueue'
import { OfflineIndicator } from '../OfflineIndicator'

// Mock next-intl
vi.mock('next-intl', () => ({
  useTranslations: () => (key: string, params?: Record<string, unknown>) =>
    key + (params ? JSON.stringify(params) : ''),
}))

let dbCounter = 0
function uniqueDbName(): string {
  return `test-indicator-queue-${Date.now()}-${++dbCounter}`
}

describe('Feature: pwa-i18n, Property 5: Offline indicator count matches queue length', () => {
  /**
   * Validates: Requirements 4.9, 4.10, 10.1, 10.2
   *
   * For any offline queue state with N pending operations, the count displayed
   * in the offline indicator SHALL equal N.
   */
  it('displayed count equals the number of enqueued operations', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.nat({ max: 50 }),
        async (n) => {
          // Enqueue N operations into a fresh queue
          const queue = createOfflineQueue(uniqueDbName())
          for (let i = 0; i < n; i++) {
            await queue.enqueue({
              method: 'POST',
              url: `https://example.com/api/resource/${i}`,
              body: JSON.stringify({ index: i }),
              headers: {},
            })
          }

          // Read the count from the queue
          const count = await queue.count()
          expect(count).toBe(n)

          // Render OfflineIndicator with that count and verify displayed number
          const { unmount } = render(
            <OfflineIndicator isOnline={false} pendingCount={count} />,
          )

          if (n === 0) {
            // Banner still renders (isOnline=false), count is 0
            expect(screen.getByText(`banner{"count":0}`)).toBeInTheDocument()
          } else {
            expect(screen.getByText(`banner{"count":${n}}`)).toBeInTheDocument()
          }

          unmount()
        },
      ),
      { numRuns: 100 },
    )
  })
})
