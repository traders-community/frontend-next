"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface CategoryTabsProps {
  categories: string[];
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  className?: string;
}

export function CategoryTabs({
  categories,
  selectedCategory,
  onSelectCategory,
  className = "",
}: CategoryTabsProps) {
  return (
    <nav
      aria-label="Article categories"
      className={cn(
        "w-full flex items-center justify-start sm:justify-center overflow-x-auto no-scrollbar py-3 px-2 sm:px-4 gap-2.5 sm:gap-3.5 sm:flex-wrap",
        className
      )}
    >
      {categories.map((category) => {
        const isActive = selectedCategory === category;

        return (
          <button
            key={category}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onSelectCategory(category)}
            className={cn(
              "shrink-0 min-h-10 px-4 sm:px-5 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-colors duration-150 border select-none cursor-pointer",
              isActive
                ? "bg-primary border-primary text-black font-semibold shadow-md shadow-primary/25"
                : "border-primary/50 text-foreground/80 hover:border-primary hover:text-primary hover:bg-primary/10 bg-transparent"
            )}
          >
            {category}
          </button>
        );
      })}
    </nav>
  );
}

export default CategoryTabs;
