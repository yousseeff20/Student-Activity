import { Calendar, MapPin, Users, Loader2, Clock, ArrowLeft, MessageSquare, Star, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { getPublicEvents, StudentEventDto, getPublicEventFeedback } from "@/lib/api";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { format } from "date-fns";
import { ar, enUS } from "date-fns/locale";
import { useTranslation } from "react-i18next";

const EVENT_IMAGES = {
  sports: [
    "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1552667466-07770ae110d0?auto=format&fit=crop&q=80&w=800"
  ],
  academic: [
    "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1523580494863-6f3031224c94?auto=format&fit=crop&q=80&w=800"
  ],
  cultural: [
    "https://images.unsplash.com/photo-1511792441657-2b346687b6c7?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1543286386-713bdd548da4?auto=format&fit=crop&q=80&w=800"
  ],
  tech: [
    "https://images.unsplash.com/photo-1518709268805-4e9042af2176?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1550745165-9bc0b252726a?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&q=80&w=800"
  ],
  social: [
    "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=800"
  ],
  default: [
    "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1559136555-9303baea8ebd?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&q=80&w=800"
  ]
};

function getEventCategory(title: string): keyof typeof EVENT_IMAGES {
  const sportsKeywords = ['رياضة', 'كرة', 'سباحة', 'جري', 'رياضي', 'sport', 'football', 'basketball', 'swimming'];
  const academicKeywords = ['محاضرة', 'ورشة', 'دراسة', 'بحث', 'علمي', 'academic', 'lecture', 'workshop', 'research'];
  const culturalKeywords = ['ثقافة', 'فن', 'موسيقى', 'فيلم', 'حفلة', 'cultural', 'art', 'music', 'film', 'concert'];
  const techKeywords = ['تقنية', 'برمجة', 'كمبيوتر', 'ذكاء', 'تكنولوجيا', 'tech', 'programming', 'computer', 'AI', 'technology'];
  const socialKeywords = ['اجتماعي', 'مجتمع', 'خدمة', 'تطوعي', 'social', 'community', 'service', 'volunteer'];

  const lowerTitle = title.toLowerCase();

  if (sportsKeywords.some(keyword => lowerTitle.includes(keyword))) return 'sports';
  if (academicKeywords.some(keyword => lowerTitle.includes(keyword))) return 'academic';
  if (culturalKeywords.some(keyword => lowerTitle.includes(keyword))) return 'cultural';
  if (techKeywords.some(keyword => lowerTitle.includes(keyword))) return 'tech';
  if (socialKeywords.some(keyword => lowerTitle.includes(keyword))) return 'social';

  return 'default';
}

function formatStudentName(f: any): string {
  const nameParts = [f.firstName, f.lastName].filter(Boolean);
  if (nameParts.length > 0) return nameParts.join(' ').trim();

  if (f.studentName || f.userName) return f.studentName || f.userName;

  let rawName = f.student || f.email || "";
  if (typeof rawName === 'string' && rawName.includes('@')) {
    let username = rawName.split('@')[0];
    // Capitalize first letter
    username = username.charAt(0).toUpperCase() + username.slice(1);
    return username;
  }

  return rawName || "طالب";
}

function formatFeedbackDate(dateStr: string): string {
  if (!dateStr) return "";
  const dateObj = new Date(dateStr);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - dateObj.getTime());
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "اليوم";
  if (diffDays === 1) return "الأمس";
  if (diffDays === 2) return "منذ يومين";
  if (diffDays > 2 && diffDays <= 7) return `منذ ${diffDays} أيام`;

  return `${dateObj.getFullYear()}/${dateObj.getMonth() + 1}/${dateObj.getDate()}`;
}

function getEventStatus(startDateStr: string, endDateStr: string) {
  const now = new Date().getTime();
  const start = new Date(startDateStr).getTime();
  const end = new Date(endDateStr).getTime();

  if (now > end) {
    return { label: 'منتهية', className: 'bg-muted text-muted-foreground border-border' };
  } else if (now < start - (7 * 24 * 60 * 60 * 1000)) { // More than 7 days away
    return { label: 'قريبًا', className: 'bg-primary/10 text-primary border-primary/20' };
  } else {
    return { label: 'متاح الحجز', className: 'bg-success/10 text-success border-success/20' };
  }
}

function getEventImage(title: string, id: number) {
  const category = getEventCategory(title);
  const images = EVENT_IMAGES[category];
  return images[id % images.length];
}

const formatRealDate = (dateString: string, isAr: boolean) => {
  if (!dateString) return "";
  const dateObj = new Date(dateString);
  try {
    return format(dateObj, isAr ? "EEEE، d MMMM yyyy" : "EEEE, MMMM d, yyyy", { locale: isAr ? ar : enUS });
  } catch {
    return dateString;
  }
};

const formatRealTime = (dateString: string) => {
  if (!dateString) return "";
  const dateObj = new Date(dateString);
  return dateObj.toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" });
};

const EventsSection = () => {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === "ar";
  const [events, setEvents] = useState<StudentEventDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const pageSize = 6;

  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
  const [selectedEventForFeedback, setSelectedEventForFeedback] = useState<StudentEventDto | null>(null);
  const [feedbacks, setFeedbacks] = useState<any[]>([]);
  const [loadingFeedbacks, setLoadingFeedbacks] = useState(false);

  const fetchEvents = async (page: number, append: boolean = false) => {
    try {
      const res = await getPublicEvents({ page, pageSize });
      const list = Array.isArray(res?.data) ? res.data : [];

      if (append) {
        setEvents(prev => [...prev, ...list]);
      } else {
        setEvents(list);
      }

      // Check if there are more events to load
      setHasMore(list.length === pageSize);
    } catch {
      if (!append) {
        setEvents([]);
      }
      setHasMore(false);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchEvents(1, false);
  }, []);

  const handleLoadMore = () => {
    if (!loadingMore && hasMore) {
      setLoadingMore(true);
      const nextPage = currentPage + 1;
      setCurrentPage(nextPage);
      fetchEvents(nextPage, true);
    }
  };

  const handleViewFeedbacks = async (e: React.MouseEvent, event: StudentEventDto) => {
    e.preventDefault();
    setSelectedEventForFeedback(event);
    setFeedbackModalOpen(true);
    setLoadingFeedbacks(true);
    setFeedbacks([]);
    try {
      const res = await getPublicEventFeedback(event.id);
      setFeedbacks(res.data || []);
    } catch {
      setFeedbacks([]);
    } finally {
      setLoadingFeedbacks(false);
    }
  };

  return (
    <section id="events" className="py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">{t('eventsSection.title')}</h2>
          <p className="text-muted-foreground max-w-lg mx-auto">
            {t('eventsSection.subtitle')}
          </p>
        </div>

        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-card rounded-2xl overflow-hidden border border-border">
                <div className="h-48 bg-muted animate-pulse" />
                <div className="p-5">
                  <div className="h-3 w-20 bg-muted animate-pulse rounded mb-4" />
                  <div className="h-6 w-3/4 bg-muted animate-pulse rounded mb-4" />
                  <div className="space-y-3 mb-6">
                    <div className="h-4 w-1/2 bg-muted animate-pulse rounded" />
                    <div className="h-4 w-1/3 bg-muted animate-pulse rounded" />
                  </div>
                  <div className="space-y-2">
                    <div className="h-9 w-full bg-muted animate-pulse rounded-xl" />
                    <div className="h-9 w-full bg-muted animate-pulse rounded-xl" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : events.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event, index) => (
              <div
                key={event.id}
                className="group bg-card rounded-2xl overflow-hidden card-shadow hover:card-shadow-hover transition-all duration-300 border border-border animate-fade-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <Link to={`/events/${event.id}`} className="block">
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={getEventImage(event.title, event.id)}
                      alt={event.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    {event.isApproved && (
                      <div className="absolute top-3 right-3">
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-success/10 text-success backdrop-blur-md">
                          {t('eventsSection.approved')}
                        </span>
                      </div>
                    )}
                    <div className="absolute top-3 left-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium backdrop-blur-md border shadow-sm ${getEventStatus(event.startDate, event.endDate).className}`}>
                        {getEventStatus(event.startDate, event.endDate).label}
                      </span>
                    </div>
                  </div>
                  <div className="p-5">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {t('eventsSection.capacity')} {event.capacity}
                      </span>
                    </div>
                    <h3 className="text-xl font-extrabold text-foreground mb-3">{event.title}</h3>
                    <div className="flex flex-col gap-2 text-sm text-muted-foreground mb-4">
                      <span className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        {formatRealDate(event.startDate, isAr)}
                      </span>
                      <span className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        {formatRealTime(event.startDate)}
                      </span>
                      <span className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        {event.location}
                      </span>
                    </div>
                  </div>
                </Link>
                <div className="px-5 pb-5 flex items-center justify-between gap-3">
                  <Link to={`/events/${event.id}`} className="flex-1">
                    <Button variant="default" className="w-full rounded-xl text-sm py-2.5 justify-center shadow-sm">
                      {t('eventsSection.showDetails')}
                      <ArrowLeft className="w-3.5 h-3.5 mr-2" />
                    </Button>
                  </Link>
                  <Button
                    variant="secondary"
                    size="sm"
                    className="rounded-xl px-3 py-2.5 h-auto text-sm gap-1.5 shadow-sm border border-border/50 hover:bg-secondary/80 transition-colors shrink-0"
                    onClick={(e) => handleViewFeedbacks(e, event)}
                    title="عرض تقييمات الطلاب"
                  >
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-medium text-foreground">التقييمات</span>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 max-w-lg mx-auto">
            <p className="text-foreground font-medium mb-2">{t('eventsSection.noEvents')}</p>
            <p className="text-sm text-muted-foreground mb-6">
              {t('eventsSection.noEventsDesc')}
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Link to="/login">
                <Button className="rounded-xl">{t('hero.login')}</Button>
              </Link>
              <Link to="/register">
                <Button variant="outline" className="rounded-xl">{t('hero.register')}</Button>
              </Link>
            </div>
          </div>
        )}

        <div className="text-center mt-10">
          {hasMore && (
            <Button
              variant="outline"
              size="lg"
              className="rounded-xl px-8"
              onClick={handleLoadMore}
              disabled={loadingMore}
            >
              {loadingMore ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {t('eventsSection.loading')}
                </>
              ) : (
                <>
                  {t('eventsSection.viewAll')}
                  <ArrowLeft className="w-4 h-4 mr-2" />
                </>
              )}
            </Button>
          )}
          {!hasMore && events.length > 0 && (
            <p className="text-sm text-muted-foreground">
              {t('eventsSection.allLoaded')}
            </p>
          )}
        </div>
      </div>

      {/* Feedback Modal */}
      <Dialog open={feedbackModalOpen} onOpenChange={setFeedbackModalOpen}>
        <DialogContent className="sm:max-w-md md:max-w-xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl">
              تقييمات الفعالية: {selectedEventForFeedback?.title}
            </DialogTitle>
            <DialogDescription>
              آراء وتعليقات الطلاب الذين حضروا هذه الفعالية.
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4 space-y-4">
            {loadingFeedbacks ? (
              <div className="flex justify-center flex-col items-center gap-3 p-8">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">جاري تحميل التقييمات...</p>
              </div>
            ) : feedbacks.length > 0 ? (
              feedbacks.map((f, i) => (
                <div key={i} className="p-5 bg-card rounded-2xl border border-border/50 shadow-sm flex flex-col gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full overflow-hidden bg-muted flex items-center justify-center shrink-0">
                      <User className="w-6 h-6 text-muted-foreground" />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <p className="font-bold text-base text-foreground">
                        {formatStudentName(f)}
                      </p>
                      <div className="flex gap-1">
                        {Array.from({ length: 5 }, (_, idx) => (
                          <Star key={idx} className={`w-3.5 h-3.5 ${idx < (f.rating || 0) ? "fill-yellow-500 text-yellow-500" : "text-muted/30"}`} />
                        ))}
                      </div>
                    </div>
                  </div>

                  {f.comment && (
                    <p className="text-base text-card-foreground leading-relaxed pe-2">
                      {f.comment}
                    </p>
                  )}

                  {f.createdAt && (
                    <p className="text-xs text-muted-foreground mt-2">
                      {formatFeedbackDate(f.createdAt)}
                    </p>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-10 text-muted-foreground bg-secondary/10 rounded-xl border border-dashed border-border">
                <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-20" />
                <p className="font-medium text-foreground mb-1">لا توجد تقييمات</p>
                <p className="text-sm">لم يتم إضافة أي تقييمات لهذه الفعالية حتى الآن.</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default EventsSection;
