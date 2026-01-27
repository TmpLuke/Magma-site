import type {
  Product,
  Order,
  LicenseKey,
  Coupon,
  Webhook,
  TeamMember,
  Notification,
} from "./admin-types";

export const mockProducts: Product[] = [];
export const mockOrders: Order[] = [];
export const mockLicenseKeys: LicenseKey[] = [];
export const mockCoupons: Coupon[] = [];
export const mockWebhooks: Webhook[] = [];
export const mockTeamMembers: TeamMember[] = [];
export const mockNotifications: Notification[] = [
  {
    id: "1",
    type: "order",
    title: "New Order",
    message: "Order #MC-2026-1234 received",
    read: false,
    createdAt: new Date(),
  },
];
