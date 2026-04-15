/**
 * Property-based tests for ConflictAlertBanner component.
 * Feature: spa-ai-features
 * Validates: Requirements 6.5
 */

// Feature: spa-ai-features, Property 13: Conflict alert contains all required fields

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { render, screen, within } from '@testing-library/react';
import React from 'react';
import { ConflictAlertBanner } from '@/components/ai/ConflictAlertBanner';
import type { ConflictRecord, AlternativeSlot } from '@/lib/types';

// ─── Arbitraries ─────────────────────────────────────────────────────────────

/** Arbitrary for a positive integer ID */
const positiveIntArb = fc.integer({ min: 1, max: 999_999 });

/** Arbitrary for a date string YYYY-MM-DD */
const dateStringArb = fc
  .tuple(
    fc.integer({ min: 2024, max: 2026 }),
    fc.integer({ min: 1, max: 12 }),
    fc.integer({ min: 1, max: 28 }),
  )
  .map(
    ([y, m, d]) =>
      `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`,
  );

/** Arbitrary for a time string HH:MM */
const timeStringArb = fc
  .tuple(fc.integer({ min: 0, max: 23 }), fc.integer({ min: 0, max: 59 }))
  .map(([h, m]) => `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`);

/** Arbitrary for an ISO timestamp string */
const isoTimestampArb = fc
  .integer({ min: 1_700_000_000_000, max: 1_900_000_000_000 })
  .map((ms) => new Date(ms).toISOString());

/** Arbitrary for an AlternativeSlot */
const alternativeSlotArb: fc.Arbitrary<AlternativeSlot> = fc.record({
  date: dateStringArb,
  startTime: timeStringArb,
  endTime: timeStringArb,
  therapistId: positiveIntArb,
  roomId: fc.integer({ min: 1, max: 50 }).map((n) => `R${n}`),
});

/** Arbitrary for a ConflictRecord */
const conflictRecordArb: fc.Arbitrary<ConflictRecord> = fc.record({
  id: positiveIntArb,
  bookingId: positiveIntArb,
  conflictingBookingId: positiveIntArb,
  conflictType: fc.constantFrom('therapist' as const, 'room' as const),
  detectionTimestamp: isoTimestampArb,
  resolutionStatus: fc.constantFrom(
    'pending' as const,
    'accepted' as const,
    'dismissed' as const,
    'expired' as const,
  ),
  resolutionAction: fc.constantFrom('accepted' as const, 'dismissed' as const, null),
  resolutionTimestamp: fc.oneof(fc.constant(null), isoTimestampArb),
  alternativeSlots: fc.array(alternativeSlotArb, { minLength: 0, maxLength: 3 }),
  branchId: fc.integer({ min: 1, max: 20 }).map(String),
});

// ─── Property 13: Conflict alert contains all required fields ─────────────────

describe('Property 13: Conflict alert contains all required fields', () => {
  it('should display both booking IDs for any conflict payload', () => {
    fc.assert(
      fc.property(conflictRecordArb, (conflict) => {
        const { unmount } = render(
          React.createElement(ConflictAlertBanner, { conflict }),
        );

        // Both booking IDs must appear in the rendered output.
        // Use getAllByText because bookingId and conflictingBookingId may be equal,
        // or the same number may appear in multiple rendered elements.
        const bookingIdMatches = screen.getAllByText(
          new RegExp(`#${conflict.bookingId}\\b`, 'i'),
        );
        expect(bookingIdMatches.length).toBeGreaterThanOrEqual(1);

        const conflictingIdMatches = screen.getAllByText(
          new RegExp(`#${conflict.conflictingBookingId}\\b`, 'i'),
        );
        expect(conflictingIdMatches.length).toBeGreaterThanOrEqual(1);

        unmount();
      }),
      { numRuns: 100 },
    );
  });

  it('should display the conflict type (therapist or room) for any conflict payload', () => {
    fc.assert(
      fc.property(conflictRecordArb, (conflict) => {
        const { unmount } = render(
          React.createElement(ConflictAlertBanner, { conflict }),
        );

        // The conflict type must appear in the rendered output.
        // Use getAllByText because "therapist" may appear in both the conflict-type
        // label and in alternative-slot rows ("Therapist #N").
        const typeMatches = screen.getAllByText(
          new RegExp(conflict.conflictType, 'i'),
        );
        expect(typeMatches.length).toBeGreaterThanOrEqual(1);

        unmount();
      }),
      { numRuns: 100 },
    );
  });

  it('should display the detection timestamp (time window) for any conflict payload', () => {
    fc.assert(
      fc.property(conflictRecordArb, (conflict) => {
        const { unmount } = render(
          React.createElement(ConflictAlertBanner, { conflict }),
        );

        // The component renders "Detected on <date> at <time>".
        // Verify the "Detected on" label is present and the formatted time is shown.
        const detectedAt = new Date(conflict.detectionTimestamp);
        const detectedTime = detectedAt.toLocaleTimeString('en-GB', {
          hour: '2-digit',
          minute: '2-digit',
        });

        // "Detected on" label must be present (unique in the component)
        expect(screen.getByText(/Detected on/i)).toBeDefined();

        // The formatted time must appear somewhere in the rendered output
        const timeMatches = screen.getAllByText(new RegExp(detectedTime, 'i'));
        expect(timeMatches.length).toBeGreaterThanOrEqual(1);

        unmount();
      }),
      { numRuns: 100 },
    );
  });

  it('should display all three required fields together for any conflict payload', () => {
    fc.assert(
      fc.property(conflictRecordArb, (conflict) => {
        const { unmount } = render(
          React.createElement(ConflictAlertBanner, { conflict }),
        );

        // 1. Booking IDs — use getAllByText to handle equal IDs or repeated text
        const bookingIdMatches = screen.getAllByText(
          new RegExp(`#${conflict.bookingId}\\b`, 'i'),
        );
        expect(bookingIdMatches.length).toBeGreaterThanOrEqual(1);

        const conflictingIdMatches = screen.getAllByText(
          new RegExp(`#${conflict.conflictingBookingId}\\b`, 'i'),
        );
        expect(conflictingIdMatches.length).toBeGreaterThanOrEqual(1);

        // 2. Therapist/room conflict type
        const typeMatches = screen.getAllByText(
          new RegExp(conflict.conflictType, 'i'),
        );
        expect(typeMatches.length).toBeGreaterThanOrEqual(1);

        // 3. Detection timestamp label (unique element in the component)
        expect(screen.getByText(/Detected on/i)).toBeDefined();

        unmount();
      }),
      { numRuns: 100 },
    );
  });
});
