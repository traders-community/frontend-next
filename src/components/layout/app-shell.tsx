"use client";

import React, { useEffect } from "react";
import { usePathname } from "next/navigation";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { DisclaimerGate } from "@/components/common/disclaimer-gate";
import { ScrollToTop } from "@/components/common/scroll-to-top";
import { authService } from "@/services/auth.service";

interface AppShellProps {
  children: React.ReactNode;
}

/**
 * AppShell manages conditional layout chrome.
 * Admin and Login routes omit public marketing headers, footers, and disclaimer gates,
 * presenting a dedicated, distraction-free interface.
 */
export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();

  useEffect(() => {
    // Keep admin cookie synchronized with client token for SSR draft preview authorization
    authService.syncTokenCookie();
  }, []);

  const isAuthOrAdmin =
    pathname?.startsWith("/admin") || pathname === "/login" || pathname?.startsWith("/login");

  if (isAuthOrAdmin) {
    return (
      <div suppressHydrationWarning className="min-h-full flex flex-col flex-1">
        {children}
      </div>
    );
  }

  return (
    <>
      <DisclaimerGate />
      <ScrollToTop />
      <Navbar />
      <main className="flex-1 relative z-10">{children}</main>
      <Footer />
    </>
  );
}

export default AppShell;
