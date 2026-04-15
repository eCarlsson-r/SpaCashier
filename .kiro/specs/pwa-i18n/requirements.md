# Requirements Document

## Introduction

This document defines requirements for making both **SpaCashier** (Next.js 16 / React 19) and **SpaBooking** (Nuxt 3 / Vue 3) offline-first Progressive Web Apps (PWA) with full internationalization (i18n) support.

**PWA scope**: Both apps must function fully offline — service workers cache assets and API responses, background sync queues writes made while offline, and IndexedDB stores pending operations. When connectivity is restored, queued operations sync automatically.

**i18n scope**: All static UI strings support English (`en`) and Indonesian (`id`). AI-generated dynamic content (treatment rationales, chatbot responses, sentiment summaries) is translated at runtime via the OpenAI API. Language preference is persisted per user.

**Libraries chosen**:
- SpaCashier: `next-intl` (i18n), `@ducanh2912/next-pwa` with Workbox (PWA)
- SpaBooking: `y18n` (y18n), `@vite-pwa/nuxt` (PWA)

---

## Glossary

- **SpaCashier**: The Next.js 16 / React 19 staff-facing operations portal (POS, session management, reporting, scheduling)
- **SpaBooking**: The Nuxt 3 / Vue 3 customer-facing booking portal
- **Backend_API**: The shared Laravel REST API consumed by both SpaCashier and SpaBooking
- **Service_Worker**: A browser-managed background script that intercepts network requests, serves cached responses, and queues offline writes
- **Workbox**: The Google-maintained library used by both `@ducanh2912/next-pwa` and `@vite-pwa/nuxt` to configure caching strategies and background sync
- **IndexedDB**: The browser's built-in structured storage database used to persist offline operation queues
- **Background_Sync**: A Service_Worker API that replays queued network requests when connectivity is restored
- **Offline_Queue**: The IndexedDB-backed store of write operations (POST/PUT/PATCH/DELETE) that were initiated while the device had no network connectivity
- **Cache_Storage**: The browser's Service_Worker cache used to store pre-fetched assets and API responses for offline serving
- **App_Shell**: The minimal set of HTML, CSS, and JavaScript assets required to render the application UI without a network connection
- **i18n**: Internationalization — the process of designing the app so UI strings can be displayed in multiple languages
- **Locale**: A language/region identifier (`en` for English, `id` for Indonesian)
- **Translation_Catalog**: The static JSON/YAML files containing all UI string translations keyed by message ID
- **AI_Translation_Service**: The OpenAI-backed Laravel service that translates AI-generated dynamic content (rationales, chatbot responses, sentiment summaries) into the user's active Locale
- **next-intl**: The i18n library used in SpaCashier for locale routing, message loading, and string formatting
- **nuxtjs/i18n**: The i18n module used in SpaBooking for locale routing, message loading, and string formatting
- **Staff**: An authenticated employee using SpaCashier (cashier, therapist, or manager role)
- **Customer**: An authenticated end-user of SpaBooking
- **PWA_Manifest**: The `manifest.json` (or `manifest.webmanifest`) file that enables browser install prompts and defines app metadata (name, icons, theme color, display mode)
- **Install_Prompt**: The browser-native UI that invites the user to add the app to their home screen or desktop
- **Precache**: The Workbox mechanism that downloads and caches a defined list of assets at Service_Worker install time
- **Runtime_Cache**: A Workbox caching strategy applied to network requests at runtime (as opposed to precache)
- **Stale-While-Revalidate**: A Runtime_Cache strategy that serves a cached response immediately while fetching a fresh copy in the background
- **Network-First**: A Runtime_Cache strategy that attempts the network first and falls back to cache on failure
- **Cache-First**: A Runtime_Cache strategy that serves from cache and only fetches from the network on a cache miss

---

## Requirements

---

### Requirement 1: Service Worker Registration and Lifecycle

**User Story:** As a Staff member or Customer, I want the app to register a service worker automatically, so that offline capabilities are available without any manual setup.

#### Acceptance Criteria

1. WHEN SpaCashier is loaded in a browser that supports Service Workers, THE Service_Worker SHALL be registered automatically without requiring any user action.
2. WHEN SpaBooking is loaded in a browser that supports Service Workers, THE Service_Worker SHALL be registered automatically without requiring any user action.
3. WHEN a new version of SpaCashier is deployed, THE Service_Worker SHALL detect the update, install the new version in the background, and notify the Staff member that a refresh is available.
4. WHEN a new version of SpaBooking is deployed, THE Service_Worker SHALL detect the update, install the new version in the background, and notify the Customer that a refresh is available.
5. IF a browser does not support Service Workers, THEN THE SpaCashier SHALL continue to function as a standard web application without offline capabilities.
6. IF a browser does not support Service Workers, THEN THE SpaBooking SHALL continue to function as a standard web application without offline capabilities.

---

### Requirement 2: App Shell and Asset Precaching

**User Story:** As a Staff member or Customer, I want the app to load instantly even without a network connection, so that I can begin working immediately regardless of connectivity.

#### Acceptance Criteria

1. THE Service_Worker for SpaCashier SHALL precache the App_Shell assets (HTML entry point, compiled JS bundles, CSS, fonts, and icons) at install time.
2. THE Service_Worker for SpaBooking SHALL precache the App_Shell assets (HTML entry point, compiled JS bundles, CSS, fonts, and icons) at install time.
3. WHEN a Staff member opens SpaCashier with no network connection, THE Service_Worker SHALL serve the App_Shell from Cache_Storage and render the application UI within 3 seconds.
4. WHEN a Customer opens SpaBooking with no network connection, THE Service_Worker SHALL serve the App_Shell from Cache_Storage and render the application UI within 3 seconds.
5. THE Service_Worker for SpaCashier SHALL use a Cache-First strategy for all static assets (JS, CSS, fonts, images) with a maximum cache age of 30 days.
6. THE Service_Worker for SpaBooking SHALL use a Cache-First strategy for all static assets (JS, CSS, fonts, images) with a maximum cache age of 30 days.

---

### Requirement 3: API Response Caching

**User Story:** As a Staff member or Customer, I want the app to display previously loaded data when offline, so that I can view and reference information even without connectivity.

#### Acceptance Criteria

1. THE Service_Worker for SpaCashier SHALL apply a Network-First strategy with a 5-second timeout to all GET requests to the Backend_API, falling back to the cached response on network failure.
2. THE Service_Worker for SpaBooking SHALL apply a Network-First strategy with a 5-second timeout to all GET requests to the Backend_API, falling back to the cached response on network failure.
3. THE Service_Worker for SpaCashier SHALL cache GET API responses with a maximum of 100 entries and a maximum cache age of 24 hours per entry.
4. THE Service_Worker for SpaBooking SHALL cache GET API responses with a maximum of 100 entries and a maximum cache age of 24 hours per entry.
5. WHILE SpaCashier is offline, THE SpaCashier SHALL display a visible offline indicator banner to the Staff member.
6. WHILE SpaBooking is offline, THE SpaBooking SHALL display a visible offline indicator banner to the Customer.
7. WHEN SpaCashier transitions from offline to online, THE SpaCashier SHALL remove the offline indicator banner and trigger Background_Sync to flush the Offline_Queue.
8. WHEN SpaBooking transitions from offline to online, THE SpaBooking SHALL remove the offline indicator banner and trigger Background_Sync to flush the Offline_Queue.

---

### Requirement 4: Offline Write Queuing (Background Sync)

**User Story:** As a Staff member or Customer, I want write operations I perform while offline to be saved and automatically submitted when connectivity returns, so that my work is never lost.

#### Acceptance Criteria

1. WHEN a Staff member submits a write operation (POST, PUT, PATCH, or DELETE) to the Backend_API while SpaCashier is offline, THE Service_Worker SHALL store the request in the Offline_Queue using IndexedDB.
2. WHEN a Customer submits a write operation (POST, PUT, PATCH, or DELETE) to the Backend_API while SpaBooking is offline, THE Service_Worker SHALL store the request in the Offline_Queue using IndexedDB.
3. WHEN SpaCashier regains network connectivity, THE Service_Worker SHALL replay all requests in the Offline_Queue to the Backend_API in the order they were queued.
4. WHEN SpaBooking regains network connectivity, THE Service_Worker SHALL replay all requests in the Offline_Queue to the Backend_API in the order they were queued.
5. WHEN a queued request is successfully replayed, THE Service_Worker SHALL remove it from the Offline_Queue and THE SpaCashier SHALL display a confirmation notification to the Staff member.
6. WHEN a queued request is successfully replayed, THE Service_Worker SHALL remove it from the Offline_Queue and THE SpaBooking SHALL display a confirmation notification to the Customer.
7. IF a replayed request returns a 4xx error from the Backend_API, THEN THE Service_Worker SHALL remove it from the Offline_Queue and THE SpaCashier SHALL display an error notification to the Staff member with the failed operation details.
8. IF a replayed request returns a 4xx error from the Backend_API, THEN THE Service_Worker SHALL remove it from the Offline_Queue and THE SpaBooking SHALL display an error notification to the Customer with the failed operation details.
9. THE SpaCashier SHALL display the count of pending Offline_Queue operations to the Staff member while offline.
10. THE SpaBooking SHALL display the count of pending Offline_Queue operations to the Customer while offline.

---

### Requirement 5: PWA Installability

**User Story:** As a Staff member or Customer, I want to install the app on my device, so that I can access it from my home screen or desktop like a native application.

#### Acceptance Criteria

1. THE SpaCashier SHALL provide a valid PWA_Manifest with app name, short name, description, start URL, display mode (`standalone`), theme color, background color, and icons in sizes 192×192 and 512×512.
2. THE SpaBooking SHALL provide a valid PWA_Manifest with app name, short name, description, start URL, display mode (`standalone`), theme color, background color, and icons in sizes 192×192 and 512×512.
3. WHEN a browser determines SpaCashier meets PWA installability criteria, THE SpaCashier SHALL display an Install_Prompt to the Staff member.
4. WHEN a browser determines SpaBooking meets PWA installability criteria, THE SpaBooking SHALL display an Install_Prompt to the Customer.
5. WHEN a Staff member accepts the Install_Prompt, THE SpaCashier SHALL be added to the device's home screen or application launcher.
6. WHEN a Customer accepts the Install_Prompt, THE SpaBooking SHALL be added to the device's home screen or application launcher.
7. WHEN a Staff member dismisses the Install_Prompt, THE SpaCashier SHALL not display the Install_Prompt again for a minimum of 7 days.
8. WHEN a Customer dismisses the Install_Prompt, THE SpaBooking SHALL not display the Install_Prompt again for a minimum of 7 days.

---

### Requirement 6: Static UI String Internationalization (SpaCashier)

**User Story:** As a Staff member, I want to use SpaCashier in my preferred language (English or Indonesian), so that I can operate the system comfortably in my native language.

#### Acceptance Criteria

1. THE SpaCashier SHALL support two locales: `en` (English) and `id` (Indonesian).
2. THE next-intl SHALL load the Translation_Catalog for the active Locale at application startup.
3. THE SpaCashier SHALL render all static UI strings — including navigation labels, button text, form labels, validation messages, table headers, and status labels — using translations from the active Locale's Translation_Catalog.
4. WHEN a Staff member selects a different Locale from the language switcher, THE SpaCashier SHALL re-render all static UI strings in the selected Locale without a full page reload.
5. THE SpaCashier SHALL persist the Staff member's Locale preference in browser local storage and restore it on subsequent visits.
6. IF no persisted Locale preference exists, THEN THE SpaCashier SHALL default to the `en` Locale.
7. THE next-intl SHALL format dates, times, and numbers according to the conventions of the active Locale.
8. THE SpaCashier SHALL include a language switcher component accessible from the main navigation or user settings menu.

---

### Requirement 7: Static UI String Internationalization (SpaBooking)

**User Story:** As a Customer, I want to use SpaBooking in my preferred language (English or Indonesian), so that I can browse and book treatments comfortably in my native language.

#### Acceptance Criteria

1. THE SpaBooking SHALL support two locales: `en` (English) and `id` (Indonesian).
2. THE nuxtjs/i18n SHALL load the Translation_Catalog for the active Locale at application startup.
3. THE SpaBooking SHALL render all static UI strings — including navigation labels, button text, form labels, validation messages, and status labels — using translations from the active Locale's Translation_Catalog.
4. WHEN a Customer selects a different Locale from the language switcher, THE SpaBooking SHALL re-render all static UI strings in the selected Locale without a full page reload.
5. THE SpaBooking SHALL persist the Customer's Locale preference in a browser cookie and restore it on subsequent visits.
6. IF no persisted Locale preference exists, THEN THE SpaBooking SHALL default to the `en` Locale.
7. THE nuxtjs/i18n SHALL format dates, times, and numbers according to the conventions of the active Locale.
8. THE SpaBooking SHALL include a language switcher component accessible from the main navigation.
9. THE nuxtjs/i18n SHALL generate locale-prefixed URL routes (e.g., `/en/bookings`, `/id/bookings`) for all pages.

---

### Requirement 8: AI-Generated Content Translation

**User Story:** As a Staff member or Customer, I want AI-generated content (treatment rationales, chatbot responses, sentiment summaries) to appear in my active language, so that the full app experience is consistent in my chosen locale.

#### Acceptance Criteria

1. WHEN the Backend_API generates AI content (treatment rationale, chatbot response, or sentiment summary) and the requesting user's active Locale is `id`, THE AI_Translation_Service SHALL translate the content from English to Indonesian before returning it to the client.
2. WHEN the requesting user's active Locale is `en`, THE AI_Translation_Service SHALL return the AI-generated content in English without invoking a translation step.
3. THE AI_Translation_Service SHALL complete translation within 3 seconds of receiving the source content.
4. IF the AI_Translation_Service is unavailable, THEN THE Backend_API SHALL return the original English content as a fallback without surfacing a translation error to the user.
5. THE Backend_API SHALL accept the user's active Locale as a request parameter (e.g., `Accept-Language` header or `locale` query parameter) and pass it to the AI_Translation_Service.
6. THE AI_Translation_Service SHALL preserve formatting, treatment names, numeric values, and proper nouns during translation.

---

### Requirement 9: Translation Catalog Completeness and Maintenance

**User Story:** As a developer, I want all UI strings to be externalized into translation catalogs, so that adding or updating translations does not require code changes.

#### Acceptance Criteria

1. THE SpaCashier Translation_Catalog SHALL contain entries for every user-visible static string in the application, with no hardcoded UI strings remaining in component source files.
2. THE SpaBooking Translation_Catalog SHALL contain entries for every user-visible static string in the application, with no hardcoded UI strings remaining in component source files.
3. THE SpaCashier Translation_Catalog SHALL provide both `en` and `id` entries for every message ID, with no missing keys in either locale.
4. THE SpaBooking Translation_Catalog SHALL provide both `en` and `id` entries for every message ID, with no missing keys in either locale.
5. WHEN a Translation_Catalog key is missing for the active Locale, THE next-intl SHALL fall back to the `en` Locale value and THE SpaCashier SHALL log a warning to the browser console.
6. WHEN a Translation_Catalog key is missing for the active Locale, THE nuxtjs/i18n SHALL fall back to the `en` Locale value and THE SpaBooking SHALL log a warning to the browser console.

---

### Requirement 10: Offline Indicator and User Feedback

**User Story:** As a Staff member or Customer, I want clear visual feedback about my connectivity status and the state of any pending offline operations, so that I understand what data may not yet be synced.

#### Acceptance Criteria

1. WHILE SpaCashier is offline, THE SpaCashier SHALL display a persistent banner or status indicator showing the offline state and the count of operations pending in the Offline_Queue.
2. WHILE SpaBooking is offline, THE SpaBooking SHALL display a persistent banner or status indicator showing the offline state and the count of operations pending in the Offline_Queue.
3. WHEN SpaCashier transitions from offline to online and the Offline_Queue is empty, THE SpaCashier SHALL display a "back online" notification to the Staff member for a minimum of 3 seconds.
4. WHEN SpaBooking transitions from offline to online and the Offline_Queue is empty, THE SpaBooking SHALL display a "back online" notification to the Customer for a minimum of 3 seconds.
5. THE offline indicator and sync notifications in SpaCashier SHALL use translated strings from the active Locale's Translation_Catalog.
6. THE offline indicator and sync notifications in SpaBooking SHALL use translated strings from the active Locale's Translation_Catalog.

---

### Requirement 11: PWA and i18n Integration

**User Story:** As a Staff member or Customer, I want the installed PWA to respect my language preference, so that the app opens in my chosen locale when launched from the home screen.

#### Acceptance Criteria

1. WHEN SpaCashier is launched from the home screen as an installed PWA, THE SpaCashier SHALL restore the Staff member's persisted Locale preference and render the UI in that Locale.
2. WHEN SpaBooking is launched from the home screen as an installed PWA, THE SpaBooking SHALL restore the Customer's persisted Locale preference and render the UI in that Locale.
3. THE PWA_Manifest for SpaCashier SHALL use the `en` locale name and description as the default, with the `id` locale name available as an alternate.
4. THE Service_Worker for SpaCashier SHALL precache Translation_Catalog files for both `en` and `id` locales so that locale switching works fully offline.
5. THE Service_Worker for SpaBooking SHALL precache Translation_Catalog files for both `en` and `id` locales so that locale switching works fully offline.
6. WHEN a Staff member switches locale while SpaCashier is offline, THE SpaCashier SHALL apply the new locale immediately using the precached Translation_Catalog without requiring a network request.
7. WHEN a Customer switches locale while SpaBooking is offline, THE SpaBooking SHALL apply the new locale immediately using the precached Translation_Catalog without requiring a network request.
