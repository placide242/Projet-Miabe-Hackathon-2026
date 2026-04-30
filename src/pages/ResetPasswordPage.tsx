import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import logo from "@/assets/lokalpay-logo.png";
import { Lock, ArrowRight, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const ResetPasswordPage = () => {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Supabase places recovery info in URL hash; the SDK's onAuthStateChange
    // will fire PASSWORD_RECOVERY when the user lands here.
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN") setReady(true);
    });
    // Also accept if a session already exists
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setReady(true);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      toast({ title: "Erreur", description: "Le mot de passe doit contenir au moins 6 caractères", variant: "destructive" });
      return;
    }
    if (password !== confirm) {
      toast({ title: "Erreur", description: "Les mots de passe ne correspondent pas", variant: "destructive" });
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Mot de passe modifié", description: "Vous pouvez maintenant vous connecter" });
      navigate("/dashboard");
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
          <h1 className="font-display text-2xl font-bold">Nouveau mot de passe</h1>
          <p className="text-muted-foreground mt-2">Choisissez un nouveau mot de passe sécurisé</p>
        </div>

        <form onSubmit={handleUpdate} className="bg-card rounded-2xl p-8 shadow-elevated space-y-5 border border-border/50">
          <div className="space-y-2">
            <Label htmlFor="password">Nouveau mot de passe</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input id="password" type="password" placeholder="••••••••" value={password}
                onChange={(e) => setPassword(e.target.value)} className="pl-10 h-12" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirm">Confirmer le mot de passe</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input id="confirm" type="password" placeholder="••••••••" value={confirm}
                onChange={(e) => setConfirm(e.target.value)} className="pl-10 h-12" />
            </div>
          </div>

          <Button type="submit" variant="hero" className="w-full h-12 text-base" disabled={loading || !ready}>
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <>Modifier le mot de passe <ArrowRight className="h-5 w-5 ml-2" /></>}
          </Button>

          {!ready && (
            <p className="text-xs text-center text-muted-foreground">
              Validation du lien en cours…
            </p>
          )}
        </form>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
