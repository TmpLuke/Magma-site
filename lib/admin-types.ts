// Admin Panel Types

export interface User {
  id: string;
  email: string;
  username: string;
  role: 'admin' | 'support' | 'viewer';
  avatar?: string;
  createdAt: Date;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  gallery: string[]; // Array of in-game screenshot URLs
  game: string;
  status: 'active' | 'inactive' | 'maintenance';
  features: {
    aimbot: string[];
    esp: string[];
    misc: string[];
  };
  pricing: {
    duration: string;
    price: number;
    stock: number;
  }[];
  requirements: {
    cpu: string;
    windows: string;
    cheatType: string;
    controller: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerId: string;
  customerEmail: string;
  customerName: string;
  productId: string;
  productName: string;
  duration: string;
  quantity: number;
  subtotal: number;
  discount: number;
  total: number;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  paymentMethod: 'stripe' | 'paypal' | 'crypto';
  paymentId?: string;
  couponCode?: string;
  createdAt: Date;
}

export interface LicenseKey {
  id: string;
  key: string;
  productId: string;
  productName: string;
  orderId?: string;
  customerId?: string;
  customerEmail?: string;
  status: 'available' | 'active' | 'expired' | 'revoked';
  duration: string;
  hwid?: string;
  activatedAt?: Date;
  expiresAt?: Date;
  createdAt: Date;
}

export interface Coupon {
  id: string;
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  minPurchase?: number;
  maxUses?: number;
  usedCount: number;
  productIds?: string[];
  validFrom: Date;
  validUntil: Date;
  status: 'active' | 'inactive' | 'expired';
  createdAt: Date;
}

export interface Webhook {
  id: string;
  name: string;
  url: string;
  events: string[];
  secret: string;
  status: 'active' | 'inactive';
  lastTriggered?: Date;
  failureCount: number;
  createdAt: Date;
}

export interface TeamMember {
  id: string;
  userId: string;
  email: string;
  username: string;
  role: 'admin' | 'support' | 'viewer';
  permissions: string[];
  avatar?: string;
  lastActive?: Date;
  invitedBy: string;
  joinedAt: Date;
}

export interface ActivityLog {
  id: string;
  userId: string;
  username: string;
  action: string;
  details: string;
  ipAddress: string;
  timestamp: Date;
}

export interface DashboardStats {
  totalRevenue: number;
  revenueChange: number;
  totalOrders: number;
  ordersChange: number;
  activeUsers: number;
  usersChange: number;
  activeLicenses: number;
  licensesChange: number;
}

export interface ChartData {
  date: string;
  revenue: number;
  orders: number;
}

export interface Notification {
  id: string;
  type: 'order' | 'license' | 'alert' | 'system';
  title: string;
  message: string;
  read: boolean;
  createdAt: Date;
}
