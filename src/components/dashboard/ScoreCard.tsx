import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Star } from "lucide-react";
import { useTranslation } from "react-i18next";

interface ScoreCardProps {
  score: number;
  scoreLevel: string;
  totalTransactions: number;
}

const getScoreBadge = (level: string) => {
  switch (level) {
    case "Or": return "bg-lokalpay-gold text-secondary-foreground";
    case "Argent": return "bg-muted text-foreground";
    case "Bronze": return "bg-lokalpay-gold/40 text-foreground";
    default: return "bg-muted text-muted-foreground";
  }
};

const ScoreCard = ({ score, scoreLevel, totalTransactions }: ScoreCardProps) => {
  const { t } = useTranslation();

  return (
    <Card className="flex-1 shadow-card border-0 overflow-hidden relative">
      <div className="absolute inset-0 bg-gradient-hero opacity-5" />
      <CardContent className="p-6 relative flex items-center gap-6">
        <div className="relative">
          <svg className="w-24 h-24" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="42" fill="none" stroke="hsl(var(--border))" strokeWidth="8" />
            <circle cx="50" cy="50" r="42" fill="none" stroke="hsl(var(--primary))" strokeWidth="8"
              strokeDasharray={`${score * 2.64} ${264 - score * 2.64}`}
              strokeDashoffset="66" strokeLinecap="round" />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="font-display text-2xl font-bold text-foreground">{score}</span>
          </div>
        </div>
        <div>
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            <span className="font-display font-semibold text-foreground">{t("score.reputationScore")}</span>
          </div>
          <Badge className={`mt-2 ${getScoreBadge(scoreLevel)}`}>
            <Star className="h-3 w-3 mr-1" /> {t("profile.level")} {scoreLevel}
          </Badge>
          <p className="text-xs text-muted-foreground mt-2">
            {t("score.basedOn", { count: totalTransactions })}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default ScoreCard;
