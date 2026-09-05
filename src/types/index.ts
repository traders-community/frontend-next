export interface Blog {
  _id: string;
  title: string;
  slug?: string;
  subTitle?: string;
  description: string;
  category: string;
  image: string;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
  pdf?: {
    name?: string;
    contentType?: string;
  };
}

export interface Category {
  _id: string;
  name: string;
  slug?: string;
  description?: string;
  isActive?: boolean;
  sortOrder?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface Comment {
  _id: string;
  blog: string | { _id: string; title?: string };
  name: string;
  content: string;
  isApproved: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface SiteSettings {
  _id?: string;
  siteName?: string;
  exploreUrl?: string;
  showExplorePage?: boolean;
  graphyUrl?: string;
  exploreOffTarget?: "courses" | "graphy";
  createdAt?: string;
  updatedAt?: string;
}

export interface AdminProfile {
  _id?: string;
  email?: string;
  name?: string;
  role?: string;
  displayName?: string;
  bio?: string;
  avatar?: string;
  contactEmail?: string;
  phone?: string;
  website?: string;
  socialLinks?: Array<{ platform: string; url: string }>;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
}

export interface BlogListResponse {
  success: boolean;
  blogs: Blog[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasMore: boolean;
  message?: string;
}

export interface PublicDataResponse {
  categories: Category[];
  settings: SiteSettings | null;
  profile: AdminProfile | null;
}

export interface ConstructMetadataParams {
  title?: string;
  description?: string;
  image?: string;
  canonicalUrl?: string;
  noIndex?: boolean;
  keywords?: string[];
  type?: "website" | "article";
  publishedTime?: string;
  modifiedTime?: string;
  authors?: string[];
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  token?: string;
  message?: string;
}
