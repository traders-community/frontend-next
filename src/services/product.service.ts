import { api } from "@/lib/api/client";
import {
  Product,
  ProductListResponse,
  ProductStatsResponse,
} from "@/types";

export const productService = {
  /**
   * Public: Get list of active published products
   */
  getPublicProducts: () =>
    api.get<{ success: boolean; products: Product[] }>("/products", {
      revalidate: 60,
    }),

  /**
   * Public: Get single product by slug or ID
   */
  getProductBySlugOrId: (slugOrId: string) =>
    api.get<{ success: boolean; product?: Product; message?: string }>(
      `/products/${slugOrId}`,
      { revalidate: 60 }
    ),

  /**
   * Admin / Public: Check slug availability
   */
  checkSlugAvailability: (slug: string, excludeId?: string) =>
    api.get<{
      success: boolean;
      available: boolean;
      normalized?: string;
      message?: string;
    }>("/products/check-slug", {
      params: { slug, excludeId },
    }),

  /**
   * Admin: Get paginated products with filtering & search
   */
  getAdminProducts: (params?: {
    page?: number;
    limit?: number;
    status?: "all" | "active" | "draft";
    search?: string;
    sort?: string;
    order?: "asc" | "desc";
  }) =>
    api.get<ProductListResponse>("/products/admin/all", {
      params,
    }),

  /**
   * Admin: Get product dashboard metrics
   */
  getAdminStats: () =>
    api.get<ProductStatsResponse>("/products/admin/stats"),

  /**
   * Admin: Get single product by ID for editing
   */
  getAdminProductById: (id: string) =>
    api.get<{ success: boolean; product?: Product; message?: string }>(
      `/products/admin/${id}`
    ),

  /**
   * Admin: Create a new product (multipart/form-data)
   */
  createProduct: (formData: FormData) =>
    api.post<{
      success: boolean;
      message?: string;
      product?: Product;
      data?: Product;
    }>("/products/admin", formData),

  /**
   * Admin: Update an existing product (multipart/form-data)
   */
  updateProduct: (id: string, formData: FormData) =>
    api.put<{
      success: boolean;
      message?: string;
      product?: Product;
      data?: Product;
    }>(`/products/admin/${id}`, formData),

  /**
   * Admin: Toggle product status between active and draft
   */
  toggleProductStatus: (id: string) =>
    api.patch<{ success: boolean; message?: string; isActive?: boolean }>(
      `/products/admin/${id}/toggle-status`
    ),

  /**
   * Admin: Permanently delete a product
   */
  deleteProduct: (id: string) =>
    api.delete<{ success: boolean; message?: string }>(
      `/products/admin/${id}`
    ),
};
