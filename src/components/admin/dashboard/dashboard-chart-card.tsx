"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface DashboardChartCardProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  isLoading?: boolean;
  className?: string;
}

export function DashboardChartCard({
  title,
  subtitle,
  action,
  children,
  isLoading = false,
  className,
}: DashboardChartCardProps) {
  return (
    <div
      className={cn(
        "flex flex-col justify-between rounded-xl",
        "border border-border/70 bg-card p-5 sm:p-6 shadow-xs",
        className
      )}
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-4 border-b border-border/50">
        <div>
          <h2 className="text-base font-semibold text-foreground tracking-tight">
            {title}
          </h2>
          {subtitle && (
            <p className="text-xs text-muted-foreground mt-0.5">
              {subtitle}
            </p>
          )}
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>

      {/* Chart Canvas Area */}
      <div className="relative w-full h-[260px] sm:h-[280px] pt-4">
        {isLoading ? (
          <div className="w-full h-full flex items-center justify-center bg-muted/20 rounded-xl animate-pulse">
            <span className="text-xs text-muted-foreground">Loading chart...</span>
          </div>
        ) : (
          children
        )}
      </div>
    </div>
  );
}
