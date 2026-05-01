import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/landing/Navbar";
import FooterSection from "@/components/landing/FooterSection";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trophy, Medal, Crown, TrendingUp, Search, ShieldCheck, Loader2, Target } from "lucide-react";
import { REGIONS } from "@/lib/markets";

interface Row {
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
  profile_type: string;
}

const RankingPage = () => {
  const { user } = useAuth();
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [dept, setDept] = useState<string>("all");
  const [type, setType] = useState<string>("all");
  const [metric, setMetric] = useState<"score" | "volume" | "tx">("score");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const { data } = await supabase
        .from("profiles")
        .select("user_id, display_name, lokalpay_id, market, score, score_level, avatar_initials, total_transactions, total_volume, show_volume, verified, profile_type")
        .order("score", { ascending: false })
        .limit(500);
      setRows((data as Row[]) || []);
      setLoading(false);
    };
    load();
  }, []);

  const filtered = useMemo(() => {
    let r = rows;
    if (search.trim()) {
      const q = search.toLowerCase();
      r = r.filter(x =>
        x.display_name?.toLowerCase().includes(q) ||
        x.lokalpay_id?.toLowerCase().includes(q) ||
        x.market?.toLowerCase().includes(q)
      );
    }
    if (dept !== "all") r = r.filter(x => x.market?.toLowerCase().includes(dept.toLowerCase()));
    if (type !== "all") r = r.filter(x => x.profile_type === type);
    const sortKey = metric === "score" ? "score" : metric === "volume" ? "total_volume" : "total_transactions";
    return [...r].sort((a, b) => (b[sortKey] as number) - (a[sortKey] as number));
  }, [rows, search, dept, type, metric]);

  const myIndex = user ? filtered.findIndex(r => r.user_id === user.id) : -1;
  const me = myIndex >= 0 ? filtered[myIndex] : null;

  const medal = (i: number) => {
    if (i === 0) return <Crown className="h-5 w-5 text-yellow-500" />;
    if (i === 1) return <Medal className="h-5 w-5 text-gray-400" />;
    if (i === 2) return <Medal className="h-5 w-5 text-amber-700" />;
    return <span className="text-xs text-muted-foreground font-mono w-5 text-center">{i + 1}</span>;
  };

  const valueOf = (r: Row) => {
    if (metric === "volume") return r.show_volume ? `${(r.total_volume / 1000).toFixed(0)}k FCFA` : "Privé";
    if (metric === "tx") return `${r.total_transactions} tx`;
    return `${r.score} pts`;
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="mb-8 flex items-start gap-4">
            <div className="icon-chip bg-primary/15"><Trophy className="h-6 w-6 text-primary" /></div>
            <div>
              <h1 className="font-display text-3xl md:text-4xl font-bold">Classement national</h1>
              <p className="text-muted-foreground mt-1">Découvrez votre position parmi les commerçants du Congo.</p>
            </div>
          </div>

          {/* My position */}
          {me && (
            <Card className="mb-6 bg-gradient-to-br from-primary/15 to-primary/5 border-primary/30">
              <CardContent className="p-5 flex items-center gap-4">
                <div className="icon-chip bg-primary/25"><Target className="h-5 w-5 text-primary" /></div>
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground">Votre position actuelle</p>
                  <p className="font-display text-2xl font-bold">
                    #{myIndex + 1} <span className="text-sm font-normal text-muted-foreground">sur {filtered.length}</span>
                  </p>
                </div>
                <Badge className="bg-primary text-primary-foreground">{valueOf(me)}</Badge>
              </CardContent>
            </Card>
          )}

          {/* Filters */}
          <Card className="mb-6 bg-gradient-card border-border/50">
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center gap-3">
                <Search className="h-4 w-4 text-muted-foreground" />
                <Input placeholder="Rechercher un nom, ID ou marché…" value={search} onChange={e => setSearch(e.target.value)} className="h-10" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <Select value={dept} onValueChange={setDept}>
                  <SelectTrigger><SelectValue placeholder="Département" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les départements</SelectItem>
                    {REGIONS.map(d => <SelectItem key={d.id} value={d.name}>{d.name}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Select value={type} onValueChange={setType}>
                  <SelectTrigger><SelectValue placeholder="Type de profil" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les profils</SelectItem>
                    <SelectItem value="merchant">Commerçant</SelectItem>
                    <SelectItem value="microfinance">Microfinance</SelectItem>
                    <SelectItem value="ngo">ONG</SelectItem>
                    <SelectItem value="cooperative">Coopérative</SelectItem>
                  </SelectContent>
                </Select>
                <Tabs value={metric} onValueChange={(v) => setMetric(v as any)}>
                  <TabsList className="w-full">
                    <TabsTrigger value="score" className="flex-1">Score</TabsTrigger>
                    <TabsTrigger value="volume" className="flex-1">Volume</TabsTrigger>
                    <TabsTrigger value="tx" className="flex-1">Trans.</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </CardContent>
          </Card>

          {loading ? (
            <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
          ) : (
            <div className="space-y-2">
              {filtered.slice(0, 100).map((r, i) => {
                const isMe = user?.id === r.user_id;
                return (
                  <Card key={r.user_id} className={`transition ${isMe ? "border-primary bg-primary/5" : "bg-gradient-card border-border/50 hover:border-primary/40"}`}>
                    <CardContent className="p-3 flex items-center gap-3">
                      <div className="w-8 flex justify-center">{medal(i)}</div>
                      <div className="w-11 h-11 rounded-xl bg-primary/15 text-primary font-bold flex items-center justify-center shrink-0">
                        {r.avatar_initials || r.display_name?.[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <Link to={`/profil/${r.lokalpay_id}`} className="flex items-center gap-1.5 font-medium truncate hover:text-primary">
                          {r.display_name}
                          {r.verified && <ShieldCheck className="h-3.5 w-3.5 text-primary shrink-0" />}
                        </Link>
                        <p className="text-xs text-muted-foreground truncate">{r.lokalpay_id} · {r.market || "—"}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="font-display font-bold text-primary flex items-center gap-1 justify-end">
                          <TrendingUp className="h-3.5 w-3.5" /> {valueOf(r)}
                        </p>
                        <Badge variant="secondary" className="text-[10px] mt-0.5">{r.score_level}</Badge>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
              {filtered.length === 0 && (
                <Card><CardContent className="p-10 text-center text-muted-foreground">Aucun résultat</CardContent></Card>
              )}
            </div>
          )}
        </div>
      </main>
      <FooterSection />
    </div>
  );
};

export default RankingPage;
