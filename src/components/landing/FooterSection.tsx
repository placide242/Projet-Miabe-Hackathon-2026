import { Link } from "react-router-dom";
import logo from "@/assets/lokalpay-logo.png";
import { Phone, MapPin, Mail } from "lucide-react";

const FooterSection = () => {
  return (
    <footer className="bg-foreground py-16">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-3 mb-5">
              <img src={logo} alt="LokalPay" className="h-10 w-10" loading="lazy" />
              <span className="font-display font-bold text-2xl text-background">LokalPay Congo</span>
            </div>
            <p className="text-background/60 text-sm max-w-sm leading-relaxed">
              Inclusion financière et réputation des commerçants informels via blockchain.
              Brazzaville & Pointe-Noire, République du Congo.
            </p>
            <div className="flex gap-4 mt-6">
              {["📱 Airtel Money", "📲 MTN MoMo", "📳 Orange Money"].map((op, i) => (
                <span key={i} className="text-xs text-background/40 bg-background/10 px-3 py-1.5 rounded-full">{op}</span>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-display font-bold text-background mb-5 text-lg">Plateforme</h4>
            <ul className="space-y-3 text-sm text-background/60">
              <li><Link to="/register" className="hover:text-background transition-colors">Créer un compte</Link></li>
              <li><Link to="/login" className="hover:text-background transition-colors">Se connecter</Link></li>
              <li><Link to="/microfinance" className="hover:text-background transition-colors">Espace Microfinance</Link></li>
              <li><Link to="/community" className="hover:text-background transition-colors">Communauté</Link></li>
              <li><Link to="/meetings" className="hover:text-background transition-colors">Rencontres Pro</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-display font-bold text-background mb-5 text-lg">Contact</h4>
            <ul className="space-y-3 text-sm text-background/60">
              <li className="flex items-center gap-2"><MapPin className="h-4 w-4" /> Brazzaville, Congo</li>
              <li className="flex items-center gap-2"><Phone className="h-4 w-4" /> MIABE Hackathon 2026</li>
              <li className="flex items-center gap-2"><Mail className="h-4 w-4" /> Équipe NOVA TECH</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-background/10 mt-12 pt-8 text-center text-xs text-background/40">
          © 2026 LokalPay Congo – NOVA TECH. Tous droits réservés.
        </div>
      </div>
    </footer>
  );
};

export default FooterSection;
