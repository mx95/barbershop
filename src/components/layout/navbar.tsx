"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, Calendar, User } from "lucide-react";
import { LogoMark } from "@/components/brand/logo-mark";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { AppointmentSearch } from "@/components/booking/appointment-search";
import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { useLanguage } from "@/lib/i18n/language-provider";
import { useMounted } from "@/hooks/use-mounted";
import { SITE } from "@/lib/constants";
import { cn } from "@/lib/utils";

const NAV_HREFS = [
  { href: "/", key: "home" as const },
  { href: "/gallery", key: "gallery" as const },
  { href: "/about", key: "about" as const },
  { href: "/contact", key: "contact" as const },
];

export function Navbar() {
  const [open, setOpen] = useState(false);
  const { t } = useLanguage();
  const mounted = useMounted();

  return (
    <header className="fixed top-0 z-50 w-full border-b border-gold/10 bg-background/80 backdrop-blur-xl">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-2 px-3 sm:h-20 sm:gap-3 sm:px-6 lg:px-8">
        <Link href="/" className="flex min-w-0 shrink items-center gap-2 sm:gap-3">
          <LogoMark size="nav" className="!h-11 !w-11 sm:!h-14 sm:!w-14" />
          <div className="hidden min-w-0 sm:block">
            <p className="truncate font-heading text-lg font-semibold tracking-wide text-foreground">
              {SITE.name}
            </p>
            <p className="truncate text-xs tracking-[0.2em] text-gold uppercase">{SITE.locationLine}</p>
          </div>
        </Link>

        <div className="hidden items-center gap-8 lg:flex">
          {NAV_HREFS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm tracking-wide text-muted-foreground transition-colors hover:text-gold"
            >
              {t.nav[link.key]}
            </Link>
          ))}
        </div>

        <div className="hidden items-center gap-2 lg:flex lg:gap-3">
          <AppointmentSearch />
          <LanguageSwitcher />
          <Button variant="ghost" size="sm" asChild>
            <Link href="/account">
              <User className="mr-2 h-4 w-4" />
              {t.nav.account}
            </Link>
          </Button>
          <Button size="sm" asChild className="gold-gradient border-0 text-primary-foreground">
            <Link href="/booking">
              <Calendar className="mr-2 h-4 w-4" />
              {t.nav.bookNow}
            </Link>
          </Button>
        </div>

        {/* Mobile actions — always visible */}
        <div className="flex items-center gap-0.5 sm:gap-1 lg:hidden">
          <AppointmentSearch />
          <LanguageSwitcher />
          <Button size="icon-sm" asChild className="gold-gradient border-0 text-primary-foreground">
            <Link href="/booking" aria-label={t.nav.bookNow}>
              <Calendar className="h-4 w-4" />
            </Link>
          </Button>
          {mounted ? (
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger className="lg:hidden" render={<Button variant="ghost" size="icon-sm" />}>
                <Menu className="h-5 w-5" />
              </SheetTrigger>
              <SheetContent side="right" className="border-gold/20 bg-background/95 backdrop-blur-xl">
                <div className="mt-6 flex flex-col gap-5">
                  {NAV_HREFS.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setOpen(false)}
                      className="font-heading text-2xl text-foreground hover:text-gold"
                    >
                      {t.nav[link.key]}
                    </Link>
                  ))}
                  <div className="mt-2 flex flex-col gap-3 border-t border-gold/20 pt-5">
                    <Button variant="outline" asChild>
                      <Link href="/account" onClick={() => setOpen(false)}>
                        <User className="mr-2 h-4 w-4" />
                        {t.nav.account}
                      </Link>
                    </Button>
                    <Button asChild className="gold-gradient border-0">
                      <Link href="/booking" onClick={() => setOpen(false)}>
                        {t.nav.bookAppointment}
                      </Link>
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          ) : (
            <Button variant="ghost" size="icon-sm" aria-hidden>
              <Menu className="h-5 w-5" />
            </Button>
          )}
        </div>
      </nav>
    </header>
  );
}

export function PageHeader({
  title,
  subtitle,
  className,
}: {
  title: string;
  subtitle?: string;
  className?: string;
}) {
  return (
    <div className={cn("text-center", className)}>
      <p className="mb-2 text-xs tracking-[0.25em] text-gold uppercase sm:mb-3 sm:text-sm sm:tracking-[0.3em]">
        {SITE.name}
      </p>
      <h1 className="font-heading text-3xl font-light tracking-wide sm:text-4xl md:text-5xl lg:text-6xl">
        {title}
      </h1>
      {subtitle && (
        <p className="mx-auto mt-3 max-w-2xl px-2 text-sm text-muted-foreground sm:mt-4 sm:text-base">
          {subtitle}
        </p>
      )}
    </div>
  );
}
