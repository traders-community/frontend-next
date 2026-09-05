"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { RiSunLine, RiMoonLine, RiComputerLine } from "@remixicon/react";

/**
 * Compact icon button toggle that flips between light and dark modes
 */
export function ThemeToggle({ className = "" }: { className?: string }) {
  const { theme, resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <button
        aria-label="Toggle theme"
        disabled
        className={`relative inline-flex h-9 w-9 items-center justify-center bg-transparent text-muted-foreground ${className}`}
      >
        <span className="h-5 w-5" />
      </button>
    );
  }

  const isDark = resolvedTheme === "dark";

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
      title={
        theme === "system"
          ? `System theme (${resolvedTheme}) — Click to switch to ${isDark ? "light" : "dark"}`
          : `Theme: ${theme === "dark" ? "Dark" : "Light"} — Click to switch to ${isDark ? "light" : "dark"}`
      }
      className={`relative inline-flex h-9 w-9 items-center justify-center rounded-full bg-transparent text-foreground/80 transition-colors hover:text-primary active:scale-95 cursor-pointer focus-visible:outline-none ${className}`}
    >
      {isDark ? (
        <RiMoonLine className="h-5 w-5 transition-transform duration-200" />
      ) : (
        <RiSunLine className="h-5 w-5 transition-transform duration-200" />
      )}
    </button>
  );
}

/**
 * Segmented control supporting explicit selection of System (Default), Light, or Dark mode
 */
export function ThemeSegmented({ className = "" }: { className?: string }) {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const options = [
    { value: "system", label: "System", icon: RiComputerLine },
    { value: "light", label: "Light", icon: RiSunLine },
    { value: "dark", label: "Dark", icon: RiMoonLine },
  ] as const;

  if (!mounted) {
    return (
      <div
        className={`inline-flex items-center gap-1 rounded-xl border border-border p-1 ${className}`}
      >
        {options.map((opt) => (
          <span
            key={opt.value}
            className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs text-muted-foreground"
          >
            <opt.icon className="h-3.5 w-3.5" />
            <span>{opt.label}</span>
          </span>
        ))}
      </div>
    );
  }

  return (
    <div
      role="radiogroup"
      aria-label="Theme selection"
      className={`inline-flex items-center gap-1 rounded-xl border border-border bg-muted/60 p-1 backdrop-blur-sm ${className}`}
    >
      {options.map(({ value, label, icon: Icon }) => {
        const isActive = theme === value;
        return (
          <button
            key={value}
            role="radio"
            aria-checked={isActive}
            onClick={() => setTheme(value)}
            title={
              value === "system"
                ? `System Default (currently ${resolvedTheme})`
                : `${label} Mode`
            }
            className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-all cursor-pointer ${
              isActive
                ? "bg-card text-foreground shadow-xs border border-border/50 font-semibold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Icon className="h-3.5 w-3.5" />
            <span>{label}</span>
          </button>
        );
      })}
    </div>
  );
}
