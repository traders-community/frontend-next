import { api } from "@/lib/api/client";
import {
  ProductReview,
  ProductReviewListResponse,
  CreateProductReviewInput,
  ProductReviewStatus,
} from "@/types";

export interface AdminProductReviewListResponse {
  success: boolean;
  reviews: ProductReview[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  stats?: {
    totalReviews: number;
    pendingCount: number;
    approvedCount: number;
  };
  message?: string;
}

export const productReviewService = {
  /**
   * Public: Fetch approved reviews & aggregated rating stats for a product
   */
  getProductReviews: (
    productId: string,
    params?: {
      page?: number;
      limit?: number;
      rating?: number;
      sort?: "newest" | "highest" | "lowest";
    }
  ) =>
    api.get<ProductReviewListResponse>(`/products/${productId}/reviews`, {
      params,
      revalidate: 60,
    }),

  /**
   * Public: Submit a new review for a product
   */
  submitProductReview: (productId: string, data: CreateProductReviewInput) =>
    api.post<{
      success: boolean;
      message?: string;
      review?: ProductReview;
    }>(`/products/${productId}/reviews`, data),

  /**
   * Admin: Get all reviews with status filters, search, and pagination
   */
  getAdminProductReviews: (params?: {
    page?: number;
    limit?: number;
    status?: string;
    productId?: string;
    search?: string;
    sort?: string;
    order?: "asc" | "desc";
  }) =>
    api.get<AdminProductReviewListResponse>("/products/reviews/admin/all", {
      params,
    }),

  /**
   * Admin: Approve a review
   */
  approveReview: (id: string) =>
    api.patch<{
      success: boolean;
      message?: string;
      review?: ProductReview;
    }>(`/products/reviews/admin/${id}/approve`),

  /**
   * Admin: Unapprove a review (without deleting)
   */
  unapproveReview: (id: string) =>
    api.patch<{
      success: boolean;
      message?: string;
      review?: ProductReview;
    }>(`/products/reviews/admin/${id}/unapprove`),

  /**
   * Admin: Update review moderation status (pending, approved, unapproved)
   */
  updateReviewStatus: (id: string, status: ProductReviewStatus) =>
    api.patch<{
      success: boolean;
      message?: string;
      review?: ProductReview;
    }>(`/products/reviews/admin/${id}/status`, { status }),

  /**
   * Admin: Delete a review permanently
   */
  deleteReview: (id: string) =>
    api.delete<{
      success: boolean;
      message?: string;
    }>(`/products/reviews/admin/${id}`),
};
