import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Eye, EyeOff, Mail, Lock, Languages } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { accountApi, studentApi } from "@/lib/api";
import { useTranslation } from "react-i18next";

const Login = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const from = searchParams.get("from") || "";
  const shouldRegister = searchParams.get("register") === "true";
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [forgotLoading, setForgotLoading] = useState(false);
  const { i18n } = useTranslation();

  const toggleLanguage = () => {
    i18n.changeLanguage(i18n.language === "ar" ? "en" : "ar");
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.email.trim()) errs.email = "البريد الإلكتروني مطلوب";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = "صيغة البريد غير صحيحة";
    if (!form.password) errs.password = "كلمة المرور مطلوبة";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const fetchProfileAndRedirect = async () => {
    try {
      const profileRes = await accountApi.getProfile();
      const profile = profileRes.data;
      const role = (profile.roles?.[0] || "student").toLowerCase();
      const name = `${profile.firstName} ${profile.lastName}`.trim() || form.email;

      localStorage.setItem("auth", JSON.stringify({ name, email: form.email, role, clubId: profile.clubId }));
      toast.success(`مرحباً ${name}!`, { description: "تم تسجيل الدخول بنجاح" });

      // Handle auto-registration if coming from event details
      if (shouldRegister && from && from.startsWith("/events/") && role === "student") {
        try {
          const eventId = parseInt(from.split("/")[2]);
          if (eventId && !isNaN(eventId)) {
            const registerRes = await studentApi.registerForEvent(eventId);
            toast.success("تم التسجيل بنجاح!", {
              description: "تم تسجيلك في الفعالية بنجاح",
            });
            navigate(from);
            return;
          }
        } catch (err: unknown) {
          toast.error(err instanceof Error ? err.message : "فشل التسجيل في الفعالية");
        }
      }

      if (role === "admin") navigate("/admin");
      else if (role === "organizer") navigate("/organizer");
      else if (from && from.startsWith("/")) navigate(from);
      else navigate("/student");
    } catch {
      localStorage.setItem("auth", JSON.stringify({ name: form.email, email: form.email, role: "student" }));
      toast.success("تم تسجيل الدخول بنجاح");
      navigate(from && from.startsWith("/") ? from : "/student");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const res = await accountApi.login(form.email, form.password);
      const token = res.data as string;
      localStorage.setItem("token", token);
      await fetchProfileAndRedirect();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "فشل تسجيل الدخول";
      setErrors({ email: msg });
      toast.error("فشل تسجيل الدخول", { description: msg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-[-10%] right-[-5%] w-[400px] h-[400px] rounded-full bg-primary/5 blur-3xl animate-pulse" />
      <div className="absolute bottom-[-10%] left-[-5%] w-[300px] h-[300px] rounded-full bg-accent/5 blur-3xl animate-pulse" />

      {/* Language Toggle */}
      <button
        onClick={toggleLanguage}
        className="absolute top-4 left-4 z-20 w-10 h-10 glass rounded-xl flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors card-shadow"
        aria-label="Toggle Language"
      >
        <Languages className="w-5 h-5" />
      </button>

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-xl">SA</span>
            </div>
            <span className="text-2xl font-bold text-foreground">SA-Manage</span>
          </Link>
        </div>

        <div className="bg-card rounded-2xl p-8 card-shadow border border-border">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-foreground mb-2">تسجيل الدخول</h1>
            <p className="text-sm text-muted-foreground">أدخل بياناتك للوصول إلى حسابك</p>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">البريد الإلكتروني</label>
              <div className="relative">
                <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="email"
                  placeholder="example@email.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className={`w-full h-11 pr-10 pl-4 rounded-xl border bg-background text-foreground text-sm outline-none focus:ring-2 focus:ring-ring transition-all ${errors.email ? "border-destructive" : "border-input"}`}
                />
              </div>
              {errors.email && <p className="text-xs text-destructive mt-1">{errors.email}</p>}
            </div>

            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">كلمة المرور</label>
              <div className="relative">
                <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className={`w-full h-11 pr-10 pl-10 rounded-xl border bg-background text-foreground text-sm outline-none focus:ring-2 focus:ring-ring transition-all ${errors.password ? "border-destructive" : "border-input"}`}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-destructive mt-1">{errors.password}</p>}
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer">
                <input type="checkbox" className="rounded border-input accent-primary" />
                تذكرني
              </label>
              <button
                type="button"
                disabled={forgotLoading}
                onClick={async () => {
                  const cleanEmail = form.email.trim();
                  if (!cleanEmail) {
                    toast.error("اكتب الإيميل الأول عشان نبعتلك رابط إعادة التعيين");
                    return;
                  }
                  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
                    toast.error("صيغة البريد غير صحيحة");
                    return;
                  }
                  setForgotLoading(true);
                  try {
                    await accountApi.forgotPassword(cleanEmail);
                    toast.success("تم إرسال رابط إعادة التعيين على إيميلك", { description: "افحص صندوق الوارد والـ Spam" });
                  } catch (err: unknown) {
                    toast.error(err instanceof Error ? err.message : "فشل إرسال رابط إعادة التعيين");
                  } finally {
                    setForgotLoading(false);
                  }
                }}
                className="text-sm text-primary hover:underline disabled:opacity-50"
              >
                {forgotLoading ? "جاري الإرسال..." : "نسيت كلمة المرور؟"}
              </button>
            </div>

            <Button type="submit" disabled={loading} className="w-full gradient-primary text-primary-foreground border-0 rounded-xl h-11 text-base mt-2 disabled:opacity-70">
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  جاري تسجيل الدخول...
                </span>
              ) : "تسجيل الدخول"}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            ليس لديك حساب؟{" "}
            <Link to="/register" className="text-primary font-medium hover:underline">إنشاء حساب جديد</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
