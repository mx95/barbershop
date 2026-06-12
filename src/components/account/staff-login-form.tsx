"use client";

import { useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/layout/navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BARBERS } from "@/lib/constants";
import { useLanguage } from "@/lib/i18n/language-provider";
import { setStaffSession } from "@/lib/staff-session";

type StaffLoginFormProps = {
  onSuccess: (token: string, barberId: string) => void;
  /** Minimal form without barber-specific headings — for discreet account-page access */
  discrete?: boolean;
};

export function StaffLoginForm({ onSuccess, discrete = false }: StaffLoginFormProps) {
  const { t } = useLanguage();
  const [loginBarber, setLoginBarber] = useState<string>(BARBERS[0].id);
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ barberId: loginBarber, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || t.admin.login.invalidCredentials);
        return;
      }
      setStaffSession(data.token, data.barberId);
      setPassword("");
      onSuccess(data.token, data.barberId);
    } finally {
      setLoading(false);
    }
  }

  const form = (
    <form onSubmit={handleLogin} className="grid gap-4">
      <div>
        <Label>{discrete ? t.account.staffDiscreteName : t.admin.login.selectBarber}</Label>
        <select
          className="mt-1.5 w-full rounded-md border border-gold/20 bg-white/5 px-3 py-2"
          value={loginBarber}
          onChange={(e) => setLoginBarber(e.target.value)}
        >
          {BARBERS.map((b) => (
            <option key={b.id} value={b.id}>
              {b.name}
            </option>
          ))}
        </select>
      </div>
      <div>
        <Label>{discrete ? t.account.staffDiscretePassword : t.admin.login.password}</Label>
        <Input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder={
            discrete ? t.account.staffDiscretePassword : t.admin.login.passwordPlaceholder
          }
          className="mt-1.5 border-gold/20 bg-white/5"
          required
        />
      </div>
      <Button type="submit" className="gold-gradient border-0" disabled={loading}>
        {loading
          ? t.admin.login.signingIn
          : discrete
            ? t.account.staffDiscreteContinue
            : t.admin.login.signIn}
      </Button>
    </form>
  );

  if (discrete) {
    return (
      <Card className="glass-card mb-8 border-gold/15">
        <CardContent className="p-5 sm:p-6">{form}</CardContent>
      </Card>
    );
  }

  return (
    <div className="section-padding flex min-h-[70vh] items-center justify-center">
      <div className="w-full max-w-md">
        <PageHeader
          title={t.admin.login.title}
          subtitle={t.admin.login.subtitle}
          className="mb-8 text-center"
        />
        <Card className="glass-card border-gold/20">
          <CardContent className="p-5 sm:p-6">{form}</CardContent>
        </Card>
      </div>
    </div>
  );
}
