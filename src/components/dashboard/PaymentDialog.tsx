import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { CreditCard, Smartphone, Loader2, ShieldCheck, CheckCircle2, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { generateTxHash, COMMISSION_RATES } from "@/lib/plans";

interface Props { trigger?: React.ReactNode; onPaid?: () => void; }

const OPERATORS = [
  { name: "Airtel Money", code: "*128#", prefix: ["04", "05"], emoji: "📱" },
  { name: "MTN MoMo", code: "*133#", prefix: ["06"], emoji: "📲" },
];

type Step = "form" | "ussd" | "pin" | "validating" | "blockchain" | "success";

const PaymentDialog = ({ trigger, onPaid }: Props) => {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<Step>("form");
  const [method, setMethod] = useState<"card" | "mobile">("mobile");
  const [pin, setPin] = useState("");
  const [pinError, setPinError] = useState("");
  const [otpCountdown, setOtpCountdown] = useState(0);
  const [txHash, setTxHash] = useState("");
  const [form, setForm] = useState({
    amount: "",
    recipient: "",
    operator: OPERATORS[0].name,
    cardNumber: "",
    cardExpiry: "",
    cardCvc: "",
    mobileNumber: "",
  });
  const { user } = useAuth();
  const { toast } = useToast();

  const reset = () => {
    setForm({ amount: "", recipient: "", operator: OPERATORS[0].name, cardNumber: "", cardExpiry: "", cardCvc: "", mobileNumber: "" });
    setStep("form");
    setPin("");
    setPinError("");
    setTxHash("");
  };

  // Countdown for USSD push
  useEffect(() => {
    if (step === "ussd" && otpCountdown > 0) {
      const t = setTimeout(() => setOtpCountdown(otpCountdown - 1), 1000);
      return () => clearTimeout(t);
    }
    if (step === "ussd" && otpCountdown === 0) {
      setStep("pin");
    }
  }, [step, otpCountdown]);

  const validatePhoneForOperator = (phone: string, operatorName: string): boolean => {
    const op = OPERATORS.find((o) => o.name === operatorName);
    if (!op) return false;
    const cleaned = phone.replace(/\s|\+|242/g, "");
    return op.prefix.some((p) => cleaned.startsWith(p)) && cleaned.length >= 9;
  };

  const handleStartPayment = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = Number(form.amount);
    if (!amount || amount < 100) {
      toast({ title: "Erreur", description: "Montant minimum 100 FCFA", variant: "destructive" });
      return;
    }
    if (amount > 2000000) {
      toast({ title: "Erreur", description: "Montant maximum 2 000 000 FCFA par transaction", variant: "destructive" });
      return;
    }

    if (method === "card") {
      const cleanCard = form.cardNumber.replace(/\s/g, "");
      if (cleanCard.length < 13 || cleanCard.length > 19) {
        toast({ title: "Carte invalide", description: "Le numéro doit contenir 13 à 19 chiffres", variant: "destructive" });
        return;
      }
      if (!/^\d{2}\/\d{2}$/.test(form.cardExpiry)) {
        toast({ title: "Date invalide", description: "Format attendu : MM/AA", variant: "destructive" });
        return;
      }
      if (form.cardCvc.length < 3) {
        toast({ title: "CVC invalide", description: "3 ou 4 chiffres requis", variant: "destructive" });
        return;
      }
      // Card flow → directly to validation
      setStep("validating");
      processPayment();
      return;
    }

    // Mobile money flow
    if (!form.mobileNumber) {
      toast({ title: "Erreur", description: "Numéro mobile requis", variant: "destructive" });
      return;
    }
    if (!validatePhoneForOperator(form.mobileNumber, form.operator)) {
      const op = OPERATORS.find((o) => o.name === form.operator);
      toast({
        title: "Numéro non compatible",
        description: `${form.operator} accepte les préfixes : ${op?.prefix.join(", ")}. Ex: ${op?.prefix[0]} XX XX XX XX`,
        variant: "destructive",
      });
      return;
    }

    // Trigger USSD push simulation
    setOtpCountdown(4);
    setStep("ussd");
  };

  const handleSubmitPin = () => {
    setPinError("");
    if (!/^\d{4}$/.test(pin)) {
      setPinError("Le code PIN doit contenir 4 chiffres");
      return;
    }
    // Simulate that "0000" is rejected
    if (pin === "0000") {
      setPinError("Code PIN incorrect. Veuillez réessayer.");
      setPin("");
      return;
    }
    setStep("validating");
    processPayment();
  };

  const processPayment = async () => {
    const amount = Number(form.amount);
    const hash = generateTxHash();
    setTxHash(hash);

    // 1. Insert pending tx
    const { data: tx, error } = await supabase
      .from("transactions")
      .insert({
        user_id: user!.id,
        montant: amount,
        partenaire: form.recipient || "Bénéficiaire",
        produit: "Paiement",
        type: "paiement",
        synced: true,
        tx_hash: hash,
        blockchain_status: "pending",
        payment_method: method === "card" ? "carte" : form.operator,
      })
      .select()
      .single();

    if (error || !tx) {
      toast({ title: "Erreur", description: error?.message || "Échec du paiement", variant: "destructive" });
      setStep("form");
      return;
    }

    // 2. Mobile Money provider validation (simulate)
    await new Promise((r) => setTimeout(r, 1200));

    // 3. Blockchain anchoring
    setStep("blockchain");
    await new Promise((r) => setTimeout(r, 1500));

    // 4. Commission
    const commission = Math.round(amount * COMMISSION_RATES.paiement);
    await supabase.from("commissions").insert({
      user_id: user!.id,
      transaction_id: tx.id,
      type: "paiement",
      base_amount: amount,
      commission_amount: commission,
      rate: COMMISSION_RATES.paiement,
    });

    setStep("success");
    setTimeout(() => {
      toast({
        title: "✅ Paiement validé",
        description: `${amount.toLocaleString()} FCFA · Hash blockchain : ${hash.slice(0, 12)}…`,
      });
      reset();
      setOpen(false);
      onPaid?.();
    }, 1800);
  };

  const currentOp = OPERATORS.find((o) => o.name === form.operator);
  const amountNum = Number(form.amount) || 0;
  const fees = Math.round(amountNum * COMMISSION_RATES.paiement);

  return (
    <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) reset(); }}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="lg">
            <CreditCard className="h-5 w-5" /> Payer
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-primary" /> Paiement sécurisé
          </DialogTitle>
          <DialogDescription>
            {step === "form" && "Carte bancaire ou Mobile Money. Double validation Mobile Money + Blockchain."}
            {step === "ussd" && `Confirmation envoyée sur votre ${form.operator}…`}
            {step === "pin" && "Saisissez votre code PIN Mobile Money pour valider"}
            {step === "validating" && "Validation auprès de l'opérateur…"}
            {step === "blockchain" && "Ancrage de la preuve sur la blockchain Stellar…"}
            {step === "success" && "Transaction confirmée et signée sur la blockchain"}
          </DialogDescription>
        </DialogHeader>

        {step === "form" && (
          <form onSubmit={handleStartPayment} className="space-y-4 mt-2">
            <div className="grid grid-cols-2 gap-2 p-1 bg-muted rounded-lg">
              <button
                type="button"
                onClick={() => setMethod("mobile")}
                className={`py-2 rounded-md text-sm font-medium transition-colors ${
                  method === "mobile" ? "bg-card shadow-sm" : "text-muted-foreground"
                }`}
              >
                <Smartphone className="h-4 w-4 inline mr-1" /> Mobile Money
              </button>
              <button
                type="button"
                onClick={() => setMethod("card")}
                className={`py-2 rounded-md text-sm font-medium transition-colors ${
                  method === "card" ? "bg-card shadow-sm" : "text-muted-foreground"
                }`}
              >
                <CreditCard className="h-4 w-4 inline mr-1" /> Carte
              </button>
            </div>

            <div className="space-y-2">
              <Label>Montant (FCFA)</Label>
              <Input type="number" min={100} max={2000000} placeholder="Ex: 5000" value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })} />
              {amountNum > 0 && (
                <p className="text-[11px] text-muted-foreground">
                  Frais de service : {fees.toLocaleString()} FCFA · Total débité : {(amountNum + fees).toLocaleString()} FCFA
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Bénéficiaire (nom ou ID LokalPay)</Label>
              <Input placeholder="Ex: LK-CG-1234 ou Marie K." value={form.recipient}
                onChange={(e) => setForm({ ...form, recipient: e.target.value })} />
            </div>

            {method === "mobile" ? (
              <>
                <div className="space-y-2">
                  <Label>Opérateur</Label>
                  <select
                    className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                    value={form.operator}
                    onChange={(e) => setForm({ ...form, operator: e.target.value })}
                  >
                    {OPERATORS.map((o) => <option key={o.name} value={o.name}>{o.emoji} {o.name}</option>)}
                  </select>
                  {currentOp && (
                    <p className="text-[11px] text-muted-foreground">
                      Préfixes acceptés : {currentOp.prefix.join(", ")} · Code USSD : {currentOp.code}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Numéro mobile</Label>
                  <Input
                    type="tel"
                    placeholder={`+242 ${currentOp?.prefix[0]} XX XX XX XX`}
                    value={form.mobileNumber}
                    onChange={(e) => setForm({ ...form, mobileNumber: e.target.value })}
                  />
                </div>
              </>
            ) : (
              <>
                <div className="space-y-2">
                  <Label>Numéro de carte</Label>
                  <Input placeholder="4242 4242 4242 4242" maxLength={19} value={form.cardNumber}
                    onChange={(e) => setForm({ ...form, cardNumber: e.target.value })} />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-2">
                    <Label>Expiration</Label>
                    <Input placeholder="MM/AA" maxLength={5} value={form.cardExpiry}
                      onChange={(e) => setForm({ ...form, cardExpiry: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>CVC</Label>
                    <Input placeholder="123" maxLength={4} value={form.cardCvc}
                      onChange={(e) => setForm({ ...form, cardCvc: e.target.value })} />
                  </div>
                </div>
              </>
            )}

            <div className="rounded-lg bg-primary/5 border border-primary/20 p-3 text-xs text-muted-foreground">
              <div className="flex items-start gap-2">
                <ShieldCheck className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <div>
                  <strong className="text-foreground">Double validation</strong> · Confirmation par votre opérateur Mobile Money + ancrage immuable sur la blockchain Stellar.
                </div>
              </div>
            </div>

            <Button type="submit" variant="hero" className="w-full h-12">
              {method === "mobile" ? "Envoyer la demande Mobile Money" : "Payer maintenant"}
            </Button>
          </form>
        )}

        {step === "ussd" && currentOp && (
          <div className="py-6 text-center space-y-4">
            <div className="text-6xl">{currentOp.emoji}</div>
            <div className="bg-muted/50 rounded-lg p-4 font-mono text-xs text-left whitespace-pre-line">
              {`${currentOp.code}\n\n${currentOp.name}\n----------------------\nDemande de paiement\nMontant : ${amountNum.toLocaleString()} FCFA\nBénéficiaire : ${form.recipient || "LokalPay"}\nFrais : ${fees} FCFA\n\nValider ? 1=OUI 2=NON`}
            </div>
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
              Notification envoyée au {form.mobileNumber}… ({otpCountdown}s)
            </div>
          </div>
        )}

        {step === "pin" && (
          <div className="py-6 space-y-4">
            <div className="text-center">
              <Smartphone className="h-10 w-10 text-primary mx-auto mb-2" />
              <p className="text-sm text-foreground">Saisissez votre <strong>code PIN {form.operator}</strong></p>
              <p className="text-xs text-muted-foreground mt-1">4 chiffres · ce code reste sur votre téléphone</p>
            </div>
            <div className="space-y-2">
              <Input
                type="password"
                inputMode="numeric"
                maxLength={4}
                placeholder="••••"
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
                className="text-center text-2xl tracking-[0.5em] font-mono h-14"
                autoFocus
              />
              {pinError && (
                <div className="flex items-center gap-1.5 text-xs text-destructive">
                  <AlertCircle className="h-3.5 w-3.5" /> {pinError}
                </div>
              )}
              <p className="text-[11px] text-muted-foreground text-center">Astuce démo : tout PIN sauf "0000" est accepté</p>
            </div>
            <Button onClick={handleSubmitPin} variant="hero" className="w-full h-12" disabled={pin.length !== 4}>
              Valider le paiement
            </Button>
            <Button variant="ghost" size="sm" className="w-full" onClick={() => setStep("form")}>
              Annuler
            </Button>
          </div>
        )}

        {(step === "validating" || step === "blockchain") && (
          <div className="py-10 text-center space-y-4">
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
            <div className="space-y-1">
              <p className="font-medium text-foreground">
                {step === "validating" ? "Validation Mobile Money en cours…" : "Ancrage blockchain en cours…"}
              </p>
              <p className="text-xs text-muted-foreground">
                {step === "validating"
                  ? `Communication sécurisée avec ${form.operator}`
                  : "Génération de la preuve cryptographique sur Stellar"}
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 text-xs">
              <span className={`flex items-center gap-1 ${step === "blockchain" ? "text-primary" : "text-muted-foreground"}`}>
                {step === "blockchain" ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                Mobile Money
              </span>
              <span className="text-muted-foreground">→</span>
              <span className={`flex items-center gap-1 ${step === "blockchain" ? "text-primary" : "text-muted-foreground"}`}>
                {step === "blockchain" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
                Blockchain
              </span>
            </div>
          </div>
        )}

        {step === "success" && (
          <div className="py-10 text-center space-y-3">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
              <CheckCircle2 className="h-10 w-10 text-primary" />
            </div>
            <p className="font-display text-xl font-bold text-foreground">Paiement confirmé !</p>
            <p className="text-sm text-muted-foreground">{amountNum.toLocaleString()} FCFA envoyés</p>
            <div className="bg-muted/50 rounded-lg p-3 font-mono text-[11px] text-muted-foreground break-all">
              {txHash}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default PaymentDialog;
