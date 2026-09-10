"use client";

import React, { useEffect, useState, useCallback } from "react";
import { adminService } from "@/services/admin.service";
import { ThemeToggle } from "@/components/theme-toggle";
import { AdminProfileDropdown } from "@/components/admin/admin-profile-dropdown";
import { FadeIn } from "@/components/motion";

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
    <div className="space-y-6 sm:space-y-8">
      {/* Top Welcome Header - Responsive across Mobile and Desktop */}
      <FadeIn direction="down" distance={12} duration={0.42}>
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
      </FadeIn>

      {/* Row 1: 4 Top Metric Cards (Staggered Entrance) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <FadeIn delay={0.06} distance={16} duration={0.42}>
          <div className="rounded-2xl sm:rounded-3xl border border-border/80 bg-card p-6 min-h-[130px] shadow-xs" />
        </FadeIn>
        <FadeIn delay={0.12} distance={16} duration={0.42}>
          <div className="rounded-2xl sm:rounded-3xl border border-border/80 bg-card p-6 min-h-[130px] shadow-xs" />
        </FadeIn>
        <FadeIn delay={0.18} distance={16} duration={0.42}>
          <div className="rounded-2xl sm:rounded-3xl border border-border/80 bg-card p-6 min-h-[130px] shadow-xs" />
        </FadeIn>
        <FadeIn delay={0.24} distance={16} duration={0.42}>
          <div className="rounded-2xl sm:rounded-3xl border border-border/80 bg-card p-6 min-h-[130px] shadow-xs" />
        </FadeIn>
      </div>

      {/* Row 2: Middle Horizontal Card */}
      <FadeIn delay={0.28} distance={18} duration={0.44}>
        <div className="rounded-2xl sm:rounded-3xl border border-border/80 bg-card p-6 sm:p-7 min-h-[160px] shadow-xs" />
      </FadeIn>

      {/* Row 3: Bottom Large Card */}
      <FadeIn delay={0.34} distance={20} duration={0.46}>
        <div className="rounded-2xl sm:rounded-3xl border border-border/80 bg-card p-6 sm:p-7 min-h-[360px] shadow-xs" />
      </FadeIn>
    </div>
  );
}
