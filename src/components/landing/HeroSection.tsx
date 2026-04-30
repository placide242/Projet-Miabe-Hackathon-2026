import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight, Shield, TrendingUp, Smartphone, Users, Star, CheckCircle2, Sparkles } from "lucide-react";
import heroImage from "@/assets/hero-marketplace.jpg";
import merchantWoman from "@/assets/satisfied-merchant-woman.jpg";
import { useTranslation } from "react-i18next";

const HeroSection = () => {
  const { t } = useTranslation();

  return (
    <section className="relative min-h-screen flex items-center pt-16 overflow-hidden">
      <div className="absolute inset-0">
        <img src={heroImage} alt="Marché de Brazzaville" className="w-full h-full object-cover" width={1920} height={1080} />
        <div className="absolute inset-0 bg-gradient-to-br from-foreground/95 via-foreground/80 to-primary/40" />
        {/* Decorative blobs */}
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-primary/30 blur-3xl" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] rounded-full bg-lokalpay-gold/20 blur-3xl" />
      </div>

      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="absolute w-2 h-2 rounded-full bg-lokalpay-gold/40 animate-float"
            style={{ left: `${10 + i * 12}%`, top: `${15 + (i % 3) * 25}%`, animationDelay: `${i * 0.6}s` }} />
        ))}
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 space-y-7 animate-fade-up">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary-foreground/10 backdrop-blur-md px-5 py-2 text-sm text-primary-foreground border border-primary-foreground/20">
              <Sparkles className="h-4 w-4 text-lokalpay-gold" />
              <span>Blockchain • Inclusion Financière • Congo 🇨🇬</span>
            </div>

            <h1 className="font-display text-4xl md:text-6xl lg:text-7xl font-extrabold leading-[1.05] text-primary-foreground text-balance">
              La réputation qui{" "}
              <span className="relative inline-block">
                <span className="bg-clip-text text-transparent" style={{ backgroundImage: 'linear-gradient(135deg, hsl(155 70% 65%), hsl(42 95% 65%))' }}>
                  ouvre le crédit
                </span>
                <svg className="absolute -bottom-3 left-0 w-full" viewBox="0 0 200 8" fill="none">
                  <path d="M2 6C50 2 150 2 198 6" stroke="hsl(42 90% 55%)" strokeWidth="3" strokeLinecap="round" />
                </svg>
              </span>
            </h1>

            <p className="text-lg md:text-xl text-primary-foreground/85 max-w-xl leading-relaxed">
              Des milliers de commerçants à Brazzaville échangent chaque jour sans laisser de trace.
              <strong className="text-primary-foreground"> LokalPay</strong> transforme ces transactions invisibles
              en un historique blockchain fiable — et en accès au crédit.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              <Button variant="hero" size="lg" className="text-base h-14 px-8 shadow-elevated group" asChild>
                <Link to="/register" className="gap-2">
                  Créer mon compte gratuit
                  <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
              <Button size="lg" className="text-base h-14 px-8 bg-primary-foreground/10 border border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/20 backdrop-blur-md" asChild>
                <Link to="/microfinance">Espace Microfinance</Link>
              </Button>
            </div>

            {/* Trust strip */}
            <div className="flex flex-wrap items-center gap-x-6 gap-y-3 pt-4">
              <div className="flex items-center gap-2">
                <div className="flex -space-x-2">
                  {[1,2,3,4].map((i) => (
                    <div key={i} className="w-8 h-8 rounded-full border-2 border-background bg-gradient-to-br from-primary to-lokalpay-gold" />
                  ))}
                </div>
                <span className="text-sm text-primary-foreground/80"><strong className="text-primary-foreground">10 000+</strong> commerçants</span>
              </div>
              <div className="flex items-center gap-1.5">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-lokalpay-gold text-lokalpay-gold" />
                ))}
                <span className="text-sm text-primary-foreground/80 ml-1">4.9/5</span>
              </div>
            </div>
          </div>

          {/* Right: floating preview card */}
          <div className="hidden lg:block lg:col-span-5 animate-fade-up" style={{ animationDelay: '0.2s' }}>
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-br from-primary/30 to-lokalpay-gold/30 blur-2xl rounded-3xl" />
              <div className="relative glass-card rounded-3xl p-5 space-y-4 hover-lift">
                <div className="relative rounded-2xl overflow-hidden aspect-[4/3]">
                  <img src={merchantWoman} alt="Commerçante satisfaite" className="w-full h-full object-cover" />
                  <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-card/90 backdrop-blur px-3 py-1.5 rounded-full text-xs font-semibold">
                    <CheckCircle2 className="h-3.5 w-3.5 text-primary" /> Vérifié
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-display font-bold text-card-foreground">Marie K.</p>
                      <p className="text-xs text-muted-foreground">Marché Total • Brazzaville</p>
                    </div>
                    <div className="text-right">
                      <p className="font-display font-extrabold text-2xl text-primary leading-none">87</p>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Score</p>
                    </div>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full w-[87%] bg-gradient-to-r from-primary to-lokalpay-gold rounded-full" />
                  </div>
                  <div className="grid grid-cols-3 gap-2 pt-1">
                    {[
                      { icon: TrendingUp, label: "342 tx" },
                      { icon: Shield, label: "0 litige" },
                      { icon: Smartphone, label: "MoMo OK" },
                    ].map((s, i) => (
                      <div key={i} className="flex flex-col items-center gap-1 p-2 rounded-lg bg-muted/50">
                        <s.icon className="h-4 w-4 text-primary" />
                        <span className="text-[10px] font-medium text-muted-foreground">{s.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-primary-foreground/30 rounded-full flex justify-center pt-2">
          <div className="w-1.5 h-3 bg-primary-foreground/50 rounded-full" />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
