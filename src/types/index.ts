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

export type CommentStatus = "pending" | "approved" | "unapproved";

export interface Comment {
  _id: string;
  blog: string | { _id: string; title?: string };
  name: string;
  content: string;
  isApproved: boolean;
  status?: CommentStatus;
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
  autoNewsletterOnPublish?: boolean;
  newsletterSenderName?: string;
  newsletterBatchSize?: number;
  newsletterBatchDelayMs?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface Subscriber {
  _id: string;
  email: string;
  name?: string;
  isActive: boolean;
  source?: string;
  unsubscribeToken?: string;
  unsubscribedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export type CampaignType = "blog_publish" | "custom" | "welcome";
export type CampaignStatus = "draft" | "processing" | "completed" | "failed";

export interface ClickedSubscriberInfo {
  subscriber?: {
    _id: string;
    email: string;
    name?: string;
  };
  targetUrl?: string;
  clickedAt: string;
}

export interface NewsletterCampaign {
  _id: string;
  title: string;
  subject: string;
  type: CampaignType;
  blog?: {
    _id: string;
    title: string;
    slug?: string;
    category?: string;
    image?: string;
    createdAt?: string;
  };
  status: CampaignStatus;
  totalSubscribers: number;
  sentCount: number;
  failedCount: number;
  pendingCount: number;
  clicksCount: number;
  uniqueClicksCount: number;
  clickedSubscribers?: ClickedSubscriberInfo[];
  errorMessage?: string;
  sentAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface NewsletterStats {
  totalSubscribers: number;
  activeSubscribers: number;
  unsubscribedCount: number;
  totalCampaigns: number;
  totalEmailsSent: number;
  totalClicks: number;
  totalUniqueClicks: number;
  avgClickRate: number;
}

export interface SubscriberListResponse {
  success: boolean;
  subscribers: Subscriber[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  message?: string;
}

export interface CampaignListResponse {
  success: boolean;
  campaigns: NewsletterCampaign[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  message?: string;
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

// ==========================================
// Support & Contact Inquiry Types
// ==========================================
export type SupportTicketStatus = "NEW" | "CONTACTED" | "RESOLVED";

export interface SupportTicket {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  topic: string;
  message: string;
  status: SupportTicketStatus;
  adminNotes?: string;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SupportTicketStats {
  total: number;
  newCount: number;
  contactedCount: number;
  resolvedCount: number;
}

export interface CreateSupportTicketInput {
  name: string;
  email: string;
  phone?: string;
  topic?: string;
  message: string;
}

export interface UpdateSupportTicketInput {
  status?: SupportTicketStatus;
  adminNotes?: string;
}

export interface SupportTicketListResponse {
  success: boolean;
  tickets: SupportTicket[];
  total: number;
  page: number;
  totalPages: number;
  limit: number;
  message?: string;
}

export interface SupportTicketStatsResponse {
  success: boolean;
  stats?: SupportTicketStats;
  message?: string;
}
