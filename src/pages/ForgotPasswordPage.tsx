import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import logo from "@/assets/lokalpay-logo.png";
import { Mail, ArrowRight, Loader2, ArrowLeft, CheckCircle2, KeyRound, Lock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [pwd, setPwd] = useState("");
  const [pwd2, setPwd2] = useState("");
  const [step, setStep] = useState<"email" | "verify" | "done">("email");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const sendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return toast({ title: "Erreur", description: "Saisissez votre email", variant: "destructive" });
    setLoading(true);
    const { error } = await supabase.functions.invoke("password-otp", {
      body: { action: "send", email: email.trim().toLowerCase() },
    });
    setLoading(false);
    if (error) return toast({ title: "Erreur", description: error.message, variant: "destructive" });
    setStep("verify");
    toast({ title: "Code envoyé", description: `Vérifiez la boîte ${email}` });
  };

  const verifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length !== 6) return toast({ title: "Erreur", description: "Le code doit contenir 6 chiffres", variant: "destructive" });
    if (pwd.length < 6) return toast({ title: "Erreur", description: "Mot de passe trop court (6+ caractères)", variant: "destructive" });
    if (pwd !== pwd2) return toast({ title: "Erreur", description: "Les mots de passe ne correspondent pas", variant: "destructive" });
    setLoading(true);
    const { data, error } = await supabase.functions.invoke("password-otp", {
      body: { action: "verify", email: email.trim().toLowerCase(), code, newPassword: pwd },
    });
    setLoading(false);
    if (error || (data as any)?.error) {
      return toast({ title: "Erreur", description: (data as any)?.error || error?.message || "Code invalide", variant: "destructive" });
    }
    setStep("done");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-warm px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <img src={logo} alt="LokalPay" className="h-12 w-12" />
            <span className="font-display font-bold text-2xl">LokalPay</span>
          </Link>
          <h1 className="font-display text-2xl font-bold">
            {step === "done" ? "Mot de passe modifié" : "Mot de passe oublié"}
          </h1>
          <p className="text-muted-foreground mt-2 text-sm">
            {step === "email" && "Recevez un code à 6 chiffres par email pour réinitialiser votre mot de passe."}
            {step === "verify" && `Saisissez le code reçu à ${email} et choisissez un nouveau mot de passe.`}
            {step === "done" && "Vous pouvez maintenant vous connecter avec votre nouveau mot de passe."}
          </p>
        </div>

        {step === "email" && (
          <form onSubmit={sendCode} className="bg-card rounded-2xl p-8 shadow-elevated space-y-5 border border-border/50">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input id="email" type="email" placeholder="vous@email.com" value={email}
                  onChange={(e) => setEmail(e.target.value)} className="pl-10 h-12" />
              </div>
            </div>
            <Button type="submit" variant="hero" className="w-full h-12" disabled={loading}>
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <>Envoyer le code <ArrowRight className="h-5 w-5 ml-2" /></>}
            </Button>
            <p className="text-center text-sm">
              <Link to="/login" className="text-primary font-medium hover:underline inline-flex items-center gap-1">
                <ArrowLeft className="h-3 w-3" /> Retour à la connexion
              </Link>
            </p>
          </form>
        )}

        {step === "verify" && (
          <form onSubmit={verifyCode} className="bg-card rounded-2xl p-8 shadow-elevated space-y-5 border border-border/50">
            <div className="space-y-2">
              <Label htmlFor="code">Code de vérification</Label>
              <div className="relative">
                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input id="code" inputMode="numeric" maxLength={6} placeholder="123456" value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                  className="pl-10 h-12 text-center tracking-[0.5em] font-mono text-lg" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="pwd">Nouveau mot de passe</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input id="pwd" type="password" placeholder="••••••••" value={pwd}
                  onChange={(e) => setPwd(e.target.value)} className="pl-10 h-12" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="pwd2">Confirmer le mot de passe</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input id="pwd2" type="password" placeholder="••••••••" value={pwd2}
                  onChange={(e) => setPwd2(e.target.value)} className="pl-10 h-12" />
              </div>
            </div>
            <Button type="submit" variant="hero" className="w-full h-12" disabled={loading}>
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Réinitialiser le mot de passe"}
            </Button>
            <button type="button" onClick={() => setStep("email")} className="block w-full text-center text-sm text-muted-foreground hover:text-primary">
              Renvoyer un code
            </button>
          </form>
        )}

        {step === "done" && (
          <div className="bg-card rounded-2xl p-8 shadow-elevated border border-border/50 text-center space-y-4">
            <CheckCircle2 className="h-16 w-16 text-primary mx-auto" />
            <p className="text-muted-foreground">Votre mot de passe a été mis à jour avec succès.</p>
            <Button variant="hero" asChild className="w-full"><Link to="/login">Se connecter</Link></Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
