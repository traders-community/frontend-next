import React from "react";
import type { Metadata } from "next";
import { constructMetadata } from "@/lib/seo/metadata";
import { ExploreClient } from "@/components/explore/explore-client";

export const metadata: Metadata = constructMetadata({
  title: "Explore Learning",
  description:
    "Choose how you want to continue learning with Traders Community - browse community courses or explore the external Graphy course catalogue.",
  canonicalUrl: "/explore",
});

export default function ExplorePage() {
  return <ExploreClient />;
}
