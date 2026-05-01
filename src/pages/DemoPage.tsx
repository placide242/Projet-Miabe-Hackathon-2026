import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { ArrowLeft, Play, CheckCircle2, Sparkles, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { generateTxHash } from "@/lib/plans";

const STEPS = [
  "Génération de 10 transactions réalistes",
  "Recalcul automatique du score de réputation",
  "Analyse par l'agent microfinance",
  "Décision de crédit",
  "Approbation et notification du commerçant",
];

const SAMPLE_PARTNERS = ["Marché Total", "Boulangerie Plateau", "Coopérative Moungali", "Grossiste Poto-Poto", "Boutique Bacongo"];
const SAMPLE_PRODUCTS = ["Sacs de farine", "Boissons", "Tissus", "Riz 25kg", "Huile végétale", "Sucre", "Lait", "Conserves"];

const DemoPage = () => {
  const { user, profile, refreshProfile } = useAuth();
  const { toast } = useToast();
  const [running, setRunning] = useState(false);
  const [step, setStep] = useState(-1);
  const [done, setDone] = useState(false);
  const [decision, setDecision] = useState<"approved" | "review" | "rejected" | null>(null);
  const [creditAmount, setCreditAmount] = useState(0);

  const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

  const runDemo = async () => {
    if (!user) {
      toast({ title: "Connexion requise", description: "Connectez-vous pour lancer la démonstration", variant: "destructive" });
      return;
    }
    setRunning(true); setDone(false); setDecision(null); setStep(0);

    // Step 1 — generate transactions
    const rows = Array.from({ length: 10 }).map(() => ({
      user_id: user.id,
      montant: Math.round(5000 + Math.random() * 95000),
      partenaire: SAMPLE_PARTNERS[Math.floor(Math.random() * SAMPLE_PARTNERS.length)],
      produit: SAMPLE_PRODUCTS[Math.floor(Math.random() * SAMPLE_PRODUCTS.length)],
      type: Math.random() > 0.5 ? "vente" : "achat",
      synced: true,
      tx_hash: generateTxHash(),
      blockchain_status: "confirmed",
    }));
    await supabase.from("transactions").insert(rows);
    await sleep(900); setStep(1);

    // Step 2 — score recalc (trigger does it; just refresh)
    await sleep(800);
    await refreshProfile();
    setStep(2);

    // Step 3 — microfinance analysis
    await sleep(900); setStep(3);

    // Step 4 — decision
    await refreshProfile();
    const score = (profile?.score || 0) + 10; // optimistic post-tx bump
    const recommended = Math.round((profile?.total_volume || 100000) * 0.3);
    setCreditAmount(Math.max(50000, recommended));
    if (score >= 75) setDecision("approved");
    else if (score >= 55) setDecision("review");
    else setDecision("approved"); // demo always succeeds
    await sleep(700); setStep(4);

    await sleep(700); setDone(true); setRunning(false);
    toast({ title: "🎉 Démonstration terminée", description: "Crédit approuvé avec succès !" });
  };

  const progress = step < 0 ? 0 : ((step + 1) / STEPS.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-hero">
      <header className="bg-card/70 backdrop-blur-xl border-b border-border sticky top-0 z-40">
        <div className="container mx-auto flex items-center justify-between h-14 px-4">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <span className="font-display font-bold text-lg">Démonstration Live</span>
          </div>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/"><ArrowLeft className="h-4 w-4 mr-1" />Accueil</Link>
          </Button>
        </div>
      </header>

      <div className="container mx-auto max-w-3xl px-4 py-10 space-y-6">
        <Card className="border-0 shadow-elevated">
          <CardHeader>
            <CardTitle className="font-display text-2xl">Comment LokalPay débloque le crédit</CardTitle>
            <p className="text-sm text-muted-foreground">
              Lancez une démonstration complète : génération de transactions, calcul du score, analyse par la microfinance et décision finale.
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            <Button variant="hero" size="lg" onClick={runDemo} disabled={running} className="w-full">
              {running ? <Loader2 className="h-5 w-5 animate-spin" /> : <Play className="h-5 w-5" />}
              {running ? "Démonstration en cours…" : "Voir démonstration"}
            </Button>

            {step >= 0 && (
              <div className="space-y-4">
                <Progress value={progress} className="h-2" />
                <div className="space-y-2">
                  {STEPS.map((label, i) => (
                    <div
                      key={i}
                      className={`flex items-center gap-3 p-3 rounded-xl transition-all ${
                        i < step ? "bg-primary/5" : i === step ? "bg-primary/10 ring-1 ring-primary/30" : "opacity-50"
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                        i < step ? "bg-primary text-primary-foreground" : i === step ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"
                      }`}>
                        {i < step ? <CheckCircle2 className="h-4 w-4" /> : i + 1}
                      </div>
                      <span className="text-sm font-medium">{label}</span>
                      {i === step && running && <Loader2 className="h-4 w-4 animate-spin text-primary ml-auto" />}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {done && (
              <div className="animate-scale-in rounded-2xl bg-gradient-warm p-6 text-center space-y-3">
                <div className="mx-auto w-16 h-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-glow">
                  <CheckCircle2 className="h-8 w-8" />
                </div>
                <Badge className="text-xs">Décision finale</Badge>
                <h3 className="font-display text-2xl font-bold">Crédit approuvé !</h3>
                <p className="text-3xl font-display font-bold text-primary">{creditAmount.toLocaleString()} FCFA</p>
                <p className="text-sm text-foreground/80">Le commerçant peut récupérer le montant chez le partenaire microfinance.</p>
                <div className="flex gap-2 justify-center pt-2">
                  <Button variant="hero" size="sm" asChild><Link to="/dashboard">Voir tableau de bord</Link></Button>
                  <Button variant="outline" size="sm" asChild><Link to="/microfinance">Portail Microfinance</Link></Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DemoPage;
