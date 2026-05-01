import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Download, ShieldCheck, Loader2, Share2, CheckCircle2 } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import logo from "@/assets/lokalpay-logo.png";
import { generateReceiptPDF, ReceiptData } from "@/lib/receipt";
import { useToast } from "@/hooks/use-toast";

const ReceiptPage = () => {
  const { id } = useParams();
  const { toast } = useToast();
  const [tx, setTx] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data: t } = await supabase.from("transactions").select("*").eq("id", id).maybeSingle();
      if (t) {
        setTx(t);
        const { data: p } = await supabase
          .from("profiles")
          .select("display_name, lokalpay_id, market, avatar_initials, verified")
          .eq("user_id", t.user_id).maybeSingle();
        setProfile(p);
      }
      setLoading(false);
    };
    load();
  }, [id]);

  const url = typeof window !== "undefined" ? `${window.location.origin}/recu/${id}` : "";

  const handleDownload = () => {
    if (!tx || !profile) return;
    const data: ReceiptData = {
      id: tx.id, created_at: tx.created_at, type: tx.type, produit: tx.produit,
      partenaire: tx.partenaire, montant: tx.montant, payment_method: tx.payment_method,
      blockchain_status: tx.blockchain_status, tx_hash: tx.tx_hash,
      merchantName: profile.display_name, merchantLokalpayId: profile.lokalpay_id,
      merchantMarket: profile.market,
    };
    generateReceiptPDF(data);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try { await navigator.share({ title: "Reçu LokalPay", url }); } catch {}
    } else {
      await navigator.clipboard.writeText(url);
      toast({ title: "Lien copié", description: "Le lien du reçu a été copié dans le presse-papier" });
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-background"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  if (!tx) return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Card className="max-w-md"><CardContent className="p-8 text-center">
        <h2 className="font-display text-xl font-bold">Reçu introuvable</h2>
        <Button className="mt-4" asChild><Link to="/">Retour</Link></Button>
      </CardContent></Card>
    </div>
  );

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-md mx-auto">
        <div className="flex items-center justify-between mb-4">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/transactions"><ArrowLeft className="h-4 w-4 mr-1" /> Retour</Link>
          </Button>
          <Badge variant="secondary" className="gap-1"><CheckCircle2 className="h-3 w-3 text-primary" /> Reçu officiel</Badge>
        </div>

        <Card className="overflow-hidden border-0 shadow-elevated">
          {/* Header */}
          <div className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <img src={logo} alt="LokalPay" className="h-10 w-10 bg-white/10 rounded-lg p-1" />
                <div>
                  <p className="font-display font-bold text-lg leading-tight">LokalPay Congo</p>
                  <p className="text-xs opacity-80">Reçu virtuel de transaction</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[10px] opacity-80">N°</p>
                <p className="font-mono text-sm font-bold">{tx.id.slice(0,8).toUpperCase()}</p>
              </div>
            </div>
            <p className="text-xs mt-3 opacity-90">{new Date(tx.created_at).toLocaleString("fr-FR", { dateStyle: "long", timeStyle: "short" })}</p>
          </div>

          <CardContent className="p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border/50">
              <Badge className={tx.type === "vente" ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"}>
                {tx.type === "vente" ? "VENTE" : "ACHAT"}
              </Badge>
              <p className="font-display text-3xl font-bold text-primary">{tx.montant.toLocaleString("fr-FR")} <span className="text-sm font-normal text-muted-foreground">FCFA</span></p>
            </div>

            {[
              ["Commerçant", profile?.display_name],
              ["ID LokalPay", profile?.lokalpay_id],
              ...(profile?.market ? [["Marché", profile.market]] : []),
              ["Partenaire", tx.partenaire || "—"],
              ["Produit / Service", tx.produit || "—"],
              ["Mode de paiement", (tx.payment_method || "cash").toUpperCase()],
              ["Statut", tx.blockchain_status === "confirmed" ? "Confirmé ✓" : tx.blockchain_status],
            ].map(([k, v], i) => (
              <div key={i} className="flex justify-between gap-4 text-sm">
                <span className="text-muted-foreground">{k}</span>
                <span className="font-medium text-right">{v}</span>
              </div>
            ))}

            {tx.tx_hash && (
              <div className="pt-3 border-t border-border/50">
                <p className="text-xs text-muted-foreground mb-1">Hash blockchain (Stellar)</p>
                <p className="text-[10px] font-mono break-all bg-muted/40 p-2 rounded">{tx.tx_hash}</p>
              </div>
            )}

            <div className="flex flex-col items-center pt-4 border-t border-border/50">
              <div className="bg-white p-3 rounded-xl"><QRCodeSVG value={url} size={120} level="M" /></div>
              <p className="text-[10px] text-muted-foreground mt-2 flex items-center gap-1">
                <ShieldCheck className="h-3 w-3 text-primary" /> Scannez pour vérifier ce reçu
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-2 gap-3 mt-4">
          <Button variant="outline" onClick={handleShare}><Share2 className="h-4 w-4 mr-2" /> Partager</Button>
          <Button variant="hero" onClick={handleDownload}><Download className="h-4 w-4 mr-2" /> PDF</Button>
        </div>
      </div>
    </div>
  );
};

export default ReceiptPage;
