'use client';

import React, { createContext, useContext, useState } from 'react';
import { NextIntlClientProvider } from 'next-intl';

type Locale = 'en' | 'id';

interface LocaleContextType {
  locale: Locale;
  switchLocale: (next: Locale) => void;
}

const LocaleContext = createContext<LocaleContextType | undefined>(undefined);

export function useLocale(): LocaleContextType {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error('useLocale must be used within LocaleProvider');
  return ctx;
}

// Eagerly import both catalogs so they are available without a network request
// (they will also be precached by the service worker via additionalManifestEntries)
import enMessages from '../messages/en.json';
import idMessages from '../messages/id.json';

const messages: Record<Locale, Record<string, unknown>> = {
  en: enMessages,
  id: idMessages,
};

function getInitialLocale(): Locale {
  if (typeof window === 'undefined') return 'en';
  const stored = localStorage.getItem('spa-locale');
  if (stored === 'en' || stored === 'id') return stored;
  return 'en';
}

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocale] = useState<Locale>(getInitialLocale);

  const switchLocale = (next: Locale) => {
    localStorage.setItem('spa-locale', next);
    setLocale(next);
  };

  return (
    <NextIntlClientProvider
      locale={locale}
      messages={messages[locale]}
      timeZone="Asia/Jakarta"
    >
      <LocaleContext.Provider value={{ locale, switchLocale }}>
        {children}
      </LocaleContext.Provider>
    </NextIntlClientProvider>
  );
}
