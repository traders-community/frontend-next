"use client";

import React, { useState, useRef, useEffect } from "react";
import { RiArrowDownSLine, RiCheckLine } from "@remixicon/react";
import { cn } from "@/lib/utils";

export interface SelectOption {
  value: string;
  label: string;
  description?: string;
  icon?: React.ComponentType<{ className?: string }>;
}

export interface AdminSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: (SelectOption | string)[];
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export function AdminSelect({
  value,
  onChange,
  options,
  placeholder = "Select an option",
  disabled = false,
  className,
}: AdminSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Normalize options to SelectOption objects
  const normalizedOptions: SelectOption[] = options.map((opt) =>
    typeof opt === "string" ? { value: opt, label: opt } : opt
  );

  const selectedOption = normalizedOptions.find((opt) => opt.value === value);

  // Click outside to close
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  const handleSelect = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className={cn("relative w-full", className)}>
      {/* Trigger Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setIsOpen((prev) => !prev)}
        className={cn(
          "w-full px-3.5 py-2.5 text-sm font-medium rounded-xl text-foreground text-left",
          "bg-neutral-50 dark:bg-[#060b18] border border-border/80 dark:border-[#1a2744]",
          "flex items-center justify-between gap-2 transition-all cursor-pointer shadow-2xs select-none",
          "focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary",
          isOpen && "ring-2 ring-primary/20 border-primary",
          disabled && "opacity-50 cursor-not-allowed"
        )}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span className="truncate">
          {selectedOption ? (
            <span className="flex items-center gap-2">
              {selectedOption.icon && (
                <selectedOption.icon className="h-4 w-4 shrink-0 text-muted-foreground" />
              )}
              <span>{selectedOption.label}</span>
            </span>
          ) : (
            <span className="text-muted-foreground/50 font-normal">
              {placeholder}
            </span>
          )}
        </span>

        {/* Custom Chevron Arrow */}
        <RiArrowDownSLine
          className={cn(
            "h-4 w-4 text-muted-foreground shrink-0 transition-transform duration-200",
            isOpen && "rotate-180 text-foreground"
          )}
        />
      </button>

      {/* Custom Theme-Aware Floating Dropdown Menu */}
      {isOpen && (
        <div
          role="listbox"
          className="absolute top-full left-0 right-0 mt-1.5 z-50 rounded-xl bg-card border border-border/80 dark:border-[#1e2c4f] shadow-2xl p-1.5 space-y-0.5 max-h-60 overflow-y-auto animate-in fade-in-0 zoom-in-95 duration-100"
        >
          {normalizedOptions.length === 0 ? (
            <div className="p-3 text-xs text-muted-foreground text-center">
              No options available
            </div>
          ) : (
            normalizedOptions.map((opt) => {
              const isSelected = opt.value === value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => handleSelect(opt.value)}
                  className={cn(
                    "w-full px-3 py-2 text-xs sm:text-sm font-medium rounded-lg text-left transition-colors cursor-pointer",
                    "flex items-center justify-between gap-2",
                    isSelected
                      ? "bg-primary/15 text-primary font-semibold"
                      : "text-foreground hover:bg-neutral-100 dark:hover:bg-[#131e38]"
                  )}
                  role="option"
                  aria-selected={isSelected}
                >
                  <span className="flex items-center gap-2 truncate">
                    {opt.icon && (
                      <opt.icon
                        className={cn(
                          "h-4 w-4 shrink-0",
                          isSelected ? "text-primary" : "text-muted-foreground"
                        )}
                      />
                    )}
                    <span className="truncate">{opt.label}</span>
                  </span>

                  {isSelected && (
                    <RiCheckLine className="h-4 w-4 text-primary shrink-0" />
                  )}
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}

export default AdminSelect;
