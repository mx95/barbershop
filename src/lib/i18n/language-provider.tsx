"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { LOCALE_KEY, translations, type Locale, type Translations } from "./translations";

interface LanguageContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: Translations;
  serviceName: (serviceId: string, fallback: string) => string;
  barberText: (barberId: string, field: "title" | "bio", fallback: string) => string;
  serviceDescription: (serviceId: string, fallback: string) => string;
  serviceCategory: (category: string, fallback: string) => string;
  statusLabel: (status: string) => string;
  /** False during SSR and first client paint — locale may still be loading from storage. */
  mounted: boolean;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

function resolveTranslations(locale: Locale): Translations {
  const selected = translations[locale];
  if (!selected) return translations.en;
  if (selected.brands) return selected;
  return { ...translations.en, ...selected, brands: translations.en.brands };
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

  const barberText = useCallback(
    (barberId: string, field: "title" | "bio", fallback: string) => {
      const barber = (t.barbers as Record<string, { title: string; bio: string }>)[barberId];
      return barber?.[field] ?? fallback;
    },
    [t]
  );

  const serviceDescription = useCallback(
    (serviceId: string, fallback: string) => {
      const detail = (t.serviceDescriptions as Record<string, { description: string }>)[serviceId];
      return detail?.description ?? fallback;
    },
    [t]
  );

  const serviceCategory = useCallback(
    (category: string, fallback: string) =>
      (t.categories as Record<string, string>)[category] ?? fallback,
    [t]
  );

  const statusLabel = useCallback(
    (status: string) => (t.status as Record<string, string>)[status] ?? status.replace("_", " "),
    [t]
  );

  return (
    <LanguageContext.Provider
      value={{ locale, setLocale, t, serviceName, barberText, serviceDescription, serviceCategory, statusLabel, mounted }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
}
