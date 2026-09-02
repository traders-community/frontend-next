import { api } from "@/lib/api/client";
import { Blog, BlogListResponse, Comment } from "@/types";

export interface GetBlogsParams {
  page?: number;
  limit?: number;
  category?: string;
  search?: string;
  revalidate?: number | false;
}

export interface SingleBlogResponse {
  success: boolean;
  blog?: Blog;
  message?: string;
}

export interface CommentsResponse {
  success: boolean;
  comments?: Comment[];
  message?: string;
}

/**
 * Dedicated Blog Service managing all blog-related API calls.
 */
export const blogService = {
  /**
   * Fetches paginated blogs with optional category and search filters.
   */
  async getBlogs(params: GetBlogsParams = {}) {
    const { page = 1, limit = 9, category, search, revalidate } = params;

    const queryParams: Record<string, string | number> = {
      page,
      limit,
    };

    if (category && category !== "All") {
      queryParams.category = category;
    }

    if (search && search.trim()) {
      queryParams.search = search.trim();
    }

    return api.get<BlogListResponse>("/blog/all", {
      params: queryParams,
      revalidate,
    });
  },

  /**
   * Fetches a single blog by its ID (supports Next.js ISR/SSR revalidation).
   */
  async getBlogById(id: string, revalidate?: number | false) {
    return api.get<SingleBlogResponse>(`/blog/${id}`, {
      revalidate,
    });
  },

  /**
   * Fetches approved comments for a specific blog post.
   */
  async getBlogComments(blogId: string) {
    return api.post<CommentsResponse>("/blog/comments", { blogId });
  },

  /**
   * Submits a new comment for approval on a blog post.
   */
  async addComment(blogId: string, name: string, content: string) {
    return api.post<{ success: boolean; message: string }>("/blog/add-comment", {
      blog: blogId,
      name,
      content,
    });
  },
};

export default blogService;
