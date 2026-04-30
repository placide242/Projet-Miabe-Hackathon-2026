import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import logo from "@/assets/lokalpay-logo.png";
import { Phone, User, MapPin, ArrowRight, Loader2, Lock, Mail, Building2, Check, ChevronLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { PROFILE_TYPES, PLANS, ProfileType, PlanId } from "@/lib/plans";

const RegisterPage = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    profile_type: "merchant" as ProfileType,
    identifier_type: "phone" as "phone" | "email",
    phone: "",
    email: "",
    name: "",
    market: "",
    organization_name: "",
    license_number: "",
    password: "",
    plan: "free" as PlanId,
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useTranslation();

  const formatEmail = () => {
    if (formData.identifier_type === "email" && formData.email) return formData.email.trim().toLowerCase();
    const cleaned = formData.phone.replace(/[\s+\-]/g, "");
    return `${cleaned}@lokalpay.cg`;
  };

  const checkDuplicate = async (): Promise<string | null> => {
    if (formData.identifier_type === "phone" && formData.phone) {
      const { data } = await supabase.from("profiles").select("id").eq("phone", formData.phone).maybeSingle();
      if (data) return "Ce numéro possède déjà un compte";
    }
    if (formData.identifier_type === "email" && formData.email) {
      const { data } = await supabase
        .from("profiles")
        .select("id")
        .eq("email", formData.email.trim().toLowerCase())
        .maybeSingle();
      if (data) return "Cet email possède déjà un compte";
    }
    return null;
  };

  const validateStep = (s: number): boolean => {
    if (s === 2) {
      if (!formData.name) return toastErr("Veuillez entrer votre nom");
      if (formData.identifier_type === "phone" && !formData.phone) return toastErr("Veuillez entrer votre numéro");
      if (formData.identifier_type === "email" && !formData.email) return toastErr("Veuillez entrer votre email");
      if (formData.password.length < 6) return toastErr(t("auth.errorPassword"));
      if (formData.profile_type === "microfinance" && !formData.organization_name)
        return toastErr("Veuillez renseigner le nom de l'institution");
    }
    return true;
  };

  const toastErr = (msg: string) => {
    toast({ title: "Erreur", description: msg, variant: "destructive" });
    return false;
  };

  const handleNext = async () => {
    if (!validateStep(step)) return;
    if (step === 2) {
      const dup = await checkDuplicate();
      if (dup) {
        toast({ title: "Compte existant", description: dup, variant: "destructive" });
        return;
      }
    }
    setStep(step + 1);
  };

  const handleSubmit = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email: formatEmail(),
      password: formData.password,
      options: {
        emailRedirectTo: window.location.origin,
        data: {
          display_name: formData.name,
          phone: formData.phone,
          email: formData.email,
          market: formData.market,
          profile_type: formData.profile_type,
          subscription_plan: formData.plan,
          organization_name: formData.organization_name,
          license_number: formData.license_number,
        },
      },
    });
    setLoading(false);
    if (error) {
      const msg = error.message.toLowerCase().includes("already")
        ? "Ce compte existe déjà"
        : error.message;
      toast({ title: "Erreur", description: msg, variant: "destructive" });
    } else {
      toast({ title: "Compte créé !", description: "Bienvenue sur LokalPay" });
      navigate("/dashboard");
    }
  };

  const marketKeys = ["total", "moungali", "plateau", "pointe-noire", "autre"] as const;

  return (
    <div className="min-h-screen flex items-center justify-center bg-warm px-4 py-8 relative">
      <div className="absolute top-4 right-4">
        <LanguageSwitcher variant="compact" />
      </div>
      <div className="w-full max-w-2xl">
        <div className="text-center mb-6">
          <Link to="/" className="inline-flex items-center gap-2 mb-4">
            <img src={logo} alt="LokalPay" className="h-10 w-10" />
            <span className="font-display font-bold text-2xl">LokalPay</span>
          </Link>
          {/* Stepper */}
          <div className="flex items-center justify-center gap-2 mt-4">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center gap-2">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                    step >= s ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                  }`}
                >
                  {step > s ? <Check className="h-4 w-4" /> : s}
                </div>
                {s < 3 && <div className={`w-12 h-0.5 ${step > s ? "bg-primary" : "bg-muted"}`} />}
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Étape {step}/3 ·{" "}
            {step === 1 ? "Type de profil" : step === 2 ? "Vos informations" : "Choix du plan"}
          </p>
        </div>

        <Card className="p-6 md:p-8 shadow-elevated border-border/50">
          {/* STEP 1 — Profile type */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <h2 className="font-display text-xl font-bold">Quel type de compte ?</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Votre interface s'adaptera automatiquement
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {PROFILE_TYPES.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setFormData({ ...formData, profile_type: p.id })}
                    className={`p-4 rounded-xl border-2 text-left transition-all ${
                      formData.profile_type === p.id
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <div className="text-3xl mb-2">{p.icon}</div>
                    <div className="font-semibold text-sm">{p.label}</div>
                    <div className="text-xs text-muted-foreground mt-1">{p.description}</div>
                  </button>
                ))}
              </div>
              <Button onClick={handleNext} variant="hero" className="w-full h-12">
                Continuer <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          )}

          {/* STEP 2 — Infos */}
          {step === 2 && (
            <div className="space-y-4">
              <h2 className="font-display text-xl font-bold">Vos informations</h2>

              <div className="space-y-2">
                <Label>Nom complet</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Ex: Ali Moussa"
                    className="pl-10 h-11"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
              </div>

              {formData.profile_type === "microfinance" && (
                <div className="space-y-2">
                  <Label>Nom de l'institution</Label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Ex: MUCODEC"
                      className="pl-10 h-11"
                      value={formData.organization_name}
                      onChange={(e) => setFormData({ ...formData, organization_name: e.target.value })}
                    />
                  </div>
                </div>
              )}

              {/* Identifier toggle */}
              <div className="space-y-2">
                <Label>Identifiant de connexion</Label>
                <div className="grid grid-cols-2 gap-2 p-1 bg-muted rounded-lg">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, identifier_type: "phone" })}
                    className={`py-2 rounded-md text-sm font-medium transition-colors ${
                      formData.identifier_type === "phone" ? "bg-card shadow-sm" : "text-muted-foreground"
                    }`}
                  >
                    <Phone className="h-4 w-4 inline mr-1" /> Téléphone
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, identifier_type: "email" })}
                    className={`py-2 rounded-md text-sm font-medium transition-colors ${
                      formData.identifier_type === "email" ? "bg-card shadow-sm" : "text-muted-foreground"
                    }`}
                  >
                    <Mail className="h-4 w-4 inline mr-1" /> Email
                  </button>
                </div>

                {formData.identifier_type === "phone" ? (
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="+242 06 XXX XX XX"
                      className="pl-10 h-11"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>
                ) : (
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="email"
                      placeholder="vous@email.com"
                      className="pl-10 h-11"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>
                )}
              </div>

              {(formData.profile_type === "merchant" || formData.profile_type === "client") && (
                <div className="space-y-2">
                  <Label>Marché / Zone</Label>
                  <Select onValueChange={(v) => setFormData({ ...formData, market: v })}>
                    <SelectTrigger className="h-11">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <SelectValue placeholder="Choisir votre marché" />
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      {marketKeys.map((key) => (
                        <SelectItem key={key} value={key}>
                          {t(`markets.${key}`)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="space-y-2">
                <Label>Mot de passe</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="password"
                    placeholder="Minimum 6 caractères"
                    className="pl-10 h-11"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <Button variant="outline" onClick={() => setStep(1)} className="flex-1 h-11">
                  <ChevronLeft className="h-4 w-4" /> Retour
                </Button>
                <Button onClick={handleNext} variant="hero" className="flex-1 h-11">
                  Continuer <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          )}

          {/* STEP 3 — Plan */}
          {step === 3 && (
            <div className="space-y-4">
              <h2 className="font-display text-xl font-bold">Choisissez votre formule</h2>
              <p className="text-sm text-muted-foreground">Vous pourrez changer à tout moment</p>

              <div className="space-y-3">
                {PLANS.map((plan) => (
                  <button
                    key={plan.id}
                    type="button"
                    onClick={() => setFormData({ ...formData, plan: plan.id })}
                    className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                      formData.plan === plan.id
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-semibold">{plan.name}</div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {plan.features[0]}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-display font-bold text-lg">
                          {plan.price === 0 ? "Gratuit" : `${plan.price.toLocaleString()} F`}
                        </div>
                        {plan.price > 0 && <div className="text-xs text-muted-foreground">/ mois</div>}
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              <div className="flex gap-2 pt-2">
                <Button variant="outline" onClick={() => setStep(2)} className="flex-1 h-11">
                  <ChevronLeft className="h-4 w-4" /> Retour
                </Button>
                <Button onClick={handleSubmit} variant="hero" className="flex-1 h-11" disabled={loading}>
                  {loading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <>Créer mon compte <ArrowRight className="h-4 w-4 ml-1" /></>
                  )}
                </Button>
              </div>
            </div>
          )}
        </Card>

        <p className="text-center text-sm text-muted-foreground mt-4">
          Déjà un compte ?{" "}
          <Link to="/login" className="text-primary font-medium hover:underline">
            Se connecter
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
