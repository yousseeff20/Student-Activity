import {
  Calendar, MapPin, Users, Clock, CheckCircle, Share2, Heart, Building2,
  Loader2, LogIn, XCircle, ClipboardCheck, Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useParams, Link, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  studentApi, getPublicEventById, StudentEventDto, getToken,
} from "@/lib/api";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
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

const formatRealDate = (dateString: string) => {
  if (!dateString) return "";
  const dateObj = new Date(dateString);
  try {
    return format(dateObj, "EEEE، d MMMM yyyy", { locale: ar });
  } catch {
    return dateString;
  }
};

const formatRealTime = (dateString: string) => {
  if (!dateString) return "";
  const dateObj = new Date(dateString);
  return dateObj.toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" });
};

const EventDetails = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const isLoggedIn = !!getToken();
  const auth = JSON.parse(localStorage.getItem("auth") || "{}");
  const isStudent = auth.role === "Student" || auth.role === "student";

  const [event, setEvent] = useState<StudentEventDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [registered, setRegistered] = useState(false);
  const [unregistering, setUnregistering] = useState(false);
  const [liked, setLiked] = useState(false);
  const [attendanceStatus, setAttendanceStatus] = useState<unknown | null>(null);
  const [loadingAttendance, setLoadingAttendance] = useState(false);
  const [studentId, setStudentId] = useState<string | null>(null);
  const [qrCodeBase64, setQrCodeBase64] = useState<string | null>(null);
  const [feedbackRating, setFeedbackRating] = useState<number>(0);
  const [feedbackComment, setFeedbackComment] = useState<string>("");
  const [submittingFeedback, setSubmittingFeedback] = useState(false);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  useEffect(() => {
    const fetchEvent = async () => {
      setLoading(true);
      try {
        const res = await getPublicEventById(Number(id));
        setEvent(res.data);
      } catch {
        setEvent(null);
      } finally {
        setLoading(false);
      }
    };
    fetchEvent();
  }, [id]);

  useEffect(() => {
    if (!event || !isLoggedIn || !isStudent) return;
    const checkRegistration = async () => {
      try {
        const res = await studentApi.getMyActivities();
        const activity = (res.data || []).find((a) => a.eventId === event.id);
        if (activity) {
          setRegistered(true);
          setStudentId(activity.studentId);
        } else {
          setRegistered(false);
          setStudentId(null);
        }
      } catch {
        // ignore
      }
    };
    checkRegistration();
  }, [event, isLoggedIn, isStudent]);

  useEffect(() => {
    if (!event || !isLoggedIn || !isStudent || !registered) return;
    const fetchAttendance = async () => {
      setLoadingAttendance(true);
      try {
        const res = await studentApi.getAttendanceStatus(event.id);
        setAttendanceStatus(res.data);
      } catch {
        setAttendanceStatus(null);
      } finally {
        setLoadingAttendance(false);
      }
    };
    fetchAttendance();
  }, [event, isLoggedIn, isStudent, registered]);

  const formatAttendanceStatus = (statusData: unknown, tHelper: (key: string) => string): string => {
    if (checkIsAttended(statusData)) {
      return tHelper("dashboard.student.attended") || "حضر الفعالية";
    }
    return tHelper("dashboard.student.pending") || "قيد الانتظار";
  };

  const checkIsAttended = (statusData: unknown): boolean => {
    if (!statusData) return false;

    // Unwrap ApiResponse if it exists
    let dataToCheck = statusData;
    if (typeof statusData === "object" && statusData !== null) {
      if ("data" in statusData) {
        dataToCheck = (statusData as Record<string, unknown>).data;
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
      return !!(dataToCheck as Record<string, unknown>).attended;
    }
    return false;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center py-32">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-20 text-center">
          <div className="w-20 h-20 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center">
            <Calendar className="w-8 h-8 text-muted-foreground" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">{t("eventDetails.notFound")}</h1>
          <p className="text-muted-foreground mb-4">{t("eventDetails.notFoundDesc")}</p>
          <Link to="/events">
            <Button className="gradient-primary text-primary-foreground border-0 rounded-xl">
              {t("eventDetails.backToEvents")}
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const handleRegister = async () => {
    if (!isLoggedIn) {
      toast.error("يجب تسجيل الدخول أولاً");
      navigate("/login");
      return;
    }
    setRegistering(true);
    setQrCodeBase64(null); // Reset previous QR code if any
    try {
      const res = await studentApi.registerForEvent(event.id);
      setRegistered(true);
      if (res.data && res.data.qrCode) {
        setQrCodeBase64(res.data.qrCode);
      }
      toast.success("تم التسجيل بنجاح!", {
        description: `تم تسجيلك في "${event.title}"`,
      });
      // Fetch activities immediately to get the studentId for the generated QR if base64 is not passed
      try {
        const actsRes = await studentApi.getMyActivities();
        const activity = (actsRes.data || []).find((a) => a.eventId === event.id);
        if (activity) {
          setStudentId(activity.studentId);
        }
      } catch {
        // silently ignore
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "فشل التسجيل في الفعالية");
    } finally {
      setRegistering(false);
    }
  };

  const handleUnregister = async () => {
    setUnregistering(true);
    try {
      await studentApi.unregisterFromEvent(event.id);
      setRegistered(false);
      setAttendanceStatus(null);
      toast.success("تم إلغاء التسجيل بنجاح");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "فشل إلغاء التسجيل");
    } finally {
      setUnregistering(false);
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("تم نسخ رابط الفعالية");
  };

  const handleLike = () => {
    setLiked(!liked);
    toast(liked ? "تم إزالة الفعالية من المفضلة" : "تم إضافة الفعالية للمفضلة");
  };

  const handleFeedbackSubmit = async () => {
    if (feedbackRating === 0) {
      toast.error("يرجى اختيار تقييم");
      return;
    }

    setSubmittingFeedback(true);
    try {
      const feedbackData = {
        eventId: Number(id),
        rating: feedbackRating,
        comment: feedbackComment.trim() || ""
      };

      console.log("=== إرسال التقييم ===");
      console.log("البيانات المرسلة:", feedbackData);
      console.log("Event ID:", id);
      console.log("التقييم:", feedbackRating);
      console.log("التعليق:", feedbackComment.trim() || "");

      // Check if user is logged in
      const token = localStorage.getItem("token");
      console.log("Token موجود:", !!token);

      if (!token) {
        toast.error("يجب تسجيل الدخول لإرسال التقييم");
        return;
      }

      // Log the exact request that will be sent
      console.log("=== API Request Details ===");
      console.log("URL:", "/api/feedback");
      console.log("Method:", "POST");
      console.log("Headers:", {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token.substring(0, 20)}...`
      });
      console.log("Body:", JSON.stringify(feedbackData, null, 2));

      const response = await studentApi.submitFeedback(Number(id), feedbackRating, feedbackComment.trim() || "");

      console.log("=== استجابة API ===");
      console.log("Response:", response);
      console.log("Response Data:", response.data);
      console.log("Response Status:", response.success);

      setFeedbackSubmitted(true);
      toast.success("تم إرسال تقييمك بنجاح!", {
        description: "نشكرك على مشاركتك رأيك",
      });

      // Trigger admin notification (this would be handled by backend via WebSocket or real-time updates)
      // For now, we'll trigger a custom event that admin dashboard can listen to
      setTimeout(() => {
        const feedbackData = {
          eventId: Number(id),
          rating: feedbackRating,
          comment: feedbackComment,
          timestamp: new Date().toISOString()
        };

        console.log("=== Triggering Admin Notification ===");
        console.log("Feedback Data:", feedbackData);

        // Method 1: Custom Event (for same tab)
        window.dispatchEvent(new CustomEvent('newFeedback', {
          detail: feedbackData
        }));

        // Method 2: LocalStorage (for cross-tab communication)
        localStorage.setItem('newFeedback', JSON.stringify(feedbackData));

        // Method 3: Remove after setting (to trigger storage event)
        setTimeout(() => {
          localStorage.removeItem('newFeedback');
        }, 100);

        toast.info("تم إشعار المشرف بالتقييم الجديد", {
          description: "سيقوم المشرف بمراجعة تقييمك",
        });
      }, 1000);

    } catch (err: unknown) {
      console.error("=== خطأ في إرسال التقييم ===");
      console.error("الخطأ:", err);
      console.error("نوع الخطأ:", typeof err);
      console.error("رسالة الخطأ:", err instanceof Error ? err.message : err);
      console.error("Stack Trace:", err instanceof Error ? err.stack : "No stack available");

      let errorMessage = "فشل إرسال التقييم";
      if (err instanceof Error) {
        console.log("تحليل رسالة الخطأ:");
        console.log("رسالة الأصلية:", err.message);

        if (err.message.includes("400") || err.message.includes("Bad Request") || err.message.includes("Review events you attended")) {
          if (err.message.includes("attended") || err.message.includes("review events you attended") || err.message.includes("400")) {
            errorMessage = "للتقييم، يجب تسجيل حضورك في الفعالية أولاً. يرجى مراجعة المنظم لتأكيد حضورك.";
            console.log("🔴 المشكلة: لم يتم تسجيل الحضور أو خطأ في البيانات");
          } else {
            errorMessage = "بيانات التقييم غير صحيحة، يرجى المحاولة مرة أخرى";
            console.log("🔴 المشكلة: Bad Request (400) - بيانات غير صحيحة");
          }
        } else if (err.message.includes("401") || err.message.includes("Unauthorized")) {
          errorMessage = "يجب تسجيل الدخول لإرسال التقييم";
          console.log("🔴 المشكلة: Unauthorized (401)");
        } else if (err.message.includes("403") || err.message.includes("Forbidden")) {
          errorMessage = "غير مسموح لك بإرسال تقييم لهذه الفعالية";
          console.log("🔴 المشكلة: Forbidden (403)");
        } else if (err.message.includes("409") || err.message.includes("Conflict")) {
          errorMessage = "لقد قمت بتقييم هذه الفعالية من قبل";
          console.log("🔴 المشكلة: Conflict (409)");
        } else {
          errorMessage = err.message;
          console.log("🔴 مشكلة أخرى:", err.message);
        }
      }

      toast.error(errorMessage);
    } finally {
      setSubmittingFeedback(false);
    }
  };

  const renderStars = (interactive: boolean = false) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-6 h-6 cursor-pointer transition-colors ${i < feedbackRating
          ? "fill-yellow-400 text-yellow-400"
          : "text-gray-300 hover:text-yellow-200"
          }`}
        onClick={() => interactive && setFeedbackRating(i + 1)}
      />
    ));
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <Link to="/" className="hover:text-foreground transition-colors">الرئيسية</Link>
          <span>/</span>
          <Link to="/events" className="hover:text-foreground transition-colors">الفعاليات</Link>
          <span>/</span>
          <span className="text-foreground">{event.title}</span>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="rounded-2xl overflow-hidden card-shadow relative group">
              <img
                src={getEventImage(event.id)}
                alt={event.title}
                className="w-full h-[300px] md:h-[400px] object-cover group-hover:scale-[1.02] transition-transform duration-500"
              />
              <div className="absolute top-4 right-4 flex gap-2">
                <button
                  onClick={handleLike}
                  className={`w-10 h-10 rounded-xl flex items-center justify-center backdrop-blur-md transition-all ${liked ? "bg-destructive text-white" : "bg-card/80 text-foreground hover:bg-card"
                    }`}
                >
                  <Heart className={`w-5 h-5 ${liked ? "fill-current" : ""}`} />
                </button>
                <button
                  onClick={handleShare}
                  className="w-10 h-10 rounded-xl bg-card/80 backdrop-blur-md flex items-center justify-center text-foreground hover:bg-card transition-all"
                >
                  <Share2 className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="bg-card rounded-2xl p-6 card-shadow border border-border">
              <div className="flex flex-wrap items-center gap-3 mb-4">
                {event.isApproved !== false ? (
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-success/10 text-success">معتمدة</span>
                ) : (
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-warning/10 text-warning">قيد الاعتماد</span>
                )}
                <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Building2 className="w-3.5 h-3.5" />
                  {event.clubName ? event.clubName : `نادي #${event.clubId}`}
                </span>
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-4">{event.title}</h1>
              <p className="text-muted-foreground leading-relaxed mb-6">{event.description}</p>

              <h3 className="text-lg font-bold text-foreground mb-3">{t("eventDetails.eventDetails")}</h3>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-4 rounded-xl bg-secondary/50 hover:bg-secondary transition-colors">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">{t("eventDetails.startDate")}</p>
                    <p className="text-sm font-medium text-foreground">{formatRealDate(event.startDate)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 rounded-xl bg-secondary/50 hover:bg-secondary transition-colors">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">{t("eventDetails.endDate")}</p>
                    <p className="text-sm font-medium text-foreground">{formatRealDate(event.endDate)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 rounded-xl bg-secondary/50 hover:bg-secondary transition-colors">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Clock className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">{t("eventDetails.time")}</p>
                    <p className="text-sm font-medium text-foreground">
                      {formatRealTime(event.startDate)} - {formatRealTime(event.endDate)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 rounded-xl bg-secondary/50 hover:bg-secondary transition-colors">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">{t("eventDetails.location")}</p>
                    <p className="text-sm font-medium text-foreground">{event.location}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 rounded-xl bg-secondary/50 hover:bg-secondary transition-colors">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Users className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">{t("eventDetails.capacity")}</p>
                    <p className="text-sm font-medium text-foreground">{event.capacity} {t("eventDetails.seats")}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-card rounded-2xl p-6 card-shadow border border-border sticky top-20">
              <h3 className="text-lg font-bold text-foreground mb-4">{t("eventDetails.register")}</h3>

              <div className="mb-5">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-muted-foreground">{t("eventDetails.totalCapacity")}</span>
                  <span className="font-medium text-foreground">{event.capacity} {t("eventDetails.seats")}</span>
                </div>
              </div>

              {registered ? (
                <div className="text-center py-6 bg-success/5 rounded-xl border border-success/10">
                  <CheckCircle className="w-14 h-14 text-success mx-auto mb-3" />
                  <p className="font-bold text-foreground text-lg">{t("eventDetails.registered")}</p>
                  <p className="text-sm text-muted-foreground mt-1">{t("eventDetails.cancelAnytime")}</p>

                  {/* Prominent Unregister Button */}
                  <div className="mt-4 mb-4">
                    <Button
                      variant="outline"
                      className="w-full rounded-xl text-sm text-destructive border-destructive/30 hover:bg-destructive/10"
                      onClick={handleUnregister}
                      disabled={unregistering}
                    >
                      {unregistering ? (
                        <span className="flex items-center gap-2">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          جاري الإلغاء...
                        </span>
                      ) : (
                        <span className="flex items-center gap-2">
                          <XCircle className="w-4 h-4" />
                          إلغاء التسجيل
                        </span>
                      )}
                    </Button>
                  </div>

                  {qrCodeBase64 ? (
                    <div className="mt-4 flex flex-col items-center justify-center">
                      <p className="text-sm text-muted-foreground mb-2">أبرز كود الدخول للمنظمين لتسجيل حضورك</p>
                      <img
                        src={`data:image/png;base64,${qrCodeBase64}`}
                        alt="QR Code"
                        className="w-32 h-32 rounded-lg border-2 border-primary/20 p-2 bg-white"
                      />
                    </div>
                  ) : studentId ? (
                    <div className="mt-4 flex flex-col items-center justify-center">
                      <p className="text-sm text-muted-foreground mb-2">أبرز كود الدخول للمنظمين لتسجيل حضورك</p>
                      <img
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(studentId)}`}
                        alt="QR Code"
                        className="w-32 h-32 rounded-lg border-2 border-primary/20 p-2 bg-white"
                      />
                    </div>
                  ) : null}

                  {loadingAttendance ? (
                    <div className="mt-3">
                      <Loader2 className="w-4 h-4 animate-spin mx-auto text-muted-foreground" />
                    </div>
                  ) : attendanceStatus && checkIsAttended(attendanceStatus) ? (
                    <div className="mt-3 flex items-center justify-center gap-2 text-sm bg-success/10 p-2 rounded-lg border border-success/20 text-success">
                      <ClipboardCheck className="w-5 h-5" />
                      <span>{t("eventDetails.attendanceStatus")}</span>
                      <span className="font-bold">{formatAttendanceStatus(attendanceStatus, t)}</span>
                    </div>
                  ) : null}

                </div>
              ) : !isLoggedIn ? (
                <div className="text-center py-6">
                  <LogIn className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground mb-4">يجب تسجيل الدخول أولاً للتسجيل في الفعالية</p>
                  <Link to={`/login?from=/events/${event.id}&register=true`}>
                    <Button className="w-full gradient-primary text-primary-foreground border-0 rounded-xl h-11">
                      تسجيل الدخول
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="text-center py-6">
                  <LogIn className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground mb-4">يجب تسجيل الدخول أولاً للتسجيل في الفعالية</p>
                  <Link to={`/login?from=/events/${event.id}&register=true`}>
                    <Button className="w-full gradient-primary text-primary-foreground border-0 rounded-xl h-11">
                      تسجيل الدخول
                    </Button>
                  </Link>
                </div>
              )}

              {/* Feedback Section */}
              {registered && !feedbackSubmitted && (
                <div className="mt-6 pt-6 border-t border-border">
                  <h4 className="text-lg font-bold text-foreground mb-4">قيم الفعالية</h4>

                  {/* Important Notice */}
                  <div className="mb-4 p-4 bg-warning/10 border border-warning/20 rounded-xl">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-warning/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-warning font-bold">!</span>
                      </div>
                      <div>
                        <p className="font-medium text-foreground text-sm mb-1">ملاحظة هامة</p>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          للتقييم، يجب تسجيل حضورك في الفعالية أولاً. يرجى التواصل مع منظم الفعالية لتسجيل الحضور.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">التقييم</label>
                      <div className="flex gap-1 justify-center mb-2">
                        {renderStars(true)}
                      </div>
                      <p className="text-xs text-muted-foreground text-center">اضغط على النجوم للتقييم</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">تعليقك (اختياري)</label>
                      <textarea
                        value={feedbackComment}
                        onChange={(e) => setFeedbackComment(e.target.value)}
                        placeholder="شاركنا رأيك في الفعالية..."
                        className="w-full px-4 py-3 rounded-xl border border-input bg-background text-foreground placeholder:text-muted-foreground resize-none h-24 outline-none focus:ring-2 focus:ring-ring transition-all"
                        rows={3}
                      />
                    </div>
                    <Button
                      onClick={handleFeedbackSubmit}
                      className="w-full gradient-primary text-primary-foreground border-0 rounded-xl h-11"
                      disabled={submittingFeedback || feedbackRating === 0}
                    >
                      {submittingFeedback ? (
                        <span className="flex items-center gap-2">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          جاري الإرسال...
                        </span>
                      ) : (
                        "إرسال التقييم"
                      )}
                    </Button>
                  </div>
                </div>
              )}

              {feedbackSubmitted && (
                <div className="mt-6 pt-6 border-t border-border">
                  <div className="text-center py-4 bg-success/5 rounded-xl border border-success/10">
                    <CheckCircle className="w-12 h-12 text-success mx-auto mb-3" />
                    <p className="font-bold text-foreground text-lg mb-1">شكراً لتقييمك!</p>
                    <p className="text-sm text-muted-foreground">نقدر مشاركتك رأيك في الفعالية</p>
                  </div>
                </div>
              )}

              <div className="mt-4 pt-4 border-t border-border">
                <p className="text-xs text-muted-foreground text-center">
                  {t("eventDetails.terms")}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default EventDetails;
