import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowLeft, Users, TrendingUp, CreditCard, DollarSign, Activity, Sparkles, Download, ShieldCheck } from "lucide-react";
import Can from "@/components/Can";
import { supabase } from "@/integrations/supabase/client";
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid,
  BarChart, Bar, PieChart, Pie, Cell, Legend,
} from "recharts";
import logo from "@/assets/lokalpay-logo.png";

const COLORS = ["hsl(142 60% 48%)", "hsl(38 70% 55%)", "hsl(18 60% 50%)", "hsl(150 30% 30%)"];

const AdminDashboardPage = () => {
  const [stats, setStats] = useState({ users: 0, tx: 0, volume: 0, eligible: 0, avgScore: 0 });
  const [monthly, setMonthly] = useState<{ month: string; tx: number; vol: number }[]>([]);
  const [planMix, setPlanMix] = useState<{ name: string; value: number }[]>([]);

  useEffect(() => {
    (async () => {
      const { data: profiles } = await supabase.from("profiles").select("score,total_volume,subscription_plan");
      const { data: txs } = await supabase
        .from("transactions")
        .select("created_at,montant")
        .order("created_at", { ascending: false })
        .limit(1000);

      if (profiles) {
        const eligible = profiles.filter((p: any) => p.score >= 60).length;
        const avg = profiles.length ? Math.round(profiles.reduce((s: number, p: any) => s + (p.score || 0), 0) / profiles.length) : 0;
        const planCount: Record<string, number> = {};
        profiles.forEach((p: any) => { planCount[p.subscription_plan || "free"] = (planCount[p.subscription_plan || "free"] || 0) + 1; });
        setPlanMix(Object.entries(planCount).map(([name, value]) => ({ name, value })));
        setStats((s) => ({ ...s, users: profiles.length, eligible, avgScore: avg }));
      }
      if (txs) {
        const totalVol = txs.reduce((s: number, t: any) => s + (t.montant || 0), 0);
        setStats((s) => ({ ...s, tx: txs.length, volume: totalVol }));

        const buckets: Record<string, { tx: number; vol: number }> = {};
        txs.forEach((t: any) => {
          const d = new Date(t.created_at);
          const k = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
          buckets[k] = buckets[k] || { tx: 0, vol: 0 };
          buckets[k].tx += 1;
          buckets[k].vol += t.montant || 0;
        });
        const series = Object.entries(buckets)
          .sort(([a], [b]) => a.localeCompare(b))
          .slice(-6)
          .map(([month, v]) => ({ month: month.slice(5), ...v }));
        setMonthly(series);
      }
    })();
  }, []);

  const cards = [
    { icon: Users, label: "Utilisateurs", value: stats.users.toLocaleString(), accent: "text-primary" },
    { icon: Activity, label: "Transactions", value: stats.tx.toLocaleString(), accent: "text-secondary" },
    { icon: DollarSign, label: "Volume total", value: `${(stats.volume / 1_000_000).toFixed(1)}M FCFA`, accent: "text-lokalpay-gold" },
    { icon: TrendingUp, label: "Score moyen", value: `${stats.avgScore}/100`, accent: "text-primary" },
    { icon: CreditCard, label: "Éligibles crédit", value: stats.eligible.toLocaleString(), accent: "text-accent" },
  ];

  return (
    <div className="min-h-screen bg-warm">
      <header className="bg-card/80 backdrop-blur-xl border-b border-border sticky top-0 z-40">
        <div className="container mx-auto flex items-center justify-between h-14 px-4">
          <div className="flex items-center gap-2">
            <img src={logo} alt="LokalPay" className="h-8 w-8" />
            <span className="font-display font-bold text-lg">LokalPay</span>
            <Badge className="text-xs">Admin</Badge>
          </div>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/"><ArrowLeft className="h-4 w-4 mr-1" />Accueil</Link>
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold">Tableau de bord administrateur</h1>
            <p className="text-sm text-muted-foreground">Vue globale de l'écosystème LokalPay Congo</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Can permission="admin.export_data">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const rows = [["month", "transactions", "volume_fcfa"], ...monthly.map((m) => [m.month, m.tx, m.vol])];
                  const csv = rows.map((r) => r.join(",")).join("\n");
                  const blob = new Blob([csv], { type: "text/csv" });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url; a.download = "admin-stats.csv"; a.click();
                  URL.revokeObjectURL(url);
                }}
              >
                <Download className="h-4 w-4 mr-1" /> Exporter données
              </Button>
            </Can>
            <Can permission="users.manage">
              <Button variant="outline" size="sm" asChild>
                <Link to="/admin"><Users className="h-4 w-4 mr-1" /> Utilisateurs</Link>
              </Button>
            </Can>
            <Can permission="roles.manage">
              <Button variant="outline" size="sm">
                <ShieldCheck className="h-4 w-4 mr-1" /> Rôles & permissions
              </Button>
            </Can>
            <Can permission="microfinance.manage">
              <Button variant="hero" size="sm" asChild>
                <Link to="/microfinance"><Sparkles className="h-4 w-4 mr-1" /> Portail Microfinance</Link>
              </Button>
            </Can>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {cards.map((c, i) => (
            <Card key={i} className="border-0 shadow-card animate-fade-up" style={{ animationDelay: `${i * 60}ms` }}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <c.icon className={`h-5 w-5 ${c.accent}`} />
                </div>
                <p className="text-xs text-muted-foreground mt-2">{c.label}</p>
                <p className="font-display font-bold text-xl">{c.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="border-0 shadow-card lg:col-span-2">
            <CardHeader><CardTitle className="font-display text-base">Croissance mensuelle</CardTitle></CardHeader>
            <CardContent className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthly}>
                  <defs>
                    <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="hsl(142 60% 48%)" stopOpacity={0.6} />
                      <stop offset="100%" stopColor="hsl(142 60% 48%)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 12 }} />
                  <Area type="monotone" dataKey="tx" stroke="hsl(142 60% 48%)" fill="url(#g1)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-card">
            <CardHeader><CardTitle className="font-display text-base">Plans</CardTitle></CardHeader>
            <CardContent className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={planMix} dataKey="value" nameKey="name" outerRadius={80} label>
                    {planMix.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <Card className="border-0 shadow-card">
          <CardHeader><CardTitle className="font-display text-base">Volume par mois (FCFA)</CardTitle></CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthly}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 12 }} />
                <Bar dataKey="vol" fill="hsl(38 70% 55%)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
