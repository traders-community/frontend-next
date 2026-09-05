import { api } from "@/lib/api/client";
import { SiteSettings, AdminProfile } from "@/types";

export interface PublicSettingsResponse {
  success: boolean;
  settings?: SiteSettings;
  message?: string;
}

export interface PublicProfileResponse {
  success: boolean;
  profile?: AdminProfile;
  message?: string;
}

/**
 * Dedicated Settings Service for fetching site configuration and author profile.
 */
export const settingsService = {
  /**
   * Fetches public site settings (Explore page toggle, Graphy URL, etc.).
   */
  async getPublicSettings(revalidate: number | false = 0) {
    return api.get<PublicSettingsResponse>("/admin/public-settings", {
      revalidate,
    });
  },

  /**
   * Fetches public author/admin profile for author cards on blogs.
   */
  async getPublicProfile(revalidate: number | false = 0) {
    return api.get<PublicProfileResponse>("/admin/public-profile", {
      revalidate,
    });
  },
};

export default settingsService;
