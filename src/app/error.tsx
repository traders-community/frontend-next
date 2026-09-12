"use client";

import React, { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { RiRefreshLine, RiHome4Line, RiAlertLine } from "@remixicon/react";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorBoundary({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log unexpected client/rendering errors to console
    console.error("App Router Error Caught:", error);
  }, [error]);

  return (
    <div className="relative flex min-h-[70vh] flex-col items-center justify-center overflow-hidden bg-background px-6 py-16 text-foreground transition-colors duration-150">
      {/* Subtle Glow Aura */}
      <div className="pointer-events-none absolute h-64 w-64 rounded-full bg-red-500/10 blur-3xl sm:h-96 sm:w-96" />

      {/* Main Content Card */}
      <div className="relative z-10 mx-auto max-w-lg text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-500/10 text-red-500 border border-red-500/20 mb-6">
          <RiAlertLine className="h-8 w-8" />
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
          Something went wrong
        </h1>

        <p className="mt-3 text-sm sm:text-base leading-relaxed text-muted-foreground">
          An unexpected error occurred while processing this page. You can try refreshing the view
          or return to the home page.
        </p>

        {error?.digest && (
          <p className="mt-2 text-xs font-mono text-muted-foreground/70">
            Error ID: {error.digest}
          </p>
        )}

        {/* Action Buttons */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Button onClick={() => reset()} variant="primary" size="md">
            <RiRefreshLine className="h-4 w-4" />
            <span>Try Again</span>
          </Button>

          <Button href="/" variant="outline" size="md">
            <RiHome4Line className="h-4 w-4" />
            <span>Return Home</span>
          </Button>
        </div>

        {/* Support Link */}
        <p className="mt-10 text-xs text-muted-foreground">
          If this issue persists, please contact{" "}
          <a
            href="mailto:care.traderscommunity@gmail.com"
            className="text-primary underline underline-offset-4 hover:text-primary-hover transition-colors"
          >
            care.traderscommunity@gmail.com
          </a>
        </p>
      </div>
    </div>
  );
}
