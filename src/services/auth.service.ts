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
   * Persists auth token in localStorage.
   */
  setToken(token: string) {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem("token", token);
    } catch (e) {
      console.error("Failed to store auth token in localStorage:", e);
    }
  },

  /**
   * Clears auth token from localStorage.
   */
  removeToken() {
    if (typeof window === "undefined") return;
    try {
      localStorage.removeItem("token");
    } catch (e) {
      console.error("Failed to remove auth token from localStorage:", e);
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
