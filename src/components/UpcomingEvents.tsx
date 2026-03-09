import { Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { getPublicEvents, StudentEventDto } from "@/lib/api";
import { format } from "date-fns";
import { ar, enUS } from "date-fns/locale";
import { useTranslation } from "react-i18next";

const EVENT_IMAGES = [
    "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&q=80&w=800",
];

function getEventImage(id: number) {
    return EVENT_IMAGES[id % EVENT_IMAGES.length];
}

function formatEventDate(dateStr: string, isAr: boolean) {
    try {
        return format(new Date(dateStr), isAr ? "EEEE، d MMMM yyyy" : "EEEE, MMMM d, yyyy", { locale: isAr ? ar : enUS });
    } catch {
        return dateStr;
    }
}

const UpcomingEvents = () => {
    const { t, i18n } = useTranslation();
    const isAr = i18n.language === "ar";
    const [events, setEvents] = useState<StudentEventDto[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const res = await getPublicEvents({ page: 1, pageSize: 4 });
                const list = Array.isArray(res?.data) ? res.data : [];
                setEvents(list.slice(0, 4));
            } catch {
                setEvents([]);
            } finally {
                setLoading(false);
            }
        };
        fetchEvents();
    }, []);

    if (loading || events.length === 0) return null;

    return (
        <section className="py-12 bg-background relative z-10">
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between mb-8 animate-fade-up opacity-0" style={{ animationFillMode: "forwards" }}>
                    <h2 className="text-2xl md:text-3xl font-bold text-foreground">
                        {isAr ? "الفعاليات القادمة" : "Upcoming Events"}
                    </h2>
                    <Link to="/events" className="text-sm font-medium text-primary hover:underline">
                        {isAr ? "عرض الكل" : "View All"}
                    </Link>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {events.map((event, index) => (
                        <Link
                            key={event.id}
                            to={`/events/${event.id}`}
                            className="group bg-card rounded-2xl overflow-hidden border border-border transition-all duration-300 hover:-translate-y-1 hover:shadow-lg dark:hover:shadow-[0_8px_30px_rgba(255,255,255,0.05)] animate-fade-up opacity-0 relative flex flex-col h-full"
                            style={{ animationDelay: `${0.2 + (index * 0.1)}s`, animationFillMode: "forwards" }}
                        >
                            <div className="relative h-40 overflow-hidden flex-shrink-0">
                                <img
                                    src={getEventImage(event.id)}
                                    alt={event.title}
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                            </div>
                            <div className="p-5 flex flex-col flex-1">
                                <h3 className="font-bold text-foreground mb-3 line-clamp-2 group-hover:text-primary transition-colors flex-1">{event.title}</h3>
                                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-4">
                                    <Calendar className="w-3.5 h-3.5" />
                                    {formatEventDate(event.startDate, isAr)}
                                </div>
                                <Button variant="outline" size="sm" className="w-full rounded-xl group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary transition-colors mt-auto">
                                    {t('eventsSection.showDetails')}
                                </Button>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default UpcomingEvents;
