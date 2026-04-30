import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Search, Users, Star, MapPin, ArrowRight, ShieldCheck, Loader2, ArrowLeft, SlidersHorizontal, X } from "lucide-react";
import logo from "@/assets/lokalpay-logo.png";
import { supabase } from "@/integrations/supabase/client";
import LanguageSwitcher from "@/components/LanguageSwitcher";

interface DirectoryProfile {
  user_id: string;
  display_name: string;
  market: string;
  lokalpay_id: string;
  score: number;
  score_level: string;
  total_transactions: number;
  avatar_initials: string | null;
  profile_type: string;
  verified: boolean;
  avg_rating: number;
  rating_count: number;
}

type SortKey = "score_desc" | "score_asc" | "tx_desc" | "rating_desc" | "name_asc";

const DirectoryPage = () => {
  const [profiles, setProfiles] = useState<DirectoryProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [marketFilter, setMarketFilter] = useState<string>("all");
  const [scoreRange, setScoreRange] = useState<[number, number]>([0, 100]);
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [sort, setSort] = useState<SortKey>("score_desc");
  const [advancedOpen, setAdvancedOpen] = useState(false);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("profiles")
        .select("user_id, display_name, market, lokalpay_id, score, score_level, total_transactions, avatar_initials, profile_type, verified, avg_rating, rating_count")
        .order("score", { ascending: false })
        .limit(200);
      if (data) setProfiles(data as DirectoryProfile[]);
      setLoading(false);
    })();
  }, []);

  const markets = useMemo(() => {
    const set = new Set<string>();
    profiles.forEach((p) => p.market && set.add(p.market));
    return Array.from(set).sort();
  }, [profiles]);

  const filtered = useMemo(() => {
    let result = profiles.filter((p) => {
      if (typeFilter !== "all" && p.profile_type !== typeFilter) return false;
      if (marketFilter !== "all" && p.market !== marketFilter) return false;
      if (verifiedOnly && !p.verified) return false;
      if (p.score < scoreRange[0] || p.score > scoreRange[1]) return false;
      if (search) {
        const q = search.toLowerCase();
        if (
          !p.display_name?.toLowerCase().includes(q) &&
          !p.lokalpay_id?.toLowerCase().includes(q) &&
          !p.market?.toLowerCase().includes(q)
        ) return false;
      }
      return true;
    });

    result.sort((a, b) => {
      switch (sort) {
        case "score_asc": return a.score - b.score;
        case "tx_desc": return b.total_transactions - a.total_transactions;
        case "rating_desc": return (b.avg_rating || 0) - (a.avg_rating || 0);
        case "name_asc": return (a.display_name || "").localeCompare(b.display_name || "");
        default: return b.score - a.score;
      }
    });

    return result;
  }, [profiles, search, typeFilter, marketFilter, scoreRange, verifiedOnly, sort]);

  const stats = useMemo(() => ({
    total: profiles.length,
    eligible: profiles.filter((p) => p.score >= 40).length,
    avgScore: profiles.length ? Math.round(profiles.reduce((s, p) => s + p.score, 0) / profiles.length) : 0,
  }), [profiles]);

  const activeFilterCount =
    (typeFilter !== "all" ? 1 : 0) +
    (marketFilter !== "all" ? 1 : 0) +
    (verifiedOnly ? 1 : 0) +
    (scoreRange[0] !== 0 || scoreRange[1] !== 100 ? 1 : 0);

  const resetFilters = () => {
    setTypeFilter("all");
    setMarketFilter("all");
    setScoreRange([0, 100]);
    setVerifiedOnly(false);
    setSort("score_desc");
    setSearch("");
  };

  const typeBadge = (type: string) => {
    const map: Record<string, { label: string; cls: string }> = {
      merchant: { label: "Commerçant", cls: "bg-primary/10 text-primary" },
      client: { label: "Client", cls: "bg-muted text-foreground" },
      microfinance: { label: "Microfinance", cls: "bg-lokalpay-gold/20 text-lokalpay-gold" },
      partner: { label: "Partenaire", cls: "bg-secondary text-secondary-foreground" },
    };
    const m = map[type] || map.merchant;
    return <Badge className={`${m.cls} text-[10px] px-2 py-0.5`}>{m.label}</Badge>;
  };

  return (
    <div className="min-h-screen bg-warm">
      <header className="bg-card/80 backdrop-blur-xl border-b border-border sticky top-0 z-40">
        <div className="container mx-auto flex items-center justify-between h-14 px-4">
          <Link to="/" className="flex items-center gap-2">
            <img src={logo} alt="LokalPay" className="h-8 w-8" />
            <span className="font-display font-bold text-lg">LokalPay</span>
          </Link>
          <div className="flex items-center gap-2">
            <LanguageSwitcher variant="compact" />
            <Button variant="ghost" size="sm" asChild>
              <Link to="/"><ArrowLeft className="h-4 w-4 mr-1" /> Accueil</Link>
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="text-center mb-8">
          <span className="inline-block text-xs font-semibold text-primary uppercase tracking-wide bg-primary/10 px-3 py-1 rounded-full">
            Annuaire public
          </span>
          <h1 className="font-display text-3xl md:text-4xl font-bold mt-4">Découvrez la communauté LokalPay</h1>
          <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
            Parcourez les profils vérifiés des commerçants, clients et institutions partenaires.
            Les informations sensibles restent privées par défaut.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <Card className="shadow-card border-0">
            <CardContent className="p-4 text-center">
              <Users className="h-5 w-5 text-primary mx-auto mb-1" />
              <p className="text-2xl font-display font-bold">{stats.total}</p>
              <p className="text-xs text-muted-foreground">Membres</p>
            </CardContent>
          </Card>
          <Card className="shadow-card border-0">
            <CardContent className="p-4 text-center">
              <ShieldCheck className="h-5 w-5 text-primary mx-auto mb-1" />
              <p className="text-2xl font-display font-bold">{stats.eligible}</p>
              <p className="text-xs text-muted-foreground">Éligibles crédit</p>
            </CardContent>
          </Card>
          <Card className="shadow-card border-0">
            <CardContent className="p-4 text-center">
              <Star className="h-5 w-5 text-lokalpay-gold mx-auto mb-1" />
              <p className="text-2xl font-display font-bold">{stats.avgScore}</p>
              <p className="text-xs text-muted-foreground">Score moyen</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="shadow-card border-0 mb-6">
          <CardContent className="p-4 space-y-3">
            {/* Search + main controls */}
            <div className="flex flex-col md:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher par nom, ID LokalPay ou marché..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={sort} onValueChange={(v) => setSort(v as SortKey)}>
                <SelectTrigger className="w-full md:w-48"><SelectValue placeholder="Trier" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="score_desc">Score (élevé → bas)</SelectItem>
                  <SelectItem value="score_asc">Score (bas → élevé)</SelectItem>
                  <SelectItem value="tx_desc">Plus de transactions</SelectItem>
                  <SelectItem value="rating_desc">Meilleures notes</SelectItem>
                  <SelectItem value="name_asc">Nom (A → Z)</SelectItem>
                </SelectContent>
              </Select>
              <Collapsible open={advancedOpen} onOpenChange={setAdvancedOpen}>
                <CollapsibleTrigger asChild>
                  <Button variant="outline" className="w-full md:w-auto gap-2">
                    <SlidersHorizontal className="h-4 w-4" />
                    Filtres avancés
                    {activeFilterCount > 0 && (
                      <Badge className="bg-primary text-primary-foreground h-5 px-1.5 text-[10px]">
                        {activeFilterCount}
                      </Badge>
                    )}
                  </Button>
                </CollapsibleTrigger>
              </Collapsible>
            </div>

            {/* Advanced filters */}
            <Collapsible open={advancedOpen} onOpenChange={setAdvancedOpen}>
              <CollapsibleContent className="space-y-4 pt-3 border-t border-border/50">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Type de profil</label>
                    <Select value={typeFilter} onValueChange={setTypeFilter}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tous les profils</SelectItem>
                        <SelectItem value="merchant">Commerçants</SelectItem>
                        <SelectItem value="client">Clients</SelectItem>
                        <SelectItem value="microfinance">Microfinances</SelectItem>
                        <SelectItem value="partner">Partenaires</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Marché / ville</label>
                    <Select value={marketFilter} onValueChange={setMarketFilter}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tous les marchés</SelectItem>
                        {markets.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-xs font-medium text-muted-foreground">Plage de score</label>
                    <span className="text-xs font-bold text-foreground">{scoreRange[0]} → {scoreRange[1]}</span>
                  </div>
                  <Slider
                    value={scoreRange}
                    onValueChange={(v) => setScoreRange(v as [number, number])}
                    min={0}
                    max={100}
                    step={5}
                    className="mt-2"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={verifiedOnly}
                      onChange={(e) => setVerifiedOnly(e.target.checked)}
                      className="h-4 w-4 rounded border-border accent-primary"
                    />
                    <span className="text-sm flex items-center gap-1">
                      <ShieldCheck className="h-3.5 w-3.5 text-primary" /> Profils vérifiés uniquement
                    </span>
                  </label>
                  {activeFilterCount > 0 && (
                    <Button variant="ghost" size="sm" onClick={resetFilters} className="gap-1 text-xs">
                      <X className="h-3 w-3" /> Réinitialiser
                    </Button>
                  )}
                </div>
              </CollapsibleContent>
            </Collapsible>
          </CardContent>
        </Card>

        {/* Result count */}
        {!loading && (
          <div className="flex items-center justify-between mb-4 px-1">
            <p className="text-sm text-muted-foreground">
              <span className="font-bold text-foreground">{filtered.length}</span> profil{filtered.length > 1 ? "s" : ""} trouvé{filtered.length > 1 ? "s" : ""}
            </p>
            {search && (
              <Button variant="ghost" size="sm" onClick={() => setSearch("")} className="gap-1 text-xs">
                <X className="h-3 w-3" /> Effacer la recherche
              </Button>
            )}
          </div>
        )}

        {/* Grid */}
        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
        ) : filtered.length === 0 ? (
          <Card className="shadow-card border-0">
            <CardContent className="p-12 text-center text-muted-foreground">
              <Search className="h-10 w-10 mx-auto mb-3 opacity-30" />
              <p className="font-medium text-foreground">Aucun profil ne correspond à vos critères.</p>
              <p className="text-sm mt-1">Essayez d'élargir votre recherche ou de réinitialiser les filtres.</p>
              {activeFilterCount > 0 && (
                <Button variant="outline" size="sm" className="mt-4" onClick={resetFilters}>Réinitialiser</Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((p) => (
              <Card key={p.user_id} className="shadow-card border-0 hover:shadow-elevated transition-all hover:-translate-y-1">
                <CardContent className="p-5">
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-hero flex items-center justify-center shrink-0">
                      <span className="font-display font-bold text-primary-foreground">
                        {p.avatar_initials || p.display_name?.substring(0, 2).toUpperCase() || "?"}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <h3 className="font-display font-bold truncate">{p.display_name || "Anonyme"}</h3>
                        {p.verified && <ShieldCheck className="h-3.5 w-3.5 text-primary shrink-0" />}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                        <MapPin className="h-3 w-3" />
                        <span className="truncate">{p.market || "Brazzaville"}</span>
                      </div>
                      <div className="mt-1.5">{typeBadge(p.profile_type)}</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-border/50 text-center">
                    <div>
                      <p className="font-display text-lg font-bold text-primary">{p.score}</p>
                      <p className="text-[10px] text-muted-foreground uppercase">Score</p>
                    </div>
                    <div>
                      <p className="font-display text-lg font-bold">{p.total_transactions}</p>
                      <p className="text-[10px] text-muted-foreground uppercase">Tx</p>
                    </div>
                    <div>
                      <div className="flex items-center justify-center gap-0.5">
                        <Star className="h-3 w-3 text-lokalpay-gold fill-lokalpay-gold" />
                        <p className="font-display text-lg font-bold">{p.avg_rating || "—"}</p>
                      </div>
                      <p className="text-[10px] text-muted-foreground uppercase">Note</p>
                    </div>
                  </div>

                  <Button variant="outline" size="sm" asChild className="w-full mt-4">
                    <Link to={`/profil/${p.lokalpay_id}`}>
                      Voir le profil <ArrowRight className="h-3 w-3 ml-1" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DirectoryPage;
