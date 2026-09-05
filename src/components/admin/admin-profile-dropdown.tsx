"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { adminService } from "@/services/admin.service";
import { authService } from "@/services/auth.service";
import { cn } from "@/lib/utils";
import {
  RiLogoutBoxRLine,
  RiUser3Line,
  RiSettings4Line,
} from "@remixicon/react";

interface AdminProfileDropdownProps {
  className?: string;
  align?: "left" | "right";
}

export function AdminProfileDropdown({
  className,
  align = "right",
}: AdminProfileDropdownProps) {
  const router = useRouter();
  const [profileName, setProfileName] = useState<string>(() => {
    if (typeof window !== "undefined") {
      try {
        return localStorage.getItem("admin_display_name") || "Trader's Community";
      } catch {}
    }
    return "Trader's Community";
  });
  const [email, setEmail] = useState<string>(() => {
    if (typeof window !== "undefined") {
      try {
        return localStorage.getItem("admin_email") || "";
      } catch {}
    }
    return "";
  });
  const [avatar, setAvatar] = useState<string | undefined>(undefined);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const fetchProfile = useCallback(() => {
    adminService
      .getProfile()
      .then((res) => {
        if (res.data?.profile) {
          const p = res.data.profile;
          const name = p.displayName || p.name;
          if (name) {
            setProfileName(name);
            try {
              localStorage.setItem("admin_display_name", name);
            } catch {}
          }
          const emailVal = p.email;
          if (emailVal) {
            setEmail(emailVal);
            try {
              localStorage.setItem("admin_email", emailVal);
            } catch {}
          }
          if (p.avatar) {
            setAvatar(p.avatar);
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
        const name = p.displayName || p.name;
        if (name) {
          setProfileName(name);
          try {
            localStorage.setItem("admin_display_name", name);
          } catch {}
        }
        const emailVal = p.email;
        if (emailVal) {
          setEmail(emailVal);
          try {
            localStorage.setItem("admin_email", emailVal);
          } catch {}
        }
        if (p.avatar) {
          setAvatar(p.avatar);
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

  // Close dropdown menu on click outside or escape key
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setMenuOpen(false);
      }
    }

    if (menuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [menuOpen]);

  const handleLogout = () => {
    authService.removeToken();
    router.replace("/admin/login");
  };

  return (
    <div className={cn("relative", className)} ref={menuRef}>
      {/* Profile Circle Avatar Button */}
      <button
        type="button"
        onClick={() => setMenuOpen((prev) => !prev)}
        aria-expanded={menuOpen}
        aria-haspopup="true"
        aria-label="Admin Profile Menu"
        className={cn(
          "flex items-center justify-center h-9 w-9 rounded-full overflow-hidden border transition-all cursor-pointer shadow-xs focus:outline-none",
          menuOpen
            ? "border-primary ring-2 ring-primary/25"
            : "border-border/80 hover:border-primary/50"
        )}
      >
        {avatar ? (
          <img
            src={avatar}
            alt={profileName}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="h-full w-full bg-primary/15 text-primary font-bold text-xs flex items-center justify-center hover:bg-primary/20 transition-colors">
            {(profileName || "A").charAt(0).toUpperCase()}
          </div>
        )}
      </button>

      {/* Floating Dropdown Menu */}
      {menuOpen && (
        <div
          className={cn(
            "absolute top-full mt-2 w-56 rounded-2xl bg-card border border-border/80 shadow-xl p-1.5 z-50 animate-in fade-in-0 zoom-in-95 duration-150",
            align === "right" ? "right-0" : "left-0"
          )}
        >
          {/* User Info Header */}
          <div className="px-3 py-2.5">
            <p className="text-xs font-semibold text-foreground truncate">
              {profileName}
            </p>
            <p className="text-[11px] text-muted-foreground truncate">
              {email || "Administrator"}
            </p>
          </div>

          <div className="h-[1px] bg-border/60 my-1" />

          {/* Profile Settings */}
          <Link
            href="/admin/settings?tab=profile"
            onClick={() => setMenuOpen(false)}
            className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-foreground hover:bg-surface transition-colors"
          >
            <RiUser3Line className="h-4 w-4 text-muted-foreground" />
            <span>Profile Settings</span>
          </Link>

          {/* General Settings */}
          <Link
            href="/admin/settings"
            onClick={() => setMenuOpen(false)}
            className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-foreground hover:bg-surface transition-colors"
          >
            <RiSettings4Line className="h-4 w-4 text-muted-foreground" />
            <span>General Settings</span>
          </Link>

          <div className="h-[1px] bg-border/60 my-1" />

          {/* Logout Button */}
          <button
            type="button"
            onClick={() => {
              setMenuOpen(false);
              handleLogout();
            }}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-red-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
          >
            <RiLogoutBoxRLine className="h-4 w-4" />
            <span>Log out</span>
          </button>
        </div>
      )}
    </div>
  );
}

export default AdminProfileDropdown;
