"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { Search } from "lucide-react";
import { useLanguage } from "@/lib/i18n/language-provider";
import { useMounted } from "@/hooks/use-mounted";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import type { StoredAppointment } from "@/lib/store/appointments";

export function AppointmentSearch({ className }: { className?: string }) {
  const { t } = useLanguage();
  const mounted = useMounted();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<StoredAppointment[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) {
      setQuery("");
      setResults([]);
    }
  }, [open]);

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/appointments?search=${encodeURIComponent(query.trim())}`);
        const data = await res.json();
        setResults(data.appointments ?? []);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  if (!mounted) {
    return (
      <Button variant="ghost" size="icon-sm" className={className} aria-label={t.nav.search} disabled>
        <Search className="h-4 w-4" />
      </Button>
    );
  }

  return (
    <>
      <Button
        variant="ghost"
        size="icon-sm"
        className={className}
        aria-label={t.nav.search}
        onClick={() => setOpen(true)}
      >
        <Search className="h-4 w-4" />
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="border-gold/30 bg-background sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-heading text-xl">{t.search.title}</DialogTitle>
          </DialogHeader>
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t.search.placeholder}
            className="border-gold/20 bg-white/5"
            autoFocus
          />
          <div className="max-h-[min(60vh,20rem)] space-y-2 overflow-y-auto">
            {query.trim().length < 2 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">{t.search.hint}</p>
            ) : loading ? (
              <p className="py-6 text-center text-sm text-muted-foreground">...</p>
            ) : results.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">{t.search.noResults}</p>
            ) : (
              results.map((appt) => (
                <div
                  key={appt.id}
                  className="rounded-lg border border-gold/15 bg-white/5 p-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-medium">{appt.customer_name}</p>
                      <p className="text-sm text-muted-foreground">{appt.customer_phone}</p>
                      <p className="mt-1 truncate text-sm">
                        {appt.service_name} · {appt.barber_name}
                      </p>
                      <p className="text-sm text-gold">
                        {format(new Date(appt.starts_at), "EEE, MMM d · HH:mm")}
                      </p>
                    </div>
                    <Badge variant="outline" className="shrink-0 border-gold/30 text-gold">
                      {appt.status.replace("_", " ")}
                    </Badge>
                  </div>
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
