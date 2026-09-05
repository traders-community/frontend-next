"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  RiSearchLine,
  RiEqualizerLine,
  RiAddLine,
  RiArrowUpDownLine,
  RiArrowUpLine,
  RiArrowDownLine,
  RiArrowLeftSLine,
  RiArrowRightSLine,
  RiCloseLine,
  RiInboxLine,
} from "@remixicon/react";
import { useDebounce } from "@/hooks/use-debounce";
import { cn } from "@/lib/utils";

export interface ColumnDef<T> {
  key: string;
  label: string;
  sortable?: boolean;
  align?: "left" | "center" | "right";
  className?: string;
  render?: (item: T, index: number) => React.ReactNode;
}

export interface TablePagination {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  pageSizeOptions?: number[];
}

export interface AdminDataTableProps<T> {
  title: string;
  subtitle?: string;
  // Search
  searchPlaceholder?: string;
  searchValue?: string;
  searchDebounceMs?: number;
  onSearchChange?: (value: string) => void;
  // Filter Popover
  filterContent?: React.ReactNode;
  filterButton?: React.ReactNode;
  onFilterClick?: () => void;
  filterActive?: boolean;
  // Primary Add Action
  actionButton?: {
    label: string;
    onClick?: () => void;
    href?: string;
    icon?: React.ComponentType<{ className?: string }>;
  };
  // Columns & Data
  columns: ColumnDef<T>[];
  data: T[];
  keyExtractor: (item: T, index: number) => string | number;
  isLoading?: boolean;
  emptyMessage?: string;
  // Pagination
  pagination?: TablePagination;
  // Sorting callback (3 states: asc, desc, null)
  sortKey?: string | null;
  sortDirection?: "asc" | "desc" | null;
  onSortChange?: (key: string) => void;
}

export function AdminDataTable<T>({
  title,
  subtitle,
  searchPlaceholder = "Search...",
  searchValue = "",
  searchDebounceMs = 400,
  onSearchChange,
  filterContent,
  filterButton,
  onFilterClick,
  filterActive = false,
  actionButton,
  columns,
  data,
  keyExtractor,
  isLoading = false,
  emptyMessage = "No records found.",
  pagination,
  sortKey,
  sortDirection,
  onSortChange,
}: AdminDataTableProps<T>) {
  const pageSizeOptions = pagination?.pageSizeOptions || [5, 10, 20, 50];
  const [filterOpen, setFilterOpen] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);

  // Debounced Search handling
  const [localSearch, setLocalSearch] = useState(searchValue);
  const debouncedSearch = useDebounce(localSearch, searchDebounceMs);

  // Synchronize when parent updates searchValue directly (e.g. filter resets)
  useEffect(() => {
    setLocalSearch(searchValue);
  }, [searchValue]);

  // Trigger onSearchChange when debounced value settles
  useEffect(() => {
    if (debouncedSearch !== searchValue) {
      onSearchChange?.(debouncedSearch);
    }
  }, [debouncedSearch, onSearchChange, searchValue]);

  const handleClearSearch = () => {
    setLocalSearch("");
    onSearchChange?.("");
  };

  // Close filter popover on click outside or escape key
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setFilterOpen(false);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setFilterOpen(false);
      }
    }
    if (filterOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [filterOpen]);

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-300">
      {/* Top Header & Controls Row */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Title & Subtitle */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
              {subtitle}
            </p>
          )}
        </div>

        {/* Search, Filter & Add Action */}
        <div className="flex flex-wrap items-center gap-2.5 self-start lg:self-auto">
          {/* Search Bar with Debouncing */}
          {onSearchChange && (
            <div className="relative flex items-center min-w-[220px] sm:min-w-[260px]">
              <RiSearchLine className="absolute left-3.5 h-4 w-4 text-muted-foreground pointer-events-none" />
              <input
                type="text"
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
                placeholder={searchPlaceholder}
                className="w-full pl-9.5 pr-8 py-2 text-xs sm:text-sm bg-card border border-border/80 rounded-xl sm:rounded-2xl placeholder:text-muted-foreground text-foreground shadow-2xs focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
              />
              {localSearch && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="absolute right-2.5 p-1 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                  aria-label="Clear search"
                >
                  <RiCloseLine className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          )}

          {/* Filter Popover Dropdown matching Colab screenshot */}
          {filterContent ? (
            <div className="relative" ref={filterRef}>
              <button
                type="button"
                onClick={() => setFilterOpen((prev) => !prev)}
                className={cn(
                  "p-2.5 rounded-xl sm:rounded-2xl border transition-all cursor-pointer shadow-2xs relative",
                    filterActive || filterOpen
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border/80 bg-card text-muted-foreground hover:text-foreground hover:bg-surface-hover"
                )}
                title="Filter records"
                aria-label="Filter records"
                aria-expanded={filterOpen}
              >
                <RiEqualizerLine className="h-4 w-4" />
                {filterActive && (
                  <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-primary ring-2 ring-card" />
                )}
              </button>

              {/* Colab-style Filter Popover */}
              {filterOpen && (
                <div className="absolute right-0 top-full mt-2 w-72 sm:w-80 max-w-[calc(100vw-2rem)] bg-card text-card-foreground border border-border/80 rounded-2xl sm:rounded-3xl shadow-2xl p-5 z-40 animate-in fade-in-0 zoom-in-95 duration-150">
                  {/* Header */}
                  <div className="flex items-center justify-between pb-3 border-b border-border/60">
                    <h3 className="text-sm font-bold text-foreground">Filters</h3>
                    <button
                      type="button"
                      onClick={() => setFilterOpen(false)}
                      className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-surface-hover transition-colors cursor-pointer"
                      aria-label="Close filters"
                    >
                      <RiCloseLine className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Filter controls content */}
                  <div className="pt-3.5 space-y-4">{filterContent}</div>
                </div>
              )}
            </div>
          ) : filterButton ? (
            filterButton
          ) : onFilterClick ? (
            <button
              type="button"
              onClick={onFilterClick}
              className={cn(
                "p-2.5 rounded-xl sm:rounded-2xl border transition-colors cursor-pointer shadow-2xs",
                filterActive
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border/80 bg-card text-muted-foreground hover:text-foreground hover:bg-surface-hover"
              )}
              title="Filter records"
              aria-label="Filter records"
            >
              <RiEqualizerLine className="h-4 w-4" />
            </button>
          ) : null}

          {/* Primary Action Button (+ Add) */}
          {actionButton &&
            (actionButton.href ? (
              <Link
                href={actionButton.href}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-semibold rounded-xl sm:rounded-2xl bg-black text-white dark:bg-neutral-100 dark:text-neutral-900 hover:opacity-90 shadow-xs transition-all"
              >
                {actionButton.icon ? (
                  <actionButton.icon className="h-4 w-4" />
                ) : (
                  <RiAddLine className="h-4 w-4" />
                )}
                <span>{actionButton.label}</span>
              </Link>
            ) : (
              <button
                type="button"
                onClick={actionButton.onClick}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-semibold rounded-xl sm:rounded-2xl bg-black text-white dark:bg-neutral-100 dark:text-neutral-900 hover:opacity-90 shadow-xs transition-all cursor-pointer"
              >
                {actionButton.icon ? (
                  <actionButton.icon className="h-4 w-4" />
                ) : (
                  <RiAddLine className="h-4 w-4" />
                )}
                <span>{actionButton.label}</span>
              </button>
            ))}
        </div>
      </div>

      {/* Main Table Card Container */}
      <div className="rounded-2xl sm:rounded-3xl border border-border/80 bg-card overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border/70 bg-surface/30">
                {columns.map((col) => (
                  <th
                    key={col.key}
                    scope="col"
                    className={cn(
                      "px-5 py-3.5 text-[11px] font-bold uppercase tracking-wider text-muted-foreground select-none whitespace-nowrap",
                      col.align === "center" && "text-center",
                      col.align === "right" && "text-right",
                      col.className
                    )}
                  >
                    {col.sortable && onSortChange ? (
                      <button
                        type="button"
                        onClick={() => onSortChange(col.key)}
                        className={cn(
                          "inline-flex items-center gap-1.5 hover:text-foreground transition-colors cursor-pointer group select-none",
                          col.align === "center" && "justify-center mx-auto",
                          col.align === "right" && "justify-end ml-auto",
                          sortKey === col.key && Boolean(sortDirection)
                            ? "text-foreground font-bold"
                            : "text-muted-foreground"
                        )}
                        title={`Sort by ${col.label} ${
                          sortKey === col.key && sortDirection
                            ? sortDirection === "asc"
                              ? "(ascending - click for descending)"
                              : "(descending - click to clear sort)"
                            : "(click to sort ascending)"
                        }`}
                      >
                        <span>{col.label}</span>
                        {sortKey === col.key && sortDirection ? (
                          sortDirection === "asc" ? (
                            <RiArrowUpLine className="h-3.5 w-3.5 text-primary stroke-[2.5] transition-transform animate-in fade-in-50 duration-150" />
                          ) : (
                            <RiArrowDownLine className="h-3.5 w-3.5 text-primary stroke-[2.5] transition-transform animate-in fade-in-50 duration-150" />
                          )
                        ) : (
                          <RiArrowUpDownLine className="h-3.5 w-3.5 text-muted-foreground/40 group-hover:text-foreground transition-colors" />
                        )}
                      </button>
                    ) : (
                      <span>{col.label}</span>
                    )}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-border/60 text-xs sm:text-sm">
              {isLoading ? (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="px-6 py-16 text-center text-muted-foreground"
                  >
                    <div className="flex flex-col items-center justify-center gap-3">
                      <div className="h-7 w-7 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                      <span className="text-xs font-medium">Loading data...</span>
                    </div>
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="px-6 py-16 text-center text-muted-foreground"
                  >
                    <div className="flex flex-col items-center justify-center gap-2">
                      <RiInboxLine className="h-9 w-9 text-muted-foreground/40" />
                      <p className="text-sm font-medium">{emptyMessage}</p>
                    </div>
                  </td>
                </tr>
              ) : (
                data.map((item, index) => (
                  <tr
                    key={keyExtractor(item, index)}
                    className="hover:bg-surface/50 transition-colors group"
                  >
                    {columns.map((col) => (
                      <td
                        key={col.key}
                        className={cn(
                          "px-5 py-4 text-foreground align-middle whitespace-nowrap",
                          col.align === "center" && "text-center",
                          col.align === "right" && "text-right",
                          col.className
                        )}
                      >
                        {col.render
                          ? col.render(item, index)
                          : ((item as Record<string, unknown>)[col.key] as React.ReactNode) ?? "—"}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Pagination Row */}
        {pagination && (
          <div className="border-t border-border/70 px-5 sm:px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground select-none">
            {/* Left: Total Records Info */}
            <div>
              Showing{" "}
              <span className="font-semibold text-foreground">
                {Math.min(
                  (pagination.currentPage - 1) * pagination.pageSize + 1,
                  pagination.totalItems
                )}
              </span>{" "}
              to{" "}
              <span className="font-semibold text-foreground">
                {Math.min(
                  pagination.currentPage * pagination.pageSize,
                  pagination.totalItems
                )}
              </span>{" "}
              of{" "}
              <span className="font-semibold text-foreground">
                {pagination.totalItems}
              </span>
            </div>

            {/* Center: Per Page Selector */}
            <div className="flex items-center gap-2">
              <span>Per page:</span>
              <div className="flex items-center gap-1 bg-surface/70 p-1 rounded-xl border border-border/60">
                {pageSizeOptions.map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => pagination.onPageSizeChange(size)}
                    className={cn(
                      "px-2.5 py-0.5 rounded-lg font-semibold text-xs transition-all cursor-pointer",
                      pagination.pageSize === size
                        ? "bg-black text-white dark:bg-white dark:text-black shadow-xs"
                        : "text-muted-foreground hover:text-foreground hover:bg-surface"
                    )}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Right: Page Navigation Buttons */}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() =>
                  pagination.onPageChange(Math.max(1, pagination.currentPage - 1))
                }
                disabled={pagination.currentPage <= 1}
                className="p-1.5 rounded-xl border border-border/70 hover:bg-surface text-foreground disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
                aria-label="Previous page"
              >
                <RiArrowLeftSLine className="h-4 w-4" />
              </button>

              <span className="px-3 py-1 rounded-xl bg-black text-white dark:bg-white dark:text-black font-semibold text-xs shadow-xs">
                {pagination.currentPage}
              </span>

              <button
                type="button"
                onClick={() =>
                  pagination.onPageChange(
                    Math.min(pagination.totalPages, pagination.currentPage + 1)
                  )
                }
                disabled={pagination.currentPage >= pagination.totalPages}
                className="p-1.5 rounded-xl border border-border/70 hover:bg-surface text-foreground disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
                aria-label="Next page"
              >
                <RiArrowRightSLine className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminDataTable;
