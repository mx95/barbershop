"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { Calendar, Gift, History, LogOut, QrCode, User } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/layout/navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { createClient } from "@/lib/supabase/client";
import { LOYALTY_TIERS } from "@/lib/constants";
import { getLoyaltyTier } from "@/lib/booking-utils";
import type { Appointment, Profile, VisitHistory, LoyaltyReward } from "@/lib/types";

export default function AccountPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [visits, setVisits] = useState<VisitHistory[]>([]);
  const [rewards, setRewards] = useState<LoyaltyReward[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.push("/auth/login?redirect=/account");
        return;
      }

      const [profileRes, apptRes, visitRes, rewardRes] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", user.id).single(),
        supabase.from("appointments").select("*, services(name, price, duration)").eq("customer_id", user.id).order("starts_at", { ascending: true }),
        supabase.from("visit_history").select("*").eq("customer_id", user.id).order("visited_at", { ascending: false }),
        supabase.from("loyalty_rewards").select("*").eq("customer_id", user.id),
      ]);

      if (profileRes.data) setProfile(profileRes.data);
      if (apptRes.data) setAppointments(apptRes.data);
      if (visitRes.data) setVisits(visitRes.data);
      if (rewardRes.data) setRewards(rewardRes.data);
      setLoading(false);
    }
    load();
  }, [router]);

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    toast.success("Signed out");
    router.push("/");
  }

  if (loading) {
    return <div className="section-padding text-center">Loading your account...</div>;
  }

  const tier = getLoyaltyTier(profile?.total_visits || 0);
  const upcoming = appointments.filter((a) => new Date(a.starts_at) > new Date() && a.status !== "cancelled");

  return (
    <div className="section-padding">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 flex items-start justify-between">
          <PageHeader
            title={`Welcome, ${profile?.full_name?.split(" ")[0] || "Gentleman"}`}
            subtitle="Manage your appointments, rewards, and visit history."
          />
          <Button variant="outline" size="sm" onClick={handleSignOut} className="border-gold/30">
            <LogOut className="mr-2 h-4 w-4" /> Sign Out
          </Button>
        </div>

        <div className="mb-8 grid gap-4 sm:grid-cols-3">
          {[
            { icon: User, label: "Member Tier", value: tier },
            { icon: Gift, label: "Loyalty Points", value: profile?.loyalty_points || 0 },
            { icon: History, label: "Total Visits", value: profile?.total_visits || 0 },
          ].map((stat) => (
            <Card key={stat.label} className="glass-card">
              <CardContent className="flex items-center gap-4 p-5">
                <stat.icon className="h-8 w-8 text-gold" />
                <div>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                  <p className="font-heading text-2xl">{stat.value}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Tabs defaultValue="appointments">
          <TabsList className="mb-6 bg-muted">
            <TabsTrigger value="appointments">Appointments</TabsTrigger>
            <TabsTrigger value="history">Visit History</TabsTrigger>
            <TabsTrigger value="rewards">Rewards</TabsTrigger>
          </TabsList>

          <TabsContent value="appointments" className="space-y-4">
            {upcoming.length === 0 ? (
              <Card className="glass-card">
                <CardContent className="p-8 text-center">
                  <Calendar className="mx-auto mb-4 h-10 w-10 text-gold" />
                  <p className="text-muted-foreground">No upcoming appointments</p>
                  <Button asChild className="gold-gradient mt-4 border-0">
                    <Link href="/booking">Book Now</Link>
                  </Button>
                </CardContent>
              </Card>
            ) : (
              upcoming.map((appt) => (
                <Card key={appt.id} className="glass-card">
                  <CardContent className="flex items-center justify-between p-5">
                    <div>
                      <p className="font-heading text-lg">
                        {(appt as Appointment & { services?: { name: string } }).services?.name || "Appointment"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(appt.starts_at), "EEEE, MMM d · HH:mm")}
                      </p>
                      <Badge variant="outline" className="mt-2 border-gold/30 text-gold">
                        {appt.status}
                      </Badge>
                    </div>
                    <Button variant="outline" size="sm" asChild className="border-gold/30">
                      <Link href={`/check-in/${appt.check_in_code}`}>
                        <QrCode className="mr-2 h-4 w-4" /> Check-In QR
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="history" className="space-y-3">
            {visits.length === 0 ? (
              <p className="text-center text-muted-foreground">No visit history yet</p>
            ) : (
              visits.map((visit) => (
                <Card key={visit.id} className="glass-card">
                  <CardContent className="flex justify-between p-4">
                    <div>
                      <p className="font-medium">{visit.service_name}</p>
                      <p className="text-sm text-muted-foreground">with {visit.barber_name}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm">{format(new Date(visit.visited_at), "MMM d, yyyy")}</p>
                      <p className="text-xs text-gold">+{visit.points_earned} pts</p>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="rewards">
            <div className="mb-6 grid gap-4 sm:grid-cols-3">
              {LOYALTY_TIERS.map((t) => (
                <Card key={t.name} className={`glass-card ${tier === t.name ? "border-gold" : ""}`}>
                  <CardContent className="p-5 text-center">
                    <p className="font-heading text-lg text-gold">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.visits} visits</p>
                    <p className="mt-2 text-sm">{t.reward}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
            {rewards.filter((r) => !r.redeemed).map((reward) => (
              <Card key={reward.id} className="glass-card border-gold/40">
                <CardContent className="flex items-center justify-between p-4">
                  <div>
                    <Badge className="gold-gradient mb-2 border-0">{reward.tier}</Badge>
                    <p>{reward.reward_description}</p>
                  </div>
                  <Button size="sm" variant="outline" className="border-gold/30">Redeem</Button>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
