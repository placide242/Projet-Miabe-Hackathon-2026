import { PenLine, TrendingUp, QrCode } from "lucide-react";

const steps = [
  {
    icon: PenLine,
    number: "01",
    title: "Enregistrer",
    description: "Saisissez votre transaction : montant, partenaire, produit. L'app génère un reçu blockchain automatiquement.",
  },
  {
    icon: TrendingUp,
    number: "02",
    title: "Accumuler",
    description: "Chaque transaction améliore votre score de réputation. Plus vous êtes régulier, plus votre score monte.",
  },
  {
    icon: QrCode,
    number: "03",
    title: "Prouver",
    description: "Partagez votre profil via QR code. La microfinance consulte votre score et vous accorde le crédit.",
  },
];

const HowItWorksSection = () => {
  return (
    <section id="fonctionnement" className="py-24 bg-warm relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl" />

      <div className="container mx-auto px-4 relative">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="inline-block text-sm font-semibold text-primary uppercase tracking-wide bg-primary/10 px-4 py-1.5 rounded-full">Comment ça marche</span>
          <h2 className="font-display text-3xl md:text-5xl font-bold mt-6 text-foreground">
            3 étapes simples
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {steps.map((step, i) => (
            <div key={i} className="relative text-center group">
              <div className="relative inline-block">
                <div className="w-24 h-24 rounded-3xl bg-gradient-hero flex items-center justify-center shadow-elevated group-hover:scale-110 transition-transform duration-300">
                  <step.icon className="h-10 w-10 text-primary-foreground" />
                </div>
                <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-lokalpay-gold flex items-center justify-center shadow-gold">
                  <span className="text-xs font-bold text-secondary-foreground">{step.number}</span>
                </div>
              </div>
              <h3 className="font-display text-xl font-bold text-foreground mt-6">{step.title}</h3>
              <p className="text-muted-foreground mt-3 text-sm leading-relaxed max-w-xs mx-auto">{step.description}</p>
              {i < steps.length - 1 && (
                <div className="hidden md:block absolute top-12 -right-4 w-8">
                  <svg viewBox="0 0 32 8" fill="none" className="w-full">
                    <path d="M0 4H28M28 4L24 1M28 4L24 7" stroke="hsl(var(--border))" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
