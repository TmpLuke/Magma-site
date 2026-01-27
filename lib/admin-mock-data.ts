import type {
  Product,
  Order,
  LicenseKey,
  Coupon,
  Webhook,
  TeamMember,
  Notification,
} from "./admin-types";

// Production: All data comes from database
// No mock data - admin panel will show empty states until products are added
export const mockProducts: Product[] = [];
export const mockOrders: Order[] = [];
export const mockLicenseKeys: LicenseKey[] = [];
export const mockCoupons: Coupon[] = [];
export const mockWebhooks: Webhook[] = [];
export const mockTeamMembers: TeamMember[] = [];
export const mockNotifications: Notification[] = [];
