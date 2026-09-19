import React from "react";
import type { Metadata } from "next";
import { settingsService } from "@/services";
import { constructMetadata } from "@/lib/seo/metadata";
import { ExploreClient } from "@/components/explore/explore-client";

// Ensure page always fetches fresh data without stale cache
export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = constructMetadata({
  title: "Explore Learning",
  description:
    "Choose how you want to continue learning with Traders Community - browse community courses, futures & options, forex trading, or explore the external Graphy course catalogue.",
  canonicalUrl: "/explore",
});

export default async function ExplorePage() {
  let settings;
  try {
    const res = await settingsService.getPublicSettings(0);
    settings = res.data?.settings;
  } catch (error) {
    console.error("Failed to load settings on Explore page:", error);
  }

  return <ExploreClient initialSettings={settings} />;
}
