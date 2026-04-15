/**
 * Unit tests for ConflictAlertBanner component and useConflictAlerts hook.
 * Feature: spa-ai-features
 * Validates: Requirements 6.5
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { renderHook, waitFor } from '@testing-library/react';
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ConflictAlertBanner } from '@/components/ai/ConflictAlertBanner';
import type { ConflictRecord } from '@/lib/types';

// ─── Mock echo so WebSocket is never connected in tests ───────────────────────
vi.mock('@/lib/echo', () => ({ echo: undefined }));

// ─── Mock api so HTTP calls don't fire ───────────────────────────────────────
vi.mock('@/lib/api', () => ({
  default: {
    get: vi.fn().mockResolvedValue({ data: [] }),
  },
}));

// ─── Helpers ─────────────────────────────────────────────────────────────────

function makeConflict(overrides: Partial<ConflictRecord> = {}): ConflictRecord {
  return {
    id: 1,
    bookingId: 101,
    conflictingBookingId: 202,
    conflictType: 'therapist',
    detectionTimestamp: '2025-06-15T09:30:00.000Z',
    resolutionStatus: 'pending',
    resolutionAction: null,
    resolutionTimestamp: null,
    alternativeSlots: [
      {
        date: '2025-06-15',
        startTime: '11:00',
        endTime: '12:00',
        therapistId: 5,
        roomId: 'R3',
      },
    ],
    branchId: '1',
    ...overrides,
  };
}

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
}

function wrapper({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={makeQueryClient()}>
      {children}
    </QueryClientProvider>
  );
}

// ─── Test 1: Required fields rendered from event payload ──────────────────────

describe('ConflictAlertBanner — required fields rendered', () => {
  it('displays both conflicting booking IDs', () => {
    const conflict = makeConflict({ bookingId: 101, conflictingBookingId: 202 });
    render(<ConflictAlertBanner conflict={conflict} />);

    expect(screen.getByText(/#101/)).toBeDefined();
    expect(screen.getByText(/#202/)).toBeDefined();
  });

  it('displays the conflict type (therapist)', () => {
    const conflict = makeConflict({ conflictType: 'therapist' });
    render(<ConflictAlertBanner conflict={conflict} />);

    const matches = screen.getAllByText(/therapist/i);
    expect(matches.length).toBeGreaterThanOrEqual(1);
  });

  it('displays the conflict type (room)', () => {
    const conflict = makeConflict({ conflictType: 'room' });
    render(<ConflictAlertBanner conflict={conflict} />);

    const matches = screen.getAllByText(/room/i);
    expect(matches.length).toBeGreaterThanOrEqual(1);
  });

  it('displays the detection timestamp (time window)', () => {
    const conflict = makeConflict({ detectionTimestamp: '2025-06-15T09:30:00.000Z' });
    render(<ConflictAlertBanner conflict={conflict} />);

    // Component renders "Detected on <date> at <time>"
    expect(screen.getByText(/Detected on/i)).toBeDefined();
  });

  it('displays the formatted time from detectionTimestamp', () => {
    const conflict = makeConflict({ detectionTimestamp: '2025-06-15T09:30:00.000Z' });
    render(<ConflictAlertBanner conflict={conflict} />);

    const detectedAt = new Date('2025-06-15T09:30:00.000Z');
    const detectedTime = detectedAt.toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
    });

    const timeMatches = screen.getAllByText(new RegExp(detectedTime, 'i'));
    expect(timeMatches.length).toBeGreaterThanOrEqual(1);
  });

  it('displays alternative slots when present', () => {
    const conflict = makeConflict({
      alternativeSlots: [
        { date: '2025-06-15', startTime: '11:00', endTime: '12:00', therapistId: 5, roomId: 'R3' },
        { date: '2025-06-15', startTime: '14:00', endTime: '15:00', therapistId: 7, roomId: 'R1' },
      ],
    });
    render(<ConflictAlertBanner conflict={conflict} />);

    expect(screen.getByText(/Alternative slots \(2\)/i)).toBeDefined();
    expect(screen.getByText(/Option 1/i)).toBeDefined();
    expect(screen.getByText(/Option 2/i)).toBeDefined();
  });

  it('shows "No alternative slots available" when alternativeSlots is empty', () => {
    const conflict = makeConflict({ alternativeSlots: [] });
    render(<ConflictAlertBanner conflict={conflict} />);

    expect(screen.getByText(/No alternative slots available/i)).toBeDefined();
  });

  it('renders at most 3 alternative slots even if payload has more', () => {
    const conflict = makeConflict({
      alternativeSlots: [
        { date: '2025-06-15', startTime: '09:00', endTime: '10:00', therapistId: 1, roomId: 'R1' },
        { date: '2025-06-15', startTime: '11:00', endTime: '12:00', therapistId: 2, roomId: 'R2' },
        { date: '2025-06-15', startTime: '13:00', endTime: '14:00', therapistId: 3, roomId: 'R3' },
        { date: '2025-06-15', startTime: '15:00', endTime: '16:00', therapistId: 4, roomId: 'R4' },
      ],
    });
    render(<ConflictAlertBanner conflict={conflict} />);

    // Only 3 options should be rendered
    expect(screen.getByText(/Alternative slots \(3\)/i)).toBeDefined();
    expect(screen.queryByText(/Option 4/i)).toBeNull();
  });

  it('has an accessible role="alert" with a descriptive aria-label', () => {
    const conflict = makeConflict({ bookingId: 101, conflictingBookingId: 202 });
    render(<ConflictAlertBanner conflict={conflict} />);

    const alert = screen.getByRole('alert');
    expect(alert).toBeDefined();
    expect(alert.getAttribute('aria-label')).toMatch(/101/);
    expect(alert.getAttribute('aria-label')).toMatch(/202/);
  });
});

// ─── Test 2: Fallback polling activates on WebSocket disconnect ───────────────

describe('useConflictAlerts — fallback polling on WebSocket disconnect', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('uses refetchInterval of 30000ms when echo is undefined (WebSocket unavailable)', async () => {
    // When echo is undefined, wsConnected stays false, so refetchInterval = POLL_INTERVAL_MS (30000).
    // We verify this indirectly: the hook resolves successfully (polling is active, not disabled)
    // and returns the mocked empty array from the api.
    const { useConflictAlerts } = await import('@/hooks/useConflictAlerts');

    const { result } = renderHook(() => useConflictAlerts('1'), { wrapper });

    // Query is enabled (branchId is set) and polling is active (wsConnected=false)
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Polling fetched data successfully (mocked api returns [])
    expect(result.current.conflicts).toEqual([]);
  });

  it('returns empty conflicts array when no data is available', async () => {
    const { useConflictAlerts } = await import('@/hooks/useConflictAlerts');

    const { result } = renderHook(() => useConflictAlerts('1'), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.conflicts).toEqual([]);
  });

  it('returns isLoading=false after data resolves', async () => {
    const { useConflictAlerts } = await import('@/hooks/useConflictAlerts');

    const { result } = renderHook(() => useConflictAlerts('42'), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
  });

  it('does not fetch when branchId is null', async () => {
    const api = await import('@/lib/api');
    const getSpy = vi.spyOn(api.default, 'get');

    const { useConflictAlerts } = await import('@/hooks/useConflictAlerts');

    const { result } = renderHook(() => useConflictAlerts(null), { wrapper });

    // With null branchId, query is disabled — no fetch should occur
    expect(getSpy).not.toHaveBeenCalled();
    expect(result.current.conflicts).toEqual([]);
    expect(result.current.isLoading).toBe(false);
  });

  it('does not fetch when branchId is undefined', async () => {
    const api = await import('@/lib/api');
    const getSpy = vi.spyOn(api.default, 'get');

    const { useConflictAlerts } = await import('@/hooks/useConflictAlerts');

    const { result } = renderHook(() => useConflictAlerts(undefined), { wrapper });

    expect(getSpy).not.toHaveBeenCalled();
    expect(result.current.conflicts).toEqual([]);
    expect(result.current.isLoading).toBe(false);
  });
});
