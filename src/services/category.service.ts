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
  async getPublicCategories(revalidate: number | false = 300) {
    return api.get<PublicCategoriesResponse>("/admin/public-categories", {
      revalidate,
    });
  },
};

export default categoryService;
