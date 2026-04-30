import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import logo from "@/assets/lokalpay-logo.png";
import { Phone, Mail, ArrowRight, Loader2, Lock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "@/components/LanguageSwitcher";

const LoginPage = () => {
  const [identifierType, setIdentifierType] = useState<"phone" | "email">("phone");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useTranslation();

  const formatEmail = () => {
    if (identifierType === "email") return identifier.trim().toLowerCase();
    const cleaned = identifier.replace(/[\s+\-]/g, "");
    return `${cleaned}@lokalpay.cg`;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier || !password) {
      toast({ title: t("common.error"), description: t("auth.errorRequired"), variant: "destructive" });
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: formatEmail(),
      password,
    });
    setLoading(false);
    if (error) {
      toast({ title: t("common.error"), description: t("auth.errorLogin"), variant: "destructive" });
    } else {
      toast({ title: t("auth.welcomeBack"), description: t("auth.loginSuccess") });
      navigate("/dashboard");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-warm px-4 relative">
      <div className="absolute top-4 right-4">
        <LanguageSwitcher variant="compact" />
      </div>
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <img src={logo} alt="LokalPay" className="h-12 w-12" />
            <span className="font-display font-bold text-2xl">LokalPay</span>
          </Link>
          <h1 className="font-display text-2xl font-bold">{t("auth.loginTitle")}</h1>
          <p className="text-muted-foreground mt-2">{t("auth.loginSubtitle")}</p>
        </div>

        <form onSubmit={handleLogin} className="bg-card rounded-2xl p-8 shadow-elevated space-y-5 border border-border/50">
          {/* identifier toggle */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-muted rounded-lg">
            <button
              type="button"
              onClick={() => setIdentifierType("phone")}
              className={`py-2 rounded-md text-sm font-medium transition-colors ${
                identifierType === "phone" ? "bg-card shadow-sm" : "text-muted-foreground"
              }`}
            >
              <Phone className="h-4 w-4 inline mr-1" /> Téléphone
            </button>
            <button
              type="button"
              onClick={() => setIdentifierType("email")}
              className={`py-2 rounded-md text-sm font-medium transition-colors ${
                identifierType === "email" ? "bg-card shadow-sm" : "text-muted-foreground"
              }`}
            >
              <Mail className="h-4 w-4 inline mr-1" /> Email
            </button>
          </div>

          <div className="space-y-2">
            <Label htmlFor="id">{identifierType === "phone" ? "Téléphone" : "Email"}</Label>
            <div className="relative">
              {identifierType === "phone" ? (
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              ) : (
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              )}
              <Input
                id="id"
                type={identifierType === "email" ? "email" : "tel"}
                placeholder={identifierType === "phone" ? "+242 06 XXX XX XX" : "vous@email.com"}
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className="pl-10 h-12"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">{t("auth.password")}</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10 h-12"
              />
            </div>
          </div>

          <Button type="submit" variant="hero" className="w-full h-12 text-base" disabled={loading}>
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <>{t("auth.loginBtn")} <ArrowRight className="h-5 w-5 ml-2" /></>}
          </Button>

          <div className="text-center">
            <Link to="/forgot-password" className="text-xs text-primary hover:underline">
              Mot de passe oublié ?
            </Link>
          </div>

          <p className="text-center text-sm text-muted-foreground">
            {t("auth.noAccount")}{" "}
            <Link to="/register" className="text-primary font-medium hover:underline">{t("auth.createAccount")}</Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
