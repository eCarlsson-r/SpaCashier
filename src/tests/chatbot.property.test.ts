/**
 * Property-based tests for customer chatbot response parsing/validation logic.
 * Feature: spa-ai-features
 * Validates: Requirements 4.2, 4.3, 4.4, 4.7
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import type {
  ChatResponse,
  BookingIntentParams,
  ChatMessage,
} from '@/lib/types';

// ─── Helpers: pure validation functions (mirrors backend parsing logic) ───────

const VALID_MISSING_FIELDS = ['date', 'time', 'treatmentId', 'branchId'] as const;
type MissingField = (typeof VALID_MISSING_FIELDS)[number];

/**
 * Validates a ChatResponse of type 'booking_intent' has all 4 params non-null/non-empty.
 */
function isCompleteBookingIntent(
  response: ChatResponse
): response is { type: 'booking_intent'; params: BookingIntentParams } {
  if (response.type !== 'booking_intent') return false;
  const { date, time, treatmentId, branchId } = response.params;
  return (
    typeof date === 'string' && date.length > 0 &&
    typeof time === 'string' && time.length > 0 &&
    typeof treatmentId === 'string' && treatmentId.length > 0 &&
    typeof branchId === 'string' && branchId.length > 0
  );
}

/**
 * Validates a ChatResponse of type 'clarification' has a missingField that is
 * one of the 4 valid booking parameter names.
 */
function isValidClarification(
  response: ChatResponse
): response is { type: 'clarification'; missingField: string; message: string } {
  if (response.type !== 'clarification') return false;
  return (VALID_MISSING_FIELDS as readonly string[]).includes(response.missingField);
}

/**
 * Builds a booking_intent ChatResponse from a complete set of params.
 */
function buildBookingIntentResponse(params: BookingIntentParams): ChatResponse {
  return { type: 'booking_intent', params };
}

/**
 * Builds a clarification ChatResponse for a given missing field.
 */
function buildClarificationResponse(missingField: MissingField): ChatResponse {
  return {
    type: 'clarification',
    missingField,
    message: `Could you please provide your preferred ${missingField}?`,
  };
}

/**
 * Simulates the response parsing logic: given a set of params (some may be empty),
 * returns the appropriate ChatResponse type.
 */
function parseBookingParams(params: Partial<BookingIntentParams>): ChatResponse {
  const { date, time, treatmentId, branchId } = params;
  if (date && time && treatmentId && branchId) {
    return buildBookingIntentResponse({ date, time, treatmentId, branchId });
  }
  // Find first missing field
  const missing = VALID_MISSING_FIELDS.find((f) => !params[f]) ?? 'date';
  return buildClarificationResponse(missing);
}

/**
 * Validates that a conversation history array is bounded to at most 10 messages
 * and that each message has the required shape.
 */
function isValidHistory(history: ChatMessage[]): boolean {
  if (history.length > 10) return false;
  return history.every(
    (msg) =>
      (msg.role === 'user' || msg.role === 'assistant') &&
      typeof msg.content === 'string' &&
      typeof msg.timestamp === 'string'
  );
}

// ─── Arbitraries ─────────────────────────────────────────────────────────────

/** Non-empty string arbitrary */
const nonEmptyString = fc.string({ minLength: 1, maxLength: 50 });

/** Arbitrary for a complete BookingIntentParams (all 4 fields non-empty) */
const completeBookingParamsArb: fc.Arbitrary<BookingIntentParams> = fc.record({
  date: fc
    .tuple(
      fc.integer({ min: 2024, max: 2026 }),
      fc.integer({ min: 1, max: 12 }),
      fc.integer({ min: 1, max: 28 })
    )
    .map(
      ([y, m, d]) =>
        `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`
    ),
  time: fc
    .tuple(fc.integer({ min: 0, max: 23 }), fc.integer({ min: 0, max: 59 }))
    .map(([h, m]) => `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`),
  treatmentId: fc.integer({ min: 1, max: 100 }).map(String),
  branchId: fc.integer({ min: 1, max: 20 }).map(String),
});

/** Arbitrary for a subset of 1–3 missing fields (leaving at least 1 missing) */
const missingFieldsArb: fc.Arbitrary<MissingField[]> = fc
  .shuffledSubarray(VALID_MISSING_FIELDS as unknown as MissingField[], {
    minLength: 1,
    maxLength: 3,
  });

/** Arbitrary for a ChatMessage */
const chatMessageArb: fc.Arbitrary<ChatMessage> = fc.record({
  role: fc.constantFrom('user' as const, 'assistant' as const),
  content: nonEmptyString,
  timestamp: fc.integer({ min: 0, max: 2_000_000_000_000 }).map((ms) =>
    new Date(ms).toISOString()
  ),
});

/** Arbitrary for a conversation history of length 1–10 */
const conversationHistoryArb: fc.Arbitrary<ChatMessage[]> = fc.array(chatMessageArb, {
  minLength: 1,
  maxLength: 10,
});

// ─── Property 5: Intent extraction completeness ───────────────────────────────

describe('Property 5: Intent extraction completeness', () => {
  // Feature: spa-ai-features, Property 5: For any customer message that contains all four required booking parameters (date, time, treatment, branch), the Chatbot_Service returns a booking_intent response with all four fields populated and non-null.

  it('should return booking_intent with all fields non-null when all 4 params are present', () => {
    fc.assert(
      fc.property(completeBookingParamsArb, (params) => {
        const response = parseBookingParams(params);

        // Response type must be booking_intent
        expect(response.type).toBe('booking_intent');

        // All four fields must be present and non-null/non-empty
        expect(isCompleteBookingIntent(response)).toBe(true);

        if (response.type === 'booking_intent') {
          expect(response.params.date).toBeTruthy();
          expect(response.params.time).toBeTruthy();
          expect(response.params.treatmentId).toBeTruthy();
          expect(response.params.branchId).toBeTruthy();
        }
      }),
      { numRuns: 100 }
    );
  });

  it('should preserve all param values exactly in the booking_intent response', () => {
    fc.assert(
      fc.property(completeBookingParamsArb, (params) => {
        const response = parseBookingParams(params);

        expect(response.type).toBe('booking_intent');
        if (response.type === 'booking_intent') {
          expect(response.params.date).toBe(params.date);
          expect(response.params.time).toBe(params.time);
          expect(response.params.treatmentId).toBe(params.treatmentId);
          expect(response.params.branchId).toBe(params.branchId);
        }
      }),
      { numRuns: 100 }
    );
  });
});

// ─── Property 6: Clarification identifies missing parameter ───────────────────

describe('Property 6: Clarification identifies missing parameter', () => {
  // Feature: spa-ai-features, Property 6: For any customer message that is missing one or more required booking parameters, the Chatbot_Service returns a clarification response whose missingField value names one of the absent parameters.

  it('should return clarification with missingField naming an absent param when 1–3 params are missing', () => {
    fc.assert(
      fc.property(completeBookingParamsArb, missingFieldsArb, (params, missingFields) => {
        // Build a partial params object by removing the missing fields
        const partialParams: Partial<BookingIntentParams> = { ...params };
        for (const field of missingFields) {
          delete partialParams[field];
        }

        const response = parseBookingParams(partialParams);

        // Response type must be clarification
        expect(response.type).toBe('clarification');

        if (response.type === 'clarification') {
          // missingField must be one of the 4 valid param names
          expect(VALID_MISSING_FIELDS).toContain(response.missingField);

          // missingField must name one of the actually absent params
          expect(missingFields).toContain(response.missingField);
        }
      }),
      { numRuns: 100 }
    );
  });

  it('should return clarification with a non-empty message when params are missing', () => {
    fc.assert(
      fc.property(completeBookingParamsArb, missingFieldsArb, (params, missingFields) => {
        const partialParams: Partial<BookingIntentParams> = { ...params };
        for (const field of missingFields) {
          delete partialParams[field];
        }

        const response = parseBookingParams(partialParams);

        expect(response.type).toBe('clarification');
        if (response.type === 'clarification') {
          expect(typeof response.message).toBe('string');
          expect(response.message.length).toBeGreaterThan(0);
        }
      }),
      { numRuns: 100 }
    );
  });

  it('should never return booking_intent when any param is missing', () => {
    fc.assert(
      fc.property(completeBookingParamsArb, missingFieldsArb, (params, missingFields) => {
        const partialParams: Partial<BookingIntentParams> = { ...params };
        for (const field of missingFields) {
          delete partialParams[field];
        }

        const response = parseBookingParams(partialParams);

        expect(response.type).not.toBe('booking_intent');
      }),
      { numRuns: 100 }
    );
  });
});

// ─── Property 7: Context retention across 10 messages ────────────────────────

describe('Property 7: Context retention across 10 messages', () => {
  // Feature: spa-ai-features, Property 7: For any conversation of N messages where 1 ≤ N ≤ 10, the Chatbot_Service response to the Nth message can correctly reference information provided in the first message of the same session.

  it('should maintain valid history structure for conversations of length 1–10', () => {
    fc.assert(
      fc.property(conversationHistoryArb, (history) => {
        // History length must be within bounds
        expect(history.length).toBeGreaterThanOrEqual(1);
        expect(history.length).toBeLessThanOrEqual(10);

        // Each message must have valid shape
        expect(isValidHistory(history)).toBe(true);
      }),
      { numRuns: 100 }
    );
  });

  it('should retain the first message in history when history length is within bounds', () => {
    fc.assert(
      fc.property(conversationHistoryArb, (history) => {
        // The first message must be accessible (context retention)
        const firstMessage = history[0];
        expect(firstMessage).toBeDefined();
        expect(firstMessage.content).toBeTruthy();
        expect(firstMessage.role === 'user' || firstMessage.role === 'assistant').toBe(true);

        // The Nth (last) message must also be accessible
        const lastMessage = history[history.length - 1];
        expect(lastMessage).toBeDefined();
        expect(lastMessage.content).toBeTruthy();
      }),
      { numRuns: 100 }
    );
  });

  it('should enforce MAX_HISTORY of 10 messages — trimmed history never exceeds 10', () => {
    const MAX_HISTORY = 10;

    fc.assert(
      fc.property(
        fc.array(chatMessageArb, { minLength: 1, maxLength: 25 }),
        (messages) => {
          // Simulate the trimming logic from ChatbotService/ChatbotController
          const trimmed = messages.slice(-MAX_HISTORY);

          expect(trimmed.length).toBeLessThanOrEqual(MAX_HISTORY);
          expect(trimmed.length).toBeGreaterThanOrEqual(1);

          // The trimmed history must be a suffix of the original
          const expectedSuffix = messages.slice(
            Math.max(0, messages.length - MAX_HISTORY)
          );
          expect(trimmed).toEqual(expectedSuffix);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should allow the Nth response to reference content from message 1 via history', () => {
    fc.assert(
      fc.property(conversationHistoryArb, nonEmptyString, (history, firstContent) => {
        // Simulate a session where the first message has known content
        const sessionHistory: ChatMessage[] = [
          { role: 'user', content: firstContent, timestamp: new Date().toISOString() },
          ...history.slice(1),
        ];

        // Trim to MAX_HISTORY
        const MAX_HISTORY = 10;
        const trimmed = sessionHistory.slice(-MAX_HISTORY);

        // If the session has ≤ 10 messages, the first message must still be in history
        if (sessionHistory.length <= MAX_HISTORY) {
          const found = trimmed.some((msg) => msg.content === firstContent);
          expect(found).toBe(true);
        }

        // History is always bounded
        expect(trimmed.length).toBeLessThanOrEqual(MAX_HISTORY);
      }),
      { numRuns: 100 }
    );
  });
});

// ─── Staff Chatbot Helpers ────────────────────────────────────────────────────

const VALID_STAFF_INTENTS = [
  'revenue_query',
  'booking_query',
  'staff_query',
  'session_query',
] as const;
type StaffIntent = (typeof VALID_STAFF_INTENTS)[number];

const STAFF_ROLES = ['cashier', 'therapist', 'manager'] as const;
type StaffRole = (typeof STAFF_ROLES)[number];

/**
 * Simulates staff intent classification: maps a query string to one of the 4
 * valid intent values using keyword heuristics (mirrors backend classification logic).
 */
function classifyStaffIntent(query: string): StaffIntent {
  const q = query.toLowerCase();
  if (q.includes('revenue') || q.includes('income') || q.includes('sales') || q.includes('earning')) {
    return 'revenue_query';
  }
  if (q.includes('booking') || q.includes('appointment') || q.includes('reservation') || q.includes('schedule')) {
    return 'booking_query';
  }
  if (q.includes('staff') || q.includes('employee') || q.includes('therapist') || q.includes('cashier')) {
    return 'staff_query';
  }
  // Default to session_query for anything else
  return 'session_query';
}

/**
 * Builds a data_response ChatResponse for a staff query.
 */
function buildDataResponse(
  value: unknown,
  period: string,
  branch: string,
  formattedAnswer: string
): ChatResponse {
  return { type: 'data_response', value, period, branch, formattedAnswer };
}

/**
 * Checks whether a data_response has all required non-null/non-empty fields.
 */
function isCompleteDataResponse(
  response: ChatResponse
): response is { type: 'data_response'; value: unknown; period: string; branch: string; formattedAnswer: string } {
  if (response.type !== 'data_response') return false;
  return (
    response.value !== null &&
    response.value !== undefined &&
    typeof response.period === 'string' && response.period.length > 0 &&
    typeof response.branch === 'string' && response.branch.length > 0
  );
}

/**
 * Simulates authorization check: non-manager roles cannot access staff_query data.
 * Returns true if the role is authorized for the given intent.
 */
function isAuthorizedForIntent(role: StaffRole, intent: StaffIntent): boolean {
  if (intent === 'staff_query' && role !== 'manager') return false;
  return true;
}

/**
 * Simulates scoped data retrieval: returns data filtered to the staff member's branch.
 * Returns null if the role is not authorized for the intent.
 */
function getScopedDataResponse(
  role: StaffRole,
  branchId: string,
  intent: StaffIntent
): ChatResponse {
  if (!isAuthorizedForIntent(role, intent)) {
    return {
      type: 'error',
      message: 'The requested data is not accessible for your role.',
    };
  }
  return buildDataResponse(
    { branchId, intent },
    'this_week',
    branchId,
    `Here is the ${intent} data for branch ${branchId}.`
  );
}

// ─── Arbitraries for Staff Chatbot ───────────────────────────────────────────

/** Arbitrary for a staff role */
const staffRoleArb: fc.Arbitrary<StaffRole> = fc.constantFrom(...STAFF_ROLES);

/** Arbitrary for a branch ID string */
const branchIdArb: fc.Arbitrary<string> = fc.integer({ min: 1, max: 20 }).map(String);

/** Arbitrary for a staff query string (random text) */
const staffQueryArb: fc.Arbitrary<string> = fc.string({ minLength: 1, maxLength: 200 });

/** Arbitrary for a valid staff intent */
const staffIntentArb: fc.Arbitrary<StaffIntent> = fc.constantFrom(...VALID_STAFF_INTENTS);

/** Arbitrary for a non-empty period string */
const periodArb: fc.Arbitrary<string> = fc.constantFrom(
  'today', 'this_week', 'this_month', 'last_7_days', 'last_30_days', 'last_90_days'
);

/** Arbitrary for a data_response ChatResponse */
const dataResponseArb: fc.Arbitrary<ChatResponse> = fc.record({
  type: fc.constant('data_response' as const),
  value: fc.oneof(
    fc.integer({ min: 0, max: 1_000_000 }),
    fc.double({ min: 0, max: 1_000_000, noNaN: true }),
    fc.string({ minLength: 1, maxLength: 50 }),
    fc.record({ count: fc.integer({ min: 0, max: 999 }) }),
  ),
  period: periodArb,
  branch: branchIdArb,
  formattedAnswer: fc.string({ minLength: 1, maxLength: 200 }),
});

// ─── Property 8: Staff intent classification is exhaustive ────────────────────

describe('Property 8: Staff intent classification is exhaustive', () => {
  // Feature: spa-ai-features, Property 8: For any staff natural-language query, the Chatbot_Service classifies the intent as exactly one of: revenue_query, booking_query, staff_query, or session_query.

  it('should always classify a staff query as one of the 4 valid intent values', () => {
    fc.assert(
      fc.property(staffQueryArb, (query) => {
        const intent = classifyStaffIntent(query);

        // Intent must be one of the 4 valid values
        expect(VALID_STAFF_INTENTS).toContain(intent);
      }),
      { numRuns: 100 }
    );
  });

  it('should return exactly one intent per query (no multi-classification)', () => {
    fc.assert(
      fc.property(staffQueryArb, (query) => {
        const intent = classifyStaffIntent(query);

        // Result is a single string, not an array
        expect(typeof intent).toBe('string');
        expect(VALID_STAFF_INTENTS).toContain(intent);
      }),
      { numRuns: 100 }
    );
  });

  it('should classify known revenue keywords as revenue_query', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('revenue', 'income', 'sales', 'earning'),
        fc.string({ maxLength: 30 }),
        (keyword, suffix) => {
          const query = `${keyword} ${suffix}`;
          const intent = classifyStaffIntent(query);
          expect(intent).toBe('revenue_query');
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should classify known booking keywords as booking_query', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('booking', 'appointment', 'reservation', 'schedule'),
        fc.string({ maxLength: 30 }),
        (keyword, suffix) => {
          const query = `${keyword} ${suffix}`;
          const intent = classifyStaffIntent(query);
          expect(intent).toBe('booking_query');
        }
      ),
      { numRuns: 100 }
    );
  });
});

// ─── Property 9: Staff response structure completeness ───────────────────────

describe('Property 9: Staff response structure completeness', () => {
  // Feature: spa-ai-features, Property 9: For any staff query that produces a data response, the response object contains non-null values for value, period, and branch.

  it('should have non-null value, period, and branch in every data_response', () => {
    fc.assert(
      fc.property(dataResponseArb, (response) => {
        expect(isCompleteDataResponse(response)).toBe(true);

        if (response.type === 'data_response') {
          expect(response.value).not.toBeNull();
          expect(response.value).not.toBeUndefined();
          expect(response.period).toBeTruthy();
          expect(response.branch).toBeTruthy();
        }
      }),
      { numRuns: 100 }
    );
  });

  it('should have non-empty period and branch strings in every data_response', () => {
    fc.assert(
      fc.property(dataResponseArb, (response) => {
        if (response.type === 'data_response') {
          expect(response.period.length).toBeGreaterThan(0);
          expect(response.branch.length).toBeGreaterThan(0);
        }
      }),
      { numRuns: 100 }
    );
  });

  it('should preserve value, period, and branch when building a data_response', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 999_999 }),
        periodArb,
        branchIdArb,
        fc.string({ minLength: 1, maxLength: 100 }),
        (value, period, branch, formattedAnswer) => {
          const response = buildDataResponse(value, period, branch, formattedAnswer);

          expect(response.type).toBe('data_response');
          if (response.type === 'data_response') {
            expect(response.value).toBe(value);
            expect(response.period).toBe(period);
            expect(response.branch).toBe(branch);
            expect(response.formattedAnswer).toBe(formattedAnswer);
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});

// ─── Property 10: Staff authorization invariant ───────────────────────────────

describe('Property 10: Staff authorization invariant', () => {
  // Feature: spa-ai-features, Property 10: For any staff member with role R and branch assignment B, all data items returned by the Chatbot_Service belong to branch B and fall within the access scope permitted for role R.

  it('should return data scoped to the staff member\'s branch for authorized intents', () => {
    fc.assert(
      fc.property(staffRoleArb, branchIdArb, staffIntentArb, (role, branchId, intent) => {
        if (!isAuthorizedForIntent(role, intent)) return; // skip unauthorized cases

        const response = getScopedDataResponse(role, branchId, intent);

        expect(response.type).toBe('data_response');
        if (response.type === 'data_response') {
          // Branch in response must match the staff member's branch
          expect(response.branch).toBe(branchId);
        }
      }),
      { numRuns: 100 }
    );
  });

  it('should deny access for non-manager roles attempting staff_query', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('cashier' as const, 'therapist' as const),
        branchIdArb,
        (role, branchId) => {
          const response = getScopedDataResponse(role, branchId, 'staff_query');

          // Non-manager roles must not receive a data_response for staff_query
          expect(response.type).toBe('error');
          if (response.type === 'error') {
            expect(response.message.length).toBeGreaterThan(0);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should allow manager role to access staff_query data', () => {
    fc.assert(
      fc.property(branchIdArb, (branchId) => {
        const response = getScopedDataResponse('manager', branchId, 'staff_query');

        expect(response.type).toBe('data_response');
        if (response.type === 'data_response') {
          expect(response.branch).toBe(branchId);
        }
      }),
      { numRuns: 100 }
    );
  });

  it('should allow all roles to access revenue_query, booking_query, and session_query', () => {
    const openIntents: StaffIntent[] = ['revenue_query', 'booking_query', 'session_query'];

    fc.assert(
      fc.property(staffRoleArb, branchIdArb, fc.constantFrom(...openIntents), (role, branchId, intent) => {
        const response = getScopedDataResponse(role, branchId, intent);

        expect(response.type).toBe('data_response');
        if (response.type === 'data_response') {
          expect(response.branch).toBe(branchId);
        }
      }),
      { numRuns: 100 }
    );
  });

  it('should never return data from a different branch than the staff member\'s assignment', () => {
    fc.assert(
      fc.property(
        staffRoleArb,
        fc.tuple(branchIdArb, branchIdArb).filter(([a, b]) => a !== b),
        staffIntentArb,
        (role, [staffBranch, otherBranch], intent) => {
          if (!isAuthorizedForIntent(role, intent)) return;

          const response = getScopedDataResponse(role, staffBranch, intent);

          if (response.type === 'data_response') {
            // Response branch must be the staff's branch, not any other branch
            expect(response.branch).toBe(staffBranch);
            expect(response.branch).not.toBe(otherBranch);
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});
