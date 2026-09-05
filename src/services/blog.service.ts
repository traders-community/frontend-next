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
   * Checks whether a slug is available.
   */
  async checkSlugAvailability(slug: string, excludeId?: string) {
    return api.get<{
      success: boolean;
      available: boolean;
      normalized?: string;
      message?: string;
    }>("/blog/check-slug", {
      params: { slug, excludeId },
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

  /**
   * Fetches paginated blogs for admin management.
   */
  async getAllBlogsAdmin(
    params: {
      page?: number;
      limit?: number;
      search?: string;
      status?: string;
      category?: string;
      sort?: string;
      order?: "asc" | "desc";
    } = {}
  ) {
    return api.get<{
      success: boolean;
      blogs: Blog[];
      page: number;
      totalPages: number;
      total: number;
      message?: string;
    }>("/admin/blogs", { params });
  },

  /**
   * Fetches a single blog for editing by admin.
   */
  async getAdminBlogById(id: string) {
    return api.get<{ success: boolean; blog: Blog; message?: string }>(`/admin/blogs/${id}`);
  },

  /**
   * Creates a new blog post with multipart form data (image, pdf).
   */
  async addBlog(formData: FormData) {
    return api.post<{ success: boolean; message: string; blog?: Blog }>("/blog/add", formData);
  },

  /**
   * Updates an existing blog post by ID with multipart form data.
   */
  async updateBlog(id: string, formData: FormData) {
    return api.put<{ success: boolean; message: string; blog?: Blog }>(`/blog/${id}`, formData);
  },

  /**
   * Deletes a blog post by ID.
   */
  async deleteBlog(id: string) {
    return api.post<{ success: boolean; message: string }>("/blog/delete", { id });
  },

  /**
   * Toggles the published status of a blog.
   */
  async togglePublish(id: string) {
    return api.post<{ success: boolean; message: string; isPublished?: boolean }>(
      "/blog/toggle-publish",
      { id }
    );
  },
};

export default blogService;
