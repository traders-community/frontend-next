import React from "react";
import { notFound } from "next/navigation";
import { settingsService } from "@/services";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function ForexLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let settings;
  try {
    const res = await settingsService.getPublicSettings(0);
    settings = res.data?.settings;
  } catch (error) {
    console.error("Failed to load settings in ForexLayout:", error);
  }

  // If the admin has disabled the Forex card, return 404 for this route and any nested sub-routes
  if (settings && settings.showForexCard === false) {
    notFound();
  }

  return <>{children}</>;
}
