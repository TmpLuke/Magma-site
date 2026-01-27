export interface Product {
  id: string;
  name: string;
  slug: string;
  game: string;
  description: string | null;
  image: string | null;
  provider: string;
  features: string[];
  requirements: string[];
  status: 'active' | 'inactive' | 'maintenance';
  created_at: string;
  updated_at: string;
}

export interface ProductVariant {
  id: string;
  product_id: string;
  duration: string;
  price: number;
  stock: number;
  created_at: string;
}

export interface Order {
  id: string;
  order_number: string;
  customer_email: string;
  product_id: string | null;
  product_name: string;
  duration: string;
  amount_cents: number;
  status: 'pending' | 'completed' | 'failed' | 'refunded' | 'paid';
  payment_method: string;
  created_at: string;
  updated_at: string;
}

export interface OrderWithDetails extends Order {
  product?: Product | null;
  license?: License | null;
}

export interface License {
  id: string;
  license_key: string;
  order_id: string | null;
  product_id: string | null;
  product_name: string;
  customer_email: string;
  status: 'active' | 'expired' | 'revoked' | 'unused';
  expires_at: string | null;
  hwid: string | null;
  created_at: string;
  updated_at: string;
}

export interface Coupon {
  id: string;
  code: string;
  discount_percent: number;
  max_uses: number | null;
  current_uses: number;
  valid_from: string;
  valid_until: string | null;
  is_active: boolean;
  created_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  created_at: string;
}
