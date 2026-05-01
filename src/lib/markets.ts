// Régions, arrondissements et marchés de la République du Congo (Brazzaville)
// Pas de RDC (République Démocratique du Congo)

export interface Market {
  id: string;
  name: string;
}

export interface District {
  id: string;
  name: string;
  markets: Market[];
}

export interface Region {
  id: string;
  name: string;
  districts: District[];
}

export const REGIONS: Region[] = [
  {
    id: "brazzaville",
    name: "Brazzaville (Capitale)",
    districts: [
      {
        id: "bzv-makelekele",
        name: "Makélékélé (1er arr.)",
        markets: [
          { id: "m-total", name: "Marché Total" },
          { id: "m-mbouono", name: "Marché Mbouono" },
          { id: "m-mfilou-pont", name: "Marché Pont du Djoué" },
          { id: "m-kingouari", name: "Marché Kingouari" },
        ],
      },
      {
        id: "bzv-bacongo",
        name: "Bacongo (2e arr.)",
        markets: [
          { id: "m-bacongo", name: "Marché Bacongo" },
          { id: "m-plateau-aviation", name: "Marché Plateau des 15 ans" },
          { id: "m-yoro", name: "Marché Yoro" },
        ],
      },
      {
        id: "bzv-poto-poto",
        name: "Poto-Poto (3e arr.)",
        markets: [
          { id: "m-poto-poto", name: "Marché Poto-Poto" },
          { id: "m-mikalou", name: "Marché Mikalou" },
          { id: "m-tsieme", name: "Marché Tsiémé" },
          { id: "m-rex", name: "Marché Rex" },
        ],
      },
      {
        id: "bzv-moungali",
        name: "Moungali (4e arr.)",
        markets: [
          { id: "m-moungali", name: "Marché Moungali" },
          { id: "m-fulbert", name: "Marché Fulbert Youlou" },
          { id: "m-jacques-opangault", name: "Marché Jacques Opangault" },
        ],
      },
      {
        id: "bzv-ouenze",
        name: "Ouenzé (5e arr.)",
        markets: [
          { id: "m-ouenze", name: "Marché Ouenzé" },
          { id: "m-jeanne-vialle", name: "Marché Jeanne Vialle" },
          { id: "m-itatolo", name: "Marché Itatolo" },
        ],
      },
      {
        id: "bzv-talangai",
        name: "Talangaï (6e arr.)",
        markets: [
          { id: "m-talangai", name: "Marché Talangaï" },
          { id: "m-nkombo", name: "Marché Nkombo" },
          { id: "m-mikalou-2", name: "Marché Mikalou II" },
          { id: "m-mpila", name: "Marché Mpila" },
        ],
      },
      {
        id: "bzv-mfilou",
        name: "Mfilou (7e arr.)",
        markets: [
          { id: "m-mfilou", name: "Marché Mfilou" },
          { id: "m-massengo", name: "Marché Massengo" },
          { id: "m-kombe", name: "Marché Kombé" },
        ],
      },
      {
        id: "bzv-madibou",
        name: "Madibou (8e arr.)",
        markets: [
          { id: "m-madibou", name: "Marché Madibou" },
          { id: "m-mayanga", name: "Marché Mayanga" },
        ],
      },
      {
        id: "bzv-djiri",
        name: "Djiri (9e arr.)",
        markets: [
          { id: "m-djiri", name: "Marché Djiri" },
          { id: "m-massina", name: "Marché Massina" },
        ],
      },
    ],
  },
  {
    id: "pointe-noire",
    name: "Pointe-Noire (Économique)",
    districts: [
      {
        id: "pn-lumumba",
        name: "Lumumba (1er arr.)",
        markets: [
          { id: "m-grand-marche", name: "Grand Marché Pointe-Noire" },
          { id: "m-fond-tie-tie", name: "Marché Fond Tié-Tié" },
        ],
      },
      {
        id: "pn-mvou-mvou",
        name: "Mvou-Mvou (2e arr.)",
        markets: [
          { id: "m-mvou-mvou", name: "Marché Mvou-Mvou" },
          { id: "m-tchimbamba", name: "Marché Tchimbamba" },
        ],
      },
      {
        id: "pn-tie-tie",
        name: "Tié-Tié (3e arr.)",
        markets: [
          { id: "m-tie-tie", name: "Marché Tié-Tié" },
          { id: "m-mboukou", name: "Marché Mboukou" },
        ],
      },
      {
        id: "pn-loandjili",
        name: "Loandjili (4e arr.)",
        markets: [
          { id: "m-loandjili", name: "Marché Loandjili" },
          { id: "m-ngoyo", name: "Marché Ngoyo" },
        ],
      },
      {
        id: "pn-mongo-mpoukou",
        name: "Mongo-Mpoukou (5e arr.)",
        markets: [
          { id: "m-mongo-mpoukou", name: "Marché Mongo-Mpoukou" },
        ],
      },
      {
        id: "pn-tchiamba",
        name: "Tchiamba-Nzassi (6e arr.)",
        markets: [
          { id: "m-tchiamba", name: "Marché Tchiamba-Nzassi" },
        ],
      },
    ],
  },
  {
    id: "kouilou",
    name: "Kouilou",
    districts: [
      { id: "k-hinda", name: "Hinda", markets: [{ id: "m-hinda", name: "Marché Hinda" }] },
      { id: "k-loango", name: "Loango", markets: [{ id: "m-loango", name: "Marché Loango" }] },
      { id: "k-madingo", name: "Madingo-Kayes", markets: [{ id: "m-madingo", name: "Marché Madingo-Kayes" }] },
      { id: "k-nzambi", name: "Nzambi", markets: [{ id: "m-nzambi", name: "Marché Nzambi" }] },
    ],
  },
  {
    id: "niari",
    name: "Niari",
    districts: [
      { id: "n-dolisie", name: "Dolisie", markets: [
        { id: "m-dolisie-central", name: "Marché Central Dolisie" },
        { id: "m-dolisie-mboungou", name: "Marché Mboungou-Mbadi" },
      ]},
      { id: "n-mossendjo", name: "Mossendjo", markets: [{ id: "m-mossendjo", name: "Marché Mossendjo" }] },
      { id: "n-kibangou", name: "Kibangou", markets: [{ id: "m-kibangou", name: "Marché Kibangou" }] },
      { id: "n-divenie", name: "Divénié", markets: [{ id: "m-divenie", name: "Marché Divénié" }] },
    ],
  },
  {
    id: "bouenza",
    name: "Bouenza",
    districts: [
      { id: "b-nkayi", name: "Nkayi", markets: [
        { id: "m-nkayi-central", name: "Marché Central Nkayi" },
        { id: "m-nkayi-gare", name: "Marché de la Gare Nkayi" },
      ]},
      { id: "b-madingou", name: "Madingou", markets: [{ id: "m-madingou", name: "Marché Madingou" }] },
      { id: "b-mouyondzi", name: "Mouyondzi", markets: [{ id: "m-mouyondzi", name: "Marché Mouyondzi" }] },
      { id: "b-loutete", name: "Loutété", markets: [{ id: "m-loutete", name: "Marché Loutété" }] },
    ],
  },
  {
    id: "lekoumou",
    name: "Lékoumou",
    districts: [
      { id: "l-sibiti", name: "Sibiti", markets: [{ id: "m-sibiti", name: "Marché Sibiti" }] },
      { id: "l-zanaga", name: "Zanaga", markets: [{ id: "m-zanaga", name: "Marché Zanaga" }] },
      { id: "l-komono", name: "Komono", markets: [{ id: "m-komono", name: "Marché Komono" }] },
    ],
  },
  {
    id: "pool",
    name: "Pool",
    districts: [
      { id: "p-kinkala", name: "Kinkala", markets: [{ id: "m-kinkala", name: "Marché Kinkala" }] },
      { id: "p-boko", name: "Boko", markets: [{ id: "m-boko", name: "Marché Boko" }] },
      { id: "p-mindouli", name: "Mindouli", markets: [{ id: "m-mindouli", name: "Marché Mindouli" }] },
      { id: "p-ngabe", name: "Ngabé", markets: [{ id: "m-ngabe", name: "Marché Ngabé" }] },
    ],
  },
  {
    id: "plateaux",
    name: "Plateaux",
    districts: [
      { id: "pl-djambala", name: "Djambala", markets: [{ id: "m-djambala", name: "Marché Djambala" }] },
      { id: "pl-gamboma", name: "Gamboma", markets: [{ id: "m-gamboma", name: "Marché Gamboma" }] },
      { id: "pl-lekana", name: "Lékana", markets: [{ id: "m-lekana", name: "Marché Lékana" }] },
      { id: "pl-mbon", name: "Mbon", markets: [{ id: "m-mbon", name: "Marché Mbon" }] },
    ],
  },
  {
    id: "cuvette",
    name: "Cuvette",
    districts: [
      { id: "c-owando", name: "Owando", markets: [{ id: "m-owando", name: "Marché Owando" }] },
      { id: "c-makoua", name: "Makoua", markets: [{ id: "m-makoua", name: "Marché Makoua" }] },
      { id: "c-oyo", name: "Oyo", markets: [{ id: "m-oyo", name: "Marché Oyo" }] },
      { id: "c-boundji", name: "Boundji", markets: [{ id: "m-boundji", name: "Marché Boundji" }] },
    ],
  },
  {
    id: "cuvette-ouest",
    name: "Cuvette-Ouest",
    districts: [
      { id: "co-ewo", name: "Ewo", markets: [{ id: "m-ewo", name: "Marché Ewo" }] },
      { id: "co-kelle", name: "Kéllé", markets: [{ id: "m-kelle", name: "Marché Kéllé" }] },
      { id: "co-mbomo", name: "Mbomo", markets: [{ id: "m-mbomo", name: "Marché Mbomo" }] },
    ],
  },
  {
    id: "sangha",
    name: "Sangha",
    districts: [
      { id: "s-ouesso", name: "Ouesso", markets: [
        { id: "m-ouesso-central", name: "Marché Central Ouesso" },
        { id: "m-ouesso-port", name: "Marché du Port Ouesso" },
      ]},
      { id: "s-sembe", name: "Sembé", markets: [{ id: "m-sembe", name: "Marché Sembé" }] },
      { id: "s-souanke", name: "Souanké", markets: [{ id: "m-souanke", name: "Marché Souanké" }] },
    ],
  },
  {
    id: "likouala",
    name: "Likouala",
    districts: [
      { id: "li-impfondo", name: "Impfondo", markets: [{ id: "m-impfondo", name: "Marché Impfondo" }] },
      { id: "li-epena", name: "Epena", markets: [{ id: "m-epena", name: "Marché Epena" }] },
      { id: "li-dongou", name: "Dongou", markets: [{ id: "m-dongou", name: "Marché Dongou" }] },
    ],
  },
];

// Opérateurs Mobile Money — RÉPUBLIQUE DU CONGO uniquement
// Airtel Money (préfixes 04, 05) et MTN Mobile Money (préfixes 06)
export const MOBILE_MONEY_OPERATORS = [
  {
    id: "airtel",
    name: "Airtel Money",
    color: "hsl(0 85% 55%)",
    prefixes: ["04", "05"],
    description: "Préfixes 04 et 05",
  },
  {
    id: "mtn",
    name: "MTN Mobile Money",
    color: "hsl(45 100% 50%)",
    prefixes: ["06"],
    description: "Préfixe 06",
  },
] as const;

export type OperatorId = (typeof MOBILE_MONEY_OPERATORS)[number]["id"];

// Détecte automatiquement l'opérateur selon le préfixe
export const detectOperator = (phone: string): OperatorId | null => {
  const cleaned = phone.replace(/[\s+\-]/g, "").replace(/^242/, "");
  const prefix = cleaned.substring(0, 2);
  if (["04", "05"].includes(prefix)) return "airtel";
  if (prefix === "06") return "mtn";
  return null;
};

// Valide un numéro Congo-Brazzaville
export const isValidCongoPhone = (phone: string): boolean => {
  const cleaned = phone.replace(/[\s+\-]/g, "").replace(/^242/, "");
  return /^0[456]\d{7}$/.test(cleaned);
};

// Catégories métier pour commerçants
export const MERCHANT_CATEGORIES = [
  { id: "alimentaire", label: "Alimentaire & Vivres", icon: "🍅" },
  { id: "textile", label: "Textile & Habillement", icon: "👕" },
  { id: "electronique", label: "Électronique & Téléphonie", icon: "📱" },
  { id: "cosmetique", label: "Cosmétique & Beauté", icon: "💄" },
  { id: "quincaillerie", label: "Quincaillerie & Bricolage", icon: "🔨" },
  { id: "restauration", label: "Restauration & Boissons", icon: "🍽️" },
  { id: "transport", label: "Transport & Taxi", icon: "🚗" },
  { id: "services", label: "Services divers", icon: "🛠️" },
  { id: "autre", label: "Autre", icon: "📦" },
] as const;

// Tranches de chiffre d'affaires mensuel (FCFA)
export const REVENUE_RANGES = [
  { id: "tier-1", label: "Moins de 50 000 F", min: 0, max: 50000 },
  { id: "tier-2", label: "50 000 – 200 000 F", min: 50000, max: 200000 },
  { id: "tier-3", label: "200 000 – 500 000 F", min: 200000, max: 500000 },
  { id: "tier-4", label: "500 000 – 1 000 000 F", min: 500000, max: 1000000 },
  { id: "tier-5", label: "Plus de 1 000 000 F", min: 1000000, max: 99999999 },
] as const;
