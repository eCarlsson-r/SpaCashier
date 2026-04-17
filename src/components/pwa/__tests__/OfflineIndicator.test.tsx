/**
 * Unit tests for OfflineIndicator (SpaCashier)
 * Requirements: 3.5, 4.9, 10.1
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { OfflineIndicator } from '../OfflineIndicator'

// Mock next-intl so the component can render without a provider
vi.mock('next-intl', () => ({
  useTranslations: () => (key: string, params?: Record<string, unknown>) =>
    key + (params ? JSON.stringify(params) : ''),
}))

describe('OfflineIndicator', () => {
  it('renders the banner when isOnline is false', () => {
    render(<OfflineIndicator isOnline={false} pendingCount={0} />)
    expect(screen.getByText(/banner/i)).toBeInTheDocument()
  })

  it('returns null (banner hidden) when isOnline is true', () => {
    const { container } = render(<OfflineIndicator isOnline={true} pendingCount={3} />)
    expect(container.firstChild).toBeNull()
  })

  it('displays the pendingCount in the banner text', () => {
    render(<OfflineIndicator isOnline={false} pendingCount={7} />)
    // The mocked t() returns: "banner" + JSON.stringify({ count: 7 })
    expect(screen.getByText('banner{"count":7}')).toBeInTheDocument()
  })
})
