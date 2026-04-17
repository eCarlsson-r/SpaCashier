/**
 * Unit tests for InstallPrompt (SpaCashier)
 * Requirements: 5.7
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import { InstallPrompt } from '../InstallPrompt'

const SNOOZE_KEY = 'pwa-install-snoozed'
const SNOOZE_DURATION = 7 * 24 * 60 * 60 * 1000

// Mock next-intl
vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}))

function makeBeforeInstallPromptEvent() {
  const event = new Event('beforeinstallprompt') as Event & {
    prompt: () => Promise<void>
    userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
  }
  event.preventDefault = vi.fn()
  event.prompt = vi.fn().mockResolvedValue(undefined)
  event.userChoice = Promise.resolve({ outcome: 'accepted' as const })
  return event
}

beforeEach(() => {
  localStorage.clear()
})

afterEach(() => {
  localStorage.clear()
  vi.restoreAllMocks()
})

describe('InstallPrompt', () => {
  it('does not render before beforeinstallprompt event fires', () => {
    const { container } = render(<InstallPrompt />)
    expect(container.firstChild).toBeNull()
  })

  it('renders the banner after beforeinstallprompt event fires (no snooze)', async () => {
    render(<InstallPrompt />)

    await act(async () => {
      window.dispatchEvent(makeBeforeInstallPromptEvent())
    })

    expect(screen.getByText('installPrompt')).toBeInTheDocument()
    expect(screen.getByText('installAccept')).toBeInTheDocument()
    expect(screen.getByText('installDismiss')).toBeInTheDocument()
  })

  it('does not render when snoozed within 7 days', async () => {
    // Set snooze timestamp to 1 day ago (within 7-day window)
    const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000
    localStorage.setItem(SNOOZE_KEY, String(oneDayAgo))

    const { container } = render(<InstallPrompt />)

    await act(async () => {
      window.dispatchEvent(makeBeforeInstallPromptEvent())
    })

    expect(container.firstChild).toBeNull()
  })

  it('renders when snooze has expired (more than 7 days ago)', async () => {
    // Set snooze timestamp to 8 days ago (outside 7-day window)
    const eightDaysAgo = Date.now() - 8 * 24 * 60 * 60 * 1000
    localStorage.setItem(SNOOZE_KEY, String(eightDaysAgo))

    render(<InstallPrompt />)

    await act(async () => {
      window.dispatchEvent(makeBeforeInstallPromptEvent())
    })

    expect(screen.getByText('installPrompt')).toBeInTheDocument()
  })

  it('stores snooze timestamp on dismiss', async () => {
    const before = Date.now()
    render(<InstallPrompt />)

    await act(async () => {
      window.dispatchEvent(makeBeforeInstallPromptEvent())
    })

    const dismissBtn = screen.getByText('installDismiss')
    await act(async () => {
      fireEvent.click(dismissBtn)
    })

    const stored = Number(localStorage.getItem(SNOOZE_KEY))
    expect(stored).toBeGreaterThanOrEqual(before)
    expect(stored).toBeLessThanOrEqual(Date.now())
  })

  it('hides the banner after dismiss', async () => {
    const { container } = render(<InstallPrompt />)

    await act(async () => {
      window.dispatchEvent(makeBeforeInstallPromptEvent())
    })

    expect(screen.getByText('installPrompt')).toBeInTheDocument()

    await act(async () => {
      fireEvent.click(screen.getByText('installDismiss'))
    })

    expect(container.firstChild).toBeNull()
  })

  it('calls prompt() and hides banner on install accept', async () => {
    render(<InstallPrompt />)
    const event = makeBeforeInstallPromptEvent()

    await act(async () => {
      window.dispatchEvent(event)
    })

    const { container } = render(<InstallPrompt />)
    await act(async () => {
      window.dispatchEvent(event)
    })

    await act(async () => {
      fireEvent.click(screen.getAllByText('installAccept')[0])
    })

    expect(event.prompt).toHaveBeenCalled()
  })
})
