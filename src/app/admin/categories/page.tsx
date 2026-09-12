"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { toast } from "react-toastify";
import {
  RiPencilLine,
  RiDeleteBinLine,
  RiAddLine,
  RiDraggable,
  RiSearchLine,
  RiEqualizerLine,
  RiArrowUpLine,
  RiArrowDownLine,
  RiArrowUpDownLine,
  RiCheckLine,
  RiCloseLine,
  RiInboxLine,
} from "@remixicon/react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { categoryService } from "@/services/category.service";
import { Category } from "@/types";
import { AdminModal } from "@/components/admin/admin-modal";
import { ConfirmationModal } from "@/components/admin/confirmation-modal";
import { cn } from "@/lib/utils";
import { useDebounce } from "@/hooks/use-debounce";

// ─── Helpers ────────────────────────────────────────────────────────────────

function formatDate(dateStr?: string) {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

// ─── Sortable Row Component ──────────────────────────────────────────────────

interface SortableRowProps {
  cat: Category;
  isDragMode: boolean;
  isDragging?: boolean;
  onEdit: (cat: Category) => void;
  onDelete: (cat: Category) => void;
  onToggleActive: (cat: Category) => void;
}

function SortableRow({
  cat,
  isDragMode,
  isDragging,
  onEdit,
  onDelete,
  onToggleActive,
}: SortableRowProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({ id: cat._id, disabled: !isDragMode });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isSortableDragging ? 0.35 : 1,
  };

  return (
    <tr
      ref={setNodeRef}
      style={style}
      className={cn(
        "group transition-colors",
        isDragging
          ? "bg-surface/80"
          : "hover:bg-surface-hover/50"
      )}
    >
      {/* Drag Handle Column */}
      <td className="w-12 px-3 py-4 text-center">
        {isDragMode ? (
          <button
            {...attributes}
            {...listeners}
            type="button"
            title="Drag to reorder vertically"
            className="inline-flex items-center justify-center w-7 h-7 rounded-lg text-muted-foreground opacity-80 sm:opacity-40 sm:group-hover:opacity-100 hover:text-foreground hover:bg-surface border border-transparent hover:border-border/60 transition-all cursor-grab active:cursor-grabbing focus:outline-none touch-none select-none"
          >
            <RiDraggable className="h-4 w-4" />
          </button>
        ) : (
          <div className="w-7 h-7" />
        )}
      </td>

      {/* 1. Category Name */}
      <td className="px-5 py-4">
        <span className="font-semibold text-foreground text-sm">{cat.name}</span>
      </td>

      {/* 2. Description Column */}
      <td className="px-5 py-4 max-w-[280px]">
        {cat.description ? (
          <span className="text-sm text-muted-foreground line-clamp-1" title={cat.description}>
            {cat.description}
          </span>
        ) : (
          <span className="text-sm text-muted-foreground/40">—</span>
        )}
      </td>

      {/* 3. Status Column */}
      <td className="px-5 py-4 text-left">
        <button
          type="button"
          onClick={() => onToggleActive(cat)}
          title={`Click to mark as ${cat.isActive !== false ? "Inactive" : "Active"}`}
          className="group/status cursor-pointer focus:outline-none inline-block"
        >
          <span
            className={cn(
              "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold tracking-wide transition-all shadow-2xs",
              cat.isActive !== false
                ? "bg-black text-white dark:bg-white dark:text-black group-hover/status:opacity-85"
                : "bg-surface text-muted-foreground group-hover/status:text-foreground border border-border/80"
            )}
          >
            <span
              className={cn(
                "h-1.5 w-1.5 rounded-full",
                cat.isActive !== false ? "bg-emerald-400" : "bg-muted-foreground"
              )}
            />
            <span>{cat.isActive !== false ? "Active" : "Inactive"}</span>
          </span>
        </button>
      </td>

      {/* 4. Date Column */}
      <td className="px-5 py-4 text-sm text-muted-foreground whitespace-nowrap">
        {formatDate(cat.createdAt)}
      </td>

      {/* Actions Column */}
      <td className="px-5 py-4 text-right">
        <div className="flex items-center justify-end gap-1.5">
          <button
            type="button"
            onClick={() => onEdit(cat)}
            title="Edit category"
            className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-surface border border-transparent hover:border-border/60 transition-colors cursor-pointer"
          >
            <RiPencilLine className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => onDelete(cat)}
            title="Delete category"
            className="p-2 rounded-xl text-red-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-colors cursor-pointer"
          >
            <RiDeleteBinLine className="h-4 w-4" />
          </button>
        </div>
      </td>
    </tr>
  );
}

// ─── Drag Overlay Row (floating preview while dragging) ─────────────────────

function OverlayRow({ cat }: { cat: Category }) {
  return (
    <table className="w-full">
      <tbody>
        <tr className="bg-card border border-border/80 rounded-2xl shadow-2xl">
          <td className="w-12 px-3 py-4 text-center">
            <div className="inline-flex items-center justify-center w-7 h-7 text-foreground">
              <RiDraggable className="h-4 w-4" />
            </div>
          </td>
          <td className="px-5 py-4">
            <span className="font-semibold text-foreground text-sm">{cat.name}</span>
          </td>
          <td className="px-5 py-4 max-w-[280px]">
            <span className="text-sm text-muted-foreground line-clamp-1">{cat.description || "—"}</span>
          </td>
          <td className="px-5 py-4 text-left">
            <span
              className={cn(
                "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold",
                cat.isActive !== false
                  ? "bg-black text-white dark:bg-white dark:text-black"
                  : "bg-surface text-muted-foreground border border-border/80"
              )}
            >
              <span
                className={cn(
                  "h-1.5 w-1.5 rounded-full",
                  cat.isActive !== false ? "bg-emerald-400" : "bg-muted-foreground"
                )}
              />
              {cat.isActive !== false ? "Active" : "Inactive"}
            </span>
          </td>
          <td className="px-5 py-4 text-sm text-muted-foreground whitespace-nowrap">
            {formatDate(cat.createdAt)}
          </td>
          <td className="px-5 py-4 text-right w-24" />
        </tr>
      </tbody>
    </table>
  );
}

// ─── Column Sort Header ──────────────────────────────────────────────────────

function SortTh({
  label,
  sortKey: colKey,
  activeSortKey,
  sortDirection,
  onSort,
  disabled = false,
  align = "left",
  className,
}: {
  label: string;
  sortKey: string;
  activeSortKey: string | null;
  sortDirection: "asc" | "desc" | null;
  onSort: (key: string) => void;
  disabled?: boolean;
  align?: "left" | "center" | "right";
  className?: string;
}) {
  const isSorted = activeSortKey === colKey && Boolean(sortDirection);
  return (
    <th
      scope="col"
      className={cn(
        "px-5 py-3.5 text-[11px] font-bold uppercase tracking-wider text-foreground select-none whitespace-nowrap transition-colors",
        disabled
          ? "text-muted-foreground/40 cursor-not-allowed"
          : "cursor-pointer hover:text-primary focus:outline-none focus-visible:ring-1 focus-visible:ring-primary",
        align === "center" && "text-center",
        align === "right" && "text-right",
        className
      )}
      onClick={() => !disabled && onSort(colKey)}
      title={disabled ? "Column sorting is disabled in Drag Mode" : `Sort by ${label}`}
    >
      <div
        className={cn(
          "inline-flex items-center gap-1.5",
          align === "center" && "justify-center mx-auto",
          align === "right" && "justify-end ml-auto"
        )}
      >
        <span>{label}</span>
        {!disabled && (
          <>
            {isSorted ? (
              sortDirection === "asc" ? (
                <RiArrowUpLine className="h-3.5 w-3.5 text-primary stroke-[2.5] transition-transform animate-in fade-in-50 duration-150" />
              ) : (
                <RiArrowDownLine className="h-3.5 w-3.5 text-primary stroke-[2.5] transition-transform animate-in fade-in-50 duration-150" />
              )
            ) : (
              <RiArrowUpDownLine className="h-3.5 w-3.5 text-foreground/50 hover:text-foreground transition-colors" />
            )}
          </>
        )}
      </div>
    </th>
  );
}

// ─── Main Admin Categories Page ──────────────────────────────────────────────

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 400);

  // Drag Mode state
  const [isDragMode, setIsDragMode] = useState(false);
  const [activeDragId, setActiveDragId] = useState<string | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [initialFormValues, setInitialFormValues] = useState({
    name: "",
    description: "",
    isActive: true,
  });

  const isFormDirty =
    name !== initialFormValues.name ||
    description !== initialFormValues.description ||
    isActive !== initialFormValues.isActive;

  // Delete State
  const [deletingCategory, setDeletingCategory] = useState<Category | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Sorting State (3 states: asc -> desc -> null)
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc" | null>(null);

  // Status Filter State
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [filterOpen, setFilterOpen] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);

  // Close filter popover on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) {
        setFilterOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Configure mouse & touch sensors for robust desktop and mobile DnD
  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 150, // 150ms press before drag begins on touch devices
        tolerance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);
      const res = await categoryService.getAdminCategories({
        search: debouncedSearch.trim() || undefined,
        status: statusFilter === "all" ? undefined : statusFilter,
        sort: isDragMode ? "sortOrder" : sortKey || undefined,
        order: isDragMode ? "asc" : sortDirection || undefined,
      });
      if (res.data?.success) {
        setCategories(res.data.categories || []);
      } else {
        toast.error(res.data?.message || "Failed to load categories");
      }
    } catch (error: unknown) {
      const err = error as { message?: string };
      toast.error(err.message || "Failed to fetch categories");
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, statusFilter, sortKey, sortDirection, isDragMode]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // Toggle Drag Mode
  const handleToggleDragMode = () => {
    if (!isDragMode) {
      setSearch("");
      setSortKey(null);
      setSortDirection(null);
      setStatusFilter("all");
      setIsDragMode(true);
    } else {
      setIsDragMode(false);
    }
  };

  // Handle Sort Change
  const handleSortChange = (key: string) => {
    if (isDragMode) return;
    if (sortKey !== key) {
      setSortKey(key);
      setSortDirection("asc");
    } else if (sortDirection === "asc") {
      setSortDirection("desc");
    } else if (sortDirection === "desc") {
      setSortKey(null);
      setSortDirection(null);
    } else {
      setSortKey(key);
      setSortDirection("asc");
    }
  };

  // Drag Handlers
  const handleDragStart = (event: DragStartEvent) => {
    setActiveDragId(event.active.id as string);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    setActiveDragId(null);
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = categories.findIndex((c) => c._id === active.id);
    const newIndex = categories.findIndex((c) => c._id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    const reordered = arrayMove(categories, oldIndex, newIndex);
    setCategories(reordered); // Optimistic UI update

    const orderPayload = reordered.map((c, idx) => ({
      id: c._id,
      sortOrder: idx,
    }));

    try {
      const res = await categoryService.reorderCategories(orderPayload);
      if (res.data?.success) {
        toast.success("Category order updated");
      } else {
        toast.error(res.data?.message || "Failed to update category order");
        fetchCategories(); // Rollback on failure
      }
    } catch (error: unknown) {
      const err = error as { message?: string };
      toast.error(err.message || "Failed to save category order");
      fetchCategories(); // Rollback on failure
    }
  };

  // Modal Handlers
  const handleOpenAdd = () => {
    setEditingCategory(null);
    setName("");
    setDescription("");
    setIsActive(true);
    setInitialFormValues({ name: "", description: "", isActive: true });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (category: Category) => {
    setEditingCategory(category);
    const catName = category.name || "";
    const catDesc = category.description || "";
    const catActive = category.isActive !== false;
    setName(catName);
    setDescription(catDesc);
    setIsActive(catActive);
    setInitialFormValues({ name: catName, description: catDesc, isActive: catActive });
    setIsModalOpen(true);
  };

  const handleToggleActive = async (cat: Category) => {
    try {
      const nextState = !(cat.isActive !== false);
      const res = await categoryService.updateCategory(cat._id, { isActive: nextState });
      if (res.data?.success) {
        toast.success(`Category "${cat.name}" marked as ${nextState ? "Active" : "Inactive"}`);
        setCategories((prev) =>
          prev.map((c) => (c._id === cat._id ? { ...c, isActive: nextState } : c))
        );
      } else {
        toast.error(res.data?.message || "Failed to update category status");
      }
    } catch (error: unknown) {
      const err = error as { message?: string };
      toast.error(err.message || "Error updating category status");
    }
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Category name is required");
      return;
    }

    try {
      setIsSaving(true);
      if (editingCategory?._id) {
        const res = await categoryService.updateCategory(editingCategory._id, {
          name: name.trim(),
          description: description.trim(),
          isActive,
        });
        if (res.data?.success) {
          toast.success(res.data.message || "Category updated successfully");
          setIsModalOpen(false);
          fetchCategories();
        } else {
          toast.error(res.data?.message || "Failed to update category");
        }
      } else {
        const res = await categoryService.createCategory({
          name: name.trim(),
          description: description.trim(),
          sortOrder: categories.length,
          isActive,
        });
        if (res.data?.success) {
          toast.success(res.data.message || "Category created successfully");
          setIsModalOpen(false);
          fetchCategories();
        } else {
          toast.error(res.data?.message || "Failed to create category");
        }
      }
    } catch (error: unknown) {
      const err = error as { message?: string };
      toast.error(err.message || "Error saving category");
    } finally {
      setIsSaving(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingCategory?._id) return;
    try {
      setIsDeleting(true);
      const res = await categoryService.deleteCategory(deletingCategory._id);
      if (res.data?.success) {
        toast.success(res.data.message || "Category deleted successfully");
        setDeletingCategory(null);
        fetchCategories();
      } else {
        toast.error(res.data?.message || "Failed to delete category");
      }
    } catch (error: unknown) {
      const err = error as { message?: string };
      toast.error(err.message || "Error deleting category");
    } finally {
      setIsDeleting(false);
    }
  };

  const activeDragCategory = activeDragId ? categories.find((c) => c._id === activeDragId) : null;
  const filterActive = statusFilter !== "all";

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-300">
      {/* Top Header & Controls Row (OUTSIDE the table card, matching Blog page) */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Title & Subtitle Full Width */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
            Categories
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
            Manage blog categories, descriptions, and custom display order across the platform
          </p>
        </div>

        {/* Search, Filter, Drag Mode & Add Action (Search bar with buttons beside it, + icon only on mobile) */}
        <div className="relative flex items-center gap-2 w-full lg:w-auto">
          {/* Search Bar with Debouncing */}
          <div className="relative flex items-center flex-1 lg:flex-initial min-w-0 sm:min-w-[240px] lg:min-w-[260px]">
            <RiSearchLine className="absolute left-3.5 h-4 w-4 text-muted-foreground pointer-events-none" />
            <input
              type="text"
              value={search}
              disabled={isDragMode}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={isDragMode ? "Search disabled in Drag Mode" : "Search categories..."}
              className={cn(
                "w-full pl-9.5 pr-8 py-2 text-xs sm:text-sm bg-card border border-border/80 rounded-xl sm:rounded-2xl placeholder:text-muted-foreground text-foreground shadow-2xs focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all",
                isDragMode && "opacity-50 cursor-not-allowed bg-surface"
              )}
            />
            {search && !isDragMode && (
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => setSearch("")}
                className="absolute right-2.5 z-10 p-1 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                aria-label="Clear search"
              >
                <RiCloseLine className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Filter Popover Dropdown */}
          <div className="static sm:relative shrink-0" ref={filterRef}>
            <button
              type="button"
              disabled={isDragMode}
              onClick={() => setFilterOpen((prev) => !prev)}
              className={cn(
                "p-2.5 rounded-xl sm:rounded-2xl border transition-all cursor-pointer shadow-2xs relative",
                filterActive || filterOpen
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border/80 bg-card text-muted-foreground hover:text-foreground hover:bg-surface-hover",
                isDragMode && "opacity-50 cursor-not-allowed pointer-events-none"
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
            {filterOpen && !isDragMode && (
              <div className="absolute left-0 right-0 sm:left-auto sm:right-0 top-full mt-2 sm:w-80 bg-card text-card-foreground border border-border/80 rounded-2xl sm:rounded-3xl shadow-2xl p-5 z-50 animate-in fade-in-0 zoom-in-95 duration-150">
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
                <div className="pt-3.5 space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                      Status
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {(["all", "active", "inactive"] as const).map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => {
                            setStatusFilter(s);
                            setFilterOpen(false);
                          }}
                          className={cn(
                            "px-3.5 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer capitalize",
                            statusFilter === s
                              ? "bg-black text-white dark:bg-white dark:text-black shadow-xs font-semibold"
                              : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200 hover:text-neutral-900 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
                          )}
                        >
                          {s === "all" ? "All" : s.charAt(0).toUpperCase() + s.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>
                  {filterActive && (
                    <div className="pt-2 border-t border-border/60 flex justify-end">
                      <button
                        type="button"
                        onClick={() => {
                          setStatusFilter("all");
                          setFilterOpen(false);
                        }}
                        className="text-xs text-muted-foreground hover:text-foreground font-medium underline underline-offset-4 cursor-pointer transition-colors"
                      >
                        Reset filters
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Drag Mode Toggle Button (Icon on mobile, text on sm+) */}
          <button
            type="button"
            onClick={handleToggleDragMode}
            title={
              isDragMode
                ? "Click to exit Drag Mode"
                : "Click to enable Drag & Drop reordering"
            }
            className={cn(
              "inline-flex items-center justify-center p-2.5 sm:px-3.5 sm:py-2 text-xs sm:text-sm font-semibold rounded-xl sm:rounded-2xl border transition-all cursor-pointer shadow-2xs select-none shrink-0",
              isDragMode
                ? "border-black bg-black text-white dark:border-white dark:bg-white dark:text-black shadow-xs font-semibold"
                : "border-border/80 bg-card text-muted-foreground hover:text-foreground hover:bg-surface-hover"
            )}
          >
            {isDragMode ? (
              <>
                <RiCheckLine className="h-4 w-4" />
                <span className="hidden sm:inline sm:ml-1.5">Exit Drag</span>
              </>
            ) : (
              <>
                <RiDraggable className="h-4 w-4" />
                <span className="hidden sm:inline sm:ml-1.5">Drag Mode</span>
              </>
            )}
          </button>

          {/* Primary Action Button (+ Add Category) - icon only on mobile, text on sm+ */}
          <button
            type="button"
            onClick={handleOpenAdd}
            title="Add Category"
            className="inline-flex items-center justify-center p-2.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-semibold rounded-xl sm:rounded-2xl bg-black text-white dark:bg-white dark:text-black hover:opacity-90 transition-opacity shadow-2xs cursor-pointer shrink-0"
          >
            <RiAddLine className="h-4 w-4" />
            <span className="hidden sm:inline sm:ml-1.5">Add Category</span>
          </button>
        </div>
      </div>

      {/* Main Table Card Container (matching exact Blog page container) */}
      <div className="rounded-2xl sm:rounded-3xl border border-border/80 bg-card overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="h-8 w-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
              <p className="mt-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground animate-pulse">
                Loading categories...
              </p>
            </div>
          ) : categories.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 px-4 text-center">
              <div className="h-12 w-12 rounded-full bg-surface flex items-center justify-center text-muted-foreground mb-3 border border-border/80">
                <RiInboxLine className="h-6 w-6" />
              </div>
              <p className="text-sm font-semibold text-foreground">No categories found</p>
              <p className="text-xs text-muted-foreground mt-1 max-w-sm">
                Click &apos;+ Add Category&apos; to create your first category.
              </p>
            </div>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
            >
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border/70 bg-surface/30">
                    {/* Six Dots Drag Handle Col Header */}
                    <th className="w-12 px-3 py-3.5 text-left text-[11px] font-bold uppercase tracking-wider text-foreground select-none whitespace-nowrap">
                      {isDragMode ? "Order" : ""}
                    </th>
                    <SortTh
                      label="NAME"
                      sortKey="name"
                      activeSortKey={sortKey}
                      sortDirection={sortDirection}
                      onSort={handleSortChange}
                      disabled={isDragMode}
                    />
                    <th className="px-5 py-3.5 text-[11px] font-bold uppercase tracking-wider text-foreground select-none whitespace-nowrap text-left">
                      DESCRIPTION
                    </th>
                    <SortTh
                      label="STATUS"
                      sortKey="isActive"
                      activeSortKey={sortKey}
                      sortDirection={sortDirection}
                      onSort={handleSortChange}
                      disabled={isDragMode}
                      align="left"
                    />
                    <SortTh
                      label="DATE"
                      sortKey="createdAt"
                      activeSortKey={sortKey}
                      sortDirection={sortDirection}
                      onSort={handleSortChange}
                      disabled={isDragMode}
                      align="left"
                    />
                    <th className="px-5 py-3.5 text-[11px] font-bold uppercase tracking-wider text-foreground select-none whitespace-nowrap text-right">
                      ACTIONS
                    </th>
                  </tr>
                </thead>
                <SortableContext
                  items={categories.map((c) => c._id)}
                  strategy={verticalListSortingStrategy}
                >
                  <tbody className="divide-y divide-border/60 text-xs sm:text-sm">
                    {categories.map((cat) => (
                      <SortableRow
                        key={cat._id}
                        cat={cat}
                        isDragMode={isDragMode}
                        isDragging={activeDragId === cat._id}
                        onEdit={handleOpenEdit}
                        onDelete={setDeletingCategory}
                        onToggleActive={handleToggleActive}
                      />
                    ))}
                  </tbody>
                </SortableContext>
              </table>

              {/* Ghost row overlay on active drag */}
              <DragOverlay>
                {activeDragCategory ? <OverlayRow cat={activeDragCategory} /> : null}
              </DragOverlay>
            </DndContext>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 border-t border-border/70 bg-surface/30 flex items-center justify-between text-xs text-muted-foreground font-medium">
          <span>
            {categories.length} {categories.length === 1 ? "category" : "categories"}
          </span>
          {isDragMode && (
            <span className="flex items-center gap-1.5 font-medium text-foreground">
              <RiDraggable className="h-3.5 w-3.5 text-foreground" />
              Hover & drag six dots to reorder vertically · Auto-saves to DB
            </span>
          )}
        </div>
      </div>

      {/* Add / Edit Category Modal */}
      <AdminModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingCategory ? "Edit Category" : "Add New Category"}
        subtitle={
          editingCategory
            ? `Updating category: ${editingCategory.name}`
            : "Create a topic category for tagging blog posts"
        }
        size="md"
        isDirty={isFormDirty}
      >
        <form onSubmit={handleSaveCategory} className="space-y-5">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
              Category Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Price Action, Risk Management"
              className="w-full px-4 py-2.5 text-sm bg-card border border-border/80 rounded-xl placeholder:text-muted-foreground text-foreground shadow-2xs focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
              Description (Optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Brief context about this category..."
              className="w-full px-4 py-2.5 text-sm bg-card border border-border/80 rounded-xl placeholder:text-muted-foreground text-foreground shadow-2xs focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
            />
          </div>

          <label className="flex items-center gap-3 px-4 py-2.5 rounded-xl border border-border/80 bg-card cursor-pointer select-none">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="h-4 w-4 rounded text-primary focus:ring-primary/30 cursor-pointer"
            />
            <span className="text-sm font-medium text-foreground">
              Active on Public Filters
            </span>
          </label>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border/60">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              disabled={isSaving}
              className="px-4 py-2 text-xs sm:text-sm font-semibold rounded-xl border border-border/80 text-foreground hover:bg-surface transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex items-center gap-2 px-5 py-2 text-xs sm:text-sm font-semibold rounded-xl bg-black text-white dark:bg-white dark:text-black hover:opacity-90 transition-opacity shadow-xs cursor-pointer disabled:opacity-50"
            >
              {isSaving && (
                <div className="h-3.5 w-3.5 border-2 border-white dark:border-black border-t-transparent rounded-full animate-spin" />
              )}
              <span>{editingCategory ? "Update Category" : "Save Category"}</span>
            </button>
          </div>
        </form>
      </AdminModal>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={Boolean(deletingCategory)}
        title="Delete Category?"
        description={`Are you sure you want to delete "${deletingCategory?.name}"? Blogs assigned to this category will need to be recategorized.`}
        confirmText="Delete Category"
        cancelText="Cancel"
        confirmVariant="danger"
        isLoading={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeletingCategory(null)}
      />
    </div>
  );
}
