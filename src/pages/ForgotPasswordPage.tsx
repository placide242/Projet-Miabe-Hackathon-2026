import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import logo from "@/assets/lokalpay-logo.png";
import { Mail, ArrowRight, Loader2, ArrowLeft, CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const { toast } = useToast();

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast({ title: "Erreur", description: "Veuillez saisir votre adresse email", variant: "destructive" });
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setLoading(false);
    if (error) {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
    } else {
      setSent(true);
      toast({ title: "Email envoyé", description: "Vérifiez votre boîte de réception" });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-warm px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <img src={logo} alt="LokalPay" className="h-12 w-12" />
            <span className="font-display font-bold text-2xl">LokalPay</span>
          </Link>
          <h1 className="font-display text-2xl font-bold">Mot de passe oublié</h1>
          <p className="text-muted-foreground mt-2">
            Saisissez votre email pour recevoir un lien de réinitialisation
          </p>
        </div>

        {sent ? (
          <div className="bg-card rounded-2xl p-8 shadow-elevated border border-border/50 text-center space-y-4">
            <CheckCircle2 className="h-16 w-16 text-primary mx-auto" />
            <h2 className="font-display text-lg font-bold">Lien envoyé !</h2>
            <p className="text-muted-foreground text-sm">
              Un email avec un lien de réinitialisation a été envoyé à <strong>{email}</strong>.
              Cliquez sur le lien pour créer un nouveau mot de passe.
            </p>
            <Button variant="outline" asChild className="w-full">
              <Link to="/login"><ArrowLeft className="h-4 w-4 mr-2" /> Retour à la connexion</Link>
            </Button>
          </div>
        ) : (
          <form onSubmit={handleReset} className="bg-card rounded-2xl p-8 shadow-elevated space-y-5 border border-border/50">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="vous@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 h-12"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Si vous vous êtes inscrit avec un téléphone, utilisez l'email associé à votre compte.
              </p>
            </div>

            <Button type="submit" variant="hero" className="w-full h-12 text-base" disabled={loading}>
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <>Envoyer le lien <ArrowRight className="h-5 w-5 ml-2" /></>}
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              <Link to="/login" className="text-primary font-medium hover:underline inline-flex items-center gap-1">
                <ArrowLeft className="h-3 w-3" /> Retour à la connexion
              </Link>
            </p>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
