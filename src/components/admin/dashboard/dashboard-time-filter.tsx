"use client";

import React, { useState, useRef, useEffect } from "react";
import { DashboardPeriod } from "@/types";
import { cn } from "@/lib/utils";
import { RiCalendarLine, RiArrowDownSLine, RiCheckLine } from "@remixicon/react";
import { motion, AnimatePresence } from "motion/react";
import { dropdownMenuVariants } from "@/lib/motion";

interface DashboardTimeFilterProps {
  value: DashboardPeriod;
  onChange: (period: DashboardPeriod) => void;
  disabled?: boolean;
}

const PERIOD_OPTIONS: { value: DashboardPeriod; shortLabel: string; fullLabel: string }[] = [
  { value: "today", shortLabel: "Today", fullLabel: "Today" },
  { value: "7d", shortLabel: "7D", fullLabel: "Last 7 Days" },
  { value: "30d", shortLabel: "30D", fullLabel: "Last 30 Days" },
  { value: "90d", shortLabel: "90D", fullLabel: "Last 90 Days" },
  { value: "12m", shortLabel: "12M", fullLabel: "Last 12 Months" },
  { value: "all", shortLabel: "All", fullLabel: "All Time" },
];

export function DashboardTimeFilter({
  value,
  onChange,
  disabled = false,
}: DashboardTimeFilterProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    if (!dropdownOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setDropdownOpen(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [dropdownOpen]);

  const currentOption =
    PERIOD_OPTIONS.find((o) => o.value === value) || PERIOD_OPTIONS[2];

  return (
    <div className="relative inline-flex items-center">
      {/* 1. Mobile & Small Laptop Dropdown View (< xl breakpoint) */}
      <div className="relative xl:hidden" ref={dropdownRef}>
        <button
          type="button"
          disabled={disabled}
          onClick={() => setDropdownOpen((prev) => !prev)}
          className={cn(
            "inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold select-none",
            "bg-card hover:bg-surface border border-border/70 text-foreground",
            "shadow-xs transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          )}
          aria-expanded={dropdownOpen}
          aria-haspopup="listbox"
          aria-label="Filter by time period"
        >
          <RiCalendarLine className="size-3.5 text-muted-foreground shrink-0" />
          <span className="truncate max-w-[110px] sm:max-w-none">
            {currentOption.fullLabel}
          </span>
          <RiArrowDownSLine
            className={cn(
              "size-4 text-muted-foreground transition-transform duration-200 shrink-0",
              dropdownOpen && "rotate-180"
            )}
          />
        </button>

        <AnimatePresence>
          {dropdownOpen && (
            <motion.div
              variants={dropdownMenuVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              role="listbox"
              className={cn(
                "absolute right-0 top-full mt-2 w-48 rounded-xl border border-border/80",
                "bg-card p-1 shadow-xl z-50 overflow-hidden"
              )}
            >
              <div className="px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground border-b border-border/50">
                Select Time Period
              </div>
              <div className="py-1">
                {PERIOD_OPTIONS.map((opt) => {
                  const isSelected = value === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      role="option"
                      aria-selected={isSelected}
                      onClick={() => {
                        onChange(opt.value);
                        setDropdownOpen(false);
                      }}
                      className={cn(
                        "w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors text-left cursor-pointer",
                        isSelected
                          ? "bg-primary/10 text-primary font-semibold"
                          : "text-foreground hover:bg-surface"
                      )}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="truncate">{opt.fullLabel}</span>
                        <span className="text-[10px] text-muted-foreground font-mono">
                          ({opt.shortLabel})
                        </span>
                      </div>
                      {isSelected && <RiCheckLine className="size-3.5 text-primary shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 2. Large Desktop Pill Buttons View (>= xl breakpoint) */}
      <div
        role="tablist"
        aria-label="Dashboard time period filter"
        className={cn(
          "hidden xl:inline-flex items-center gap-1 p-1 rounded-xl",
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
                "relative px-3 py-1 rounded-lg text-xs font-semibold tracking-tight transition-all",
                "focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary/40",
                "disabled:opacity-50 disabled:cursor-not-allowed select-none cursor-pointer",
                isActive
                  ? "bg-card text-foreground shadow-xs border border-border/80"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
            >
              {opt.shortLabel}
            </button>
          );
        })}
      </div>
    </div>
  );
}
