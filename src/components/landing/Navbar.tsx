import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import logo from "@/assets/lokalpay-logo.png";
import { Menu, X, Building2, Users, Calendar, History, Trophy, Sparkles, LayoutDashboard } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { useUserRoles } from "@/hooks/useUserRole";

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const { t } = useTranslation();
  const { isAdmin } = useUserRoles();

  const links = [
    { href: "#probleme", label: t("nav.problem") },
    { href: "#solution", label: t("nav.solution") },
    { href: "#pourquoi-nous", label: "Pourquoi nous" },
    { href: "#fonctionnement", label: t("nav.howItWorks") },
    { href: "#partenaires", label: "Partenaires" },
    { href: "#impact", label: t("nav.impact") },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50">
      <div className="container mx-auto flex items-center justify-between h-16 px-4">
        <Link to="/" className="flex items-center gap-2.5">
          <img src={logo} alt="LokalPay" className="h-9 w-9" />
          <span className="font-display font-bold text-xl text-foreground">LokalPay</span>
        </Link>

        <div className="hidden lg:flex items-center gap-6">
          {links.map((link, i) => (
            <a key={i} href={link.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors font-medium">
              {link.label}
            </a>
          ))}
        </div>

        <div className="hidden lg:flex items-center gap-3">
          <LanguageSwitcher variant="compact" />
          <Button variant="ghost" size="sm" asChild>
            <Link to="/annuaire" className="gap-1"><Users className="h-4 w-4" /> Annuaire</Link>
          </Button>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/transactions" className="gap-1"><History className="h-4 w-4" /> Transactions</Link>
          </Button>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/classement" className="gap-1"><Trophy className="h-4 w-4" /> Classement</Link>
          </Button>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/pricing">Tarifs</Link>
          </Button>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/microfinance" className="gap-1"><Building2 className="h-4 w-4" /> Microfinance</Link>
          </Button>
          {isAdmin && (
            <Button variant="ghost" size="sm" asChild>
              <Link to="/admin" className="gap-1"><LayoutDashboard className="h-4 w-4" /> Admin</Link>
            </Button>
          )}
          <Button variant="gold" size="sm" asChild>
            <Link to="/demo" className="gap-1"><Sparkles className="h-4 w-4" /> Démo</Link>
          </Button>
          <Button variant="ghost" asChild><Link to="/login">{t("nav.login")}</Link></Button>
          <Button variant="hero" asChild><Link to="/register">{t("nav.register")}</Link></Button>
        </div>

        <button className="lg:hidden p-2" onClick={() => setOpen(!open)}>
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {open && (
        <div className="lg:hidden bg-background border-b border-border p-4 space-y-3 animate-fade-up">
          {links.map((link, i) => (
            <a key={i} href={link.href} className="block text-sm text-muted-foreground py-2" onClick={() => setOpen(false)}>{link.label}</a>
          ))}
          <Link to="/annuaire" className="block text-sm text-muted-foreground py-2" onClick={() => setOpen(false)}>
            <Users className="h-4 w-4 inline mr-1" /> Annuaire
          </Link>
          <Link to="/pricing" className="block text-sm text-muted-foreground py-2" onClick={() => setOpen(false)}>
            Tarifs
          </Link>
          <Link to="/microfinance" className="block text-sm text-muted-foreground py-2" onClick={() => setOpen(false)}>
            <Building2 className="h-4 w-4 inline mr-1" /> Microfinance
          </Link>
          <div className="pt-2"><LanguageSwitcher /></div>
          <div className="flex gap-2 pt-2">
            <Button variant="ghost" asChild className="flex-1"><Link to="/login">{t("nav.login")}</Link></Button>
            <Button variant="hero" asChild className="flex-1"><Link to="/register">{t("nav.register")}</Link></Button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
