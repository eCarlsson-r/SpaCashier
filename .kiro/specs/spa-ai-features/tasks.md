# Implementation Plan: Spa AI Features

## Overview

Incremental implementation of four AI-powered features across SpaCashier (Next.js 16 / React 19) and SpaBooking (Nuxt 3 / Vue 3), backed by a shared Laravel API with Redis queuing, Pusher/Reverb real-time events, and OpenAI as the AI engine. Tasks are ordered so each step builds on the previous, ending with full integration and wiring.

## Tasks

- [x] 1. Backend foundation — data models, migrations, and shared types
  - Create Laravel migration for `feedbacks` table (rating, comment, session_id, customer_id, sentiment_score, sentiment_label, analysis_status, analysis_attempts, submitted_at, analyzed_at)
  - Create Laravel migration for `conflicts` table (booking_id, conflicting_booking_id, conflict_type, detection_timestamp, resolution_status, resolution_action, resolution_timestamp, alternative_slots JSON, branch_id)
  - Create Laravel migration for `chat_sessions` table (user_id, user_type, messages JSON, created_at, updated_at)
  - Create optional Laravel migration for `ai_recommendations` table (customer_id, branch_id, recommendations JSON, generated_at, expires_at) — cache metadata; Redis is primary store
  - Create Eloquent models: `Feedback`, `Conflict`, `ChatSession` with fillable fields, casts, and relationships
  - Add TypeScript types to `SpaCashier/src/lib/types.ts`: `TreatmentRecommendation`, `ChatMessage`, `ChatResponse`, `BookingIntentParams`, `ConflictRecord`, `AlternativeSlot`, `Feedback`, `SentimentDashboardData`, `FeedbackSummary`
  - Add equivalent TypeScript interfaces to `SpaBooking/types/ai.ts`
  - _Requirements: 1.1, 2.1, 6.1, 8.1, 9.1, 9.3, 10.1_

- [x] 2. Smart Treatment Recommendations — backend
  - [x] 2.1 Implement `RecommendationService` in Laravel
    - Check Redis cache key `rec:{customerId}:{branchId}` (TTL 24h); return cached result on hit
    - On cache miss, fetch bookings from last 90 days for the customer
    - Call OpenAI API with booking history context; filter out unavailable treatments at branch
    - Return ranked list (max 5 for SpaBooking, max 3 for POS) with ≤20-word rationale per item
    - Fall back to globally popular treatments when AI is unavailable or history < 3 bookings
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 2.1, 2.2, 2.3, 3.1, 3.3_

  - [x] 2.2 Write property tests for RecommendationService (PHP/Eris)
    - **Property 1: Recommendation list size is within context bounds** — generate random customer histories and context type (SpaBooking/POS); assert list length > 0 and ≤ context max
    - **Property 2: Recommendations exclude unavailable treatments** — generate random treatment availability maps; assert no returned treatment is unavailable at the branch
    - **Property 3: Recommendation recency window** — generate booking records with random dates; assert adding a booking older than 90 days does not change output
    - **Property 4: Rationale word count invariant** — generate random recommendation responses; assert rationale word count ≤ 20
    - **Validates: Requirements 1.1, 1.6, 2.4, 3.1**

  - [x] 2.3 Implement `RecommendationController` routes and cache invalidation endpoint
    - `GET /api/ai/recommendations` (SpaBooking, auth:customer)
    - `GET /api/ai/recommendations/pos` (SpaCashier, auth:staff)
    - `POST /api/ai/recommendations/invalidate/{customerId}` (internal, called on new booking)
    - Wire `BookingObserver@created` to call the invalidation endpoint within 60 seconds
    - _Requirements: 1.4, 1.5, 2.2, 3.2_

  - [x] 2.4 Write unit tests for RecommendationController
    - Test fallback returns popular treatments when AI unavailable
    - Test fallback when customer has < 3 bookings
    - Test cache invalidation triggers on new booking
    - _Requirements: 1.5, 2.3, 3.2_

- [x] 3. Smart Treatment Recommendations — frontend
  - [x] 3.1 Implement `useRecommendations` hook in SpaCashier (`src/hooks/useRecommendations.ts`)
    - Use React Query to `GET /api/ai/recommendations/pos` with `customerId` and `branchId`
    - Return `{ data, isLoading, isError }`; treat error as silent (hide panel, no error shown)
    - _Requirements: 2.1, 2.2, 2.5_

  - [x] 3.2 Implement `<RecommendationPanel>` component in SpaCashier (`src/components/ai/RecommendationPanel.tsx`)
    - Display up to 3 recommended treatments with name, duration, price, and rationale
    - Hide panel entirely when `isError` or service unavailable (no error message)
    - Integrate into customer profile view and POS sale view
    - _Requirements: 2.1, 2.4, 2.5_

  - [x] 3.3 Write unit tests for RecommendationPanel (SpaCashier)
    - Test panel renders 3 items with all required fields
    - Test panel is hidden when service returns error
    - _Requirements: 2.4, 2.5_

  - [x] 3.4 Implement `useRecommendations` composable in SpaBooking (`app/composables/useRecommendations.ts`)
    - Fetch `GET /api/ai/recommendations` with `customerId` and `branchId`
    - Return `{ recommendations, isLoading }`; fall back silently on error
    - _Requirements: 1.1, 1.4, 1.5_

  - [x] 3.5 Implement `<RecommendationPanel>` component in SpaBooking (`app/components/ai/RecommendationPanel.vue`)
    - Display up to 5 recommended treatments; integrate into catalog and booking flow pages
    - Show fallback (popular treatments) silently when AI unavailable
    - _Requirements: 1.1, 1.3, 1.5_

- [x] 4. Checkpoint — Ensure all recommendation tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 5. Intelligent Booking Assistant — backend
  - [x] 5.1 Implement `ChatbotController` customer endpoint (`POST /api/ai/chat`)
    - Accept message + session history (last 10 messages); persist/update `ChatSession` record
    - Send to OpenAI with booking assistant system prompt (available treatments, branches)
    - Return `{ type: 'booking_intent', params }` when all 4 params extracted
    - Return `{ type: 'clarification', missingField, message }` when params incomplete
    - Return `{ type: 'error', message }` on AI unavailability; respond within 5 seconds
    - _Requirements: 4.2, 4.3, 4.4, 4.5, 4.6, 4.7_

  - [x] 5.2 Write property tests for customer chatbot (TypeScript/fast-check, `chatbot.property.test.ts`)
    - **Property 5: Intent extraction completeness** — generate messages with all 4 params; assert response type is `booking_intent` with all fields non-null
    - **Property 6: Clarification identifies missing parameter** — generate messages missing 1–3 params; assert response type is `clarification` and `missingField` names an absent param
    - **Property 7: Context retention across 10 messages** — generate conversation histories of length 1–10; assert Nth response can reference info from message 1
    - **Validates: Requirements 4.2, 4.3, 4.4, 4.7**

  - [x] 5.3 Implement `ChatbotController` staff endpoint (`POST /api/ai/chat/staff`)
    - Accept query + staff auth context (role, branch_id)
    - Classify intent: `revenue_query | booking_query | staff_query | session_query`
    - Execute scoped data retrieval filtered by branch and role
    - Return `{ type: 'data_response', value, period, branch, formattedAnswer }` within 5 seconds
    - Return `{ type: 'authorization_error' }` (HTTP 200) for out-of-scope queries
    - _Requirements: 5.2, 5.3, 5.4, 5.5, 5.6, 5.7_

  - [x] 5.4 Write property tests for staff chatbot (TypeScript/fast-check, `chatbot.property.test.ts`)
    - **Property 8: Staff intent classification is exhaustive** — generate random staff queries; assert intent is one of the 4 valid values
    - **Property 9: Staff response structure completeness** — generate random data query responses; assert `value`, `period`, `branch` are non-null
    - **Property 10: Staff authorization invariant** — generate random staff roles and branch assignments; assert all returned data belongs to the staff member's branch and role scope
    - **Validates: Requirements 5.2, 5.4, 5.5**

  - [x] 5.5 Write unit tests for chatbot endpoints
    - Test customer chatbot returns error type when AI unavailable
    - Test staff chatbot returns authorization_error for out-of-scope query
    - Test ChatSession stores last 10 messages only
    - _Requirements: 4.6, 5.6, 4.7_

- [x] 6. Intelligent Booking Assistant — frontend
  - [x] 6.1 Implement Pinia store for chat state in SpaBooking (`app/stores/chat.ts`)
    - Store conversation history (last 10 messages), `isTyping` flag, and session ID
    - Actions: `sendMessage`, `clearHistory`
    - _Requirements: 4.7, 4.8_

  - [x] 6.2 Implement `<ChatWidget>` component in SpaBooking (`app/components/ai/ChatWidget.vue`)
    - Persistent floating widget in `app/layouts/default.vue`, visible to authenticated customers only
    - Show typing indicator while `isTyping` is true
    - On `booking_intent` response, navigate to `/checkout` with pre-populated query params
    - On service unavailability, show fallback message with link to `/bookings`
    - _Requirements: 4.1, 4.3, 4.5, 4.6, 4.8_

  - [x] 6.3 Write unit tests for ChatWidget (SpaBooking)
    - Test typing indicator shown while awaiting response
    - Test navigation to `/checkout` on `booking_intent` response
    - Test fallback message shown when service unavailable
    - _Requirements: 4.6, 4.8_

  - [x] 6.4 Implement `<StaffChatPanel>` component in SpaCashier (`src/components/ai/StaffChatPanel.tsx`)
    - Rendered in dashboard layout sidebar, visible to authenticated staff only
    - Show typing indicator while awaiting response
    - Display structured answer (value, period, branch) for `data_response` type
    - Show inline unavailability message on error
    - _Requirements: 5.1, 5.4, 5.7, 5.8_

  - [x] 6.5 Write unit tests for StaffChatPanel (SpaCashier)
    - Test typing indicator shown while awaiting response
    - Test structured answer rendered with value, period, branch
    - Test inline unavailability message shown on error
    - _Requirements: 5.7, 5.8_

- [x] 7. Checkpoint — Ensure all chatbot tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 8. Session & Booking Conflict Resolution — backend
  - [x] 8.1 Implement `BookingObserver` in Laravel
    - Hook `created` and `updated` events on the Booking model
    - Dispatch `EvaluateConflictJob` to the queue on each event
    - _Requirements: 6.1_

  - [x] 8.2 Implement `ConflictResolverService` in Laravel
    - Query all bookings sharing the same `employee_id` or `room_id` within the overlapping time window `[start, end)`
    - If overlap found, create a `Conflict` record and call OpenAI to generate up to 3 alternative slots (same day; fall back to next 3 calendar days if none available)
    - Complete evaluation within 3 seconds
    - _Requirements: 6.1, 6.2, 6.3, 6.6, 6.7_

  - [x] 8.3 Write property tests for ConflictResolverService (PHP/Eris, `conflict.property.test.ts`)
    - **Property 11: Conflict detection for overlapping bookings** — generate booking pairs with overlapping/non-overlapping windows; assert conflict detected iff windows overlap
    - **Property 12: Alternative slot count is bounded** — generate random availability calendars; assert alternative slot count is between 0 and 3 inclusive
    - **Property 18: Conflict record completeness** — generate random conflict creation events; assert all required fields (`booking_id`, `conflicting_booking_id`, `conflict_type`, `detection_timestamp`, `resolution_status`) are non-null
    - **Validates: Requirements 6.1, 6.2, 6.6, 8.1**

  - [x] 8.4 Implement conflict broadcast and `ConflictController` routes
    - Broadcast `ConflictDetected` event to `private-branch.{branchId}` (SpaCashier staff alert)
    - Broadcast `ReschedulingSuggestion` event to `private-customer.{customerId}` (SpaBooking notification)
    - Persist rescheduling suggestion for offline customers
    - `GET /api/conflicts` (manager only, filtered by branch and date range)
    - `POST /api/bookings/{id}/reschedule` (customer, applies selected slot)
    - `POST /api/conflicts/{id}/dismiss` (customer, persists dismissal)
    - `GET /api/conflicts/pending` (customer, fetch persisted suggestions on login)
    - _Requirements: 6.4, 6.5, 7.1, 7.3, 7.4, 7.5, 7.6, 8.1, 8.2, 8.3_

  - [x] 8.5 Write property tests for conflict broadcast and resolution (PHP/Eris, `conflict.property.test.ts`)
    - **Property 19: Conflict record resolution update** — generate random resolution actions (accept/dismiss); assert `resolution_action` and `resolution_timestamp` updated correctly
    - **Property 20: Conflict history scoped to manager's branch** — generate random manager/branch combinations; assert all returned records match manager's `branch_id`
    - **Validates: Requirements 8.2, 8.3**

  - [x] 8.6 Write unit tests for ConflictController
    - Test `GET /api/conflicts` returns 403 for non-manager staff
    - Test `POST /api/conflicts/{id}/dismiss` persists dismissal and prevents re-display
    - Test `GET /api/conflicts/pending` returns persisted suggestions for offline customer
    - _Requirements: 7.4, 7.6, 8.3_

- [x] 9. Session & Booking Conflict Resolution — frontend
  - [x] 9.1 Implement `useConflictAlerts` hook in SpaCashier (`src/hooks/useConflictAlerts.ts`)
    - Subscribe to `private-branch.{branchId}` via Laravel Echo for `ConflictDetected` events
    - Fall back to React Query polling (30-second interval) when WebSocket disconnects
    - _Requirements: 6.4, 6.5_

  - [x] 9.2 Implement `<ConflictAlertBanner>` component in SpaCashier (`src/components/ai/ConflictAlertBanner.tsx`)
    - Display conflicting booking identifiers, affected therapist or room, and overlapping time window
    - List up to 3 alternative slots
    - _Requirements: 6.5_

  - [x] 9.3 Write property tests for ConflictAlertBanner (TypeScript/fast-check, `conflict.property.test.ts`)
    - **Property 13: Conflict alert contains all required fields** — generate random conflict event payloads; assert rendered alert displays booking IDs, therapist/room ID, and time window
    - **Validates: Requirements 6.5**

  - [x] 9.4 Write unit tests for ConflictAlertBanner (SpaCashier)
    - Test all required fields rendered from event payload
    - Test fallback polling activates on WebSocket disconnect
    - _Requirements: 6.5_

  - [x] 9.5 Implement `useReschedulingNotifications` composable in SpaBooking (`app/composables/useReschedulingNotifications.ts`)
    - Subscribe to `private-customer.{customerId}` for `ReschedulingSuggestion` events
    - On login, fetch persisted suggestions via `GET /api/conflicts/pending`
    - Fall back to 30-second polling when WebSocket disconnects
    - _Requirements: 7.1, 7.2, 7.5, 7.6_

  - [x] 9.6 Implement `<ReschedulingModal>` component in SpaBooking (`app/components/ai/ReschedulingModal.vue`)
    - Display conflict reason and all available alternative slots
    - On slot selection: `POST /api/bookings/{id}/reschedule`; show booking confirmation
    - On dismiss: `POST /api/conflicts/{id}/dismiss`; do not re-display the same suggestion
    - _Requirements: 7.2, 7.3, 7.4_

  - [x] 9.7 Write property tests for rescheduling (TypeScript/fast-check, `conflict.property.test.ts`)
    - **Property 14: Rescheduling notification contains conflict reason and slots** — generate random rescheduling event payloads; assert notification displays reason and all slots
    - **Property 15: Reschedule selection round-trip** — generate random slot selections; assert reschedule API called with correct params and confirmation displayed
    - **Property 16: Dismissed suggestion does not reappear** — generate random suggestion lists with dismissals; assert dismissed suggestions absent from re-rendered list
    - **Property 17: Persisted suggestion appears on next login** — generate random offline/online scenarios; assert persisted suggestions appear on next authenticated session
    - **Validates: Requirements 7.2, 7.3, 7.4, 7.6**

  - [x] 9.8 Write unit tests for ReschedulingModal (SpaBooking)
    - Test conflict reason and slots rendered from event payload
    - Test reschedule API called on slot selection with correct params
    - Test dismissal prevents re-display of same suggestion
    - _Requirements: 7.3, 7.4_

- [x] 10. Checkpoint — Ensure all conflict resolution tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 11. Post-Session Feedback Collection — backend
  - [-] 11.1 Implement `FeedbackController` in Laravel
    - `POST /api/feedback`: validate session exists, within 48h window, no duplicate for customer+session
    - Persist `Feedback` record; dispatch `SentimentAnalysisJob` to Redis queue; return HTTP 201 immediately
    - Return HTTP 422 (`feedback_window_closed`) if outside 48h window
    - Return HTTP 409 (`feedback_already_submitted`) on duplicate
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6, 9.7_

  - [~] 11.2 Write property tests for FeedbackController (PHP/Eris, `feedback.property.test.ts`)
    - **Property 21: Feedback submission payload completeness** — generate random feedback form submissions; assert payload contains non-null `rating`, `comment`, `session_id`, `customer_id`
    - **Property 22: Feedback time window enforcement** — generate random submission timestamps relative to session completion; assert accepted iff T − S ≤ 48h
    - **Property 23: One feedback per customer per session** — generate duplicate submission attempts; assert second submission rejected and exactly one record persisted
    - **Validates: Requirements 9.3, 9.4, 9.5, 9.6, 9.7**

  - [~] 11.3 Write unit tests for FeedbackController
    - Test 422 returned when feedback submitted after 48h window
    - Test 409 returned on duplicate submission
    - Test 201 returned immediately (non-blocking) on valid submission
    - _Requirements: 9.4, 9.5, 9.7_

  - [~] 11.4 Implement `SentimentAnalysisJob` in Laravel
    - If comment is empty: set `sentiment_score = 0.0`, `sentiment_label = 'neutral'`, skip AI call
    - Otherwise call OpenAI Sentiment_Analyzer; parse score in [-1.0, 1.0] and label in {positive, neutral, negative}
    - Update `Feedback` record; broadcast `FeedbackAnalyzed` event to `private-branch.{branchId}`
    - On failure: retry up to 5 times at 60-second intervals; after 5 failures set `analysis_status = 'analysis_failed'`
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5, 10.6_

  - [~] 11.5 Write property tests for SentimentAnalysisJob (PHP/Eris, `sentiment.property.test.ts`)
    - **Property 24: Sentiment output validity** — generate random comment strings; assert score in [-1.0, 1.0] and label in {positive, neutral, negative}
    - **Property 25: Sentiment retry exhaustion** — generate job failure sequences; assert after exactly 5 failures `analysis_status = 'analysis_failed'`
    - **Validates: Requirements 10.3, 10.6**

  - [~] 11.6 Write unit tests for SentimentAnalysisJob
    - Test empty comment sets score=0.0, label='neutral', no AI call made
    - Test job queued and feedback submission returns 201 immediately
    - Test `FeedbackAnalyzed` event broadcast after successful analysis
    - _Requirements: 10.4, 10.5_

- [ ] 12. Post-Session Feedback Collection — frontend (SpaBooking)
  - [~] 12.1 Implement feedback prompt listener in SpaBooking (`app/composables/useFeedbackPrompt.ts`)
    - Subscribe to `private-customer.{customerId}` for session-completion feedback prompt events
    - Trigger display of feedback form modal on event receipt
    - _Requirements: 9.1, 9.2_

  - [~] 12.2 Implement `<FeedbackForm>` component in SpaBooking (`app/components/ai/FeedbackForm.vue`)
    - Star rating field (1–5) and free-text comment field (max 1000 characters)
    - Submit to `POST /api/feedback` with rating, comment, session_id, customer_id
    - Show error message when feedback window closed (422) or already submitted (409)
    - _Requirements: 9.2, 9.3, 9.5, 9.6, 9.7_

  - [~] 12.3 Write unit tests for FeedbackForm (SpaBooking)
    - Test form validation: rating required (1–5), comment max 1000 chars
    - Test error message shown on 422 (window closed) and 409 (duplicate)
    - _Requirements: 9.5, 9.7_

- [ ] 13. Sentiment Dashboard — backend
  - [~] 13.1 Implement `SentimentController` in Laravel
    - `GET /api/ai/sentiment/dashboard`: return average score, label distribution, time-series data; filter by branch, treatment, therapist, time period (7/30/90 days); manager role only
    - `GET /api/ai/sentiment/summary`: call OpenAI to generate ≤150-word summary of last 50 feedback records for the selected filter
    - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5, 11.6_

  - [~] 13.2 Write property tests for SentimentController (PHP/Eris, `sentiment.property.test.ts`)
    - **Property 26: Sentiment dashboard access control** — generate random staff roles; assert non-manager roles receive HTTP 403
    - **Property 27: Sentiment dashboard filter correctness** — generate random filter combinations and feedback datasets; assert all returned records match every active filter criterion
    - **Property 28: AI summary word count invariant** — generate random summary strings; assert word count is at most 150
    - **Property 29: Recent negative feedback correctness** — generate random feedback datasets with mixed labels; assert displayed records all have `sentiment_label = 'negative'` and are the 5 most recent by `submitted_at`
    - **Validates: Requirements 11.1, 11.3, 11.5, 11.6**

  - [~] 13.3 Write unit tests for SentimentController
    - Test 403 returned for non-manager staff
    - Test filter by branch, treatment, therapist returns only matching records
    - Test time-series data covers correct date range for each period option
    - _Requirements: 11.1, 11.3, 11.4_

- [ ] 14. Sentiment Dashboard — frontend (SpaCashier)
  - [~] 14.1 Implement `SentimentDashboard` page in SpaCashier (`src/app/dashboard/sentiment/page.tsx`)
    - Route protected by manager-role middleware
    - Fetch `GET /api/ai/sentiment/dashboard` via React Query with filter params
    - Display: average score, label distribution (positive/neutral/negative counts), time-series chart (Recharts), AI summary (max 150 words), top-5 recent negative feedback records
    - Filter controls: branch, treatment, therapist, time period (7/30/90 days)
    - Update all metrics within 3 seconds of filter change
    - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5, 11.6_

  - [~] 14.2 Implement real-time dashboard updates in SpaCashier
    - Subscribe to `private-branch.{branchId}` for `FeedbackAnalyzed` events via Laravel Echo
    - On event receipt, invalidate React Query cache for dashboard data to trigger re-fetch
    - Fall back to 30-second React Query refetch interval when WebSocket disconnects
    - _Requirements: 11.7_

  - [~] 14.3 Write unit tests for SentimentDashboard (SpaCashier)
    - Test dashboard renders average score, label distribution, time-series chart, AI summary, and negative feedback list
    - Test filter change triggers data re-fetch
    - Test real-time update invalidates cache on `FeedbackAnalyzed` event
    - Test manager-only route redirects non-manager staff
    - _Requirements: 11.1, 11.2, 11.3, 11.7_

- [~] 15. Checkpoint — Ensure all sentiment and feedback tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 16. Integration wiring and end-to-end validation
  - [~] 16.1 Wire `BookingObserver` to recommendation cache invalidation
    - On `Booking@created`, call `POST /api/ai/recommendations/invalidate/{customerId}` within 60 seconds
    - Verify cache key `rec:{customerId}:{branchId}` is cleared in Redis
    - _Requirements: 3.2_

  - [~] 16.2 Wire session completion event to feedback prompt
    - On `Session@completed`, broadcast feedback prompt event to `private-customer.{customerId}` via Reverb
    - Verify SpaBooking `useFeedbackPrompt` composable receives and surfaces the event
    - _Requirements: 9.1_

  - [~] 16.3 Configure Laravel Horizon queues
    - Define `sentiment-analysis` queue in Horizon config with retry delay of 60 seconds and max attempts of 5
    - Define `conflict-evaluation` queue for `EvaluateConflictJob`
    - _Requirements: 10.5, 10.6_

  - [~] 16.4 Configure private channel authorization in Laravel
    - Authorize `private-branch.{id}` for staff with matching branch assignment
    - Authorize `private-customer.{id}` for the authenticated customer with matching ID
    - _Requirements: 6.4, 7.1_

  - [~] 16.5 Write integration tests
    - Test recommendation response time is at most 2 seconds under realistic load
    - Test chatbot response time is at most 5 seconds
    - Test conflict evaluation completes within 3 seconds of booking event
    - Test conflict event broadcast reaches SpaCashier `private-branch` channel
    - Test rescheduling suggestion delivered to SpaBooking within 10 seconds of conflict detection
    - Test feedback prompt event triggered on session completion
    - Test sentiment analysis job queued and processed end-to-end
    - Test dashboard filter update renders within 3 seconds
    - Test real-time dashboard update on new `FeedbackAnalyzed` event
    - _Requirements: 1.4, 4.5, 6.3, 6.4, 7.5, 9.1, 10.2, 11.4, 11.7_

- [~] 17. Final checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for a faster MVP
- Each task references specific requirements for traceability
- Property tests use `fast-check` (TypeScript) and `eris` (PHP); each test runs a minimum of 100 iterations
- Tag each property test: `// Feature: spa-ai-features, Property {N}: {property_text}`
- Checkpoints ensure incremental validation after each major feature area
- Real-time fallback (30-second polling) applies to all WebSocket-dependent features in both apps
