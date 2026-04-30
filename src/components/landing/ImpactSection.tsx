import { Target, Briefcase, Scale } from "lucide-react";
import impactImage from "@/assets/entrepreneurs-celebrating.jpg";
import handshakeImage from "@/assets/customer-vendor-handshake.jpg";

const impacts = [
  { icon: Target, odd: "ODD 1", title: "Fin de la pauvreté", metric: "+40%", description: "de commerçants sortant du cash uniquement" },
  { icon: Briefcase, odd: "ODD 8", title: "Travail décent", metric: "5 000", description: "microcrédits octroyés via le score" },
  { icon: Scale, odd: "ODD 10", title: "Inégalités réduites", metric: "-30%", description: "d'écart d'accès au crédit formel/informel" },
];

const ImpactSection = () => {
  return (
    <section id="impact" className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-background to-primary/5" />

      <div className="container mx-auto px-4 relative">
        <div className="grid lg:grid-cols-2 gap-12 items-center mb-20">
          <div>
            <span className="inline-block text-sm font-semibold text-primary uppercase tracking-wide bg-primary/10 px-4 py-1.5 rounded-full">Impact</span>
            <h2 className="font-display text-3xl md:text-5xl font-bold mt-6 text-foreground">
              Des commerçants qui réussissent
            </h2>
            <p className="mt-6 text-muted-foreground text-lg leading-relaxed">
              Derrière chaque transaction, il y a une histoire de confiance et de croissance.
              LokalPay rend visible le travail des entrepreneurs congolais.
            </p>
            <p className="mt-6 text-muted-foreground text-xl italic font-display border-l-4 border-primary pl-4">
              « La blockchain ne remplace pas la confiance, elle la rend visible. »
            </p>
          </div>
          <div className="relative">
            <div className="absolute -inset-4 bg-gradient-hero opacity-20 blur-3xl rounded-full" />
            <img
              src={impactImage}
              alt="Entrepreneurs africains célébrant leur succès financier avec LokalPay"
              loading="lazy"
              width={1280}
              height={896}
              className="relative rounded-3xl shadow-elevated w-full h-auto object-cover"
            />
          </div>
        </div>

        <div className="text-center max-w-2xl mx-auto mb-12">
          <h3 className="font-display text-2xl md:text-3xl font-bold text-foreground">Objectifs à 3 ans</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto mb-16">
          {impacts.map((item, i) => (
            <div key={i} className="text-center p-10 rounded-3xl bg-card shadow-card hover:shadow-elevated transition-all duration-300 group hover:-translate-y-2 border border-border/50">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 mb-5 group-hover:bg-primary transition-colors">
                <item.icon className="h-7 w-7 text-primary group-hover:text-primary-foreground transition-colors" />
              </div>
              <span className="inline-block text-xs font-bold text-lokalpay-gold uppercase bg-lokalpay-gold/10 px-3 py-1 rounded-full">{item.odd}</span>
              <h3 className="font-display text-lg font-bold text-foreground mt-3">{item.title}</h3>
              <div className="font-display text-5xl font-extrabold text-primary mt-4">{item.metric}</div>
              <p className="text-muted-foreground text-sm mt-3">{item.description}</p>
            </div>
          ))}
        </div>

        <div className="relative max-w-5xl mx-auto rounded-3xl overflow-hidden shadow-elevated">
          <img
            src={handshakeImage}
            alt="Cliente et commerçant scellant une transaction de confiance"
            loading="lazy"
            width={1280}
            height={896}
            className="w-full h-[300px] md:h-[400px] object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-foreground/80 to-transparent flex items-center">
            <div className="p-8 md:p-12 max-w-md">
              <p className="text-primary-foreground/90 text-sm font-semibold uppercase tracking-wide">Témoignage</p>
              <p className="text-primary-foreground font-display text-xl md:text-2xl font-bold mt-3 leading-snug">
                « Grâce à LokalPay, mes clients me font confiance et ma microfinance m'a accordé un prêt. »
              </p>
              <p className="text-primary-foreground/80 text-sm mt-3">— Joseph, Marché de Moungali</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ImpactSection;
