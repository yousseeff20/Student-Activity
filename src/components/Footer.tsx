import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Mail, Phone, MapPin } from "lucide-react";

const Footer = () => {
  const { t } = useTranslation();

  return (
    <footer className="bg-card border-t border-border py-12">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-3 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center flex-shrink-0">
                <span className="text-primary-foreground font-bold text-sm">SA</span>
              </div>
              <div className="flex flex-col justify-center">
                <span className="font-bold text-foreground block leading-tight">SA-Manage</span>
                <span className="text-xs text-muted-foreground leading-tight">{t('footer.description')}</span>
              </div>
            </div>
          </div>
          <div>
            <h4 className="font-bold text-foreground mb-4">{t('footer.quickLinks')}</h4>
            <div className="flex flex-col gap-2">
              <Link to="/" className="text-sm text-muted-foreground hover:text-foreground hover:underline transition-all duration-200 ease-in-out">{t('nav.home')}</Link>
              <Link to="/events" className="text-sm text-muted-foreground hover:text-foreground hover:underline transition-all duration-200 ease-in-out">{t('nav.events')}</Link>
              <Link to="/register" className="text-sm text-muted-foreground hover:text-foreground hover:underline transition-all duration-200 ease-in-out">{t('hero.register')}</Link>
              <Link to="/login" className="text-sm text-muted-foreground hover:text-foreground hover:underline transition-all duration-200 ease-in-out">{t('hero.login')}</Link>
            </div>
          </div>
          <div>
            <h4 className="font-bold text-foreground mb-4">{t('footer.contactUs')}</h4>
            <div className="flex flex-col gap-3 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-primary" />
                <span>support@studentactivity.software</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-primary" />
                <span>01099079450</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-primary" />
                <span>{t('footer.location')}</span>
              </div>
            </div>
          </div>
        </div>
        <div className="border-t border-border pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            {t('footer.rights')}
          </p>
          <div className="flex gap-6 text-xs text-muted-foreground">
            <a href="#" className="hover:text-foreground transition-colors">{t('footer.privacy')}</a>
            <a href="#" className="hover:text-foreground transition-colors">{t('footer.terms')}</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
