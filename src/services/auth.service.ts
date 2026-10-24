import { api } from "@/lib/api/client";
import { LoginCredentials, AuthResponse } from "@/types";

const TOKEN_COOKIE_NAMES = ["admin_token", "token"] as const;
const COOKIE_MAX_AGE_SECONDS = 604800; // 7 days

/** Cookie attributes; `Secure` is added automatically on HTTPS origins */
const cookieAttributes = () => {
  const secure = typeof window !== "undefined" && window.location.protocol === "https:" ? "; Secure" : "";
  return `path=/; SameSite=Lax${secure}`;
};

const writeTokenCookies = (token: string) => {
  const encoded = encodeURIComponent(token);
  for (const name of TOKEN_COOKIE_NAMES) {
    document.cookie = `${name}=${encoded}; ${cookieAttributes()}; max-age=${COOKIE_MAX_AGE_SECONDS}`;
  }
};

const clearTokenCookies = () => {
  for (const name of TOKEN_COOKIE_NAMES) {
    document.cookie = `${name}=; ${cookieAttributes()}; max-age=0`;
  }
};

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
      writeTokenCookies(token);
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
      clearTokenCookies();
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
        writeTokenCookies(token);
      } else {
        clearTokenCookies();
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
