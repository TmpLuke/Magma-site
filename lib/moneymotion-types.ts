// Money Motion API Types

export interface MoneyMotionCheckoutRequest {
  amount: number; // Amount in dollars
  currency?: string;
  customer_email: string;
  description?: string;
  metadata?: {
    order_id?: string;
    product_id?: string;
    license_duration?: string;
    [key: string]: string | undefined;
  };
  success_url?: string;
  cancel_url?: string;
}

export interface MoneyMotionCheckoutResponse {
  success: boolean;
  sessionId?: string;
  checkoutUrl?: string;
  error?: string;
  message?: string;
}

export interface MoneyMotionSessionStatus {
  success: boolean;
  sessionId?: string;
  status?: "pending" | "completed" | "expired" | "cancelled";
  paid?: boolean;
  amount?: number;
  currency?: string;
  customer_email?: string;
  paid_at?: string;
  metadata?: Record<string, string>;
  error?: string;
}

export interface MoneyMotionWebhookPayload {
  event: "checkout.completed" | "checkout.expired" | "checkout.cancelled";
  sessionId: string;
  amount?: number;
  currency?: string;
  customer_email?: string;
  metadata?: {
    order_id?: string;
    product_id?: string;
    license_duration?: string;
  };
  paid_at?: string;
}

export interface CreateCheckoutRequest {
  amount: number; // In dollars
  currency?: string;
  customer_email: string;
  description?: string;
  order_id: string;
  product_id?: string;
  license_duration?: string;
  success_url?: string;
  cancel_url?: string;
}

export interface CreateCheckoutResponse {
  success: boolean;
  sessionId?: string;
  checkoutUrl?: string;
  error?: string;
}

export interface PaymentSession {
  id: string;
  session_id: string;
  amount: number;
  currency: string;
  status: "pending" | "completed" | "cancelled" | "expired";
  customer_email: string;
  description: string;
  order_id: string;
  product_id: string | null;
  license_duration: string | null;
  paid_at: string | null;
  created_at: string;
  updated_at: string;
}
