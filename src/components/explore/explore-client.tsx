"use client";

import React from "react";
import Link from "next/link";
import { FadeIn } from "@/components/motion";
import {
  RiGraduationCapLine,
  RiStore2Line,
  RiArrowRightLine,
  RiArrowRightUpLine,
  RiCompass3Line,
  RiLineChartLine,
  RiBookOpenLine,
} from "@remixicon/react";

export function ExploreClient() {
  const graphyUrl = "https://traderscommunity.graphy.com/";

  return (
    <div className="w-full min-h-[calc(100vh-80px)] flex items-center justify-center py-6 sm:py-10">
      {/* Container aligned with sticky navbar pill width */}
      <div className="w-full max-w-4xl lg:max-w-5xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-8 lg:gap-14 items-center">
          {/* Left Column: Heading, Description & Value Highlights */}
          <div className="w-full">
            <FadeIn direction="up" distance={20} duration={0.48}>
              <div className="flex flex-col">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-primary/30 bg-primary/10 text-primary text-xs font-semibold w-fit mb-5">
                  <RiCompass3Line className="h-4 w-4" />
                  <span>Explore Learning</span>
                </div>

                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-foreground tracking-tight leading-[1.18]">
                  Choose how you want to continue learning.
                </h1>

                <p className="mt-4 text-base sm:text-lg text-muted-foreground leading-relaxed">
                  Browse our community courses and learning modules here, or head over to the Graphy store for the complete external course catalogue.
                </p>

                {/* Value Highlights */}
                <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs sm:text-sm">
                  <div className="flex items-center gap-2.5 text-foreground/85 font-medium">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary border border-primary/30">
                      <RiLineChartLine className="h-3.5 w-3.5" />
                    </span>
                    <span>Community courses &amp; mentorship</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-foreground/85 font-medium">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary border border-primary/30">
                      <RiBookOpenLine className="h-3.5 w-3.5" />
                    </span>
                    <span>Recorded video catalogue</span>
                  </div>
                </div>
              </div>
            </FadeIn>
          </div>

          {/* Right Column: 2 Cards (Vertically Centered with Left Column) */}
          <div className="w-full">
            <FadeIn direction="up" distance={20} duration={0.48} delay={0.12}>
              <div className="flex flex-col gap-4">
                {/* Card 1: Community Courses */}
                <Link
                  href="/courses"
                  prefetch={true}
                  className="group relative flex flex-col p-6 rounded-2xl sm:rounded-3xl border border-primary/40 bg-card/90 backdrop-blur-md shadow-lg shadow-black/5 dark:shadow-black/25 hover:border-primary hover:shadow-xl hover:shadow-primary/10 hover:-translate-y-0.5 transition-all duration-200"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/15 text-primary border border-primary/30 group-hover:bg-primary group-hover:text-black transition-colors duration-200">
                      <RiGraduationCapLine className="h-6 w-6" />
                    </div>
                    <span className="text-[11px] font-semibold px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
                      Available Now
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
                        Open the external course catalog and video learning portal on Graphy.
                      </p>
                    </div>
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border bg-surface text-foreground/70 group-hover:bg-primary group-hover:text-black group-hover:border-primary transition-all duration-200">
                      <RiArrowRightUpLine className="h-4 w-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                    </div>
                  </div>
                </a>
              </div>
            </FadeIn>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ExploreClient;
