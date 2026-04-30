import { AlertTriangle, Ban, Wallet, Smartphone } from "lucide-react";
import problemImage from "@/assets/satisfied-merchant-woman.jpg";

const stats = [
  { icon: AlertTriangle, value: "60%", label: "de l'emploi urbain est informel", color: "text-destructive" },
  { icon: Ban, value: "90%", label: "des demandes de microcrédit refusées", color: "text-destructive" },
  { icon: Wallet, value: "<15%", label: "des commerçants avec compte bancaire", color: "text-lokalpay-gold" },
  { icon: Smartphone, value: "45%", label: "utilisent déjà le mobile money", color: "text-primary" },
];

const ProblemSection = () => {
  return (
    <section id="probleme" className="py-24 bg-warm">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center mb-16">
          <div className="relative">
            <div className="absolute -inset-4 bg-gradient-hero opacity-20 blur-3xl rounded-full" />
            <img
              src={problemImage}
              alt="Commerçante satisfaite au marché de Brazzaville utilisant LokalPay"
              loading="lazy"
              width={1280}
              height={896}
              className="relative rounded-3xl shadow-elevated w-full h-auto object-cover"
            />
            <div className="absolute -bottom-6 -right-6 bg-card rounded-2xl shadow-elevated p-4 max-w-[220px] hidden md:block border border-border/50">
              <p className="text-xs font-semibold text-foreground">« Maintenant, ma microfinance me fait confiance. »</p>
              <p className="text-xs text-muted-foreground mt-1">— Mariam, marché Total</p>
            </div>
          </div>

          <div>
            <span className="inline-block text-sm font-semibold text-primary uppercase tracking-wide bg-primary/10 px-4 py-1.5 rounded-full">Le constat</span>
            <h2 className="font-display text-3xl md:text-5xl font-bold mt-6 text-foreground">
              L'exclusion financière au Congo
            </h2>
            <p className="mt-4 text-muted-foreground text-lg leading-relaxed">
              Un commerçant sérieux depuis 10 ans ne peut pas prouver sa fiabilité à un fournisseur ou une microfinance.
              LokalPay change la donne.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, i) => (
            <div key={i} className="bg-card rounded-2xl p-8 shadow-card hover:shadow-elevated transition-all duration-300 text-center group hover:-translate-y-2">
              <div className={`inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-muted mb-5 ${stat.color} group-hover:scale-110 transition-transform`}>
                <stat.icon className="h-7 w-7" />
              </div>
              <div className="font-display text-4xl font-extrabold text-foreground">{stat.value}</div>
              <p className="text-muted-foreground mt-3 text-sm leading-relaxed">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProblemSection;
