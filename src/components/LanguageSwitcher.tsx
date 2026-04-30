import { useTranslation } from "react-i18next";
import i18n from "@/i18n";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Globe } from "lucide-react";

const languages = [
  { code: "fr", label: "Français", flag: "🇫🇷" },
  { code: "en", label: "English", flag: "🇬🇧" },
  { code: "ln", label: "Lingála", flag: "🇨🇬" },
  { code: "zh", label: "中文", flag: "🇨🇳" },
  { code: "es", label: "Español", flag: "🇪🇸" },
];

const LanguageSwitcher = ({ variant = "default" }: { variant?: "default" | "compact" }) => {
  const currentLang = i18n.language?.substring(0, 2) || "fr";

  const handleChange = (value: string) => {
    i18n.changeLanguage(value);
  };

  return (
    <Select value={currentLang} onValueChange={handleChange}>
      <SelectTrigger className={variant === "compact" ? "w-[70px] h-8 text-xs border-0 bg-transparent" : "w-[140px]"}>
        <div className="flex items-center gap-1.5">
          <Globe className="h-3.5 w-3.5 text-muted-foreground" />
          <SelectValue />
        </div>
      </SelectTrigger>
      <SelectContent>
        {languages.map((lang) => (
          <SelectItem key={lang.code} value={lang.code}>
            <span className="flex items-center gap-2">
              <span>{lang.flag}</span>
              <span>{lang.label}</span>
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default LanguageSwitcher;
