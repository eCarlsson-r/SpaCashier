// Feature: pwa-i18n — Property-based tests for the offline queue module
// Uses fake-indexeddb to mock IndexedDB in Node/Vitest environment

import 'fake-indexeddb/auto';
import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { createOfflineQueue } from '../offlineQueue';

// Counter for unique DB names to avoid state leakage between iterations
let dbCounter = 0;
function uniqueDbName(): string {
  return `test-offline-queue-${Date.now()}-${++dbCounter}`;
}

// ─── Property 1: Offline write operations are stored with correct structure ───
// Feature: pwa-i18n, Property 1: Offline write operations are stored with correct structure

describe('Feature: pwa-i18n, Property 1: Offline write operations are stored with correct structure', () => {
  /**
   * Validates: Requirements 4.1, 4.2
   *
   * For any write operation (method from POST/PUT/PATCH/DELETE, any URL string,
   * any JSON body string, any headers object), when enqueued, the stored
   * QueuedOperation SHALL contain the original method, URL, body, and headers
   * unchanged, with status: 'pending', retryCount: 0, a valid UUID id, and a
   * valid enqueuedAt timestamp (number > 0).
   */
  it('stored operation preserves all input fields and has correct defaults', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom('POST' as const, 'PUT' as const, 'PATCH' as const, 'DELETE' as const),
        fc.webUrl(),
        fc.string(),
        fc.dictionary(fc.string({ minLength: 1, maxLength: 20 }), fc.string({ maxLength: 50 })),
        async (method, url, body, headers) => {
          const queue = createOfflineQueue(uniqueDbName());
          const id = await queue.enqueue({ method, url, body, headers });

          const pending = await queue.getPending();
          expect(pending).toHaveLength(1);

          const op = pending[0];
          // Original fields preserved unchanged
          expect(op.method).toBe(method);
          expect(op.url).toBe(url);
          expect(op.body).toBe(body);
          expect(op.headers).toEqual(headers);
          // Correct defaults
          expect(op.status).toBe('pending');
          expect(op.retryCount).toBe(0);
          // Valid UUID (returned id matches stored id)
          expect(op.id).toBe(id);
          expect(op.id).toMatch(
            /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
          );
          // Valid timestamp
          expect(typeof op.enqueuedAt).toBe('number');
          expect(op.enqueuedAt).toBeGreaterThan(0);
        },
      ),
      { numRuns: 100 },
    );
  });
});

// ─── Property 2: Offline queue preserves FIFO ordering ───────────────────────
// Feature: pwa-i18n, Property 2: Offline queue preserves FIFO ordering

describe('Feature: pwa-i18n, Property 2: Offline queue preserves FIFO ordering', () => {
  /**
   * Validates: Requirements 4.3, 4.4
   *
   * For any sequence of write operations (minLength: 1, maxLength: 20), when
   * enqueued sequentially, getPending() SHALL return them ordered by
   * enqueuedAt ascending.
   */
  it('getPending returns operations ordered by enqueuedAt ascending', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(
          fc.record({
            method: fc.constantFrom('POST' as const, 'PUT' as const, 'PATCH' as const, 'DELETE' as const),
            url: fc.webUrl(),
            body: fc.string(),
            headers: fc.dictionary(fc.string({ minLength: 1, maxLength: 10 }), fc.string({ maxLength: 20 })),
          }),
          { minLength: 1, maxLength: 20 },
        ),
        async (ops) => {
          const queue = createOfflineQueue(uniqueDbName());
          for (const op of ops) {
            await queue.enqueue(op);
          }
          const pending = await queue.getPending();
          expect(pending).toHaveLength(ops.length);

          const timestamps = pending.map((p) => p.enqueuedAt);
          const sorted = [...timestamps].sort((a, b) => a - b);
          expect(timestamps).toEqual(sorted);
        },
      ),
      { numRuns: 100 },
    );
  });
});

// ─── Property 3: Successful sync removes operation from queue ─────────────────
// Feature: pwa-i18n, Property 3: Successful sync removes operation from queue

describe('Feature: pwa-i18n, Property 3: Successful sync removes operation from queue', () => {
  /**
   * Validates: Requirements 4.5
   *
   * For any set of queued operations, after calling remove() on each id,
   * count() SHALL return 0.
   */
  it('removing all operations leaves the queue empty', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(
          fc.record({
            method: fc.constantFrom('POST' as const, 'PUT' as const, 'PATCH' as const, 'DELETE' as const),
            url: fc.webUrl(),
            body: fc.string(),
            headers: fc.dictionary(fc.string({ minLength: 1, maxLength: 10 }), fc.string({ maxLength: 20 })),
          }),
          { minLength: 1, maxLength: 20 },
        ),
        async (ops) => {
          const queue = createOfflineQueue(uniqueDbName());
          const ids: string[] = [];
          for (const op of ops) {
            const id = await queue.enqueue(op);
            ids.push(id);
          }

          // Simulate successful sync: remove each operation
          for (const id of ids) {
            await queue.remove(id);
          }

          const remaining = await queue.count();
          expect(remaining).toBe(0);
        },
      ),
      { numRuns: 100 },
    );
  });
});

// ─── Property 4: 4xx sync errors remove the operation from queue ──────────────
// Feature: pwa-i18n, Property 4: 4xx sync errors remove the operation from queue

describe('Feature: pwa-i18n, Property 4: 4xx sync errors remove the operation from queue', () => {
  /**
   * Validates: Requirements 4.7, 4.8
   *
   * For any queue with N operations, after calling remove() on one operation
   * (simulating 4xx handling), count() SHALL equal N-1.
   */
  it('removing one operation after a 4xx response decreases count by exactly 1', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(
          fc.record({
            method: fc.constantFrom('POST' as const, 'PUT' as const, 'PATCH' as const, 'DELETE' as const),
            url: fc.webUrl(),
            body: fc.string(),
            headers: fc.dictionary(fc.string({ minLength: 1, maxLength: 10 }), fc.string({ maxLength: 20 })),
          }),
          { minLength: 1, maxLength: 20 },
        ),
        fc.nat(), // used to pick which operation to remove
        async (ops, pickIndex) => {
          const queue = createOfflineQueue(uniqueDbName());
          const ids: string[] = [];
          for (const op of ops) {
            const id = await queue.enqueue(op);
            ids.push(id);
          }

          const n = ids.length;
          const targetId = ids[pickIndex % n];

          // Simulate 4xx: remove the operation (not retried)
          await queue.remove(targetId);

          const remaining = await queue.count();
          expect(remaining).toBe(n - 1);
        },
      ),
      { numRuns: 100 },
    );
  });
});
