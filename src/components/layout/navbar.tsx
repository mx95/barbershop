"use client";

import Link from "next/link";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, Calendar, User } from "lucide-react";
import { LogoMark } from "@/components/brand/logo-mark";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { SITE, NAV_LINKS } from "@/lib/constants";
import { cn } from "@/lib/utils";
export function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed top-0 z-50 w-full border-b border-gold/10 bg-background/80 backdrop-blur-xl">
      <nav className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3">
          <LogoMark size="nav" />
          <div className="hidden sm:block">
            <p className="font-heading text-lg font-semibold tracking-wide text-foreground">
              {SITE.name}
            </p>
            <p className="text-xs tracking-[0.2em] text-gold uppercase">{SITE.locationLine}</p>
          </div>
        </Link>

        <div className="hidden items-center gap-8 lg:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm tracking-wide text-muted-foreground transition-colors hover:text-gold"
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="hidden items-center gap-3 lg:flex">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/account">
              <User className="mr-2 h-4 w-4" />
              Account
            </Link>
          </Button>
          <Button size="sm" asChild className="gold-gradient border-0 text-primary-foreground">
            <Link href="/booking">
              <Calendar className="mr-2 h-4 w-4" />
              Book Now
            </Link>
          </Button>
        </div>

        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger className="lg:hidden">
            <Button variant="ghost" size="icon">
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="border-gold/20 bg-background/95 backdrop-blur-xl">
            <div className="mt-8 flex flex-col gap-6">
              {NAV_LINKS.map((link, i) => (
                <motion.div
                  key={link.href}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Link
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className="font-heading text-2xl text-foreground hover:text-gold"
                  >
                    {link.label}
                  </Link>
                </motion.div>
              ))}
              <div className="mt-4 flex flex-col gap-3 border-t border-gold/20 pt-6">
                <Button variant="outline" asChild>
                  <Link href="/account" onClick={() => setOpen(false)}>Account</Link>
                </Button>
                <Button asChild className="gold-gradient border-0">
                  <Link href="/booking" onClick={() => setOpen(false)}>Book Appointment</Link>
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
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
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-3 text-sm tracking-[0.3em] text-gold uppercase"
      >
        {SITE.name}
      </motion.p>
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="font-heading text-4xl font-light tracking-wide sm:text-5xl lg:text-6xl"
      >
        {title}
      </motion.h1>
      {subtitle && (
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mx-auto mt-4 max-w-2xl text-muted-foreground"
        >
          {subtitle}
        </motion.p>
      )}
    </div>
  );
}
