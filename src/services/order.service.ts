import { api } from "@/lib/api/client";
import {
  Order,
  OrderListResponse,
  OrderStatsResponse,
  PaymentStatus,
  SubscriptionStatus,
} from "@/types";

export interface UpdateOrderSubscriptionInput {
  subscriptionStatus?: SubscriptionStatus;
  expiryDate?: string;
  extendDays?: number;
  adminNotes?: string;
  telegramId?: string;
  telegramUsername?: string;
}

export const orderService = {
  /**
   * Admin: Get paginated orders list with search and filters
   */
  getAdminOrders: (params?: {
    page?: number;
    limit?: number;
    paymentStatus?: "all" | PaymentStatus;
    subscriptionStatus?: "all" | SubscriptionStatus;
    productId?: string;
    search?: string;
    sort?: string;
    order?: "asc" | "desc";
  }) =>
    api.get<OrderListResponse>("/orders/admin/all", {
      params,
    }),

  /**
   * Admin: Get dashboard KPI metrics and revenue totals
   */
  getAdminStats: () =>
    api.get<OrderStatsResponse>("/orders/admin/stats"),

  /**
   * Admin: Get single order details
   */
  getAdminOrderById: (id: string) =>
    api.get<{ success: boolean; order?: Order; message?: string }>(
      `/orders/admin/${id}`
    ),

  /**
   * Admin: Override subscription status, extend expiry, or update staff notes
   */
  updateSubscription: (id: string, data: UpdateOrderSubscriptionInput) =>
    api.patch<{ success: boolean; message?: string; order?: Order }>(
      `/orders/admin/${id}/subscription`,
      data
    ),

  /**
   * Admin: Delete an order record
   */
  deleteOrder: (id: string) =>
    api.delete<{ success: boolean; message?: string }>(
      `/orders/admin/${id}`
    ),

  /**
   * Public: Customer Checkout / Create order
   */
  createPublicOrder: (data: {
    productId: string;
    variationId: string;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    telegramUsername?: string;
  }) =>
    api.post<{
      success: boolean;
      message?: string;
      order?: Order;
    }>("/orders/checkout", data),

  /**
   * Public: Send email verification OTP for checkout
   */
  sendOtp: (email: string) =>
    api.post<{ success: boolean; message: string }>("/orders/otp/send", { email }),

  /**
   * Public: Verify email OTP for checkout
   */
  verifyOtp: (email: string, otp: string) =>
    api.post<{ success: boolean; message: string; emailVerificationToken?: string }>(
      "/orders/otp/verify",
      { email, otp }
    ),

  /**
   * Public: Create Razorpay Order
   */
  createRazorpayOrder: (data: {
    productId: string;
    variationId: string;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    telegramUsername?: string;
    emailVerificationToken: string;
  }) =>
    api.post<{
      success: boolean;
      orderNumber: string;
      razorpayOrderId: string;
      amount: number;
      amountInPaise: number;
      currency: string;
      keyId: string;
      productTitle: string;
      variationTitle: string;
      message?: string;
    }>("/orders/razorpay/create-order", data),

  /**
   * Public: Verify Razorpay Payment Signature
   */
  verifyRazorpayPayment: (data: {
    orderNumber: string;
    razorpayOrderId: string;
    razorpayPaymentId: string;
    razorpaySignature: string;
  }) =>
    api.post<{
      success: boolean;
      message: string;
      orderNumber: string;
      inviteLink?: string;
      startDate?: string;
      expiryDate?: string;
    }>("/orders/razorpay/verify-payment", data),

  /**
   * Public: Get Order Receipt by Order Number
   */
  getPublicOrderReceipt: (orderNumber: string) =>
    api.get<{
      success: boolean;
      receipt?: Order;
      message?: string;
    }>(`/orders/receipt/${orderNumber}`),
};


