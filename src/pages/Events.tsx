import { Search, Calendar, MapPin, Users, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useState, useEffect } from "react";
import { getPublicEvents, StudentEventDto } from "@/lib/api";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

const EVENT_IMAGES = [
  "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=800",
  "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&q=80&w=800",
  "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&q=80&w=800",
  "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&q=80&w=800",
  "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&q=80&w=800",
  "https://images.unsplash.com/photo-1559136555-9303baea8ebd?auto=format&fit=crop&q=80&w=800",
];

function getEventImage(id: number) {
  return EVENT_IMAGES[id % EVENT_IMAGES.length];
}

function formatEventDate(dateStr: string) {
  try {
    return format(new Date(dateStr), "EEEE، d MMMM yyyy", { locale: ar });
  } catch {
    return dateStr;
  }
}

const Events = ({ hideLayout = false }: { hideLayout?: boolean }) => {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [events, setEvents] = useState<StudentEventDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const pageSize = 12;

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      try {
        const res = await getPublicEvents({
          searchQuery: debouncedSearch || undefined,
          page,
          pageSize,
        });
        const eventsList = res.data || [];
        // public events are pre-filtered by the backend
        setEvents(eventsList);
        setHasMore(eventsList.length === pageSize);
      } catch (err: unknown) {
        toast.error(err instanceof Error ? err.message : "فشل تحميل الفعاليات");
        setEvents([]);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, [debouncedSearch, page]);

  return (
    <div className={hideLayout ? "" : "min-h-screen bg-background"}>
      {!hideLayout && <Navbar />}
      <div className={hideLayout ? "" : "container mx-auto px-4 py-8"}>
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">{t("eventsPage.title")}</h1>
          <p className="text-muted-foreground">{t("eventsPage.subtitle")}</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mb-8 max-w-2xl mx-auto">
          <div className="flex-1 flex items-center gap-2 bg-card rounded-xl border border-border px-4">
            <Search className="w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder={t("eventsPage.searchPlaceholder")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 h-11 bg-transparent outline-none text-foreground text-sm"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.map((event) => (
                <Link key={event.id} to={`/events/${event.id}`}>
                  <div className="group bg-card rounded-2xl overflow-hidden card-shadow hover:card-shadow-hover transition-all duration-300 border border-border">
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={getEventImage(event.id)}
                        alt={event.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      {event.isApproved !== false && (
                        <div className="absolute top-3 right-3">
                          <span className="px-3 py-1 rounded-full text-xs font-medium bg-success/10 text-success">
                            {t("eventsPage.approved")}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="p-5">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {t("eventsPage.capacity")}: {event.capacity}
                        </span>
                      </div>
                      <h3 className="text-lg font-bold text-foreground mb-3">{event.title}</h3>
                      <div className="flex flex-col gap-2 text-sm text-muted-foreground mb-4">
                        <span className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          {formatEventDate(event.startDate)}
                        </span>
                        <span className="flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          {event.location}
                        </span>
                      </div>
                      <Button className="w-full gradient-primary text-primary-foreground border-0 rounded-xl">
                        {t("eventsPage.showDetails")}
                      </Button>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {events.length === 0 && (
              <div className="text-center py-16">
                <p className="text-xl font-bold text-foreground mb-2">{t("eventsPage.noEvents")}</p>
                <p className="text-muted-foreground">{t("eventsPage.tryDifferentSearch")}</p>
              </div>
            )}

            {events.length > 0 && (
              <div className="flex justify-center gap-3 mt-10">
                <Button
                  variant="outline"
                  className="rounded-xl"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  {t("eventsPage.previous")}
                </Button>
                <span className="flex items-center px-4 text-sm text-muted-foreground">
                  {t("eventsPage.page")} {page}
                </span>
                <Button
                  variant="outline"
                  className="rounded-xl"
                  disabled={!hasMore}
                  onClick={() => setPage((p) => p + 1)}
                >
                  {t("eventsPage.next")}
                </Button>
              </div>
            )}
          </>
        )}
      </div>
      {!hideLayout && <Footer />}
    </div>
  );
};

export default Events;
