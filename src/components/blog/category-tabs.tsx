"use client";

import React from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import { EASE } from "@/lib/motion";

interface CategoryTabsProps {
  categories: string[];
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  isLoading?: boolean;
  className?: string;
}

export function CategoryTabsSkeleton({ className = "" }: { className?: string }) {
  return (
    <nav
      aria-label="Loading categories"
      className={cn(
        "w-full overflow-x-auto no-scrollbar py-3 px-2 sm:px-4",
        className
      )}
    >
      <div className="flex items-center gap-2.5 sm:gap-3.5 flex-nowrap w-max mx-auto px-1 animate-pulse">
        {[48, 128, 140, 110, 96, 76, 56].map((width, idx) => (
          <div
            key={idx}
            className="shrink-0 min-h-10 rounded-full bg-muted/60 border border-border/40"
            style={{ width: `${width}px` }}
          />
        ))}
      </div>
    </nav>
  );
}

export function CategoryTabs({
  categories,
  selectedCategory,
  onSelectCategory,
  isLoading = false,
  className = "",
}: CategoryTabsProps) {
  if ((isLoading && (!categories || categories.length === 0)) || (!categories || categories.length === 0)) {
    return <CategoryTabsSkeleton className={className} />;
  }

  return (
    <nav
      aria-label="Article categories"
      className={cn(
        "w-full overflow-x-auto no-scrollbar py-3 px-2 sm:px-4",
        className
      )}
    >
      <div className="flex items-center gap-2.5 sm:gap-3.5 flex-nowrap w-max mx-auto px-1">
        {categories.map((category) => {
          const isActive = selectedCategory === category;

          return (
            <motion.button
              key={category}
              type="button"
              role="tab"
              aria-selected={isActive}
              whileTap={{ scale: 0.97 }}
              whileHover={{ scale: 1.03 }}
              transition={{ duration: 0.12, ease: EASE.outCubic }}
              onClick={() => onSelectCategory(category)}
              className={cn(
                "shrink-0 min-h-10 px-4 sm:px-5 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-colors duration-150 border select-none cursor-pointer inline-flex items-center justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
                isActive
                  ? "bg-primary border-primary text-black font-semibold shadow-md shadow-primary/25"
                  : "border-primary text-foreground hover:bg-primary/10 hover:text-primary bg-transparent"
              )}
            >
              {category}
            </motion.button>
          );
        })}
      </div>
    </nav>
  );
}

export default CategoryTabs;
