import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Star, CheckCircle, Shield, TrendingUp, Calendar, BarChart3, ArrowLeft, Loader2, Wallet, AlertTriangle, Smartphone, Phone, Mail, ShieldCheck, Lock, Eye, EyeOff, XCircle } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";
import logo from "@/assets/lokalpay-logo.png";
import { supabase } from "@/integrations/supabase/client";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "@/components/LanguageSwitcher";

interface ProfileData {
  display_name: string;
  market: string;
  lokalpay_id: string;
  score: number;
  score_level: string;
  total_transactions: number;
  total_volume: number;
  avatar_initials: string;
  phone: string;
  email: string;
  user_id: string;
  solvency_score: number;
  reliability_pct: number;
  debt_capacity: number;
  show_phone: boolean;
  show_email: boolean;
  show_volume: boolean;
  bio: string;
  verified: boolean;
  profile_type: string;
}

interface OperatorLink {
  operator_name: string;
  phone_number: string;
  is_primary: boolean;
}

const PublicProfilePage = () => {
  const { id } = useParams();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [avgRating, setAvgRating] = useState<number | null>(null);
  const [ratingCount, setRatingCount] = useState(0);
  const [operators, setOperators] = useState<OperatorLink[]>([]);
  const [recentTx, setRecentTx] = useState<any[]>([]);
  const { t } = useTranslation();

  useEffect(() => {
    const fetchProfile = async () => {
      const { data } = await supabase.from("profiles").select("*").eq("lokalpay_id", id).single();
      if (data) {
        const p = data as ProfileData;
        setProfile(p);

        const [evalsRes, opsRes, txRes] = await Promise.all([
          supabase.from("evaluations").select("note").eq("evaluated_id", p.user_id),
          supabase.from("operator_links").select("operator_name, phone_number, is_primary").eq("user_id", p.user_id),
          supabase.from("transactions").select("montant, type, produit, created_at").eq("user_id", p.user_id).order("created_at", { ascending: false }).limit(5),
        ]);

        if (evalsRes.data && evalsRes.data.length > 0) {
          const avg = evalsRes.data.reduce((s, e) => s + e.note, 0) / evalsRes.data.length;
          setAvgRating(Math.round(avg * 10) / 10);
          setRatingCount(evalsRes.data.length);
        }
        if (opsRes.data) setOperators(opsRes.data as OperatorLink[]);
        if (txRes.data) setRecentTx(txRes.data);
      }
      setLoading(false);
    };
    fetchProfile();
  }, [id]);

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-warm"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  if (!profile) return (
    <div className="min-h-screen flex items-center justify-center bg-warm">
      <Card className="shadow-card border-0 max-w-md"><CardContent className="p-8 text-center">
        <h2 className="font-display text-xl font-bold text-foreground">{t("profile.notFound")}</h2>
        <Button variant="hero" className="mt-4" asChild><Link to="/">{t("nav.back")}</Link></Button>
      </CardContent></Card>
    </div>
  );

  const score = profile.score;
  const profileUrl = typeof window !== "undefined" ? `${window.location.origin}/profil/${profile.lokalpay_id}` : "";
  const creditRecommended = Math.round((profile.total_volume / Math.max(profile.total_transactions, 1)) * 0.3);

  const reliabilityPct = profile.total_transactions > 0 ? Math.min(100, Math.round((score * 0.6 + (profile.total_transactions / 2)) + 10)) : 0;
  const solvencyLabel = score >= 70 ? "Excellente" : score >= 50 ? "Bonne" : score >= 30 ? "Moyenne" : "Faible";
  const debtCapacity = creditRecommended * 3;

  // ===== Credit qualification checklist =====
  const creditCriteria = [
    { label: "Identité vérifiée", met: profile.verified, weight: 20, why: "Confiance et conformité KYC" },
    { label: "Score ≥ 40", met: score >= 40, weight: 25, why: "Réputation transactionnelle suffisante" },
    { label: "Au moins 10 transactions", met: profile.total_transactions >= 10, weight: 20, why: "Historique d'activité" },
    { label: "Opérateur Mobile Money lié", met: operators.length > 0, weight: 15, why: "Canal de remboursement vérifiable" },
    { label: "Au moins 1 évaluation", met: ratingCount >= 1, weight: 10, why: "Avis tiers sur la fiabilité" },
    { label: "Régularité (score ≥ 50)", met: score >= 50, weight: 10, why: "Activité régulière dans le temps" },
  ];
  const qualificationScore = creditCriteria.reduce((s, c) => s + (c.met ? c.weight : 0), 0);
  const qualified = qualificationScore >= 60;

  // ===== Visibility checklist =====
  const visibilityItems = [
    { label: "Nom & ID LokalPay", visible: true, locked: true },
    { label: "Score & niveau", visible: true, locked: true },
    { label: "Nombre de transactions", visible: true, locked: true },
    { label: "Marché / localisation", visible: true, locked: true },
    { label: "Numéro de téléphone", visible: profile.show_phone, locked: false },
    { label: "Adresse email", visible: profile.show_email, locked: false },
    { label: "Volume exact des transactions", visible: profile.show_volume, locked: false },
  ];

  return (
    <div className="min-h-screen bg-warm">
      <header className="bg-card border-b border-border">
        <div className="container mx-auto flex items-center justify-between h-14 px-4">
          <div className="flex items-center gap-2">
            <img src={logo} alt="LokalPay" className="h-8 w-8" />
            <span className="font-display font-bold text-lg text-foreground">LokalPay</span>
          </div>
          <div className="flex items-center gap-2">
            <LanguageSwitcher variant="compact" />
            <Button variant="ghost" size="sm" asChild>
              <Link to="/dashboard"><ArrowLeft className="h-4 w-4 mr-1" /> {t("nav.back")}</Link>
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-lg space-y-6">
        {/* Profile Card */}
        <Card className="shadow-elevated border-0 overflow-hidden">
          <div className="h-24 bg-gradient-hero" />
          <CardContent className="p-6 -mt-12 text-center">
            <div className="w-20 h-20 bg-card rounded-full border-4 border-card mx-auto flex items-center justify-center shadow-elevated">
              <span className="font-display text-2xl font-bold text-primary">
                {profile.avatar_initials || profile.display_name.substring(0, 2).toUpperCase()}
              </span>
            </div>
            <h1 className="font-display text-xl font-bold text-foreground mt-3 flex items-center justify-center gap-1.5">
              {profile.display_name}
              {profile.verified && <ShieldCheck className="h-4 w-4 text-primary" />}
            </h1>
            <p className="text-muted-foreground text-sm">{profile.market || "Brazzaville"}</p>
            <p className="text-xs text-muted-foreground mt-1 font-mono">ID: {profile.lokalpay_id}</p>
            {profile.bio && <p className="text-sm text-foreground/80 mt-3 italic">"{profile.bio}"</p>}

            {(profile.show_phone || profile.show_email) && (
              <div className="flex flex-wrap justify-center gap-2 mt-3">
                {profile.show_phone && profile.phone && (
                  <Badge variant="outline" className="gap-1"><Phone className="h-3 w-3" /> {profile.phone}</Badge>
                )}
                {profile.show_email && profile.email && (
                  <Badge variant="outline" className="gap-1"><Mail className="h-3 w-3" /> {profile.email}</Badge>
                )}
              </div>
            )}

            <div className="mt-6">
              <div className="relative inline-block">
                <svg className="w-28 h-28" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="42" fill="none" stroke="hsl(var(--border))" strokeWidth="8" />
                  <circle cx="50" cy="50" r="42" fill="none" stroke="hsl(var(--primary))" strokeWidth="8"
                    strokeDasharray={`${score * 2.64} ${264 - score * 2.64}`}
                    strokeDashoffset="66" strokeLinecap="round" />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="font-display text-3xl font-bold text-foreground">{score}</span>
                </div>
              </div>
              <div className="mt-2">
                <Badge className={score >= 80 ? "bg-lokalpay-gold text-secondary-foreground" : score >= 60 ? "bg-muted text-foreground" : score >= 40 ? "bg-lokalpay-gold/40 text-foreground" : "bg-muted text-muted-foreground"}>
                  <Star className="h-3 w-3 mr-1" /> {profile.score_level}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* === NEW: Credit qualification summary === */}
        <Card className={`shadow-elevated border-0 overflow-hidden ${qualified ? "bg-primary/5" : "bg-card"}`}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Wallet className={`h-6 w-6 ${qualified ? "text-primary" : "text-muted-foreground"}`} />
                <h3 className="font-display font-bold text-foreground">Qualifié pour le crédit ?</h3>
              </div>
              <Badge className={qualified ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}>
                {qualified ? "Éligible" : "En cours"}
              </Badge>
            </div>

            <div className="mb-4">
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-xs text-muted-foreground">Score d'éligibilité</span>
                <span className="text-sm font-bold text-foreground">{qualificationScore}/100</span>
              </div>
              <Progress value={qualificationScore} className="h-2" />
              <p className="text-[11px] text-muted-foreground mt-1.5">
                Seuil minimum : 60/100 pour les microfinances partenaires
              </p>
            </div>

            <div className="space-y-2 pt-3 border-t border-border/50">
              {creditCriteria.map((c, i) => (
                <div key={i} className="flex items-start gap-2.5">
                  {c.met ? (
                    <CheckCircle className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="h-4 w-4 text-muted-foreground/50 shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className={`text-sm font-medium ${c.met ? "text-foreground" : "text-muted-foreground"}`}>
                        {c.label}
                      </p>
                      <span className="text-[10px] text-muted-foreground shrink-0">+{c.weight} pts</span>
                    </div>
                    <p className="text-[11px] text-muted-foreground">{c.why}</p>
                  </div>
                </div>
              ))}
            </div>

            {qualified && (
              <div className="mt-4 pt-4 border-t border-primary/20 text-center">
                <p className="text-xs text-muted-foreground">Crédit recommandé</p>
                <p className="font-display text-2xl font-bold text-primary">
                  {creditRecommended.toLocaleString()} FCFA
                </p>
                <p className="text-[11px] text-primary/70 mt-1">
                  Capacité de remboursement estimée : {debtCapacity.toLocaleString()} FCFA
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* === NEW: Visibility checklist === */}
        <Card className="shadow-card border-0">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-3">
              <Eye className="h-5 w-5 text-primary" />
              <h3 className="font-display font-bold text-foreground">Infos visibles publiquement</h3>
            </div>
            <p className="text-xs text-muted-foreground mb-4">
              Voici ce que le public peut voir sur ce profil. Les infos sensibles restent privées par défaut.
            </p>
            <div className="space-y-2">
              {visibilityItems.map((item, i) => (
                <div key={i} className="flex items-center justify-between py-1.5 border-b border-border/30 last:border-0">
                  <div className="flex items-center gap-2">
                    {item.visible ? (
                      <Eye className="h-3.5 w-3.5 text-primary" />
                    ) : (
                      <EyeOff className="h-3.5 w-3.5 text-muted-foreground" />
                    )}
                    <span className={`text-sm ${item.visible ? "text-foreground" : "text-muted-foreground"}`}>
                      {item.label}
                    </span>
                    {item.locked && <Lock className="h-3 w-3 text-muted-foreground" />}
                  </div>
                  <Badge variant="outline" className={`text-[10px] ${item.visible ? "border-primary/30 text-primary" : "border-muted text-muted-foreground"}`}>
                    {item.visible ? "Visible" : "Privé"}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Key stats */}
        <div className="grid grid-cols-2 gap-4">
          {[
            { icon: BarChart3, label: "Transactions", value: String(profile.total_transactions) },
            {
              icon: TrendingUp,
              label: "Volume total",
              value: profile.show_volume
                ? `${(profile.total_volume / 1000000).toFixed(2)}M FCFA`
                : "Privé",
              locked: !profile.show_volume,
            },
            { icon: Calendar, label: "Régularité", value: score >= 60 ? "Haute" : score >= 30 ? "Moyenne" : "Basse" },
            { icon: Shield, label: "Litiges", value: "0" },
          ].map((s, i) => (
            <Card key={i} className="shadow-card border-0">
              <CardContent className="p-4 text-center">
                <s.icon className="h-5 w-5 text-primary mx-auto mb-1" />
                <p className="text-xs text-muted-foreground">{s.label}</p>
                <p className="font-display font-bold text-foreground flex items-center justify-center gap-1">
                  {(s as any).locked && <Lock className="h-3 w-3 text-muted-foreground" />}
                  {s.value}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Reliability & Solvency */}
        <Card className="shadow-card border-0">
          <CardContent className="p-6 space-y-4">
            <h3 className="font-display font-bold text-foreground text-center">Indicateurs de Fiabilité</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Fiabilité transactions</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full" style={{ width: `${reliabilityPct}%` }} />
                  </div>
                  <span className="text-sm font-bold text-foreground">{reliabilityPct}%</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Solvabilité</span>
                <Badge className={score >= 50 ? "bg-primary/20 text-primary" : "bg-lokalpay-gold/20 text-lokalpay-gold"}>{solvencyLabel}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Capacité de remboursement</span>
                <span className="text-sm font-bold text-foreground">{debtCapacity.toLocaleString()} FCFA</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Operators */}
        {operators.length > 0 && (
          <Card className="shadow-card border-0">
            <CardContent className="p-6">
              <h3 className="font-display font-semibold text-foreground mb-3 flex items-center gap-2">
                <Smartphone className="h-5 w-5 text-primary" /> Opérateurs Mobile Money
              </h3>
              <div className="flex flex-wrap gap-2">
                {operators.map((op, i) => (
                  <Badge key={i} className="bg-muted text-foreground px-3 py-1.5">
                    {op.operator_name.includes("Airtel") ? "📱" : op.operator_name.includes("MTN") ? "📲" : op.operator_name.includes("Orange") ? "📳" : "💳"}
                    {" "}{op.operator_name}
                    {op.is_primary && " ★"}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Recent transactions */}
        {recentTx.length > 0 && profile.show_volume && (
          <Card className="shadow-card border-0">
            <CardContent className="p-6">
              <h3 className="font-display font-semibold text-foreground mb-3">Dernières Transactions</h3>
              <div className="space-y-2">
                {recentTx.map((tx, i) => (
                  <div key={i} className="flex justify-between items-center py-2 border-b border-border/50 last:border-0">
                    <div>
                      <p className="text-sm font-medium text-foreground">{tx.produit || tx.type}</p>
                      <p className="text-xs text-muted-foreground">{new Date(tx.created_at).toLocaleDateString("fr-FR")}</p>
                    </div>
                    <span className="font-display font-bold text-foreground">{tx.montant.toLocaleString()} FCFA</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Partner reviews */}
        <Card className="shadow-card border-0">
          <CardContent className="p-6 text-center">
            <h3 className="font-display font-semibold text-foreground mb-2">Évaluations Partenaires</h3>
            <div className="flex items-center justify-center gap-1">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star key={s} className={`h-6 w-6 ${s <= Math.round(avgRating || 0) ? "text-lokalpay-gold fill-lokalpay-gold" : "text-muted"}`} />
              ))}
            </div>
            <p className="text-muted-foreground text-sm mt-1">
              {avgRating ? `${avgRating}/5 (${ratingCount} avis)` : "Aucune évaluation"}
            </p>
          </CardContent>
        </Card>

        {/* QR Code */}
        <Card className="shadow-card border-0">
          <CardContent className="p-6 text-center">
            <h3 className="font-display font-semibold text-foreground mb-4">Partager ce profil</h3>
            <div className="bg-card p-4 rounded-2xl inline-block shadow-card">
              <QRCodeSVG value={profileUrl} size={180} level="M" />
            </div>
            <p className="text-xs text-muted-foreground mt-3">Scannez pour accéder au profil</p>
          </CardContent>
        </Card>

        {/* Blockchain verification */}
        <Card className="shadow-card border-0">
          <CardContent className="p-6 text-center">
            <CheckCircle className="h-8 w-8 text-primary mx-auto mb-2" />
            <h3 className="font-display font-semibold text-foreground">Vérifié sur Blockchain</h3>
            <p className="text-xs text-muted-foreground mt-1 font-mono">Stellar Testnet</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PublicProfilePage;
