"use client";

import React, { useEffect, useState, useCallback } from "react";
import { adminService } from "@/services/admin.service";
import { ThemeToggle } from "@/components/theme-toggle";
import { AdminProfileDropdown } from "@/components/admin/admin-profile-dropdown";

export default function AdminDashboardPage() {
  const [profileName, setProfileName] = useState<string>(() => {
    if (typeof window !== "undefined") {
      try {
        return localStorage.getItem("admin_display_name") || "";
      } catch {}
    }
    return "";
  });

  const fetchProfile = useCallback(() => {
    adminService
      .getProfile()
      .then((res) => {
        if (res.data?.profile) {
          const p = res.data.profile;
          const name = p.displayName || p.name || "";
          if (name) {
            setProfileName(name);
            try {
              localStorage.setItem("admin_display_name", name);
            } catch {}
          }
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetchProfile();

    const onProfileUpdate = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail) {
        const p = customEvent.detail;
        const name = p.displayName || p.name || "";
        if (name) {
          setProfileName(name);
          try {
            localStorage.setItem("admin_display_name", name);
          } catch {}
        }
      } else {
        fetchProfile();
      }
    };

    window.addEventListener("admin_profile_updated", onProfileUpdate);
    window.addEventListener("focus", fetchProfile);
    return () => {
      window.removeEventListener("admin_profile_updated", onProfileUpdate);
      window.removeEventListener("focus", fetchProfile);
    };
  }, [fetchProfile]);

  const firstName = profileName.trim() ? profileName.trim().split(" ")[0] : "";

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in-50 duration-300">
      {/* Top Welcome Header - Responsive across Mobile and Desktop */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-foreground tracking-tight">
            Welcome back{firstName ? `, ${firstName}` : ""}
          </h1>
          <p className="mt-0.5 sm:mt-1 text-xs sm:text-sm text-muted-foreground">
            Here&apos;s your account overview
          </p>
        </div>

        {/* Desktop-only: Inline Theme Toggle & Profile Dropdown (on mobile, they live cleanly in the sticky top navbar) */}
        <div className="hidden lg:flex items-center gap-2.5">
          <ThemeToggle />
          <AdminProfileDropdown align="right" />
        </div>
      </div>

      {/* Row 1: 4 Top Metric Cards (Blank Boxes) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="rounded-2xl sm:rounded-3xl border border-border/80 bg-card p-6 min-h-[130px] shadow-xs" />
        <div className="rounded-2xl sm:rounded-3xl border border-border/80 bg-card p-6 min-h-[130px] shadow-xs" />
        <div className="rounded-2xl sm:rounded-3xl border border-border/80 bg-card p-6 min-h-[130px] shadow-xs" />
        <div className="rounded-2xl sm:rounded-3xl border border-border/80 bg-card p-6 min-h-[130px] shadow-xs" />
      </div>

      {/* Row 2: Middle Horizontal Card (Blank Box) */}
      <div className="rounded-2xl sm:rounded-3xl border border-border/80 bg-card p-6 sm:p-7 min-h-[160px] shadow-xs" />

      {/* Row 3: Bottom Large Card (Blank Box) */}
      <div className="rounded-2xl sm:rounded-3xl border border-border/80 bg-card p-6 sm:p-7 min-h-[360px] shadow-xs" />
    </div>
  );
}
