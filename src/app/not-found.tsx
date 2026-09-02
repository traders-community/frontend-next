import React from "react";
import type { Metadata } from "next";
import { constructMetadata } from "@/lib/seo/metadata";
import { Button } from "@/components/ui/button";
import { RiHome4Line } from "@remixicon/react";

export const metadata: Metadata = constructMetadata({
  title: "404 - Page Not Found",
  description:
    "The page you are looking for does not exist, has been removed, or is temporarily unavailable on Traders Community.",
  noIndex: true,
});

export default function NotFound() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background px-6 py-16 text-foreground transition-colors duration-150">
      {/* Subtle Glow Aura behind 404 */}
      <div className="pointer-events-none absolute h-64 w-64 rounded-full bg-primary/10 blur-3xl sm:h-96 sm:w-96" />

      {/* Main Content Card */}
      <div className="relative z-10 mx-auto max-w-lg text-center">
        {/* Big 404 Heading */}
        <h1 className="mt-4 text-7xl font-extrabold tracking-tight sm:text-9xl">
          <span className="text-primary">4</span>
          <span className="text-foreground">0</span>
          <span className="text-primary">4</span>
        </h1>

        <h2 className="mt-4 text-2xl font-bold tracking-tight sm:text-3xl">
          Page Not Found
        </h2>

        <p className="mt-3 leading-relaxed text-muted-foreground sm:text-base">
          The page you are looking for doesn&apos;t exist, has been
          relocated, or is temporarily unavailable in this session.
        </p>

        {/* Quick Navigation Action Button */}
        <div className="mt-8 flex justify-center">
          <Button href="/" variant="primary" size="md">
            <RiHome4Line className="h-4 w-4" />
            <span>Return Home</span>
          </Button>
        </div>

        {/* Helpful Support Link */}
        <p className="mt-10 text-sm text-muted-foreground">
          Need assistance? Reach out to{" "}
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
