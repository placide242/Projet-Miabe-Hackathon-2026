import jsPDF from "jspdf";

export interface ReceiptData {
  id: string;
  created_at: string;
  type: string;
  produit: string;
  partenaire: string;
  montant: number;
  payment_method: string;
  blockchain_status: string;
  tx_hash?: string | null;
  merchantName: string;
  merchantLokalpayId: string;
  merchantMarket?: string;
}

const fmtDate = (s: string) =>
  new Date(s).toLocaleString("fr-FR", { dateStyle: "long", timeStyle: "short" });

export const generateReceiptPDF = (r: ReceiptData) => {
  const doc = new jsPDF({ unit: "mm", format: "a5" });
  const W = doc.internal.pageSize.getWidth();

  // Header band
  doc.setFillColor(34, 139, 90);
  doc.rect(0, 0, W, 28, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.text("LokalPay Congo", 12, 14);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text("Reçu virtuel de transaction", 12, 21);

  // Receipt number
  doc.setTextColor(40, 40, 40);
  doc.setFontSize(9);
  doc.text(`N° ${r.id.slice(0, 8).toUpperCase()}`, W - 12, 14, { align: "right" });
  doc.text(fmtDate(r.created_at), W - 12, 21, { align: "right" });

  // Body
  let y = 40;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text(r.type === "vente" ? "VENTE" : "ACHAT", 12, y);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  y += 8;

  const rows: [string, string][] = [
    ["Commerçant", `${r.merchantName} (${r.merchantLokalpayId})`],
    ...(r.merchantMarket ? [["Marché", r.merchantMarket] as [string, string]] : []),
    ["Partenaire", r.partenaire || "—"],
    ["Produit / Service", r.produit || "—"],
    ["Mode de paiement", r.payment_method?.toUpperCase() || "CASH"],
    ["Statut", r.blockchain_status === "confirmed" ? "Confirmé ✓" : r.blockchain_status],
    ...(r.tx_hash ? [["Hash blockchain", r.tx_hash.slice(0, 28) + "…"] as [string, string]] : []),
  ];

  rows.forEach(([k, v]) => {
    doc.setTextColor(120, 120, 120);
    doc.text(k, 12, y);
    doc.setTextColor(20, 20, 20);
    doc.text(String(v), W - 12, y, { align: "right" });
    y += 7;
  });

  // Total
  y += 4;
  doc.setDrawColor(220);
  doc.line(12, y, W - 12, y);
  y += 9;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(34, 139, 90);
  doc.text("Montant total", 12, y);
  doc.text(`${r.montant.toLocaleString("fr-FR")} FCFA`, W - 12, y, { align: "right" });

  // Footer
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(140, 140, 140);
  doc.text("Reçu généré par LokalPay Congo · Vérifié sur blockchain Stellar", W / 2, 195, { align: "center" });
  doc.text(`Vérifier ce reçu : ${typeof window !== "undefined" ? window.location.origin : ""}/recu/${r.id}`, W / 2, 200, { align: "center" });

  doc.save(`recu-lokalpay-${r.id.slice(0, 8)}.pdf`);
};

export const exportTransactionsCSV = (txs: any[], filename = "transactions-lokalpay.csv") => {
  const headers = ["Date", "Type", "Produit", "Partenaire", "Montant (FCFA)", "Mode", "Statut", "ID"];
  const lines = [headers.join(",")];
  txs.forEach((t) => {
    const row = [
      new Date(t.created_at).toLocaleString("fr-FR"),
      t.type,
      `"${(t.produit || "").replace(/"/g, '""')}"`,
      `"${(t.partenaire || "").replace(/"/g, '""')}"`,
      t.montant,
      t.payment_method || "cash",
      t.blockchain_status || "confirmed",
      t.id,
    ];
    lines.push(row.join(","));
  });
  const blob = new Blob(["\uFEFF" + lines.join("\n")], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};
