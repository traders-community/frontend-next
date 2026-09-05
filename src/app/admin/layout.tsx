"use client";

import React, { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { authService } from "@/services/auth.service";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const isLoginPage = pathname === "/admin/login";
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    if (isLoginPage) return;

    const authed = authService.isAuthenticated();
    if (!authed) {
      router.replace("/admin/login");
    } else {
      setIsAuthenticated(true);
    }
  }, [isLoginPage, router]);

  // Login page gets a clean standalone card layout without admin sidebar
  if (isLoginPage) {
    return <>{children}</>;
  }

  // Loading state while checking authentication
  if (isAuthenticated === null) {
    return (
      <div suppressHydrationWarning className="min-h-screen flex items-center justify-center bg-background text-foreground">
        <div suppressHydrationWarning className="flex flex-col items-center gap-3">
          <div suppressHydrationWarning className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          <span className="text-xs font-medium text-muted-foreground">Authenticating admin...</span>
        </div>
      </div>
    );
  }

  return (
    <div suppressHydrationWarning className="min-h-screen flex flex-col lg:flex-row bg-background text-foreground">
      {/* Persistent Left Sidebar */}
      <AdminSidebar />

      {/* Main Content Pane */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <main className="flex-1 w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-10">
          {children}
        </main>
        <footer className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-5 sm:py-6 border-t border-border/50 text-xs text-muted-foreground/75 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>Traders Community Admin • © {new Date().getFullYear()}</span>
          <span>
            Developed by{" "}
            <a
              href="https://manankanani.in/"
              target="_blank"
              rel="noopener noreferrer"
             className="font-medium text-primary hover:text-primary-hover transition-colors cursor-pointer"
            >
              Manan Kanani
            </a>
          </span>
        </footer>
      </div>
    </div>
  );
}
