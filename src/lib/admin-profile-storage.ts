import type { AdminProfile } from "@/types";

/**
 * Single home for the admin display details cached in localStorage so the sidebar,
 * profile dropdown and dashboard greet the admin instantly before the profile request resolves.
 */
const DISPLAY_NAME_KEY = "admin_display_name";
const EMAIL_KEY = "admin_email";

export const ADMIN_PROFILE_UPDATED_EVENT = "admin_profile_updated";

const safeGet = (key: string): string | null => {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
};

const safeSet = (key: string, value: string) => {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, value);
  } catch {
    // Storage may be unavailable (private mode, quota, sandboxed iframe)
  }
};

export const getStoredAdminDisplayName = (fallback = "") => safeGet(DISPLAY_NAME_KEY) || fallback;

export const getStoredAdminEmail = () => safeGet(EMAIL_KEY) || "";

export const storeAdminEmail = (email: string) => safeSet(EMAIL_KEY, email);

export interface AdminProfileSummary {
  displayName: string;
  email: string;
  avatar?: string;
}

/** Extracts the display fields from a profile payload and mirrors them to localStorage. */
export const rememberAdminProfile = (
  profile: Partial<AdminProfile> | null | undefined
): AdminProfileSummary => {
  const displayName = profile?.displayName || profile?.name || "";
  const email = profile?.email || "";
  if (displayName) safeSet(DISPLAY_NAME_KEY, displayName);
  if (email) safeSet(EMAIL_KEY, email);
  return { displayName, email, avatar: profile?.avatar || undefined };
};

/** Notifies every mounted admin surface that the profile changed (settings page save). */
export const dispatchAdminProfileUpdated = (profile: AdminProfile) => {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(ADMIN_PROFILE_UPDATED_EVENT, { detail: profile }));
};
