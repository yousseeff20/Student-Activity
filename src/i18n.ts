import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
    en: {
        translation: {
            "nav": {
                "home": "Home",
                "events": "Events",
                "clubs": "Clubs"
            },
            "hero": {
                "badge": "Student Activities Platform",
                "title1": "Don't just attend...",
                "title2": "Be part of the event",
                "subtitle": "A platform that gives you the opportunity to participate, organize, and create a different university experience.",
                "browse": "Browse Events",
                "login": "Login",
                "register": "Create Account",
                "haveAccount": "Have an account?",
                "new": "New?",
                "searchPlaceholder": "Search for events...",
                "search": "Search",
                "stats": {
                    "students": "Students",
                    "events": "Events",
                    "clubs": "Clubs"
                },
                "upcoming": "Upcoming Event"
            },
            "eventsSection": {
                "title": "Available Events",
                "subtitle": "Browse the latest events and student activities and book your spot easily now",
                "approved": "Approved",
                "pending": "Pending",
                "capacity": "Capacity",
                "showDetails": "Show Details",
                "registerNow": "Register Now",
                "noEvents": "No approved events available currently",
                "noEventsDesc": "Events will appear here for everyone after the organizer creates them and the admin approves them. To register for any event, please log in or create an account.",
                "viewAll": "View All Events",
                "loading": "Loading...",
                "allLoaded": "All available events have been displayed"
            },
            "footer": {
                "description": "An integrated platform to manage and organize student activities and events at the university.",
                "quickLinks": "Quick Links",
                "contactUs": "Contact Us",
                "rights": "© 2024 SA-Manage. All rights reserved",
                "privacy": "Privacy Policy",
                "terms": "Terms and Conditions",
                "location": "Sowamea Sharq Republic"
            },
            "dashboard": {
                "admin": {
                    "title": "Admin Dashboard",
                    "subtitle": "Live overview from API",
                    "students": "Students",
                    "organizers": "Organizers",
                    "admins": "Admins",
                    "pendingEvents": "Pending Events",
                    "totalEvents": "Total Events",
                    "approved": "Approved"
                },
                "sidebar": {
                    "student_dashboard": "Dashboard",
                    "student_events": "Events",
                    "student_requests": "My Requests",
                    "student_profile": "Profile",
                    "organizer_dashboard": "Dashboard",
                    "organizer_events": "My Events",
                    "organizer_registrations": "Registrations",
                    "organizer_attendance": "Attendance",
                    "organizer_assign": "Assign Student",
                    "admin_dashboard": "Dashboard",
                    "admin_users": "Organizers",
                    "admin_events": "Events",
                    "admin_clubs": "Clubs",
                    "admin_reports": "Reports",
                    "logout": "Logout"
                },
                "organizer": {
                    "welcome": "Welcome",
                    "subtitle": "Manage club events from API",
                    "createEvent": "Create New Event",
                    "totalEvents": "Total Events",
                    "totalRegistrations": "Total Registrations",
                    "createdEvents": "Created Events",
                    "latestRegistrations": "Latest Registrations",
                    "quickLook": "Quick Look",
                    "quickLookDesc": "Numbers above are based on real data from organizer interfaces.",
                    "quickSummary": "Quick Summary",
                    "acceptanceRate": "Acceptance Rate",
                    "attendanceRate": "Attendance Rate",
                    "pending": "Pending",
                    "overallRating": "Overall Rating"
                },
                "student": {
                    "welcome": "Welcome",
                    "subtitle": "Track your registered events and activities in one place",
                    "registeredEvents": "Registered Events",
                    "attendedEvents": "Attended Events",
                    "pendingEvents": "Pending Events",
                    "upcomingEvent": "Next Upcoming Event",
                    "browseMore": "Browse More Events",
                    "myRegistrations": "My Registrations",
                    "viewAll": "View All",
                    "registrationDate": "Registration Date",
                    "cancel": "Cancel",
                    "noRegistrations": "No Registrations",
                    "browseEvents": "Browse Events",
                    "achievements": "Achievements",
                    "noUpcomingEvents": "No Upcoming Events",
                    "allRegisteredEvents": "All Registered Events",
                    "cancelRegistration": "Cancel Registration",
                    "browseAndRegister": "Browse and register for events",
                    "attended": "Attended",
                    "registered": "Registered",
                    "pending": "Pending",
                    "profile": "Profile",
                    "profileDesc": "Manage your profile",
                    "student": "Student",
                    "firstName": "First Name",
                    "lastName": "Last Name",
                    "email": "Email",
                    "emailHint": "Email cannot be changed",
                    "saveChanges": "Save Changes",
                    "changePassword": "Change Password",
                    "passwordHint": "Update your password",
                    "change": "Change",
                    "currentPassword": "Current Password",
                    "newPassword": "New Password",
                    "passwordRules": "Password must contain uppercase, lowercase, number, and special character",
                    "confirmPassword": "Confirm Password",
                    "changePasswordBtn": "Change Password"
                }
            },
            "eventsPage": {
                "title": "All Events",
                "subtitle": "Browse and register for available events",
                "searchPlaceholder": "Search for an event...",
                "approved": "Approved",
                "capacity": "Capacity",
                "showDetails": "Show Details",
                "noEvents": "No events found",
                "tryDifferentSearch": "Try changing search criteria",
                "previous": "Previous",
                "next": "Next",
                "page": "Page"
            },
            "eventDetails": {
                "notFound": "Event Not Found",
                "notFoundDesc": "The requested event could not be found",
                "backToEvents": "Back to Events",
                "eventDetails": "Event Details",
                "startDate": "Start Date",
                "endDate": "End Date",
                "time": "Time",
                "location": "Location",
                "capacity": "Capacity",
                "seats": "seats",
                "register": "Event Registration",
                "totalCapacity": "Total Capacity",
                "registered": "Successfully registered for this event",
                "cancelAnytime": "You can cancel registration at any time",
                "attendanceStatus": "Attendance Status:",
                "cancelRegistration": "Cancel Registration",
                "loginRequired": "You must login to register for the event",
                "login": "Login",
                "registerNow": "Register Now",
                "terms": "By registering you agree to attendance and participation terms"
            }
        }
    },
    ar: {
        translation: {
            "nav": {
                "home": "الرئيسية",
                "events": "الفعاليات",
                "clubs": "الاتحادات"
            },
            "hero": {
                "badge": "منصة الأنشطة الطلابية",
                "title1": "لا تكتفِ بالحضور...",
                "title2": "كن جزءًا من الحدث",
                "subtitle": "منصة تمنحك فرصة للمشاركة، التنظيم، وصناعة تجربة جامعية مختلفة.",
                "browse": "تصفح الفعاليات",
                "login": "تسجيل الدخول",
                "register": "إنشاء حساب",
                "haveAccount": "لديك حساب؟",
                "new": "جديد؟",
                "searchPlaceholder": "ابحث عن الفعاليات...",
                "search": "ابحث",
                "stats": {
                    "students": "طالب",
                    "events": "فعالية",
                    "clubs": "اتحاد"
                },
                "upcoming": "فعالية قادمة"
            },
            "eventsSection": {
                "title": "الفعاليات المتاحة",
                "subtitle": "اكتشف الفعاليات القادمة واحجز مكانك بسهولة",
                "approved": "معتمدة",
                "pending": "قيد الاعتماد",
                "capacity": "السعة:",
                "showDetails": "عرض التفاصيل",
                "registerNow": "سجل الآن",
                "noEvents": "لا توجد فعاليات معتمدة حالياً",
                "noEventsDesc": "الفعاليات تظهر هنا للجميع بعد أن ينشئها المنظم ويوافق عليها الأدمن. للتسجيل في أي فعالية سجّل دخولك أو أنشئ حساباً.",
                "viewAll": "عرض جميع الفعاليات",
                "loading": "جاري التحميل...",
                "allLoaded": "تم عرض جميع الفعاليات المتاحة"
            },
            "footer": {
                "description": "منصة متكاملة لإدارة وتنظيم الأنشطة والفعاليات الطلابية في الجامعة.",
                "quickLinks": "روابط سريعة",
                "contactUs": "تواصل معنا",
                "rights": "© 2024 SA-Manage. جميع الحقوق محفوظة",
                "privacy": "سياسة الخصوصية",
                "terms": "الشروط والأحكام",
                "location": "جمهوريه الصوامعه شرق"
            },
            "dashboard": {
                "admin": {
                    "title": "لوحة تحكم الأدمن",
                    "subtitle": "نظرة عامة مباشرة من الـ API",
                    "students": "الطلاب",
                    "organizers": "المنظمين",
                    "admins": "المشرفين",
                    "pendingEvents": "فعاليات قيد المراجعة",
                    "totalEvents": "إجمالي الفعاليات",
                    "approved": "الموافق عليها"
                },
                "sidebar": {
                    "student_dashboard": "لوحة التحكم",
                    "student_events": "الفعاليات",
                    "student_requests": "طلباتي",
                    "student_profile": "الملف الشخصي",
                    "organizer_dashboard": "لوحة التحكم",
                    "organizer_events": "فعالياتي",
                    "organizer_registrations": "إدارة التسجيلات",
                    "organizer_attendance": "الحضور",
                    "organizer_assign": "ربط الطالب بالنادي",
                    "admin_dashboard": "لوحة التحكم",
                    "admin_users": "المنظمين",
                    "admin_events": "الفعاليات",
                    "admin_clubs": "الأندية",
                    "admin_reports": "التقارير الشاملة",
                    "logout": "تسجيل الخروج"
                },
                "organizer": {
                    "welcome": "مرحباً",
                    "subtitle": "إدارة فعاليات النادي من الـ API",
                    "createEvent": "إنشاء فعالية جديدة",
                    "totalEvents": "إجمالي الفعاليات",
                    "totalRegistrations": "إجمالي التسجيلات",
                    "createdEvents": "فعاليات منشأة",
                    "latestRegistrations": "آخر تسجيلات",
                    "quickLook": "نظرة سريعة",
                    "quickLookDesc": "الأرقام في الأعلى مبنية على بيانات حقيقية من واجهات المنظم.",
                    "quickSummary": "ملخص سريع",
                    "acceptanceRate": "نسبة القبول",
                    "attendanceRate": "معدل الحضور",
                    "pending": "قيد الانتظار",
                    "overallRating": "التقييم العام"
                },
                "student": {
                    "welcome": "مرحباً",
                    "subtitle": "تابع الفعاليات والأنشطة اللي سجلت فيها في مكان واحد",
                    "registeredEvents": "إجمالي الفعاليات المسجلة",
                    "attendedEvents": "تم الحضور",
                    "pendingEvents": "قيد الانتظار/قادمة",
                    "upcomingEvent": "أقرب فعالية قادمة",
                    "browseMore": "تصفح الفعاليات",
                    "myRegistrations": "تسجيلاتي",
                    "viewAll": "عرض الكل",
                    "registrationDate": "تاريخ التسجيل",
                    "cancel": "إلغاء",
                    "noRegistrations": "لا توجد أي تسجيلات",
                    "browseEvents": "تصفح الفعاليات",
                    "achievements": "الإنجازات",
                    "noUpcomingEvents": "لا توجد فعاليات قادمة",
                    "allRegisteredEvents": "جميع الفعاليات المسجلة",
                    "cancelRegistration": "إلغاء التسجيل",
                    "browseAndRegister": "تصفح وسجّل في الفعاليات",
                    "attended": "حضر الفعالية",
                    "registered": "مسجل",
                    "pending": "قيد الانتظار",
                    "profile": "الملف الشخصي",
                    "profileDesc": "إدارة معلوماتك الشخصية",
                    "student": "طالب",
                    "firstName": "الاسم الأول",
                    "lastName": "اسم العائلة",
                    "email": "البريد الإلكتروني",
                    "emailHint": "لا يمكن تغيير البريد الإلكتروني",
                    "saveChanges": "حفظ التغييرات",
                    "changePassword": "تغيير كلمة المرور",
                    "passwordHint": "تحديث كلمة المرور الخاصة بك",
                    "change": "تغيير",
                    "currentPassword": "كلمة المرور الحالية",
                    "newPassword": "كلمة المرور الجديدة",
                    "passwordRules": "كلمة المرور يجب أن تحتوي على حرف كبير، حرف صغير، رقم ورمز خاص",
                    "confirmPassword": "تأكيد كلمة المرور الجديدة",
                    "changePasswordBtn": "تغيير كلمة المرور"
                }
            },
            "eventsPage": {
                "title": "جميع الفعاليات",
                "subtitle": "استعرض وسجل في الفعاليات المتاحة",
                "searchPlaceholder": "ابحث عن فعالية...",
                "approved": "معتمدة",
                "capacity": "السعة",
                "showDetails": "عرض التفاصيل",
                "noEvents": "لا توجد فعاليات",
                "tryDifferentSearch": "جرب تغيير معايير البحث",
                "previous": "السابق",
                "next": "التالي",
                "page": "صفحة"
            },
            "eventDetails": {
                "notFound": "الفعالية غير موجودة",
                "notFoundDesc": "لم يتم العثور على الفعالية المطلوبة",
                "backToEvents": "العودة للفعاليات",
                "eventDetails": "تفاصيل الفعالية",
                "startDate": "تاريخ البداية",
                "endDate": "تاريخ النهاية",
                "time": "الوقت",
                "location": "المكان",
                "capacity": "السعة",
                "seats": "مقعد",
                "register": "التسجيل في الفعالية",
                "totalCapacity": "السعة الكلية",
                "registered": "تم التسجيل في الفعالية",
                "cancelAnytime": "يمكنك إلغاء التسجيل في أي وقت",
                "attendanceStatus": "حالة الحضور:",
                "cancelRegistration": "إلغاء التسجيل",
                "loginRequired": "يجب تسجيل الدخول للتسجيل في الفعالية",
                "login": "تسجيل الدخول",
                "registerNow": "سجل الآن",
                "terms": "بالتسجيل أنت توافق على شروط الحضور والمشاركة"
            }
        }
    }
};

i18n
    .use(initReactI18next)
    .init({
        resources,
        lng: "ar", // default language
        fallbackLng: "en",
        interpolation: {
            escapeValue: false
        }
    });

export default i18n;
