import { api } from "@/lib/api/client";
import {
  CreateSupportTicketInput,
  UpdateSupportTicketInput,
  SupportTicketListResponse,
  SupportTicketStatsResponse,
  SupportTicket,
  ApiResponse,
} from "@/types";

export const supportService = {
  /**
   * Public: Submits a support / contact inquiry from the navbar modal.
   */
  submitTicket: (data: CreateSupportTicketInput) =>
    api.post<ApiResponse<{ _id: string; name: string; email: string; topic: string; createdAt: string }>>(
      "/support/submit",
      data
    ),

  /**
   * Admin: Retrieves paginated support tickets with filtering and search.
   */
  getTickets: (params?: {
    page?: number;
    limit?: number;
    status?: string;
    topic?: string;
    search?: string;
    sort?: string;
    order?: "asc" | "desc";
  }) =>
    api.get<SupportTicketListResponse>("/support/admin/tickets", {
      params,
    }),

  /**
   * Admin: Retrieves KPI summary statistics for support inquiries.
   */
  getStats: () =>
    api.get<SupportTicketStatsResponse>("/support/admin/stats"),

  /**
   * Admin: Retrieves a single ticket by its ID.
   */
  getTicketById: (id: string) =>
    api.get<{ success: boolean; ticket?: SupportTicket; message?: string }>(
      `/support/admin/tickets/${id}`
    ),

  /**
   * Admin: Updates ticket status or internal admin notes.
   */
  updateTicket: (id: string, data: UpdateSupportTicketInput) =>
    api.patch<{ success: boolean; message?: string; ticket?: SupportTicket }>(
      `/support/admin/tickets/${id}`,
      data
    ),

  /**
   * Admin: Permanently deletes a support inquiry.
   */
  deleteTicket: (id: string) =>
    api.delete<{ success: boolean; message?: string }>(
      `/support/admin/tickets/${id}`
    ),
};
