"use client";

import React from "react";
import Link from "next/link";
import { RiArrowUpLine, RiArrowDownLine } from "@remixicon/react";
import { cn } from "@/lib/utils";

export interface DashboardStatCardProps {
  title: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  change?: number | null;
  changeLabel?: string;
  subtitle?: string;
  href?: string;
  actionLabel?: string;
  isLoading?: boolean;
  className?: string;
}

export function DashboardStatCard({
  title,
  value,
  icon: Icon,
  change,
  changeLabel = "from last period",
  subtitle,
  href,
  actionLabel,
  isLoading = false,
  className,
}: DashboardStatCardProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-border/70 bg-card p-6 shadow-xs",
        "flex flex-col justify-between transition-colors",
        className
      )}
    >
      {/* Top Header: Title and Minimal Icon (NO hover arrow, NOT clickable) */}
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-medium text-muted-foreground select-none">
          {title}
        </span>
        <Icon className="size-4.5 text-muted-foreground/80 shrink-0" />
      </div>

      {/* Main Metric Value */}
      <div className="mt-3">
        {isLoading ? (
          <div className="h-8 w-28 bg-muted animate-pulse rounded-md" />
        ) : (
          <div className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            {value}
          </div>
        )}
      </div>

      {/* Bottom Row: Inline change indicator or Subtitle + Dedicated Action Link */}
      <div className="mt-3 pt-3 border-t border-border/40 flex items-center justify-between text-xs text-muted-foreground min-h-[22px]">
        {isLoading ? (
          <div className="h-3 w-32 bg-muted animate-pulse rounded-md" />
        ) : typeof change === "number" ? (
          <div className="flex items-center gap-1.5 flex-wrap">
            <span
              className={cn(
                "inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[11px] font-semibold",
                change > 0
                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                  : change < 0
                  ? "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                  : "bg-muted text-muted-foreground"
              )}
            >
              {change > 0 && <RiArrowUpLine className="size-3" />}
              {change < 0 && <RiArrowDownLine className="size-3" />}
              {change > 0 ? `+${change}%` : `${change}%`}
            </span>
            <span className="text-muted-foreground text-[11px]">
              {changeLabel}
            </span>
          </div>
        ) : subtitle ? (
          <span className="text-[11px] text-muted-foreground truncate">
            {subtitle}
          </span>
        ) : (
          <span />
        )}

        {/* Dedicated clickable link only on the action text, NOT the card */}
        {href && (
          <Link
            href={href}
            className="text-[11px] font-medium text-primary hover:text-primary-hover hover:underline transition-colors shrink-0"
          >
            {actionLabel || "View"} &rarr;
          </Link>
        )}
      </div>
    </div>
  );
}
