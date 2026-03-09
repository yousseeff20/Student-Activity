import { ReactNode, useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Home, Calendar, FileText, User, LogOut, QrCode, ClipboardCheck,
  Moon, Sun, Menu, Bell, Users, Building2, Shield, BarChart3, GraduationCap, Languages, Star, BellRing,
} from "lucide-react";
import { useTheme } from "next-themes";
import { toast } from "sonner";
import { accountApi } from "@/lib/api";
import { useTranslation } from "react-i18next";

interface SidebarLink {
  label: string;
  href: string;
  icon: ReactNode;
}

interface DashboardLayoutProps {
  children: ReactNode;
  role: "student" | "organizer" | "admin";
  userName?: string;
}

const roleLinks: Record<string, SidebarLink[]> = {
  student: [
    { label: "dashboard.sidebar.student_dashboard", href: "/student", icon: <Home className="w-5 h-5" /> },
    { label: "dashboard.sidebar.student_events", href: "/student/events", icon: <Calendar className="w-5 h-5" /> },
    { label: "dashboard.sidebar.student_requests", href: "/student/registrations", icon: <FileText className="w-5 h-5" /> },
    { label: "dashboard.sidebar.student_profile", href: "/student/profile", icon: <User className="w-5 h-5" /> },
  ],
  organizer: [
    { label: "dashboard.sidebar.organizer_dashboard", href: "/organizer", icon: <Home className="w-5 h-5" /> },
    { label: "dashboard.sidebar.organizer_events", href: "/organizer/events", icon: <Calendar className="w-5 h-5" /> },
    { label: "dashboard.sidebar.organizer_registrations", href: "/organizer/registrations", icon: <ClipboardCheck className="w-5 h-5" /> },
    { label: "dashboard.sidebar.organizer_attendance", href: "/organizer/attendance", icon: <QrCode className="w-5 h-5" /> },
    { label: "dashboard.sidebar.organizer_assign", href: "/organizer/assign-student", icon: <User className="w-5 h-5" /> },
  ],
  admin: [
    { label: "dashboard.sidebar.admin_dashboard", href: "/admin", icon: <Home className="w-5 h-5" /> },
    { label: "dashboard.sidebar.admin_users", href: "/admin/users", icon: <Users className="w-5 h-5" /> },
    { label: "dashboard.sidebar.admin_events", href: "/admin/events", icon: <Calendar className="w-5 h-5" /> },
    { label: "dashboard.sidebar.admin_clubs", href: "/admin/clubs", icon: <Building2 className="w-5 h-5" /> },
    { label: "dashboard.sidebar.admin_reports", href: "/admin/reports", icon: <BarChart3 className="w-5 h-5" /> },
    { label: "تقييمات الفعاليات", href: "/admin/feedback", icon: <Star className="w-5 h-5" /> },
  ],
};

const roleLabels: Record<string, string> = {
  student: "طالب",
  organizer: "منظم فعاليات",
  admin: "مشرف النظام",
};

const roleColors: Record<string, string> = {
  student: "bg-primary/10 text-primary",
  organizer: "bg-accent/10 text-accent",
  admin: "bg-destructive/10 text-destructive",
};

const DashboardLayout = ({ children, role, userName = "أحمد محمد" }: DashboardLayoutProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const links = roleLinks[role];
  const { theme, setTheme } = useTheme();
  const { t, i18n } = useTranslation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifications, setNotifications] = useState<Array<{
    id: string;
    title: string;
    message: string;
    time: string;
    read: boolean;
  }>>([]);
  const [showNotifications, setShowNotifications] = useState(false);

  // Add notification function
  const addNotification = (title: string, message: string) => {
    const newNotification = {
      id: Date.now().toString(),
      title,
      message,
      time: new Date().toLocaleTimeString("ar-EG", { hour: '2-digit', minute: '2-digit' }),
      read: false,
    };
    setNotifications(prev => [newNotification, ...prev].slice(0, 10)); // Keep only last 10 notifications
  };

  // Listen for feedback submissions (this would normally be via WebSocket)
  useEffect(() => {
    // For demo purposes, we'll listen to custom events or localStorage changes
    const handleNewFeedback = (event: any) => {
      console.log("=== New Feedback Notification ===");
      console.log("Event:", event);
      console.log("Detail:", event.detail);
      
      addNotification(
        "تقييم جديد", 
        `قام طالب بإرسال تقييم جديد للفعالية ${event.detail?.eventId || 'غير محدد'}`
      );
      
      // Also show a toast notification
      toast.success("تقييم جديد!", {
        description: `تم استلام تقييم جديد للفعالية ${event.detail?.eventId || 'غير محدد'}`,
      });
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
  }, []);

  const toggleLanguage = () => {
    const newLang = i18n.language === "ar" ? "en" : "ar";
    i18n.changeLanguage(newLang);
    // document.documentElement.dir = newLang === "ar" ? "rtl" : "ltr"; // Assuming App.tsx handles dir already
  };

  const handleLogout = async () => {
    try {
      await accountApi.logout();
    } catch {
      // logout even if API call fails
    }
    localStorage.removeItem("auth");
    localStorage.removeItem("token");
    toast.success("تم تسجيل الخروج بنجاح");
    navigate("/");
  };

  const sidebarContent = (
    <>
      <div className="p-5 border-b border-border">
        <Link to="/" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center shadow-lg shadow-primary/25">
            <GraduationCap className="w-6 h-6 text-primary-foreground" />
          </div>
          <div className="flex flex-col leading-tight">
            <span className="font-bold text-foreground">SA-Manage</span>
            <span className="text-xs text-muted-foreground">{roleLabels[role]}</span>
          </div>
        </Link>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {links.map((link) => {
          const isActive = location.pathname === link.href;
          return (
            <Link
              key={link.href}
              to={link.href}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${isActive
                ? "gradient-primary text-primary-foreground shadow-md"
                : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                }`}
            >
              {link.icon}
              {t(link.label)}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-border space-y-3">
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${roleColors[role]}`}>
            <User className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">{userName}</p>
            <p className="text-xs text-muted-foreground">{roleLabels[role]}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-destructive w-full px-2 py-1.5 rounded-lg hover:bg-destructive/10 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          {t('dashboard.sidebar.logout')}
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-background flex">
      {sidebarOpen && (
        <div className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <aside className={`
        top-0 start-0 w-64 bg-card border-e border-border flex flex-col fixed h-full z-50 transition-transform duration-300
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full rtl:translate-x-full lg:!translate-x-0"}
      `}>
        {sidebarContent}
      </aside>

      <main className="flex-1 lg:ms-64">
        <div className="sticky top-0 z-30 bg-background/80 backdrop-blur-md border-b border-border px-4 lg:px-8 py-3 flex items-center justify-between">
          <button className="lg:hidden text-foreground" onClick={() => setSidebarOpen(true)}>
            <Menu className="w-5 h-5" />
          </button>
          <div />
          <div className="flex items-center gap-2">
            <button
              onClick={toggleLanguage}
              className="w-9 h-9 rounded-xl flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
              aria-label="Toggle Language"
            >
              <Languages className="w-[18px] h-[18px]" />
            </button>
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="w-9 h-9 rounded-xl flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
              aria-label="تبديل الوضع"
            >
              {theme === "dark" ? <Sun className="w-[18px] h-[18px]" /> : <Moon className="w-[18px] h-[18px]" />}
            </button>
            <div className="relative">
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="w-9 h-9 rounded-xl flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors relative"
                aria-label="الإشعارات"
              >
                <Bell className="w-[18px] h-[18px]" />
                {notifications.filter(n => !n.read).length > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-destructive animate-pulse" />
                )}
              </button>
              
              {showNotifications && (
                <div className="absolute top-full mt-2 end-0 w-80 bg-card rounded-xl border border-border shadow-lg z-50 max-h-96 overflow-hidden">
                  <div className="p-3 border-b border-border">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-foreground text-sm">الإشعارات</h3>
                      <span className="text-xs text-muted-foreground">
                        {notifications.filter(n => !n.read).length} غير مقروء
                      </span>
                    </div>
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {notifications.length > 0 ? (
                      notifications.map((notification) => (
                        <div
                          key={notification.id}
                          className={`p-3 border-b border-border last:border-b-0 hover:bg-secondary/20 transition-colors ${
                            !notification.read ? 'bg-primary/5' : ''
                          }`}
                        >
                          <div className="flex items-start gap-2">
                            <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                              !notification.read ? 'bg-primary' : 'bg-muted'
                            }`} />
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-foreground text-sm">{notification.title}</p>
                              <p className="text-xs text-muted-foreground mt-1">{notification.message}</p>
                              <p className="text-xs text-muted-foreground mt-1">{notification.time}</p>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-6 text-center">
                        <Bell className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground">لا توجد إشعارات جديدة</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="p-4 md:p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
