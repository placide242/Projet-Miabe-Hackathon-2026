import { Link, useLocation } from "react-router-dom";
import { Home, ListOrdered, BarChart3, Landmark, Plus, User } from "lucide-react";
import { useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/contexts/AuthContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { generateTxHash } from "@/lib/plans";

const tabs = [
  { to: "/dashboard", icon: Home, label: "Accueil" },
  { to: "/transactions", icon: ListOrdered, label: "Transactions" },
  { to: "/classement", icon: BarChart3, label: "Score" },
  { to: "/microfinance", icon: Landmark, label: "Crédit" },
];

export const MobileBottomNav = () => {
  const isMobile = useIsMobile();
  const { user, profile, refreshProfile } = useAuth();
  const location = useLocation();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ montant: "", partenaire: "", produit: "" });
  const [loading, setLoading] = useState(false);

  if (!isMobile || !user) return null;
  if (["/login", "/register", "/forgot-password", "/reset-password"].includes(location.pathname)) return null;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.montant || Number(form.montant) < 100) {
      toast({ title: "Montant invalide", description: "Minimum 100 FCFA", variant: "destructive" });
      return;
    }
    setLoading(true);
    const { error } = await supabase.from("transactions").insert({
      user_id: user.id,
      montant: Number(form.montant),
      partenaire: form.partenaire,
      produit: form.produit,
      type: "vente",
      synced: true,
      tx_hash: generateTxHash(),
      blockchain_status: "confirmed",
    });
    setLoading(false);
    if (error) { toast({ title: "Erreur", description: error.message, variant: "destructive" }); return; }
    toast({ title: "✅ Transaction enregistrée" });
    setForm({ montant: "", partenaire: "", produit: "" });
    setOpen(false);
    await refreshProfile();
  };

  return (
    <>
      <div className="h-20 md:hidden" aria-hidden />
      <nav className="fixed bottom-0 inset-x-0 z-50 md:hidden bg-card/95 backdrop-blur-xl border-t border-border shadow-elevated">
        <div className="grid grid-cols-5 items-end h-16 px-1">
          <NavItem to={tabs[0].to} icon={tabs[0].icon} label={tabs[0].label} active={location.pathname === tabs[0].to} />
          <NavItem to={tabs[1].to} icon={tabs[1].icon} label={tabs[1].label} active={location.pathname.startsWith(tabs[1].to)} />
          <div className="flex justify-center">
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <button
                  className="-mt-6 w-14 h-14 rounded-full bg-gradient-gold text-foreground shadow-gold flex items-center justify-center active:scale-95 transition-transform"
                  aria-label="Nouvelle transaction"
                >
                  <Plus className="h-6 w-6" />
                </button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader><DialogTitle className="font-display">Nouvelle transaction</DialogTitle></DialogHeader>
                <form onSubmit={submit} className="space-y-3 mt-2">
                  <div className="space-y-2"><Label>Montant (FCFA)</Label>
                    <Input type="number" inputMode="numeric" value={form.montant} onChange={(e) => setForm({ ...form, montant: e.target.value })} /></div>
                  <div className="space-y-2"><Label>Client / Partenaire</Label>
                    <Input value={form.partenaire} onChange={(e) => setForm({ ...form, partenaire: e.target.value })} /></div>
                  <div className="space-y-2"><Label>Produit / Service</Label>
                    <Input value={form.produit} onChange={(e) => setForm({ ...form, produit: e.target.value })} /></div>
                  <Button type="submit" variant="hero" className="w-full" disabled={loading}>
                    {loading ? "Enregistrement…" : "Enregistrer"}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
          <NavItem to={tabs[2].to} icon={tabs[2].icon} label={tabs[2].label} active={location.pathname.startsWith(tabs[2].to)} />
          <NavItem to={tabs[3].to} icon={tabs[3].icon} label={tabs[3].label} active={location.pathname.startsWith(tabs[3].to)} />
        </div>
        <Link
          to={`/profil/${profile?.lokalpay_id || "me"}`}
          className="absolute -top-3 right-3 w-9 h-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-card border-2 border-card"
          aria-label="Profil"
        >
          <User className="h-4 w-4" />
        </Link>
      </nav>
    </>
  );
};

const NavItem = ({ to, icon: Icon, label, active }: { to: string; icon: any; label: string; active: boolean }) => (
  <Link
    to={to}
    className={`flex flex-col items-center justify-center gap-0.5 py-2 text-[10px] font-medium transition-colors ${
      active ? "text-primary" : "text-muted-foreground hover:text-foreground"
    }`}
  >
    <Icon className={`h-5 w-5 ${active ? "scale-110" : ""} transition-transform`} />
    <span>{label}</span>
  </Link>
);

export default MobileBottomNav;
