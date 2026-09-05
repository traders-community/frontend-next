"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  RiLayoutGridLine,
  RiFileList3Line,
  RiAddCircleLine,
  RiChat1Line,
  RiPriceTag3Line,
  RiSettings4Line,
  RiUser3Line,
  RiArrowLeftLine,
  RiArrowDownSLine,
  RiArrowRightSLine,
  RiLogoutBoxRLine,
  RiMoreFill,
  RiMenuLine,
  RiCloseLine,
  RiSideBarLine,
  RiSunLine,
  RiMoonLine,
} from "@remixicon/react";
import { useTheme } from "next-themes";
import { authService } from "@/services/auth.service";
import { adminService } from "@/services/admin.service";
import { ThemeToggle } from "@/components/theme-toggle";
import { AdminProfileDropdown } from "./admin-profile-dropdown";
import { cn } from "@/lib/utils";

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  exact?: boolean;
}

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, resolvedTheme, setTheme } = useTheme();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleNavigate = (url: string) => {
    setUserMenuOpen(false);
    router.push(url);
  };

  // Profile and quick menu state
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
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

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
          if (p.avatar) setAvatar(p.avatar);
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
        if (p.avatar) setAvatar(p.avatar);
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

  // Re-fetch profile on admin navigation to ensure never stale
  useEffect(() => {
    fetchProfile();
  }, [pathname, fetchProfile]);

  // Close quick menu on click outside or escape key
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Element | null;
      if (target && target.closest("[data-user-menu]")) {
        return;
      }
      setUserMenuOpen(false);
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setUserMenuOpen(false);
      }
    }
    if (userMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [userMenuOpen]);

  // Restore collapsed state from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("admin_sidebar_collapsed");
      if (saved !== null) {
        setIsCollapsed(saved === "true");
      }
    } catch {}
  }, []);

  const toggleCollapse = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("admin_sidebar_collapsed", String(next));
      } catch {}
      return next;
    });
  };

  // Close mobile sidebar on route change & lock body scroll when open
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") setMobileOpen(false);
      };
      window.addEventListener("keydown", handleKeyDown);
      return () => {
        document.body.style.overflow = "";
        window.removeEventListener("keydown", handleKeyDown);
      };
    } else {
      document.body.style.overflow = "";
    }
  }, [mobileOpen]);

  const handleLogout = () => {
    authService.removeToken();
    router.replace("/admin/login");
  };

  interface SubNavItem {
    label: string;
    href: string;
  }

  interface NavItem {
    label: string;
    href: string;
    icon: React.ComponentType<{ className?: string }>;
    exact?: boolean;
    subItems?: SubNavItem[];
  }

  const isBlogRoute = pathname.startsWith("/admin/listBlog") || pathname.startsWith("/admin/addBlog");
  const [blogsExpanded, setBlogsExpanded] = useState(true);

  useEffect(() => {
    if (isBlogRoute) {
      setBlogsExpanded(true);
    }
  }, [isBlogRoute]);

  const mainNav: NavItem[] = [
    { label: "Dashboard", href: "/admin", icon: RiLayoutGridLine, exact: true },
  ];

  const contentNav: NavItem[] = [
    {
      label: "Blogs",
      href: "/admin/listBlog",
      icon: RiFileList3Line,
      subItems: [
        { label: "All Blogs", href: "/admin/listBlog" },
        { label: "Add New", href: "/admin/addBlog" },
      ],
    },
    { label: "Categories", href: "/admin/categories", icon: RiPriceTag3Line },
    { label: "Comments", href: "/admin/comments", icon: RiChat1Line },
  ];

  const systemNav: NavItem[] = [
    { label: "Settings", href: "/admin/settings", icon: RiSettings4Line },
  ];

  const isLinkActive = (href: string, exact: boolean = false) => {
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  };

  const renderNavList = (items: NavItem[], groupTitle?: string) => (
    <div className="space-y-1">
      {/* Group Title or Separator */}
      {groupTitle && (
        isCollapsed ? (
          <div className="w-8 h-[1px] bg-border/70 mx-auto my-2.5" />
        ) : (
          <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/60 px-3 pt-3 pb-1.5">
            {groupTitle}
          </div>
        )
      )}

      {items.map((item) => {
        const hasSubItems = item.subItems && item.subItems.length > 0;
        const active = hasSubItems
          ? item.subItems!.some((sub) => pathname === sub.href)
          : isLinkActive(item.href, item.exact);
        const Icon = item.icon;

        return (
          <div key={item.label} className="space-y-0.5">
            {/* Main Item */}
            <div className="relative group">
              {hasSubItems && !isCollapsed ? (
                <div
                  className={cn(
                    "flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 cursor-pointer select-none",
                    active
                      ? "bg-muted text-foreground font-semibold shadow-2xs"
                      : "text-muted-foreground hover:text-foreground hover:bg-surface-hover"
                  )}
                  onClick={() => setBlogsExpanded((prev) => !prev)}
                >
                  <Link
                    href={item.href}
                    onClick={(e) => e.stopPropagation()}
                    className="flex items-center gap-3 flex-1 min-w-0"
                  >
                    <Icon
                      className={cn(
                        "h-5 w-5 shrink-0 transition-colors",
                        active ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                      )}
                    />
                    <span className="truncate">{item.label}</span>
                  </Link>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setBlogsExpanded((prev) => !prev);
                    }}
                    className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-surface-hover transition-colors cursor-pointer"
                    aria-label="Toggle submenu"
                  >
                    {blogsExpanded ? (
                      <RiArrowDownSLine className="h-4 w-4" />
                    ) : (
                      <RiArrowRightSLine className="h-4 w-4" />
                    )}
                  </button>
                </div>
              ) : (
                <Link
                  href={item.href}
                  className={cn(
                    "relative group flex items-center transition-all duration-150",
                    isCollapsed
                      ? "justify-center w-11 h-11 mx-auto rounded-2xl"
                      : "gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium",
                    active
                      ? "bg-muted text-foreground font-semibold shadow-2xs"
                      : "text-muted-foreground hover:text-foreground hover:bg-surface-hover"
                  )}
                >
                  <Icon
                    className={cn(
                      "h-5 w-5 shrink-0 transition-colors",
                      active ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                    )}
                  />

                  {!isCollapsed && <span className="truncate">{item.label}</span>}

                  {/* ShadCN-Style Left-Pointed Tooltip in Collapsed Mode */}
                  {isCollapsed && (
                    <div
                      role="tooltip"
                      className="absolute left-full ml-3 px-3 py-1.5 bg-black text-white dark:bg-neutral-900 dark:text-neutral-100 text-xs font-semibold rounded-lg shadow-xl whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none z-50 flex items-center"
                    >
                      <div className="absolute right-full top-1/2 -translate-y-1/2 border-[5px] border-transparent border-r-black dark:border-r-neutral-900" />
                      {item.label}
                    </div>
                  )}
                </Link>
              )}
            </div>

            {/* Nested Sub-items (when not collapsed and expanded) */}
            {hasSubItems && !isCollapsed && blogsExpanded && (
              <div className="ml-7 pl-3 border-l border-border/80 space-y-1 py-1">
                {item.subItems!.map((sub) => {
                  const subActive = pathname === sub.href;
                  return (
                    <Link
                      key={sub.href}
                      href={sub.href}
                      className={cn(
                        "block px-3 py-1.5 rounded-lg text-xs font-medium transition-colors",
                        subActive
                          ? "bg-primary/10 text-primary font-semibold"
                          : "text-muted-foreground hover:text-foreground hover:bg-surface-hover"
                      )}
                    >
                      {sub.label}
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );

  const sidebarContent = (
    <div className="h-full flex flex-col justify-between bg-card text-card-foreground border-r border-border/70 select-none">
      {/* Top Header Area */}
      <div>
        {/* Brand & Toggle Row */}
        <div
          className={cn(
            "flex items-center transition-all duration-200",
            isCollapsed
              ? "flex-col gap-3 px-2 pt-4 pb-3"
              : "justify-between px-5 pt-5 pb-4"
          )}
        >
          {/* Logo */}
          <Link href="/admin" className="flex items-center justify-center group shrink-0">
            {isCollapsed ? (
              <div className="h-8 w-8 relative flex items-center justify-center">
                <Image
                  src="/icon.png"
                  alt="Logo"
                  width={32}
                  height={32}
                  priority
                  className="h-8 w-8 object-contain rounded-lg"
                />
              </div>
            ) : (
              <Image
                src="/logo_color.png"
                alt="Logo"
                width={140}
                height={38}
                priority
                className="h-8 w-auto object-contain"
              />
            )}
          </Link>

          {/* Sidebar Collapse Toggle Button */}
          <button
            type="button"
            onClick={toggleCollapse}
            className={cn(
              "hidden lg:flex items-center justify-center p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-surface-hover border border-transparent hover:border-border/60 transition-colors cursor-pointer",
              isCollapsed && "w-9 h-9"
            )}
            title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-label="Toggle sidebar collapse"
          >
            <RiSideBarLine className="h-4 w-4" />
          </button>

          {/* Mobile Close Button */}
          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            className="lg:hidden p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-surface transition-colors"
          >
            <RiCloseLine className="h-5 w-5" />
          </button>
        </div>

        {/* Back to Website Button */}
        <div className={cn("pb-2", isCollapsed ? "px-2 pt-1" : "px-3.5 pt-1 pb-3")}>
          <Link
            href="/"
            className={cn(
              "relative group flex items-center text-xs font-medium text-muted-foreground hover:text-foreground rounded-xl hover:bg-surface border border-transparent hover:border-border/60 transition-all duration-150",
              isCollapsed
                ? "justify-center w-11 h-11 mx-auto"
                : "gap-2 py-2 px-3"
            )}
          >
            <RiArrowLeftLine className="h-4 w-4 text-primary transition-transform duration-150 group-hover:-translate-x-0.5 shrink-0" />
            {!isCollapsed && <span>Back to Website</span>}

            {/* Tooltip for Back to Website in Collapsed Mode */}
            {isCollapsed && (
              <div className="absolute left-full ml-3 px-3 py-1.5 bg-black text-white dark:bg-neutral-900 dark:text-neutral-100 text-xs font-semibold rounded-lg shadow-xl whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none z-50 flex items-center">
                <div className="absolute right-full top-1/2 -translate-y-1/2 border-[5px] border-transparent border-r-black dark:border-r-neutral-900" />
                Back to Website
              </div>
            )}
          </Link>
        </div>

        {/* Navigation Sections */}
        <div className={cn(isCollapsed ? "px-2 space-y-2" : "px-3 space-y-4")}>
          {renderNavList(mainNav, "Main")}
          {renderNavList(contentNav, "Content")}
          {renderNavList(systemNav, "System")}
        </div>
      </div>

      {/* Bottom User Profile & Quick Actions Card (Entire card is clickable) */}
      <div className="p-3 border-t border-border/70 relative" ref={userMenuRef} data-user-menu="true">
        {/* Floating Quick Actions Popup */}
        {userMenuOpen && (
          <div
            data-user-menu="true"
            className={cn(
              "absolute bottom-full mb-2.5 bg-card text-card-foreground border border-border/80 rounded-2xl shadow-2xl p-1.5 z-50 animate-in fade-in-0 zoom-in-95 duration-150",
              isCollapsed ? "left-full ml-2 w-64 -bottom-2" : "left-2 right-2 w-auto"
            )}
          >
            {/* Header info */}
            <div className="px-3 py-2.5">
              <p className="text-xs font-semibold text-foreground truncate">
                {profileName}
              </p>
              <p className="text-[11px] text-muted-foreground truncate">
                {email || "superadmin@traderscommunity.com"}
              </p>
            </div>

            <div className="h-[1px] bg-border/60 my-1" />

            {/* Theme Mode Item - whole bar is clickable just like settings */}
            <button
              type="button"
              onClick={() => {
                setTheme(resolvedTheme === "dark" ? "light" : "dark");
              }}
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-foreground hover:bg-surface-hover transition-colors cursor-pointer text-left"
            >
              <div className="flex items-center gap-2.5">
                {resolvedTheme === "dark" ? (
                  <RiMoonLine className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <RiSunLine className="h-4 w-4 text-muted-foreground" />
                )}
                <span>Theme Mode</span>
              </div>
              <span className="text-[11px] font-medium text-muted-foreground capitalize px-1.5 py-0.5 rounded-md bg-muted/60">
                {theme === "system" ? `System (${resolvedTheme})` : resolvedTheme}
              </span>
            </button>

            <div className="h-[1px] bg-border/60 my-1" />

            {/* Profile Settings Link */}
            <button
              type="button"
              onClick={() => handleNavigate("/admin/settings?tab=profile")}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-foreground hover:bg-surface-hover transition-colors cursor-pointer text-left"
            >
              <RiUser3Line className="h-4 w-4 text-muted-foreground" />
              <span>Profile Settings</span>
            </button>

            {/* General Settings Link */}
            <button
              type="button"
              onClick={() => handleNavigate("/admin/settings")}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-foreground hover:bg-surface-hover transition-colors cursor-pointer text-left"
            >
              <RiSettings4Line className="h-4 w-4 text-muted-foreground" />
              <span>General Settings</span>
            </button>

            <div className="h-[1px] bg-border/60 my-1" />

            {/* Logout Action */}
            <button
              type="button"
              onClick={() => {
                setUserMenuOpen(false);
                handleLogout();
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-red-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer text-left"
            >
              <RiLogoutBoxRLine className="h-4 w-4" />
              <span>Log out</span>
            </button>
          </div>
        )}

        {/* The Clickable User Card (entire thing is clickable) */}
        <button
          type="button"
          onClick={() => setUserMenuOpen((prev) => !prev)}
          className={cn(
            "w-full flex items-center transition-all duration-150 rounded-2xl cursor-pointer text-left focus:outline-none",
            isCollapsed
              ? "justify-center w-11 h-11 mx-auto hover:bg-surface-hover border border-transparent hover:border-border/60"
              : "gap-3 p-2.5 hover:bg-surface-hover border border-transparent hover:border-border/60",
            userMenuOpen && "bg-surface-hover border-border/80 ring-2 ring-primary/20"
          )}
          title={isCollapsed ? `${profileName} - Click for quick actions` : undefined}
          aria-expanded={userMenuOpen}
          aria-haspopup="true"
        >
          {/* Avatar Circle */}
          <div className="h-9 w-9 rounded-full overflow-hidden shrink-0 border border-border/80 flex items-center justify-center bg-primary/15 text-primary font-bold text-xs shadow-2xs">
            {avatar ? (
              <img
                src={avatar}
                alt={profileName}
                className="h-full w-full object-cover"
              />
            ) : (
              <span>{(profileName || "S").charAt(0).toUpperCase()}</span>
            )}
          </div>

          {/* User Details & 3 Dots (when expanded) */}
          {!isCollapsed && (
            <>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-foreground truncate leading-tight">
                  {profileName}
                </p>
                <p className="text-[11px] text-muted-foreground truncate leading-tight mt-0.5">
                  {email || "Administrator"}
                </p>
              </div>

              {/* 3 dots icon */}
              <div className="text-muted-foreground shrink-0 p-1">
                <RiMoreFill className="h-4 w-4" />
              </div>
            </>
          )}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar with Animated Width */}
      <aside
        className={cn(
          "hidden lg:flex flex-col shrink-0 h-screen sticky top-0 transition-all duration-300 ease-in-out z-30",
          isCollapsed ? "w-[72px]" : "w-64 xl:w-68"
        )}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Top Navbar with Hamburger Toggle */}
      <div className="lg:hidden sticky top-0 z-40 flex items-center justify-between px-4 py-2.5 bg-card/95 backdrop-blur-md border-b border-border/80">
        <Link href="/admin" className="flex items-center gap-2">
          <Image
            src="/logo_color.png"
            alt="Logo"
            width={120}
            height={32}
            priority
            className="h-7 w-auto object-contain"
          />
        </Link>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <AdminProfileDropdown align="right" />
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="p-1.5 text-foreground/85 hover:text-foreground transition-colors cursor-pointer focus:outline-none"
            aria-label="Open navigation"
          >
            <RiMenuLine className="h-6 w-6" />
          </button>
        </div>
      </div>

      {/* Mobile Drawer Overlay with Smooth Slide In / Out */}
      <div
        className={cn(
          "fixed inset-0 z-50 flex lg:hidden transition-all duration-300 ease-in-out",
          mobileOpen ? "visible pointer-events-auto" : "invisible pointer-events-none delay-300"
        )}
      >
        {/* Backdrop Fade In / Out */}
        <div
          className={cn(
            "fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-300 ease-in-out",
            mobileOpen ? "opacity-100" : "opacity-0"
          )}
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />

        {/* Slide-in Drawer Container */}
        <div
          className={cn(
            "relative w-72 max-w-[85vw] h-full shadow-2xl z-50 transition-transform duration-300 ease-in-out transform",
            mobileOpen ? "translate-x-0" : "-translate-x-full"
          )}
        >
          {sidebarContent}
        </div>
      </div>
    </>
  );
}

export default AdminSidebar;
