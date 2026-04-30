import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Star, Search, Users, Phone, Eye, MapPin } from "lucide-react";
import { Link } from "react-router-dom";
import logo from "@/assets/lokalpay-logo.png";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "@/components/LanguageSwitcher";

interface MemberProfile {
  id: string;
  user_id: string;
  display_name: string;
  market: string;
  lokalpay_id: string;
  score: number;
  score_level: string;
  total_transactions: number;
  total_volume: number;
  avatar_initials: string;
  phone: string;
}

const getScoreBadgeClass = (level: string) => {
  switch (level) {
    case "Or": return "bg-lokalpay-gold text-secondary-foreground";
    case "Argent": return "bg-muted text-foreground";
    case "Bronze": return "bg-lokalpay-gold/40 text-foreground";
    default: return "bg-muted text-muted-foreground";
  }
};

const CommunityPage = () => {
  const [members, setMembers] = useState<MemberProfile[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { t } = useTranslation();

  useEffect(() => {
    const fetchMembers = async () => {
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .order("score", { ascending: false });
      if (data) setMembers(data as MemberProfile[]);
      setLoading(false);
    };
    fetchMembers();
  }, []);

  const filtered = members.filter((m) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      m.display_name.toLowerCase().includes(q) ||
      m.lokalpay_id.toLowerCase().includes(q) ||
      m.market.toLowerCase().includes(q)
    );
  });

  const maskedPhone = (phone: string) => {
    if (!phone || phone.length < 4) return "***";
    return phone.slice(0, 3) + "***" + phone.slice(-2);
  };

  return (
    <div className="min-h-screen bg-warm">
      <header className="bg-card border-b border-border sticky top-0 z-40 shadow-card">
        <div className="container mx-auto flex items-center justify-between h-14 px-4">
          <Link to="/" className="flex items-center gap-2">
            <img src={logo} alt="LokalPay" className="h-8 w-8" />
            <span className="font-display font-bold text-lg text-foreground">LokalPay</span>
          </Link>
          <div className="flex items-center gap-3">
            <LanguageSwitcher variant="compact" />
            <Button variant="ghost" size="sm" asChild>
              <Link to="/dashboard">{t("nav.dashboard")}</Link>
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 max-w-2xl space-y-6">
        <div className="text-center">
          <h1 className="font-display text-2xl font-bold text-foreground flex items-center justify-center gap-2">
            <Users className="h-6 w-6 text-primary" />
            {t("community.title")}
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">{t("community.subtitle")}</p>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t("community.searchPlaceholder")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 h-12"
          />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <Card className="shadow-card border-0">
            <CardContent className="p-3 text-center">
              <p className="font-display text-xl font-bold text-foreground">{members.length}</p>
              <p className="text-xs text-muted-foreground">{t("community.totalMembers")}</p>
            </CardContent>
          </Card>
          <Card className="shadow-card border-0">
            <CardContent className="p-3 text-center">
              <p className="font-display text-xl font-bold text-primary">
                {members.filter(m => m.score >= 40).length}
              </p>
              <p className="text-xs text-muted-foreground">{t("community.eligible")}</p>
            </CardContent>
          </Card>
          <Card className="shadow-card border-0">
            <CardContent className="p-3 text-center">
              <p className="font-display text-xl font-bold text-lokalpay-gold">
                {members.length > 0 ? Math.round(members.reduce((s, m) => s + m.score, 0) / members.length) : 0}
              </p>
              <p className="text-xs text-muted-foreground">{t("community.avgScore")}</p>
            </CardContent>
          </Card>
        </div>

        {/* Members list */}
        <div className="space-y-3">
          {loading ? (
            <div className="text-center py-12 text-muted-foreground">{t("common.loading")}</div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">{t("community.noResults")}</div>
          ) : (
            filtered.map((member) => (
              <Card key={member.id} className="shadow-card border-0 hover:shadow-elevated transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    {/* Avatar */}
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <span className="font-display font-bold text-primary text-lg">
                        {member.avatar_initials || member.display_name.substring(0, 1).toUpperCase()}
                      </span>
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-display font-semibold text-foreground truncate">{member.display_name}</h3>
                        <Badge className={`text-[10px] px-1.5 py-0 ${getScoreBadgeClass(member.score_level)}`}>
                          <Star className="h-2.5 w-2.5 mr-0.5" /> {member.score}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {t(`markets.${member.market}`, { defaultValue: member.market || "—" })}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {member.total_transactions} {t("community.txLabel")}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        ID: {member.lokalpay_id}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-1.5">
                      <Button variant="outline" size="sm" className="text-xs h-7 px-2" asChild>
                        <Link to={`/profil/${member.lokalpay_id}`}>
                          <Eye className="h-3 w-3 mr-1" /> {t("community.viewProfile")}
                        </Link>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs h-7 px-2"
                        onClick={() => {
                          const phone = member.phone;
                          if (phone) {
                            const cleaned = phone.replace(/\s/g, "");
                            const fullNumber = cleaned.startsWith("+") ? cleaned : `+242${cleaned}`;
                            window.open(`https://wa.me/${fullNumber.replace("+", "")}`, "_blank");
                          }
                        }}
                      >
                        <Phone className="h-3 w-3 mr-1" /> {t("community.contact")}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default CommunityPage;
