import { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import logo from "@/assets/lokalpay-logo.png";
import {
  Phone, User, MapPin, ArrowRight, Loader2, Lock, Mail, Building2, Check, ChevronLeft,
  Calendar, Briefcase, Store, FileBadge, ShieldCheck, Eye, EyeOff, Smartphone,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { PROFILE_TYPES, PLANS, ProfileType, PlanId } from "@/lib/plans";
import {
  REGIONS, MOBILE_MONEY_OPERATORS, MERCHANT_CATEGORIES, REVENUE_RANGES,
  detectOperator, isValidCongoPhone,
} from "@/lib/markets";

const RegisterPage = () => {
  const [step, setStep] = useState(1);
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    profile_type: "merchant" as ProfileType,
    identifier_type: "phone" as "phone" | "email",
    phone: "",
    email: "",
    name: "",
    birthdate: "",
    region: "",
    district: "",
    market: "",
    merchant_category: "",
    revenue_range: "",
    organization_name: "",
    license_number: "",
    rccm: "",
    password: "",
    plan: "free" as PlanId,
    accept_terms: false,
  });

  const selectedRegion = useMemo(
    () => REGIONS.find((r) => r.id === formData.region),
    [formData.region]
  );
  const selectedDistrict = useMemo(
    () => selectedRegion?.districts.find((d) => d.id === formData.district),
    [selectedRegion, formData.district]
  );
  const detectedOperator = useMemo(
    () => (formData.phone ? detectOperator(formData.phone) : null),
    [formData.phone]
  );

  const calculateAge = (birthdate: string): number => {
    if (!birthdate) return 0;
    const today = new Date();
    const birth = new Date(birthdate);
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
    return age;
  };

  const formatEmail = () => {
    if (formData.identifier_type === "email" && formData.email) return formData.email.trim().toLowerCase();
    const cleaned = formData.phone.replace(/[\s+\-]/g, "").replace(/^242/, "");
    return `${cleaned}@lokalpay.cg`;
  };

  const toastErr = (msg: string) => {
    toast({ title: "Erreur", description: msg, variant: "destructive" });
    return false;
  };

  const checkDuplicate = async (): Promise<string | null> => {
    if (formData.identifier_type === "phone" && formData.phone) {
      const { data } = await supabase.from("profiles").select("id").eq("phone", formData.phone).maybeSingle();
      if (data) return "Ce numéro possède déjà un compte LokalPay";
    }
    if (formData.identifier_type === "email" && formData.email) {
      const { data } = await supabase
        .from("profiles").select("id").eq("email", formData.email.trim().toLowerCase()).maybeSingle();
      if (data) return "Cet email possède déjà un compte LokalPay";
    }
    return null;
  };

  const validateStep = (s: number): boolean => {
    if (s === 2) {
      if (!formData.name || formData.name.length < 2) return toastErr("Veuillez entrer votre nom complet");
      if (!formData.birthdate) return toastErr("Veuillez entrer votre date de naissance");
      const age = calculateAge(formData.birthdate);
      if (age < 18) return toastErr("Vous devez avoir au moins 18 ans pour créer un compte");
      if (age > 100) return toastErr("Date de naissance invalide");

      if (formData.identifier_type === "phone") {
        if (!formData.phone) return toastErr("Veuillez entrer votre numéro");
        if (!isValidCongoPhone(formData.phone))
          return toastErr("Numéro invalide. Format attendu : 06/05/04 XX XX XX XX");
        if (!detectedOperator)
          return toastErr("Seuls Airtel (04/05) et MTN (06) sont acceptés");
      } else {
        if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
          return toastErr("Veuillez entrer un email valide");
      }

      if (formData.password.length < 8) return toastErr("Le mot de passe doit contenir au moins 8 caractères");
      if (!/[A-Z]/.test(formData.password) || !/[0-9]/.test(formData.password))
        return toastErr("Le mot de passe doit contenir une majuscule et un chiffre");

      if (formData.profile_type === "microfinance") {
        if (!formData.organization_name) return toastErr("Le nom de l'institution est obligatoire");
        if (!formData.license_number) return toastErr("Le numéro de licence COBAC est obligatoire");
      }
    }
    if (s === 3) {
      if (!formData.region) return toastErr("Veuillez choisir votre département");
      if (formData.profile_type === "merchant" || formData.profile_type === "client") {
        if (!formData.district) return toastErr("Veuillez choisir votre arrondissement / district");
        if (!formData.market) return toastErr("Veuillez choisir votre marché / zone");
      }
      if (formData.profile_type === "merchant") {
        if (!formData.merchant_category) return toastErr("Veuillez choisir votre catégorie de commerce");
        if (!formData.revenue_range) return toastErr("Veuillez estimer votre chiffre d'affaires mensuel");
      }
    }
    if (s === 4 && !formData.accept_terms) return toastErr("Vous devez accepter les conditions d'utilisation");
    return true;
  };

  const handleNext = async () => {
    if (!validateStep(step)) return;
    if (step === 2) {
      const dup = await checkDuplicate();
      if (dup) return toastErr(dup);
    }
    setStep(step + 1);
  };

  const handleSubmit = async () => {
    if (!validateStep(4)) return;
    setLoading(true);
    const fullMarket = [
      selectedRegion?.name,
      selectedDistrict?.name,
      selectedDistrict?.markets.find((m) => m.id === formData.market)?.name,
    ].filter(Boolean).join(" — ");

    const { error } = await supabase.auth.signUp({
      email: formatEmail(),
      password: formData.password,
      options: {
        emailRedirectTo: window.location.origin,
        data: {
          display_name: formData.name,
          phone: formData.phone,
          email: formData.email || formatEmail(),
          market: fullMarket || formData.region,
          profile_type: formData.profile_type,
          subscription_plan: formData.plan,
          organization_name: formData.organization_name,
          license_number: formData.license_number,
          birthdate: formData.birthdate,
          merchant_category: formData.merchant_category,
          revenue_range: formData.revenue_range,
          rccm: formData.rccm,
          mobile_operator: detectedOperator,
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
      toast({ title: "Compte créé !", description: "Bienvenue sur LokalPay Congo" });
      navigate("/dashboard");
    }
  };

  const operatorInfo = detectedOperator
    ? MOBILE_MONEY_OPERATORS.find((o) => o.id === detectedOperator)
    : null;

  const totalSteps = 4;

  return (
    <div className="min-h-screen bg-deep flex items-center justify-center px-4 py-8 relative overflow-hidden">
      {/* Decorative blobs */}
      <div className="absolute top-0 -left-20 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 -right-20 w-96 h-96 bg-accent/10 rounded-full blur-3xl pointer-events-none" />

      <div className="absolute top-4 right-4 z-10">
        <LanguageSwitcher variant="compact" />
      </div>

      <div className="w-full max-w-2xl relative z-10">
        <div className="text-center mb-6">
          <Link to="/" className="inline-flex items-center gap-2 mb-4">
            <img src={logo} alt="LokalPay" className="h-10 w-10" />
            <span className="font-display font-bold text-2xl text-foreground">LokalPay <span className="text-secondary">Congo</span></span>
          </Link>

          {/* Stepper */}
          <div className="flex items-center justify-center gap-2 mt-4">
            {Array.from({ length: totalSteps }, (_, i) => i + 1).map((s) => (
              <div key={s} className="flex items-center gap-2">
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                    step >= s
                      ? "bg-gradient-gold text-secondary-foreground shadow-gold"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {step > s ? <Check className="h-4 w-4" /> : s}
                </div>
                {s < totalSteps && <div className={`w-10 h-0.5 transition-colors ${step > s ? "bg-secondary" : "bg-muted"}`} />}
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Étape {step}/{totalSteps} ·{" "}
            {step === 1 ? "Type de profil" : step === 2 ? "Identité" : step === 3 ? "Localisation & métier" : "Plan & confirmation"}
          </p>
        </div>

        <Card className="p-6 md:p-8 shadow-elevated border-border/50 bg-gradient-card backdrop-blur-sm">
          {/* STEP 1 — Profile type */}
          {step === 1 && (
            <div className="space-y-5 animate-fade-up">
              <div>
                <h2 className="font-display text-2xl font-bold">Quel type de compte ?</h2>
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
                    className={`p-4 rounded-2xl border-2 text-left transition-all hover-lift ${
                      formData.profile_type === p.id
                        ? "border-secondary bg-secondary/10 shadow-gold"
                        : "border-border hover:border-secondary/40 bg-card"
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

          {/* STEP 2 — Identité */}
          {step === 2 && (
            <div className="space-y-4 animate-fade-up">
              <h2 className="font-display text-2xl font-bold">Vos informations</h2>

              <div className="space-y-2">
                <Label className="flex items-center gap-2"><User className="h-4 w-4 text-primary" /> Nom complet</Label>
                <Input
                  placeholder="Ex: Ali Moussa"
                  className="h-11"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2"><Calendar className="h-4 w-4 text-primary" /> Date de naissance</Label>
                <Input
                  type="date"
                  className="h-11"
                  max={new Date(Date.now() - 18 * 365.25 * 24 * 3600 * 1000).toISOString().slice(0, 10)}
                  value={formData.birthdate}
                  onChange={(e) => setFormData({ ...formData, birthdate: e.target.value })}
                />
                <p className="text-xs text-muted-foreground">Vous devez avoir 18 ans révolus.</p>
              </div>

              {formData.profile_type === "microfinance" && (
                <>
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2"><Building2 className="h-4 w-4 text-primary" /> Nom de l'institution</Label>
                    <Input
                      placeholder="Ex: MUCODEC"
                      className="h-11"
                      value={formData.organization_name}
                      onChange={(e) => setFormData({ ...formData, organization_name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2"><FileBadge className="h-4 w-4 text-primary" /> N° de licence COBAC</Label>
                    <Input
                      placeholder="Ex: COBAC-CG-2024-XXX"
                      className="h-11"
                      value={formData.license_number}
                      onChange={(e) => setFormData({ ...formData, license_number: e.target.value })}
                    />
                    <p className="text-xs text-muted-foreground">Vérification manuelle sous 48h après inscription.</p>
                  </div>
                </>
              )}

              {formData.profile_type === "merchant" && (
                <div className="space-y-2">
                  <Label className="flex items-center gap-2"><Briefcase className="h-4 w-4 text-primary" /> N° RCCM (optionnel)</Label>
                  <Input
                    placeholder="Ex: CG/BZV/24-B-XXXX"
                    className="h-11"
                    value={formData.rccm}
                    onChange={(e) => setFormData({ ...formData, rccm: e.target.value })}
                  />
                </div>
              )}

              {/* Identifier toggle */}
              <div className="space-y-2">
                <Label>Identifiant de connexion</Label>
                <div className="grid grid-cols-2 gap-2 p-1 bg-muted rounded-lg">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, identifier_type: "phone" })}
                    className={`py-2 rounded-md text-sm font-medium transition-all flex items-center justify-center gap-1.5 ${
                      formData.identifier_type === "phone" ? "bg-card shadow-sm text-foreground" : "text-muted-foreground"
                    }`}
                  >
                    <Phone className="h-4 w-4" /> Téléphone
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, identifier_type: "email" })}
                    className={`py-2 rounded-md text-sm font-medium transition-all flex items-center justify-center gap-1.5 ${
                      formData.identifier_type === "email" ? "bg-card shadow-sm text-foreground" : "text-muted-foreground"
                    }`}
                  >
                    <Mail className="h-4 w-4" /> Email
                  </button>
                </div>

                {formData.identifier_type === "phone" ? (
                  <>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="06 XX XX XX XX"
                        className="pl-10 h-11"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      />
                      {operatorInfo && (
                        <Badge
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-xs"
                          style={{ backgroundColor: operatorInfo.color, color: "#fff" }}
                        >
                          <Smartphone className="h-3 w-3 mr-1" /> {operatorInfo.name}
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Opérateurs acceptés : <span className="text-primary font-medium">Airtel (04/05)</span> et{" "}
                      <span className="text-secondary font-medium">MTN (06)</span>
                    </p>
                  </>
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

              <div className="space-y-2">
                <Label className="flex items-center gap-2"><Lock className="h-4 w-4 text-primary" /> Mot de passe</Label>
                <div className="relative">
                  <Input
                    type={showPwd ? "text" : "password"}
                    placeholder="8+ caractères, 1 majuscule, 1 chiffre"
                    className="h-11 pr-10"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPwd(!showPwd)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
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

          {/* STEP 3 — Localisation & métier */}
          {step === 3 && (
            <div className="space-y-4 animate-fade-up">
              <h2 className="font-display text-2xl font-bold">Où êtes-vous basé(e) ?</h2>

              <div className="space-y-2">
                <Label className="flex items-center gap-2"><MapPin className="h-4 w-4 text-primary" /> Département</Label>
                <Select
                  value={formData.region}
                  onValueChange={(v) => setFormData({ ...formData, region: v, district: "", market: "" })}
                >
                  <SelectTrigger className="h-11"><SelectValue placeholder="Choisir un département" /></SelectTrigger>
                  <SelectContent className="max-h-72">
                    {REGIONS.map((r) => (
                      <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {(formData.profile_type === "merchant" || formData.profile_type === "client") && selectedRegion && (
                <div className="space-y-2">
                  <Label className="flex items-center gap-2"><MapPin className="h-4 w-4 text-secondary" /> Arrondissement / District</Label>
                  <Select
                    value={formData.district}
                    onValueChange={(v) => setFormData({ ...formData, district: v, market: "" })}
                  >
                    <SelectTrigger className="h-11"><SelectValue placeholder="Choisir un arrondissement" /></SelectTrigger>
                    <SelectContent className="max-h-72">
                      {selectedRegion.districts.map((d) => (
                        <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {(formData.profile_type === "merchant" || formData.profile_type === "client") && selectedDistrict && (
                <div className="space-y-2">
                  <Label className="flex items-center gap-2"><Store className="h-4 w-4 text-accent" /> Marché / Zone d'activité</Label>
                  <Select value={formData.market} onValueChange={(v) => setFormData({ ...formData, market: v })}>
                    <SelectTrigger className="h-11"><SelectValue placeholder="Choisir un marché" /></SelectTrigger>
                    <SelectContent className="max-h-72">
                      {selectedDistrict.markets.map((m) => (
                        <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {formData.profile_type === "merchant" && (
                <>
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2"><Briefcase className="h-4 w-4 text-primary" /> Catégorie de commerce</Label>
                    <div className="grid grid-cols-3 gap-2">
                      {MERCHANT_CATEGORIES.map((c) => (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => setFormData({ ...formData, merchant_category: c.id })}
                          className={`p-3 rounded-xl border-2 text-center text-xs transition-all ${
                            formData.merchant_category === c.id
                              ? "border-secondary bg-secondary/10"
                              : "border-border hover:border-secondary/40"
                          }`}
                        >
                          <div className="text-xl mb-1">{c.icon}</div>
                          <div className="font-medium leading-tight">{c.label}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Chiffre d'affaires mensuel estimé</Label>
                    <Select
                      value={formData.revenue_range}
                      onValueChange={(v) => setFormData({ ...formData, revenue_range: v })}
                    >
                      <SelectTrigger className="h-11"><SelectValue placeholder="Choisir une tranche" /></SelectTrigger>
                      <SelectContent>
                        {REVENUE_RANGES.map((r) => (
                          <SelectItem key={r.id} value={r.id}>{r.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">Cette estimation aide à calculer votre score de crédit.</p>
                  </div>
                </>
              )}

              <div className="flex gap-2 pt-2">
                <Button variant="outline" onClick={() => setStep(2)} className="flex-1 h-11">
                  <ChevronLeft className="h-4 w-4" /> Retour
                </Button>
                <Button onClick={handleNext} variant="hero" className="flex-1 h-11">
                  Continuer <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          )}

          {/* STEP 4 — Plan & confirmation */}
          {step === 4 && (
            <div className="space-y-4 animate-fade-up">
              <h2 className="font-display text-2xl font-bold">Choisissez votre formule</h2>
              <p className="text-sm text-muted-foreground">Vous pourrez changer à tout moment</p>

              <div className="space-y-3">
                {PLANS.map((plan) => (
                  <button
                    key={plan.id}
                    type="button"
                    onClick={() => setFormData({ ...formData, plan: plan.id })}
                    className={`w-full p-4 rounded-2xl border-2 text-left transition-all ${
                      formData.plan === plan.id
                        ? "border-secondary bg-secondary/10 shadow-gold"
                        : "border-border hover:border-secondary/40"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-semibold flex items-center gap-2">
                          {plan.name}
                          {plan.highlight && <Badge className="bg-secondary text-secondary-foreground">Populaire</Badge>}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">{plan.features[0]}</div>
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

              <label className="flex items-start gap-3 p-3 rounded-xl bg-muted/50 cursor-pointer">
                <Checkbox
                  checked={formData.accept_terms}
                  onCheckedChange={(c) => setFormData({ ...formData, accept_terms: !!c })}
                  className="mt-0.5"
                />
                <span className="text-xs text-muted-foreground">
                  J'accepte les <span className="text-primary underline">conditions d'utilisation</span> et la{" "}
                  <span className="text-primary underline">politique de confidentialité</span> de LokalPay Congo.
                  Je certifie avoir 18 ans révolus.
                </span>
              </label>

              <div className="flex items-center gap-2 p-3 rounded-xl bg-primary/5 border border-primary/20">
                <ShieldCheck className="h-5 w-5 text-primary shrink-0" />
                <p className="text-xs text-muted-foreground">
                  Vos données sont chiffrées et protégées. 1 seul compte par email/téléphone autorisé.
                </p>
              </div>

              <div className="flex gap-2 pt-2">
                <Button variant="outline" onClick={() => setStep(3)} className="flex-1 h-11">
                  <ChevronLeft className="h-4 w-4" /> Retour
                </Button>
                <Button onClick={handleSubmit} variant="hero" className="flex-1 h-11" disabled={loading || !formData.accept_terms}>
                  {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <>Créer mon compte <ArrowRight className="h-4 w-4 ml-1" /></>}
                </Button>
              </div>
            </div>
          )}
        </Card>

        <p className="text-center text-sm text-muted-foreground mt-4">
          Déjà un compte ?{" "}
          <Link to="/login" className="text-secondary font-medium hover:underline">Se connecter</Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
