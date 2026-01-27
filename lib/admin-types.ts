export interface Product {
  id: string;
  name: string;
  slug: string;
  game: string;
  description: string;
  image: string;
  status: "active" | "inactive" | "maintenance";
  pricing: {
    "1 Day": number;
    "7 Days": number;
    "30 Days": number;
  };
  features: string[];
  requirements: string[];
  gallery: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerEmail: string;
  productId: string;
  productName: string;
  duration: string;
  amount: number;
  status: "pending" | "completed" | "failed" | "refunded";
  paymentMethod: string;
  createdAt: Date;
}

export interface LicenseKey {
  id: string;
  key: string;
  productId: string;
  productName: string;
  customerEmail: string | null;
  status: "available" | "active" | "expired" | "revoked";
  expiresAt: Date | null;
  hwid: string | null;
  createdAt: Date;
}

export interface Coupon {
  id: string;
  code: string;
  type: "percentage" | "fixed";
  value: number;
  status: "active" | "inactive";
  uses: number;
  maxUses: number | null;
  validUntil: Date | null;
  createdAt: Date;
}

export interface Webhook {
  id: string;
  name: string;
  url: string;
  events: string[];
  status: "active" | "inactive";
  lastTriggered: Date | null;
  successRate: number;
  createdAt: Date;
}

export interface TeamMember {
  id: string;
  username: string;
  email: string;
  role: "admin" | "support" | "developer";
  avatar: string;
  status: "active" | "inactive";
  lastActive: Date;
  createdAt: Date;
}

export interface Notification {
  id: string;
  type: "order" | "license" | "alert" | "system";
  title: string;
  message: string;
  read: boolean;
  createdAt: Date;
}
