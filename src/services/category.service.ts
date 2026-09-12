import { api } from "@/lib/api/client";
import { Category } from "@/types";

export interface PublicCategoriesResponse {
  success: boolean;
  categories: Category[];
  message?: string;
}

/**
 * Dedicated Category Service for fetching public and admin categories.
 */
export const categoryService = {
  /**
   * Fetches all active public categories.
   */
  async getPublicCategories(revalidate: number | false = 0) {
    return api.get<PublicCategoriesResponse>("/admin/public-categories", {
      revalidate,
    });
  },

  /**
   * Fetches all categories for admin management.
   */
  async getAdminCategories(
    params: {
      search?: string;
      sort?: string;
      order?: "asc" | "desc";
      status?: "all" | "active" | "inactive";
    } = {}
  ) {
    return api.get<{ success: boolean; categories: Category[]; message?: string }>(
      "/admin/categories",
      { params }
    );
  },

  /**
   * Creates a new category.
   */
  async createCategory(data: { name: string; description?: string; sortOrder?: number; isActive?: boolean }) {
    return api.post<{ success: boolean; message: string; category?: Category }>(
      "/admin/categories",
      data
    );
  },

  /**
   * Updates an existing category by ID.
   */
  async updateCategory(id: string, data: Partial<Category>) {
    return api.put<{ success: boolean; message: string; category?: Category }>(
      `/admin/categories/${id}`,
      data
    );
  },

  /**
   * Deletes a category by ID.
   */
  async deleteCategory(id: string) {
    return api.delete<{ success: boolean; message: string }>(`/admin/categories/${id}`);
  },

  /**
   * Persists drag-and-drop sort order. Accepts an array of { id, sortOrder } pairs.
   */
  async reorderCategories(order: { id: string; sortOrder: number }[]) {
    return api.put<{ success: boolean; message: string }>(
      "/admin/categories/reorder",
      { order }
    );
  },
};

export default categoryService;
