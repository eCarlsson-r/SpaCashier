# Implementation Plan: PWA + i18n (SpaCashier & SpaBooking)

## Overview

Incremental implementation of offline-first PWA capabilities and full English/Indonesian internationalization across SpaCashier (Next.js 16 / React 19) and SpaBooking (Nuxt 3 / Vue 3), with AI-generated content translation via the Laravel backend. Tasks are ordered so each step builds on the previous, ending with full integration and wiring.

## Tasks

- [x] 1. Install dependencies and configure PWA for SpaCashier
  - Install `@ducanh2912/next-pwa` and `next-intl` packages
  - Update `SpaCashier/next.config.ts` to wrap with `withPWA`, configure Workbox with Cache-First for static assets (30-day TTL), NetworkFirst for API GET requests (5s timeout, 100 entries, 24h TTL), and `additionalManifestEntries` for `en.json` and `id.json` translation catalogs
  - Create `SpaCashier/public/manifest.json` with name, short_name, description, start_url, display: standalone, theme_color, background_color, and icons at 192×192 and 512×512 (the existing `src/app/manifest.ts` route handler can be removed or kept alongside)
  - _Requirements: 1.1, 2.1, 2.5, 3.1, 3.3, 5.1, 11.4_

- [x] 2. Install dependencies and configure PWA for SpaBooking
  - Install `@vite-pwa/nuxt` and `@nuxtjs/i18n` packages
  - Update `SpaBooking/nuxt.config.ts` to add `@vite-pwa/nuxt` module with manifest (name, short_name, description, start_url, display: standalone, theme_color, background_color, icons 192×192 and 512×512), Workbox Cache-First for static assets, NetworkFirst for API GET requests, and `additionalManifestEntries` for `en.json` and `id.json`
  - _Requirements: 1.2, 2.2, 2.6, 3.2, 3.4, 5.2, 11.5_

- [x] 3. Set up i18n for SpaCashier with next-intl
  - Create `SpaCashier/src/messages/en.json` and `SpaCashier/src/messages/id.json` with keys for all existing UI strings: navigation labels, button text, form labels, validation messages, table headers, status labels, offline banner, sync notifications, and PWA install prompt strings
  - Create `SpaCashier/src/i18n/routing.ts` with `defineRouting({ locales: ['en', 'id'], defaultLocale: 'en' })`
  - Create `SpaCashier/src/i18n/request.ts` with `getRequestConfig` that loads messages for the active locale
  - Create `SpaCashier/src/providers/locale-provider.tsx` — a client-side `LocaleProvider` that reads locale from `localStorage` key `spa-locale`, defaults to `en`, exposes `switchLocale`, and wraps children in `NextIntlClientProvider`
  - Add `LocaleProvider` to `SpaCashier/src/app/layout.tsx`
  - _Requirements: 6.1, 6.2, 6.3, 6.5, 6.6, 9.1, 9.3_

- [x] 4. Set up i18n for SpaBooking with @nuxtjs/i18n
  - Create `SpaBooking/app/i18n/locales/en.json` and `SpaBooking/app/i18n/locales/id.json` with keys for all existing UI strings: navigation labels, button text, form labels, validation messages, status labels, offline banner, sync notifications, and PWA install prompt strings
  - Update `SpaBooking/nuxt.config.ts` to add `@nuxtjs/i18n` module with `locales`, `defaultLocale: 'en'`, `langDir: 'i18n/locales/'`, `strategy: 'prefix'`, and `detectBrowserLanguage` using cookie key `spa-locale` with fallback `en`
  - _Requirements: 7.1, 7.2, 7.3, 7.5, 7.6, 7.9, 9.2, 9.4_

- [x] 5. Checkpoint — Ensure PWA config and i18n setup build without errors
  - Ensure all tests pass, ask the user if questions arise.

- [x] 6. Implement IndexedDB offline queue module (shared)
  - Create `SpaCashier/src/lib/offlineQueue.ts` implementing `OfflineQueueManager` interface: `enqueue`, `getPending` (ordered by `enqueuedAt` ASC), `markSyncing`, `remove`, `markFailed`, `count` — backed by IndexedDB database `spa-offline-queue`, object store `operations`, with indexes on `enqueuedAt` and `status`
  - Add `Locale`, `QueuedOperation`, `SyncResult`, and `InstallPromptState` TypeScript types to `SpaCashier/src/lib/types.ts`
  - Create `SpaBooking/app/utils/offlineQueue.ts` with the same `OfflineQueueManager` interface and IndexedDB schema
  - _Requirements: 4.1, 4.2, 4.3, 4.4_

  - [x] 6.1 Write property test for offline write operation structure (SpaCashier)
    - **Property 1: Offline write operations are stored with correct structure**
    - **Validates: Requirements 4.1, 4.2**

  - [x] 6.2 Write property test for FIFO ordering (SpaCashier)
    - **Property 2: Offline queue preserves FIFO ordering**
    - **Validates: Requirements 4.3, 4.4**

  - [x] 6.3 Write property test for successful sync clears queue (SpaCashier)
    - **Property 3: Successful sync removes operation from queue**
    - **Validates: Requirements 4.5**

  - [x] 6.4 Write property test for 4xx error removes operation (SpaCashier)
    - **Property 4: 4xx sync errors remove the operation from queue**
    - **Validates: Requirements 4.7, 4.8**

- [x] 7. Implement service worker fetch interception for SpaCashier
  - Create `SpaCashier/src/sw-custom.ts` (injected via Workbox `injectManifest`) that intercepts POST/PUT/PATCH/DELETE requests: when offline, enqueues via `offlineQueue` and returns a synthetic `202 Accepted` response; when online, passes through directly
  - Implement `serializeRequest` helper to extract method, URL, headers, and body from a `Request`
  - _Requirements: 4.1, 4.3_

- [x] 8. Implement service worker fetch interception for SpaBooking
  - Create `SpaBooking/app/sw-custom.ts` with the same write-interception logic as SpaCashier, adapted for the Nuxt/Vite PWA plugin's `injectManifest` mode
  - _Requirements: 4.2, 4.4_

- [x] 9. Implement PWAProvider and offline queue hook for SpaCashier
  - Extend `SpaCashier/src/components/pwa/PWAManager.tsx` — add `isOnline`, `pendingCount`, `showUpdatePrompt`, and `applyUpdate` to `PWAContextType`; listen to `online`/`offline` window events; poll `offlineQueue.count()` reactively; detect waiting service worker and expose `showUpdatePrompt`
  - Create `SpaCashier/src/hooks/useOfflineQueue.ts` that wraps `offlineQueue` and exposes reactive `pendingCount`, `enqueue`, and `flush`
  - _Requirements: 1.3, 3.5, 3.7, 4.5, 4.7, 4.9_

- [x] 10. Implement offline queue composable for SpaBooking
  - Create `SpaBooking/app/composables/useOfflineQueue.ts` — Vue composable wrapping `offlineQueue.ts`, exposing reactive `isOnline: Ref<boolean>`, `pendingCount: Ref<number>`, `enqueue`, and `flush`; listen to `online`/`offline` events
  - _Requirements: 1.4, 3.6, 3.8, 4.6, 4.8, 4.10_

- [x] 11. Implement OfflineIndicator component for SpaCashier
  - Create `SpaCashier/src/components/pwa/OfflineIndicator.tsx` — persistent banner shown when `isOnline === false`, displaying translated offline message and `pendingCount` using `next-intl` `useTranslations`
  - Integrate `OfflineIndicator` into `SpaCashier/src/app/(dashboard)/layout.tsx`
  - _Requirements: 3.5, 4.9, 10.1, 10.5_

  - [x] 11.1 Write unit tests for OfflineIndicator (SpaCashier)
    - Test banner renders when `isOnline === false`
    - Test banner is hidden when `isOnline === true`
    - Test `pendingCount` is displayed correctly
    - _Requirements: 3.5, 4.9, 10.1_

  - [x] 11.2 Write property test for offline indicator count matches queue length
    - **Property 5: Offline indicator count matches queue length**
    - **Validates: Requirements 4.9, 4.10, 10.1, 10.2**

- [x] 12. Implement OfflineIndicator component for SpaBooking
  - Create `SpaBooking/app/components/pwa/OfflineIndicator.vue` — persistent banner shown when `isOnline === false`, displaying translated offline message and `pendingCount` using `useI18n()`
  - Integrate `OfflineIndicator` into `SpaBooking/app/layouts/default.vue`
  - _Requirements: 3.6, 4.10, 10.2, 10.6_

  - [x] 12.1 Write unit tests for OfflineIndicator (SpaBooking)
    - Test banner renders when `isOnline === false`
    - Test banner is hidden when `isOnline === true`
    - _Requirements: 3.6, 4.10, 10.2_

- [x] 13. Implement SyncNotification for SpaCashier and SpaBooking
  - Create `SpaCashier/src/components/pwa/SyncNotification.tsx` — listens for `SYNC_SUCCESS` and `SYNC_FAILED` `postMessage` events from the service worker; shows success toast (using `sonner`) with translated "back online" message when queue empties; shows error toast with operation details on failure
  - Create `SpaBooking/app/components/pwa/SyncNotification.vue` — same logic using `useI18n()` and Nuxt UI toast
  - Integrate both into their respective layouts
  - _Requirements: 4.5, 4.6, 4.7, 4.8, 10.3, 10.4_

  - [x] 13.1 Write unit tests for SyncNotification (SpaCashier)
    - Test success toast shown on `SYNC_SUCCESS` message
    - Test error toast shown with operation details on `SYNC_FAILED` message
    - _Requirements: 4.5, 4.7, 10.3_

  - [x] 13.2 Write unit tests for SyncNotification (SpaBooking)
    - Test success toast shown on `SYNC_SUCCESS` message
    - Test error toast shown with operation details on `SYNC_FAILED` message
    - _Requirements: 4.6, 4.8, 10.4_

- [x] 14. Checkpoint — Ensure all offline queue and indicator tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 15. Implement InstallPrompt component for SpaCashier
  - Create `SpaCashier/src/components/pwa/InstallPrompt.tsx` — listens for `beforeinstallprompt` event; reads/writes snooze timestamp from `localStorage` key `pwa-install-snoozed`; does not render if snoozed within 7 days; shows install banner with translated strings; on dismiss, stores `Date.now()` as snooze timestamp
  - _Requirements: 5.3, 5.5, 5.7_

  - [x] 15.1 Write unit tests for InstallPrompt (SpaCashier)
    - Test does not render when snoozed within 7 days
    - Test renders when snooze has expired
    - _Requirements: 5.7_

  - [x] 15.2 Write property test for install prompt snooze
    - **Property 6: Install prompt snooze is respected**
    - **Validates: Requirements 5.7, 5.8**

- [x] 16. Implement InstallPrompt component for SpaBooking
  - Create `SpaBooking/app/components/pwa/InstallPrompt.vue` — same logic as SpaCashier equivalent, adapted for Vue; uses `useI18n()` for translated strings
  - _Requirements: 5.4, 5.6, 5.8_

  - [x] 16.1 Write unit tests for InstallPrompt (SpaBooking)
    - Test does not render when snoozed within 7 days
    - Test renders when snooze has expired
    - _Requirements: 5.8_

- [x] 17. Implement LanguageSwitcher for SpaCashier
  - Create `SpaCashier/src/components/layout/LanguageSwitcher.tsx` — dropdown component showing `EN` / `ID` options; calls `switchLocale` from `LocaleContext`; persists selection to `localStorage` key `spa-locale`
  - Integrate `LanguageSwitcher` into `SpaCashier/src/components/layout/Navbar.tsx` or `UserNav.tsx`
  - _Requirements: 6.4, 6.5, 6.8_

  - [x] 17.1 Write unit tests for LanguageSwitcher (SpaCashier)
    - Test calls locale change handler with correct locale code on selection
    - Test default locale is `en` when no preference stored
    - _Requirements: 6.4, 6.6_

  - [x] 17.2 Write property test for locale preference round-trip (SpaCashier)
    - **Property 8: Locale preference round-trip**
    - **Validates: Requirements 6.5, 11.1**

  - [x] 17.3 Write property test for all UI strings served from active locale catalog (SpaCashier)
    - **Property 7: All UI strings are served from the active locale's catalog**
    - **Validates: Requirements 6.3, 10.5**

  - [x] 17.4 Write property test for locale-aware number and date formatting
    - **Property 9: Locale-aware number and date formatting**
    - **Validates: Requirements 6.7, 7.7**

- [x] 18. Implement LanguageSwitcher for SpaBooking
  - Create `SpaBooking/app/components/layout/LanguageSwitcher.vue` — uses `useI18n().setLocale()` and `useSwitchLocalePath()` from `@nuxtjs/i18n`; integrates into `SpaBooking/app/components/TheHeader.vue`
  - _Requirements: 7.4, 7.5, 7.8_

  - [x] 18.1 Write unit tests for LanguageSwitcher (SpaBooking)
    - Test calls locale change handler with correct locale code on selection
    - Test default locale is `en` when no preference stored
    - _Requirements: 7.4, 7.6_

  - [x] 18.2 Write property test for locale preference round-trip (SpaBooking)
    - **Property 8: Locale preference round-trip (cookie)**
    - **Validates: Requirements 7.5, 11.2**

  - [x] 18.3 Write property test for SpaBooking locale-prefixed URL generation
    - **Property 10: SpaBooking locale-prefixed URL generation**
    - **Validates: Requirements 7.9**

- [x] 19. Checkpoint — Ensure all i18n and install prompt tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 20. Externalize all hardcoded UI strings in SpaCashier components
  - Audit all component files under `SpaCashier/src/components/` and `SpaCashier/src/app/` for hardcoded user-visible strings
  - Replace each hardcoded string with `useTranslations()` calls referencing keys in `en.json` / `id.json`
  - Add corresponding `en` and `id` entries for every new key to both translation catalogs
  - **Progress: Completed UserNav, Navbar menu, VoucherPrintTemplate. Many components remain.**
  - _Requirements: 9.1, 9.3_

- [x] 20.1 Write property test for translation catalog key symmetry (SpaCashier)
    - **Property 14: Translation catalog key symmetry**
    - **Validates: Requirements 9.3**

  - [x] 20.2 Write property test for missing key fallback to English (SpaCashier)
    - **Property 15: Missing translation key falls back to English**
    - **Validates: Requirements 9.5**

- [x] 21. Externalize all hardcoded UI strings in SpaBooking components
  - Audit all component files under `SpaBooking/app/components/` and `SpaBooking/app/pages/` for hardcoded user-visible strings
  - Replace each hardcoded string with `useI18n().t()` calls referencing keys in `en.json` / `id.json`
  - Add corresponding `en` and `id` entries for every new key to both translation catalogs
  - _Requirements: 9.2, 9.4_

  - [x] 21.1 Write property test for translation catalog key symmetry (SpaBooking)
    - **Property 14: Translation catalog key symmetry**
    - **Validates: Requirements 9.4**

  - [x] 21.2 Write property test for missing key fallback to English (SpaBooking)
    - **Property 15: Missing translation key falls back to English**
    - **Validates: Requirements 9.6**

- [x] 22. Implement AI translation service in Laravel backend
  - Create `SpaInformationSystem-API/app/Services/AITranslationService.php` implementing `AITranslationServiceInterface` with `translate(string $content, string $targetLocale): string`
  - Return `$content` unchanged when `$targetLocale === 'en'` or content is empty
  - On `$targetLocale === 'id'`, call OpenAI `gpt-4o-mini` with a system prompt instructing preservation of treatment names, proper nouns, and numeric values
  - Catch all `\Throwable` exceptions and return original content as fallback; log warning
  - Register `AITranslationService` in the service container
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.6_

  - [x] 22.1 Write property test for AI translation not invoked for English locale
    - **Property 11: AI translation is invoked only for non-English locales**
    - **Validates: Requirements 8.2**

  - [x] 22.2 Write property test for AI translation fallback on service failure
    - **Property 12: AI translation fallback on service failure**
    - **Validates: Requirements 8.4**

  - [x] 22.3 Write property test for AI translation preserves treatment names and numeric values
    - **Property 13: AI translation preserves treatment names and numeric values**
    - **Validates: Requirements 8.6**

- [x] 23. Integrate AI translation into Laravel API controllers
  - Update controllers that return AI-generated content (treatment rationales, chatbot responses, sentiment summaries) to accept `Accept-Language` header or `locale` query parameter
  - Pass the locale to `AITranslationService::translate()` before returning the response
  - _Requirements: 8.1, 8.5_

- [x] 24. Checkpoint — Ensure all AI translation and catalog tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 25. Implement offline locale switching with precached catalogs
  - Verify that the Workbox `additionalManifestEntries` for `en.json` and `id.json` are correctly precached in both SpaCashier and SpaBooking service workers
  - Update `LocaleProvider` in SpaCashier to load messages from the precached catalog (served by the service worker) rather than a network fetch, ensuring locale switching works offline
  - Update SpaBooking's `@nuxtjs/i18n` configuration to ensure locale files are served from the precache when offline
  - _Requirements: 11.4, 11.5, 11.6, 11.7_

  - [x] 25.1 Write property test for offline locale switching uses precached catalogs
    - **Property 16: Offline locale switching uses precached catalogs**
    - **Validates: Requirements 11.6, 11.7**

- [x] 26. Wire background sync replay on reconnect
  - In `SpaCashier/src/components/pwa/PWAManager.tsx`, when the `online` event fires, call `offlineQueue.flush()` which replays all pending operations in FIFO order; on each 2xx response call `offlineQueue.remove(id)` and post `SYNC_SUCCESS`; on 4xx call `offlineQueue.remove(id)` and post `SYNC_FAILED`; on 5xx/network error call `offlineQueue.markFailed(id)` for retry
  - Mirror the same flush logic in `SpaBooking/app/composables/useOfflineQueue.ts`
  - _Requirements: 4.3, 4.4, 4.5, 4.6, 4.7, 4.8, 3.7, 3.8_

- [x] 27. Wire SW update notification in SpaCashier
  - In `PWAManager.tsx`, detect a waiting service worker via `registration.waiting`; set `showUpdatePrompt = true`; implement `applyUpdate()` that calls `registration.waiting.postMessage({ type: 'SKIP_WAITING' })` and reloads the page
  - Add an update notification banner/toast to the dashboard layout that renders when `showUpdatePrompt` is true
  - _Requirements: 1.3_

- [x] 28. Wire SW update notification in SpaBooking
  - Configure `@vite-pwa/nuxt` with `registerType: 'prompt'` (or equivalent); add a Vue component that shows a non-blocking toast with "Refresh to update" CTA when a new SW is waiting
  - _Requirements: 1.4_

- [x] 29. Final checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for a faster MVP
- Each task references specific requirements for traceability
- Property tests use `fast-check` (TypeScript/Vitest); each test runs a minimum of 100 iterations
- Tag each property test: `// Feature: pwa-i18n, Property {N}: {property_text}`
- Checkpoints ensure incremental validation after each major feature area
- SpaCashier uses `localStorage` for locale persistence; SpaBooking uses a cookie (`spa-locale`) for SSR compatibility
- Both apps share the same IndexedDB schema (`spa-offline-queue` database, `operations` store)
- The Laravel backend AI translation service is only invoked for `id` locale; English content is returned unchanged
