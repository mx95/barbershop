"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LOCALE_KEY } from "@/lib/i18n/translations";
import { useLanguage } from "@/lib/i18n/language-provider";
import { useIntroMotion } from "@/lib/motion/intro-context";
import { useMounted } from "@/hooks/use-mounted";
import { Button } from "@/components/ui/button";
import { LogoMark } from "@/components/brand/logo-mark";
import { SITE } from "@/lib/constants";

export function LanguageGate() {
  const { setLocale, t, mounted: localeReady } = useLanguage();
  const { markIntroReady } = useIntroMotion();
  const mounted = useMounted();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!localeReady) return;
    const saved = localStorage.getItem(LOCALE_KEY);
    if (!saved) setOpen(true);
  }, [localeReady]);

  function choose(locale: "en" | "el") {
    setLocale(locale);
    setOpen(false);
    markIntroReady();
  }

  if (!mounted) return null;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black px-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35 }}
        >
          <motion.div
            className="w-full max-w-md text-center"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.82, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
              className="mx-auto mb-6 flex justify-center"
            >
              <motion.div
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              >
                <LogoMark size="nav" className="!h-20 !w-20 sm:!h-24 sm:!w-24" />
              </motion.div>
            </motion.div>

            <p className="font-heading text-2xl text-foreground sm:text-3xl">{SITE.name}</p>
            <p className="mt-2 text-sm tracking-[0.2em] text-gold uppercase">{SITE.locationLine}</p>
            <p className="mt-6 text-base text-muted-foreground">{t.language.chooseSubtitle}</p>
            <p className="mt-2 font-medium text-gold">{t.language.choose}</p>

            <div className="mt-8 grid grid-cols-2 gap-3">
              <Button
                size="lg"
                variant="outline"
                className="h-14 border-gold/30 text-base"
                onClick={() => choose("en")}
              >
                {t.language.english}
              </Button>
              <Button
                size="lg"
                className="gold-gradient h-14 border-0 text-base"
                onClick={() => choose("el")}
              >
                {t.language.greek}
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
