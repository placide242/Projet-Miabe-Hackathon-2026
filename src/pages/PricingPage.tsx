import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Check, ArrowLeft, Crown, Loader2, Sparkles } from "lucide-react";
import { PLANS, PlanId } from "@/lib/plans";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import logo from "@/assets/lokalpay-logo.png";
import LanguageSwitcher from "@/components/LanguageSwitcher";

const PricingPage = () => {
  const { user, profile, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState<PlanId | null>(null);

  const activate = async (plan: PlanId) => {
    if (!user) {
      navigate("/register");
      return;
    }
    setLoading(plan);
    const planObj = PLANS.find((p) => p.id === plan)!;

    const { error: profErr } = await supabase
      .from("profiles")
      .update({
        subscription_plan: plan,
        verified: plan !== "free",
      })
      .eq("user_id", user.id);

    if (!profErr) {
      await supabase.from("subscriptions").insert({
        user_id: user.id,
        plan,
        amount_fcfa: planObj.price,
        expires_at: plan === "free" ? null : new Date(Date.now() + 30 * 86400000).toISOString(),
      });
    }

    setLoading(null);
    if (profErr) {
      toast({ title: "Erreur", description: profErr.message, variant: "destructive" });
    } else {
      toast({ title: "Abonnement activé", description: `Vous êtes maintenant en ${planObj.name}` });
      await refreshProfile();
      navigate("/dashboard");
    }
  };

  return (
    <div className="min-h-screen bg-warm">
      <header className="bg-card border-b border-border sticky top-0 z-40 shadow-card">
        <div className="container mx-auto flex items-center justify-between h-14 px-4">
          <Link to="/" className="flex items-center gap-2">
            <img src={logo} alt="LokalPay" className="h-8 w-8" />
            <span className="font-display font-bold text-lg">LokalPay</span>
          </Link>
          <div className="flex items-center gap-2">
            <LanguageSwitcher variant="compact" />
            <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-4 w-4" /> Retour
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-4">
            <Sparkles className="h-4 w-4" /> Choisissez votre formule
          </div>
          <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground">
            Une offre adaptée à chaque ambition
          </h1>
          <p className="text-muted-foreground mt-4 text-lg">
            Démarrez gratuitement, montez en gamme quand vous êtes prêt. Sans engagement.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {PLANS.map((plan) => {
            const current = profile?.subscription_plan === plan.id;
            return (
              <Card
                key={plan.id}
                className={`relative p-8 border-0 transition-all hover:scale-[1.02] ${
                  plan.highlight
                    ? "bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-elevated"
                    : "shadow-card bg-card"
                }`}
              >
                {plan.highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-lokalpay-gold text-foreground px-4 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                    <Crown className="h-3 w-3" /> POPULAIRE
                  </div>
                )}
                <h3 className="font-display text-2xl font-bold">{plan.name}</h3>
                <div className="mt-4">
                  <span className="font-display text-4xl font-bold">
                    {plan.price === 0 ? "0" : plan.price.toLocaleString()}
                  </span>
                  <span className={`ml-2 text-sm ${plan.highlight ? "opacity-80" : "text-muted-foreground"}`}>
                    FCFA / mois
                  </span>
                </div>

                <ul className="mt-6 space-y-3">
                  {plan.features.map((f, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <Check className={`h-5 w-5 flex-shrink-0 ${plan.highlight ? "text-lokalpay-gold" : "text-primary"}`} />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  variant={plan.highlight ? "gold" : "hero"}
                  className="w-full mt-8 h-12"
                  disabled={current || loading !== null}
                  onClick={() => activate(plan.id)}
                >
                  {loading === plan.id ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : current ? (
                    "Plan actuel"
                  ) : plan.price === 0 ? (
                    "Commencer gratuitement"
                  ) : (
                    `Activer ${plan.name}`
                  )}
                </Button>
              </Card>
            );
          })}
        </div>

        <p className="text-center text-xs text-muted-foreground mt-8">
          💡 Démo : l'activation est instantanée et sans paiement réel.
        </p>
      </div>
    </div>
  );
};

export default PricingPage;
