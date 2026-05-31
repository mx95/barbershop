"use client";

import { useLanguage } from "@/lib/i18n/language-provider";
import { cn } from "@/lib/utils";

export function LanguageSwitcher({ className }: { className?: string }) {
  const { locale, setLocale } = useLanguage();

  return (
    <div className={cn("flex items-center gap-1 rounded-md border border-gold/20 p-0.5 text-xs", className)}>
      <button
        type="button"
        onClick={() => setLocale("en")}
        className={cn(
          "rounded px-2 py-1 transition-colors",
          locale === "en" ? "bg-gold text-primary-foreground" : "text-muted-foreground hover:text-foreground"
        )}
      >
        EN
      </button>
      <button
        type="button"
        onClick={() => setLocale("el")}
        className={cn(
          "rounded px-2 py-1 transition-colors",
          locale === "el" ? "bg-gold text-primary-foreground" : "text-muted-foreground hover:text-foreground"
        )}
      >
        EL
      </button>
    </div>
  );
}
