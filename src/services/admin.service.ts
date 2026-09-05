import { api } from "@/lib/api/client";
import { Blog, Comment, Category, SiteSettings, AdminProfile } from "@/types";

export interface DashboardData {
  blogs: number;
  comments: number;
  drafts: number;
  recentBlogs: Blog[];
}

export interface DashboardResponse {
  success: boolean;
  dashboardData?: DashboardData;
  message?: string;
}

export interface AdminProfileResponse {
  success: boolean;
  profile?: AdminProfile;
  message?: string;
}

export const adminService = {
  /**
   * Fetches summary dashboard metrics and recent blogs.
   */
  async getDashboard() {
    return api.get<DashboardResponse>("/admin/dashboard");
  },

  /**
   * Fetches the current logged in admin user profile.
   */
  async getProfile() {
    return api.get<AdminProfileResponse>("/admin/profile");
  },

  /**
   * Updates admin profile information.
   */
  async updateProfile(data: Partial<AdminProfile>) {
    return api.put<AdminProfileResponse>("/admin/profile", data);
  },

  /**
   * Fetches all site settings for admin.
   */
  async getSettings() {
    return api.get<{ success: boolean; settings?: SiteSettings }>("/admin/settings");
  },

  /**
   * Updates site settings.
   */
  async updateSettings(data: Partial<SiteSettings>) {
    return api.put<{ success: boolean; message?: string; settings?: SiteSettings }>("/admin/settings", data);
  },

  /**
   * Fetches paginated comments for moderation.
   */
  async getAllComments(
    params: {
      page?: number;
      limit?: number;
      status?: string;
      search?: string;
      sort?: string;
      order?: "asc" | "desc";
    } = {}
  ) {
    return api.get<{
      success: boolean;
      comments: Comment[];
      page: number;
      totalPages: number;
      total?: number;
      message?: string;
    }>("/admin/comments", { params });
  },

  /**
   * Approves a comment by ID.
   */
  async approveComment(id: string) {
    return api.post<{ success: boolean; message: string }>("/admin/approve-comment", { id });
  },

  /**
   * Deletes a comment by ID.
   */
  async deleteComment(id: string) {
    return api.post<{ success: boolean; message: string }>("/admin/delete-comment", { id });
  },

  /**
   * Changes the admin account password.
   */
  async changePassword(data: { currentPassword: string; newPassword: string }) {
    return api.post<{ success: boolean; message: string }>("/admin/change-password", data);
  },
};

export default adminService;
