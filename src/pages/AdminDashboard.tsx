import { useEffect, useState } from "react";
import { useLocation, Link } from "react-router-dom";
import { Users, Calendar, Search, Trash2, Settings, CheckCircle, XCircle, Building2, Plus, Download, Eye, EyeOff, Star, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import DashboardLayout from "@/components/DashboardLayout";
import { toast } from "sonner";
import { adminApi, type AdminEventDto, type AdminUserDto, type ClubDto } from "@/lib/api";
import * as XLSX from "xlsx";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useTranslation } from "react-i18next";

type RoleTab = "students" | "organizers" | "admins";

type UiUser = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  role: RoleTab;
  isActive: boolean;
  level?: number | null;
};

const fullName = (u: UiUser | AdminUserDto) =>
  `${u.firstName || ""} ${u.lastName || ""}`.trim() || "بدون اسم";

const normalizeUser = (raw: unknown, role: RoleTab): UiUser | null => {
  if (!raw || typeof raw !== "object") return null;
  const obj = raw as Record<string, unknown>;
  const id = String(obj.id ?? obj.userId ?? obj.email ?? "").trim();
  const email = String(obj.email ?? "").trim();
  if (!id || !email) return null;
  return {
    id,
    firstName: String(obj.firstName ?? ""),
    lastName: String(obj.lastName ?? ""),
    email,
    phoneNumber: String(obj.phoneNumber ?? ""),
    role,
    isActive: obj.isActive === undefined ? true : Boolean(obj.isActive),
    level: typeof obj.level === "number" ? obj.level : null,
  };
};

const FeedbackPage = ({ events }: { events: AdminEventDto[] }) => {
  const { t } = useTranslation();
  const [selectedEvent, setSelectedEvent] = useState<number | null>(null);
  const [feedbacks, setFeedbacks] = useState<unknown[]>([]);
  const [loading, setLoading] = useState(false);

  // Listen for new feedback notifications
  useEffect(() => {
    const handleNewFeedback = (event: any) => {
      console.log("=== Feedback Page: New Feedback Notification ===");
      console.log("Event:", event);
      console.log("Detail:", event.detail);

      // Show notification in feedback page
      toast.success("تقييم جديد!", {
        description: `تم استلام تقييم جديد للفعالية ${event.detail?.eventId || 'غير محدد'}`,
      });

      // If we're currently viewing this event, refresh the feedbacks
      if (selectedEvent && event.detail?.eventId === selectedEvent) {
        fetchFeedbacks(selectedEvent);
      }
    };

    // Listen to custom events
    window.addEventListener('newFeedback', handleNewFeedback);

    // Also listen to localStorage changes as backup
    const storageHandler = (e: StorageEvent) => {
      if (e.key === 'newFeedback') {
        try {
          const feedbackData = JSON.parse(e.newValue || '{}');
          handleNewFeedback({ detail: feedbackData });
        } catch (error) {
          console.error('Error parsing feedback data:', error);
        }
      }
    };

    window.addEventListener('storage', storageHandler);

    return () => {
      window.removeEventListener('newFeedback', handleNewFeedback);
      window.removeEventListener('storage', storageHandler);
    };
  }, [selectedEvent]);

  const fetchFeedbacks = async (eventId: number) => {
    setLoading(true);
    try {
      const res = await adminApi.getEventFeedback(eventId);
      // Handle both wrapped and raw array responses
      const data = Array.isArray(res) ? res : (res.data || []);
      console.log("[AdminDashboard] Fetched Feedbacks raw data:", res);
      console.log("[AdminDashboard] Fetched Feedbacks processed data:", data);
      setFeedbacks(data);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "فشل تحميل التقييمات");
      setFeedbacks([]);
    } finally {
      setLoading(false);
    }
  };

  const handleEventChange = (eventId: string) => {
    const id = parseInt(eventId);
    setSelectedEvent(id);
    if (id) {
      fetchFeedbacks(id);
    } else {
      setFeedbacks([]);
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
      />
    ));
  };

  const calculateAverageRating = () => {
    if (!feedbacks.length) return 0;
    const ratings = feedbacks.map((f: any) => f.rating || 0).filter((r: number) => r > 0);
    if (!ratings.length) return 0;
    return (ratings.reduce((sum: number, r: number) => sum + r, 0) / ratings.length).toFixed(1);
  };

  return (
    <>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground mb-1">تقييمات الفعاليات</h1>
        <p className="text-sm text-muted-foreground">عرض وتحليل تقييمات الطلاب للفعاليات</p>
      </div>

      <div className="bg-card rounded-2xl p-6 card-shadow border border-border mb-6">
        <div className="mb-6">
          <label className="block text-sm font-medium text-foreground mb-2">اختر الفعالية</label>
          <select
            value={selectedEvent || ""}
            onChange={(e) => handleEventChange(e.target.value)}
            className="w-full md:w-96 px-4 py-2 rounded-xl border border-input bg-background text-foreground focus:ring-2 focus:ring-ring transition-all"
          >
            <option value="">-- اختر فعالية --</option>
            {events.map((event) => (
              <option key={event.id} value={event.id}>
                {event.title}
              </option>
            ))}
          </select>
        </div>

        {selectedEvent && (
          <div className="mb-6 p-4 bg-secondary/50 rounded-xl">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-muted-foreground">متوسط التقييم</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-2xl font-bold text-foreground">{calculateAverageRating()}</span>
                  <div className="flex">{renderStars(Math.round(Number(calculateAverageRating())))}</div>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">عدد التقييمات</p>
                <p className="text-xl font-semibold text-foreground">{feedbacks.length}</p>
              </div>
            </div>

            {/* Rating Distribution */}
            {feedbacks.length > 0 && (
              <div className="mt-4 pt-4 border-t border-border">
                <p className="text-sm text-muted-foreground mb-2">توزيع التقييمات</p>
                <div className="space-y-1">
                  {[5, 4, 3, 2, 1].map((star) => {
                    const count = feedbacks.filter((f: any) => f.rating === star).length;
                    const percentage = feedbacks.length > 0 ? (count / feedbacks.length) * 100 : 0;
                    return (
                      <div key={star} className="flex items-center gap-2">
                        <div className="flex items-center gap-1 w-12">
                          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                          <span className="text-xs">{star}</span>
                        </div>
                        <div className="flex-1 bg-muted rounded-full h-2 overflow-hidden">
                          <div
                            className="bg-yellow-400 h-full transition-all duration-300"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <span className="text-xs text-muted-foreground w-8 text-right">{count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
          </div>
        ) : feedbacks.length > 0 ? (
          <div className="space-y-4">
            {feedbacks.map((feedback: any, index: number) => (
              <div key={index} className="p-4 border border-border rounded-xl hover:bg-secondary/20 transition-colors">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <User className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">
                          {feedback.studentName || feedback.userName || feedback.student || `${feedback.firstName || ''} ${feedback.lastName || ''}`.trim() || "طالب"}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {feedback.studentEmail || (typeof feedback.student === 'string' && feedback.student.includes('@') ? feedback.student : feedback.email) || ""}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex">{renderStars(feedback.rating || 0)}</div>
                    <span className="text-sm font-medium text-foreground ml-2">
                      {feedback.rating || 0}/5
                    </span>
                  </div>
                </div>

                {feedback.comment && (
                  <div className="bg-secondary/30 rounded-lg p-3 mb-3">
                    <p className="text-sm text-foreground leading-relaxed">{feedback.comment}</p>
                  </div>
                )}

                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3 h-3" />
                    <span>
                      {feedback.createdAt
                        ? new Date(feedback.createdAt).toLocaleDateString("ar-EG", {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })
                        : new Date().toLocaleDateString("ar-EG")
                      }
                    </span>
                  </div>
                  {feedback.studentId && (
                    <span className="bg-primary/10 text-primary px-2 py-1 rounded-full text-xs">
                      ID: {feedback.studentId}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : selectedEvent ? (
          <div className="text-center py-12">
            <Star className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">لا توجد تقييمات لهذه الفعالية بعد</p>
          </div>
        ) : (
          <div className="text-center py-12">
            <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">اختر فعالية لعرض تقييماتها</p>
          </div>
        )}
      </div>
    </>
  );
};

const AdminHome = ({
  students,
  organizers,
  admins,
  events,
}: {
  students: UiUser[];
  organizers: UiUser[];
  admins: UiUser[];
  events: AdminEventDto[];
}) => {
  const { t } = useTranslation();
  const [feedbackStats, setFeedbackStats] = useState<{ totalRatings: number; averageRating: number }>({
    totalRatings: 0,
    averageRating: 0,
  });
  const [loadingFeedback, setLoadingFeedback] = useState(false);

  useEffect(() => {
    const fetchAllFeedbackStats = async () => {
      setLoadingFeedback(true);
      let totalRatings = 0;
      let totalSum = 0;

      try {
        // Only fetch feedback for first 10 events to improve performance
        const eventsToCheck = events.slice(0, 10);

        for (const event of eventsToCheck) {
          try {
            const res = await adminApi.getEventFeedback(event.id);
            // Handle both wrapped and raw array responses
            const feedbacks = Array.isArray(res) ? res : (res.data || []);
            if (Array.isArray(feedbacks)) {
              feedbacks.forEach((feedback: any) => {
                if (feedback.rating && feedback.rating > 0) {
                  totalRatings++;
                  totalSum += feedback.rating;
                }
              });
            }
          } catch {
            // Skip if feedback API fails for any event
          }
        }
      } catch (error) {
        console.error("Error fetching feedback stats:", error);
      }

      setFeedbackStats({
        totalRatings,
        averageRating: totalRatings > 0 ? Number((totalSum / totalRatings).toFixed(1)) : 0,
      });
      setLoadingFeedback(false);
    };

    // Only fetch feedback stats if there are events and after a delay to avoid blocking initial render
    if (events.length > 0) {
      const timer = setTimeout(fetchAllFeedbackStats, 1000);
      return () => clearTimeout(timer);
    }
  }, [events]);

  const approved = events.filter((e) => e.isApproved).length;
  const pending = events.length - approved;
  const stats = [
    { label: t("dashboard.admin.students"), value: students.length, icon: <Users className="w-5 h-5" />, color: "text-primary bg-primary/10" },
    { label: t("dashboard.admin.organizers"), value: organizers.length, icon: <Users className="w-5 h-5" />, color: "text-accent bg-accent/10" },
    { label: t("dashboard.admin.admins"), value: admins.length, icon: <Settings className="w-5 h-5" />, color: "text-warning bg-warning/10" },
    { label: t("dashboard.admin.pendingEvents"), value: pending, icon: <Calendar className="w-5 h-5" />, color: "text-destructive bg-destructive/10" },
  ];

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
      />
    ));
  };

  return (
    <>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground mb-1">{t("dashboard.admin.title")}</h1>
        <p className="text-sm text-muted-foreground">{t("dashboard.admin.subtitle")}</p>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map((s) => (
          <div key={s.label} className="bg-card rounded-2xl p-5 card-shadow border border-border">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${s.color}`}>{s.icon}</div>
            <p className="text-2xl font-bold text-foreground">{s.value}</p>
            <p className="text-sm text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Feedback Summary Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-card rounded-2xl p-6 card-shadow border border-border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-foreground">إحصائيات التقييمات</h3>
            <Star className="w-6 h-6 text-yellow-400" />
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">إجمالي التقييمات</span>
              <span className="text-2xl font-bold text-foreground">{feedbackStats.totalRatings}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">متوسط التقييم</span>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-foreground">{feedbackStats.averageRating}</span>
                <div className="flex">{renderStars(Math.round(feedbackStats.averageRating))}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-2xl p-6 card-shadow border border-border">
          <h3 className="text-lg font-bold text-foreground mb-4">إحصائيات الفعاليات</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">{t("dashboard.admin.totalEvents")}</span>
              <span className="text-2xl font-bold text-foreground">{events.length}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">{t("dashboard.admin.approved")}</span>
              <span className="text-2xl font-bold text-success">{approved}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">قيد الانتظار</span>
              <span className="text-2xl font-bold text-warning">{pending}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-card rounded-2xl p-6 card-shadow border border-border">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {t("dashboard.admin.totalEvents")}: <span className="text-foreground font-semibold">{events.length}</span> •
            {t("dashboard.admin.approved")}: <span className="text-success font-semibold">{approved}</span> •
            قيد الانتظار: <span className="text-warning font-semibold">{pending}</span> •
            إجمالي التقييمات: <span className="text-primary font-semibold">{feedbackStats.totalRatings}</span>
          </p>
          <Link to="/admin/feedback">
            <Button variant="outline" size="sm" className="rounded-xl">
              عرض جميع التقييمات
            </Button>
          </Link>
        </div>
      </div>
    </>
  );
};

const UsersPage = ({
  organizers,
  refreshAll,
}: {
  organizers: UiUser[];
  refreshAll: () => Promise<void>;
}) => {
  const [search, setSearch] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCreatePassword, setShowCreatePassword] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [userToDelete, setUserToDelete] = useState<UiUser | null>(null);
  const [createForm, setCreateForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });
  const [editForm, setEditForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
  });

  const current = organizers.filter((u) => fullName(u).includes(search) || u.email.includes(search));

  const confirmDelete = async () => {
    if (!userToDelete) return;
    setBusyId(userToDelete.id);
    try {
      await adminApi.deleteOrganizer(userToDelete.id);
      toast.success("تم حذف المستخدم");
      await refreshAll();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "فشل الحذف");
    } finally {
      setBusyId(null);
      setUserToDelete(null);
    }
  };

  const handleDelete = (u: UiUser) => {
    setUserToDelete(u);
  };

  const handleToggle = async (u: UiUser) => {
    setBusyId(u.id);
    try {
      await adminApi.toggleUserStatus(u.id);
      toast.success(u.isActive ? "تم تعطيل المستخدم" : "تم تفعيل المستخدم");
      await refreshAll();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "فشل تغيير الحالة");
    } finally {
      setBusyId(null);
    }
  };

  const openEditModal = (u: UiUser) => {
    setEditingUserId(u.id);
    setEditForm({
      firstName: u.firstName,
      lastName: u.lastName,
      email: u.email,
    });
    setShowEditModal(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUserId) return;
    const { firstName, lastName, email } = editForm;
    if (!firstName.trim() || !lastName.trim() || !email.trim()) {
      toast.error("املأ كل البيانات");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error("صيغة الإيميل غير صحيحة");
      return;
    }
    setBusyId(editingUserId);
    try {
      await adminApi.updateOrganizer(editingUserId, { firstName, lastName, email });
      toast.success("تم تحديث البيانات");
      setShowEditModal(false);
      setEditingUserId(null);
      await refreshAll();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "فشل التعديل");
    } finally {
      setBusyId(null);
    }
  };

  const handleCreateOrganizer = async (e: React.FormEvent) => {
    e.preventDefault();
    const { firstName, lastName, email, password } = createForm;
    if (!firstName.trim() || !lastName.trim() || !email.trim() || !password) {
      toast.error("املأ كل بيانات المنظم");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error("صيغة الإيميل غير صحيحة");
      return;
    }
    if (password.length < 6) {
      toast.error("كلمة المرور لازم تكون 6 أحرف على الأقل");
      return;
    }
    try {
      await adminApi.createOrganizer({
        firstName,
        lastName,
        email,
        password,
        role: "Organizer",
        level: 1,
      });
      toast.success("تم إنشاء الحساب");
      setCreateForm({ firstName: "", lastName: "", email: "", password: "" });
      setShowCreateModal(false);
      await refreshAll();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "فشل إنشاء الحساب");
    }
  };

  return (
    <>
      <div className="mb-6 flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground mb-1">إدارة المنظمين</h1>
          <p className="text-sm text-muted-foreground">إضافة/تعديل/حذف المنظمين فقط</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)} className="gradient-primary text-primary-foreground rounded-xl gap-2">
          <Plus className="w-4 h-4" /> إضافة منظم
        </Button>
      </div>

      <div className="flex items-center gap-2 bg-card rounded-xl border border-border px-4 mb-4">
        <Search className="w-4 h-4 text-muted-foreground" />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="بحث بالاسم أو الإيميل..." className="flex-1 h-10 bg-transparent outline-none text-sm" />
      </div>

      <div className="bg-card rounded-2xl card-shadow border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-secondary/30">
                <th className="text-right text-xs font-medium text-muted-foreground py-3 pr-4">المستخدم</th>
                <th className="text-right text-xs font-medium text-muted-foreground py-3">الإيميل</th>
                <th className="text-right text-xs font-medium text-muted-foreground py-3">الحالة</th>
                <th className="text-right text-xs font-medium text-muted-foreground py-3">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {current.map((u) => (
                <tr key={u.id} className="hover:bg-secondary/20">
                  <td className="py-3 pr-4 font-medium">{fullName(u)}</td>
                  <td className="py-3 text-sm text-muted-foreground">{u.email}</td>
                  <td className="py-3">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-medium ${u.isActive ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"}`}>
                      {u.isActive ? "نشط" : "غير نشط"}
                    </span>
                  </td>
                  <td className="py-3">
                    <div className="flex items-center gap-1">
                      <Button
                        disabled={busyId === u.id}
                        size="sm"
                        variant="ghost"
                        className="h-7 px-2 text-xs"
                        onClick={() => openEditModal(u)}
                        title="تعديل البيانات"
                        aria-label="تعديل البيانات"
                      >
                        <Settings className="w-3 h-3" />
                      </Button>
                      <Button
                        disabled={busyId === u.id}
                        size="sm"
                        variant="ghost"
                        className="h-7 px-2 text-xs"
                        onClick={() => handleToggle(u)}
                        title={u.isActive ? "تعطيل المستخدم" : "تفعيل المستخدم"}
                        aria-label={u.isActive ? "تعطيل المستخدم" : "تفعيل المستخدم"}
                      >
                        {u.isActive ? <XCircle className="w-3 h-3" /> : <CheckCircle className="w-3 h-3" />}
                      </Button>
                      <Button
                        disabled={busyId === u.id}
                        size="sm"
                        variant="ghost"
                        className="h-7 px-2 text-xs text-destructive"
                        onClick={() => handleDelete(u)}
                        title="حذف المستخدم"
                        aria-label="حذف المستخدم"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {current.length === 0 && <p className="text-center text-sm text-muted-foreground py-10">لا توجد بيانات</p>}
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-foreground/30 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleCreateOrganizer} className="w-full max-w-xl bg-card rounded-2xl p-6 card-shadow border border-border">
            <h2 className="text-xl font-bold text-foreground mb-1">إضافة منظم جديد</h2>
            <p className="text-sm text-muted-foreground mb-5">املأ البيانات وبعدين اضغط إضافة</p>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <input value={createForm.firstName} onChange={(e) => setCreateForm((p) => ({ ...p, firstName: e.target.value }))} placeholder="الاسم الأول" className="h-11 px-3 rounded-xl border border-input bg-background text-sm" />
              <input value={createForm.lastName} onChange={(e) => setCreateForm((p) => ({ ...p, lastName: e.target.value }))} placeholder="اسم العائلة" className="h-11 px-3 rounded-xl border border-input bg-background text-sm" />
            </div>
            <div className="space-y-3 mb-5">
              <input value={createForm.email} onChange={(e) => setCreateForm((p) => ({ ...p, email: e.target.value }))} placeholder="الإيميل" className="w-full h-11 px-3 rounded-xl border border-input bg-background text-sm" />
              <div className="relative">
                <input
                  type={showCreatePassword ? "text" : "password"}
                  value={createForm.password}
                  onChange={(e) => setCreateForm((p) => ({ ...p, password: e.target.value }))}
                  placeholder="كلمة المرور"
                  className="w-full h-11 px-3 pl-10 rounded-xl border border-input bg-background text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowCreatePassword((v) => !v)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  aria-label="إظهار أو إخفاء كلمة المرور"
                  title="إظهار أو إخفاء كلمة المرور"
                >
                  {showCreatePassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div className="flex gap-2">
              <Button type="submit" className="gradient-primary text-primary-foreground rounded-xl gap-2 flex-1">
                <Plus className="w-4 h-4" /> إضافة منظم
              </Button>
              <Button type="button" variant="outline" className="rounded-xl" onClick={() => setShowCreateModal(false)}>
                إلغاء
              </Button>
            </div>
          </form>
        </div>
      )}

      {showEditModal && (
        <div className="fixed inset-0 z-50 bg-foreground/30 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleEditSubmit} className="w-full max-w-xl bg-card rounded-2xl p-6 card-shadow border border-border">
            <h2 className="text-xl font-bold text-foreground mb-1">تعديل بيانات المنظم</h2>
            <p className="text-sm text-muted-foreground mb-5">عدّل البيانات وبعدين اضغط حفظ</p>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <input value={editForm.firstName} onChange={(e) => setEditForm((p) => ({ ...p, firstName: e.target.value }))} placeholder="الاسم الأول" className="h-11 px-3 rounded-xl border border-input bg-background text-sm" />
              <input value={editForm.lastName} onChange={(e) => setEditForm((p) => ({ ...p, lastName: e.target.value }))} placeholder="اسم العائلة" className="h-11 px-3 rounded-xl border border-input bg-background text-sm" />
            </div>
            <div className="space-y-3 mb-5">
              <input value={editForm.email} onChange={(e) => setEditForm((p) => ({ ...p, email: e.target.value }))} placeholder="الإيميل" className="w-full h-11 px-3 rounded-xl border border-input bg-background text-sm" />
            </div>
            <div className="flex gap-2">
              <Button type="submit" className="gradient-primary text-primary-foreground rounded-xl gap-2 flex-1">
                حفظ التعديلات
              </Button>
              <Button type="button" variant="outline" className="rounded-xl" onClick={() => setShowEditModal(false)}>
                إلغاء
              </Button>
            </div>
          </form>
        </div>
      )}

      {userToDelete && (
        <div className="fixed inset-0 z-50 bg-foreground/30 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-card rounded-2xl p-6 card-shadow border border-border text-center">
            <h3 className="text-lg font-bold text-foreground mb-6">هل تريد حذف هذا العنصر بالفعل؟</h3>
            <div className="flex gap-3">
              <Button onClick={confirmDelete} className="flex-1 bg-destructive hover:bg-destructive/90 text-destructive-foreground rounded-xl">نعم، حذف</Button>
              <Button onClick={() => setUserToDelete(null)} variant="outline" className="flex-1 rounded-xl">إلغاء</Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

const EventsManagementPage = ({
  events,
  refreshAll,
}: {
  events: AdminEventDto[];
  refreshAll: () => Promise<void>;
}) => {
  const [search, setSearch] = useState("");
  const [busyId, setBusyId] = useState<number | null>(null);
  const filtered = events.filter((e) => e.title.includes(search) || e.location.includes(search));

  const onAction = async (id: number, type: "approve" | "reject") => {
    setBusyId(id);
    try {
      if (type === "approve") await adminApi.approveEvent(id);
      else await adminApi.rejectEvent(id);
      toast.success(type === "approve" ? "تم اعتماد الفعالية" : "تم رفض الفعالية");
      await refreshAll();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "فشلت العملية");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground mb-1">إدارة الفعاليات</h1>
        <p className="text-sm text-muted-foreground">إدارة واعتماد أو رفض الفعاليات</p>
      </div>
      <div className="flex items-center gap-2 bg-card rounded-xl border border-border px-4 mb-4">
        <Search className="w-4 h-4 text-muted-foreground" />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="ابحث عن فعالية..." className="flex-1 h-10 bg-transparent outline-none text-sm" />
      </div>
      <div className="space-y-3">
        {filtered.map((e) => (
          <div key={e.id} className="bg-card rounded-2xl p-4 card-shadow border border-border">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="font-semibold">{e.title}</p>
                <p className="text-xs text-muted-foreground">{e.location} • {new Date(e.startDate).toLocaleDateString("ar-EG")}</p>
              </div>
              <span className={`px-2.5 py-1 rounded-full text-[10px] font-medium ${e.isApproved ? "bg-success/10 text-success" : "bg-warning/10 text-warning"}`}>
                {e.isApproved ? "معتمد" : "قيد المراجعة"}
              </span>
            </div>
            {!e.isApproved && (
              <div className="flex gap-2 mt-3">
                <Button disabled={busyId === e.id} size="sm" className="rounded-lg h-8 text-xs gradient-primary text-primary-foreground" onClick={() => onAction(e.id, "approve")}>اعتماد</Button>
                <Button disabled={busyId === e.id} size="sm" variant="outline" className="rounded-lg h-8 text-xs" onClick={() => onAction(e.id, "reject")}>رفض</Button>
              </div>
            )}
          </div>
        ))}
        {filtered.length === 0 && <p className="text-center text-sm text-muted-foreground py-10">لا توجد فعاليات</p>}
      </div>
    </>
  );
};

const ClubsPage = ({
  clubsData,
  organizers,
  refreshAll,
}: {
  clubsData: ClubDto[];
  organizers: UiUser[];
  refreshAll: () => Promise<void>;
}) => {
  const [busyClub, setBusyClub] = useState<number | null>(null);
  const [showCreateClubModal, setShowCreateClubModal] = useState(false);
  const [showEditClubModal, setShowEditClubModal] = useState(false);
  const [editingClubId, setEditingClubId] = useState<number | null>(null);
  const [clubToDelete, setClubToDelete] = useState<ClubDto | null>(null);
  const [newClubName, setNewClubName] = useState("");
  const [newClubDescription, setNewClubDescription] = useState("");
  const [newClubOrganizerId, setNewClubOrganizerId] = useState("");
  const [editClubName, setEditClubName] = useState("");
  const [editClubDescription, setEditClubDescription] = useState("");
  const [editClubOrganizerId, setEditClubOrganizerId] = useState("");

  const organizerNameById = (id?: string | null) => {
    if (!id) return "-";
    const found = organizers.find((o) => o.id === id);
    return found ? fullName(found) : id;
  };

  const openEditClubModal = async (club: ClubDto) => {
    setEditingClubId(club.id);
    setEditClubName(club.name || "");
    setEditClubDescription(club.description || "");
    setEditClubOrganizerId(club.organizerId || "");
    setShowEditClubModal(true);
  };

  const confirmDeleteClub = async () => {
    if (!clubToDelete) return;
    setBusyClub(clubToDelete.id);
    try {
      await adminApi.deleteClub(clubToDelete.id);
      toast.success("تم حذف النادي");
      await refreshAll();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "فشل حذف النادي");
    } finally {
      setBusyClub(null);
      setClubToDelete(null);
    }
  };

  const handleDeleteClub = (club: ClubDto) => {
    setClubToDelete(club);
  };

  return (
    <>
      <div className="mb-6 flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground mb-1">إدارة الأندية</h1>
          <p className="text-sm text-muted-foreground">إدارة بيانات الأندية</p>
        </div>
        <Button onClick={() => setShowCreateClubModal(true)} className="gradient-primary text-primary-foreground rounded-xl gap-2">
          <Plus className="w-4 h-4" /> إضافة نادي
        </Button>
      </div>
      {clubsData.length === 0 ? (
        <div className="bg-card rounded-2xl p-10 card-shadow border border-border text-center">
          <Building2 className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-foreground mb-1">لا توجد أندية حالياً</h3>
          <p className="text-sm text-muted-foreground mb-4">البيانات دي جاية من API مباشرة، ولسه مفيش أندية متسجلة.</p>
          <Button onClick={() => setShowCreateClubModal(true)} className="gradient-primary text-primary-foreground rounded-xl gap-2">
            <Plus className="w-4 h-4" /> إضافة أول نادي
          </Button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {clubsData.map((club) => (
            <div key={club.id} className="bg-card rounded-2xl p-5 card-shadow border border-border">
              <div className="flex items-center gap-2 mb-2">
                <Building2 className="w-4 h-4 text-primary" />
                <h3 className="font-bold">{club.name || "بدون اسم"}</h3>
              </div>
              <p className="text-xs text-muted-foreground mb-2">{club.description || "لا يوجد وصف"}</p>
              <p className="text-[11px] text-muted-foreground mb-4">المنظم: {organizerNameById(club.organizerId)}</p>
              <div className="flex gap-2">
                <Button variant="outline" className="rounded-xl h-9 text-xs flex-1" onClick={() => openEditClubModal(club)}>
                  <Settings className="w-3 h-3 ml-1" /> تعديل
                </Button>
                <Button variant="outline" className="rounded-xl h-9 text-sm text-destructive border-destructive/30 flex-1" onClick={() => handleDeleteClub(club)}>
                  <Trash2 className="w-3.5 h-3.5 ml-1" /> حذف
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showCreateClubModal && (
        <div className="fixed inset-0 z-50 bg-foreground/30 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!newClubName.trim() || !newClubDescription.trim()) {
                toast.error("املأ اسم ووصف النادي");
                return;
              }
              (async () => {
                try {
                  await adminApi.createClub({
                    name: newClubName,
                    description: newClubDescription,
                    organizerId: newClubOrganizerId.trim() || undefined,
                  });
                  toast.success("تم إضافة النادي");
                  setShowCreateClubModal(false);
                  setNewClubName("");
                  setNewClubDescription("");
                  setNewClubOrganizerId("");
                  await refreshAll();
                } catch (err: unknown) {
                  toast.error(err instanceof Error ? err.message : "فشل إضافة النادي");
                }
              })();
            }}
            className="w-full max-w-xl bg-card rounded-2xl p-6 card-shadow border border-border"
          >
            <h2 className="text-xl font-bold text-foreground mb-1">إضافة نادي جديد</h2>
            <p className="text-sm text-muted-foreground mb-5">املأ بيانات النادي</p>
            <div className="space-y-3 mb-5">
              <input value={newClubName} onChange={(e) => setNewClubName(e.target.value)} placeholder="اسم النادي" className="w-full h-11 px-3 rounded-xl border border-input bg-background text-sm" />
              <textarea value={newClubDescription} onChange={(e) => setNewClubDescription(e.target.value)} placeholder="وصف النادي" className="w-full min-h-[100px] p-3 rounded-xl border border-input bg-background text-sm outline-none" />
              <select
                value={newClubOrganizerId}
                onChange={(e) => setNewClubOrganizerId(e.target.value)}
                className="w-full h-11 px-3 rounded-xl border border-input bg-background text-sm"
              >
                <option value="">اختيار منظم (اختياري)</option>
                {organizers.map((org) => (
                  <option key={org.id} value={org.id}>
                    {fullName(org)} - {org.email}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex gap-2">
              <Button type="submit" className="gradient-primary text-primary-foreground rounded-xl gap-2 flex-1">حفظ النادي</Button>
              <Button type="button" variant="outline" className="rounded-xl" onClick={() => setShowCreateClubModal(false)}>إلغاء</Button>
            </div>
          </form>
        </div>
      )}

      {showEditClubModal && editingClubId !== null && (
        <div className="fixed inset-0 z-50 bg-foreground/30 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!editClubName.trim() || !editClubDescription.trim()) {
                toast.error("املأ اسم ووصف النادي");
                return;
              }
              (async () => {
                try {
                  await adminApi.updateClub(editingClubId, {
                    name: editClubName,
                    description: editClubDescription,
                    organizerId: editClubOrganizerId.trim() || undefined,
                  });
                  toast.success("تم تعديل النادي");
                  setShowEditClubModal(false);
                  setEditingClubId(null);
                  await refreshAll();
                } catch (err: unknown) {
                  toast.error(err instanceof Error ? err.message : "فشل تعديل النادي");
                }
              })();
            }}
            className="w-full max-w-xl bg-card rounded-2xl p-6 card-shadow border border-border"
          >
            <h2 className="text-xl font-bold text-foreground mb-1">تعديل بيانات النادي</h2>
            <p className="text-sm text-muted-foreground mb-5">تقدر تعدل اسم النادي والوصف والمنظم</p>
            <div className="space-y-3 mb-5">
              <input value={editClubName} onChange={(e) => setEditClubName(e.target.value)} placeholder="اسم النادي" className="w-full h-11 px-3 rounded-xl border border-input bg-background text-sm" />
              <textarea value={editClubDescription} onChange={(e) => setEditClubDescription(e.target.value)} placeholder="وصف النادي" className="w-full min-h-[100px] p-3 rounded-xl border border-input bg-background text-sm outline-none" />
              <select
                value={editClubOrganizerId}
                onChange={(e) => setEditClubOrganizerId(e.target.value)}
                className="w-full h-11 px-3 rounded-xl border border-input bg-background text-sm"
              >
                <option value="">اختيار منظم (اختياري)</option>
                {organizers.map((org) => (
                  <option key={org.id} value={org.id}>
                    {fullName(org)} - {org.email}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex gap-2">
              <Button type="submit" className="gradient-primary text-primary-foreground rounded-xl gap-2 flex-1">
                حفظ التعديلات
              </Button>
              <Button type="button" variant="outline" className="rounded-xl" onClick={() => setShowEditClubModal(false)}>
                إلغاء
              </Button>
            </div>
          </form>
        </div>
      )}

      {clubToDelete && (
        <div className="fixed inset-0 z-50 bg-foreground/30 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-card rounded-2xl p-6 card-shadow border border-border text-center">
            <h3 className="text-lg font-bold text-foreground mb-6">هل تريد حذف هذا العنصر بالفعل؟</h3>
            <div className="flex gap-3">
              <Button onClick={confirmDeleteClub} className="flex-1 bg-destructive hover:bg-destructive/90 text-destructive-foreground rounded-xl">نعم، حذف</Button>
              <Button onClick={() => setClubToDelete(null)} variant="outline" className="flex-1 rounded-xl">إلغاء</Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

const ReportsPage = ({ reportsData, eventsData }: { reportsData: unknown; eventsData: AdminEventDto[] }) => {
  const [range, setRange] = useState<"all" | "week" | "month">("all");

  const flattenNumeric = (obj: unknown, prefix = ""): Array<{ key: string; value: number }> => {
    if (!obj || typeof obj !== "object") return [];
    const out: Array<{ key: string; value: number }> = [];
    const entries = Object.entries(obj as Record<string, unknown>);
    for (const [k, v] of entries) {
      const newKey = prefix ? `${prefix}.${k}` : k;
      if (typeof v === "number" && Number.isFinite(v)) {
        out.push({ key: newKey, value: v });
      } else if (typeof v === "string" && v.trim() !== "" && !Number.isNaN(Number(v))) {
        out.push({ key: newKey, value: Number(v) });
      } else if (v && typeof v === "object" && !Array.isArray(v)) {
        out.push(...flattenNumeric(v, newKey));
      }
    }
    return out;
  };

  const now = new Date();
  const rangeStart = new Date();
  if (range === "week") rangeStart.setDate(now.getDate() - 7);
  if (range === "month") rangeStart.setMonth(now.getMonth() - 1);

  const filteredEvents =
    range === "all"
      ? eventsData
      : eventsData.filter((e) => {
        const d = new Date(e.startDate);
        return d >= rangeStart && d <= now;
      });

  const formatMetricName = (key: string) => {
    const map: Record<string, string> = {
      "events.filtered_total": "إجمالي الفعاليات",
      "events.filtered_approved": "الفعاليات المعتمدة",
      "events.filtered_pending": "الفعاليات قيد المراجعة",
      "events.total": "مجموع الفعاليات",
      "events.approved": "الفعاليات المعتمدة الكلية",
      "events.pending": "الفعاليات المعلقة",
      "events.rejected": "الفعاليات المرفوضة",
      "users.total": "إجمالي المستخدمين",
      "users.students": "إجمالي الطلاب",
      "users.organizers": "إجمالي المنظمين",
      "users.admins": "إجمالي المشرفين",
      "users.active": "المستخدمين النشطين",
      "clubs.total": "إجمالي الأندية",
      "no_data": "لا توجد بيانات",
    };
    if (map[key]) return map[key];
    return key.replace(/_/g, " ").replace(/\./g, " - ").replace(/\b\w/g, l => l.toUpperCase());
  };

  const metrics = flattenNumeric(reportsData);
  const derivedMetrics = [
    { key: "events.filtered_total", value: filteredEvents.length },
    { key: "events.filtered_approved", value: filteredEvents.filter((e) => e.isApproved).length },
    { key: "events.filtered_pending", value: filteredEvents.filter((e) => !e.isApproved).length },
  ];
  const allMetrics = [...derivedMetrics, ...metrics];
  const chartData = allMetrics.slice(0, 10).map((m) => ({ name: formatMetricName(m.key), value: m.value }));

  const downloadExcel = () => {
    if (!reportsData || typeof reportsData !== "object") {
      toast.error("لا توجد بيانات كافية لتنزيل Excel");
      return;
    }
    const wb = XLSX.utils.book_new();
    const metricsSheetData = allMetrics.length > 0
      ? allMetrics.map((m) => ({ المؤشر: formatMetricName(m.key), القيمة: m.value }))
      : [{ المؤشر: formatMetricName("no_data"), القيمة: "" }];
    const wsMetrics = XLSX.utils.json_to_sheet(metricsSheetData);
    XLSX.utils.book_append_sheet(wb, wsMetrics, "Metrics");

    const rawRows = Object.entries((reportsData as Record<string, unknown>) ?? {}).map(([key, val]) => ({
      key,
      value: typeof val === "object" ? JSON.stringify(val) : String(val ?? ""),
    }));
    const wsRaw = XLSX.utils.json_to_sheet(rawRows.length > 0 ? rawRows : [{ key: "empty", value: "" }]);
    XLSX.utils.book_append_sheet(wb, wsRaw, "RawData");

    XLSX.writeFile(wb, "admin-reports.xlsx");
  };

  const downloadPdf = () => {
    if (!reportsData || typeof reportsData !== "object") {
      toast.error("لا توجد بيانات كافية لتنزيل PDF");
      return;
    }
    const doc = new jsPDF({ orientation: "p", unit: "pt", format: "a4" });
    doc.setFontSize(14);
    doc.text("Admin Reports", 40, 40);
    doc.setFontSize(10);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 40, 58);

    const tableBody = (allMetrics.length > 0 ? allMetrics : [{ key: "no_data", value: 0 }]).map((m) => [formatMetricName(m.key), String(m.value)]);
    autoTable(doc, {
      startY: 80,
      head: [["Metric", "Value"]],
      body: tableBody,
      styles: { fontSize: 9 },
      headStyles: { fillColor: [41, 128, 185] },
    });

    const rawText = JSON.stringify(reportsData ?? {}, null, 2).slice(0, 2500);
    const y = (doc as unknown as { lastAutoTable?: { finalY?: number } }).lastAutoTable?.finalY ?? 120;
    doc.setFontSize(9);
    doc.text("Raw JSON (truncated):", 40, y + 24);
    doc.text(rawText, 40, y + 40, { maxWidth: 520 });

    doc.save("admin-reports.pdf");
  };

  return (
    <>
      <div className="mb-6 flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground mb-1">التقارير الشاملة</h1>
          <p className="text-sm text-muted-foreground">بيانات حقيقية من API التقارير</p>
        </div>
        <div className="flex gap-2 items-center">
          <select
            value={range}
            onChange={(e) => setRange(e.target.value as "all" | "week" | "month")}
            className="h-10 px-3 rounded-xl border border-input bg-card text-sm text-foreground"
            title="اختر الفترة"
          >
            <option value="all">كل الفعاليات</option>
            <option value="week">خلال أسبوع</option>
            <option value="month">خلال شهر</option>
          </select>
          <Button variant="outline" className="rounded-xl gap-2" onClick={downloadExcel}>
            <Download className="w-4 h-4" /> Excel
          </Button>
          <Button className="rounded-xl gap-2 gradient-primary text-primary-foreground" onClick={downloadPdf}>
            <Download className="w-4 h-4" /> PDF
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-4 mb-4">
        <div className="bg-card rounded-2xl p-4 card-shadow border border-border">
          <p className="text-sm text-muted-foreground mb-3">ملخص المؤشرات</p>
          <div className="grid grid-cols-2 gap-2">
            {(allMetrics.length > 0 ? allMetrics.slice(0, 6) : [{ key: "no_data", value: 0 }]).map((m, idx) => (
              <div key={`${m.key}-${idx}`} className="rounded-xl border border-border p-3">
                <p className="text-[11px] text-muted-foreground truncate" title={formatMetricName(m.key)}>{formatMetricName(m.key)}</p>
                <p className="text-lg font-bold">{m.value}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-card rounded-2xl p-4 card-shadow border border-border">
          <p className="text-sm text-muted-foreground mb-3">رسم بياني للمؤشرات</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} hide />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip />
              <Bar dataKey="value" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-card rounded-2xl p-6 card-shadow border border-border overflow-auto">
        <p className="text-sm text-muted-foreground mb-2">ملخص الفعاليات حسب الفترة المختارة</p>
        <div className="grid sm:grid-cols-3 gap-3">
          <div className="rounded-xl border border-border p-4">
            <p className="text-xs text-muted-foreground">إجمالي الفعاليات</p>
            <p className="text-2xl font-bold">{filteredEvents.length}</p>
          </div>
          <div className="rounded-xl border border-border p-4">
            <p className="text-xs text-muted-foreground">فعاليات معتمدة</p>
            <p className="text-2xl font-bold text-success">{filteredEvents.filter((e) => e.isApproved).length}</p>
          </div>
          <div className="rounded-xl border border-border p-4">
            <p className="text-xs text-muted-foreground">فعاليات قيد المراجعة</p>
            <p className="text-2xl font-bold text-warning">{filteredEvents.filter((e) => !e.isApproved).length}</p>
          </div>
        </div>
      </div>
    </>
  );
};

const AdminDashboard = () => {
  const location = useLocation();
  const path = location.pathname;
  const auth = JSON.parse(localStorage.getItem("auth") || "{}");
  const userName = auth.name || "المشرف";

  const [students, setStudents] = useState<UiUser[]>([]);
  const [organizers, setOrganizers] = useState<UiUser[]>([]);
  const [admins, setAdmins] = useState<UiUser[]>([]);
  const [events, setEvents] = useState<AdminEventDto[]>([]);
  const [clubsData, setClubsData] = useState<ClubDto[]>([]);
  const [reportsData, setReportsData] = useState<unknown>(null);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      // Fetch essential data first, then load additional data
      const [organizersRes, studentsRes, adminsRes, eventsRes] = await Promise.all([
        adminApi.getOrganizers(),
        adminApi.getStudents(1, 50), // Reduced from 100
        adminApi.getAdmins(),
        adminApi.getEvents(1, 50), // Reduced from 100
      ]);

      const mappedOrganizers = (organizersRes.data || [])
        .map((u) => normalizeUser(u, "organizers"))
        .filter(Boolean) as UiUser[];

      const rawStudents = studentsRes.data || [];
      const studentObjects: unknown[] = [];
      const studentIds = rawStudents.filter((s) => typeof s === "string") as string[];
      const directStudents = rawStudents.filter((s) => typeof s === "object");
      studentObjects.push(...directStudents);
      if (studentIds.length > 0) {
        const detailResults = await Promise.allSettled(studentIds.map((id) => adminApi.getStudentById(id)));
        detailResults.forEach((r) => {
          if (r.status === "fulfilled") studentObjects.push(r.value.data);
        });
      }
      const mappedStudents = studentObjects
        .map((u) => normalizeUser(u, "students"))
        .filter(Boolean) as UiUser[];

      const mappedAdmins = (adminsRes.data || [])
        .map((u) => {
          if (typeof u === "string") {
            return {
              id: u,
              firstName: "",
              lastName: "",
              email: u,
              role: "admins" as const,
              isActive: true,
              level: null,
            };
          }
          return normalizeUser(u, "admins");
        })
        .filter(Boolean) as UiUser[];

      setOrganizers(mappedOrganizers);
      setStudents(mappedStudents);
      setAdmins(mappedAdmins);
      setEvents(eventsRes.data || []);

      // Load additional data in background after initial render
      setTimeout(async () => {
        try {
          const [reportsRes, clubsRes] = await Promise.all([
            adminApi.getReports(),
            adminApi.getClubs(1, 100), // Reduced from 200
          ]);
          setReportsData(reportsRes.data ?? null);
          setClubsData(clubsRes.data || []);
        } catch (error) {
          console.error("Error loading additional data:", error);
        }
      }, 500);

    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "فشل تحميل بيانات الأدمن");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading) {
    return (
      <DashboardLayout role="admin" userName={userName}>
        <div className="flex items-center justify-center py-24">
          <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  let content;
  if (path === "/admin/users") {
    content = <UsersPage organizers={organizers} refreshAll={loadData} />;
  } else if (path === "/admin/events") {
    content = <EventsManagementPage events={events} refreshAll={loadData} />;
  } else if (path === "/admin/clubs") {
    content = <ClubsPage clubsData={clubsData} organizers={organizers} refreshAll={loadData} />;
  } else if (path === "/admin/reports") {
    content = <ReportsPage reportsData={reportsData} eventsData={events} />;
  } else if (path === "/admin/feedback") {
    content = <FeedbackPage events={events} />;
  } else {
    content = <AdminHome students={students} organizers={organizers} admins={admins} events={events} />;
  }

  return <DashboardLayout role="admin" userName={userName}>{content}</DashboardLayout>;
};

export default AdminDashboard;
