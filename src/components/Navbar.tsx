import { useState } from "react";
import { Menu, X, Moon, Sun, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useTheme } from "next-themes";
import { useTranslation } from "react-i18next";
import { Languages } from "lucide-react";

const navLinks = [
  { label: "الرئيسية", href: "/" },
  { label: "الفعاليات", href: "/events" },
  { label: "الاتحادات", href: "/#clubs" },
];

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const { t, i18n } = useTranslation();

  const toggleLanguage = () => {
    const newLang = i18n.language === "ar" ? "en" : "ar";
    i18n.changeLanguage(newLang);
  };

  return (
    <nav className="sticky top-0 z-50 glass">
      <div className="container mx-auto flex items-center justify-between py-4 px-4">
        <Link to="/" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center shadow-lg shadow-primary/25">
            <GraduationCap className="w-6 h-6 text-primary-foreground" />
          </div>
          <div className="flex flex-col leading-tight">
            <span className="font-bold text-lg text-foreground">أنشطة طلابية</span>
            <span className="text-xs text-muted-foreground">إدارة الفعاليات والأنشطة</span>
          </div>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          <Link to="/" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            {t('nav.home')}
          </Link>
          <Link to="/events" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            {t('nav.events')}
          </Link>
          <Link to="/#clubs" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            {t('nav.clubs')}
          </Link>
        </div>

        <div className="hidden md:flex items-center gap-3">
          <button
            onClick={toggleLanguage}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
            aria-label="Toggle Language"
          >
            <Languages className="w-[18px] h-[18px]" />
          </button>
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
            aria-label="تبديل الوضع"
          >
            {theme === "dark" ? <Sun className="w-[18px] h-[18px]" /> : <Moon className="w-[18px] h-[18px]" />}
          </button>
        </div>

        <div className="flex items-center gap-2 md:hidden">
          <button
            onClick={toggleLanguage}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
            aria-label="Toggle Language"
          >
            <Languages className="w-[18px] h-[18px]" />
          </button>
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
            aria-label="تبديل الوضع"
          >
            {theme === "dark" ? <Sun className="w-[18px] h-[18px]" /> : <Moon className="w-[18px] h-[18px]" />}
          </button>
          <button className="text-foreground" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-border px-4 pb-4 bg-card">
          <div className="flex flex-col gap-3 pt-4">
            <Link to="/" className="text-sm font-medium text-muted-foreground hover:text-foreground py-2" onClick={() => setMobileOpen(false)}>
              {t('nav.home')}
            </Link>
            <Link to="/events" className="text-sm font-medium text-muted-foreground hover:text-foreground py-2" onClick={() => setMobileOpen(false)}>
              {t('nav.events')}
            </Link>
            <Link to="/#clubs" className="text-sm font-medium text-muted-foreground hover:text-foreground py-2" onClick={() => setMobileOpen(false)}>
              {t('nav.clubs')}
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
