import { useEffect, useMemo, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/landing/Navbar";
import FooterSection from "@/components/landing/FooterSection";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Search, ArrowUpRight, ArrowDownRight, CheckCircle, Clock,
  TrendingUp, Wallet, Users, ShieldCheck, Loader2, Eye, Download, SlidersHorizontal, X
} from "lucide-react";
import TransactionList from "@/components/dashboard/TransactionList";
import { exportTransactionsCSV } from "@/lib/receipt";

interface Profile {
  user_id: string;
  display_name: string;
  lokalpay_id: string;
  market: string;
  score: number;
  score_level: string;
  avatar_initials: string;
  total_transactions: number;
  total_volume: number;
  show_volume: boolean;
  verified: boolean;
}

interface Tx {
  id: string;
  user_id: string;
  montant: number;
  partenaire: string;
  produit: string;
  type: string;
  synced: boolean;
  created_at: string;
}

const TransactionsPage = () => {
  const { lokalpayId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [target, setTarget] = useState<Profile | null>(null);
  const [transactions, setTransactions] = useState<Tx[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "vente" | "achat">("all");
  const [searchResults, setSearchResults] = useState<Profile[]>([]);
  const [showAdv, setShowAdv] = useState(false);
  const [keyword, setKeyword] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [minAmount, setMinAmount] = useState("");
  const [maxAmount, setMaxAmount] = useState("");

  // Charger le profil + transactions cibles (le sien par défaut, ou par lokalpayId)
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      let profile: Profile | null = null;

      if (lokalpayId) {
        const { data } = await supabase
          .from("profiles")
          .select("user_id, display_name, lokalpay_id, market, score, score_level, avatar_initials, total_transactions, total_volume, show_volume, verified")
          .eq("lokalpay_id", lokalpayId)
          .maybeSingle();
        profile = data as Profile | null;
      } else if (user) {
        const { data } = await supabase
          .from("profiles")
          .select("user_id, display_name, lokalpay_id, market, score, score_level, avatar_initials, total_transactions, total_volume, show_volume, verified")
          .eq("user_id", user.id)
          .maybeSingle();
        profile = data as Profile | null;
      }

      setTarget(profile);

      if (profile) {
        const { data: txs } = await supabase
          .from("transactions")
          .select("id, user_id, montant, partenaire, produit, type, synced, created_at")
          .eq("user_id", profile.user_id)
          .order("created_at", { ascending: false })
          .limit(200);
        setTransactions((txs as Tx[]) || []);
      } else {
        setTransactions([]);
      }
      setLoading(false);
    };
    load();
  }, [lokalpayId, user]);

  // Recherche d'autres utilisateurs (annuaire rapide)
  useEffect(() => {
    const q = search.trim();
    if (q.length < 2) { setSearchResults([]); return; }
    const t = setTimeout(async () => {
      const { data } = await supabase
        .from("profiles")
        .select("user_id, display_name, lokalpay_id, market, score, score_level, avatar_initials, total_transactions, total_volume, show_volume, verified")
        .or(`display_name.ilike.%${q}%,lokalpay_id.ilike.%${q}%,market.ilike.%${q}%`)
        .limit(8);
      setSearchResults((data as Profile[]) || []);
    }, 250);
    return () => clearTimeout(t);
  }, [search]);

  const filtered = useMemo(() => {
    return transactions.filter(t => {
      if (filter !== "all" && t.type !== filter) return false;
      if (keyword) {
        const k = keyword.toLowerCase();
        if (!(t.produit || "").toLowerCase().includes(k) && !(t.partenaire || "").toLowerCase().includes(k)) return false;
      }
      if (dateFrom && new Date(t.created_at) < new Date(dateFrom)) return false;
      if (dateTo && new Date(t.created_at) > new Date(dateTo + "T23:59:59")) return false;
      const min = parseInt(minAmount); if (!isNaN(min) && t.montant < min) return false;
      const max = parseInt(maxAmount); if (!isNaN(max) && t.montant > max) return false;
      return true;
    });
  }, [transactions, filter, keyword, dateFrom, dateTo, minAmount, maxAmount]);

  const resetAdv = () => { setKeyword(""); setDateFrom(""); setDateTo(""); setMinAmount(""); setMaxAmount(""); };
  const advCount = [keyword, dateFrom, dateTo, minAmount, maxAmount].filter(Boolean).length;

  const stats = useMemo(() => {
    const ventes = transactions.filter(t => t.type === "vente");
    const achats = transactions.filter(t => t.type === "achat");
    const totalVentes = ventes.reduce((s, t) => s + t.montant, 0);
    const totalAchats = achats.reduce((s, t) => s + t.montant, 0);
    return {
      count: transactions.length,
      ventes: ventes.length,
      achats: achats.length,
      totalVentes,
      totalAchats,
      net: totalVentes - totalAchats,
    };
  }, [transactions]);

  const isOwner = user && target && user.id === target.user_id;
  const canSeeVolume = isOwner || (target?.show_volume ?? false);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-6xl">
          {/* Header */}
          <div className="mb-8">
            <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground">
              Transactions {isOwner ? "— Mes opérations" : target ? `de ${target.display_name}` : ""}
            </h1>
            <p className="text-muted-foreground mt-2">
              Consultez votre historique ou explorez les transactions publiques d'autres commerçants.
            </p>
          </div>

          {/* Search */}
          <Card className="bg-gradient-card border-border/50 shadow-card mb-8">
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <div className="icon-chip"><Search className="h-5 w-5" /></div>
                <Input
                  placeholder="Rechercher un commerçant, un ID LokalPay (ex. LK-CG-1234) ou un marché…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="flex-1 h-12 text-base bg-background/60"
                />
              </div>
              {searchResults.length > 0 && (
                <div className="mt-4 grid sm:grid-cols-2 gap-2">
                  {searchResults.map((p) => (
                    <button
                      key={p.user_id}
                      onClick={() => { setSearch(""); setSearchResults([]); navigate(`/transactions/${p.lokalpay_id}`); }}
                      className="flex items-center gap-3 p-3 rounded-xl bg-background/60 hover:bg-primary/10 border border-border/40 text-left transition"
                    >
                      <div className="w-10 h-10 rounded-xl bg-primary/15 text-primary font-bold flex items-center justify-center">
                        {p.avatar_initials || p.display_name?.[0]}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-sm truncate">{p.display_name}</p>
                        <p className="text-xs text-muted-foreground truncate">
                          {p.lokalpay_id} · {p.market || "—"}
                        </p>
                      </div>
                      <Badge variant="secondary" className="shrink-0">{p.score_level}</Badge>
                    </button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {!target && !loading && (
            <Card className="bg-gradient-card border-border/50">
              <CardContent className="p-10 text-center">
                <Eye className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
                <p className="font-medium">Aucun profil sélectionné</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {user ? "Recherchez un commerçant ci-dessus pour voir son historique public." : (
                    <>Veuillez <Link to="/login" className="text-primary underline">vous connecter</Link> pour voir vos transactions.</>
                  )}
                </p>
              </CardContent>
            </Card>
          )}

          {loading && (
            <div className="flex justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          )}

          {target && !loading && (
            <>
              {/* Profile + Stats */}
              <div className="grid md:grid-cols-3 gap-4 mb-6">
                <Card className="md:col-span-1 bg-gradient-card border-border/50 shadow-card">
                  <CardContent className="p-5 flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-primary/15 text-primary flex items-center justify-center font-display font-bold text-xl ring-1 ring-primary/30">
                      {target.avatar_initials || target.display_name?.[0]}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <p className="font-display font-semibold truncate">{target.display_name}</p>
                        {target.verified && <ShieldCheck className="h-4 w-4 text-primary shrink-0" />}
                      </div>
                      <p className="text-xs text-muted-foreground truncate">{target.lokalpay_id}</p>
                      <p className="text-xs text-muted-foreground truncate">{target.market || "—"}</p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-card border-border/50 shadow-card">
                  <CardContent className="p-5">
                    <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
                      <Users className="h-4 w-4" /> Transactions totales
                    </div>
                    <p className="font-display text-2xl font-bold">{stats.count}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {stats.ventes} ventes · {stats.achats} achats
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-card border-border/50 shadow-card">
                  <CardContent className="p-5">
                    <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
                      <TrendingUp className="h-4 w-4" /> Score réputation
                    </div>
                    <div className="flex items-baseline gap-2">
                      <p className="font-display text-2xl font-bold text-primary">{target.score}</p>
                      <Badge variant="secondary">{target.score_level}</Badge>
                    </div>
                    {canSeeVolume && (
                      <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                        <Wallet className="h-3 w-3" /> Volume {target.total_volume.toLocaleString()} FCFA
                      </p>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Filters */}
              <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                <Tabs value={filter} onValueChange={(v) => setFilter(v as any)}>
                  <TabsList>
                    <TabsTrigger value="all">Tout ({transactions.length})</TabsTrigger>
                    <TabsTrigger value="vente" className="gap-1">
                      <ArrowUpRight className="h-3.5 w-3.5" /> Ventes ({stats.ventes})
                    </TabsTrigger>
                    <TabsTrigger value="achat" className="gap-1">
                      <ArrowDownRight className="h-3.5 w-3.5" /> Achats ({stats.achats})
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => setShowAdv(s => !s)}>
                    <SlidersHorizontal className="h-4 w-4 mr-1" /> Filtres {advCount > 0 && <Badge variant="secondary" className="ml-1.5 h-5">{advCount}</Badge>}
                  </Button>
                  {isOwner && (
                    <Button variant="outline" size="sm" onClick={() => exportTransactionsCSV(filtered)}>
                      <Download className="h-4 w-4 mr-1" /> Exporter CSV
                    </Button>
                  )}
                  {!isOwner && user && (
                    <Button variant="outline" size="sm" asChild>
                      <Link to="/transactions">Mes transactions</Link>
                    </Button>
                  )}
                </div>
              </div>

              {showAdv && (
                <Card className="mb-4 bg-gradient-card border-border/50">
                  <CardContent className="p-4 grid grid-cols-2 md:grid-cols-5 gap-3">
                    <div className="col-span-2 md:col-span-1">
                      <label className="text-xs text-muted-foreground">Mot-clé</label>
                      <Input value={keyword} onChange={e => setKeyword(e.target.value)} placeholder="Produit, partenaire" />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground">Du</label>
                      <Input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground">Au</label>
                      <Input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground">Montant min</label>
                      <Input type="number" value={minAmount} onChange={e => setMinAmount(e.target.value)} placeholder="FCFA" />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground">Montant max</label>
                      <Input type="number" value={maxAmount} onChange={e => setMaxAmount(e.target.value)} placeholder="FCFA" />
                    </div>
                    {advCount > 0 && (
                      <div className="col-span-2 md:col-span-5 flex justify-end">
                        <Button size="sm" variant="ghost" onClick={resetAdv}><X className="h-3.5 w-3.5 mr-1" /> Réinitialiser</Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              <p className="text-xs text-muted-foreground mb-2">{filtered.length} transaction(s) affichée(s)</p>
              <TransactionList transactions={filtered} />
            </>
          )}
        </div>
      </main>
      <FooterSection />
    </div>
  );
};

export default TransactionsPage;
