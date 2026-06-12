"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLanguage } from "@/lib/i18n/language-provider";
import { loadSavedCustomer } from "@/lib/customer-storage";
import { setCustomerSession } from "@/lib/customer-session";

type CustomerLoginFormProps = {
  onSuccess: (data: { token: string; phone: string; email: string; name: string }) => void;
};

export function CustomerLoginForm({ onSuccess }: CustomerLoginFormProps) {
  const { t } = useLanguage();
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const saved = loadSavedCustomer();
    if (saved?.phone) setPhone(saved.phone);
    if (saved?.email) setEmail(saved.email);
  }, []);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/account/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: phone.trim(), email: email.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || t.account.loginFailed);
        return;
      }
      setCustomerSession(data.token, data.phone, data.email);
      onSuccess({
        token: data.token,
        phone: data.phone,
        email: data.email,
        name: data.name ?? "",
      });
      toast.success(t.account.loginSuccess);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="glass-card mb-8 border-gold/20">
      <CardContent className="p-5 sm:p-6">
        <p className="mb-1 font-heading text-lg">{t.account.loginTitle}</p>
        <p className="mb-4 text-sm text-muted-foreground">{t.account.loginHint}</p>
        <form onSubmit={handleLogin} className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="loginPhone">{t.booking.phone} *</Label>
            <Input
              id="loginPhone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder={t.booking.phonePlaceholder}
              required
              className="mt-1.5 border-gold/20 bg-white/5"
            />
          </div>
          <div>
            <Label htmlFor="loginEmail">{t.common.email} *</Label>
            <Input
              id="loginEmail"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t.booking.emailPlaceholder}
              required
              className="mt-1.5 border-gold/20 bg-white/5"
            />
          </div>
          <Button
            type="submit"
            className="gold-gradient border-0 sm:col-span-2"
            disabled={loading}
          >
            {loading ? t.account.loggingIn : t.account.loginButton}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
