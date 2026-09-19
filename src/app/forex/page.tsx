import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { constructMetadata } from "@/lib/seo/metadata";
import { settingsService } from "@/services";
import {
  RiExchangeDollarLine,
  RiArticleLine,
  RiCompass3Line,
  RiArrowRightUpLine,
} from "@remixicon/react";

// Enable ISR Caching on Vercel Edge with 60-second background revalidation
export const revalidate = 60;

export const metadata: Metadata = constructMetadata({
  title: "Forex Trading",
  description:
    "Explore global foreign exchange trading strategies, macroeconomics, and currency market mechanics from Traders Community.",
  canonicalUrl: "/forex",
});

export default async function ForexPage() {
  let settings;
  try {
    const res = await settingsService.getPublicSettings(60);
    settings = res.data?.settings;
  } catch {
    // Graceful fallback
  }

  const graphyUrl =
    settings?.graphyUrl || "https://pennywisepuns.graphy.com/s/store";

  return (
    <div className="w-full min-h-[calc(100vh-140px)] flex items-center justify-center py-16 sm:py-24">
      {/* Container aligned with sticky navbar pill width */}
      <div className="w-full max-w-4xl lg:max-w-5xl mx-auto px-4 sm:px-6 text-center">
        <div className="flex flex-col items-center max-w-2xl mx-auto">
          {/* Main Icon */}
          <div className="flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-3xl bg-primary/10 text-primary border border-primary/30 shadow-xl shadow-primary/5 mb-6">
            <RiExchangeDollarLine className="h-8 w-8 sm:h-10 sm:w-10" />
          </div>

          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-primary/30 bg-primary/10 text-primary text-xs font-semibold w-fit mb-4">
            <span>Track in Development</span>
          </div>

          {/* Heading */}
          <h1 className="text-3xl sm:text-5xl font-extrabold text-foreground tracking-tight leading-tight">
            Forex is coming soon
          </h1>

          {/* Description */}
          <p className="mt-4 text-sm sm:text-base text-muted-foreground leading-relaxed max-w-xl">
            We are curating comprehensive curriculums covering currency pairs, macroeconomic indicators, technical analysis, and risk models. Meanwhile, browse our blogs or visit the Graphy Store.
          </p>

          {/* CTAs */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 w-full sm:w-auto">
            <Link
              href="/"
              className="inline-flex h-11 w-full sm:w-auto items-center justify-center gap-2 rounded-full bg-primary px-7 text-sm font-semibold text-black hover:bg-primary/90 hover:scale-[1.02] active:scale-[0.98] shadow-md shadow-primary/20 transition-all duration-150 cursor-pointer"
            >
              <RiArticleLine className="h-4 w-4" />
              <span>Our Blogs</span>
            </Link>

            <Link
              href="/explore"
              className="inline-flex h-11 w-full sm:w-auto items-center justify-center gap-2 rounded-full border border-border bg-card px-6 text-sm font-medium text-foreground hover:border-primary/50 hover:text-primary transition-all duration-150 cursor-pointer"
            >
              <RiCompass3Line className="h-4 w-4" />
              <span>Explore Tracks</span>
            </Link>

            <a
              href={graphyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-11 w-full sm:w-auto items-center justify-center gap-2 rounded-full border border-border bg-card px-6 text-sm font-medium text-foreground hover:border-primary/50 hover:text-primary transition-all duration-150 cursor-pointer"
            >
              <span>Graphy Store</span>
              <RiArrowRightUpLine className="h-4 w-4" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
