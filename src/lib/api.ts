// في التطوير نستخدم نفس الـ origin عشان الـ proxy يتعامل مع الطلبات ويتجنب CORS
const BASE_URL = import.meta.env.DEV
  ? ""
  : "https://localhost:7198";

export const getToken = (): string | null => localStorage.getItem("token");

const errorTranslations: Record<string, string> = {
  "Passwords must have at least one non alphanumeric character.":
    "كلمة المرور يجب أن تحتوي على حرف خاص واحد على الأقل (مثل @ # ! $)",
  "Passwords must have at least one digit ('0'-'9').":
    "كلمة المرور يجب أن تحتوي على رقم واحد على الأقل",
  "Passwords must have at least one uppercase ('A'-'Z').":
    "كلمة المرور يجب أن تحتوي على حرف كبير واحد على الأقل",
  "Passwords must have at least one lowercase ('a'-'z').":
    "كلمة المرور يجب أن تحتوي على حرف صغير واحد على الأقل",
  "Passwords must be at least 6 characters.":
    "كلمة المرور يجب أن تكون 6 أحرف على الأقل",
  "Invalid login attempt.": "البريد الإلكتروني أو كلمة المرور غير صحيحة",
  "User not found.": "المستخدم غير موجود",
  "Email is already taken.": "هذا البريد الإلكتروني مسجل بالفعل",
  "DuplicateUserName": "هذا البريد الإلكتروني مسجل بالفعل",
};

function translateApiError(msg: string): string {
  if (!msg) return "حدث خطأ غير متوقع";
  for (const [en, ar] of Object.entries(errorTranslations)) {
    if (msg.includes(en)) return ar;
  }
  return msg;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data: T;
  errors: string[];
}

async function request<T = unknown>(
  endpoint: string,
  options: RequestInit = {},
): Promise<ApiResponse<T>> {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  let res: Response;
  try {
    const fetchOptions: RequestInit = {
      ...options,
      headers,
      cache: options.cache || "no-store", // Force no cache unless specified
    };

    res = await fetch(`${BASE_URL}${endpoint}`, fetchOptions);
  } catch {
    throw new Error("فشل الاتصال بالسيرفر. تأكد من اتصالك بالإنترنت");
  }

  let body: any;
  let text = "";
  try {
    text = await res.text();
    body = text ? JSON.parse(text) : {};
  } catch {
    console.warn("API returned non-JSON response:", text);
    // If response is OK, use the raw text as the data instead of throwing
    if (res.ok) {
      body = { success: true, message: text, data: text };
    } else {
      throw new Error(res.statusText || "حدث خطأ في الاتصال بالسيرفر - بيانات غير صحيحة");
    }
  }

  if (!res.ok || (body && body.success === false)) {
    console.error("API ERROR DETECTED:", { status: res.status, url: res.url, body, text });
    let apiMsg = body?.message || body?.title || body?.detail || "";

    if (body?.errors) {
      if (Array.isArray(body.errors)) {
        if (body.errors.length > 0) {
          apiMsg = body.errors.join(", ");
        }
      } else if (typeof body.errors === "object") {
        const errValues = Object.values(body.errors).flat();
        if (errValues.length > 0) {
          apiMsg = errValues.join(", ");
        }
      }
    }

    if (!apiMsg && typeof text === 'string' && text.length > 0) {
      try {
        const textObj = JSON.parse(text);
        apiMsg = textObj?.Message || textObj?.message || textObj?.title || textObj?.detail || text;
      } catch {
        apiMsg = text.length < 200 ? text : "";
      }
    }

    const translated = translateApiError(apiMsg);
    throw new Error(translated || "حدث خطأ غير متوقع - تواصل مع الدعم الفني");
  }

  return body as ApiResponse<T>;
}

// ==================== Account API ====================

export const accountApi = {
  login: (email: string, password: string) =>
    request<string>("/api/Account/login", {
      method: "POST",
      body: JSON.stringify({ email: email.trim(), password }),
    }),

  register: (body: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    role: string;
    level?: number;
  }) =>
    request<string>("/api/Account/register", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  forgotPassword: (email: string) =>
    request<string>("/api/Account/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email: email.trim() }),
    }),

  resetPassword: (email: string, token: string, newPassword: string) =>
    request<string>("/api/Account/reset-password", {
      method: "POST",
      body: JSON.stringify({ email: email.trim(), token, newPassword }),
    }),

  logout: () => request<string>("/api/Account/logout", { method: "POST" }),

  changePassword: (
    email: string,
    currentPassword: string,
    newPassword: string,
  ) =>
    request<string>("/api/Account/change-password", {
      method: "POST",
      body: JSON.stringify({ email, currentPassword, newPassword }),
    }),

  getProfile: () =>
    request<{
      id: string;
      firstName: string;
      lastName: string;
      email: string;
      level: number;
      clubId: string | null;
      roles: string[];
    }>("/api/Account/profile", {
      method: "GET",
    }),

  updateProfile: (firstName: string, lastName: string) =>
    request<string>("/api/Account/profile", {
      method: "PUT",
      body: JSON.stringify({ firstName, lastName }),
    }),
};

export interface AdminUserDto {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  isActive?: boolean;
  level?: number | null;
  clubId?: number | null;
}

export interface AdminEventDto {
  id: number;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  location: string;
  capacity: number;
  isApproved: boolean;
  clubId: number;
}

export interface ClubDto {
  id: number;
  name: string | null;
  description: string | null;
  organizerId: string | null;
}

export const adminApi = {
  getOrganizers: () =>
    request<AdminUserDto[]>("/api/Admin/organizers", { method: "GET" }),

  createOrganizer: (body: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    role: "Organizer";
    level: number;
  }) =>
    request<string>("/api/Admin/organizers", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  updateOrganizer: (
    id: string,
    body: { firstName: string; lastName: string; email: string },
  ) =>
    request<string>(`/api/Admin/organizers/${id}`, {
      method: "PUT",
      body: JSON.stringify(body),
    }),

  deleteOrganizer: (id: string) =>
    request<string>(`/api/Admin/organizers/${id}`, { method: "DELETE" }),

  toggleUserStatus: (id: string) =>
    request<string>(`/api/Admin/users/${id}/toggle-status`, { method: "POST" }),

  assignClubHead: (clubId: number, userId: string) =>
    request<string>(`/api/Admin/clubs/${clubId}/assign-head`, {
      method: "POST",
      body: JSON.stringify(userId),
    }),

  approveEvent: (eventId: number) =>
    request<string>(`/api/Admin/events/${eventId}/approve`, { method: "POST" }),

  rejectEvent: (eventId: number) =>
    request<string>(`/api/Admin/events/${eventId}/reject`, { method: "POST" }),

  getReports: () => request<unknown>("/api/Admin/reports", { method: "GET" }),

  getEvents: (page = 1, pageSize = 50) =>
    request<AdminEventDto[]>(
      `/api/Admin/events?page=${page}&pageSize=${pageSize}`,
      { method: "GET" },
    ),

  getStudents: (page = 1, pageSize = 50) =>
    request<unknown[]>(`/api/Admin/students?page=${page}&pageSize=${pageSize}`, {
      method: "GET",
    }),

  getStudentById: (id: string) =>
    request<unknown>(`/api/Admin/students/${id}`, { method: "GET" }),

  updateStudent: (
    id: string,
    body: { firstName: string; lastName: string; email: string },
  ) =>
    request<string>(`/api/Admin/students/${id}`, {
      method: "PUT",
      body: JSON.stringify(body),
    }),

  deleteStudent: (id: string) =>
    request<string>(`/api/Admin/students/${id}`, { method: "DELETE" }),

  getStudentActivities: (id: string) =>
    request<unknown[]>(`/api/Admin/students/${id}/activities`, {
      method: "GET",
    }),

  getAdmins: () => request<unknown[]>("/api/Admin/admins", { method: "GET" }),

  createAdmin: (body: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    role: "Admin";
  }) =>
    request<string>("/api/Admin/admins", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  updateAdmin: (
    id: string,
    body: { firstName: string; lastName: string; email: string },
  ) =>
    request<string>(`/api/Admin/admins/${id}`, {
      method: "PUT",
      body: JSON.stringify(body),
    }),

  deleteAdmin: (id: string) =>
    request<string>(`/api/Admin/admins/${id}`, { method: "DELETE" }),

  getClubs: (page = 1, pageSize = 100) =>
    request<ClubDto[]>(`/api/Club?page=${page}&pageSize=${pageSize}`, {
      method: "GET",
    }),

  getClubById: (id: number) =>
    request<ClubDto>(`/api/Club/${id}`, { method: "GET" }),

  createClub: (body: {
    name: string;
    description: string;
    organizerId?: string;
  }) =>
    request<{ name?: string; description?: string; organizerId?: string }>(
      "/api/Club",
      {
        method: "POST",
        body: JSON.stringify(body),
      },
    ),

  updateClub: (
    id: number,
    body: { name: string; description: string; organizerId?: string },
  ) =>
    request<{ name?: string; description?: string; organizerId?: string }>(
      `/api/Club/${id}`,
      {
        method: "PUT",
        body: JSON.stringify(body),
      },
    ),

  deleteClub: (id: number) =>
    request<string>(`/api/Club/${id}`, { method: "DELETE" }),

  addClubMember: (id: number, studentId: string) =>
    request<string>(`/api/Club/${id}/members`, {
      method: "POST",
      body: JSON.stringify({ studentId }),
    }),

  getClubMembers: (id: number) =>
    request<string[]>(`/api/Club/${id}/members`, { method: "GET" }),

  removeClubMember: (id: number, studentId: string) =>
    request<string>(`/api/Club/${id}/members/${studentId}`, {
      method: "DELETE",
    }),

  getEventFeedback: (eventId: number) =>
    request<unknown[]>(`/api/feedback/event/${eventId}`, {
      method: "GET",
    }),

  getEventStats: (eventId: number) =>
    request<unknown>(`/api/feedback/event/${eventId}/rating`, {
      method: "GET",
    }),
};

// ==================== Student API ====================

export interface StudentEventDto {
  id: number;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  location: string;
  capacity: number;
  isApproved: boolean;
  clubId: number;
  clubName?: string;
}

export interface StudentActivityDto {
  id: number;
  registrationDate: string;
  eventId: number;
  studentId: string;
}

/**
 * جلب الفعاليات للجميع (الهوم والزوار) بدون إرسال توكن.
 * عشان الفعاليات تظهر على الصفحة الرئيسة: الباك إند لازم يسمح بـ GET /api/Student/events بدون Authorization
 * ويرجع كل الفعاليات المعتمدة (اللي المنظم أنشأها والأدمن وافق عليها).
 */
export async function getPublicEvents(params?: {
  page?: number;
  pageSize?: number;
  searchQuery?: string;
  clubId?: number;
}): Promise<ApiResponse<StudentEventDto[]>> {
  const q = new URLSearchParams();
  if (params?.searchQuery) q.set("searchQuery", params.searchQuery);
  if (params?.clubId) q.set("clubId", String(params.clubId));
  q.set("page", String(params?.page ?? 1));
  q.set("pageSize", String(params?.pageSize ?? 10));
  const url = `${BASE_URL}/api/public/events?${q.toString()}`;
  try {
    const token = getToken();
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
    const res = await fetch(url, {
      method: "GET",
      headers,
    });
    const text = await res.text();
    let body: any = {};
    try {
      body = text ? JSON.parse(text) : {};
    } catch {
      body = {};
    }
    if (!res.ok) return { success: false, message: body?.message || "", data: [], errors: body?.errors || [] };
    const data = Array.isArray(body) ? body : (body?.data ?? []);
    return { success: true, message: body?.message || "", data, errors: body?.errors || [] };
  } catch {
    return { success: false, message: "", data: [], errors: [] };
  }
}

export async function getPublicEventById(id: number): Promise<ApiResponse<StudentEventDto>> {
  try {
    const token = getToken();
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
    const res = await fetch(`${BASE_URL}/api/public/events/${id}`, {
      method: "GET",
      headers,
    });
    const text = await res.text();
    let body: any = {};
    try {
      body = text ? JSON.parse(text) : {};
    } catch {
      body = {};
    }
    if (!res.ok) return { success: false, message: body?.message || "", data: null as any, errors: body?.errors || [] };
    const data = (body && typeof body === 'object' && 'id' in body) ? body : body?.data;
    return { success: true, message: body?.message || "", data, errors: body?.errors || [] };
  } catch {
    return { success: false, message: "", data: null as any, errors: [] };
  }
}

export async function getPublicEventFeedback(eventId: number): Promise<ApiResponse<any[]>> {
  try {
    const token = getToken();
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
    const res = await fetch(`${BASE_URL}/api/feedback/event/${eventId}`, {
      method: "GET",
      headers,
      cache: "no-store",
    });
    const text = await res.text();
    let body: any = {};
    try {
      body = text ? JSON.parse(text) : {};
    } catch {
      body = {};
    }
    const data = Array.isArray(body) ? body : (body?.data ?? []);
    if (!res.ok) return { success: false, message: body?.message || "", data: [], errors: body?.errors || [] };
    return { success: true, message: body?.message || "", data, errors: body?.errors || [] };
  } catch {
    return { success: false, message: "", data: [], errors: [] };
  }
}

export const studentApi = {
  getEvents: (params?: {
    searchQuery?: string;
    clubId?: number;
    page?: number;
    pageSize?: number;
  }) => {
    const q = new URLSearchParams();
    if (params?.searchQuery) q.set("searchQuery", params.searchQuery);
    if (params?.clubId) q.set("clubId", String(params.clubId));
    q.set("page", String(params?.page ?? 1));
    q.set("pageSize", String(params?.pageSize ?? 10));
    return request<StudentEventDto[]>(
      `/api/Student/events?${q.toString()}`,
      { method: "GET" },
    );
  },

  getEventById: (id: number) =>
    request<StudentEventDto>(`/api/Student/events/${id}`, { method: "GET" }),

  registerForEvent: (eventId: number) =>
    request<{ message: string; qrCode: string }>(`/api/Student/events/${eventId}/register`, { method: "POST" }),

  getMyActivities: () =>
    request<StudentActivityDto[]>("/api/Student/my-activities", {
      method: "GET",
    }),

  unregisterFromEvent: (eventId: number) =>
    request<string>(`/api/Student/events/${eventId}/unregister`, {
      method: "DELETE",
    }),

  getAttendanceStatus: (eventId: number) =>
    request<string>(`/api/Student/events/${eventId}/attendance-status`, {
      method: "GET",
    }),

  submitFeedback: (eventId: number, rating: number, comment: string) =>
    request<string>("/api/feedback", {
      method: "POST",
      body: JSON.stringify({
        eventId: Number(eventId),
        rating: Number(rating),
        comment: String(comment || "")
      }),
    }),

};

// ==================== Organizer API ====================

export interface OrganizerEventDto {
  id: number;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  location: string;
  capacity: number;
  isApproved: boolean;
  clubId: number;
}

export interface OrganizerRegistrationDto {
  id: number;
  registrationDate: string;
  eventId: number;
  studentId: string;
}

export const organizerApi = {
  createEvent: (body: {
    title: string;
    description: string;
    startDate: string;
    endDate: string;
    location: string;
    capacity: number;
    isApproved: boolean;
    clubId: number;
  }) =>
    request<OrganizerEventDto>("/api/Organizer/events", {
      method: "POST",
      body: JSON.stringify({
        title: body.title,
        description: body.description,
        startDate: body.startDate,
        endDate: body.endDate,
        location: body.location,
        capacity: body.capacity,
        isApproved: body.isApproved,
        clubId: body.clubId,
      }),
    }),

  getEvents: () =>
    request<OrganizerEventDto[]>("/api/Organizer/events", { method: "GET" }),

  updateEvent: (
    id: number,
    body: {
      title: string;
      description: string;
      startDate: string;
      endDate: string;
      location: string;
      capacity: number;
    },
  ) =>
    request<OrganizerEventDto>(`/api/Organizer/events/${id}`, {
      method: "PUT",
      body: JSON.stringify(body),
    }),

  deleteEvent: (id: number) =>
    request<string>(`/api/Organizer/events/${id}`, { method: "DELETE" }),

  getEventRegistrations: (eventId: number, page = 1, pageSize = 10) =>
    request<OrganizerRegistrationDto[]>(
      `/api/Organizer/events/${eventId}/registrations?page=${page}&pageSize=${pageSize}`,
      { method: "GET" },
    ),

  markAttendance: (body: { registrationId: number; eventId: number }) =>
    request<string>("/api/Organizer/attendance/mark", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  closeRegistration: (id: number) =>
    request<string>(`/api/Organizer/events/${id}/close-registration`, {
      method: "POST",
    }),

  openRegistration: (id: number) =>
    request<string>(`/api/Organizer/events/${id}/open-registration`, {
      method: "POST",
    }),

  updateStatus: (id: number, status: number) =>
    request<string>(`/api/Organizer/events/${id}/status`, {
      method: "PUT",
      body: JSON.stringify(status),
    }),

  markAttendanceByEmail: (body: { eventId: number; email: string }) =>
    request<string>("/api/Organizer/attendance/mark-by-email", {
      method: "POST",
      body: JSON.stringify(body),
    }),
};
