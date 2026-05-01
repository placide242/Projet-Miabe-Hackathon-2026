import { Building2, Landmark, Handshake, Globe } from "lucide-react";

const partners = [
  { name: "Airtel Money", type: "Opérateur Mobile", icon: "📱" },
  { name: "MTN MoMo", type: "Opérateur Mobile", icon: "📲" },
];

const partnerTypes = [
  { icon: Landmark, title: "Microfinances", desc: "Consultez les profils de commerçants et accordez des crédits basés sur des données fiables." },
  { icon: Building2, title: "Fournisseurs", desc: "Vérifiez la solvabilité de vos clients avant d'accorder des facilités de paiement." },
  { icon: Handshake, title: "Partenaires Commerciaux", desc: "Identifiez des commerçants fiables pour des collaborations durables." },
  { icon: Globe, title: "ONG & Institutions", desc: "Accédez à des données agrégées sur l'économie informelle congolaise." },
];

const PartnersSection = () => {
  return (
    <section id="partenaires" className="py-24 bg-warm">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-sm font-semibold text-primary uppercase tracking-wide">Écosystème</span>
          <h2 className="font-display text-3xl md:text-4xl font-bold mt-3 text-foreground">
            Un réseau de partenaires puissant
          </h2>
          <p className="mt-4 text-muted-foreground text-lg">
            LokalPay connecte les commerçants aux institutions financières et aux opérateurs mobiles.
          </p>
        </div>

        {/* Mobile operators */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16 max-w-3xl mx-auto">
          {partners.map((p, i) => (
            <div key={i} className="bg-card rounded-2xl p-6 shadow-card hover:shadow-elevated transition-all duration-300 text-center group hover:-translate-y-1">
              <span className="text-4xl block mb-3">{p.icon}</span>
              <h4 className="font-display font-bold text-foreground text-sm">{p.name}</h4>
              <p className="text-xs text-muted-foreground mt-1">{p.type}</p>
            </div>
          ))}
        </div>

        {/* Partner types */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {partnerTypes.map((item, i) => (
            <div key={i} className="relative bg-card rounded-2xl p-8 shadow-card hover:shadow-elevated transition-all duration-300 group overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-hero opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary group-hover:scale-110 transition-all">
                <item.icon className="h-7 w-7 text-primary group-hover:text-primary-foreground transition-colors" />
              </div>
              <h3 className="font-display font-bold text-lg text-foreground">{item.title}</h3>
              <p className="text-muted-foreground mt-2 text-sm leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PartnersSection;
