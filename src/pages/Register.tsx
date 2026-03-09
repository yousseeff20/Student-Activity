import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Mail, Lock, User, CheckCircle2, Languages } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { accountApi } from "@/lib/api";
import { useTranslation } from "react-i18next";

const Register = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "Student" as "Student" | "Organizer" | "Admin",
    level: "1",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { i18n } = useTranslation();

  const toggleLanguage = () => {
    i18n.changeLanguage(i18n.language === "ar" ? "en" : "ar");
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.firstName.trim()) errs.firstName = "الاسم الأول مطلوب";
    if (!form.lastName.trim()) errs.lastName = "اسم العائلة مطلوب";
    if (!form.email.trim()) errs.email = "البريد الإلكتروني مطلوب";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = "صيغة البريد غير صحيحة";
    if (!form.password) errs.password = "كلمة المرور مطلوبة";
    else if (form.password.length < 6) errs.password = "كلمة المرور يجب أن تكون 6 أحرف على الأقل";
    else if (!/[A-Z]/.test(form.password)) errs.password = "يجب أن تحتوي على حرف كبير (A-Z)";
    else if (!/[a-z]/.test(form.password)) errs.password = "يجب أن تحتوي على حرف صغير (a-z)";
    else if (!/[0-9]/.test(form.password)) errs.password = "يجب أن تحتوي على رقم (0-9)";
    else if (!/[^A-Za-z0-9]/.test(form.password)) errs.password = "يجب أن تحتوي على حرف خاص (مثل @ # ! $)";
    if (form.password !== form.confirmPassword) errs.confirmPassword = "كلمتا المرور غير متطابقتين";
    if (form.role === "Student" && !form.level.trim()) errs.level = "حدد المستوى للطالب";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const registerPayload: {
        firstName: string;
        lastName: string;
        email: string;
        password: string;
        role: string;
        level?: number;
      } = {
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        password: form.password,
        role: form.role,
      };
      if (form.role === "Student") {
        registerPayload.level = Number(form.level);
      }

      await accountApi.register(registerPayload);

      // Auto-login after successful registration
      try {
        const loginRes = await accountApi.login(form.email, form.password);
        localStorage.setItem("token", loginRes.data as string);

        const profileRes = await accountApi.getProfile();
        const profile = profileRes.data;
        const role = (profile.roles?.[0] || "student").toLowerCase();
        const name = `${form.firstName} ${form.lastName}`.trim();

        localStorage.setItem("auth", JSON.stringify({ name, email: form.email, role }));
        toast.success("تم إنشاء الحساب بنجاح!", { description: "مرحباً بك في SA-Manage" });
        if (role === "admin") navigate("/admin");
        else if (role === "organizer") navigate("/organizer");
        else navigate("/student");
      } catch {
        toast.success("تم إنشاء الحساب بنجاح!", { description: "يرجى تسجيل الدخول" });
        navigate("/login");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "فشل إنشاء الحساب";
      if (msg.includes("بريد") || msg.includes("مسجل") || msg.includes("email") || msg.includes("exist") || msg.includes("Duplicate")) {
        setErrors({ email: msg });
      } else if (msg.includes("كلمة المرور") || msg.includes("password") || msg.includes("Password")) {
        setErrors({ password: msg });
      } else {
        setErrors({ email: msg });
      }
      toast.error("فشل إنشاء الحساب", { description: msg });
    } finally {
      setLoading(false);
    }
  };

  const calcStrength = (p: string) => {
    if (!p) return 0;
    let score = 0;
    if (p.length >= 6) score++;
    if (/[A-Z]/.test(p) && /[a-z]/.test(p)) score++;
    if (/[0-9]/.test(p) && /[^A-Za-z0-9]/.test(p)) score++;
    return score;
  };
  const passwordStrength = calcStrength(form.password);

  const strengthLabel = ["", "ضعيفة", "متوسطة", "قوية"];
  const strengthColor = ["", "bg-destructive", "bg-warning", "bg-success"];

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-5%] w-[400px] h-[400px] rounded-full bg-primary/5 blur-3xl animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-5%] w-[300px] h-[300px] rounded-full bg-accent/5 blur-3xl animate-pulse" />

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
            <h1 className="text-2xl font-bold text-foreground mb-2">إنشاء حساب جديد</h1>
            <p className="text-sm text-muted-foreground">انضم إلينا وابدأ رحلتك في الأنشطة الطلابية</p>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">الاسم الأول</label>
                <div className="relative">
                  <User className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="أحمد"
                    value={form.firstName}
                    onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                    className={`w-full h-11 pr-10 pl-4 rounded-xl border bg-background text-foreground text-sm outline-none focus:ring-2 focus:ring-ring transition-all ${errors.firstName ? "border-destructive" : "border-input"}`}
                  />
                </div>
                {errors.firstName && <p className="text-xs text-destructive mt-1">{errors.firstName}</p>}
              </div>

              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">اسم العائلة</label>
                <div className="relative">
                  <User className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="محمد"
                    value={form.lastName}
                    onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                    className={`w-full h-11 pr-10 pl-4 rounded-xl border bg-background text-foreground text-sm outline-none focus:ring-2 focus:ring-ring transition-all ${errors.lastName ? "border-destructive" : "border-input"}`}
                  />
                </div>
                {errors.lastName && <p className="text-xs text-destructive mt-1">{errors.lastName}</p>}
              </div>
            </div>

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
              <label className="text-sm font-medium text-foreground mb-1.5 block">نوع الحساب</label>
              <select
                value={form.role}
                onChange={(e) =>
                  setForm({
                    ...form,
                    role: e.target.value as "Student" | "Organizer" | "Admin",
                  })
                }
                className="w-full h-11 px-4 rounded-xl border border-input bg-background text-foreground text-sm outline-none focus:ring-2 focus:ring-ring transition-all"
              >
                <option value="Student">طالب</option>
                <option value="Organizer">منظم</option>
                <option value="Admin">مشرف</option>
              </select>
            </div>

            {form.role === "Student" && (
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">المستوى</label>
                <input
                  type="number"
                  min={1}
                  max={8}
                  value={form.level}
                  onChange={(e) => setForm({ ...form, level: e.target.value })}
                  className={`w-full h-11 px-4 rounded-xl border bg-background text-foreground text-sm outline-none focus:ring-2 focus:ring-ring transition-all ${errors.level ? "border-destructive" : "border-input"}`}
                />
                {errors.level && <p className="text-xs text-destructive mt-1">{errors.level}</p>}
              </div>
            )}

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
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-destructive mt-1">{errors.password}</p>}
              {!errors.password && <p className="text-[10px] text-muted-foreground mt-1">حرف كبير + حرف صغير + رقم + حرف خاص (مثل Abc@123)</p>}
              {form.password && (
                <div className="mt-2 flex items-center gap-2">
                  <div className="flex-1 flex gap-1">
                    {[1, 2, 3].map((level) => (
                      <div key={level} className={`h-1.5 flex-1 rounded-full transition-colors ${passwordStrength >= level ? strengthColor[passwordStrength] : "bg-muted"}`} />
                    ))}
                  </div>
                  <span className="text-xs text-muted-foreground">{strengthLabel[passwordStrength]}</span>
                </div>
              )}
            </div>

            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">تأكيد كلمة المرور</label>
              <div className="relative">
                <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={form.confirmPassword}
                  onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                  className={`w-full h-11 pr-10 pl-10 rounded-xl border bg-background text-foreground text-sm outline-none focus:ring-2 focus:ring-ring transition-all ${errors.confirmPassword ? "border-destructive" : "border-input"}`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.confirmPassword && <p className="text-xs text-destructive mt-1">{errors.confirmPassword}</p>}
              {form.confirmPassword && form.password === form.confirmPassword && (
                <p className="text-xs text-success mt-1 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> كلمتا المرور متطابقتان
                </p>
              )}
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full gradient-primary text-primary-foreground border-0 rounded-xl h-11 text-base mt-2 disabled:opacity-70"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  جاري إنشاء الحساب...
                </span>
              ) : (
                "إنشاء حساب"
              )}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            لديك حساب بالفعل؟{" "}
            <Link to="/login" className="text-primary font-medium hover:underline">تسجيل الدخول</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
