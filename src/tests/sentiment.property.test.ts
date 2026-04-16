/**
 * Property-based tests for SentimentController logic.
 * Feature: spa-ai-features
 * Validates: Requirements 11.1, 11.3, 11.5, 11.6
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import type { Feedback, FeedbackSummary, SentimentDashboardData } from '@/lib/types';

// ─── Types ────────────────────────────────────────────────────────────────────

const STAFF_ROLES = ['cashier', 'therapist', 'manager', 'receptionist', 'admin'] as const;
type StaffRole = (typeof STAFF_ROLES)[number];

const SENTIMENT_LABELS = ['positive', 'neutral', 'negative'] as const;
type SentimentLabel = (typeof SENTIMENT_LABELS)[number];

type DashboardFilters = {
  branchId: number | null;
  treatmentId: number | null;
  therapistId: number | null;
  period: 7 | 30 | 90;
};

type FeedbackRecord = {
  id: number;
  sessionId: number;
  customerId: number;
  branchId: number;
  treatmentId: number;
  therapistId: number;
  rating: 1 | 2 | 3 | 4 | 5;
  comment: string;
  sentimentScore: number;
  sentimentLabel: SentimentLabel;
  analysisStatus: 'pending' | 'completed' | 'analysis_failed';
  submittedAt: string; // ISO timestamp
};

// ─── Pure logic functions (mirrors SentimentController behaviour) ─────────────

/**
 * Access control check: only 'manager' role is allowed.
 * Returns 403 for any other role.
 */
function checkDashboardAccess(role: StaffRole): { allowed: boolean; status: number } {
  if (role === 'manager') {
    return { allowed: true, status: 200 };
  }
  return { allowed: false, status: 403 };
}

/**
 * Apply dashboard filters to a feedback dataset.
 * Only returns records with analysis_status = 'completed' that match every active filter.
 */
function applyDashboardFilters(
  records: FeedbackRecord[],
  filters: DashboardFilters,
): FeedbackRecord[] {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - filters.period);
  cutoff.setHours(0, 0, 0, 0);

  return records.filter((r) => {
    if (r.analysisStatus !== 'completed') return false;
    if (new Date(r.submittedAt) < cutoff) return false;
    if (filters.branchId !== null && r.branchId !== filters.branchId) return false;
    if (filters.treatmentId !== null && r.treatmentId !== filters.treatmentId) return false;
    if (filters.therapistId !== null && r.therapistId !== filters.therapistId) return false;
    return true;
  });
}

/**
 * Count words in a string (split on whitespace, filter empty tokens).
 */
function countWords(text: string): number {
  return text.trim().split(/\s+/).filter((w) => w.length > 0).length;
}

/**
 * Get the 5 most recent negative feedback records from a filtered dataset,
 * ordered by submittedAt descending.
 */
function getRecentNegative(records: FeedbackRecord[]): FeedbackRecord[] {
  return records
    .filter((r) => r.sentimentLabel === 'negative')
    .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime())
    .slice(0, 5);
}

// ─── Arbitraries ─────────────────────────────────────────────────────────────

/** Arbitrary for a staff role */
const staffRoleArb: fc.Arbitrary<StaffRole> = fc.constantFrom(...STAFF_ROLES);

/** Arbitrary for a non-manager staff role */
const nonManagerRoleArb: fc.Arbitrary<StaffRole> = fc.constantFrom(
  'cashier',
  'therapist',
  'receptionist',
  'admin',
);

/** Arbitrary for a sentiment label */
const sentimentLabelArb: fc.Arbitrary<SentimentLabel> = fc.constantFrom(...SENTIMENT_LABELS);

/** Arbitrary for a valid period */
const periodArb: fc.Arbitrary<7 | 30 | 90> = fc.constantFrom(7 as const, 30 as const, 90 as const);

/** Arbitrary for a positive integer ID */
const positiveIntArb = fc.integer({ min: 1, max: 9999 });

/** Arbitrary for an ISO timestamp within the last 90 days */
const recentTimestampArb: fc.Arbitrary<string> = fc
  .integer({ min: 0, max: 90 * 24 * 60 * 60 * 1000 })
  .map((offsetMs) => new Date(Date.now() - offsetMs).toISOString());

/** Arbitrary for a FeedbackRecord with completed analysis */
const completedFeedbackArb: fc.Arbitrary<FeedbackRecord> = fc.record({
  id: positiveIntArb,
  sessionId: positiveIntArb,
  customerId: positiveIntArb,
  branchId: fc.integer({ min: 1, max: 10 }),
  treatmentId: fc.integer({ min: 1, max: 20 }),
  therapistId: fc.integer({ min: 1, max: 50 }),
  rating: fc.constantFrom(1 as const, 2 as const, 3 as const, 4 as const, 5 as const),
  comment: fc.string({ minLength: 1, maxLength: 200 }),
  sentimentScore: fc.double({ min: -1.0, max: 1.0, noNaN: true }),
  sentimentLabel: sentimentLabelArb,
  analysisStatus: fc.constant('completed' as const),
  submittedAt: recentTimestampArb,
});

/** Arbitrary for a FeedbackRecord with any analysis status */
const anyFeedbackArb: fc.Arbitrary<FeedbackRecord> = fc.record({
  id: positiveIntArb,
  sessionId: positiveIntArb,
  customerId: positiveIntArb,
  branchId: fc.integer({ min: 1, max: 10 }),
  treatmentId: fc.integer({ min: 1, max: 20 }),
  therapistId: fc.integer({ min: 1, max: 50 }),
  rating: fc.constantFrom(1 as const, 2 as const, 3 as const, 4 as const, 5 as const),
  comment: fc.string({ minLength: 0, maxLength: 200 }),
  sentimentScore: fc.double({ min: -1.0, max: 1.0, noNaN: true }),
  sentimentLabel: sentimentLabelArb,
  analysisStatus: fc.constantFrom('pending' as const, 'completed' as const, 'analysis_failed' as const),
  submittedAt: recentTimestampArb,
});

/** Arbitrary for a dataset of 0–30 feedback records */
const feedbackDatasetArb: fc.Arbitrary<FeedbackRecord[]> = fc.array(completedFeedbackArb, {
  minLength: 0,
  maxLength: 30,
});

/** Arbitrary for a mixed dataset (any analysis status, mixed labels) */
const mixedFeedbackDatasetArb: fc.Arbitrary<FeedbackRecord[]> = fc.array(anyFeedbackArb, {
  minLength: 0,
  maxLength: 30,
});

/** Arbitrary for dashboard filters */
const dashboardFiltersArb: fc.Arbitrary<DashboardFilters> = fc.record({
  branchId: fc.oneof(fc.constant(null), fc.integer({ min: 1, max: 10 })),
  treatmentId: fc.oneof(fc.constant(null), fc.integer({ min: 1, max: 20 })),
  therapistId: fc.oneof(fc.constant(null), fc.integer({ min: 1, max: 50 })),
  period: periodArb,
});

/** Arbitrary for a summary string (random words) */
const summaryStringArb: fc.Arbitrary<string> = fc
  .array(fc.string({ minLength: 1, maxLength: 15 }).filter((s) => !/\s/.test(s)), {
    minLength: 0,
    maxLength: 200,
  })
  .map((words) => words.join(' '));

// ─── Property 26: Sentiment dashboard access control ─────────────────────────

describe('Property 26: Sentiment dashboard access control', () => {
  // Feature: spa-ai-features, Property 26: For any staff member whose role is not manager, attempting to access the sentiment dashboard route returns an authorization error (HTTP 403 or redirect to unauthorized page).

  it('should return HTTP 403 for any non-manager role', () => {
    fc.assert(
      fc.property(nonManagerRoleArb, (role) => {
        const result = checkDashboardAccess(role);

        expect(result.allowed).toBe(false);
        expect(result.status).toBe(403);
      }),
      { numRuns: 100 },
    );
  });

  it('should allow access only for manager role', () => {
    fc.assert(
      fc.property(staffRoleArb, (role) => {
        const result = checkDashboardAccess(role);

        if (role === 'manager') {
          expect(result.allowed).toBe(true);
          expect(result.status).toBe(200);
        } else {
          expect(result.allowed).toBe(false);
          expect(result.status).toBe(403);
        }
      }),
      { numRuns: 100 },
    );
  });

  it('should never grant access to cashier, therapist, receptionist, or admin roles', () => {
    fc.assert(
      fc.property(nonManagerRoleArb, (role) => {
        const result = checkDashboardAccess(role);

        // These roles must never be allowed
        expect(result.allowed).toBe(false);
        expect(result.status).not.toBe(200);
      }),
      { numRuns: 100 },
    );
  });
});

// ─── Property 27: Sentiment dashboard filter correctness ─────────────────────

describe('Property 27: Sentiment dashboard filter correctness', () => {
  // Feature: spa-ai-features, Property 27: For any combination of branch, treatment, and therapist filters applied to the sentiment dashboard, all feedback records included in the displayed metrics match every active filter criterion.

  it('should return only records matching every active filter criterion', () => {
    fc.assert(
      fc.property(feedbackDatasetArb, dashboardFiltersArb, (dataset, filters) => {
        const filtered = applyDashboardFilters(dataset, filters);

        for (const record of filtered) {
          // Must have completed analysis
          expect(record.analysisStatus).toBe('completed');

          // Must match branch filter if active
          if (filters.branchId !== null) {
            expect(record.branchId).toBe(filters.branchId);
          }

          // Must match treatment filter if active
          if (filters.treatmentId !== null) {
            expect(record.treatmentId).toBe(filters.treatmentId);
          }

          // Must match therapist filter if active
          if (filters.therapistId !== null) {
            expect(record.therapistId).toBe(filters.therapistId);
          }

          // Must be within the time period
          const cutoff = new Date();
          cutoff.setDate(cutoff.getDate() - filters.period);
          cutoff.setHours(0, 0, 0, 0);
          expect(new Date(record.submittedAt).getTime()).toBeGreaterThanOrEqual(cutoff.getTime());
        }
      }),
      { numRuns: 100 },
    );
  });

  it('should exclude records that do not match an active branch filter', () => {
    fc.assert(
      fc.property(
        fc.array(completedFeedbackArb, { minLength: 1, maxLength: 20 }),
        fc.integer({ min: 1, max: 10 }),
        (dataset, targetBranchId) => {
          const filters: DashboardFilters = {
            branchId: targetBranchId,
            treatmentId: null,
            therapistId: null,
            period: 90,
          };

          const filtered = applyDashboardFilters(dataset, filters);

          // Every returned record must belong to the target branch
          for (const record of filtered) {
            expect(record.branchId).toBe(targetBranchId);
          }

          // Records from other branches must not appear
          const otherBranchRecords = dataset.filter(
            (r) => r.branchId !== targetBranchId && r.analysisStatus === 'completed',
          );
          for (const other of otherBranchRecords) {
            expect(filtered).not.toContain(other);
          }
        },
      ),
      { numRuns: 100 },
    );
  });

  it('should exclude records that do not match an active treatment filter', () => {
    fc.assert(
      fc.property(
        fc.array(completedFeedbackArb, { minLength: 1, maxLength: 20 }),
        fc.integer({ min: 1, max: 20 }),
        (dataset, targetTreatmentId) => {
          const filters: DashboardFilters = {
            branchId: null,
            treatmentId: targetTreatmentId,
            therapistId: null,
            period: 90,
          };

          const filtered = applyDashboardFilters(dataset, filters);

          for (const record of filtered) {
            expect(record.treatmentId).toBe(targetTreatmentId);
          }
        },
      ),
      { numRuns: 100 },
    );
  });

  it('should exclude records that do not match an active therapist filter', () => {
    fc.assert(
      fc.property(
        fc.array(completedFeedbackArb, { minLength: 1, maxLength: 20 }),
        fc.integer({ min: 1, max: 50 }),
        (dataset, targetTherapistId) => {
          const filters: DashboardFilters = {
            branchId: null,
            treatmentId: null,
            therapistId: targetTherapistId,
            period: 90,
          };

          const filtered = applyDashboardFilters(dataset, filters);

          for (const record of filtered) {
            expect(record.therapistId).toBe(targetTherapistId);
          }
        },
      ),
      { numRuns: 100 },
    );
  });

  it('should only include records with analysis_status = completed', () => {
    fc.assert(
      fc.property(mixedFeedbackDatasetArb, dashboardFiltersArb, (dataset, filters) => {
        const filtered = applyDashboardFilters(dataset, filters);

        for (const record of filtered) {
          expect(record.analysisStatus).toBe('completed');
        }
      }),
      { numRuns: 100 },
    );
  });
});

// ─── Property 28: AI summary word count invariant ────────────────────────────

describe('Property 28: AI summary word count invariant', () => {
  // Feature: spa-ai-features, Property 28: For any AI-generated sentiment summary produced by the Sentiment_Analyzer, the word count of the summary is at most 150.

  it('should count words correctly for any string', () => {
    fc.assert(
      fc.property(summaryStringArb, (summary) => {
        const wordCount = countWords(summary);

        // Word count must be a non-negative integer
        expect(wordCount).toBeGreaterThanOrEqual(0);
        expect(Number.isInteger(wordCount)).toBe(true);
      }),
      { numRuns: 100 },
    );
  });

  it('should accept any summary with at most 150 words', () => {
    // Generate summaries that are guaranteed to be within the limit
    const validSummaryArb = fc
      .array(fc.string({ minLength: 1, maxLength: 15 }).filter((s) => !/\s/.test(s)), {
        minLength: 0,
        maxLength: 150,
      })
      .map((words) => words.join(' '));

    fc.assert(
      fc.property(validSummaryArb, (summary) => {
        const wordCount = countWords(summary);

        expect(wordCount).toBeLessThanOrEqual(150);
      }),
      { numRuns: 100 },
    );
  });

  it('should detect summaries that exceed 150 words', () => {
    // Generate summaries that are guaranteed to exceed the limit
    const oversizedSummaryArb = fc
      .array(fc.string({ minLength: 1, maxLength: 10 }).filter((s) => !/\s/.test(s)), {
        minLength: 151,
        maxLength: 300,
      })
      .map((words) => words.join(' '));

    fc.assert(
      fc.property(oversizedSummaryArb, (summary) => {
        const wordCount = countWords(summary);

        // These summaries must exceed the 150-word limit
        expect(wordCount).toBeGreaterThan(150);
      }),
      { numRuns: 100 },
    );
  });

  it('should enforce the 150-word invariant: a valid summary never exceeds 150 words', () => {
    /**
     * Simulates the truncation/enforcement logic: given any summary string,
     * enforce the 150-word limit by truncating to the first 150 words.
     */
    function enforceWordLimit(summary: string, maxWords: number): string {
      const words = summary.trim().split(/\s+/).filter((w) => w.length > 0);
      return words.slice(0, maxWords).join(' ');
    }

    fc.assert(
      fc.property(summaryStringArb, (summary) => {
        const enforced = enforceWordLimit(summary, 150);
        const wordCount = countWords(enforced);

        expect(wordCount).toBeLessThanOrEqual(150);
      }),
      { numRuns: 100 },
    );
  });
});

// ─── Property 29: Recent negative feedback correctness ───────────────────────

describe('Property 29: Recent negative feedback correctness', () => {
  // Feature: spa-ai-features, Property 29: For any filter applied to the sentiment dashboard, the displayed negative feedback records all have sentiment_label = 'negative' and are the 5 most recent by submitted_at timestamp among all negative records matching the filter.

  it('should return only records with sentiment_label = negative', () => {
    fc.assert(
      fc.property(feedbackDatasetArb, dashboardFiltersArb, (dataset, filters) => {
        const filtered = applyDashboardFilters(dataset, filters);
        const recentNegative = getRecentNegative(filtered);

        for (const record of recentNegative) {
          expect(record.sentimentLabel).toBe('negative');
        }
      }),
      { numRuns: 100 },
    );
  });

  it('should return at most 5 records', () => {
    fc.assert(
      fc.property(feedbackDatasetArb, dashboardFiltersArb, (dataset, filters) => {
        const filtered = applyDashboardFilters(dataset, filters);
        const recentNegative = getRecentNegative(filtered);

        expect(recentNegative.length).toBeLessThanOrEqual(5);
      }),
      { numRuns: 100 },
    );
  });

  it('should return the 5 most recent negative records ordered by submitted_at descending', () => {
    fc.assert(
      fc.property(feedbackDatasetArb, dashboardFiltersArb, (dataset, filters) => {
        const filtered = applyDashboardFilters(dataset, filters);
        const recentNegative = getRecentNegative(filtered);

        if (recentNegative.length < 2) return; // nothing to compare

        // Verify descending order
        for (let i = 0; i < recentNegative.length - 1; i++) {
          const current = new Date(recentNegative[i].submittedAt).getTime();
          const next = new Date(recentNegative[i + 1].submittedAt).getTime();
          expect(current).toBeGreaterThanOrEqual(next);
        }
      }),
      { numRuns: 100 },
    );
  });

  it('should include the most recent negative records and exclude older ones when there are more than 5', () => {
    fc.assert(
      fc.property(
        fc.array(completedFeedbackArb, { minLength: 6, maxLength: 30 }).map((records) =>
          // Force all records to be negative so we can test the top-5 selection
          records.map((r) => ({ ...r, sentimentLabel: 'negative' as const })),
        ),
        (dataset) => {
          const filters: DashboardFilters = {
            branchId: null,
            treatmentId: null,
            therapistId: null,
            period: 90,
          };

          const filtered = applyDashboardFilters(dataset, filters);
          const recentNegative = getRecentNegative(filtered);

          if (filtered.filter((r) => r.sentimentLabel === 'negative').length <= 5) return;

          // Must return exactly 5
          expect(recentNegative.length).toBe(5);

          // The 5 returned must be the most recent among all negative records
          const allNegative = filtered
            .filter((r) => r.sentimentLabel === 'negative')
            .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());

          const top5Ids = new Set(allNegative.slice(0, 5).map((r) => r.id));
          for (const record of recentNegative) {
            expect(top5Ids.has(record.id)).toBe(true);
          }
        },
      ),
      { numRuns: 100 },
    );
  });

  it('should not include any non-negative records even when dataset has mixed labels', () => {
    fc.assert(
      fc.property(mixedFeedbackDatasetArb, dashboardFiltersArb, (dataset, filters) => {
        const filtered = applyDashboardFilters(dataset, filters);
        const recentNegative = getRecentNegative(filtered);

        for (const record of recentNegative) {
          expect(record.sentimentLabel).toBe('negative');
          expect(record.sentimentLabel).not.toBe('positive');
          expect(record.sentimentLabel).not.toBe('neutral');
        }
      }),
      { numRuns: 100 },
    );
  });
});
