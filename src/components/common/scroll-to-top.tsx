"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * Ensures the window scroll position is immediately and reliably reset to the top
 * on route changes, preventing partial scroll retention from previous pages.
 */
export function ScrollToTop() {
  const pathname = usePathname();

  useEffect(() => {
    // Immediately scroll to the top
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });

    // Handle any delayed layout shift or post-render tick
    const rafId = requestAnimationFrame(() => {
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    });

    return () => cancelAnimationFrame(rafId);
  }, [pathname]);

  return null;
}

export default ScrollToTop;
