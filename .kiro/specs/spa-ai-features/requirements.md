# Requirements Document

## Introduction

This document defines requirements for four AI-powered features spanning two spa management applications:

- **SpaCashier** — Next.js staff operations portal (POS, session management, reporting, scheduling)
- **SpaBooking** — Nuxt 3 customer-facing booking portal

Both apps share a **Laravel backend API** with **Pusher/Laravel Echo** for real-time synchronization. The AI features are:

1. **Smart Treatment Recommendations** — personalized treatment suggestions based on booking history
2. **Intelligent Booking Assistant (Chatbot)** — natural-language booking and query interface
3. **Session & Booking Conflict Resolution** — AI-detected scheduling conflicts with proactive rescheduling
4. **Customer Sentiment & Feedback Analysis** — post-session free-text feedback with AI-summarized sentiment dashboard

---

## Glossary

- **AI_Engine**: The backend AI/ML service (Laravel-hosted or external, e.g., OpenAI API) that processes requests and returns AI-generated responses
- **Recommendation_Service**: The AI_Engine component responsible for generating treatment recommendations
- **Chatbot_Service**: The AI_Engine component responsible for processing natural-language chat messages
- **Conflict_Resolver**: The AI_Engine component responsible for detecting and resolving scheduling conflicts
- **Sentiment_Analyzer**: The AI_Engine component responsible for analyzing customer feedback text
- **SpaCashier**: The Next.js staff-facing operations portal
- **SpaBooking**: The Nuxt 3 customer-facing booking portal
- **Backend_API**: The shared Laravel REST API consumed by both SpaCashier and SpaBooking
- **Realtime_Bus**: The Pusher/Laravel Echo channel infrastructure used for real-time event broadcasting
- **Customer**: An authenticated end-user of SpaBooking
- **Staff**: An authenticated employee using SpaCashier (cashier, therapist, or manager role)
- **Manager**: A Staff member with the manager role who has access to analytics and dashboards
- **Booking**: A scheduled spa session record containing customer, treatment, therapist, room, date, and time
- **Session**: An active or completed spa service instance linked to a Booking
- **Treatment**: A spa service offering (e.g., massage, facial) available for booking
- **Therapist**: A Staff member who delivers treatments
- **Conflict**: A scheduling overlap where a Therapist, room, or resource is double-booked
- **Sentiment_Score**: A numeric value between -1.0 and 1.0 representing the emotional tone of a feedback text
- **Sentiment_Label**: A categorical classification of feedback tone: `positive`, `neutral`, or `negative`
- **Feedback**: A post-session free-text review submitted by a Customer in SpaBooking

---

## Requirements

---

### Requirement 1: Treatment Recommendation Generation

**User Story:** As a Customer, I want to receive personalized treatment suggestions based on my booking history, so that I can discover treatments suited to my preferences without manual browsing.

#### Acceptance Criteria

1. WHEN a Customer views the SpaBooking catalog or booking flow, THE Recommendation_Service SHALL return a ranked list of up to 5 recommended Treatments for that Customer.
2. THE Recommendation_Service SHALL base recommendations on the Customer's past Booking records, including treatment type, frequency, and recency.
3. WHEN a Customer has fewer than 3 prior Bookings, THE Recommendation_Service SHALL supplement history-based recommendations with globally popular Treatments at the Customer's preferred branch.
4. THE Recommendation_Service SHALL return recommendations within 2 seconds of receiving a request from the Backend_API.
5. IF the Recommendation_Service is unavailable, THEN THE Backend_API SHALL return the globally popular Treatments as a fallback response without surfacing an error to the Customer.
6. THE Recommendation_Service SHALL exclude Treatments that are currently unavailable or out of service at the Customer's selected branch.

---

### Requirement 2: Treatment Recommendations at POS (SpaCashier)

**User Story:** As a Staff member at the POS, I want to see AI-recommended treatments for the current customer, so that I can make informed upsell suggestions during check-in or checkout.

#### Acceptance Criteria

1. WHEN a Staff member opens a customer's profile or initiates a sale in SpaCashier, THE Recommendation_Service SHALL provide up to 3 recommended Treatments for that Customer.
2. THE Recommendation_Service SHALL return POS recommendations within 2 seconds of the Staff member loading the customer context.
3. IF the Customer has no prior Booking history, THEN THE Recommendation_Service SHALL return the top 3 Treatments by booking frequency at the current branch.
4. THE SpaCashier SHALL display each recommended Treatment with its name, duration, price, and a brief AI-generated rationale (maximum 20 words).
5. IF the Recommendation_Service is unavailable, THEN THE SpaCashier SHALL hide the recommendation panel without displaying an error to the Staff member.

---

### Requirement 3: Recommendation Data Freshness

**User Story:** As a system operator, I want recommendations to reflect recent booking activity, so that suggestions remain relevant as customer preferences evolve.

#### Acceptance Criteria

1. THE Recommendation_Service SHALL incorporate Booking records created or updated within the last 90 days when computing recommendations.
2. WHEN a Customer completes a new Booking, THE Backend_API SHALL notify the Recommendation_Service to invalidate and refresh that Customer's cached recommendations within 60 seconds.
3. THE Recommendation_Service SHALL cache recommendation results per Customer for a maximum of 24 hours.

---

### Requirement 4: Customer-Facing Booking Chatbot (SpaBooking)

**User Story:** As a Customer, I want to describe what I want in natural language (e.g., "book me something relaxing on Saturday"), so that I can complete a booking without navigating multiple form steps.

#### Acceptance Criteria

1. THE SpaBooking SHALL provide a persistent chat interface accessible from all pages for authenticated Customers.
2. WHEN a Customer submits a natural-language booking request, THE Chatbot_Service SHALL extract intent, preferred date/time, treatment type, and branch from the message.
3. WHEN the Chatbot_Service successfully extracts a complete booking intent, THE SpaBooking SHALL pre-populate the booking flow with the extracted parameters and present it to the Customer for confirmation.
4. WHEN the Chatbot_Service cannot extract a required booking parameter, THE Chatbot_Service SHALL respond with a clarifying question identifying the missing parameter.
5. THE Chatbot_Service SHALL respond to each Customer message within 5 seconds.
6. IF the Chatbot_Service is unavailable, THEN THE SpaBooking SHALL display a message informing the Customer that the assistant is temporarily unavailable and SHALL provide a direct link to the manual booking flow.
7. THE Chatbot_Service SHALL retain conversation context for a minimum of 10 consecutive messages within a single session.
8. THE SpaBooking SHALL display a typing indicator while the Chatbot_Service is processing a response.

---

### Requirement 5: Staff-Facing Operations Chatbot (SpaCashier)

**User Story:** As a Staff member, I want to query operational data using natural language (e.g., "what's this week's revenue?"), so that I can retrieve insights without navigating multiple report screens.

#### Acceptance Criteria

1. THE SpaCashier SHALL provide a chat interface accessible to authenticated Staff members from the dashboard.
2. WHEN a Staff member submits a natural-language query, THE Chatbot_Service SHALL classify the intent as one of: revenue query, booking query, staff query, or session query.
3. WHEN the Chatbot_Service classifies a query intent, THE Backend_API SHALL execute the corresponding data retrieval and return results to the Chatbot_Service for formatting.
4. THE Chatbot_Service SHALL respond with a structured answer including the queried value, the time period, and the branch scope within 5 seconds.
5. THE Chatbot_Service SHALL restrict data access based on the authenticated Staff member's role and branch assignment, returning only data the Staff member is authorized to view.
6. IF a Staff member's query references data outside their authorization scope, THEN THE Chatbot_Service SHALL respond with a message stating the data is not accessible for their role.
7. IF the Chatbot_Service is unavailable, THEN THE SpaCashier SHALL display a message informing the Staff member that the assistant is temporarily unavailable.
8. THE SpaCashier SHALL display a typing indicator while the Chatbot_Service is processing a Staff member's query.

---

### Requirement 6: Scheduling Conflict Detection

**User Story:** As a Staff member managing bookings, I want the system to automatically detect scheduling conflicts, so that double-bookings are identified before they cause service disruptions.

#### Acceptance Criteria

1. WHEN a new Booking is created or an existing Booking is modified via the Backend_API, THE Conflict_Resolver SHALL evaluate the Booking against all existing Bookings for the same Therapist, room, and time window.
2. THE Conflict_Resolver SHALL identify a Conflict when a Therapist or room is assigned to overlapping time windows across two or more Bookings.
3. THE Conflict_Resolver SHALL complete conflict evaluation within 3 seconds of receiving a Booking creation or modification event.
4. WHEN a Conflict is detected, THE Backend_API SHALL broadcast a conflict event on the Realtime_Bus to the SpaCashier channel for the affected branch.
5. WHEN a conflict event is received, THE SpaCashier SHALL display a conflict alert to Staff members at the affected branch identifying the conflicting Bookings, the affected Therapist or room, and the overlapping time window.
6. THE Conflict_Resolver SHALL generate up to 3 alternative Booking time slots for each conflicting Booking, based on Therapist and room availability within the same day.
7. IF no alternative slots are available on the same day, THEN THE Conflict_Resolver SHALL generate alternative slots within the next 3 calendar days.

---

### Requirement 7: Proactive Rescheduling Suggestions to Customers

**User Story:** As a Customer with a conflicting booking, I want to receive proactive rescheduling suggestions in real time, so that I can resolve the conflict without contacting the spa.

#### Acceptance Criteria

1. WHEN a Conflict is detected for a Booking belonging to a Customer, THE Backend_API SHALL broadcast a rescheduling suggestion event on the Realtime_Bus to the SpaBooking channel for that Customer.
2. WHEN a rescheduling suggestion event is received, THE SpaBooking SHALL display a notification to the affected Customer presenting the conflict reason and the available alternative slots.
3. WHEN a Customer selects an alternative slot from the rescheduling notification, THE SpaBooking SHALL submit the reschedule request to the Backend_API and confirm the new Booking to the Customer.
4. WHEN a Customer dismisses the rescheduling notification, THE SpaBooking SHALL record the dismissal and SHALL NOT re-display the same suggestion.
5. THE SpaBooking SHALL deliver the rescheduling notification within 10 seconds of the Conflict being detected by the Conflict_Resolver.
6. IF a Customer is not currently active in SpaBooking when a conflict event is broadcast, THEN THE Backend_API SHALL persist the rescheduling suggestion and THE SpaBooking SHALL display it upon the Customer's next authenticated session.

---

### Requirement 8: Conflict Resolution Audit Trail

**User Story:** As a Manager, I want a record of all detected conflicts and their resolutions, so that I can identify recurring scheduling problems and improve operations.

#### Acceptance Criteria

1. THE Backend_API SHALL persist each detected Conflict record including: affected Booking identifiers, conflict type (Therapist or room), detection timestamp, and resolution status.
2. WHEN a Customer accepts or dismisses a rescheduling suggestion, THE Backend_API SHALL update the Conflict record with the resolution action and timestamp.
3. THE SpaCashier SHALL provide a conflict history view accessible to Manager-role Staff, displaying all Conflict records for their branch filtered by date range.

---

### Requirement 9: Post-Session Feedback Collection

**User Story:** As a Customer, I want to submit free-text feedback after my session, so that I can share my experience and help the spa improve its services.

#### Acceptance Criteria

1. WHEN a Session is marked as completed in the Backend_API, THE Backend_API SHALL trigger a feedback prompt event on the Realtime_Bus to the SpaBooking channel for the associated Customer.
2. WHEN a feedback prompt event is received, THE SpaBooking SHALL display a feedback form to the Customer containing a star rating field (1–5) and a free-text comment field (maximum 1000 characters).
3. WHEN a Customer submits the feedback form, THE SpaBooking SHALL transmit the rating, free-text comment, Session identifier, and Customer identifier to the Backend_API.
4. THE Backend_API SHALL accept feedback submissions within 48 hours of the Session completion timestamp.
5. IF a Customer submits feedback after the 48-hour window, THEN THE Backend_API SHALL reject the submission and THE SpaBooking SHALL display a message informing the Customer that the feedback window has closed.
6. THE SpaBooking SHALL allow each Customer to submit exactly one Feedback record per Session.
7. IF a Customer attempts to submit a second Feedback for the same Session, THEN THE Backend_API SHALL reject the duplicate submission and THE SpaBooking SHALL display a message confirming that feedback was already received.

---

### Requirement 10: AI Sentiment Analysis of Feedback

**User Story:** As a Manager, I want submitted feedback to be automatically analyzed for sentiment, so that I can quickly understand customer satisfaction trends without reading every comment.

#### Acceptance Criteria

1. WHEN a Feedback record is persisted by the Backend_API, THE Sentiment_Analyzer SHALL process the free-text comment and assign a Sentiment_Score and Sentiment_Label to the Feedback record.
2. THE Sentiment_Analyzer SHALL complete sentiment analysis within 10 seconds of receiving a Feedback record.
3. THE Sentiment_Analyzer SHALL produce a Sentiment_Score in the range [-1.0, 1.0] and a Sentiment_Label of `positive`, `neutral`, or `negative` for every non-empty free-text comment.
4. WHEN a Feedback record contains an empty free-text comment, THE Sentiment_Analyzer SHALL assign a Sentiment_Score of 0.0 and a Sentiment_Label of `neutral` without invoking the AI_Engine.
5. IF the Sentiment_Analyzer is unavailable when a Feedback record is created, THEN THE Backend_API SHALL queue the Feedback record for retry analysis and SHALL NOT block the feedback submission response to the Customer.
6. THE Backend_API SHALL retry queued sentiment analysis jobs at intervals of 60 seconds for a maximum of 5 attempts before marking the Feedback record as `analysis_failed`.

---

### Requirement 11: Sentiment Dashboard for Managers (SpaCashier)

**User Story:** As a Manager, I want a sentiment analytics dashboard in SpaCashier, so that I can monitor customer satisfaction trends across treatments, therapists, and time periods.

#### Acceptance Criteria

1. THE SpaCashier SHALL provide a sentiment dashboard accessible exclusively to Manager-role Staff.
2. THE SpaCashier sentiment dashboard SHALL display: overall Sentiment_Score average, Sentiment_Label distribution (count of positive, neutral, negative), and a time-series chart of average Sentiment_Score over selectable periods (7 days, 30 days, 90 days).
3. THE SpaCashier sentiment dashboard SHALL allow Managers to filter sentiment data by branch, Treatment, and Therapist.
4. WHEN a Manager applies a filter, THE SpaCashier SHALL update all dashboard metrics and charts within 3 seconds.
5. THE SpaCashier sentiment dashboard SHALL display the AI-generated summary of the most recent 50 Feedback records for the selected filter, produced by the Sentiment_Analyzer, in a maximum of 150 words.
6. THE SpaCashier sentiment dashboard SHALL surface the 5 most recent Feedback records with a Sentiment_Label of `negative` for the selected filter, displaying the Customer's first name, Treatment name, Sentiment_Score, and verbatim comment.
7. WHILE a Manager is viewing the sentiment dashboard, THE SpaCashier SHALL update the dashboard metrics in real time when new Feedback records with completed sentiment analysis are received via the Realtime_Bus.
