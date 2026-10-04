"use client";

import React, { useEffect, useState } from "react";

/**
 * Non-intrusive Reading Progress Indicator for long-form editorial content.
 * Mounts fixed at the top of the viewport to display current scroll depth.
 */
export function ReadingProgressBar() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        const currentProgress = (window.scrollY / totalHeight) * 100;
        setProgress(Math.min(100, Math.max(0, currentProgress)));
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (progress <= 0) return null;

  return (
    <div
      className="fixed top-0 left-0 right-0 h-[3px] bg-primary z-50 transition-all duration-75 pointer-events-none origin-left shadow-[0_0_8px_rgba(0,201,80,0.45)]"
      style={{ width: `${progress}%` }}
      aria-hidden="true"
    />
  );
}

export default ReadingProgressBar;
