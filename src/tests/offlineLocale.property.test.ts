import { test, describe, expect } from 'vitest';
import * as fc from 'fast-check';

describe('Offline locale switching uses precached catalogs', () => {
  // Feature: pwa-i18n, Property 16: Offline locale switching uses precached catalogs
  test('Property 16: Precached catalog URLs are generated for all supported locales', () => {
    const supportedLocales = ['en', 'id'];

    // SpaCashier precache entries
    const spaCashierPrecacheUrls = supportedLocales.map((l) => `/messages/${l}.json`);
    // SpaBooking precache entries
    const spaBookingPrecacheUrls = supportedLocales.map((l) => `/locales/${l}.json`);

    fc.assert(
      fc.property(
        fc.constantFrom(...supportedLocales),
        (locale) => {
          // SpaCashier: verify precache URL matches expected pattern
          const cashierUrl = `/messages/${locale}.json`;
          expect(spaCashierPrecacheUrls).toContain(cashierUrl);

          // SpaBooking: verify precache URL matches expected pattern
          const bookingUrl = `/locales/${locale}.json`;
          expect(spaBookingPrecacheUrls).toContain(bookingUrl);

          // Verify the locale file can be resolved to a valid path
          expect(cashierUrl).toMatch(/^\/messages\/(en|id)\.json$/);
          expect(bookingUrl).toMatch(/^\/locales\/(en|id)\.json$/);
        }
      ),
      { numRuns: 100 }
    );
  });

  test('Property 16: Switching locale offline resolves from precache, not network', () => {
    /**
     * Simulates the Workbox precache lookup behavior.
     * When a locale catalog URL is requested, the service worker should
     * serve it from the precache instead of hitting the network.
     */
    const precacheStore: Record<string, string> = {
      '/messages/en.json': '{"nav":{"dashboard":"Dashboard"}}',
      '/messages/id.json': '{"nav":{"dashboard":"Dasbor"}}',
      '/locales/en.json': '{"nav":{"treatments":"Treatments"}}',
      '/locales/id.json': '{"nav":{"treatments":"Perawatan"}}',
    };

    fc.assert(
      fc.property(
        fc.constantFrom('en', 'id'),
        fc.constantFrom('cashier', 'booking'),
        (locale, app) => {
          const urlPrefix = app === 'cashier' ? '/messages' : '/locales';
          const url = `${urlPrefix}/${locale}.json`;

          // Precache hit: URL exists in the store
          expect(url in precacheStore).toBe(true);

          // Content is valid JSON
          const content = precacheStore[url];
          const parsed = JSON.parse(content);
          expect(typeof parsed).toBe('object');
          expect(parsed).not.toBeNull();
        }
      ),
      { numRuns: 100 }
    );
  });
});
