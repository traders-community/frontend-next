"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import {
  RiShoppingBag3Line,
  RiAddLine,
  RiCheckLine,
  RiEyeLine,
  RiPencilLine,
  RiDeleteBinLine,
  RiStarFill,
  RiFileList3Line,
  RiInformationLine,
  RiPriceTag3Line,
} from "@remixicon/react";
import { PhotoProvider, PhotoView } from "react-photo-view";
import "react-photo-view/dist/react-photo-view.css";
import { productService } from "@/services/product.service";
import { Product, ProductStats } from "@/types";
import { AdminDataTable, ColumnDef } from "@/components/admin/admin-data-table";
import { AdminModal } from "@/components/admin/admin-modal";
import { ConfirmationModal } from "@/components/admin/confirmation-modal";
import { ProductForm } from "@/components/admin/product-form";
import { formatDate, formatDateTime, cn } from "@/lib/utils";

export default function AdminProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [stats, setStats] = useState<ProductStats | null>(null);
  const [loading, setLoading] = useState(true);

  // Search & Filter State
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "draft">("all");

  // Sorting: 3 states (asc, desc, null)
  const [sortKey, setSortKey] = useState<string | null>("createdAt");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc" | null>("desc");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Add / Edit Modal State (matching listBlog implementation)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isFormDirty, setIsFormDirty] = useState(false);

  // Delete Modal State
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch products and statistics
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [productsRes, statsRes] = await Promise.all([
        productService.getAdminProducts({
          page: currentPage,
          limit: pageSize,
          status: statusFilter === "all" ? undefined : statusFilter,
          search: search.trim() || undefined,
          sort: sortKey || undefined,
          order: sortDirection || undefined,
        }),
        productService.getAdminStats().catch(() => null),
      ]);

      if (productsRes.data?.success) {
        setProducts(productsRes.data.products || []);
        setTotalPages(productsRes.data.totalPages || 1);
        setTotalItems(productsRes.data.total || 0);
      } else {
        toast.error(productsRes.data?.message || "Failed to load products");
      }

      if (statsRes?.data?.success && statsRes.data.stats) {
        setStats(statsRes.data.stats);
      }
    } catch (error: unknown) {
      const err = error as { message?: string };
      toast.error(err.message || "Error fetching products");
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, statusFilter, search, sortKey, sortDirection]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Handle Sort Change: 3 states (asc, desc, null)
  const handleSortChange = (key: string) => {
    setCurrentPage(1);
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

  // Quick 1-Click Status Toggle
  const handleToggleStatus = async (product: Product, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const res = await productService.toggleProductStatus(product._id);
      if (res.data?.success) {
        toast.success(res.data.message || "Product status updated");
        fetchData();
      } else {
        toast.error(res.data?.message || "Failed to update product status");
      }
    } catch (error: unknown) {
      const err = error as { message?: string };
      toast.error(err.message || "Error updating status");
    }
  };

  // Confirm Delete
  const handleConfirmDelete = async () => {
    if (!deletingProduct) return;

    try {
      setIsDeleting(true);
      const res = await productService.deleteProduct(deletingProduct._id);
      if (res.data?.success) {
        toast.success("Product deleted successfully");
        setDeletingProduct(null);
        if (products.length === 1 && currentPage > 1) {
          setCurrentPage((prev) => prev - 1);
        } else {
          fetchData();
        }
      } else {
        toast.error(res.data?.message || "Failed to delete product");
      }
    } catch (error: unknown) {
      const err = error as { message?: string };
      toast.error(err.message || "Error deleting product");
    } finally {
      setIsDeleting(false);
    }
  };

  // Table Columns Definition
  const columns: ColumnDef<Product>[] = [
    {
      key: "title",
      label: "PRODUCT",
      sortable: true,
      render: (item) => (
        <div className="flex items-center gap-3 max-w-[320px] sm:max-w-md">
          {/* Cover Thumbnail with Zoom Preview */}
          <div className="w-12 h-12 aspect-square rounded-xl overflow-hidden bg-surface shrink-0 border border-border/70 relative group">
            {item.featuredImage ? (
              <PhotoView src={item.featuredImage}>
                <div className="h-full w-full cursor-zoom-in relative">
                  <img
                    src={item.featuredImage}
                    alt={item.title}
                    className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/35 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                    <RiEyeLine className="h-4 w-4 text-white drop-shadow" />
                  </div>
                </div>
              </PhotoView>
            ) : (
              <div className="h-full w-full flex items-center justify-center text-xs font-bold text-muted-foreground bg-primary/10 text-primary">
                {item.title.charAt(0).toUpperCase()}
              </div>
            )}
          </div>

          {/* Title & Slug — Clickable to open Edit Modal (matching blog) */}
          <button
            type="button"
            onClick={() => {
              setIsFormDirty(false);
              setEditingProduct(item);
            }}
            className="min-w-0 flex-1 text-left group/title cursor-pointer"
          >
            <p className="font-semibold text-foreground text-sm truncate leading-snug group-hover/title:text-primary transition-colors">
              {item.title}
            </p>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="font-mono text-[11px] text-muted-foreground truncate">
                /{item.slug}
              </span>
              {item.points && item.points.length > 0 && (
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-surface border border-border/60 text-muted-foreground">
                  {item.points.length} features
                </span>
              )}
            </div>
          </button>
        </div>
      ),
    },
    {
      key: "plans",
      label: "VARIATIONS (PLANS)",
      render: (item) => {
        const defaultVariation =
          item.variations.find((v) => v.isDefault) || item.variations[0];
        return (
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="px-2.5 py-1 rounded-lg text-xs font-medium bg-surface text-foreground border border-border/70">
                {item.variations.length}{" "}
                {item.variations.length === 1 ? "Plan" : "Plans"}
              </span>
              {defaultVariation && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-primary/15 text-primary border border-primary/30">
                  <RiStarFill className="h-3 w-3" />
                  <span>{defaultVariation.title}</span>
                </span>
              )}
            </div>
          </div>
        );
      },
    },
    {
      key: "pricing",
      label: "PRICE RANGE",
      render: (item) => {
        if (!item.variations || item.variations.length === 0) {
          return <span className="text-xs text-muted-foreground">—</span>;
        }
        const prices = item.variations.map((v) => v.sellingPrice);
        const minPrice = Math.min(...prices);
        const maxPrice = Math.max(...prices);

        return (
          <div className="text-xs">
            <span className="font-bold text-foreground block">
              {minPrice === maxPrice
                ? `₹${minPrice.toLocaleString("en-IN")}`
                : `₹${minPrice.toLocaleString("en-IN")} – ₹${maxPrice.toLocaleString("en-IN")}`}
            </span>
            <span className="text-[10px] text-muted-foreground">
              {item.variations.some((v) => v.actualPrice > v.sellingPrice)
                ? "Discounts available"
                : "Standard price"}
            </span>
          </div>
        );
      },
    },
    {
      key: "isActive",
      label: "STATUS",
      sortable: true,
      align: "center",
      render: (item) => (
        <button
          type="button"
          onClick={(e) => handleToggleStatus(item, e)}
          title={`Click to ${item.isActive ? "Unpublish" : "Publish"}`}
          className="group cursor-pointer focus:outline-none"
        >
          <span
            className={cn(
              "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold tracking-wide transition-all shadow-2xs",
              item.isActive
                ? "bg-black text-white dark:bg-white dark:text-black group-hover:opacity-85"
                : "bg-surface text-muted-foreground group-hover:text-foreground border border-border/80"
            )}
          >
            <span
              className={cn(
                "h-1.5 w-1.5 rounded-full",
                item.isActive ? "bg-emerald-400" : "bg-muted-foreground"
              )}
            />
            <span>{item.isActive ? "Published" : "Draft"}</span>
          </span>
        </button>
      ),
    },
    {
      key: "createdAt",
      label: "CREATED",
      sortable: true,
      render: (item) => (
        <span
          className="text-xs text-muted-foreground whitespace-nowrap"
          title={formatDateTime(item.createdAt)}
        >
          {formatDate(item.createdAt)}
        </span>
      ),
    },
    {
      key: "actions",
      label: "ACTIONS",
      align: "right",
      render: (item) => (
        <div
          className="flex items-center justify-end gap-1.5"
          onClick={(e) => e.stopPropagation()}
        >
          {/* View Preview */}
          <button
            type="button"
            onClick={() => {
              window.open(`/product/${item.slug || item._id}`, "_blank", "noopener,noreferrer");
            }}
            title="Preview product page"
            className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-surface border border-transparent hover:border-border/60 transition-colors cursor-pointer"
          >
            <RiEyeLine className="h-4 w-4" />
          </button>

          {/* Edit (Opens Modal matching blog) */}
          <button
            type="button"
            onClick={() => {
              setIsFormDirty(false);
              setEditingProduct(item);
            }}
            title="Edit product"
            className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-surface border border-transparent hover:border-border/60 transition-colors cursor-pointer"
          >
            <RiPencilLine className="h-4 w-4" />
          </button>

          {/* Delete (Red) */}
          <button
            type="button"
            onClick={() => setDeletingProduct(item)}
            title="Delete product"
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
      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Products */}
        <div className="rounded-2xl border border-border/80 bg-card p-4 sm:p-5 shadow-2xs">
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Total Products
            </span>
            <div className="h-7 w-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <RiShoppingBag3Line className="h-4 w-4" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-foreground">
            {stats?.totalProducts ?? totalItems}
          </p>
        </div>

        {/* Active Products */}
        <div className="rounded-2xl border border-border/80 bg-card p-4 sm:p-5 shadow-2xs">
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Active / Live
            </span>
            <div className="h-7 w-7 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <RiCheckLine className="h-4 w-4" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-foreground">
            {stats?.activeProducts ?? "—"}
          </p>
        </div>

        {/* Total Plan Variations */}
        <div className="rounded-2xl border border-border/80 bg-card p-4 sm:p-5 shadow-2xs">
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Configured Tiers
            </span>
            <div className="h-7 w-7 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center">
              <RiFileList3Line className="h-4 w-4" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-foreground">
            {stats?.totalVariations ?? "—"}
          </p>
        </div>

        {/* Drafts */}
        <div className="rounded-2xl border border-border/80 bg-card p-4 sm:p-5 shadow-2xs">
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Drafts
            </span>
            <div className="h-7 w-7 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center">
              <RiInformationLine className="h-4 w-4" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-foreground">
            {stats?.draftProducts ?? "—"}
          </p>
        </div>
      </div>

      {/* Main Table via Reusable AdminDataTable with PhotoProvider */}
      <PhotoProvider speed={() => 300} maskOpacity={0.85}>
        <AdminDataTable<Product>
          title="Subscription Products"
          subtitle="Manage your channel subscription products, pricing tiers, and unique gateway SKUs"
          searchPlaceholder="Search products by title, slug, or SKU..."
          searchValue={search}
          onSearchChange={(val) => {
            setSearch(val);
            setCurrentPage(1);
          }}
          actionButton={{
            label: "Add Product",
            icon: RiAddLine,
            onClick: () => {
              setIsFormDirty(false);
              setIsAddModalOpen(true);
            },
          }}
          filterActive={statusFilter !== "all"}
          filterContent={
            <div className="space-y-3 min-w-[200px]">
              <div className="flex items-center justify-between border-b border-border/60 pb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Status Filter
                </span>
                {statusFilter !== "all" && (
                  <button
                    type="button"
                    onClick={() => {
                      setStatusFilter("all");
                      setCurrentPage(1);
                    }}
                    className="text-[11px] font-semibold text-primary hover:underline cursor-pointer"
                  >
                    Reset
                  </button>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {[
                  { label: "All Products", val: "all" },
                  { label: "Published", val: "active" },
                  { label: "Drafts", val: "draft" },
                ].map((opt) => (
                  <button
                    key={opt.val}
                    type="button"
                    onClick={() => {
                      setStatusFilter(opt.val as "all" | "active" | "draft");
                      setCurrentPage(1);
                    }}
                    className={cn(
                      "px-3.5 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer",
                      statusFilter === opt.val
                        ? "bg-black text-white dark:bg-white dark:text-black shadow-xs font-semibold"
                        : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200 hover:text-neutral-900 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
                    )}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          }
          columns={columns}
          data={products}
          keyExtractor={(item) => item._id}
          isLoading={loading}
          emptyMessage="No subscription products found. Click '+ Add Product' to create your first channel product."
          sortKey={sortKey}
          sortDirection={sortDirection}
          onSortChange={handleSortChange}
          pagination={{
            currentPage,
            totalPages,
            totalItems,
            pageSize,
            onPageChange: setCurrentPage,
            onPageSizeChange: (size) => {
              setPageSize(size);
              setCurrentPage(1);
            },
            pageSizeOptions: [5, 10, 20, 50],
          }}
        />
      </PhotoProvider>

      {/* Add Product Modal (matching listBlog/page.tsx) */}
      <AdminModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Subscription Product"
        subtitle="Configure channel access durations, pricing, and gateway SKUs"
        externalHref="/admin/products/new"
        externalTitle="Open in full page editor"
        size="3xl"
        isDirty={isFormDirty}
      >
        <ProductForm
          onSuccess={() => {
            setIsAddModalOpen(false);
            fetchData();
          }}
          onCancel={() => setIsAddModalOpen(false)}
          onDirtyChange={setIsFormDirty}
        />
      </AdminModal>

      {/* Edit Product Modal (matching listBlog/page.tsx) */}
      <AdminModal
        isOpen={Boolean(editingProduct)}
        onClose={() => setEditingProduct(null)}
        title="Edit Subscription Product"
        subtitle={`Updating: ${editingProduct?.title || "Product"}`}
        size="3xl"
        isDirty={isFormDirty}
      >
        {editingProduct && (
          <ProductForm
            initialData={editingProduct}
            isEdit={true}
            onSuccess={() => {
              setEditingProduct(null);
              fetchData();
            }}
            onCancel={() => setEditingProduct(null)}
            onDirtyChange={setIsFormDirty}
          />
        )}
      </AdminModal>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={Boolean(deletingProduct)}
        title="Delete Subscription Product?"
        description={`Are you sure you want to permanently delete '${deletingProduct?.title}'? This action cannot be undone.`}
        confirmText="Delete Product"
        cancelText="Cancel"
        confirmVariant="danger"
        isLoading={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeletingProduct(null)}
      />
    </div>
  );
}
