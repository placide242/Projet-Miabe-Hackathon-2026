import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { History, ArrowUpRight, ArrowDownRight, CheckCircle, Clock, Receipt } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

interface Transaction {
  id: string;
  montant: number;
  partenaire: string;
  produit: string;
  type: string;
  synced: boolean;
  created_at: string;
}

const TransactionList = ({ transactions }: { transactions: Transaction[] }) => {
  const { t, i18n } = useTranslation();
  const locale = i18n.language === "zh" ? "zh-CN" : i18n.language === "ln" ? "fr-FR" : `${i18n.language}-${i18n.language.toUpperCase()}`;

  return (
    <Card className="shadow-card border-0">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="font-display flex items-center gap-2">
          <History className="h-5 w-5 text-primary" /> {t("dashboard.recentTransactions")}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-border">
          {transactions.length === 0 && (
            <div className="px-6 py-12 text-center text-muted-foreground">
              {t("dashboard.noTransactions")}
            </div>
          )}
          {transactions.map((tx) => (
            <div key={tx.id} className="flex items-center justify-between px-6 py-4 hover:bg-muted/30 transition-colors">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  tx.type === "vente" ? "bg-primary/10" : "bg-lokalpay-gold/10"
                }`}>
                  {tx.type === "vente" ? (
                    <ArrowUpRight className="h-5 w-5 text-primary" />
                  ) : (
                    <ArrowDownRight className="h-5 w-5 text-lokalpay-gold" />
                  )}
                </div>
                <div>
                  <p className="font-medium text-sm text-foreground">{tx.partenaire || t("transaction.anonymous")}</p>
                  <p className="text-xs text-muted-foreground">
                    {tx.produit} · {new Date(tx.created_at).toLocaleDateString("fr-FR")}
                  </p>
                </div>
              </div>
              <div className="text-right flex items-center gap-2">
                <div>
                  <p className={`font-display font-semibold text-sm ${tx.type === "vente" ? "text-primary" : "text-foreground"}`}>
                    {tx.type === "vente" ? "+" : "-"}{tx.montant.toLocaleString()} FCFA
                  </p>
                  <Link to={`/recu/${tx.id}`} className="text-[11px] text-primary hover:underline inline-flex items-center gap-0.5">
                    <Receipt className="h-3 w-3" /> Reçu
                  </Link>
                </div>
                {tx.synced ? (
                  <CheckCircle className="h-4 w-4 text-primary" />
                ) : (
                  <Clock className="h-4 w-4 text-lokalpay-gold" />
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default TransactionList;

