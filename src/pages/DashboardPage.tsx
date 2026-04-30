import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { QrCode, LogOut, User, Users, Calendar, Settings, Crown, BadgeCheck, CreditCard } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import PaymentDialog from "@/components/dashboard/PaymentDialog";
import { PLANS } from "@/lib/plans";
import logo from "@/assets/lokalpay-logo.png";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import ScoreCard from "@/components/dashboard/ScoreCard";
import TransactionList from "@/components/dashboard/TransactionList";
import NewTransactionDialog from "@/components/dashboard/NewTransactionDialog";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "@/components/LanguageSwitcher";

const DashboardPage = () => {
  const { profile, signOut, refreshProfile } = useAuth();
  const [transactions, setTransactions] = useState<any[]>([]);
  const { t } = useTranslation();

  const fetchTransactions = async () => {
    const { data } = await supabase
      .from("transactions")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50);
    if (data) setTransactions(data);
  };

  const handleNewTransaction = async () => {
    await fetchTransactions();
    await refreshProfile();
  };

  useEffect(() => { fetchTransactions(); }, []);

  return (
    <div className="min-h-screen bg-warm">
      <header className="bg-card border-b border-border sticky top-0 z-40 shadow-card">
        <div className="container mx-auto flex items-center justify-between h-14 px-4">
          <Link to="/" className="flex items-center gap-2">
            <img src={logo} alt="LokalPay" className="h-8 w-8" />
            <span className="font-display font-bold text-lg text-foreground">LokalPay</span>
          </Link>
          <div className="flex items-center gap-1">
            <div className="mr-2 pr-2 border-r border-border">
              <LanguageSwitcher variant="compact" />
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/community" className="gap-1.5"><Users className="h-4 w-4" /><span className="hidden sm:inline">Communauté</span></Link>
            </Button>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/meetings" className="gap-1.5"><Calendar className="h-4 w-4" /><span className="hidden sm:inline">Rencontres</span></Link>
            </Button>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/pricing" className="gap-1.5"><Crown className="h-4 w-4" /><span className="hidden sm:inline">Tarifs</span></Link>
            </Button>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/settings" className="gap-1.5"><Settings className="h-4 w-4" /><span className="hidden md:inline">Paramètres</span></Link>
            </Button>
            <Button variant="ghost" size="sm" asChild>
              <Link to={`/profil/${profile?.lokalpay_id || "me"}`} className="gap-1.5"><User className="h-4 w-4" /><span className="hidden md:inline">Profil</span></Link>
            </Button>
            <Button variant="ghost" size="sm" onClick={signOut} title="Déconnexion">
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 space-y-6">
        <div className="flex flex-col md:flex-row gap-6">
          <Card className="flex-1 shadow-card border-0">
            <CardContent className="p-6">
              <p className="text-muted-foreground text-sm">{t("dashboard.hello")}</p>
              <h1 className="font-display text-2xl font-bold text-foreground flex items-center gap-2 flex-wrap">
                {profile?.display_name || t("dashboard.merchant")}
                {profile?.verified && (
                  <BadgeCheck className="h-5 w-5 text-primary" aria-label="Compte vérifié" />
                )}
              </h1>
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                <Badge variant="secondary" className="text-xs">
                  {profile?.profile_type === "merchant" && "🛒 Commerçant"}
                  {profile?.profile_type === "client" && "👤 Client"}
                  {profile?.profile_type === "microfinance" && "🏦 Microfinance"}
                  {profile?.profile_type === "partner" && "🤝 Partenaire"}
                </Badge>
                <Link to="/pricing">
                  <Badge className={`text-xs cursor-pointer ${
                    profile?.subscription_plan === "business" ? "bg-lokalpay-gold text-foreground" :
                    profile?.subscription_plan === "premium" ? "bg-primary" : ""
                  }`} variant={profile?.subscription_plan === "free" ? "outline" : "default"}>
                    <Crown className="h-3 w-3 mr-1" />
                    {PLANS.find((p) => p.id === (profile?.subscription_plan || "free"))?.name}
                  </Badge>
                </Link>
              </div>
              <p className="text-muted-foreground text-sm mt-2">
                {profile?.market || "—"} – Brazzaville
              </p>
              <p className="text-xs text-muted-foreground mt-1 font-mono">
                ID: {profile?.lokalpay_id}
              </p>
            </CardContent>
          </Card>

          <ScoreCard
            score={profile?.score || 0}
            scoreLevel={profile?.score_level || "Débutant"}
            totalTransactions={profile?.total_transactions || 0}
          />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: t("dashboard.transactions12m"), value: String(profile?.total_transactions || 0) },
            { label: t("dashboard.totalVolume"), value: `${(profile?.total_volume || 0).toLocaleString()} FCFA` },
            { label: t("dashboard.regularity"), value: (profile?.score || 0) >= 60 ? t("dashboard.high") : (profile?.score || 0) >= 30 ? t("dashboard.medium") : t("dashboard.low") },
            { label: t("dashboard.disputes"), value: "0" },
          ].map((stat, i) => (
            <Card key={i} className="shadow-card border-0">
              <CardContent className="p-4 text-center">
                <p className="text-xs text-muted-foreground">{stat.label}</p>
                <p className="font-display font-bold text-foreground mt-1">{stat.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick actions */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <NewTransactionDialog onTransactionCreated={handleNewTransaction} />
          <PaymentDialog onPaid={handleNewTransaction} trigger={
            <Button variant="outline" size="lg" className="w-full">
              <CreditCard className="h-5 w-5" /> Payer
            </Button>
          } />
          <Button variant="gold" size="lg" asChild>
            <Link to={`/profil/${profile?.lokalpay_id || "me"}`}>
              <QrCode className="h-5 w-5" /> {t("dashboard.shareProfile")}
            </Link>
          </Button>
          <Button variant="outline" size="lg" asChild>
            <Link to="/community">
              <Users className="h-5 w-5" /> Communauté
            </Link>
          </Button>
        </div>

        <TransactionList transactions={transactions} />
      </div>
    </div>
  );
};

export default DashboardPage;
