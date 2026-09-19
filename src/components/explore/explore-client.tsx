"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { SiteSettings } from "@/types";
import { settingsService } from "@/services";
import { FadeIn } from "@/components/motion";
import {
  RiGraduationCapLine,
  RiStore2Line,
  RiArrowRightLine,
  RiArrowRightUpLine,
  RiCompass3Line,
  RiLineChartLine,
  RiBookOpenLine,
  RiExchangeDollarLine,
  RiInformationLine,
} from "@remixicon/react";

interface ExploreClientProps {
  initialSettings?: SiteSettings;
}

export function ExploreClient({ initialSettings }: ExploreClientProps) {
  const [settings, setSettings] = useState<SiteSettings | undefined>(initialSettings);

  // Request fresh settings from backend on each component mount
  useEffect(() => {
    let isMounted = true;

    async function fetchLatestSettings() {
      try {
        const res = await settingsService.getPublicSettings(0);
        if (isMounted && res.data?.settings) {
          setSettings(res.data.settings);
        }
      } catch (error) {
        console.error("Failed to fetch fresh settings on explore mount:", error);
      }
    }

    fetchLatestSettings();

    // Listen for real-time updates from Admin Settings
    const handleSettingsUpdated = (e: Event) => {
      const customEvent = e as CustomEvent<SiteSettings>;
      if (customEvent.detail) {
        setSettings(customEvent.detail);
      }
    };
    window.addEventListener("admin_settings_updated", handleSettingsUpdated);

    return () => {
      isMounted = false;
      window.removeEventListener("admin_settings_updated", handleSettingsUpdated);
    };
  }, []);

  const graphyUrl =
    settings?.graphyUrl || "https://pennywisepuns.graphy.com/s/store";

  // Card visibility booleans (default to true if undefined)
  const showCourses = settings?.showCoursesCard !== false;
  const showGraphy = settings?.showGraphyCard !== false;
  const showFno = settings?.showFnoCard !== false;
  const showForex = settings?.showForexCard !== false;

  const hasAnyCardVisible = showCourses || showGraphy || showFno || showForex;

  return (
    <div className="w-full min-h-[calc(100vh-80px)] py-4 sm:py-6">
      {/* Container aligned with sticky navbar pill width */}
      <div className="w-full max-w-4xl lg:max-w-5xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-10 lg:gap-14 items-start">
          {/* Left Column: Vertically centered in initial screen AND remains sticky centered */}
          <div className="lg:self-stretch">
            <div className="lg:sticky lg:top-20 lg:h-[calc(100vh-6rem)] lg:flex lg:flex-col lg:justify-center">
              <FadeIn direction="up" distance={20} duration={0.48}>
                <div className="flex flex-col">
                  <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-primary/30 bg-primary/10 text-primary text-xs font-semibold w-fit mb-5">
                    <RiCompass3Line className="h-4 w-4" />
                    <span>Explore</span>
                  </div>

                  <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-foreground tracking-tight leading-[1.18]">
                    Choose how you want to continue learning.
                  </h1>

                  <p className="mt-4 text-base sm:text-lg text-muted-foreground leading-relaxed">
                    Browse our community course tracks, derivatives mastery, and forex modules here, or head over to the Graphy store for the complete external course catalogue.
                  </p>

                  {/* Value Highlights */}
                  <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs sm:text-sm">
                    <div className="flex items-center gap-2.5 text-foreground/85 font-medium">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary border border-primary/30">
                        <RiLineChartLine className="h-3.5 w-3.5" />
                      </span>
                      <span>Market research &amp; analysis</span>
                    </div>
                    <div className="flex items-center gap-2.5 text-foreground/85 font-medium">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary border border-primary/30">
                        <RiBookOpenLine className="h-3.5 w-3.5" />
                      </span>
                      <span>Derivatives &amp; trading concepts</span>
                    </div>
                  </div>
                </div>
              </FadeIn>
            </div>
          </div>

          {/* Right Column: Destination Cards with Marquee-Style Bottom Transparent Fade */}
          <div className="relative w-full lg:pt-14">
            <FadeIn direction="up" distance={20} duration={0.48} delay={0.12}>
              <div className="flex flex-col gap-4 pb-28">
                {/* Card 1: Community Courses */}
                {showCourses && (
                  <Link
                    href="/courses"
                    className="group relative flex flex-col p-6 rounded-2xl sm:rounded-3xl border border-primary/40 bg-card/90 backdrop-blur-md shadow-lg shadow-black/5 dark:shadow-black/25 hover:border-primary hover:shadow-xl hover:shadow-primary/10 hover:-translate-y-0.5 transition-all duration-200"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/15 text-primary border border-primary/30 group-hover:bg-primary group-hover:text-black transition-colors duration-200">
                        <RiGraduationCapLine className="h-6 w-6" />
                      </div>
                      <span className="text-[11px] font-semibold px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
                        Coming Soon
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-4">
                      <div className="min-w-0">
                        <h2 className="text-lg sm:text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                          Community Courses
                        </h2>
                        <p className="mt-1 text-xs sm:text-sm text-muted-foreground leading-relaxed">
                          View upcoming plans, curriculum details, and educational materials.
                        </p>
                      </div>
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border bg-surface text-foreground/70 group-hover:bg-primary group-hover:text-black group-hover:border-primary transition-all duration-200">
                        <RiArrowRightLine className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                      </div>
                    </div>
                  </Link>
                )}

                {/* Card 2: External Graphy Store */}
                {showGraphy && (
                  <a
                    href={graphyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group relative flex flex-col p-6 rounded-2xl sm:rounded-3xl border border-border/80 dark:border-white/10 bg-card/90 backdrop-blur-md shadow-lg shadow-black/5 dark:shadow-black/25 hover:border-primary/60 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-0.5 transition-all duration-200"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-surface text-foreground/80 border border-border group-hover:border-primary/40 group-hover:text-primary transition-colors duration-200">
                        <RiStore2Line className="h-6 w-6" />
                      </div>
                      <span className="text-[11px] font-semibold px-3 py-1 rounded-full bg-surface text-muted-foreground border border-border">
                        External Store
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-4">
                      <div className="min-w-0">
                        <h2 className="text-lg sm:text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                          Graphy Store
                        </h2>
                        <p className="mt-1 text-xs sm:text-sm text-muted-foreground leading-relaxed">
                          Open the external course catalog and video learning portal.
                        </p>
                      </div>
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border bg-surface text-foreground/70 group-hover:bg-primary group-hover:text-black group-hover:border-primary transition-all duration-200">
                        <RiArrowRightUpLine className="h-4 w-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                      </div>
                    </div>
                  </a>
                )}

                {/* Card 3: Futures & Options (F&O) */}
                {showFno && (
                  <Link
                    href="/fno"
                    className="group relative flex flex-col p-6 rounded-2xl sm:rounded-3xl border border-border/80 dark:border-white/10 bg-card/90 backdrop-blur-md shadow-lg shadow-black/5 dark:shadow-black/25 hover:border-primary/60 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-0.5 transition-all duration-200"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary border border-primary/20 group-hover:bg-primary group-hover:text-black transition-colors duration-200">
                        <RiLineChartLine className="h-6 w-6" />
                      </div>
                      <span className="text-[11px] font-semibold px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
                        Coming Soon
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-4">
                      <div className="min-w-0">
                        <h2 className="text-lg sm:text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                          Futures &amp; Options (F&amp;O)
                        </h2>
                        <p className="mt-1 text-xs sm:text-sm text-muted-foreground leading-relaxed">
                          Deep dive into options trading strategies, hedging mechanics, and market volatility.
                        </p>
                      </div>
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border bg-surface text-foreground/70 group-hover:bg-primary group-hover:text-black group-hover:border-primary transition-all duration-200">
                        <RiArrowRightLine className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                      </div>
                    </div>
                  </Link>
                )}

                {/* Card 4: Forex Trading */}
                {showForex && (
                  <Link
                    href="/forex"
                    className="group relative flex flex-col p-6 rounded-2xl sm:rounded-3xl border border-border/80 dark:border-white/10 bg-card/90 backdrop-blur-md shadow-lg shadow-black/5 dark:shadow-black/25 hover:border-primary/60 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-0.5 transition-all duration-200"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary border border-primary/20 group-hover:bg-primary group-hover:text-black transition-colors duration-200">
                        <RiExchangeDollarLine className="h-6 w-6" />
                      </div>
                      <span className="text-[11px] font-semibold px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
                        Coming Soon
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-4">
                      <div className="min-w-0">
                        <h2 className="text-lg sm:text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                          Forex Trading
                        </h2>
                        <p className="mt-1 text-xs sm:text-sm text-muted-foreground leading-relaxed">
                          Master global currency dynamics, technical analysis, and risk management techniques.
                        </p>
                      </div>
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border bg-surface text-foreground/70 group-hover:bg-primary group-hover:text-black group-hover:border-primary transition-all duration-200">
                        <RiArrowRightLine className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                      </div>
                    </div>
                  </Link>
                )}

                {/* Empty State */}
                {!hasAnyCardVisible && (
                  <div className="p-8 rounded-2xl sm:rounded-3xl border border-border/80 bg-card/60 text-center flex flex-col items-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-muted text-muted-foreground mb-4">
                      <RiInformationLine className="h-6 w-6" />
                    </div>
                    <h3 className="text-base sm:text-lg font-bold text-foreground">
                      No Tracks Currently Available
                    </h3>
                    <p className="text-xs sm:text-sm text-muted-foreground mt-1 max-w-sm">
                      New tracks and courses are being prepared. In the meantime, feel free to read our latest market insights on the blog.
                    </p>
                    <Link
                      href="/"
                      className="mt-5 inline-flex items-center justify-center px-5 py-2 text-xs sm:text-sm font-semibold rounded-full bg-primary text-black hover:bg-primary/90 transition-all cursor-pointer"
                    >
                      Back to Home
                    </Link>
                  </div>
                )}
              </div>
            </FadeIn>

            {/* Marquee-end bottom gradient fade: cards appear to emerge from transparent bottom */}
            {hasAnyCardVisible && (
              <div className="pointer-events-none sticky bottom-0 -mt-36 h-36 w-full bg-gradient-to-t from-background via-background/80 to-transparent z-10" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ExploreClient;
