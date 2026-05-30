import Link from "next/link";
import { Phone, Mail, MapPin, Camera } from "lucide-react";
import { LogoMark } from "@/components/brand/logo-mark";
import { SITE, NAV_LINKS, OPENING_HOURS_SUMMARY } from "@/lib/constants";

export function Footer() {
  return (
    <footer className="border-t border-gold/10 bg-background">
      <div className="mx-auto max-w-7xl section-padding pb-8">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-1">
            <LogoMark size="footer" className="mb-4" />
            <p className="font-heading text-xl">{SITE.name}</p>
            <p className="mt-2 text-sm text-muted-foreground">{SITE.tagline}</p>
            <p className="mt-1 text-xs text-gold">Est. {SITE.established}</p>
          </div>

          <div>
            <h3 className="mb-4 text-sm tracking-[0.2em] text-gold uppercase">Navigate</h3>
            <ul className="space-y-2">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-muted-foreground hover:text-gold">
                    {link.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/booking" className="text-sm text-muted-foreground hover:text-gold">
                  Book Appointment
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-sm tracking-[0.2em] text-gold uppercase">Contact</h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4 text-gold" />
                {SITE.address}
              </li>
              <li className="flex items-center gap-2 text-sm text-muted-foreground">
                <Phone className="h-4 w-4 text-gold" />
                <a href={`tel:${SITE.phone}`} className="hover:text-gold">
                  {SITE.phoneDisplay}
                </a>
              </li>
              {SITE.email ? (
                <li className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Mail className="h-4 w-4 text-gold" />
                  <a href={`mailto:${SITE.email}`} className="hover:text-gold">
                    {SITE.email}
                  </a>
                </li>
              ) : null}
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-sm tracking-[0.2em] text-gold uppercase">Follow</h3>
            {SITE.instagram ? (
              <a
                href={SITE.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-gold"
              >
                <Camera className="h-5 w-5" />
                @{SITE.instagram}
              </a>
            ) : (
              <a
                href={`tel:${SITE.phone}`}
                className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-gold"
              >
                <Phone className="h-5 w-5" />
                {SITE.phoneDisplay}
              </a>
            )}
            <p className="mt-6 text-xs text-muted-foreground">
              {OPENING_HOURS_SUMMARY}
            </p>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-gold/10 pt-8 sm:flex-row">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} {SITE.name}. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground">
            Crafted with precision in {SITE.locationLine}, Cyprus
          </p>
        </div>
      </div>
    </footer>
  );
}
