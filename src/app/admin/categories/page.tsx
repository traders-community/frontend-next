"use client";

import React, { useState, useEffect, useCallback } from "react";
import { toast } from "react-toastify";
import { RiPencilLine, RiDeleteBinLine, RiAddLine } from "@remixicon/react";
import { categoryService } from "@/services/category.service";
import { Category } from "@/types";
import { AdminDataTable, ColumnDef } from "@/components/admin/admin-data-table";
import { AdminModal } from "@/components/admin/admin-modal";
import { ConfirmationModal } from "@/components/admin/confirmation-modal";
import { cn } from "@/lib/utils";

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

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

  // Delete Confirmation State
  const [deletingCategory, setDeletingCategory] = useState<Category | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Sorting State: 3 states (1. asc, 2. desc, 3. nothing)
  const [sortKey, setSortKey] = useState<string | null>("name");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc" | null>("asc");

  // Status Filter State
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);
      const res = await categoryService.getAdminCategories({
        search: search.trim() || undefined,
        status: statusFilter === "all" ? undefined : statusFilter,
        sort: sortKey || undefined,
        order: sortDirection || undefined,
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
  }, [search, statusFilter, sortKey, sortDirection]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // Handle Sort: 3 states (1. asc, 2. desc, 3. nothing)
  const handleSortChange = (key: string) => {
    setCurrentPage(1);
    if (sortKey !== key) {
      // 1. First click on a column: ASC
      setSortKey(key);
      setSortDirection("asc");
    } else if (sortDirection === "asc") {
      // 2. Second click: DESC
      setSortDirection("desc");
    } else if (sortDirection === "desc") {
      // 3. Third click: NOTHING (reset sort)
      setSortKey(null);
      setSortDirection(null);
    } else {
      // From nothing: ASC
      setSortKey(key);
      setSortDirection("asc");
    }
  };

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

  // Toggle active/inactive status
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

  const handleSaveCategory = async (e: React.SubmitEvent) => {
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

  const columns: ColumnDef<Category>[] = [
    {
      key: "name",
      label: "NAME",
      sortable: true,
      render: (cat) => (
        <div className="font-semibold text-foreground text-sm">
          {cat.name}
          {cat.description && (
            <p className="text-xs text-muted-foreground font-normal mt-0.5">
              {cat.description}
            </p>
          )}
        </div>
      ),
    },
    {
      key: "isActive",
      label: "STATUS",
      align: "center",
      sortable: true,
      render: (cat) => (
        <button
          type="button"
          onClick={() => handleToggleActive(cat)}
          title={`Click to mark as ${cat.isActive !== false ? "Inactive" : "Active"}`}
          className="group cursor-pointer focus:outline-none"
        >
          <span
            className={cn(
              "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold tracking-wide transition-all shadow-2xs",
              cat.isActive !== false
                ? "bg-black text-white dark:bg-white dark:text-black group-hover:opacity-85"
                : "bg-surface text-muted-foreground group-hover:text-foreground border border-border/80"
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
      ),
    },
    {
      key: "actions",
      label: "ACTIONS",
      align: "right",
      render: (cat) => (
        <div className="flex items-center justify-end gap-1.5">
          <button
            type="button"
            onClick={() => handleOpenEdit(cat)}
            title="Edit category"
            className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-surface border border-transparent hover:border-border/60 transition-colors cursor-pointer"
          >
            <RiPencilLine className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => setDeletingCategory(cat)}
            title="Delete category"
            className="p-2 rounded-xl text-red-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-colors cursor-pointer"
          >
            <RiDeleteBinLine className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Single Reusable Table Component */}
      <AdminDataTable<Category>
        title="Categories"
        subtitle="Manage blog tags and category filters displayed across the website"
        searchPlaceholder="Search categories..."
        searchValue={search}
        onSearchChange={(val) => {
          setSearch(val);
          setCurrentPage(1);
        }}
        filterActive={statusFilter !== "all"}
        filterContent={
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                Status
              </label>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setStatusFilter("all");
                    setCurrentPage(1);
                  }}
                  className={cn(
                    "px-3.5 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer",
                    statusFilter === "all"
                      ? "bg-black text-white dark:bg-white dark:text-black shadow-xs font-semibold"
                      : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200 hover:text-neutral-900 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
                  )}
                >
                  All
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setStatusFilter("active");
                    setCurrentPage(1);
                  }}
                  className={cn(
                    "px-3.5 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer",
                    statusFilter === "active"
                      ? "bg-black text-white dark:bg-white dark:text-black shadow-xs font-semibold"
                      : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200 hover:text-neutral-900 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
                  )}
                >
                  Active
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setStatusFilter("inactive");
                    setCurrentPage(1);
                  }}
                  className={cn(
                    "px-3.5 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer",
                    statusFilter === "inactive"
                      ? "bg-black text-white dark:bg-white dark:text-black shadow-xs font-semibold"
                      : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200 hover:text-neutral-900 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
                  )}
                >
                  Inactive
                </button>
              </div>
            </div>

            {statusFilter !== "all" && (
              <div className="pt-2 border-t border-border/60 flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setStatusFilter("all");
                    setCurrentPage(1);
                  }}
                  className="text-xs text-muted-foreground hover:text-foreground font-medium underline underline-offset-4 cursor-pointer transition-colors"
                >
                  Reset all filters
                </button>
              </div>
            )}
          </div>
        }
        actionButton={{
          label: "Add Category",
          icon: RiAddLine,
          onClick: handleOpenAdd,
        }}
        columns={columns}
        data={categories}
        keyExtractor={(item) => item._id}
        isLoading={loading}
        emptyMessage="No categories found. Click '+ Add Category' to create one."
        sortKey={sortKey}
        sortDirection={sortDirection}
        onSortChange={handleSortChange}
      />

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
