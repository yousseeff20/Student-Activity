import { useState, useEffect } from "react";
import {
  Calendar, FileText, CheckCircle, Clock, XCircle, Star, BookOpen,
  Award, Target, User, Mail, Save, Lock, Eye, EyeOff, Loader2,
  ClipboardCheck, MapPin,
} from "lucide-react";
import EventsPage from "./Events";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import DashboardLayout from "@/components/DashboardLayout";
import { toast } from "sonner";
import {
  accountApi, studentApi, type StudentEventDto, type StudentActivityDto,
} from "@/lib/api";
import {
} from "@/lib/api";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { useTranslation } from "react-i18next";

function formatDate(dateStr: string) {
  try {
    return format(new Date(dateStr), "EEEE، d MMMM yyyy", { locale: ar });
  } catch {
    return dateStr;
  }
}

function formatShortDate(dateStr: string) {
  try {
    return format(new Date(dateStr), "yyyy/MM/dd", { locale: ar });
  } catch {
    return dateStr;
  }
}

function formatAttendanceStatus(
  statusData: unknown,
  t: (key: string) => string
): string {
  if (checkIsAttended(statusData)) {
    return t("dashboard.student.attended") || "حضر الفعالية";
  }
  return t("dashboard.student.pending") || "قيد الانتظار";
}

function checkIsAttended(statusData: unknown): boolean {
  if (!statusData) return false;

  // Unwrap ApiResponse if it exists
  let dataToCheck = statusData;
  if (typeof statusData === "object" && statusData !== null) {
    if ("data" in statusData) {
      dataToCheck = (statusData as any).data;
    }
  }

  if (typeof dataToCheck === "boolean") return dataToCheck;
  if (typeof dataToCheck === "string") {
    const str = dataToCheck.toLowerCase().trim();

    // Explicitly reject "pending" or "not attended" status logic
    if (str.includes("قيد") || str.includes("pending") || str.includes("not") || str.includes("لم ") || str.includes("false") || str.includes("مسجل")) {
      return false;
    }

    // Ensure we explicitly match exact attendance words
    return str === "true" || str === "attended" || str === "present" ||
      str.includes("حضر") || str.includes("الحاضر") || str === "1";
  }
  if (typeof dataToCheck === "number") return dataToCheck === 1;
  if (typeof dataToCheck === "object" && dataToCheck !== null) {
    return !!(dataToCheck as any).attended;
  }
  return false;
}

const achievements = [
  { icon: <Star className="w-5 h-5" />, title: "أول فعالية", desc: "سجلت في فعاليتك الأولى", minActivities: 1 },
  { icon: <BookOpen className="w-5 h-5" />, title: "متعلم نشط", desc: "سجلت في 3 فعاليات", minActivities: 3 },
  { icon: <Award className="w-5 h-5" />, title: "متميز", desc: "سجلت في 10 فعاليات", minActivities: 10 },
  { icon: <Target className="w-5 h-5" />, title: "قائد", desc: "سجلت في 20 فعالية", minActivities: 20 },
];

// ==================== DASHBOARD HOME ====================

const DashboardHome = ({ userName }: { userName: string }) => {
  const { t } = useTranslation();
  const [activities, setActivities] = useState<StudentActivityDto[]>([]);
  const [events, setEvents] = useState<StudentEventDto[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<StudentEventDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [attendanceStatuses, setAttendanceStatuses] = useState<Record<number, string>>({});

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [activitiesRes, eventsRes] = await Promise.all([
          studentApi.getMyActivities(),
          studentApi.getEvents({ pageSize: 50 }),
        ]);
        const acts = activitiesRes.data || [];
        const allEvts = eventsRes.data || [];
        const evts = allEvts.filter(e => e.isApproved);
        setActivities(acts);
        setEvents(evts);

        const now = new Date();
        setUpcomingEvents(
          evts.filter((e) => new Date(e.startDate) > now).slice(0, 3),
        );

        const statuses: Record<number, string> = {};
        await Promise.allSettled(
          acts.map(async (a) => {
            try {
              const res = await studentApi.getAttendanceStatus(a.eventId);
              if (res.data) statuses[a.eventId] = res.data;
            } catch {
              // ignore
            }
          }),
        );
        setAttendanceStatuses(statuses);
      } catch (err: unknown) {
        toast.error(err instanceof Error ? err.message : "فشل تحميل البيانات");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const getEventTitle = (eventId: number) => {
    return events.find((e) => e.id === eventId)?.title || `فعالية #${eventId}`;
  };

  const handleUnregister = async (eventId: number) => {
    try {
      await studentApi.unregisterFromEvent(eventId);
      setActivities((prev) => prev.filter((a) => a.eventId !== eventId));
      toast.success("تم إلغاء التسجيل بنجاح");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "فشل إلغاء التسجيل");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const totalActivities = activities.length;

  const stats = [
    { label: t("dashboard.student.registeredEvents"), value: String(totalActivities), icon: <Calendar className="w-5 h-5" />, color: "text-primary", bg: "bg-primary/10" },
    { label: t("dashboard.student.pendingEvents"), value: String(upcomingEvents.length), icon: <Clock className="w-5 h-5" />, color: "text-warning", bg: "bg-warning/10" },
  ];

  return (
    <>
      <div className="mb-8">
        <div className="bg-gradient-to-l from-primary/5 via-accent/5 to-transparent rounded-2xl p-6 border border-border">
          <h1 className="text-2xl font-bold text-foreground mb-1">{t("dashboard.student.welcome")}، {userName}</h1>
          <p className="text-muted-foreground text-sm">{t("dashboard.student.subtitle")}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-card rounded-2xl p-5 card-shadow border border-border hover:card-shadow-hover transition-all">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${stat.bg} ${stat.color}`}>{stat.icon}</div>
            <p className="text-2xl font-bold text-foreground">{stat.value}</p>
            <p className="text-sm text-muted-foreground">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2 bg-card rounded-2xl p-6 card-shadow border border-border">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-bold text-foreground">{t("dashboard.student.myRegistrations")}</h2>
            <Link to="/student/registrations">
              <Button variant="ghost" size="sm" className="text-primary text-xs">{t("dashboard.student.viewAll")}</Button>
            </Link>
          </div>
          <div className="space-y-3">
            {activities.slice(0, 5).map((act) => (
              <div key={act.id} className="flex items-center justify-between p-4 rounded-xl bg-secondary/50 hover:bg-secondary transition-colors group">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
                    <FileText className="w-5 h-5 text-primary-foreground" />
                  </div>
                  <div>
                    <Link to={`/events/${act.eventId}`} className="font-medium text-foreground text-sm hover:text-primary transition-colors">
                      {getEventTitle(act.eventId)}
                    </Link>
                    <p className="text-xs text-muted-foreground">{t("dashboard.student.registrationDate")}: {formatShortDate(act.registrationDate)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {attendanceStatuses[act.eventId] && checkIsAttended(attendanceStatuses[act.eventId]) && (
                    <span className="px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1.5 bg-success/10 text-success">
                      <ClipboardCheck className="w-3.5 h-3.5" />
                      {formatAttendanceStatus(attendanceStatuses[act.eventId], t)}
                    </span>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs text-destructive transition-opacity"
                    onClick={() => handleUnregister(act.eventId)}
                  >
                    {t("dashboard.student.cancel")}
                  </Button>
                </div>
              </div>
            ))}
            {activities.length === 0 && (
              <div className="text-center py-8">
                <FileText className="w-10 h-10 text-muted-foreground/30 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">{t("dashboard.student.noRegistrations")}</p>
                <Link to="/events">
                  <Button variant="ghost" size="sm" className="text-primary mt-2">{t("dashboard.student.browseEvents")}</Button>
                </Link>
              </div>
            )}
          </div>
        </div>

        <div className="bg-card rounded-2xl p-6 card-shadow border border-border">
          <h2 className="text-lg font-bold text-foreground mb-5">{t("dashboard.student.achievements")}</h2>
          <div className="space-y-3">
            {achievements.map((a, i) => {
              const earned = totalActivities >= a.minActivities;
              return (
                <div key={i} className={`flex items-center gap-3 p-3 rounded-xl transition-colors ${earned ? "bg-primary/5 border border-primary/10" : "bg-secondary/50 opacity-50"}`}>
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${earned ? "gradient-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>{a.icon}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">{a.title}</p>
                    <p className="text-xs text-muted-foreground">{a.desc}</p>
                  </div>
                  {earned && <CheckCircle className="w-4 h-4 text-success shrink-0" />}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="bg-card rounded-2xl p-6 card-shadow border border-border">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-foreground">{t("dashboard.student.upcomingEvent")}</h2>
          <Link to="/events"><Button variant="ghost" size="sm" className="text-primary text-xs">{t("dashboard.student.browseMore")}</Button></Link>
        </div>
        {upcomingEvents.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {upcomingEvents.map((event) => (
              <Link key={event.id} to={`/events/${event.id}`}>
                <div className="rounded-xl overflow-hidden border border-border hover:card-shadow-hover transition-all group p-4">
                  <p className="font-medium text-foreground text-sm mb-2">{event.title}</p>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {formatDate(event.startDate)}
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <MapPin className="w-3.5 h-3.5" />
                    {event.location}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Calendar className="w-10 h-10 text-muted-foreground/30 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">{t("dashboard.student.noUpcomingEvents")}</p>
          </div>
        )}
      </div>
    </>
  );
};

// ==================== REGISTRATIONS PAGE ====================

const RegistrationsPage = () => {
  const { t } = useTranslation();
  const [activities, setActivities] = useState<StudentActivityDto[]>([]);
  const [events, setEvents] = useState<StudentEventDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [attendanceStatuses, setAttendanceStatuses] = useState<Record<number, string>>({});

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [activitiesRes, eventsRes] = await Promise.all([
          studentApi.getMyActivities(),
          studentApi.getEvents({ pageSize: 100 }),
        ]);
        const acts = activitiesRes.data || [];
        const allEvts = eventsRes.data || [];
        const evts = allEvts.filter(e => e.isApproved);
        setActivities(acts);
        setEvents(evts);

        const statuses: Record<number, string> = {};
        await Promise.allSettled(
          acts.map(async (a) => {
            try {
              const res = await studentApi.getAttendanceStatus(a.eventId);
              if (res.data) statuses[a.eventId] = res.data;
            } catch {
              // ignore
            }
          }),
        );
        setAttendanceStatuses(statuses);
      } catch (err: unknown) {
        toast.error(err instanceof Error ? err.message : "فشل تحميل البيانات");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const getEventInfo = (eventId: number) => {
    return events.find((e) => e.id === eventId);
  };

  const handleUnregister = async (eventId: number) => {
    try {
      await studentApi.unregisterFromEvent(eventId);
      setActivities((prev) => prev.filter((a) => a.eventId !== eventId));
      toast.success("تم إلغاء التسجيل بنجاح");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "فشل إلغاء التسجيل");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground mb-1">{t("dashboard.student.myRegistrations")}</h1>
        <p className="text-muted-foreground text-sm">{t("dashboard.student.allRegisteredEvents")} ({activities.length})</p>
      </div>

      <div className="space-y-3">
        {activities.map((act) => {
          const eventInfo = getEventInfo(act.eventId);
          return (
            <div key={act.id} className="flex items-center justify-between p-5 rounded-2xl bg-card card-shadow border border-border hover:card-shadow-hover transition-all group">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl gradient-primary flex items-center justify-center">
                  <FileText className="w-5 h-5 text-primary-foreground" />
                </div>
                <div>
                  <Link to={`/events/${act.eventId}`} className="font-medium text-foreground hover:text-primary transition-colors">
                    {eventInfo?.title || `فعالية #${act.eventId}`}
                  </Link>
                  <p className="text-xs text-muted-foreground">{t("dashboard.student.registrationDate")}: {formatShortDate(act.registrationDate)}</p>
                  {eventInfo && (
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDate(eventInfo.startDate)}
                      </span>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {eventInfo.location}
                      </span>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {attendanceStatuses[act.eventId] && checkIsAttended(attendanceStatuses[act.eventId]) && (
                  <span className="px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 bg-success/10 text-success">
                    <ClipboardCheck className="w-3.5 h-3.5" />
                    {formatAttendanceStatus(attendanceStatuses[act.eventId], t)}
                  </span>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs text-destructive transition-opacity"
                  onClick={() => handleUnregister(act.eventId)}
                >
                  <XCircle className="w-4 h-4 ml-1" />
                  {t("dashboard.student.cancelRegistration")}
                </Button>
              </div>
            </div>
          );
        })}
        {activities.length === 0 && (
          <div className="text-center py-16">
            <FileText className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-lg font-medium text-foreground mb-1">{t("dashboard.student.noRegistrations")}</p>
            <p className="text-muted-foreground text-sm mb-4">{t("dashboard.student.browseAndRegister")}</p>
            <Link to="/events">
              <Button className="gradient-primary text-primary-foreground border-0 rounded-xl">
                {t("dashboard.student.browseEvents")}
              </Button>
            </Link>
          </div>
        )}
      </div>
    </>
  );
};

// ==================== PROFILE PAGE ====================

const ProfilePage = () => {
  const { t } = useTranslation();
  const auth = JSON.parse(localStorage.getItem("auth") || "{}");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState(auth.email || "");

  const [changingPassword, setChangingPassword] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      setLoading(true);
      try {
        const res = await accountApi.getProfile();
        const profile = res.data;
        setFirstName(profile.firstName || "");
        setLastName(profile.lastName || "");
        setEmail(profile.email || auth.email || "");
      } catch {
        const nameParts = (auth.name || "").split(" ");
        setFirstName(nameParts[0] || "");
        setLastName(nameParts.slice(1).join(" ") || "");
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, []);

  const handleSave = async () => {
    if (!firstName.trim() || !lastName.trim()) {
      toast.error("الاسم الأول واسم العائلة مطلوبين");
      return;
    }
    setSaving(true);
    try {
      await accountApi.updateProfile(firstName, lastName);
      const name = `${firstName} ${lastName}`.trim();
      localStorage.setItem("auth", JSON.stringify({ ...auth, name }));
      toast.success("تم تحديث البيانات بنجاح");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "فشل تحديث البيانات");
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (!passwordForm.currentPassword || !passwordForm.newPassword) {
      toast.error("اكتب كلمة المرور الحالية والجديدة");
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("كلمتا المرور الجديدة مش متطابقتين");
      return;
    }
    if (passwordForm.newPassword.length < 6 || !/[A-Z]/.test(passwordForm.newPassword) || !/[a-z]/.test(passwordForm.newPassword) || !/[0-9]/.test(passwordForm.newPassword) || !/[^A-Za-z0-9]/.test(passwordForm.newPassword)) {
      toast.error("كلمة المرور لازم تحتوي على حرف كبير + صغير + رقم + حرف خاص");
      return;
    }
    setPasswordLoading(true);
    try {
      await accountApi.changePassword(email, passwordForm.currentPassword, passwordForm.newPassword);
      toast.success("تم تغيير كلمة المرور بنجاح");
      setChangingPassword(false);
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "فشل تغيير كلمة المرور");
    } finally {
      setPasswordLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground mb-1">{t("dashboard.student.profile")}</h1>
        <p className="text-muted-foreground text-sm">{t("dashboard.student.profileDesc")}</p>
      </div>

      <div className="max-w-2xl space-y-6">
        <div className="bg-card rounded-2xl p-6 card-shadow border border-border">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-2xl">{firstName?.[0] || "?"}</span>
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">{firstName} {lastName}</h2>
              <p className="text-sm text-muted-foreground">{email}</p>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-primary/10 text-primary mt-1 inline-block">{t("dashboard.student.student")}</span>
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">{t("dashboard.student.firstName")}</label>
                <div className="relative">
                  <User className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} className="w-full h-11 pr-10 pl-4 rounded-xl border border-input bg-background text-foreground text-sm outline-none focus:ring-2 focus:ring-ring" />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">{t("dashboard.student.lastName")}</label>
                <div className="relative">
                  <User className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} className="w-full h-11 pr-10 pl-4 rounded-xl border border-input bg-background text-foreground text-sm outline-none focus:ring-2 focus:ring-ring" />
                </div>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">{t("dashboard.student.email")}</label>
              <div className="relative">
                <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input type="email" value={email} disabled className="w-full h-11 pr-10 pl-4 rounded-xl border border-input bg-muted text-muted-foreground text-sm outline-none cursor-not-allowed" />
              </div>
              <p className="text-[10px] text-muted-foreground mt-1">{t("dashboard.student.emailHint")}</p>
            </div>

            <Button onClick={handleSave} disabled={saving} className="gradient-primary text-primary-foreground border-0 rounded-xl h-11 px-6 gap-2">
              {saving ? <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
              {t("dashboard.student.saveChanges")}
            </Button>
          </div>
        </div>

        <div className="bg-card rounded-2xl p-6 card-shadow border border-border">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold text-foreground">{t("dashboard.student.changePassword")}</h2>
              <p className="text-xs text-muted-foreground mt-1">{t("dashboard.student.passwordHint")}</p>
            </div>
            {!changingPassword && (
              <Button variant="outline" size="sm" className="rounded-xl text-xs gap-1" onClick={() => setChangingPassword(true)}>
                <Lock className="w-3 h-3" /> {t("dashboard.student.change")}
              </Button>
            )}
          </div>

          {changingPassword && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">{t("dashboard.student.currentPassword")}</label>
                <div className="relative">
                  <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input type={showCurrentPassword ? "text" : "password"} value={passwordForm.currentPassword} onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })} className="w-full h-11 pr-10 pl-10 rounded-xl border border-input bg-background text-foreground text-sm outline-none focus:ring-2 focus:ring-ring" />
                  <button type="button" onClick={() => setShowCurrentPassword(!showCurrentPassword)} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                    {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">{t("dashboard.student.newPassword")}</label>
                <div className="relative">
                  <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input type={showNewPassword ? "text" : "password"} value={passwordForm.newPassword} onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })} className="w-full h-11 pr-10 pl-10 rounded-xl border border-input bg-background text-foreground text-sm outline-none focus:ring-2 focus:ring-ring" />
                  <button type="button" onClick={() => setShowNewPassword(!showNewPassword)} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-[10px] text-muted-foreground mt-1">{t("dashboard.student.passwordRules")}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">{t("dashboard.student.confirmPassword")}</label>
                <div className="relative">
                  <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input type="password" value={passwordForm.confirmPassword} onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })} className="w-full h-11 pr-10 pl-4 rounded-xl border border-input bg-background text-foreground text-sm outline-none focus:ring-2 focus:ring-ring" />
                </div>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleChangePassword} disabled={passwordLoading} className="gradient-primary text-primary-foreground border-0 rounded-xl h-10 px-5 text-sm gap-2">
                  {passwordLoading ? <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" /> : <Lock className="w-4 h-4" />}
                  {t("dashboard.student.changePasswordBtn")}
                </Button>
                <Button variant="outline" className="rounded-xl h-10 text-sm" onClick={() => { setChangingPassword(false); setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" }); }}>
                  {t("dashboard.student.cancel")}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

// ==================== MAIN COMPONENT ====================

const StudentDashboard = () => {
  const location = useLocation();
  const auth = JSON.parse(localStorage.getItem("auth") || "{}");
  const userName = auth.name || "مستخدم";
  const path = location.pathname;

  let content;
  if (path === "/student/profile") {
    content = <ProfilePage />;
  } else if (path === "/student/registrations") {
    content = <RegistrationsPage />;
  } else if (path === "/student/events") {
    content = <EventsPage hideLayout={true} />;
  } else {
    content = <DashboardHome userName={userName} />;
  }

  return (
    <DashboardLayout role="student" userName={userName}>
      {content}
    </DashboardLayout>
  );
};

export default StudentDashboard;
