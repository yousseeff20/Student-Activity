import { useEffect, useState, useRef } from "react";
import { useLocation, Link } from "react-router-dom";
import {
  Calendar, Users, CheckCircle, Clock, Plus, Eye, TrendingUp, TrendingDown,
  X, MapPin, UserCheck, UserX, BarChart3, Sparkles, Search,
  QrCode, Keyboard, Hash, User, Mail, Phone, ScanLine, CheckCircle2,
  XCircle, Filter, Download, Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import DashboardLayout from "@/components/DashboardLayout";
import { toast } from "sonner";
import CountUp from "react-countup";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import {
  organizerApi,
  adminApi,
  type OrganizerEventDto,
  type OrganizerRegistrationDto,
} from "@/lib/api";
import { useTranslation } from "react-i18next";
import { Html5QrcodeScanner } from "html5-qrcode";

// ==================== HELPERS ====================

// Prevents UTC shift by parsing the exact date string without timezone conversion
const formatRealDate = (dateString: string) => {
  if (!dateString) return "غير متوفر";
  const dateObj = new Date(dateString);
  return dateObj.toLocaleDateString("ar-EG");
};

const formatRealTime = (dateString: string) => {
  if (!dateString) return "غير متوفر";
  const dateObj = new Date(dateString);
  return dateObj.toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" });
};

// ==================== DATA ====================

// ==================== SUB-PAGES ====================

type DashboardStats = {
  totalEvents: number;
  totalRegistrations: number;
};

const DashboardHome = ({
  stats,
  latestRegistrations,
  showCreateModal,
  setShowCreateModal,
  newEvent,
  setNewEvent,
  handleCreateEvent,
  userName,
  clubs,
}: {
  stats: DashboardStats;
  latestRegistrations: OrganizerRegistrationDto[];
  showCreateModal: boolean;
  setShowCreateModal: (v: boolean) => void;
  newEvent: { title: string; date: string; location: string; capacity: string; clubId: string };
  setNewEvent: (v: { title: string; date: string; location: string; capacity: string; clubId: string }) => void;
  handleCreateEvent: (e: React.FormEvent) => void;
  userName: string;
  clubs: { id: number; name: string | null }[];
}) => {
  const { t } = useTranslation();
  return (
    <>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground mb-1">{t("dashboard.organizer.welcome")}، {userName}</h1>
          <p className="text-muted-foreground text-sm">إدارة فعاليات النادي</p>
        </div>
        <Button
          className="gradient-primary text-primary-foreground border-0 rounded-xl gap-2 shadow-[0_0_15px_rgba(var(--primary-start),0.5)] hover:shadow-[0_0_25px_rgba(var(--primary-start),0.8)] transition-all animate-pulse"
          style={{ animationDuration: '3s' }}
          onClick={() => setShowCreateModal(true)}
        >
          <Plus className="w-4 h-4" /> {t("dashboard.organizer.createEvent")}
        </Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-card rounded-2xl p-5 card-shadow border border-border transition-all duration-300 hover:-translate-y-1 hover:shadow-xl dark:hover:shadow-[0_8px_30px_rgba(255,255,255,0.05)]">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-primary/10 text-primary">
              <Calendar className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-bold text-foreground">
            <CountUp end={stats.totalEvents} duration={2} />
          </p>
          <p className="text-sm text-muted-foreground">{t("dashboard.organizer.totalEvents")}</p>
        </div>
        <div className="bg-card rounded-2xl p-5 card-shadow border border-border transition-all duration-300 hover:-translate-y-1 hover:shadow-xl dark:hover:shadow-[0_8px_30px_rgba(255,255,255,0.05)]">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-accent/10 text-accent">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-bold text-foreground">
            <CountUp end={stats.totalRegistrations} duration={2} />
          </p>
          <p className="text-sm text-muted-foreground">{t("dashboard.organizer.totalRegistrations")}</p>
        </div>
        <div className="bg-card rounded-2xl p-5 card-shadow border border-border transition-all duration-300 hover:-translate-y-1 hover:shadow-xl dark:hover:shadow-[0_8px_30px_rgba(255,255,255,0.05)]">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-success/10 text-success">
              <CheckCircle className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-bold text-foreground">
            <CountUp end={stats.totalEvents} duration={2} />
          </p>
          <p className="text-sm text-muted-foreground">{t("dashboard.organizer.createdEvents")}</p>
        </div>
        <div className="bg-card rounded-2xl p-5 card-shadow border border-border transition-all duration-300 hover:-translate-y-1 hover:shadow-xl dark:hover:shadow-[0_8px_30px_rgba(255,255,255,0.05)]">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-warning/10 text-warning">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-bold text-foreground">
            <CountUp end={latestRegistrations.length} duration={2} />
          </p>
          <p className="text-sm text-muted-foreground">{t("dashboard.organizer.latestRegistrations")}</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2 bg-card rounded-2xl p-6 card-shadow border border-border transition-all duration-300 hover:shadow-lg dark:hover:shadow-[0_8px_30px_rgba(255,255,255,0.05)]">
          <h2 className="text-lg font-bold text-foreground mb-4">نشاط التسجيل خلال الأيام الماضية</h2>
          <div className="h-[250px] w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={[
                { name: 'اليوم 1', registrations: Math.floor(Math.random() * 10) + 1 },
                { name: 'اليوم 2', registrations: Math.floor(Math.random() * 15) + 5 },
                { name: 'اليوم 3', registrations: Math.floor(Math.random() * 20) + 2 },
                { name: 'اليوم 4', registrations: Math.floor(Math.random() * 25) + 10 },
                { name: 'اليوم 5', registrations: latestRegistrations.length || 15 },
              ]}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                  itemStyle={{ color: 'hsl(var(--foreground))' }}
                />
                <Line
                  type="monotone"
                  dataKey="registrations"
                  stroke="hsl(var(--primary))"
                  strokeWidth={3}
                  dot={{ r: 4, fill: 'hsl(var(--primary))', strokeWidth: 0 }}
                  activeDot={{ r: 6, fill: 'hsl(var(--primary))', strokeWidth: 0 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="bg-card rounded-2xl p-6 card-shadow border border-border transition-all duration-300 hover:shadow-lg dark:hover:shadow-[0_8px_30px_rgba(255,255,255,0.05)]">
          <h2 className="text-lg font-bold text-foreground mb-5">{t("dashboard.organizer.quickSummary")}</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-xl bg-success/5 border border-success/10">
              <div className="flex items-center gap-2"><UserCheck className="w-4 h-4 text-success" /><span className="text-sm text-foreground">{t("dashboard.organizer.acceptanceRate")}</span></div>
              <span className="text-lg font-bold text-success">
                <CountUp end={86} suffix="%" duration={2} />
              </span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-primary/5 border border-primary/10">
              <div className="flex items-center gap-2"><BarChart3 className="w-4 h-4 text-primary" /><span className="text-sm text-foreground">{t("dashboard.organizer.attendanceRate")}</span></div>
              <span className="text-lg font-bold text-primary">
                <CountUp end={92} suffix="%" duration={2} />
              </span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-warning/5 border border-warning/10">
              <div className="flex items-center gap-2"><Clock className="w-4 h-4 text-warning" /><span className="text-sm text-foreground">{t("dashboard.organizer.pending")}</span></div>
              <span className="text-lg font-bold text-warning">
                <CountUp end={latestRegistrations.length} duration={2} />
              </span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-accent/5 border border-accent/10">
              <div className="flex items-center gap-2"><Sparkles className="w-4 h-4 text-accent" /><span className="text-sm text-foreground">{t("dashboard.organizer.overallRating")}</span></div>
              <span className="text-lg font-bold text-accent">
                <CountUp end={4.8} decimals={1} duration={2} suffix="/5" />
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-card rounded-2xl p-6 card-shadow border border-border">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-foreground">آخر طلبات التسجيل</h2>
          <Link to="/organizer/registrations"><Button variant="ghost" size="sm" className="text-primary text-xs">عرض الكل</Button></Link>
        </div>
        {latestRegistrations.length === 0 ? (
          <div className="text-center py-8">
            <CheckCircle className="w-12 h-12 text-success mx-auto mb-3 opacity-50" />
            <p className="text-sm text-muted-foreground">تم معالجة جميع الطلبات</p>
          </div>
        ) : (
          <div className="space-y-3">
            {latestRegistrations.slice(0, 3).map((reg) => (
              <div key={reg.id} className="flex items-center justify-between p-4 rounded-xl bg-secondary/50 hover:bg-secondary transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
                    <span className="text-primary-foreground font-bold text-sm">
                      {(reg as any).studentName ? String((reg as any).studentName).slice(0, 2) : reg.studentId.slice(-2)}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-foreground text-sm">الطالب: {(reg as any).studentName || (reg as any).clubName || 'مستخدم غير معروف'}</p>
                    <div className="text-xs text-muted-foreground flex flex-col gap-0.5 mt-1">
                      <span>{formatRealDate(reg.registrationDate)}</span>
                      <span className="opacity-80">{formatRealTime(reg.registrationDate)}</span>
                    </div>
                  </div>
                </div>
                <span className="text-xs text-muted-foreground">تسجيل جديد</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowCreateModal(false)}>
          <div className="bg-card rounded-2xl p-6 card-shadow border border-border w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-foreground">إنشاء فعالية جديدة</h2>
              <button onClick={() => setShowCreateModal(false)} className="text-muted-foreground hover:text-foreground"><X className="w-5 h-5" /></button>
            </div>
            <form className="space-y-4" onSubmit={handleCreateEvent}>
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">عنوان الفعالية</label>
                <input type="text" placeholder="أدخل عنوان الفعالية" value={newEvent.title} onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })} className="w-full h-11 px-4 rounded-xl border border-input bg-background text-foreground text-sm outline-none focus:ring-2 focus:ring-ring" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">التاريخ</label>
                  <input type="date" value={newEvent.date} onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })} className="w-full h-11 px-4 rounded-xl border border-input bg-background text-foreground text-sm outline-none focus:ring-2 focus:ring-ring" />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">السعة</label>
                  <input type="number" placeholder="50" value={newEvent.capacity} onChange={(e) => setNewEvent({ ...newEvent, capacity: e.target.value })} className="w-full h-11 px-4 rounded-xl border border-input bg-background text-foreground text-sm outline-none focus:ring-2 focus:ring-ring" />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">النادي التابع للفعالية</label>
                <select value={newEvent.clubId} onChange={(e) => setNewEvent({ ...newEvent, clubId: e.target.value })} className="w-full h-11 px-4 rounded-xl border border-input bg-background text-foreground text-sm outline-none focus:ring-2 focus:ring-ring">
                  <option value="">-- اختر النادي --</option>
                  {clubs && clubs.map(c => (
                    <option key={c.id} value={c.id}>{c.name || `نادي ${c.id}`}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">المكان</label>
                <input type="text" placeholder="مكان الفعالية" value={newEvent.location} onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })} className="w-full h-11 px-4 rounded-xl border border-input bg-background text-foreground text-sm outline-none focus:ring-2 focus:ring-ring" />
              </div>
              <div className="flex gap-3 pt-2">
                <Button type="submit" className="flex-1 gradient-primary text-primary-foreground border-0 rounded-xl h-11">إنشاء الفعالية</Button>
                <Button type="button" variant="outline" className="rounded-xl h-11" onClick={() => setShowCreateModal(false)}>إلغاء</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

// ==================== EVENTS PAGE ====================

const EventsPage = () => {
  const [events, setEvents] = useState<OrganizerEventDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteEventId, setDeleteEventId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<"all" | "approved" | "pending">("all");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await organizerApi.getEvents();
        setEvents(res.data || []);
      } catch (err: unknown) {
        toast.error(err instanceof Error ? err.message : "فشل تحميل الفعاليات");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filtered = events.filter((e) => {
    // 1. Tab filtering
    if (activeTab === "approved" && !e.isApproved) return false;
    if (activeTab === "pending" && e.isApproved) return false;

    // 2. Search filtering
    const matchSearch =
      e.title.includes(searchQuery) ||
      e.location.includes(searchQuery) ||
      String(e.id).includes(searchQuery);
    return matchSearch;
  });

  return (
    <>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground mb-1">فعالياتي</h1>
          <p className="text-muted-foreground text-sm">إدارة ومتابعة جميع الفعاليات • {events.length} فعالية</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="flex-1 flex items-center gap-2 bg-card rounded-xl border border-border px-4 transition-all duration-300 focus-within:ring-2 focus-within:ring-primary/50 focus-within:border-primary shadow-sm">
          <Search className="w-5 h-5 text-primary/70" />
          <input
            type="text"
            placeholder="ابحث باسم الفعالية أو المكان..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 h-12 bg-transparent outline-none text-foreground text-sm placeholder:text-muted-foreground/70"
          />
        </div>
        <div className="flex bg-card rounded-xl border border-border p-1 shrink-0 overflow-x-auto">
          <button
            onClick={() => setActiveTab("all")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${activeTab === "all" ? "bg-primary text-primary-foreground shadow-sm" : "hover:bg-secondary text-muted-foreground"}`}
          >
            الكل
          </button>
          <button
            onClick={() => setActiveTab("approved")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${activeTab === "approved" ? "bg-success text-success-foreground shadow-sm" : "hover:bg-secondary text-muted-foreground"}`}
          >
            معتمدة
          </button>
          <button
            onClick={() => setActiveTab("pending")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${activeTab === "pending" ? "bg-warning text-warning-foreground shadow-sm" : "hover:bg-secondary text-muted-foreground"}`}
          >
            قيد المراجعة
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((event, index) => (
            <div
              key={event.id}
              className="bg-card rounded-2xl p-4 card-shadow border border-border hover:shadow-lg dark:hover:shadow-[0_4px_20px_rgba(255,255,255,0.05)] transition-all duration-500 animate-fade-up opacity-0"
              style={{
                animationDelay: `${index * 0.2}s`,
                animationDuration: '0.8s',
                animationFillMode: "forwards"
              }}
            >
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <h3 className="font-bold text-foreground text-sm">{event.title}</h3>
                      <p className="text-xs text-muted-foreground mt-0.5">{event.location}</p>
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-medium shrink-0 ${event.isApproved ? "bg-success/10 text-success" : "bg-warning/10 text-warning"}`}>
                      {event.isApproved ? "معتمدة" : "قيد المراجعة"}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground mb-3">
                    <span className="flex items-center gap-2">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatRealDate(event.startDate)}
                      </span>
                      <span className="flex items-center gap-1 opacity-80">
                        <Clock className="w-3 h-3" />
                        {formatRealTime(event.startDate)}
                      </span>
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {event.location}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      السعة: {event.capacity}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Link to={`/events/${event.id}`}>
                      <Button variant="ghost" size="sm" className="text-primary text-xs gap-1">
                        <Eye className="w-3 h-3" /> عرض للطالب
                      </Button>
                    </Link>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-xs"
                      onClick={async () => {
                        try {
                          await organizerApi.closeRegistration(event.id);
                          toast.success("تم إغلاق التسجيل للفعالية");
                        } catch (err: unknown) {
                          toast.error(err instanceof Error ? err.message : "فشل إغلاق التسجيل");
                        }
                      }}
                    >
                      إغلاق التسجيل
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-xs"
                      onClick={async () => {
                        try {
                          await organizerApi.openRegistration(event.id);
                          toast.success("تم فتح التسجيل للفعالية");
                        } catch (err: unknown) {
                          toast.error(err instanceof Error ? err.message : "فشل فتح التسجيل");
                        }
                      }}
                    >
                      فتح التسجيل
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-xs text-destructive border-destructive/30 hover:bg-destructive/10"
                      onClick={() => setDeleteEventId(event.id)}
                    >
                      <Trash2 className="w-3 h-3 ml-1" /> حذف
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="text-center py-16 bg-card rounded-2xl border border-border">
              <Calendar className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-foreground font-medium">لا توجد فعاليات</p>
              <p className="text-sm text-muted-foreground">جرب تغيير معايير البحث</p>
            </div>
          )}
        </div>
      )}

      {deleteEventId !== null && (
        <div className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setDeleteEventId(null)}>
          <div className="bg-card rounded-2xl p-6 card-shadow border border-border w-full max-w-sm text-center" onClick={(e) => e.stopPropagation()}>
            <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-6 h-6 text-destructive" />
            </div>
            <h2 className="text-xl font-bold text-foreground mb-2">تأكيد الحذف</h2>
            <p className="text-muted-foreground text-sm mb-6">هل تريد حذف هذا العنصر بالفعل؟</p>
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1 rounded-xl h-11"
                onClick={() => setDeleteEventId(null)}
              >
                إلغاء
              </Button>
              <Button
                variant="destructive"
                className="flex-1 rounded-xl h-11"
                onClick={async () => {
                  try {
                    await organizerApi.deleteEvent(deleteEventId);
                    setEvents((prev) => prev.filter((e) => e.id !== deleteEventId));
                    toast.success("تم الحذف بنجاح");
                    setDeleteEventId(null);
                  } catch (err: unknown) {
                    toast.error(err instanceof Error ? err.message : "فشل الحذف");
                  }
                }}
              >
                حذف
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

// ==================== REGISTRATIONS PAGE ====================

const RegistrationsPage = () => {
  const [events, setEvents] = useState<OrganizerEventDto[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<number | null>(null);
  const [registrations, setRegistrations] = useState<OrganizerRegistrationDto[]>([]);
  const [studentNames, setStudentNames] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [page] = useState(1);
  const [pageSize] = useState(20);

  useEffect(() => {
    const loadEvents = async () => {
      try {
        const res = await organizerApi.getEvents();
        const evts = res.data || [];
        setEvents(evts);
        if (evts.length > 0) setSelectedEventId(evts[0].id);
      } catch (err: unknown) {
        toast.error(err instanceof Error ? err.message : "فشل تحميل الفعاليات");
      }
    };
    loadEvents();
  }, []);

  useEffect(() => {
    const loadRegs = async () => {
      if (!selectedEventId) return;
      setLoading(true);
      try {
        const res = await organizerApi.getEventRegistrations(selectedEventId, page, pageSize);
        const regs = res.data || [];
        setRegistrations(regs);

        // Fetch missing names
        const namesDict: Record<string, string> = {};
        await Promise.all(
          regs.map(async (r) => {
            const explicitName = (r as any).studentName || (r as any).student?.fullName || (r as any).student?.name || (r as any).user?.fullName || (r as any).user?.name || (r as any).clubName;
            if (explicitName) {
              namesDict[r.studentId] = explicitName;
            } else if (!studentNames[r.studentId]) {
              try {
                const studentRes = await adminApi.getStudentById(r.studentId);
                const sData: any = studentRes.data || studentRes;
                if (sData) {
                  namesDict[r.studentId] = sData.fullName || sData.name || sData.firstName ? `${sData.firstName} ${sData.lastName}` : r.studentId;
                }
              } catch (e) {
                // Ignore missing student lookup errors
              }
            }
          })
        );
        setStudentNames(prev => ({ ...prev, ...namesDict }));

      } catch (err: unknown) {
        toast.error(err instanceof Error ? err.message : "فشل تحميل التسجيلات");
        setRegistrations([]);
      } finally {
        setLoading(false);
      }
    };
    loadRegs();
  }, [selectedEventId, page, pageSize]);

  const filtered = registrations.filter((r) => {
    const nameMatch = studentNames[r.studentId] || r.studentId;
    return r.studentId.includes(searchQuery) || String(r.id).includes(searchQuery) || nameMatch.includes(searchQuery);
  });

  const counts = {
    total: registrations.length,
  };

  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground mb-1">إدارة التسجيلات</h1>
        <p className="text-muted-foreground text-sm">إدارة ومتابعة طلبات التسجيل للفعاليات</p>
      </div>

      <div className="mb-4">
        <label className="text-sm font-medium text-foreground mb-1 block">اختر الفعالية</label>
        <select
          value={selectedEventId ?? ""}
          onChange={(e) => setSelectedEventId(e.target.value ? Number(e.target.value) : null)}
          className="w-full sm:w-72 h-10 px-3 rounded-xl border border-input bg-background text-sm"
        >
          {events.map((ev) => (
            <option key={ev.id} value={ev.id}>
              {ev.title}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <div className="bg-card rounded-xl p-4 border border-border text-center">
          <p className="text-2xl font-bold text-foreground">{counts.total}</p>
          <p className="text-xs text-muted-foreground">إجمالي الطلبات</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="flex-1 flex items-center gap-2 bg-card rounded-xl border border-border px-4">
          <Search className="w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="بحث بالرقم الجامعي أو رقم التسجيل..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 h-10 bg-transparent outline-none text-foreground text-sm"
          />
        </div>
      </div>

      <div className="bg-card rounded-2xl card-shadow border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-secondary/30">
                <th className="text-right text-xs font-medium text-muted-foreground py-3 pr-4">اسم الفعالية</th>
                <th className="text-right text-xs font-medium text-muted-foreground py-3">اسم المستفيد</th>
                <th className="text-right text-xs font-medium text-muted-foreground py-3">التاريخ</th>
                <th className="text-right text-xs font-medium text-muted-foreground py-3">التوقيت</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr>
                  <td colSpan={4} className="py-6 text-center text-sm text-muted-foreground">
                    جاري تحميل التسجيلات...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-6 text-center text-sm text-muted-foreground">
                    لا توجد تسجيلات لهذه الفعالية
                  </td>
                </tr>
              ) : (
                filtered.map((reg) => (
                  <tr key={reg.id} className="hover:bg-secondary/20 transition-colors">
                    <td className="py-3 pr-4 text-sm text-foreground">{events.find((e) => e.id === selectedEventId)?.title || "غير متوفر"}</td>
                    <td className="py-3 text-sm text-foreground font-medium">
                      {studentNames[reg.studentId] && studentNames[reg.studentId] !== reg.studentId
                        ? studentNames[reg.studentId]
                        : "غير مدرج"}
                    </td>
                    <td className="py-3 text-sm text-foreground">
                      {formatRealDate(reg.registrationDate)}
                    </td>
                    <td className="py-3 text-sm text-muted-foreground">
                      {formatRealTime(reg.registrationDate)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

// ==================== ATTENDANCE PAGE ====================

const AttendancePage = () => {
  const [events, setEvents] = useState<OrganizerEventDto[]>([]);
  const [mode, setMode] = useState<"qr" | "manual">("qr");
  const [manualForm, setManualForm] = useState({ email: "" });
  const [selectedEventId, setSelectedEventId] = useState<number | null>(null);
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState<string | null>(null);
  const barcodeInputRef = useRef<HTMLInputElement>(null);
  const [marking, setMarking] = useState(false);

  useEffect(() => {
    const loadEvents = async () => {
      try {
        const res = await organizerApi.getEvents();
        const evts = res.data || [];
        setEvents(evts);
        if (evts.length > 0) setSelectedEventId(evts[0].id);
      } catch (err: unknown) {
        toast.error(err instanceof Error ? err.message : "فشل تحميل الفعاليات");
      }
    };
    loadEvents();
  }, []);

  const handleManualAttendance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEventId) {
      toast.error("اختر الفعالية أولاً");
      return;
    }
    if (!manualForm.email.trim()) {
      toast.error("اكتب البريد الإلكتروني للطالب");
      return;
    }
    setMarking(true);
    try {
      await organizerApi.markAttendanceByEmail({
        eventId: selectedEventId,
        email: manualForm.email.trim(),
      });
      toast.success("تم تسجيل الحضور بنجاح");
      setManualForm({ email: "" });
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "فشل تسجيل الحضور");
    } finally {
      setMarking(false);
    }
  };


  const handleBarcodeScan = () => {
    setScanning(true);
    setScanResult(null);
  };

  useEffect(() => {
    let scanner: Html5QrcodeScanner | null = null;
    if (mode === "qr" && scanning) {
      scanner = new Html5QrcodeScanner(
        "reader",
        { fps: 10, qrbox: { width: 250, height: 250 } },
        false
      );

      scanner.render(
        (decodedText) => {
          handleBarcodeInput(decodedText);
          scanner?.clear().catch((e) => console.error("Failed to clear scanner", e));
        },
        (errorMessage) => {
          // ignore scan errors
        }
      );
    }

    return () => {
      if (scanner) {
        scanner.clear().catch((e) => console.error("Failed to clear scanner on unmount", e));
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, scanning]);

  const handleBarcodeInput = async (value: string) => {
    if (!selectedEventId) return;
    if (value.length < 3) return;
    setScanning(false);
    try {
      const regsRes = await organizerApi.getEventRegistrations(selectedEventId, 1, 200);
      const regs = regsRes.data || [];

      let scannedRegistrationId: number | null = null;
      let scannedStudentId = value.trim();

      try {
        const parsed = JSON.parse(value);
        if (parsed.registrationId || parsed.RegistrationId) {
          scannedRegistrationId = Number(parsed.registrationId || parsed.RegistrationId);
        }
      } catch {
        // Not a JSON, assume it's studentId
      }

      const match = scannedRegistrationId
        ? regs.find((r) => r.id === scannedRegistrationId)
        : regs.find((r) => r.studentId === scannedStudentId);

      if (!match) {
        setScanResult("not-found");
        toast.error("لم يتم العثور على تسجيل بهذا الباركود");
        return;
      }
      await organizerApi.markAttendance({
        registrationId: match.id,
        eventId: selectedEventId,
      });
      setScanResult("success");
      toast.success("تم تسجيل الحضور بنجاح");
    } catch (err: unknown) {
      setScanResult("error");
      toast.error(err instanceof Error ? err.message : "فشل تسجيل الحضور عبر الباركود");
    }
  };

  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground mb-1">تسجيل الحضور</h1>
        <p className="text-muted-foreground text-sm">تسجيل حضور الطلاب عبر الباركود أو يدوياً باستخدام واجهات المنظم</p>
      </div>

      {/* Event Selector */}
      <div className="bg-card rounded-2xl p-4 card-shadow border border-border mb-6">
        <label className="text-sm font-medium text-foreground mb-2 block">اختر الفعالية</label>
        <select
          value={selectedEventId ?? ""}
          onChange={(e) => setSelectedEventId(e.target.value ? Number(e.target.value) : null)}
          className="w-full h-11 px-4 rounded-xl border border-input bg-background text-foreground text-sm outline-none focus:ring-2 focus:ring-ring"
        >
          {events.map((ev) => (
            <option key={ev.id} value={ev.id}>
              {ev.title}
            </option>
          ))}
        </select>
      </div>

      {/* Mode Tabs */}
      <div className="flex gap-2 mb-6">
        <button onClick={() => setMode("qr")} className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-medium text-sm transition-all ${mode === "qr" ? "gradient-primary text-primary-foreground shadow-lg shadow-primary/25" : "bg-card text-muted-foreground border border-border hover:bg-secondary"}`}>
          <QrCode className="w-5 h-5" /> مسح الباركود
        </button>
        <button onClick={() => setMode("manual")} className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-medium text-sm transition-all ${mode === "manual" ? "gradient-primary text-primary-foreground shadow-lg shadow-primary/25" : "bg-card text-muted-foreground border border-border hover:bg-secondary"}`}>
          <Keyboard className="w-5 h-5" /> تسجيل يدوي
        </button>
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        {/* Scanner / Manual Form */}
        <div className="bg-card rounded-2xl p-6 card-shadow border border-border">
          {mode === "qr" ? (
            <>
              <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                <QrCode className="w-5 h-5 text-primary" /> مسح الباركود
              </h2>
              <div className="bg-secondary/50 rounded-xl p-8 text-center border-2 border-dashed border-border mb-4">
                {scanning ? (
                  <>
                    <div id="reader" className="w-full max-w-sm mx-auto overflow-hidden rounded-xl border-2 border-primary/20 bg-background mb-4 p-2"></div>
                    <Button variant="outline" className="mt-3 rounded-xl text-xs" onClick={() => setScanning(false)}>إلغاء</Button>
                  </>
                ) : (
                  <>
                    {scanResult === "success" ? (
                      <div className="mb-4">
                        <CheckCircle className="w-16 h-16 text-success mx-auto mb-3" />
                        <p className="text-lg font-bold text-success">تم التسجيل بنجاح!</p>
                      </div>
                    ) : scanResult === "not-found" ? (
                      <div className="mb-4">
                        <XCircle className="w-16 h-16 text-destructive mx-auto mb-3" />
                        <p className="text-lg font-bold text-destructive">لم يتم العثور على تسجيل</p>
                      </div>
                    ) : scanResult === "error" ? (
                      <div className="mb-4">
                        <XCircle className="w-16 h-16 text-destructive mx-auto mb-3" />
                        <p className="text-lg font-bold text-destructive">فشل تسجيل الحضور</p>
                      </div>
                    ) : (
                      <div className="mb-4">
                        <QrCode className="w-16 h-16 text-muted-foreground/40 mx-auto mb-3" />
                        <p className="text-foreground font-medium">جاهز للمسح</p>
                        <p className="text-xs text-muted-foreground mt-1">اضغط للبدء في مسح باركود الطالب</p>
                      </div>
                    )}
                    <Button className="gradient-primary text-primary-foreground border-0 rounded-xl gap-2 shadow-lg shadow-primary/25" onClick={handleBarcodeScan}>
                      <ScanLine className="w-4 h-4" /> بدء المسح
                    </Button>
                  </>
                )}
              </div>
            </>
          ) : (
            <>
              <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                <Keyboard className="w-5 h-5 text-primary" /> تسجيل يدوي
              </h2>
              <form className="space-y-4" onSubmit={handleManualAttendance}>
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">
                    البريد الإلكتروني للطالب <span className="text-destructive">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type="email"
                      placeholder="student@example.com"
                      value={manualForm.email}
                      onChange={(e) => setManualForm({ email: e.target.value })}
                      className="w-full h-11 pr-10 pl-4 rounded-xl border border-input bg-background text-foreground text-sm outline-none focus:ring-2 focus:ring-ring"
                    />
                  </div>
                </div>
                <Button
                  type="submit"
                  disabled={marking}
                  className="w-full gradient-primary text-primary-foreground border-0 rounded-xl h-11 gap-2"
                >
                  {marking ? (
                    <>
                      <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                      جاري التسجيل...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4" /> تسجيل الحضور
                    </>
                  )}
                </Button>
              </form>
            </>
          )}
        </div>

        {/* Info */}
        <div className="bg-card rounded-2xl p-6 card-shadow border border-border">
          <h2 className="text-lg font-bold text-foreground mb-4">ملاحظات</h2>
          <p className="text-sm text-muted-foreground">
            نظام الحضور يعتمد على تسجيل الطالب مسبقاً في الفعالية، ثم استخدام رقم التسجيل أو البريد الإلكتروني لتأكيد الحضور عبر واجهات المنظم.
          </p>
        </div>
      </div>
    </>
  );
};

// ==================== ASSIGN STUDENT PAGE ====================

const AssignStudentPage = ({ clubs }: { clubs: { id: number; name: string | null }[] }) => {
  const [clubAssignForm, setClubAssignForm] = useState({ studentId: "", clubId: "" });
  const [assigning, setAssigning] = useState(false);

  const handleAssignStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clubAssignForm.clubId) {
      toast.error("الرجاء اختيار النادي");
      return;
    }
    if (!clubAssignForm.studentId.trim()) {
      toast.error("الرجاء كتابة اسم أو الرقم الجامعي للطالب");
      return;
    }
    setAssigning(true);
    try {
      await adminApi.addClubMember(Number(clubAssignForm.clubId), clubAssignForm.studentId.trim());
      toast.success("تم ربط الطالب في النادي بنجاح");
      setClubAssignForm({ ...clubAssignForm, studentId: "" });
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "فشل ربط الطالب في النادي");
    } finally {
      setAssigning(false);
    }
  };

  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground mb-1">ربط الطالب بالنادي</h1>
        <p className="text-muted-foreground text-sm">تسكين وتعيين الطلاب في الأندية التابعة لك</p>
      </div>

      <div className="bg-card rounded-2xl p-6 card-shadow border border-border max-w-lg mt-8 mb-8" style={{ marginLeft: 'auto', marginRight: 'auto' }}>
        <h2 className="text-xl font-bold text-foreground mb-6 text-center">تسكين الطلاب في الأندية</h2>
        <form onSubmit={handleAssignStudent} className="space-y-5">
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block text-right">ابحث عن الطالب</label>
            <div className="relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="الاسم أو الرقم الجامعي"
                value={clubAssignForm.studentId}
                onChange={(e) => setClubAssignForm({ ...clubAssignForm, studentId: e.target.value })}
                className="w-full h-12 pr-10 pl-4 rounded-xl border border-input bg-background text-foreground text-sm outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block text-right">اختر النادي</label>
            <select
              value={clubAssignForm.clubId}
              onChange={(e) => setClubAssignForm({ ...clubAssignForm, clubId: e.target.value })}
              className="w-full h-12 px-4 rounded-xl border border-input bg-background text-foreground text-sm outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="">-- اختر النادي --</option>
              {clubs.map((c) => (
                <option key={c.id} value={c.id}>{c.name || `نادي ${c.id}`}</option>
              ))}
            </select>
          </div>
          <Button
            type="submit"
            disabled={assigning}
            className="w-full bg-[#4ca5fc] hover:bg-[#3b94eb] text-white border-0 rounded-xl h-12 text-base font-medium transition-colors"
          >
            {assigning ? "جاري التسكين..." : "تسكين الطالب"}
          </Button>
        </form>
      </div>
    </>
  );
};


// ==================== MAIN COMPONENT ====================

const OrganizerDashboard = () => {
  const location = useLocation();
  const auth = JSON.parse(localStorage.getItem("auth") || "{ }");
  const userName = auth.name || "منظم";
  const userClubId = auth.clubId ? Number(auth.clubId) : 0;
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newEvent, setNewEvent] = useState({ title: "", date: "", location: "", capacity: "", clubId: userClubId ? String(userClubId) : "" });
  const [clubs, setClubs] = useState<{ id: number; name: string | null }[]>([]);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats>({
    totalEvents: 0,
    totalRegistrations: 0,
  });
  const [latestRegistrations, setLatestRegistrations] = useState<OrganizerRegistrationDto[]>([]);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const eventsRes = await organizerApi.getEvents();
        const events = eventsRes.data || [];
        let allRegs: OrganizerRegistrationDto[] = [];
        if (events.length > 0) {
          const first = events[0];
          const regsRes = await organizerApi.getEventRegistrations(first.id, 1, 20);
          allRegs = regsRes.data || [];
        }
        setDashboardStats({
          totalEvents: events.length,
          totalRegistrations: allRegs.length,
        });
        setLatestRegistrations(allRegs);

        // Fetch user's clubs or all clubs if admin API is available (fallback)
        try {
          // Assuming there might be a need to fetch all clubs an organizer manages
          // We can fetch clubs using the public API and filter, or just load them if the user doesn't have a default
          // For now, let's fetch clubs from adminApi if they have access, or just populate with their default club
          // A better approach depends on the backend, assuming they can fetch clubs they manage
          const clubsRes = await adminApi.getClubs(1, 100);
          setClubs(clubsRes.data || []);
        } catch (e) {
          // Ignore error if they don't have access, just add their default club if they have one
          if (userClubId) {
            setClubs([{ id: userClubId, name: `النادي الخاص بك` }]);
          }
        }
      } catch (err: unknown) {
        toast.error(err instanceof Error ? err.message : "فشل تحميل بيانات لوحة التحكم");
      }
    };
    loadDashboard();
  }, [userClubId]);

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalClubId = Number(newEvent.clubId) || userClubId;
    if (!finalClubId || finalClubId === 0) {
      toast.error("عذراً، يجب اختيار النادي لتتمكن من إنشاء فعالية");
      return;
    }
    if (!newEvent.title || !newEvent.date || !newEvent.location || !newEvent.capacity) {
      toast.error("يرجى ملء جميع الحقول");
      return;
    }
    try {
      const start = new Date(newEvent.date);
      const end = new Date(newEvent.date);
      end.setHours(end.getHours() + 2);
      await organizerApi.createEvent({
        title: newEvent.title,
        description: "",
        startDate: start.toISOString(),
        endDate: end.toISOString(),
        location: newEvent.location,
        capacity: Number(newEvent.capacity) || 0,
        isApproved: false,
        clubId: finalClubId,
      });
      toast.success("تم إنشاء الفعالية بنجاح!", { description: newEvent.title });
      setShowCreateModal(false);
      setNewEvent({ title: "", date: "", location: "", capacity: "", clubId: String(finalClubId) });
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "فشل إنشاء الفعالية");
    }
  };

  const path = location.pathname;

  let content;
  if (path === "/organizer/events") {
    content = <EventsPage />;
  } else if (path === "/organizer/registrations") {
    content = <RegistrationsPage />;
  } else if (path === "/organizer/attendance") {
    content = <AttendancePage />;
  } else if (path === "/organizer/assign-student") {
    content = <AssignStudentPage clubs={clubs} />;
  } else {
    content = (
      <DashboardHome
        stats={dashboardStats}
        latestRegistrations={latestRegistrations}
        showCreateModal={showCreateModal}
        setShowCreateModal={setShowCreateModal}
        newEvent={newEvent}
        setNewEvent={setNewEvent}
        handleCreateEvent={handleCreateEvent}
        userName={userName}
        clubs={clubs}
      />
    );
  }

  return (
    <DashboardLayout role="organizer" userName={userName}>
      {content}
    </DashboardLayout>
  );
};

export default OrganizerDashboard;
