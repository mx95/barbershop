"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { LOCALE_KEY, translations, type Locale, type Translations } from "./translations";

interface LanguageContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: Translations;
  serviceName: (serviceId: string, fallback: string) => string;
  /** False during SSR and first client paint — locale may still be loading from storage. */
  mounted: boolean;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

function resolveTranslations(locale: Locale): Translations {
  const selected = translations[locale];
  if (!selected) return translations.en;
  if (selected.products) return selected;
  return { ...translations.en, ...selected, products: translations.en.products };
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("en");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(LOCALE_KEY) as Locale | null;
    const next = saved === "en" || saved === "el" ? saved : "en";
    setLocaleState(next);
    document.documentElement.lang = next;
    setMounted(true);
  }, []);

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    localStorage.setItem(LOCALE_KEY, next);
    document.documentElement.lang = next;
  }, []);

  const t = resolveTranslations(locale);

  const serviceName = useCallback(
    (serviceId: string, fallback: string) =>
      (t.services as Record<string, string>)[serviceId] ?? fallback,
    [t]
  );

  return (
    <LanguageContext.Provider value={{ locale, setLocale, t, serviceName, mounted }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
}
