/**
 * Unit tests for SyncNotification (SpaCashier)
 * Requirements: 4.5, 4.7, 10.3
 */

import { describe, it, expect, vi, beforeEach, beforeAll, afterAll } from 'vitest'
import { render, cleanup } from '@testing-library/react'
import { SyncNotification } from '../SyncNotification'
import { toast } from 'sonner'

// Mock sonner toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}))

// Mock next-intl
vi.mock('next-intl', () => ({
  useTranslations: () => (key: string, params?: Record<string, unknown>) =>
    key + (params ? JSON.stringify(params) : ''),
}))

// Stable mock EventTarget that acts as serviceWorker
const mockServiceWorker = new EventTarget()

describe('SyncNotification', () => {
  beforeAll(() => {
    // Stub navigator.serviceWorker with a stable EventTarget
    Object.defineProperty(navigator, 'serviceWorker', {
      value: mockServiceWorker,
      writable: true,
      configurable: true,
    })
  })

  afterAll(() => {
    cleanup()
  })

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('shows success toast when SYNC_SUCCESS message is dispatched', () => {
    render(<SyncNotification />)

    mockServiceWorker.dispatchEvent(
      new MessageEvent('message', {
        data: { type: 'SYNC_SUCCESS', operationId: 'op-123' },
      })
    )

    expect(toast.success).toHaveBeenCalledWith('backOnline')
  })

  it('shows error toast with operation details when SYNC_FAILED message is dispatched', () => {
    render(<SyncNotification />)

    mockServiceWorker.dispatchEvent(
      new MessageEvent('message', {
        data: {
          type: 'SYNC_FAILED',
          operationId: 'op-456',
          status: 500,
          url: '/api/bookings',
        },
      })
    )

    expect(toast.error).toHaveBeenCalledWith('syncFailed{"operation":"/api/bookings"}')
  })
})
