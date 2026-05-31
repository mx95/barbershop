"use client";

import { useEffect, useState } from "react";
import { LOCALE_KEY } from "@/lib/i18n/translations";
import { useLanguage } from "@/lib/i18n/language-provider";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { LogoMark } from "@/components/brand/logo-mark";
import { SITE } from "@/lib/constants";

export function LanguageGate() {
  const { setLocale, t, ready } = useLanguage();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!ready) return;
    const saved = localStorage.getItem(LOCALE_KEY);
    if (!saved) setOpen(true);
  }, [ready]);

  function choose(locale: "en" | "el") {
    setLocale(locale);
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent
        showCloseButton={false}
        className="border-gold/30 bg-background sm:max-w-md"
      >
        <DialogHeader className="items-center text-center">
          <LogoMark size="nav" className="mx-auto mb-2" />
          <DialogTitle className="font-heading text-2xl">{SITE.name}</DialogTitle>
          <DialogDescription className="text-base">{t.language.chooseSubtitle}</DialogDescription>
        </DialogHeader>
        <p className="text-center font-medium text-gold">{t.language.choose}</p>
        <div className="grid grid-cols-2 gap-3 pt-2">
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
      </DialogContent>
    </Dialog>
  );
}
