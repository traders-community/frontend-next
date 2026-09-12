"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { toast } from "react-toastify";
import {
  RiUser3Line,
  RiCompass3Line,
  RiLockPasswordLine,
  RiAddLine,
  RiDeleteBinLine,
  RiEyeLine,
  RiEyeOffLine,
  RiCheckLine,
  RiExternalLinkLine,
  RiGlobalLine,
  RiTwitterXLine,
  RiLinkedinBoxLine,
  RiYoutubeLine,
  RiTelegramLine,
  RiInstagramLine,
  RiGithubLine,
  RiLink,
  RiShieldCheckLine,
  RiInformationLine,
  RiCameraLine,
} from "@remixicon/react";
import { adminService } from "@/services/admin.service";
import { AdminProfile, SiteSettings } from "@/types";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "motion/react";
import { EASE } from "@/lib/motion";

// Helper for social platform icons
function getSocialIcon(platform: string) {
  const p = (platform || "").toLowerCase().trim();
  if (p.includes("twitter") || p.includes("x.com") || p === "x") return RiTwitterXLine;
  if (p.includes("linkedin")) return RiLinkedinBoxLine;
  if (p.includes("youtube")) return RiYoutubeLine;
  if (p.includes("telegram")) return RiTelegramLine;
  if (p.includes("instagram")) return RiInstagramLine;
  if (p.includes("github")) return RiGithubLine;
  if (p.includes("web") || p.includes("site") || p.includes("blog")) return RiGlobalLine;
  return RiLink;
}

const COMMON_PLATFORMS = [
  "Twitter / X",
  "LinkedIn",
  "YouTube",
  "Telegram",
  "Instagram",
  "GitHub",
  "Website",
];

function SettingsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Read tab from search params (?tab=profile | explore | general | security)
  const tabParam = searchParams.get("tab");
  const initialTab =
    tabParam === "profile"
      ? "profile"
      : tabParam === "security"
      ? "security"
      : "explore";

  const [activeTab, setActiveTab] = useState<"profile" | "explore" | "security">(initialTab);

  // Sync tab with URL
  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab === "profile" || tab === "security") {
      setActiveTab(tab);
    } else if (tab === "explore" || tab === "general") {
      setActiveTab("explore");
    }
  }, [searchParams]);

  const handleTabChange = (newTab: "profile" | "explore" | "security") => {
    setActiveTab(newTab);
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", newTab);
    router.replace(`/admin/settings?${params.toString()}`, { scroll: false });
  };

  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Profile Form State
  const [profile, setProfile] = useState<AdminProfile>({
    email: "",
    displayName: "",
    contactEmail: "",
    phone: "",
    website: "",
    avatar: "",
    bio: "",
    socialLinks: [],
  });

  // Avatar file upload state
  const avatarFileInputRef = useRef<HTMLInputElement>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  // Settings Form State
  const [settings, setSettings] = useState<SiteSettings>({
    showExplorePage: true,
    graphyUrl: "",
    exploreOffTarget: "courses",
  });

  // Security Form State
  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Fetch all settings and profile data from backend
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
        toast.error("Failed to load settings data");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // --- Profile Actions ---
  const handleAvatarFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file (PNG, JPG, WebP)");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error("Avatar image size must be under 10MB");
      return;
    }

    setAvatarFile(file);
    const objectUrl = URL.createObjectURL(file);
    setAvatarPreview(objectUrl);
  };

  const handleRemoveAvatar = () => {
    setAvatarFile(null);
    if (avatarPreview) {
      URL.revokeObjectURL(avatarPreview);
      setAvatarPreview(null);
    }
    if (avatarFileInputRef.current) {
      avatarFileInputRef.current.value = "";
    }
    setProfile((prev) => ({ ...prev, avatar: "" }));
  };

  const handleUpdateSocial = (index: number, key: "platform" | "url", value: string) => {
    setProfile((prev) => {
      const socialLinks = [...(prev.socialLinks || [])];
      socialLinks[index] = { ...socialLinks[index], [key]: value };
      return { ...prev, socialLinks };
    });
  };

  const handleAddSocial = () => {
    setProfile((prev) => ({
      ...prev,
      socialLinks: [...(prev.socialLinks || []), { platform: "", url: "" }],
    }));
  };

  const handleRemoveSocial = (index: number) => {
    setProfile((prev) => ({
      ...prev,
      socialLinks: (prev.socialLinks || []).filter((_, i) => i !== index),
    }));
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSaving(true);
      const cleanSocialLinks = (profile.socialLinks || []).filter(
        (item) => item.platform?.trim() && item.url?.trim()
      );

      let payload: FormData | Partial<AdminProfile>;

      if (avatarFile) {
        const formData = new FormData();
        formData.append("displayName", profile.displayName || "");
        formData.append("email", profile.email || "");
        formData.append("contactEmail", profile.contactEmail || "");
        formData.append("phone", profile.phone || "");
        formData.append("website", profile.website || "");
        formData.append("bio", profile.bio || "");
        formData.append("socialLinks", JSON.stringify(cleanSocialLinks));
        formData.append("avatar", avatarFile);
        payload = formData;
      } else {
        payload = {
          ...profile,
          socialLinks: cleanSocialLinks,
        };
      }

      const res = await adminService.updateProfile(payload);
      if (res.data?.success) {
        toast.success(res.data.message || "Profile updated successfully");
        const updated = res.data.profile || profile;
        setProfile(updated);
        setAvatarFile(null);
        if (avatarPreview) {
          URL.revokeObjectURL(avatarPreview);
          setAvatarPreview(null);
        }
        if (avatarFileInputRef.current) {
          avatarFileInputRef.current.value = "";
        }

        // Sync local storage display details & dispatch custom event for sidebar
        if (typeof window !== "undefined") {
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
    } catch (error: unknown) {
      const err = error as { message?: string; response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || err.message || "Error saving profile");
    } finally {
      setIsSaving(false);
    }
  };

  // --- Explore Settings Actions ---
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSaving(true);
      const res = await adminService.updateSettings(settings);
      if (res.data?.success) {
        toast.success(res.data.message || "Settings updated successfully");
        if (res.data.settings) {
          setSettings(res.data.settings);
        }
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
    } catch (error: unknown) {
      const err = error as { message?: string; response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || err.message || "Error saving settings");
    } finally {
      setIsSaving(false);
    }
  };

  // --- Security / Password Actions ---
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwords.currentPassword) {
      toast.error("Please enter your current password");
      return;
    }
    if (passwords.newPassword.length < 8) {
      toast.error("New password must be at least 8 characters long");
      return;
    }
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
    } catch (error: unknown) {
      const err = error as { message?: string; response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || err.message || "Error changing password");
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center gap-3">
        <div className="h-8 w-8 rounded-full border-3 border-primary border-t-transparent animate-spin" />
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground animate-pulse">
          Loading settings & profile...
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-300">
      {/* Top Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
          Profile & Settings
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
          Manage public author details, Explore routing configurations, and admin credentials
        </p>
      </div>

      {/* Tabs Row (Pill Buttons matching Admin Style) */}
      <div className="flex flex-wrap items-center gap-2 border-b border-border/70 pb-3">
        <button
          type="button"
          onClick={() => handleTabChange("profile")}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-xl sm:rounded-2xl text-xs sm:text-sm font-semibold transition-all cursor-pointer",
            activeTab === "profile"
              ? "bg-black text-white dark:bg-white dark:text-black shadow-xs"
              : "text-muted-foreground hover:text-foreground hover:bg-surface-hover"
          )}
        >
          <RiUser3Line className="h-4 w-4" />
          <span>Author Profile</span>
        </button>

        <button
          type="button"
          onClick={() => handleTabChange("explore")}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-xl sm:rounded-2xl text-xs sm:text-sm font-semibold transition-all cursor-pointer",
            activeTab === "explore"
              ? "bg-black text-white dark:bg-white dark:text-black shadow-xs"
              : "text-muted-foreground hover:text-foreground hover:bg-surface-hover"
          )}
        >
          <RiCompass3Line className="h-4 w-4" />
          <span>Explore Settings</span>
        </button>

        <button
          type="button"
          onClick={() => handleTabChange("security")}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-xl sm:rounded-2xl text-xs sm:text-sm font-semibold transition-all cursor-pointer",
            activeTab === "security"
              ? "bg-black text-white dark:bg-white dark:text-black shadow-xs"
              : "text-muted-foreground hover:text-foreground hover:bg-surface-hover"
          )}
        >
          <RiLockPasswordLine className="h-4 w-4" />
          <span>Security & Password</span>
        </button>
      </div>

      {/* Tab Panels */}
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.2, ease: EASE.outCubic }}
        >
          {/* TAB 1: AUTHOR PROFILE */}
          {activeTab === "profile" && (
            <form onSubmit={handleSaveProfile} className="space-y-6">
              {/* Profile Overview Card with Avatar Preview */}
              <div className="rounded-2xl sm:rounded-3xl border border-border/80 bg-card p-6 sm:p-8 space-y-6 shadow-xs">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 pb-6 border-b border-border/60">
                  {/* Avatar Circle with All Controls Integrated Inside */}
                  <div className="relative group shrink-0">
                    <input
                      type="file"
                      ref={avatarFileInputRef}
                      onChange={handleAvatarFileSelect}
                      accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml"
                      className="hidden"
                    />
                    <div
                      className="relative h-20 w-20 sm:h-24 sm:w-24 rounded-full border-2 border-border/80 bg-surface flex items-center justify-center overflow-hidden shadow-sm group-hover:border-primary/60 transition-all"
                    >
                      <img
                        src={avatarPreview || profile.avatar || "/icon.png"}
                        alt={profile.displayName || "Author Avatar"}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "/icon.png";
                        }}
                      />

                      {/* Dark overlay on hover with in-circle controls */}
                      <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 flex items-center justify-center gap-2 transition-opacity text-white p-1 z-10">
                        {Boolean(profile.avatar || avatarFile || avatarPreview) ? (
                          <>
                            {/* Change Photo Button */}
                            <button
                              type="button"
                              onClick={() => avatarFileInputRef.current?.click()}
                              className="p-2 rounded-full bg-white/20 hover:bg-white text-white hover:text-black transition-all hover:scale-110 shadow-sm cursor-pointer"
                              title="Change photo"
                              aria-label="Change photo"
                            >
                              <RiCameraLine className="h-4 w-4 sm:h-5 sm:w-5" />
                            </button>
                            {/* Remove Photo Button */}
                            <button
                              type="button"
                              onClick={handleRemoveAvatar}
                              className="p-2 rounded-full bg-red-500/80 hover:bg-red-500 text-white transition-all hover:scale-110 shadow-sm cursor-pointer"
                              title="Remove photo"
                              aria-label="Remove photo"
                            >
                              <RiDeleteBinLine className="h-4 w-4 sm:h-5 sm:w-5" />
                            </button>
                          </>
                        ) : (
                          /* Upload Photo Button */
                          <button
                            type="button"
                            onClick={() => avatarFileInputRef.current?.click()}
                            className="flex flex-col items-center justify-center text-white w-full h-full cursor-pointer"
                            title="Upload photo"
                            aria-label="Upload photo"
                          >
                            <RiCameraLine className="h-5 w-5 sm:h-6 sm:w-6 mb-0.5" />
                            <span className="text-[10px] font-semibold">Upload</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Header Text (Clean without any extra text or buttons) */}
                  <div className="min-w-0 flex-1">
                    <h2 className="text-lg font-bold text-foreground">
                      {profile.displayName || profile.name || "Author Profile"}
                    </h2>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {profile.email || "superadmin@traderscommunity.com"}
                    </p>
                  </div>
                </div>

                {/* Primary Information Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                      Display Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={profile.displayName || ""}
                      onChange={(e) => setProfile({ ...profile, displayName: e.target.value })}
                      placeholder="e.g. Yash Adhiya"
                      required
                      className="w-full px-4 py-2.5 text-xs sm:text-sm bg-card border border-border/80 rounded-xl placeholder:text-muted-foreground text-foreground shadow-2xs focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                      Login Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      value={profile.email || ""}
                      onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                      placeholder="admin@traderscommunity.com"
                      required
                      className="w-full px-4 py-2.5 text-xs sm:text-sm bg-card border border-border/80 rounded-xl placeholder:text-muted-foreground text-foreground shadow-2xs focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                      Public Contact Email
                    </label>
                    <input
                      type="email"
                      value={profile.contactEmail || ""}
                      onChange={(e) => setProfile({ ...profile, contactEmail: e.target.value })}
                      placeholder="contact@traderscommunity.com"
                      className="w-full px-4 py-2.5 text-xs sm:text-sm bg-card border border-border/80 rounded-xl placeholder:text-muted-foreground text-foreground shadow-2xs focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={profile.phone || ""}
                      onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                      placeholder="+91 98765 43210"
                      className="w-full px-4 py-2.5 text-xs sm:text-sm bg-card border border-border/80 rounded-xl placeholder:text-muted-foreground text-foreground shadow-2xs focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
                    />
                  </div>

                  <div className="col-span-1 sm:col-span-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                      Website URL
                    </label>
                    <input
                      type="url"
                      value={profile.website || ""}
                      onChange={(e) => setProfile({ ...profile, website: e.target.value })}
                      placeholder="https://traderscommunity.com"
                      className="w-full px-4 py-2.5 text-xs sm:text-sm bg-card border border-border/80 rounded-xl placeholder:text-muted-foreground text-foreground shadow-2xs focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
                    />
                  </div>
                </div>

                {/* Bio / About Author */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                    Author Biography / About Me
                  </label>
                  <textarea
                    value={profile.bio || ""}
                    onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                    rows={4}
                    placeholder="Brief description about your trading experience, research focus, and market philosophy..."
                    className="w-full px-4 py-2.5 text-xs sm:text-sm bg-card border border-border/80 rounded-xl placeholder:text-muted-foreground text-foreground shadow-2xs focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
                  />
                </div>
              </div>

              {/* Social Links Card */}
              <div className="rounded-2xl sm:rounded-3xl border border-border/80 bg-card p-6 sm:p-8 space-y-5 shadow-xs">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-foreground">Social Links & Profiles</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Add your social channels displayed in article footers and author badges
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddSocial}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-border/80 bg-card hover:bg-surface-hover text-xs font-semibold text-foreground shadow-2xs transition-colors cursor-pointer"
                  >
                    <RiAddLine className="h-4 w-4 text-primary" />
                    <span>Add Link</span>
                  </button>
                </div>

                {/* Social Links List */}
                {(!profile.socialLinks || profile.socialLinks.length === 0) ? (
                  <div className="py-8 px-4 rounded-xl border border-dashed border-border/80 text-center bg-surface/30">
                    <RiGlobalLine className="h-8 w-8 text-muted-foreground/60 mx-auto mb-2" />
                    <p className="text-xs font-semibold text-foreground">No social links added yet</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      Click &apos;+ Add Link&apos; to connect your Twitter, LinkedIn, Telegram, YouTube, or website.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {profile.socialLinks.map((social, index) => {
                      const Icon = getSocialIcon(social.platform);
                      return (
                        <div
                          key={index}
                          className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 p-3 rounded-xl border border-border/70 bg-surface/30 animate-in fade-in-50 duration-150"
                        >
                          {/* Platform Input with Icon */}
                          <div className="relative w-full sm:w-56 shrink-0 flex items-center">
                            <Icon className="absolute left-3 h-4 w-4 text-primary pointer-events-none" />
                            <input
                              type="text"
                              value={social.platform}
                              onChange={(e) => handleUpdateSocial(index, "platform", e.target.value)}
                              placeholder="Platform (e.g. Twitter, YouTube)"
                              list={`platforms-list-${index}`}
                              className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-card border border-border/80 rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
                            />
                            <datalist id={`platforms-list-${index}`}>
                              {COMMON_PLATFORMS.map((p) => (
                                <option key={p} value={p} />
                              ))}
                            </datalist>
                          </div>

                          {/* URL Input */}
                          <div className="flex-1 relative flex items-center">
                            <input
                              type="url"
                              value={social.url}
                              onChange={(e) => handleUpdateSocial(index, "url", e.target.value)}
                              placeholder="https://..."
                              className="w-full px-3 py-2 text-xs sm:text-sm bg-card border border-border/80 rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
                            />
                            {social.url && (
                              <a
                                href={social.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="absolute right-2.5 p-1 text-muted-foreground hover:text-foreground transition-colors"
                                title="Open link in new tab"
                              >
                                <RiExternalLinkLine className="h-3.5 w-3.5" />
                              </a>
                            )}
                          </div>

                          {/* Delete Button */}
                          <button
                            type="button"
                            onClick={() => handleRemoveSocial(index)}
                            className="p-2 rounded-lg text-muted-foreground hover:text-red-500 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-colors cursor-pointer shrink-0 self-end sm:self-center"
                            title="Remove social link"
                            aria-label="Remove social link"
                          >
                            <RiDeleteBinLine className="h-4 w-4" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Save Profile Button */}
                <div className="flex items-center justify-end pt-4 border-t border-border/60">
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="inline-flex items-center gap-2 px-6 py-2.5 text-xs sm:text-sm font-semibold rounded-xl bg-black text-white dark:bg-white dark:text-black hover:opacity-90 shadow-xs transition-all cursor-pointer disabled:opacity-50"
                  >
                    {isSaving && (
                      <div className="h-3.5 w-3.5 border-2 border-white dark:border-black border-t-transparent rounded-full animate-spin" />
                    )}
                    <span>{isSaving ? "Saving..." : "Save Profile"}</span>
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* TAB 2: EXPLORE SETTINGS */}
          {activeTab === "explore" && (
            <form onSubmit={handleSaveSettings} className="space-y-6">
              <div className="rounded-2xl sm:rounded-3xl border border-border/80 bg-card p-6 sm:p-8 space-y-6 shadow-xs">
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-foreground">
                    Explore Routing & LMS Configuration
                  </h2>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                    Configure the public Explore tab visibility, Graphy portal redirection, and fallback behavior
                  </p>
                </div>

                {/* Feature Toggle Card */}
                <div className="p-4 sm:p-5 rounded-2xl border border-border/80 bg-surface/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="space-y-0.5 max-w-xl">
                    <p className="text-xs sm:text-sm font-bold text-foreground">
                      Show Explore Page on Navigation
                    </p>
                    <p className="text-xs text-muted-foreground">
                      When enabled, the &apos;Explore&apos; link is rendered on the public header and navigation bar.
                    </p>
                  </div>

                  <label className="relative inline-flex items-center cursor-pointer select-none shrink-0">
                    <input
                      type="checkbox"
                      checked={Boolean(settings.showExplorePage)}
                      onChange={(e) =>
                        setSettings({ ...settings, showExplorePage: e.target.checked })
                      }
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-border after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary shadow-2xs"></div>
                  </label>
                </div>

                {/* Graphy LMS URL Input */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                    Graphy LMS Portal URL
                  </label>
                  <div className="relative flex items-center">
                    <input
                      type="url"
                      value={settings.graphyUrl || ""}
                      onChange={(e) => setSettings({ ...settings, graphyUrl: e.target.value })}
                      placeholder="https://learn.traderscommunity.com"
                      className="w-full px-4 py-2.5 text-xs sm:text-sm bg-card border border-border/80 rounded-xl placeholder:text-muted-foreground text-foreground shadow-2xs focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
                    />
                    {settings.graphyUrl && (
                      <a
                        href={settings.graphyUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="absolute right-3 p-1 text-muted-foreground hover:text-foreground transition-colors"
                        title="Test URL in new tab"
                      >
                        <RiExternalLinkLine className="h-4 w-4" />
                      </a>
                    )}
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-1.5">
                    Direct web address to your Graphy student portal or external curriculum provider.
                  </p>
                </div>

                {/* Explore OFF Target Selector */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                    When Explore Page is OFF: Fallback Redirect
                  </label>
                  <select
                    value={settings.exploreOffTarget || "courses"}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        exploreOffTarget: e.target.value as "courses" | "graphy",
                      })
                    }
                    className="w-full px-4 py-2.5 text-xs sm:text-sm bg-card border border-border/80 rounded-xl text-foreground shadow-2xs focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all cursor-pointer"
                  >
                    <option value="courses">Redirect to Courses (/courses)</option>
                    <option value="graphy">Redirect directly to Graphy URL</option>
                  </select>
                  <p className="text-[11px] text-muted-foreground mt-1.5">
                    Specifies where users should be routed if they visit the Explore URL while Explore is disabled.
                  </p>
                </div>

                {/* Save Settings Button */}
                <div className="flex items-center justify-end pt-4 border-t border-border/60">
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="inline-flex items-center gap-2 px-6 py-2.5 text-xs sm:text-sm font-semibold rounded-xl bg-black text-white dark:bg-white dark:text-black hover:opacity-90 shadow-xs transition-all cursor-pointer disabled:opacity-50"
                  >
                    {isSaving && (
                      <div className="h-3.5 w-3.5 border-2 border-white dark:border-black border-t-transparent rounded-full animate-spin" />
                    )}
                    <span>{isSaving ? "Saving..." : "Save Explore Settings"}</span>
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* TAB 3: SECURITY & PASSWORD */}
          {activeTab === "security" && (
            <form onSubmit={handleChangePassword} className="space-y-6">
              <div className="rounded-2xl sm:rounded-3xl border border-border/80 bg-card p-6 sm:p-8 space-y-6 shadow-xs">
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-foreground">
                    Change Administrator Password
                  </h2>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                    Update the master password used to authenticate into this admin management dashboard
                  </p>
                </div>

                {/* Security Advice Notice */}
                <div className="p-4 rounded-xl border border-border/80 bg-surface/30 flex items-start gap-3 text-xs text-muted-foreground">
                  <RiShieldCheckLine className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  <p>
                    Ensure your new password contains at least 8 characters. We recommend combining letters, numbers, and special symbols for maximum security.
                  </p>
                </div>

                <div className="space-y-4">
                  {/* Current Password */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                      Current Password <span className="text-red-500">*</span>
                    </label>
                    <div className="relative flex items-center">
                      <input
                        type={showCurrentPassword ? "text" : "password"}
                        value={passwords.currentPassword}
                        onChange={(e) =>
                          setPasswords({ ...passwords, currentPassword: e.target.value })
                        }
                        placeholder="Enter current password"
                        required
                        className="w-full pl-4 pr-10 py-2.5 text-xs sm:text-sm bg-card border border-border/80 rounded-xl placeholder:text-muted-foreground text-foreground shadow-2xs focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPassword((prev) => !prev)}
                        className="absolute right-3 p-1 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                        aria-label={showCurrentPassword ? "Hide password" : "Show password"}
                      >
                        {showCurrentPassword ? (
                          <RiEyeOffLine className="h-4 w-4" />
                        ) : (
                          <RiEyeLine className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* New Password */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                      New Password <span className="text-red-500">*</span>
                    </label>
                    <div className="relative flex items-center">
                      <input
                        type={showNewPassword ? "text" : "password"}
                        value={passwords.newPassword}
                        onChange={(e) =>
                          setPasswords({ ...passwords, newPassword: e.target.value })
                        }
                        placeholder="Min 8 characters"
                        minLength={8}
                        required
                        className="w-full pl-4 pr-10 py-2.5 text-xs sm:text-sm bg-card border border-border/80 rounded-xl placeholder:text-muted-foreground text-foreground shadow-2xs focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword((prev) => !prev)}
                        className="absolute right-3 p-1 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                        aria-label={showNewPassword ? "Hide password" : "Show password"}
                      >
                        {showNewPassword ? (
                          <RiEyeOffLine className="h-4 w-4" />
                        ) : (
                          <RiEyeLine className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Confirm New Password */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                      Confirm New Password <span className="text-red-500">*</span>
                    </label>
                    <div className="relative flex items-center">
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        value={passwords.confirmPassword}
                        onChange={(e) =>
                          setPasswords({ ...passwords, confirmPassword: e.target.value })
                        }
                        placeholder="Re-enter new password"
                        minLength={8}
                        required
                        className="w-full pl-4 pr-10 py-2.5 text-xs sm:text-sm bg-card border border-border/80 rounded-xl placeholder:text-muted-foreground text-foreground shadow-2xs focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword((prev) => !prev)}
                        className="absolute right-3 p-1 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                        aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                      >
                        {showConfirmPassword ? (
                          <RiEyeOffLine className="h-4 w-4" />
                        ) : (
                          <RiEyeLine className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Password Match Status Helper */}
                {passwords.newPassword && passwords.confirmPassword && (
                  <div className="flex items-center gap-2 text-xs">
                    {passwords.newPassword === passwords.confirmPassword ? (
                      <span className="flex items-center gap-1 text-emerald-500 font-medium">
                        <RiCheckLine className="h-4 w-4" />
                        Passwords match
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-red-500 font-medium">
                        <RiInformationLine className="h-4 w-4" />
                        Passwords do not match
                      </span>
                    )}
                  </div>
                )}

                {/* Submit Change Password Button */}
                <div className="flex items-center justify-end pt-4 border-t border-border/60">
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="inline-flex items-center gap-2 px-6 py-2.5 text-xs sm:text-sm font-semibold rounded-xl bg-black text-white dark:bg-white dark:text-black hover:opacity-90 shadow-xs transition-all cursor-pointer disabled:opacity-50"
                  >
                    {isSaving && (
                      <div className="h-3.5 w-3.5 border-2 border-white dark:border-black border-t-transparent rounded-full animate-spin" />
                    )}
                    <span>{isSaving ? "Updating..." : "Change Password"}</span>
                  </button>
                </div>
              </div>
            </form>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

export default function AdminSettingsPage() {
  return (
    <Suspense
      fallback={
        <div className="py-24 flex justify-center">
          <div className="h-8 w-8 rounded-full border-3 border-primary border-t-transparent animate-spin" />
        </div>
      }
    >
      <SettingsContent />
    </Suspense>
  );
}
