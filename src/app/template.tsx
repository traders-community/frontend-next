import React from "react";

/**
 * Next.js App Router Template.
 * Passes children directly so the full page does NOT animate together as a single block.
 * Individual sections and cards handle their own scroll-triggered entrance (whileInView)
 * when the user actually scrolls to them.
 */
export default function Template({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
