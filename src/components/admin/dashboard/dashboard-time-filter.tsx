"use client";

import React from "react";
import { DashboardPeriod } from "@/types";
import { cn } from "@/lib/utils";

interface DashboardTimeFilterProps {
  value: DashboardPeriod;
  onChange: (period: DashboardPeriod) => void;
  disabled?: boolean;
}

const PERIOD_OPTIONS: { value: DashboardPeriod; label: string }[] = [
  { value: "today", label: "Today" },
  { value: "7d", label: "7D" },
  { value: "30d", label: "30D" },
  { value: "90d", label: "90D" },
  { value: "12m", label: "12M" },
  { value: "all", label: "All" },
];

export function DashboardTimeFilter({
  value,
  onChange,
  disabled = false,
}: DashboardTimeFilterProps) {
  return (
    <div
      role="tablist"
      aria-label="Dashboard time period filter"
      className={cn(
        "inline-flex items-center gap-1 p-1 rounded-xl",
        "bg-muted/70 dark:bg-muted/40 border border-border/60",
        "shadow-xs transition-colors"
      )}
    >
      {PERIOD_OPTIONS.map((opt) => {
        const isActive = value === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            role="tab"
            aria-selected={isActive}
            disabled={disabled}
            onClick={() => onChange(opt.value)}
            className={cn(
              "relative px-2.5 sm:px-3 py-1 rounded-lg text-xs font-semibold tracking-tight transition-all",
              "focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary/40",
              "disabled:opacity-50 disabled:cursor-not-allowed select-none",
              isActive
                ? "bg-card text-foreground shadow-xs border border-border/80"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            )}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
