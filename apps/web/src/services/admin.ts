import { api, uploadFile, uploadMediaFile, type MediaItem, type Profile, type Social, type SkillCategory, type Service } from "./api";

export type AdminUser = { id: string; email: string; name: string; role: string };

export type AdminProject = {
  id: string;
  title: string;
  slug: string;
  description: string;
  features: string[];
  challenges: string | null;
  solutions: string | null;
  githubUrl: string | null;
  liveUrl: string | null;
  completedAt: string | null;
  featured: boolean;
  published: boolean;
  seoTitle: string | null;
  seoDescription: string | null;
  categoryId: string;
  category: { name: string; slug: string };
  images: { id: string; url: string; alt: string; order: number; isCover: boolean }[];
  technologies: { technology: { id: string; name: string } }[];
};

export type AdminProjectInput = {
  title: string;
  slug: string;
  description: string;
  categoryId: string;
  featured: boolean;
  published: boolean;
  githubUrl?: string;
  liveUrl?: string;
  completedAt?: string;
  features: string[];
  challenges?: string;
  solutions?: string;
  seoTitle?: string;
  seoDescription?: string;
  technologyIds: string[];
};

export type AdminBlogPost = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverUrl: string | null;
  published: boolean;
  featured: boolean;
  publishedAt: string | null;
  categoryId: string | null;
  category: { id: string; name: string; slug: string } | null;
  tags: { tag: { id: string; name: string; slug: string } }[];
};

export type AdminContactMessage = {
  id: string;
  fullName: string;
  email: string;
  phone: string | null;
  subject: string;
  message: string;
  status: "NEW" | "READ" | "REPLIED" | "ARCHIVED";
  createdAt: string;
  replies: { id: string; body: string; createdAt: string }[];
};

export const adminApi = {
  /* auth */
  login: (email: string, password: string) =>
    api.post<AdminUser>("/api/admin/auth/login", { email, password }),
  logout: () => api.post<void>("/api/admin/auth/logout"),
  me: () => api.get<AdminUser>("/api/admin/auth/me"),

  /* projects */
  projects: (params?: { page?: number; limit?: number; q?: string }) => {
    const qs = new URLSearchParams();
    if (params?.page) qs.set("page", String(params.page));
    if (params?.limit) qs.set("limit", String(params.limit));
    if (params?.q) qs.set("q", params.q);
    return api.get<AdminProject[]>(`/api/admin/projects${qs.toString() ? "?" + qs : ""}`);
  },
  project: (id: string) => api.get<AdminProject>(`/api/admin/projects/${id}`),
  createProject: (data: AdminProjectInput) => api.post<AdminProject>("/api/admin/projects", data as unknown as Record<string, unknown>),
  updateProject: (id: string, data: Partial<AdminProjectInput>) =>
    api.patch<AdminProject>(`/api/admin/projects/${id}`, data as unknown as Record<string, unknown>),
  deleteProject: (id: string) => api.del<void>(`/api/admin/projects/${id}`),
  addProjectImage: (id: string, data: { url: string; alt: string; order?: number; isCover?: boolean }) =>
    api.post<AdminProject["images"][number]>(`/api/admin/projects/${id}/images`, data),
  setProjectImageCover: (id: string, imageId: string) =>
    api.patch<AdminProject["images"][number]>(`/api/admin/projects/${id}/images/${imageId}`, { isCover: true }),
  deleteProjectImage: (id: string, imageId: string) =>
    api.del<void>(`/api/admin/projects/${id}/images/${imageId}`),

  /* project categories (from public endpoint, since admin list is same) */
  projectCategories: () => api.get<{ id: string; name: string; slug: string }[]>("/api/project-categories"),

  /* blog */
  blogPosts: (params?: { page?: number; limit?: number; q?: string }) => {
    const qs = new URLSearchParams();
    if (params?.page) qs.set("page", String(params.page));
    if (params?.limit) qs.set("limit", String(params.limit));
    if (params?.q) qs.set("q", params.q);
    return api.get<AdminBlogPost[]>(`/api/admin/blog/posts${qs.toString() ? "?" + qs : ""}`);
  },
  blogPost: (id: string) => api.get<AdminBlogPost>(`/api/admin/blog/posts/${id}`),
  createBlogPost: (data: Record<string, unknown>) => api.post<AdminBlogPost>("/api/admin/blog/posts", data),
  updateBlogPost: (id: string, data: Record<string, unknown>) =>
    api.patch<AdminBlogPost>(`/api/admin/blog/posts/${id}`, data),
  deleteBlogPost: (id: string) => api.del<void>(`/api/admin/blog/posts/${id}`),
  blogCategories: () => api.get<{ id: string; name: string; slug: string }[]>("/api/admin/blog/categories"),
  blogTags: () => api.get<{ id: string; name: string; slug: string }[]>("/api/admin/blog/tags"),
  createBlogCategory: (data: { name: string; slug: string }) => api.post("/api/admin/blog/categories", data),
  createBlogTag: (data: { name: string; slug: string }) => api.post("/api/admin/blog/tags", data),

  /* messages */
  messages: (params?: { page?: number; limit?: number; status?: string }) => {
    const qs = new URLSearchParams();
    if (params?.page) qs.set("page", String(params.page));
    if (params?.limit) qs.set("limit", String(params.limit));
    if (params?.status) qs.set("status", params.status);
    return api.get<AdminContactMessage[]>(`/api/admin/messages/contact${qs.toString() ? "?" + qs : ""}`);
  },
  updateMessageStatus: (id: string, status: string) =>
    api.patch<AdminContactMessage>(`/api/admin/messages/contact/${id}`, { status }),
  replyToMessage: (id: string, body: string) =>
    api.post<{ id: string; body: string; createdAt: string }>(`/api/admin/messages/contact/${id}/replies`, { body }),
  deleteMessage: (id: string) => api.del<void>(`/api/admin/messages/contact/${id}`),

  /* profile */
  profile: () => api.get<{ profile: Profile | null; socials: Social[] }>("/api/admin/profile"),
  updateProfile: (data: Partial<Profile>) => api.patch<Profile>("/api/admin/profile", data as Record<string, unknown>),
  createSocial: (data: { label: string; url: string; icon: string; order?: number }) =>
    api.post<Social>("/api/admin/profile/socials", data),
  deleteSocial: (id: string) => api.del<void>(`/api/admin/profile/socials/${id}`),

  /* services */
  services: () => api.get<Service[]>("/api/admin/services"),
  createService: (data: Record<string, unknown>) => api.post<Service>("/api/admin/services", data),
  updateService: (id: string, data: Record<string, unknown>) => api.patch<Service>(`/api/admin/services/${id}`, data),
  deleteService: (id: string) => api.del<void>(`/api/admin/services/${id}`),

  /* skills */
  skillCategories: () => api.get<SkillCategory[]>("/api/admin/skills/categories"),
  createSkill: (data: Record<string, unknown>) => api.post("/api/admin/skills", data),
  deleteSkill: (id: string) => api.del<void>(`/api/admin/skills/${id}`),
  createSkillCategory: (data: { name: string; order?: number }) => api.post("/api/admin/skills/categories", data),
  deleteSkillCategory: (id: string) => api.del<void>(`/api/admin/skills/categories/${id}`),

  /* upload */
  upload: uploadFile,
  media: () => api.get<MediaItem[]>("/api/admin/media"),
  uploadMedia: uploadMediaFile,
  updateMedia: (id: string, data: Partial<Pick<MediaItem, "title" | "description" | "type" | "published">>) =>
    api.patch<MediaItem>(`/api/admin/media/${id}`, data as Record<string, unknown>),
  deleteMedia: (id: string) => api.del<void>(`/api/admin/media/${id}`),
};
