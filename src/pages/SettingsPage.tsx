import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, Shield, Smartphone, Plus, Trash2, Lock, Loader2, Eye, EyeOff } from "lucide-react";
import { Link } from "react-router-dom";
import logo from "@/assets/lokalpay-logo.png";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import LanguageSwitcher from "@/components/LanguageSwitcher";

interface OperatorLink {
  id: string;
  operator_name: string;
  phone_number: string;
  is_primary: boolean;
}

const operators = ["Airtel Money", "MTN MoMo", "Orange Money", "M-Pesa"];

const SettingsPage = () => {
  const { user, profile, refreshProfile } = useAuth();
  const [operatorLinks, setOperatorLinks] = useState<OperatorLink[]>([]);
  const [newOp, setNewOp] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [loading, setLoading] = useState(true);
  const [passwordForm, setPasswordForm] = useState({ current: "", new: "", confirm: "" });
  const [privacy, setPrivacy] = useState({ show_phone: false, show_email: false, show_volume: false });
  const [bio, setBio] = useState("");

  useEffect(() => {
    if (profile) {
      setPrivacy({
        show_phone: (profile as any).show_phone ?? false,
        show_email: (profile as any).show_email ?? false,
        show_volume: (profile as any).show_volume ?? false,
      });
      setBio((profile as any).bio ?? "");
    }
  }, [profile]);

  const privacyLabels: Record<string, string> = {
    show_phone: "Numéro de téléphone",
    show_email: "Adresse email",
    show_volume: "Volume des transactions",
  };

  const updatePrivacy = async (key: "show_phone" | "show_email" | "show_volume", value: boolean) => {
    if (!user) return;
    setPrivacy((p) => ({ ...p, [key]: value }));
    const { error } = await supabase.from("profiles").update({ [key]: value } as any).eq("user_id", user.id);
    if (error) {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
      setPrivacy((p) => ({ ...p, [key]: !value }));
    } else {
      toast({
        title: value ? `🔓 ${privacyLabels[key]} maintenant visible` : `🔒 ${privacyLabels[key]} maintenant privé`,
        description: value
          ? "Cette information apparaît désormais sur votre profil public."
          : "Cette information est masquée du profil public. Vous pouvez la réactiver à tout moment.",
      });
      refreshProfile();
    }
  };

  const saveBio = async () => {
    if (!user) return;
    const { error } = await supabase.from("profiles").update({ bio } as any).eq("user_id", user.id);
    if (error) {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Bio enregistrée" });
      refreshProfile();
    }
  };

  const fetchOperators = async () => {
    if (!user) return;
    const { data } = await supabase.from("operator_links").select("*").eq("user_id", user.id);
    if (data) setOperatorLinks(data as OperatorLink[]);
    setLoading(false);
  };

  useEffect(() => { fetchOperators(); }, [user]);

  const addOperator = async () => {
    if (!user || !newOp || !newPhone) return;
    const { error } = await supabase.from("operator_links").insert({
      user_id: user.id,
      operator_name: newOp,
      phone_number: newPhone,
      is_primary: operatorLinks.length === 0,
    });
    if (error) {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Opérateur ajouté !" });
      setNewOp(""); setNewPhone("");
      fetchOperators();
    }
  };

  const removeOperator = async (id: string) => {
    await supabase.from("operator_links").delete().eq("id", id);
    fetchOperators();
  };

  const changePassword = async () => {
    if (passwordForm.new !== passwordForm.confirm) {
      toast({ title: "Erreur", description: "Les mots de passe ne correspondent pas", variant: "destructive" });
      return;
    }
    if (passwordForm.new.length < 6) {
      toast({ title: "Erreur", description: "Le mot de passe doit contenir au moins 6 caractères", variant: "destructive" });
      return;
    }
    const { error } = await supabase.auth.updateUser({ password: passwordForm.new });
    if (error) {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Mot de passe modifié avec succès !" });
      setPasswordForm({ current: "", new: "", confirm: "" });
    }
  };

  return (
    <div className="min-h-screen bg-warm">
      <header className="bg-card border-b border-border sticky top-0 z-40 shadow-card">
        <div className="container mx-auto flex items-center justify-between h-14 px-4">
          <Link to="/" className="flex items-center gap-2">
            <img src={logo} alt="LokalPay" className="h-8 w-8" />
            <span className="font-display font-bold text-lg text-foreground">LokalPay</span>
          </Link>
          <div className="flex items-center gap-3">
            <LanguageSwitcher variant="compact" />
            <Button variant="ghost" size="sm" asChild>
              <Link to="/dashboard"><ArrowLeft className="h-4 w-4 mr-1" /> Dashboard</Link>
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 max-w-2xl space-y-6">
        <h1 className="font-display text-2xl font-bold text-foreground flex items-center gap-2">
          <Shield className="h-6 w-6 text-primary" /> Paramètres & Sécurité
        </h1>

        {/* Profile info */}
        <Card className="shadow-card border-0">
          <CardHeader><CardTitle className="font-display text-lg">Mon Profil</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Nom</p>
                <p className="font-semibold text-foreground">{profile?.display_name || "—"}</p>
              </div>
              <div>
                <p className="text-muted-foreground">ID LokalPay</p>
                <p className="font-mono text-foreground">{profile?.lokalpay_id || "—"}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Marché</p>
                <p className="text-foreground">{profile?.market || "—"}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Score</p>
                <p className="font-bold text-primary">{profile?.score || 0}/100</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Mobile operators */}
        <Card className="shadow-card border-0">
          <CardHeader>
            <CardTitle className="font-display text-lg flex items-center gap-2">
              <Smartphone className="h-5 w-5 text-primary" /> Opérateurs Mobile Money
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {loading ? (
              <Loader2 className="h-6 w-6 animate-spin text-primary mx-auto" />
            ) : (
              <>
                {operatorLinks.map(op => (
                  <div key={op.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-xl">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">
                        {op.operator_name.includes("Airtel") ? "📱" : op.operator_name.includes("MTN") ? "📲" : op.operator_name.includes("Orange") ? "📳" : "💳"}
                      </span>
                      <div>
                        <p className="font-medium text-sm text-foreground">{op.operator_name}</p>
                        <p className="text-xs text-muted-foreground">{op.phone_number}</p>
                      </div>
                      {op.is_primary && <Badge className="bg-primary/20 text-primary text-[10px]">Principal</Badge>}
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => removeOperator(op.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                ))}
                <div className="flex gap-3">
                  <Select onValueChange={setNewOp}>
                    <SelectTrigger className="flex-1"><SelectValue placeholder="Opérateur" /></SelectTrigger>
                    <SelectContent>
                      {operators.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <Input className="flex-1" placeholder="Numéro de téléphone" value={newPhone} onChange={e => setNewPhone(e.target.value)} />
                  <Button variant="hero" onClick={addOperator}><Plus className="h-4 w-4" /></Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Privacy / visibility */}
        <Card className="shadow-card border-0">
          <CardHeader>
            <CardTitle className="font-display text-lg flex items-center gap-2">
              <Eye className="h-5 w-5 text-primary" /> Confidentialité du profil public
            </CardTitle>
            <p className="text-xs text-muted-foreground">
              Contrôlez les informations visibles sur votre profil public. Votre score, votre nom et votre marché restent toujours visibles — ils sont essentiels pour l'obtention de crédit.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { key: "show_phone" as const, label: "Afficher mon numéro de téléphone", desc: "Visible par tous les visiteurs de votre profil" },
              { key: "show_email" as const, label: "Afficher mon adresse email", desc: "Permet aux partenaires de vous contacter" },
              { key: "show_volume" as const, label: "Afficher mon volume exact", desc: "Sinon seul le score et le nombre de transactions sont visibles" },
            ].map((item) => (
              <div key={item.key} className="flex items-start justify-between gap-3 p-3 bg-muted/30 rounded-xl">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    {privacy[item.key] ? <Eye className="h-4 w-4 text-primary" /> : <EyeOff className="h-4 w-4 text-muted-foreground" />}
                    <p className="font-medium text-sm text-foreground">{item.label}</p>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 ml-6">{item.desc}</p>
                </div>
                <Switch checked={privacy[item.key]} onCheckedChange={(v) => updatePrivacy(item.key, v)} />
              </div>
            ))}
            <div className="pt-2">
              <p className="text-sm font-medium text-foreground mb-2">Bio publique (optionnelle)</p>
              <Input
                placeholder="Ex: Vente de produits agricoles depuis 2020"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                maxLength={140}
              />
              <Button variant="outline" size="sm" className="mt-2" onClick={saveBio}>Enregistrer la bio</Button>
            </div>
          </CardContent>
        </Card>

        {/* Change password */}
        <Card className="shadow-card border-0">
          <CardHeader>
            <CardTitle className="font-display text-lg flex items-center gap-2">
              <Lock className="h-5 w-5 text-primary" /> Changer le mot de passe
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input type="password" placeholder="Nouveau mot de passe" value={passwordForm.new}
              onChange={e => setPasswordForm(f => ({ ...f, new: e.target.value }))} />
            <Input type="password" placeholder="Confirmer le mot de passe" value={passwordForm.confirm}
              onChange={e => setPasswordForm(f => ({ ...f, confirm: e.target.value }))} />
            <Button variant="hero" className="w-full" onClick={changePassword}>Modifier le mot de passe</Button>
          </CardContent>
        </Card>

        {/* Language */}
        <Card className="shadow-card border-0">
          <CardHeader><CardTitle className="font-display text-lg">Langue</CardTitle></CardHeader>
          <CardContent>
            <LanguageSwitcher />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SettingsPage;
