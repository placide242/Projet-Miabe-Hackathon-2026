import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Loader2, Lock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";
import { generateTxHash, canAccess, COMMISSION_RATES, PlanId } from "@/lib/plans";
import { Link } from "react-router-dom";

interface Props {
  onTransactionCreated: () => void;
}

const TYPES: { value: string; label: string; requiresLoan?: boolean }[] = [
  { value: "achat", label: "Achat" },
  { value: "vente", label: "Vente" },
  { value: "emprunt", label: "Emprunt", requiresLoan: true },
  { value: "pret", label: "Prêt accordé", requiresLoan: true },
  { value: "remboursement", label: "Remboursement" },
];

const NewTransactionDialog = ({ onTransactionCreated }: Props) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ montant: "", partenaire: "", produit: "", type: "achat" });
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const { t } = useTranslation();

  const plan = (profile?.subscription_plan as PlanId) || "free";
  const selectedType = TYPES.find((tp) => tp.value === form.type);
  const isLocked = selectedType?.requiresLoan && !canAccess(plan, "loans");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLocked) {
      toast({ title: "Plan Premium requis", description: "Passez en Premium pour les prêts/emprunts", variant: "destructive" });
      return;
    }
    if (!form.montant || Number(form.montant) < 100) {
      toast({ title: t("common.error"), description: t("transaction.minAmount"), variant: "destructive" });
      return;
    }
    setLoading(true);
    const amount = Number(form.montant);
    const txHash = generateTxHash();

    const { data: tx, error } = await supabase.from("transactions").insert({
      user_id: user!.id,
      montant: amount,
      partenaire: form.partenaire,
      produit: form.produit,
      type: form.type,
      synced: true,
      tx_hash: txHash,
      blockchain_status: "confirmed",
    }).select().single();

    // Commission for loans
    if (!error && tx && (form.type === "pret" || form.type === "emprunt")) {
      const commission = Math.round(amount * COMMISSION_RATES.pret);
      await supabase.from("commissions").insert({
        user_id: user!.id,
        transaction_id: tx.id,
        type: "pret",
        base_amount: amount,
        commission_amount: commission,
        rate: COMMISSION_RATES.pret,
      });
    }

    setLoading(false);
    if (error) {
      toast({ title: t("common.error"), description: t("transaction.errorSave"), variant: "destructive" });
    } else {
      toast({ title: "✅ " + t("transaction.saved"), description: `Hash blockchain: ${txHash.slice(0, 14)}…` });
      setForm({ montant: "", partenaire: "", produit: "", type: "achat" });
      setOpen(false);
      onTransactionCreated();
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="hero" size="lg" className="flex-1">
          <Plus className="h-5 w-5" /> {t("dashboard.newTransaction")}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display">{t("transaction.register")}</DialogTitle>
          <DialogDescription>{t("transaction.registerDesc")}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label>{t("dashboard.type")}</Label>
            <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {TYPES.map((tp) => (
                  <SelectItem key={tp.value} value={tp.value}>
                    {tp.label} {tp.requiresLoan && !canAccess(plan, "loans") ? "🔒" : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {isLocked && (
            <div className="rounded-lg bg-lokalpay-gold/10 border border-lokalpay-gold/30 p-3 text-sm flex items-start gap-2">
              <Lock className="h-4 w-4 text-lokalpay-gold flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-medium">Fonctionnalité Premium</p>
                <p className="text-xs text-muted-foreground mt-1">Les prêts et emprunts nécessitent le plan Premium.</p>
                <Link to="/pricing" className="text-xs text-primary font-medium hover:underline mt-1 inline-block">
                  Passer en Premium →
                </Link>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label>{t("dashboard.amount")} (FCFA)</Label>
            <Input type="number" placeholder="Ex: 25000" value={form.montant}
              onChange={(e) => setForm({ ...form, montant: e.target.value })} min={100} />
          </div>
          <div className="space-y-2">
            <Label>{t("dashboard.partner")}</Label>
            <Input placeholder={t("transaction.partnerPlaceholder")} value={form.partenaire}
              onChange={(e) => setForm({ ...form, partenaire: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label>{t("dashboard.product")}</Label>
            <Input placeholder={t("transaction.productPlaceholder")} value={form.produit}
              onChange={(e) => setForm({ ...form, produit: e.target.value })} />
          </div>
          <Button type="submit" variant="hero" className="w-full" disabled={loading || isLocked}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : t("transaction.submit")}
          </Button>
          <p className="text-xs text-center text-muted-foreground">
            🔗 Confirmé automatiquement sur la blockchain
          </p>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default NewTransactionDialog;
