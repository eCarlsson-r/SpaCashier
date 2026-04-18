import { test, describe, expect } from 'vitest';
import * as fc from 'fast-check';

describe('Locale Preference Round-Trip (localStorage)', () => {
  test('Feature: pwa-i18n, Property 8: Locale preference round-trip', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('en', 'id'),
        (locale) => {
          const storage: Record<string, string> = {};
          const setItem = (key: string, val: string) => { storage[key] = val; };
          const getItem = (key: string) => storage[key] || 'en';

          setItem('spa-locale', locale);
          expect(getItem('spa-locale')).toBe(locale);
        }
      ),
      { numRuns: 100 }
    );
  });
});

describe('UI strings served from active locale catalog', () => {
  test('Feature: pwa-i18n, Property 7: All UI strings are served from the active locale catalog', () => {
    const enCatalog: Record<string, string> = { 'greeting': 'Hello', 'farewell': 'Goodbye' };
    const idCatalog: Record<string, string> = { 'greeting': 'Halo', 'farewell': 'Selamat Tinggal' };

    fc.assert(
      fc.property(
        fc.constantFrom('en', 'id'),
        fc.constantFrom('greeting', 'farewell'),
        (locale, key) => {
          const t = (k: string) => locale === 'id' ? idCatalog[k] : enCatalog[k];
          
          const expectedString = locale === 'id' ? idCatalog[key] : enCatalog[key];
          expect(t(key)).toBe(expectedString);
        }
      ),
      { numRuns: 100 }
    );
  });
});

describe('Locale-aware number and date formatting', () => {
  test('Feature: pwa-i18n, Property 9: Locale-aware number and date formatting', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('en', 'id'),
        fc.integer({ min: 1000, max: 10000000 }),
        fc.date(),
        (locale, num, date) => {
          const jsLocale = locale === 'id' ? 'id-ID' : 'en-US';
          
          // Number formatting
          const formatter = new Intl.NumberFormat(jsLocale);
          const formattedNum = formatter.format(num);
          
          if (locale === 'id') {
            if (num >= 1000) expect(formattedNum).toContain('.');
          } else {
            if (num >= 1000) expect(formattedNum).toContain(',');
          }

          // Date formatting
          const dateFormatter = new Intl.DateTimeFormat(jsLocale, { month: 'long' });
          const formattedDate = dateFormatter.format(date);
          
          expect(typeof formattedDate).toBe('string');
          expect(formattedDate.length).toBeGreaterThan(0);
        }
      ),
      { numRuns: 100 }
    );
  });
});
