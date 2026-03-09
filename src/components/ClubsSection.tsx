import { Users, Calendar, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const clubs = [
  {
    id: 1,
    name: "اتحاد الطلاب الرئيسي",
    description: "يمثل جميع الطلاب ويدير الأنشطة العامة والفعاليات الكبرى",
    members: 250,
    events: 45,
    image: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&q=80&w=800&sat=-50",
  },
  {
    id: 2,
    name: "اتحاد النشاط الثقافي",
    description: "ينظم الفعاليات الثقافية والمعارض والمهرجانات الفنية",
    members: 180,
    events: 32,
    image: "https://images.unsplash.com/photo-1511792441657-2b346687b6c7?auto=format&fit=crop&q=80&w=800&sat=-30",
  },
  {
    id: 3,
    name: "اتحاد النشاط الرياضي",
    description: "ينظم البطولات والمسابقات الرياضية والأنشطة البدنية",
    members: 220,
    events: 28,
    image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&q=80&w=800&sat=-20",
  },
];

const ClubsSection = () => {
  return (
    <section id="clubs" className="py-20 bg-secondary/30">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-4">
          <span className="text-sm font-medium text-primary">هيكلة وتنظيم</span>
        </div>
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
            الاتحادات الطلابية
          </h2>
          <p className="text-muted-foreground max-w-lg mx-auto">
            تعرّف على الاتحادات والأندية التي تدير الأنشطة والفعاليات في الجامعة
          </p>
        </div>

        {/* Club Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {clubs.map((club, index) => (
            <div
              key={club.id}
              className="group bg-card rounded-2xl overflow-hidden card-shadow hover:card-shadow-hover transition-all duration-300 border border-border animate-fade-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Image */}
              <div className="relative h-44 overflow-hidden">
                <img
                  src={club.image}
                  alt={club.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-foreground/40 to-transparent" />
                <Button
                  size="sm"
                  variant="secondary"
                  className="absolute bottom-3 right-3 rounded-lg text-xs glass border-0"
                >
                  استكشف النادي
                </Button>
              </div>

              {/* Content */}
              <div className="p-5">
                <h3 className="text-lg font-bold text-foreground mb-2">{club.name}</h3>
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                  {club.description}
                </p>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Users className="w-4 h-4" />
                    <span className="font-medium text-foreground">{club.members}</span> عضو
                  </div>
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    <span className="font-medium text-foreground">{club.events}</span> فعالية
                  </div>
                  <ArrowLeft className="w-4 h-4 text-primary group-hover:-translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ClubsSection;
