import { Smartphone, ShieldCheck, Layers, Zap, CheckCircle2 } from "lucide-react";

const WhyUsSection = () => {
  return (
    <section id="pourquoi-nous" className="py-24 relative overflow-hidden bg-gradient-to-b from-background via-primary/5 to-background">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-3xl" />

      <div className="container mx-auto px-4 relative">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-block text-sm font-semibold text-primary uppercase tracking-wide bg-primary/10 px-4 py-1.5 rounded-full">
            Notre différence
          </span>
          <h2 className="font-display text-3xl md:text-5xl font-bold mt-6 text-foreground">
            Pourquoi notre application et pas une autre ?
          </h2>
          <p className="text-muted-foreground mt-6 text-base md:text-lg leading-relaxed">
            Nous avons posé une question simple : <em>comment se déroulent réellement les transactions
            entre clients, commerçants et microfinances en Afrique ?</em> La réponse a façonné notre innovation —
            <strong className="text-foreground"> intégrer les services de paiement locaux dans une logique de double validation sécurisée</strong>.
          </p>
        </div>

        {/* Innovation centrale : la double validation */}
        <div className="max-w-5xl mx-auto mb-16">
          <div className="bg-card rounded-3xl shadow-elevated border border-border/50 overflow-hidden">
            <div className="bg-gradient-hero p-6 md:p-8 text-primary-foreground">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <Layers className="h-5 w-5" />
                </div>
                <span className="text-xs font-semibold uppercase tracking-wider opacity-90">Innovation LokalPay</span>
              </div>
              <h3 className="font-display text-2xl md:text-3xl font-bold">
                Double validation : Mobile Money + Blockchain
              </h3>
              <p className="opacity-90 mt-2 text-sm md:text-base">
                Chaque transaction est vérifiée deux fois — une garantie unique sur le marché africain.
              </p>
            </div>

            <div className="grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-border/50">
              {/* Côté Mobile Money */}
              <div className="p-6 md:p-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Smartphone className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-muted-foreground font-semibold">Validation 1</p>
                    <h4 className="font-display font-bold text-lg">Historique Mobile Money</h4>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                  Nous nous connectons à l'historique des transactions <strong className="text-foreground">MTN Mobile Money</strong>
                  {" "}et <strong className="text-foreground">Airtel Money</strong> — les deux opérateurs dominants
                  au Congo — pour confirmer que le paiement a bien eu lieu.
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="inline-flex items-center gap-1.5 bg-lokalpay-gold/20 text-lokalpay-gold px-3 py-1.5 rounded-lg text-xs font-semibold">
                    <span className="w-2 h-2 rounded-full bg-lokalpay-gold" /> MTN Mobile Money
                  </span>
                  <span className="inline-flex items-center gap-1.5 bg-destructive/10 text-destructive px-3 py-1.5 rounded-lg text-xs font-semibold">
                    <span className="w-2 h-2 rounded-full bg-destructive" /> Airtel Money
                  </span>
                </div>
              </div>

              {/* Côté Blockchain */}
              <div className="p-6 md:p-8 bg-muted/30">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <ShieldCheck className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-muted-foreground font-semibold">Validation 2</p>
                    <h4 className="font-display font-bold text-lg">Empreinte Blockchain</h4>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                  En parallèle, le hash de la transaction est inscrit sur la <strong className="text-foreground">blockchain Stellar</strong> —
                  immuable, traçable, et vérifiable par n'importe quelle microfinance ou partenaire.
                </p>
                <div className="bg-card border border-border/50 rounded-lg p-3 font-mono text-[11px] text-muted-foreground break-all">
                  tx_hash: 0x7f3a9c…b8e2d1
                  <br />
                  <span className="text-primary">✓ Confirmée sur Stellar</span>
                </div>
              </div>
            </div>

            <div className="bg-primary/5 px-6 md:px-8 py-4 border-t border-border/50">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <p className="text-sm text-foreground">
                  <strong>Résultat :</strong> aucune fraude possible. Si Mobile Money confirme ET la blockchain valide,
                  la transaction est inattaquable — pour le commerçant, le client et l'institution financière.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Différenciateurs secondaires */}
        <div className="grid md:grid-cols-3 gap-5 max-w-5xl mx-auto">
          {[
            {
              icon: Smartphone,
              title: "Pensé pour l'Afrique",
              desc: "Pas de carte bancaire requise. Mobile Money est déjà dans toutes les poches au Congo — nous bâtissons sur ce qui existe.",
            },
            {
              icon: Zap,
              title: "Mode hors-ligne",
              desc: "Enregistrez vos transactions même sans réseau. La synchronisation se fait dès que la connexion revient.",
            },
            {
              icon: ShieldCheck,
              title: "Inclusif & vérifiable",
              desc: "Un score de réputation transparent permet aux commerçants informels d'accéder au crédit qu'ils méritent vraiment.",
            },
          ].map((item, i) => (
            <div key={i} className="bg-card rounded-2xl p-6 shadow-card border border-border/50 hover:shadow-elevated transition-all hover:-translate-y-1">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                <item.icon className="h-6 w-6 text-primary" />
              </div>
              <h4 className="font-display font-bold text-foreground mb-2">{item.title}</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyUsSection;
