import { api } from "@/lib/api/client";
import {
  Subscriber,
  NewsletterCampaign,
  NewsletterStats,
  SubscriberListResponse,
  CampaignListResponse,
  ApiResponse,
} from "@/types";

export const newsletterService = {
  /**
   * Public: Subscribe to newsletter
   */
  async subscribe(data: { email: string; name?: string }) {
    return api.post<ApiResponse<{ alreadySubscribed?: boolean }>>("/newsletter/subscribe", data);
  },

  /**
   * Public: Unsubscribe from newsletter
   */
  async unsubscribe(params: { token?: string; email?: string }) {
    return api.post<ApiResponse>("/newsletter/unsubscribe", params);
  },

  /**
   * Admin: Get paginated subscribers
   */
  async getSubscribers(
    params: {
      page?: number;
      limit?: number;
      status?: string;
      search?: string;
      sort?: string;
      order?: "asc" | "desc";
    } = {}
  ) {
    return api.get<SubscriberListResponse>("/newsletter/admin/subscribers", { params });
  },

  /**
   * Admin: Add a subscriber manually
   */
  async createSubscriber(data: { email: string; name?: string; sendWelcome?: boolean }) {
    return api.post<{ success: boolean; message: string; subscriber?: Subscriber }>(
      "/newsletter/admin/subscribers",
      data
    );
  },

  /**
   * Admin: Toggle subscriber active/unsubscribed status
   */
  async toggleSubscriberStatus(id: string) {
    return api.patch<{ success: boolean; message: string; subscriber?: Subscriber }>(
      `/newsletter/admin/subscribers/${id}/status`,
      {}
    );
  },

  /**
   * Admin: Delete subscriber
   */
  async deleteSubscriber(id: string) {
    return api.delete<{ success: boolean; message: string }>(
      `/newsletter/admin/subscribers/${id}`
    );
  },

  /**
   * Admin: Get sent campaigns / email history
   */
  async getCampaigns(
    params: {
      page?: number;
      limit?: number;
      type?: string;
      status?: string;
      search?: string;
      sort?: string;
      order?: "asc" | "desc";
    } = {}
  ) {
    return api.get<CampaignListResponse>("/newsletter/admin/campaigns", { params });
  },

  /**
   * Admin: Get single campaign details with click breakdown
   */
  async getCampaignDetails(id: string) {
    return api.get<{ success: boolean; campaign?: NewsletterCampaign }>(
      `/newsletter/admin/campaigns/${id}`
    );
  },

  /**
   * Admin: Get newsletter analytics stats
   */
  async getStats() {
    return api.get<{ success: boolean; stats: NewsletterStats }>("/newsletter/admin/stats");
  },

  /**
   * Admin: Send test email to verify SMTP
   */
  async sendTestEmail(email?: string) {
    return api.post<{ success: boolean; message: string; simulated?: boolean }>(
      "/newsletter/admin/test-email",
      { email }
    );
  },

  /**
   * Admin: Verify SMTP configuration status
   */
  async getSmtpStatus() {
    return api.get<{ success: boolean; configured: boolean; message: string }>(
      "/newsletter/admin/smtp-status"
    );
  },
};
