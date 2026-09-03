import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { settingsService } from "@/services";
import { constructMetadata } from "@/lib/seo/metadata";
import {
  RiGraduationCapLine,
  RiStore2Line,
  RiArrowRightLine,
  RiArrowRightUpLine,
  RiCompass3Line,
  RiLineChartLine,
  RiBookOpenLine,
} from "@remixicon/react";

export const revalidate = 60; // Revalidate every 60 seconds

export const metadata: Metadata = constructMetadata({
  title: "Explore Learning",
  description:
    "Choose how you want to continue learning with Traders Community - browse community courses or explore the full external Graphy course catalogue.",
  canonicalUrl: "/explore",
});

export default async function ExplorePage() {
  // Fetch public settings on server
  let settings;
  try {
    const res = await settingsService.getPublicSettings(60);
    settings = res.data?.settings;
  } catch (error) {
    console.error("Failed to load settings on Explore page:", error);
  }

  // Handle conditional redirection if admin has disabled Explore page
  if (settings && settings.showExplorePage === false) {
    if (settings.exploreOffTarget === "graphy" && settings.graphyUrl) {
      redirect(settings.graphyUrl);
    } else {
      redirect("/courses");
    }
  }

  const graphyUrl =
    settings?.graphyUrl || "https://pennywisepuns.graphy.com/s/store";

  return (
    <div className="w-full min-h-[calc(100vh-140px)] flex items-center">
      {/* Container aligned with sticky navbar pill width */}
      <div className="w-full max-w-4xl lg:max-w-5xl mx-auto px-4 sm:px-6 py-12 sm:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-10 lg:gap-14 items-center">
          {/* Left Column: Heading & Context */}
          <div className="flex flex-col">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-primary/30 bg-primary/10 text-primary text-xs font-semibold w-fit mb-5">
              <RiCompass3Line className="h-4 w-4" />
              <span>Explore</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-foreground tracking-tight leading-[1.18]">
              Choose how you want to continue learning.
            </h1>

            <p className="mt-4 text-base sm:text-lg text-muted-foreground leading-relaxed">
              Browse our community course tracks and syllabus here, or head over
              to the Graphy store for the complete external course catalogue.
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

          {/* Right Column: Interactive Destination Cards */}
          <div className="flex flex-col gap-4">
            {/* Card 1: Internal Courses */}
            <Link
              href="/courses"
              className="group relative flex flex-col p-6 rounded-2xl sm:rounded-3xl border border-primary/40 bg-card/80 backdrop-blur-md shadow-lg shadow-black/5 dark:shadow-black/25 hover:border-primary hover:shadow-xl hover:shadow-primary/10 hover:-translate-y-0.5 transition-all duration-200"
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

            {/* Card 2: External Graphy Store */}
            <a
              href={graphyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative flex flex-col p-6 rounded-2xl sm:rounded-3xl border border-border/90 bg-card/80 backdrop-blur-md shadow-lg shadow-black/5 dark:shadow-black/25 hover:border-primary/60 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-0.5 transition-all duration-200"
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
          </div>
        </div>
      </div>
    </div>
  );
}
