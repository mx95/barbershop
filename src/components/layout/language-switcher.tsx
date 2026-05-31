"use client";

import { useLanguage } from "@/lib/i18n/language-provider";
import { useMounted } from "@/hooks/use-mounted";
import { cn } from "@/lib/utils";

export function LanguageSwitcher({ className }: { className?: string }) {
  const { locale, setLocale } = useLanguage();
  const mounted = useMounted();

  return (
    <div
      className={cn("flex items-center gap-0.5 rounded-md border border-gold/20 p-0.5 text-xs", className)}
      suppressHydrationWarning
    >
      <button
        type="button"
        onClick={() => setLocale("en")}
        className={cn(
          "rounded px-1.5 py-1 transition-colors sm:px-2",
          mounted && locale === "en"
            ? "bg-gold text-primary-foreground"
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        EN
      </button>
      <button
        type="button"
        onClick={() => setLocale("el")}
        className={cn(
          "rounded px-1.5 py-1 transition-colors sm:px-2",
          mounted && locale === "el"
            ? "bg-gold text-primary-foreground"
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        EL
      </button>
    </div>
  );
}
