import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { constructMetadata } from "@/lib/seo/metadata";
import { FaqAccordion } from "@/components/about/faq-accordion";
import { RiArrowRightLine, RiArticleLine, RiCompass3Line } from "@remixicon/react";

export const metadata: Metadata = constructMetadata({
  title: "About Us",
  description:
    "Trader’s Community is a financial education and market research brand dedicated to helping traders and investors enhance their understanding of the Indian stock market.",
  canonicalUrl: "/about",
});

export default function AboutPage() {
  return (
    <div className="w-full min-h-screen py-10 sm:py-16">
      {/* Main Container - Aligned with Sticky Navbar Width */}
      <div className="w-full max-w-4xl lg:max-w-5xl mx-auto px-4 sm:px-6 flex flex-col gap-16 sm:gap-24">
        
        {/* ========================================================================= */}
        {/* HERO / BRAND STORY */}
        {/* ========================================================================= */}
        <section aria-labelledby="about-title" className="flex flex-col pt-2">
          <span className="text-xs sm:text-sm font-semibold text-primary uppercase tracking-widest mb-3">
            About Us
          </span>

          <h1
            id="about-title"
            className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-foreground tracking-tight leading-[1.18] max-w-4xl"
          >
            Enhancing market understanding through data-driven research and education.
          </h1>

          <div className="mt-8 text-base sm:text-lg text-muted-foreground leading-relaxed space-y-5 max-w-4xl">
            <p>
              <strong className="text-foreground font-semibold">Trader’s Community</strong> is a financial education and market research brand dedicated to helping traders and investors enhance their understanding of the Indian stock market.
            </p>
            <p>
              We publish free analytical content and reports on companies within the <strong className="text-foreground font-semibold">Nifty 500 index</strong>, along with a premium learning channel focused on derivatives market concepts and strategies.
            </p>
            <p className="text-sm sm:text-base text-foreground/80">
              Our core philosophy is straightforward: market success comes from deep business understanding, structured risk management, and independent analysis—not from guesswork, emotion, or speculative tips.
            </p>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* VISION & MISSION (Clean Editorial Columns, No Heavy Boxes) */}
        {/* ========================================================================= */}
        <section
          aria-label="Vision and Mission"
          className="border-t border-border/60 pt-12 sm:pt-16 grid grid-cols-1 md:grid-cols-2 gap-10 sm:gap-14"
        >
          {/* Vision */}
          <div className="flex flex-col">
            <span className="text-xs font-semibold text-primary uppercase tracking-wider mb-2.5">
              Our Vision
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-4 leading-tight">
              An informed, analytical trading community.
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              To build a community of retail traders and investors across India who approach the market with objective data, independent research, and disciplined risk management.
            </p>
          </div>

          {/* Mission */}
          <div className="flex flex-col">
            <span className="text-xs font-semibold text-primary uppercase tracking-wider mb-2.5">
              Our Mission
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-4 leading-tight">
              Accessible research and clear concepts.
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              To make institutional-quality research on Nifty 500 companies openly accessible, while providing structured derivatives education that demystifies market mechanics for every learner.
            </p>
          </div>
        </section>


        {/* ========================================================================= */}
        {/* FREQUENTLY ASKED QUESTIONS */}
        {/* ========================================================================= */}
        <section aria-labelledby="faq-title" className="border-t border-border/60 pt-12 sm:pt-16">
          <div className="mb-8">
            <span className="text-xs font-semibold text-primary uppercase tracking-wider mb-2 block">
              FAQs
            </span>
            <h2 id="faq-title" className="text-2xl sm:text-3xl font-bold text-foreground">
              Frequently asked questions.
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Common questions about our research, learning resources, and platform.
            </p>
          </div>

          <FaqAccordion />
        </section>

        {/* ========================================================================= */}
        {/* CTA IN ROUNDED BOX */}
        {/* ========================================================================= */}
        <section aria-label="Explore research" className="pb-6 sm:pb-12">
          <div className="p-8 sm:p-10 rounded-3xl border border-border/80 bg-card/75 backdrop-blur-md shadow-lg shadow-black/5 dark:shadow-black/25 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="max-w-xl">
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground leading-tight">
                Replace market noise with structured research.
              </h2>
              <p className="mt-2.5 text-sm sm:text-base text-muted-foreground leading-relaxed">
                Explore our free analytical reports on Nifty 500 companies, or dive into our derivatives learning channel to build real market clarity.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <Link
                href="/"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-primary px-6 text-xs sm:text-sm font-semibold text-black hover:bg-primary/90 hover:scale-[1.02] active:scale-[0.98] shadow-md shadow-primary/20 transition-all duration-150 cursor-pointer"
              >
                <RiArticleLine className="h-4 w-4" />
                <span>Our Blogs</span>
              </Link>

              <Link
                href="/explore"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-border bg-surface px-6 text-xs sm:text-sm font-medium text-foreground hover:border-primary/50 hover:text-primary transition-all duration-150 cursor-pointer"
              >
                <RiCompass3Line className="h-4 w-4" />
                <span>Explore Learning</span>
                <RiArrowRightLine className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}