import React from "react";
import { notFound } from "next/navigation";
import { settingsService } from "@/services";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function FnoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let settings;
  try {
    const res = await settingsService.getPublicSettings(0);
    settings = res.data?.settings;
  } catch (error) {
    console.error("Failed to load settings in FnoLayout:", error);
  }

  // If the admin has disabled the F&O card, return 404 for this route and any nested sub-routes
  if (settings && settings.showFnoCard === false) {
    notFound();
  }

  return <>{children}</>;
}
