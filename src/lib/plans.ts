export type PlanId = "free" | "premium" | "business";
export type ProfileType = "merchant" | "client" | "microfinance" | "partner";

export interface Plan {
  id: PlanId;
  name: string;
  price: number; // FCFA / mois
  features: string[];
  highlight?: boolean;
}

export const PLANS: Plan[] = [
  {
    id: "free",
    name: "Gratuit",
    price: 0,
    features: [
      "Transactions simples",
      "Score de réputation de base",
      "Profil public partageable",
      "Notation mutuelle",
    ],
  },
  {
    id: "premium",
    name: "Premium",
    price: 2500,
    highlight: true,
    features: [
      "Tout du plan Gratuit",
      "Prêts & emprunts illimités",
      "Historique avancé 12 mois",
      "Badge vérifié ✓",
      "Accès microfinances partenaires",
    ],
  },
  {
    id: "business",
    name: "Business",
    price: 10000,
    features: [
      "Tout du plan Premium",
      "Encaissement client (QR)",
      "Tableau de bord analytique",
      "Statistiques avancées",
      "Support prioritaire",
    ],
  },
];

export const COMMISSION_RATES = {
  paiement: 0.01,
  transfert: 0.02,
  pret: 0.03,
} as const;

export const canAccess = (plan: PlanId, feature: "loans" | "encaissement" | "analytics"): boolean => {
  if (feature === "loans") return plan === "premium" || plan === "business";
  if (feature === "encaissement") return plan === "business";
  if (feature === "analytics") return plan === "business";
  return true;
};

export const PROFILE_TYPES: { id: ProfileType; label: string; description: string; icon: string }[] = [
  { id: "merchant", label: "Commerçant", description: "Je vends des produits ou services", icon: "🛒" },
  { id: "client", label: "Client", description: "J'achète et je paye chez les commerçants", icon: "👤" },
  { id: "microfinance", label: "Microfinance", description: "Institution de prêts et crédits", icon: "🏦" },
  { id: "partner", label: "Partenaire", description: "Fournisseur, opérateur, distributeur", icon: "🤝" },
];

// Simple SHA-256 like hash simulation for blockchain demo
export const generateTxHash = (): string => {
  const chars = "0123456789abcdef";
  let hash = "0x";
  for (let i = 0; i < 64; i++) hash += chars[Math.floor(Math.random() * 16)];
  return hash;
};
