"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "react-toastify";
import {
  RiUser3Line,
  RiSettings4Line,
  RiLockPasswordLine,
} from "@remixicon/react";
import { adminService } from "@/services/admin.service";
import { AdminProfile, SiteSettings } from "@/types";
import { cn } from "@/lib/utils";

function SettingsContent() {
  const searchParams = useSearchParams();
  const initialTab = searchParams.get("tab") === "profile" ? "profile" : "general";

  const [activeTab, setActiveTab] = useState<"general" | "profile" | "security">(initialTab);

  // Sync activeTab when query param ?tab= updates (e.g. from sidebar links)
  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab === "profile" || tab === "security" || tab === "general") {
      setActiveTab(tab);
    } else {
      setActiveTab("general");
    }
  }, [searchParams]);

  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Profile Form State
  const [profile, setProfile] = useState<AdminProfile>({});
  // Settings Form State
  const [settings, setSettings] = useState<SiteSettings>({});
  // Security Form State
  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [profileRes, settingsRes] = await Promise.all([
          adminService.getProfile(),
          adminService.getSettings(),
        ]);

        if (profileRes.data?.profile) {
          setProfile(profileRes.data.profile);
        }
        if (settingsRes.data?.settings) {
          setSettings(settingsRes.data.settings);
        }
      } catch {
        toast.error("Failed to load settings");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleSaveProfile = async (e: React.SubmitEvent) => {
    e.preventDefault();
    try {
      setIsSaving(true);
      const res = await adminService.updateProfile(profile);
      if (res.data?.success) {
        toast.success("Profile updated successfully");
        if (typeof window !== "undefined") {
          const updated = res.data?.profile || profile;
          const name = updated.displayName || updated.name;
          if (name) {
            try {
              localStorage.setItem("admin_display_name", name);
            } catch {}
          }
          const email = updated.email;
          if (email) {
            try {
              localStorage.setItem("admin_email", email);
            } catch {}
          }
          window.dispatchEvent(
            new CustomEvent("admin_profile_updated", {
              detail: updated,
            })
          );
        }
      } else {
        toast.error(res.data?.message || "Failed to update profile");
      }
    } catch {
      toast.error("Error saving profile");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveSettings = async (e: React.SubmitEvent) => {
    e.preventDefault();
    try {
      setIsSaving(true);
      const res = await adminService.updateSettings(settings);
      if (res.data?.success) {
        toast.success("Settings updated successfully");
        if (typeof window !== "undefined") {
          window.dispatchEvent(
            new CustomEvent("admin_settings_updated", {
              detail: res.data?.settings || settings,
            })
          );
        }
      } else {
        toast.error(res.data?.message || "Failed to update settings");
      }
    } catch {
      toast.error("Error saving settings");
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = async (e: React.SubmitEvent) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }

    try {
      setIsSaving(true);
      const res = await adminService.changePassword({
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword,
      });
      if (res.data?.success) {
        toast.success(res.data.message || "Password changed successfully");
        setPasswords({ currentPassword: "", newPassword: "", confirmPassword: "" });
      } else {
        toast.error(res.data?.message || "Failed to change password");
      }
    } catch {
      toast.error("Error changing password");
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center gap-3">
        <div className="h-7 w-7 rounded-full border-2 border-primary border-t-transparent animate-spin" />
        <span className="text-xs text-muted-foreground">Loading settings...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in-50 duration-300">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
          Settings & Profile
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
          Manage administrator profile, site configurations, and account security.
        </p>
      </div>

      {/* Tabs Row */}
      <div className="flex items-center gap-2 border-b border-border/70 pb-3">
        <button
          type="button"
          onClick={() => setActiveTab("general")}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer",
            activeTab === "general"
              ? "bg-black text-white dark:bg-white dark:text-black shadow-xs"
              : "text-muted-foreground hover:text-foreground hover:bg-surface"
          )}
        >
          <RiSettings4Line className="h-4 w-4" />
          <span>General Settings</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("profile")}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer",
            activeTab === "profile"
              ? "bg-black text-white dark:bg-white dark:text-black shadow-xs"
              : "text-muted-foreground hover:text-foreground hover:bg-surface"
          )}
        >
          <RiUser3Line className="h-4 w-4" />
          <span>My Profile</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("security")}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer",
            activeTab === "security"
              ? "bg-black text-white dark:bg-white dark:text-black shadow-xs"
              : "text-muted-foreground hover:text-foreground hover:bg-surface"
          )}
        >
          <RiLockPasswordLine className="h-4 w-4" />
          <span>Security</span>
        </button>
      </div>

      {/* Profile Form */}
      {activeTab === "profile" && (
        <form
          onSubmit={handleSaveProfile}
          className="rounded-2xl sm:rounded-3xl border border-border/80 bg-card p-6 sm:p-7 space-y-5 shadow-xs"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                Display Name
              </label>
              <input
                type="text"
                value={profile.displayName || ""}
                onChange={(e) => setProfile({ ...profile, displayName: e.target.value })}
                className="w-full px-4 py-2.5 text-sm bg-card border border-border/80 rounded-xl text-foreground shadow-2xs focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                Contact Email
              </label>
              <input
                type="email"
                value={profile.contactEmail || ""}
                onChange={(e) => setProfile({ ...profile, contactEmail: e.target.value })}
                className="w-full px-4 py-2.5 text-sm bg-card border border-border/80 rounded-xl text-foreground shadow-2xs focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                Phone Number
              </label>
              <input
                type="text"
                value={profile.phone || ""}
                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                className="w-full px-4 py-2.5 text-sm bg-card border border-border/80 rounded-xl text-foreground shadow-2xs focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                Personal Website
              </label>
              <input
                type="url"
                value={profile.website || ""}
                onChange={(e) => setProfile({ ...profile, website: e.target.value })}
                className="w-full px-4 py-2.5 text-sm bg-card border border-border/80 rounded-xl text-foreground shadow-2xs focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
              Bio / About Me
            </label>
            <textarea
              value={profile.bio || ""}
              onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
              rows={4}
              className="w-full px-4 py-2.5 text-sm bg-card border border-border/80 rounded-xl text-foreground shadow-2xs focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
            />
          </div>

          <div className="flex justify-end pt-3 border-t border-border/60">
            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-2.5 text-xs sm:text-sm font-semibold rounded-xl bg-black text-white dark:bg-white dark:text-black hover:opacity-90 shadow-xs transition-all cursor-pointer disabled:opacity-50"
            >
              {isSaving ? "Saving..." : "Save Profile"}
            </button>
          </div>
        </form>
      )}

      {/* General Settings Form */}
      {activeTab === "general" && (
        <form
          onSubmit={handleSaveSettings}
          className="rounded-2xl sm:rounded-3xl border border-border/80 bg-card p-6 sm:p-7 space-y-5 shadow-xs"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                Site Title
              </label>
              <input
                type="text"
                value={settings.siteName || ""}
                onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
                className="w-full px-4 py-2.5 text-sm bg-card border border-border/80 rounded-xl text-foreground shadow-2xs focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                Explore URL Redirect
              </label>
              <input
                type="text"
                value={settings.exploreUrl || ""}
                onChange={(e) => setSettings({ ...settings, exploreUrl: e.target.value })}
                className="w-full px-4 py-2.5 text-sm bg-card border border-border/80 rounded-xl text-foreground shadow-2xs focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
              />
            </div>
          </div>

          <div className="flex justify-end pt-3 border-t border-border/60">
            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-2.5 text-xs sm:text-sm font-semibold rounded-xl bg-black text-white dark:bg-white dark:text-black hover:opacity-90 shadow-xs transition-all cursor-pointer disabled:opacity-50"
            >
              {isSaving ? "Saving..." : "Save Settings"}
            </button>
          </div>
        </form>
      )}

      {/* Security / Password Form */}
      {activeTab === "security" && (
        <form
          onSubmit={handleChangePassword}
          className="rounded-2xl sm:rounded-3xl border border-border/80 bg-card p-6 sm:p-7 space-y-5 shadow-xs max-w-lg"
        >
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
              Current Password
            </label>
            <input
              type="password"
              value={passwords.currentPassword}
              onChange={(e) =>
                setPasswords({ ...passwords, currentPassword: e.target.value })
              }
              className="w-full px-4 py-2.5 text-sm bg-card border border-border/80 rounded-xl text-foreground shadow-2xs focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
              New Password
            </label>
            <input
              type="password"
              value={passwords.newPassword}
              onChange={(e) =>
                setPasswords({ ...passwords, newPassword: e.target.value })
              }
              className="w-full px-4 py-2.5 text-sm bg-card border border-border/80 rounded-xl text-foreground shadow-2xs focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
              Confirm New Password
            </label>
            <input
              type="password"
              value={passwords.confirmPassword}
              onChange={(e) =>
                setPasswords({ ...passwords, confirmPassword: e.target.value })
              }
              className="w-full px-4 py-2.5 text-sm bg-card border border-border/80 rounded-xl text-foreground shadow-2xs focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
              required
            />
          </div>

          <div className="flex justify-end pt-3 border-t border-border/60">
            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-2.5 text-xs sm:text-sm font-semibold rounded-xl bg-black text-white dark:bg-white dark:text-black hover:opacity-90 shadow-xs transition-all cursor-pointer disabled:opacity-50"
            >
              {isSaving ? "Updating..." : "Change Password"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

export default function AdminSettingsPage() {
  return (
    <Suspense
      fallback={
        <div className="py-20 flex justify-center">
          <div className="h-7 w-7 rounded-full border-2 border-primary border-t-transparent animate-spin" />
        </div>
      }
    >
      <SettingsContent />
    </Suspense>
  );
}
