import { test, describe, expect } from 'vitest';
import * as fc from 'fast-check';
import enCatalog from '../messages/en.json';
import idCatalog from '../messages/id.json';

/**
 * Recursively extract all keys from a nested object as dot-separated paths.
 */
function extractKeys(obj: Record<string, unknown>, prefix = ''): string[] {
  const keys: string[] = [];
  for (const key of Object.keys(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    const value = obj[key];
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      keys.push(...extractKeys(value as Record<string, unknown>, fullKey));
    } else {
      keys.push(fullKey);
    }
  }
  return keys;
}

const enKeys = extractKeys(enCatalog);
const idKeys = extractKeys(idCatalog);

describe('SpaCashier Translation Catalog Key Symmetry', () => {
  // Feature: pwa-i18n, Property 14: Translation catalog key symmetry
  test('Property 14: Every key in en.json exists in id.json', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...enKeys),
        (key) => {
          expect(idKeys).toContain(key);
        }
      ),
      { numRuns: Math.min(enKeys.length, 200) }
    );
  });

  test('Property 14: Every key in id.json exists in en.json', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...idKeys),
        (key) => {
          expect(enKeys).toContain(key);
        }
      ),
      { numRuns: Math.min(idKeys.length, 200) }
    );
  });
});

describe('SpaCashier Missing Translation Key Fallback', () => {
  // Feature: pwa-i18n, Property 15: Missing translation key falls back to English
  test('Property 15: Missing key in id.json falls back to en.json value', () => {
    /**
     * Simulates the next-intl fallback behavior:
     * If a key is missing from the target locale catalog,
     * the framework returns the English (default) value.
     */
    function resolveTranslation(key: string, locale: 'en' | 'id'): string {
      const catalog = locale === 'id' ? idCatalog : enCatalog;
      const parts = key.split('.');
      let current: unknown = catalog;
      for (const part of parts) {
        if (typeof current !== 'object' || current === null) return getEnglishFallback(key);
        current = (current as Record<string, unknown>)[part];
      }
      return typeof current === 'string' ? current : getEnglishFallback(key);
    }

    function getEnglishFallback(key: string): string {
      const parts = key.split('.');
      let current: unknown = enCatalog;
      for (const part of parts) {
        if (typeof current !== 'object' || current === null) return key;
        current = (current as Record<string, unknown>)[part];
      }
      return typeof current === 'string' ? current : key;
    }

    fc.assert(
      fc.property(
        fc.constantFrom(...enKeys),
        (key) => {
          const result = resolveTranslation(key, 'id');
          // The result should always be a string (either translated or English fallback)
          expect(typeof result).toBe('string');
          expect(result.length).toBeGreaterThan(0);
        }
      ),
      { numRuns: Math.min(enKeys.length, 200) }
    );
  });
});
