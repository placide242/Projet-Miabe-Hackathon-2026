import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Search, CheckCircle, CreditCard, Phone, Download,
  Building2, BarChart3, Users, ArrowLeft, Star
} from "lucide-react";
import { Link } from "react-router-dom";
import logo from "@/assets/lokalpay-logo.png";
import { supabase } from "@/integrations/supabase/client";

interface MerchantProfile {
  id: string;
  user_id: string;
  display_name: string;
  market: string;
  lokalpay_id: string;
  score: number;
  score_level: string;
  total_transactions: number;
  total_volume: number;
  phone: string;
}

const getRiskLabel = (score: number) => {
  if (score >= 80) return { label: "très faible", color: "text-primary" };
  if (score >= 60) return { label: "faible", color: "text-primary" };
  if (score >= 40) return { label: "modéré", color: "text-lokalpay-gold" };
  return { label: "élevé", color: "text-destructive" };
};

const MicrofinancePage = () => {
  const [merchants, setMerchants] = useState<MerchantProfile[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [scoreMin, setScoreMin] = useState("");
  const [selected, setSelected] = useState<MerchantProfile | null>(null);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase.from("profiles").select("*").gt("total_transactions", 0);
      if (data) setMerchants(data as MerchantProfile[]);
    };
    fetch();
  }, []);

  const filtered = merchants.filter((m) => {
    const matchesSearch = m.display_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.lokalpay_id.includes(searchQuery);
    const matchesScore = scoreMin ? m.score >= Number(scoreMin) : true;
    return matchesSearch && matchesScore;
  });

  const exportCSV = () => {
    const header = "ID,Nom,Marché,Score,Volume,Risque\n";
    const rows = filtered.slice(0, 500).map(m =>
      `${m.lokalpay_id},${m.display_name},${m.market},${m.score},${m.total_volume},${getRiskLabel(m.score).label}`
    ).join("\n");
    const blob = new Blob([header + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "commercants_lokalpay.csv"; a.click();
  };

  const creditRecommended = (m: MerchantProfile) =>
    Math.round((m.total_volume / Math.max(m.total_transactions, 1)) * 0.3);

  return (
    <div className="min-h-screen bg-warm">
      <header className="bg-card border-b border-border sticky top-0 z-40">
        <div className="container mx-auto flex items-center justify-between h-14 px-4">
          <div className="flex items-center gap-2">
            <img src={logo} alt="LokalPay" className="h-8 w-8" />
            <span className="font-display font-bold text-lg text-foreground">LokalPay</span>
            <Badge variant="secondary" className="text-xs">Microfinance</Badge>
          </div>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/"><ArrowLeft className="h-4 w-4 mr-1" /> Accueil</Link>
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: Users, label: "Commerçants", value: String(merchants.length) },
            { icon: BarChart3, label: "Score moyen", value: merchants.length ? `${Math.round(merchants.reduce((s, m) => s + m.score, 0) / merchants.length)}/100` : "—" },
            { icon: CreditCard, label: "Éligibles (≥40)", value: String(merchants.filter(m => m.score >= 40).length) },
            { icon: Building2, label: "Volume total", value: `${Math.round(merchants.reduce((s, m) => s + m.total_volume, 0) / 1000000)}M FCFA` },
          ].map((stat, i) => (
            <Card key={i} className="shadow-card border-0">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <stat.icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                  <p className="font-display font-bold text-foreground">{stat.value}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Search */}
        <Card className="shadow-card border-0">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Rechercher par ID ou nom..." className="pl-10"
                  value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
              </div>
              <Select onValueChange={setScoreMin}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Score minimum" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">Tous les scores</SelectItem>
                  <SelectItem value="40">≥ 40 (Bronze+)</SelectItem>
                  <SelectItem value="60">≥ 60 (Argent+)</SelectItem>
                  <SelectItem value="80">≥ 80 (Or)</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="icon" title="Exporter CSV" onClick={exportCSV}>
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card className="shadow-card border-0">
              <CardHeader>
                <CardTitle className="font-display text-lg">Commerçants</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-border">
                  {filtered.map((m) => {
                    const risk = getRiskLabel(m.score);
                    return (
                      <button key={m.id} onClick={() => setSelected(m)}
                        className={`w-full flex items-center justify-between px-6 py-4 hover:bg-muted/30 transition-colors text-left ${
                          selected?.id === m.id ? "bg-primary/5" : ""
                        }`}>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <span className="font-display font-bold text-primary text-sm">
                              {m.display_name.split(" ").map(w => w[0]).join("").substring(0, 2)}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-sm text-foreground">{m.display_name}</p>
                            <p className="text-xs text-muted-foreground">{m.lokalpay_id} · {m.market}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-display font-bold text-foreground">{m.score}/100</p>
                          <p className={`text-xs font-medium ${risk.color}`}>Risque {risk.label}</p>
                        </div>
                      </button>
                    );
                  })}
                  {filtered.length === 0 && (
                    <div className="px-6 py-12 text-center text-muted-foreground">
                      Aucun commerçant ne correspond aux critères.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <div>
            {selected ? (
              <Card className="shadow-elevated border-0 sticky top-20">
                <CardContent className="p-6 space-y-5">
                  <div className="text-center">
                    <div className="w-16 h-16 rounded-full bg-primary/10 mx-auto flex items-center justify-center">
                      <span className="font-display font-bold text-xl text-primary">
                        {selected.display_name.split(" ").map(w => w[0]).join("").substring(0, 2)}
                      </span>
                    </div>
                    <h3 className="font-display font-bold text-foreground mt-3">{selected.display_name}</h3>
                    <p className="text-xs text-muted-foreground">{selected.lokalpay_id}</p>
                  </div>
                  <div className="space-y-3">
                    {[
                      { label: "Score", value: `${selected.score}/100` },
                      { label: "Volume (12 mois)", value: `${selected.total_volume.toLocaleString()} FCFA` },
                      { label: "Transactions", value: String(selected.total_transactions) },
                      { label: "Risque estimé", value: getRiskLabel(selected.score).label, color: getRiskLabel(selected.score).color },
                    ].map((item, i) => (
                      <div key={i} className="flex justify-between text-sm">
                        <span className="text-muted-foreground">{item.label}</span>
                        <span className={`font-semibold ${(item as any).color || "text-foreground"}`}>{item.value}</span>
                      </div>
                    ))}
                  </div>
                  <div className="bg-primary/5 rounded-xl p-4 text-center">
                    <p className="text-xs text-muted-foreground">Crédit recommandé</p>
                    <p className="font-display text-2xl font-bold text-primary mt-1">
                      {creditRecommended(selected).toLocaleString()} FCFA
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-primary">
                    <CheckCircle className="h-4 w-4" />
                    <span>Score fiable – Historique vérifiable</span>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="hero" className="flex-1" asChild>
                      <Link to={`/profil/${selected.lokalpay_id}`}>Voir profil</Link>
                    </Button>
                    <Button variant="outline" className="flex-1">
                      <Phone className="h-4 w-4 mr-1" /> Contacter
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="shadow-card border-0">
                <CardContent className="p-12 text-center text-muted-foreground">
                  <Search className="h-10 w-10 mx-auto mb-3 opacity-50" />
                  <p className="text-sm">Sélectionnez un commerçant pour voir son profil</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MicrofinancePage;
