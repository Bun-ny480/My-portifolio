export type ApiOk<T> = { ok: true; data: T; meta?: { page?: number; total?: number; totalPages?: number } };
export type ApiErr = { ok: false; error: { code: string; message: string; details?: unknown } };
export type ApiResponse<T> = ApiOk<T> | ApiErr;

type Json = Record<string, unknown> | undefined;

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(path, {
    credentials: "include",
    headers: {
      "content-type": "application/json",
      ...(init.headers as Record<string, string> | undefined),
    },
    ...init,
  });

  const contentType = res.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    const body = (await res.json()) as ApiResponse<T>;
    if (!res.ok || body.ok === false) {
      const err = body as ApiErr;
      throw new Error(err.error?.message ?? `HTTP ${res.status}`);
    }
    return body.data;
  }

  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return undefined as T;
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body?: Json) =>
    request<T>(path, { method: "POST", body: body ? JSON.stringify(body) : undefined }),
  patch: <T>(path: string, body?: Json) =>
    request<T>(path, { method: "PATCH", body: body ? JSON.stringify(body) : undefined }),
  del: <T>(path: string) => request<T>(path, { method: "DELETE" }),
};

export async function uploadFile(file: File): Promise<{ url: string; size: number; name: string }> {
  const form = new FormData();
  form.append("file", file);
  const res = await fetch("/api/admin/uploads", {
    method: "POST",
    credentials: "include",
    body: form,
  });
  const body = (await res.json()) as ApiResponse<{ url: string; size: number; name: string }>;
  if (!res.ok || body.ok === false) throw new Error((body as ApiErr).error.message);
  return (body as ApiOk<{ url: string; size: number; name: string }>).data;
}

/* ---------- public API types ---------- */
export type Profile = {
  fullName: string;
  headline: string;
  bio: string;
  email: string;
  phone: string;
  whatsapp: string;
  location: string;
  mission: string;
  philosophy: string;
  avatarUrl: string | null;
  resumeUrl: string | null;
};

export type Social = { id: string; label: string; url: string; icon: string; order: number };
export type Skill = { id: string; name: string; description: string | null; proficiency: string | null };
export type SkillCategory = { id: string; name: string; order: number; skills: Skill[] };
export type Technology = { name: string };
export type ProjectImage = { url: string; alt: string; isCover: boolean };
export type ProjectCard = {
  id: string;
  title: string;
  slug: string;
  description: string;
  featured: boolean;
  completedAt: string | null;
  category: { name: string; slug: string } | null;
  images: ProjectImage[];
  technologies: { technology: Technology }[];
};
export type ProjectFull = ProjectCard & {
  features: string[];
  challenges: string | null;
  solutions: string | null;
  githubUrl: string | null;
  liveUrl: string | null;
};
export type Service = {
  id: string;
  title: string;
  slug: string;
  description: string;
  deliverables: string[];
  technologies: string[];
  priceFrom: number | null;
  icon: string;
};
export type BlogPostCard = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  coverUrl: string | null;
  publishedAt: string | null;
  featured: boolean;
  category: { name: string; slug: string } | null;
};
export type BlogPostFull = BlogPostCard & {
  content: string;
  tags: { tag: { name: string; slug: string } }[];
};
export type Experience = {
  id: string;
  title: string;
  organization: string;
  startDate: string;
  endDate: string | null;
  description: string;
};
export type Education = {
  id: string;
  institution: string;
  degree: string;
  startDate: string;
  endDate: string | null;
  description: string | null;
};
export type Certification = {
  id: string;
  name: string;
  issuer: string;
  issuedAt: string;
  url: string | null;
};

/* ---------- typed endpoint helpers ---------- */
export const publicApi = {
  profile: () => api.get<{ profile: Profile | null; socials: Social[] }>("/api/profile"),
  skills: () => api.get<SkillCategory[]>("/api/skills"),
  projects: (params?: { page?: number; limit?: number; q?: string; category?: string }) => {
    const qs = new URLSearchParams();
    if (params?.page) qs.set("page", String(params.page));
    if (params?.limit) qs.set("limit", String(params.limit));
    if (params?.q) qs.set("q", params.q);
    if (params?.category) qs.set("category", params.category);
    const suffix = qs.toString() ? `?${qs}` : "";
    return api.get<ProjectCard[]>(`/api/projects${suffix}`);
  },
  project: (slug: string) => api.get<ProjectFull>(`/api/projects/${slug}`),
  services: () => api.get<Service[]>("/api/services"),
  blog: (params?: { page?: number; limit?: number; category?: string; tag?: string }) => {
    const qs = new URLSearchParams();
    if (params?.page) qs.set("page", String(params.page));
    if (params?.limit) qs.set("limit", String(params.limit));
    if (params?.category) qs.set("category", params.category);
    if (params?.tag) qs.set("tag", params.tag);
    const suffix = qs.toString() ? `?${qs}` : "";
    return api.get<BlogPostCard[]>(`/api/blog${suffix}`);
  },
  blogPost: (slug: string) => api.get<BlogPostFull>(`/api/blog/${slug}`),
  experience: () => api.get<Experience[]>("/api/experience"),
  education: () => api.get<Education[]>("/api/education"),
  certifications: () => api.get<Certification[]>("/api/certifications"),
  contact: (payload: {
    fullName: string;
    email: string;
    phone?: string;
    subject: string;
    message: string;
    website?: string;
  }) => api.post<{ id: string | null; message: string }>("/api/contact", payload),
};
