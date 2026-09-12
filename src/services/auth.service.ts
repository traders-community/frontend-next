import { api } from "@/lib/api/client";
import { LoginCredentials, AuthResponse } from "@/types";

export const authService = {
  /**
   * Authenticates admin with email and password.
   */
  async login(credentials: LoginCredentials) {
    return api.post<AuthResponse>("/admin/login", credentials);
  },

  /**
   * Retrieves active auth token from localStorage if in browser.
   */
  getToken(): string | null {
    if (typeof window === "undefined") return null;
    try {
      return localStorage.getItem("token");
    } catch {
      return null;
    }
  },

  /**
   * Persists auth token in localStorage and mirrors to cookie for Next.js SSR.
   */
  setToken(token: string) {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem("token", token);
      const encoded = encodeURIComponent(token);
      document.cookie = `admin_token=${encoded}; path=/; SameSite=Lax; max-age=604800`;
      document.cookie = `token=${encoded}; path=/; SameSite=Lax; max-age=604800`;
    } catch (e) {
      console.error("Failed to store auth token:", e);
    }
  },

  /**
   * Clears auth token from localStorage and cookie.
   */
  removeToken() {
    if (typeof window === "undefined") return;
    try {
      localStorage.removeItem("token");
      document.cookie = "admin_token=; path=/; max-age=0; SameSite=Lax";
      document.cookie = "token=; path=/; max-age=0; SameSite=Lax";
    } catch (e) {
      console.error("Failed to remove auth token:", e);
    }
  },

  /**
   * Syncs existing localStorage token to cookie if missing (e.g. after refresh/tab open).
   */
  syncTokenCookie() {
    if (typeof window === "undefined") return;
    try {
      const token = this.getToken();
      if (token) {
        const encoded = encodeURIComponent(token);
        document.cookie = `admin_token=${encoded}; path=/; SameSite=Lax; max-age=604800`;
        document.cookie = `token=${encoded}; path=/; SameSite=Lax; max-age=604800`;
      } else {
        document.cookie = "admin_token=; path=/; max-age=0; SameSite=Lax";
        document.cookie = "token=; path=/; max-age=0; SameSite=Lax";
      }
    } catch {
      // Storage/cookie restricted
    }
  },

  /**
   * Checks if user is authenticated client-side.
   */
  isAuthenticated(): boolean {
    return Boolean(this.getToken());
  },
};

export default authService;
