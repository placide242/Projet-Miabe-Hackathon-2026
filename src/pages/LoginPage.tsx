import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import logo from "@/assets/lokalpay-logo.png";
import { Phone, Mail, ArrowRight, Loader2, Lock, User, Eye, EyeOff, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "@/components/LanguageSwitcher";

const REMEMBER_KEY = "lokalpay:remembered_account";

interface RememberedAccount {
  identifier: string;
  identifier_type: "phone" | "email";
  display_name?: string;
  initials?: string;
}

const LoginPage = () => {
  const [identifierType, setIdentifierType] = useState<"phone" | "email">("phone");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [remembered, setRemembered] = useState<RememberedAccount | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useTranslation();

  // Charger compte mémorisé (style Google)
  useEffect(() => {
    try {
      const raw = localStorage.getItem(REMEMBER_KEY);
      if (raw) {
        const parsed: RememberedAccount = JSON.parse(raw);
        setRemembered(parsed);
        setIdentifier(parsed.identifier);
        setIdentifierType(parsed.identifier_type);
      }
    } catch { /* ignore */ }
  }, []);

  const formatEmail = () => {
    if (identifierType === "email") return identifier.trim().toLowerCase();
    const cleaned = identifier.replace(/[\s+\-]/g, "").replace(/^242/, "");
    return `${cleaned}@lokalpay.cg`;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier || !password) {
      toast({ title: t("common.error"), description: t("auth.errorRequired"), variant: "destructive" });
      return;
    }
    setLoading(true);
    const { error, data } = await supabase.auth.signInWithPassword({
      email: formatEmail(),
      password,
    });
    setLoading(false);
    if (error) {
      toast({ title: t("common.error"), description: t("auth.errorLogin"), variant: "destructive" });
      return;
    }

    // Mémoriser l'identifiant (jamais le mot de passe) pour reconnexion rapide
    if (remember && data.user) {
      const meta = data.user.user_metadata || {};
      const displayName = meta.display_name || "";
      const initials = displayName
        ? displayName.split(/\s+/).slice(0, 2).map((p: string) => p[0]?.toUpperCase()).join("")
        : "U";
      const account: RememberedAccount = {
        identifier,
        identifier_type: identifierType,
        display_name: displayName,
        initials,
      };
      localStorage.setItem(REMEMBER_KEY, JSON.stringify(account));
    } else if (!remember) {
      localStorage.removeItem(REMEMBER_KEY);
    }

    toast({ title: t("auth.welcomeBack"), description: t("auth.loginSuccess") });
    navigate("/dashboard");
  };

  const forgetAccount = () => {
    localStorage.removeItem(REMEMBER_KEY);
    setRemembered(null);
    setIdentifier("");
    setPassword("");
  };

  return (
    <div className="min-h-screen bg-deep flex items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute top-0 -left-20 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 -right-20 w-96 h-96 bg-secondary/10 rounded-full blur-3xl pointer-events-none" />

      <div className="absolute top-4 right-4 z-10">
        <LanguageSwitcher variant="compact" />
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <img src={logo} alt="LokalPay" className="h-12 w-12" />
            <span className="font-display font-bold text-2xl">LokalPay <span className="text-secondary">Congo</span></span>
          </Link>
          <h1 className="font-display text-2xl font-bold">{t("auth.loginTitle")}</h1>
          <p className="text-muted-foreground mt-2">{t("auth.loginSubtitle")}</p>
        </div>

        {/* Bandeau "compte mémorisé" style Google */}
        {remembered && (
          <div className="mb-4 p-3 rounded-2xl border border-primary/30 bg-primary/5 flex items-center gap-3 animate-fade-up">
            <div className="h-10 w-10 rounded-full bg-gradient-gold flex items-center justify-center font-bold text-secondary-foreground shadow-gold">
              {remembered.initials || <User className="h-5 w-5" />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{remembered.display_name || "Mon compte"}</p>
              <p className="text-xs text-muted-foreground truncate">{remembered.identifier}</p>
            </div>
            <button
              type="button"
              onClick={forgetAccount}
              className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Oublier ce compte"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        <form
          onSubmit={handleLogin}
          className="bg-gradient-card rounded-2xl p-7 shadow-elevated space-y-5 border border-border/50 backdrop-blur-sm"
        >
          {!remembered && (
            <div className="grid grid-cols-2 gap-2 p-1 bg-muted rounded-lg">
              <button
                type="button"
                onClick={() => setIdentifierType("phone")}
                className={`py-2 rounded-md text-sm font-medium transition-all flex items-center justify-center gap-1.5 ${
                  identifierType === "phone" ? "bg-card shadow-sm text-foreground" : "text-muted-foreground"
                }`}
              >
                <Phone className="h-4 w-4" /> Téléphone
              </button>
              <button
                type="button"
                onClick={() => setIdentifierType("email")}
                className={`py-2 rounded-md text-sm font-medium transition-all flex items-center justify-center gap-1.5 ${
                  identifierType === "email" ? "bg-card shadow-sm text-foreground" : "text-muted-foreground"
                }`}
              >
                <Mail className="h-4 w-4" /> Email
              </button>
            </div>
          )}

          {!remembered && (
            <div className="space-y-2">
              <Label htmlFor="id" className="flex items-center gap-2">
                {identifierType === "phone" ? <Phone className="h-4 w-4 text-primary" /> : <Mail className="h-4 w-4 text-primary" />}
                {identifierType === "phone" ? "Téléphone" : "Email"}
              </Label>
              <Input
                id="id"
                type={identifierType === "email" ? "email" : "tel"}
                placeholder={identifierType === "phone" ? "06 XX XX XX XX" : "vous@email.com"}
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className="h-12"
                autoComplete={identifierType === "email" ? "email" : "tel"}
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="password" className="flex items-center gap-2">
              <Lock className="h-4 w-4 text-primary" /> {t("auth.password")}
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={showPwd ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-12 pr-10"
                autoComplete="current-password"
                autoFocus={!!remembered}
              />
              <button
                type="button"
                onClick={() => setShowPwd(!showPwd)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                aria-label={showPwd ? "Masquer" : "Afficher"}
              >
                {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer">
              <Checkbox checked={remember} onCheckedChange={(c) => setRemember(!!c)} />
              <span className="text-xs text-muted-foreground">Rester connecté 30 jours</span>
            </label>
            <Link to="/forgot-password" className="text-xs text-secondary hover:underline">
              Mot de passe oublié ?
            </Link>
          </div>

          <Button type="submit" variant="hero" className="w-full h-12 text-base" disabled={loading}>
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <>{t("auth.loginBtn")} <ArrowRight className="h-5 w-5 ml-2" /></>}
          </Button>

          <p className="text-center text-sm text-muted-foreground">
            {t("auth.noAccount")}{" "}
            <Link to="/register" className="text-secondary font-medium hover:underline">{t("auth.createAccount")}</Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
