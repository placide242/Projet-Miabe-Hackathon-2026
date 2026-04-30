import { Smartphone, Shield, CreditCard, BarChart3, ArrowRight } from "lucide-react";
import solutionImage from "@/assets/satisfied-merchant-man.jpg";

const components = [
  {
    icon: Smartphone,
    title: "App Commerçant",
    description: "Enregistrez vos transactions en quelques clics. Montant, partenaire, produit — même sans connexion internet.",
    gradient: "from-primary/20 to-primary/5",
  },
  {
    icon: Shield,
    title: "Blockchain Sécurisée",
    description: "Chaque transaction génère un reçu numérique dont le hash est stocké sur la blockchain. Immuable et vérifiable.",
    gradient: "from-lokalpay-gold/20 to-lokalpay-gold/5",
  },
  {
    icon: BarChart3,
    title: "Score de Réputation",
    description: "Un score de 0 à 100, calculé automatiquement à partir de vos transactions, régularité et évaluations.",
    gradient: "from-primary/20 to-primary/5",
  },
  {
    icon: CreditCard,
    title: "Accès au Crédit",
    description: "Les microfinances consultent votre profil et vous accordent le crédit que vous méritez.",
    gradient: "from-lokalpay-gold/20 to-lokalpay-gold/5",
  },
];

const SolutionSection = () => {
  return (
    <section id="solution" className="py-24 relative overflow-hidden">
      <div className="absolute top-20 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-20 left-0 w-96 h-96 bg-lokalpay-gold/5 rounded-full blur-3xl" />

      <div className="container mx-auto px-4 relative">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="inline-block text-sm font-semibold text-primary uppercase tracking-wide bg-primary/10 px-4 py-1.5 rounded-full">Notre solution</span>
          <h2 className="font-display text-3xl md:text-5xl font-bold mt-6 text-foreground">
            Du cash invisible au crédit accessible
          </h2>
          <div className="flex flex-wrap items-center justify-center gap-3 mt-6 text-muted-foreground">
            {["Transaction cash", "Blockchain", "Score", "Crédit"].map((step, i) => (
              <span key={i} className="flex items-center gap-2">
                <span className="bg-primary/10 px-3 py-1 rounded-full text-sm font-medium text-primary">{step}</span>
                {i < 3 && <ArrowRight className="h-4 w-4 text-muted-foreground" />}
              </span>
            ))}
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 order-2 lg:order-1">
            {components.map((item, i) => (
              <div key={i} className={`relative flex flex-col gap-3 p-6 rounded-2xl bg-gradient-to-br ${item.gradient} border border-border/50 shadow-card hover:shadow-elevated transition-all duration-300 group hover:-translate-y-1`}>
                <div className="w-12 h-12 rounded-xl bg-card shadow-card flex items-center justify-center group-hover:scale-110 transition-transform">
                  <item.icon className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-base text-foreground">{item.title}</h3>
                  <p className="text-muted-foreground mt-2 text-xs leading-relaxed">{item.description}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="relative order-1 lg:order-2">
            <div className="absolute -inset-4 bg-gradient-gold opacity-20 blur-3xl rounded-full" />
            <img
              src={solutionImage}
              alt="Commerçant satisfait après une transaction LokalPay réussie"
              loading="lazy"
              width={1280}
              height={896}
              className="relative rounded-3xl shadow-elevated w-full h-auto object-cover"
            />
            <div className="absolute -top-4 -left-4 bg-card rounded-2xl shadow-elevated p-3 hidden md:flex items-center gap-2 border border-border/50">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Shield className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-xs font-bold text-foreground">Score 87/100</p>
                <p className="text-[10px] text-muted-foreground">Excellent</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SolutionSection;
