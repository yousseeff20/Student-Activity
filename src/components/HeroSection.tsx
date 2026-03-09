import { Search, Users, Calendar, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import CountUp from "react-countup";
import { useState, useEffect } from "react";

const useTypewriter = (text: string, speed: number = 50, delay: number = 0) => {
  const [displayText, setDisplayText] = useState('');

  useEffect(() => {
    setDisplayText('');
    let i = 0;

    // Safety check for empty strings
    if (!text) return;

    const timeout = setTimeout(() => {
      const typingInterval = setInterval(() => {
        setDisplayText((prev) => {
          if (prev.length < text.length) {
            return text.substring(0, prev.length + 1);
          } else {
            clearInterval(typingInterval);
            return prev;
          }
        });
      }, speed);

      return () => clearInterval(typingInterval);
    }, delay);

    return () => clearTimeout(timeout);
  }, [text, speed, delay]);

  return displayText;
};

const heroImage = "/hero-image.png";

const stats = [
  { icon: Users, value: 5000, prefix: "+", label: "طالب" },
  { icon: Calendar, value: 200, prefix: "+", label: "فعالية" },
  { icon: Building2, value: 15, prefix: "+", label: "اتحاد" },
];

const HeroSection = () => {
  const { t, i18n } = useTranslation();

  // Get raw translated strings
  const rawTitle1 = t('hero.title1');
  const rawTitle2 = t('hero.title2');
  const rawSubtitle = t('hero.subtitle');

  // Calculate relative delays so they type sequentially
  // Assuming average 50ms per char as per new default
  const title1Duration = rawTitle1.length * 50;
  const title2Duration = rawTitle2.length * 50;

  // Typewriter hooks
  const typedTitle1 = useTypewriter(rawTitle1, 60, 200); // starts after 200ms
  const typedTitle2 = useTypewriter(rawTitle2, 60, 200 + (rawTitle1.length * 60) + 100);
  const typedSubtitle = useTypewriter(rawSubtitle, 40, 200 + (rawTitle1.length * 60) + (rawTitle2.length * 60) + 200);

  return (
    <section className="relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-secondary/50 to-background" />

      <div className="container mx-auto relative px-4 pt-16 pb-12">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Text Content */}
          <div className="text-right order-2 lg:order-1 lg:text-right">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6 animate-fade-up opacity-0">
              <span className="w-2 h-2 rounded-full gradient-primary" />
              {t('hero.badge')}
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight mb-6 min-h-[140px] md:min-h-[160px] lg:min-h-[180px]">
              <span className="inline-block min-h-[1em]">{typedTitle1}</span>
              <br />
              <span className="gradient-primary-text inline-block min-h-[1em]">{typedTitle2}</span>
              {/* Blinking cursor */}
              {(typedTitle1.length < rawTitle1.length || typedTitle2.length < rawTitle2.length) && (
                <span className="inline-block w-[3px] h-[1em] bg-primary ml-1 align-middle animate-pulse" />
              )}
            </h1>

            <p className="text-lg text-muted-foreground max-w-lg mb-8 mr-auto lg:mr-0 min-h-[80px]">
              {typedSubtitle}
              {typedSubtitle.length > 0 && typedSubtitle.length < rawSubtitle.length && (
                <span className="inline-block w-[2px] h-[1em] bg-muted-foreground ml-1 align-middle animate-pulse" />
              )}
            </p>

            <div className="flex flex-wrap gap-4 justify-end animate-fade-up opacity-0" style={{ animationDelay: "0.3s" }}>
              <Link to="/events">
                <Button size="lg" className="gradient-primary text-primary-foreground border-0 rounded-xl px-8 text-base shadow-lg shadow-primary/25">
                  {t('hero.browse')}
                </Button>
              </Link>
              <Link to="/login">
                <Button size="lg" variant="outline" className="rounded-xl px-8 text-base">
                  {t('hero.login')}
                </Button>
              </Link>
              <Link to="/register">
                <Button size="lg" variant="outline" className="rounded-xl px-8 text-base">
                  {t('hero.register')}
                </Button>
              </Link>
            </div>
            <p className="text-sm text-muted-foreground mt-3 animate-fade-up opacity-0" style={{ animationDelay: "0.35s" }}>
              {t('hero.haveAccount')} <Link to="/login" className="text-primary font-medium hover:underline">{t('hero.login')}</Link>
              {" · "}
              {t('hero.new')} <Link to="/register" className="text-primary font-medium hover:underline">{t('hero.register')}</Link>
            </p>
          </div>

          {/* Hero Image */}
          <div className="order-1 lg:order-2 animate-fade-up opacity-0" style={{ animationDelay: "0.2s" }}>
            <div className="relative rounded-2xl overflow-hidden card-shadow group">
              <img
                src={heroImage}
                alt="فعالية طلابية جامعية"
                className="w-full h-[300px] md:h-[400px] object-cover group-hover:scale-105 transition-transform duration-500"
              />
              {/* Floating card */}
              <div className="absolute bottom-4 right-4 glass rounded-xl px-4 py-3 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
                  <Calendar className="w-4 h-4 text-primary-foreground" />
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">{t('hero.upcoming')}</p>
                  <p className="text-sm font-semibold text-foreground">10:00 AM</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mt-12 max-w-2xl mx-auto animate-fade-up opacity-0" style={{ animationDelay: "0.4s" }}>
          <div className="flex items-center bg-card rounded-2xl card-shadow border border-border overflow-hidden">
            <div className="flex-1 flex items-center gap-3 px-5 py-4">
              <Search className="w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                placeholder={t('hero.searchPlaceholder')}
                className="flex-1 bg-transparent outline-none text-foreground placeholder:text-muted-foreground text-sm"
              />
            </div>
            <Button className="gradient-primary text-primary-foreground border-0 rounded-xl m-2 px-6">
              {t('hero.search')}
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-12 flex justify-center gap-8 md:gap-16 animate-fade-up opacity-0" style={{ animationDelay: "0.5s" }}>
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-2xl md:text-3xl font-bold gradient-primary-text animate-count-up">
                <CountUp end={stat.value} prefix={stat.prefix} duration={2.5} enableScrollSpy scrollSpyOnce />
              </p>
              <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
