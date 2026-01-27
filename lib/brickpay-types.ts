// BrickPay API Types

export interface BrickPayInvoiceRequest {
  amount_cents: number;
  currency: string;
  customer_email: string;
  description: string;
  external_id: string;
}

export interface BrickPayInvoiceResponse {
  id: number;
  public_token: string;
  amount_cents: number;
  currency: string;
  status: "pending" | "completed" | "cancelled" | "expired";
  payment_link: string;
  created_at: string;
  expires_at: string;
}

export interface BrickPayStatusResponse {
  id: number;
  public_token: string;
  amount_cents: number;
  currency: string;
  status: "pending" | "completed" | "cancelled" | "expired";
  paid: boolean;
  payment_id: number | null;
  paid_at: string | null;
}

export interface CreateInvoiceRequest {
  amount: number; // In dollars
  currency?: string;
  customer_email: string;
  description: string;
  order_id: string;
  product_id?: string;
  license_duration?: string;
}

export interface CreateInvoiceResponse {
  success: boolean;
  invoice_id?: number;
  payment_link?: string;
  public_token?: string;
  error?: string;
}

export interface CheckStatusResponse {
  success: boolean;
  paid: boolean;
  status: string;
  amount_cents?: number;
  currency?: string;
  paid_at?: string | null;
  payment_id?: number | null;
  error?: string;
}

export interface PaymentOrder {
  id: string;
  brickpay_invoice_id: number | null;
  brickpay_public_token: string | null;
  amount_cents: number;
  currency: string;
  status: "pending" | "completed" | "cancelled" | "expired";
  customer_email: string;
  description: string;
  external_id: string;
  product_id: string | null;
  license_duration: string | null;
  payment_id: number | null;
  paid_at: string | null;
  created_at: string;
  updated_at: string;
}
