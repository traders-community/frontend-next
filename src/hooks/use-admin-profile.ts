"use client";

import { useCallback, useEffect, useState } from "react";
import { adminService } from "@/services/admin.service";
import { AdminProfile } from "@/types";
import {
  ADMIN_PROFILE_UPDATED_EVENT,
  getStoredAdminDisplayName,
  getStoredAdminEmail,
  rememberAdminProfile,
} from "@/lib/admin-profile-storage";

interface UseAdminProfileOptions {
  /** Shown until a cached or fetched display name is available */
  fallbackName?: string;
  /** Re-fetch when the window regains focus (sidebar / dropdown) */
  refreshOnFocus?: boolean;
}

/**
 * Admin display details (name, email, avatar) kept in sync across the admin shell:
 * seeded from localStorage, refreshed from the API, and updated through the
 * `admin_profile_updated` event dispatched by the settings page.
 */
export function useAdminProfile({ fallbackName = "", refreshOnFocus = false }: UseAdminProfileOptions = {}) {
  const [profileName, setProfileName] = useState<string>(() => getStoredAdminDisplayName(fallbackName));
  const [email, setEmail] = useState<string>(getStoredAdminEmail);
  const [avatar, setAvatar] = useState<string | undefined>(undefined);

  const applyProfile = useCallback((profile: Partial<AdminProfile> | null | undefined) => {
    const summary = rememberAdminProfile(profile);
    if (summary.displayName) setProfileName(summary.displayName);
    if (summary.email) setEmail(summary.email);
    if (summary.avatar) setAvatar(summary.avatar);
  }, []);

  const refresh = useCallback(() => {
    adminService
      .getProfile()
      .then((res) => {
        if (res.data?.profile) applyProfile(res.data.profile);
      })
      .catch(() => {});
  }, [applyProfile]);

  useEffect(() => {
    refresh();

    const onProfileUpdate = (e: Event) => {
      const detail = (e as CustomEvent<AdminProfile | undefined>).detail;
      if (detail) {
        applyProfile(detail);
      } else {
        refresh();
      }
    };

    window.addEventListener(ADMIN_PROFILE_UPDATED_EVENT, onProfileUpdate);
    if (refreshOnFocus) window.addEventListener("focus", refresh);
    return () => {
      window.removeEventListener(ADMIN_PROFILE_UPDATED_EVENT, onProfileUpdate);
      if (refreshOnFocus) window.removeEventListener("focus", refresh);
    };
  }, [refresh, applyProfile, refreshOnFocus]);

  return { profileName, email, avatar, refresh };
}
