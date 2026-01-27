"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  Product,
  Order,
  LicenseKey,
  Coupon,
  Webhook,
  TeamMember,
  Notification,
} from "./admin-types";
import {
  mockProducts,
  mockOrders,
  mockLicenseKeys,
  mockCoupons,
  mockWebhooks,
  mockTeamMembers,
  mockNotifications,
} from "./admin-mock-data";
import {
  createProductInDB,
  updateProductInDB,
  deleteProductFromDB,
  updateOrderStatusInDB,
  createLicenseInDB,
  updateLicenseStatusInDB,
  revokeLicenseInDB,
  createCouponInDB,
  updateCouponInDB,
  deleteCouponFromDB,
  createWebhookInDB,
  updateWebhookInDB,
  deleteWebhookFromDB,
  createTeamMemberInDB,
  updateTeamMemberInDB,
  deleteTeamMemberFromDB,
} from "./admin-actions";

interface AdminStore {
  // Data
  products: Product[];
  orders: Order[];
  licenseKeys: LicenseKey[];
  coupons: Coupon[];
  webhooks: Webhook[];
  teamMembers: TeamMember[];
  notifications: Notification[];

  // UI State
  sidebarOpen: boolean;
  isLoading: boolean;
  error: string | null;

  // Hydration state
  _hasHydrated: boolean;
  setHasHydrated: (state: boolean) => void;

  // Actions
  setSidebarOpen: (open: boolean) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  // Product Actions (with DB sync)
  addProduct: (product: Product) => Promise<void>;
  updateProduct: (id: string, updates: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  getProductBySlug: (slug: string) => Product | undefined;
  setProducts: (products: Product[]) => void;

  // Order Actions (with DB sync)
  updateOrderStatus: (id: string, status: Order["status"]) => Promise<void>;
  setOrders: (orders: Order[]) => void;

  // License Actions (with DB sync)
  addLicenseKey: (key: LicenseKey) => Promise<void>;
  updateLicenseStatus: (id: string, status: LicenseKey["status"]) => Promise<void>;
  revokeLicense: (id: string) => Promise<void>;
  setLicenseKeys: (keys: LicenseKey[]) => void;

  // Coupon Actions (with DB sync)
  addCoupon: (coupon: Coupon) => Promise<void>;
  updateCoupon: (id: string, updates: Partial<Coupon>) => Promise<void>;
  deleteCoupon: (id: string) => Promise<void>;
  setCoupons: (coupons: Coupon[]) => void;

  // Webhook Actions (with DB sync)
  addWebhook: (webhook: Webhook) => Promise<void>;
  updateWebhook: (id: string, updates: Partial<Webhook>) => Promise<void>;
  deleteWebhook: (id: string) => Promise<void>;
  setWebhooks: (webhooks: Webhook[]) => void;

  // Team Actions (with DB sync)
  addTeamMember: (member: TeamMember) => Promise<void>;
  updateTeamMember: (id: string, updates: Partial<TeamMember>) => Promise<void>;
  removeTeamMember: (id: string) => Promise<void>;
  setTeamMembers: (members: TeamMember[]) => void;

  // Notification Actions
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  addNotification: (notification: Notification) => void;
}

export const useAdminStore = create<AdminStore>()(
  persist(
    (set, get) => ({
      // Initialize with mock data
      products: mockProducts,
      orders: mockOrders,
      licenseKeys: mockLicenseKeys,
      coupons: mockCoupons,
      webhooks: mockWebhooks,
      teamMembers: mockTeamMembers,
      notifications: mockNotifications,

      // UI State
      isLoading: false,
      error: null,

      // Hydration state for SSR
      _hasHydrated: false,
      setHasHydrated: (state) => set({ _hasHydrated: state }),

      sidebarOpen: true,

      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      setLoading: (loading) => set({ isLoading: loading }),
      setError: (error) => set({ error }),

      // Setters for loading data from DB
      setProducts: (products) => set({ products }),
      setOrders: (orders) => set({ orders }),
      setLicenseKeys: (keys) => set({ licenseKeys: keys }),
      setCoupons: (coupons) => set({ coupons }),
      setWebhooks: (webhooks) => set({ webhooks }),
      setTeamMembers: (members) => set({ teamMembers: members }),

      // Product Actions with DB sync
      addProduct: async (product) => {
        set({ isLoading: true, error: null });
        
        // Optimistically update local state
        set((state) => ({ products: [...state.products, product] }));
        
        try {
          const result = await createProductInDB({
            name: product.name,
            slug: product.slug,
            game: product.game,
            description: product.description,
            image: product.image,
            status: product.status === "active" ? "Undetected" : "Updating",
            pricing: product.pricing,
            features: product.features,
            requirements: product.requirements,
            gallery: product.gallery,
          });
          
          if (!result.success) {
            set({ error: result.error || "Failed to create product" });
          }
        } catch (e) {
          set({ error: "Failed to sync with database" });
        } finally {
          set({ isLoading: false });
        }
      },

      updateProduct: async (id, updates) => {
        set({ isLoading: true, error: null });
        
        // Optimistically update local state
        set((state) => ({
          products: state.products.map((p) =>
            p.id === id ? { ...p, ...updates, updatedAt: new Date() } : p
          ),
        }));
        
        try {
          const dbUpdates: Record<string, unknown> = { ...updates };
          if (updates.status) {
            dbUpdates.status = updates.status === "active" ? "Undetected" : "Updating";
          }
          
          const result = await updateProductInDB(id, dbUpdates as Parameters<typeof updateProductInDB>[1]);
          
          if (!result.success) {
            set({ error: result.error || "Failed to update product" });
          }
        } catch (e) {
          set({ error: "Failed to sync with database" });
        } finally {
          set({ isLoading: false });
        }
      },

      deleteProduct: async (id) => {
        set({ isLoading: true, error: null });
        
        // Optimistically update local state
        set((state) => ({
          products: state.products.filter((p) => p.id !== id),
        }));
        
        try {
          const result = await deleteProductFromDB(id);
          
          if (!result.success) {
            set({ error: result.error || "Failed to delete product" });
          }
        } catch (e) {
          set({ error: "Failed to sync with database" });
        } finally {
          set({ isLoading: false });
        }
      },

      getProductBySlug: (slug) => get().products.find((p) => p.slug === slug),

      // Order Actions with DB sync
      updateOrderStatus: async (id, status) => {
        set({ isLoading: true, error: null });
        
        // Optimistically update local state
        set((state) => ({
          orders: state.orders.map((o) => (o.id === id ? { ...o, status } : o)),
        }));
        
        try {
          const result = await updateOrderStatusInDB(id, status);
          
          if (!result.success) {
            set({ error: result.error || "Failed to update order" });
          }
        } catch (e) {
          set({ error: "Failed to sync with database" });
        } finally {
          set({ isLoading: false });
        }
      },

      // License Actions with DB sync
      addLicenseKey: async (key) => {
        set({ isLoading: true, error: null });
        
        // Optimistically update local state
        set((state) => ({ licenseKeys: [...state.licenseKeys, key] }));
        
        try {
          const result = await createLicenseInDB({
            license_key: key.key,
            product_id: key.productId,
            product_name: key.productName,
            customer_email: key.customerEmail || "unassigned@magma.com",
            status: key.status === "available" ? "unused" : key.status,
            expires_at: key.expiresAt?.toISOString(),
          });
          
          if (!result.success) {
            set({ error: result.error || "Failed to create license" });
          }
        } catch (e) {
          set({ error: "Failed to sync with database" });
        } finally {
          set({ isLoading: false });
        }
      },

      updateLicenseStatus: async (id, status) => {
        set({ isLoading: true, error: null });
        
        // Optimistically update local state
        set((state) => ({
          licenseKeys: state.licenseKeys.map((l) =>
            l.id === id ? { ...l, status } : l
          ),
        }));
        
        try {
          const result = await updateLicenseStatusInDB(id, status);
          
          if (!result.success) {
            set({ error: result.error || "Failed to update license" });
          }
        } catch (e) {
          set({ error: "Failed to sync with database" });
        } finally {
          set({ isLoading: false });
        }
      },

      revokeLicense: async (id) => {
        set({ isLoading: true, error: null });
        
        // Optimistically update local state
        set((state) => ({
          licenseKeys: state.licenseKeys.map((l) =>
            l.id === id ? { ...l, status: "revoked" as const } : l
          ),
        }));
        
        try {
          const result = await revokeLicenseInDB(id);
          
          if (!result.success) {
            set({ error: result.error || "Failed to revoke license" });
          }
        } catch (e) {
          set({ error: "Failed to sync with database" });
        } finally {
          set({ isLoading: false });
        }
      },

      // Coupon Actions with DB sync
      addCoupon: async (coupon) => {
        set({ isLoading: true, error: null });
        
        // Optimistically update local state
        set((state) => ({ coupons: [...state.coupons, coupon] }));
        
        try {
          const result = await createCouponInDB({
            code: coupon.code,
            discount_percent: coupon.type === "percentage" ? coupon.value : 0,
            max_uses: coupon.maxUses,
            valid_until: coupon.validUntil?.toISOString(),
            is_active: coupon.status === "active",
          });
          
          if (!result.success) {
            set({ error: result.error || "Failed to create coupon" });
          }
        } catch (e) {
          set({ error: "Failed to sync with database" });
        } finally {
          set({ isLoading: false });
        }
      },

      updateCoupon: async (id, updates) => {
        set({ isLoading: true, error: null });
        
        // Optimistically update local state
        set((state) => ({
          coupons: state.coupons.map((c) =>
            c.id === id ? { ...c, ...updates } : c
          ),
        }));
        
        try {
          const dbUpdates: Record<string, unknown> = {};
          if (updates.status !== undefined) {
            dbUpdates.is_active = updates.status === "active";
          }
          if (updates.value !== undefined) {
            dbUpdates.discount_percent = updates.value;
          }
          if (updates.maxUses !== undefined) {
            dbUpdates.max_uses = updates.maxUses;
          }
          
          const result = await updateCouponInDB(id, dbUpdates as Parameters<typeof updateCouponInDB>[1]);
          
          if (!result.success) {
            set({ error: result.error || "Failed to update coupon" });
          }
        } catch (e) {
          set({ error: "Failed to sync with database" });
        } finally {
          set({ isLoading: false });
        }
      },

      deleteCoupon: async (id) => {
        set({ isLoading: true, error: null });
        
        // Optimistically update local state
        set((state) => ({
          coupons: state.coupons.filter((c) => c.id !== id),
        }));
        
        try {
          const result = await deleteCouponFromDB(id);
          
          if (!result.success) {
            set({ error: result.error || "Failed to delete coupon" });
          }
        } catch (e) {
          set({ error: "Failed to sync with database" });
        } finally {
          set({ isLoading: false });
        }
      },

      // Webhook Actions with DB sync
      addWebhook: async (webhook) => {
        set({ isLoading: true, error: null });
        
        // Optimistically update local state
        set((state) => ({ webhooks: [...state.webhooks, webhook] }));
        
        try {
          const result = await createWebhookInDB({
            name: webhook.name,
            url: webhook.url,
            events: webhook.events,
            is_active: webhook.status === "active",
          });
          
          if (!result.success) {
            set({ error: result.error || "Failed to create webhook" });
          }
        } catch (e) {
          set({ error: "Failed to sync with database" });
        } finally {
          set({ isLoading: false });
        }
      },

      updateWebhook: async (id, updates) => {
        set({ isLoading: true, error: null });
        
        // Optimistically update local state
        set((state) => ({
          webhooks: state.webhooks.map((w) =>
            w.id === id ? { ...w, ...updates } : w
          ),
        }));
        
        try {
          const dbUpdates: Record<string, unknown> = { ...updates };
          if (updates.status !== undefined) {
            dbUpdates.is_active = updates.status === "active";
            delete dbUpdates.status;
          }
          
          const result = await updateWebhookInDB(id, dbUpdates as Parameters<typeof updateWebhookInDB>[1]);
          
          if (!result.success) {
            set({ error: result.error || "Failed to update webhook" });
          }
        } catch (e) {
          set({ error: "Failed to sync with database" });
        } finally {
          set({ isLoading: false });
        }
      },

      deleteWebhook: async (id) => {
        set({ isLoading: true, error: null });
        
        // Optimistically update local state
        set((state) => ({
          webhooks: state.webhooks.filter((w) => w.id !== id),
        }));
        
        try {
          const result = await deleteWebhookFromDB(id);
          
          if (!result.success) {
            set({ error: result.error || "Failed to delete webhook" });
          }
        } catch (e) {
          set({ error: "Failed to sync with database" });
        } finally {
          set({ isLoading: false });
        }
      },

      // Team Actions with DB sync
      addTeamMember: async (member) => {
        set({ isLoading: true, error: null });
        
        // Optimistically update local state
        set((state) => ({ teamMembers: [...state.teamMembers, member] }));
        
        try {
          const result = await createTeamMemberInDB({
            name: member.username,
            email: member.email,
            role: member.role === "admin" ? "Admin" : member.role === "support" ? "Support" : "Support",
            avatar: member.avatar,
          });
          
          if (!result.success) {
            set({ error: result.error || "Failed to create team member" });
          }
        } catch (e) {
          set({ error: "Failed to sync with database" });
        } finally {
          set({ isLoading: false });
        }
      },

      updateTeamMember: async (id, updates) => {
        set({ isLoading: true, error: null });
        
        // Optimistically update local state
        set((state) => ({
          teamMembers: state.teamMembers.map((m) =>
            m.id === id ? { ...m, ...updates } : m
          ),
        }));
        
        try {
          const dbUpdates: Record<string, unknown> = {};
          if (updates.username) dbUpdates.name = updates.username;
          if (updates.email) dbUpdates.email = updates.email;
          if (updates.role) {
            dbUpdates.role = updates.role === "admin" ? "Admin" : updates.role === "support" ? "Support" : "Support";
          }
          
          const result = await updateTeamMemberInDB(id, dbUpdates as Parameters<typeof updateTeamMemberInDB>[1]);
          
          if (!result.success) {
            set({ error: result.error || "Failed to update team member" });
          }
        } catch (e) {
          set({ error: "Failed to sync with database" });
        } finally {
          set({ isLoading: false });
        }
      },

      removeTeamMember: async (id) => {
        set({ isLoading: true, error: null });
        
        // Optimistically update local state
        set((state) => ({
          teamMembers: state.teamMembers.filter((m) => m.id !== id),
        }));
        
        try {
          const result = await deleteTeamMemberFromDB(id);
          
          if (!result.success) {
            set({ error: result.error || "Failed to remove team member" });
          }
        } catch (e) {
          set({ error: "Failed to sync with database" });
        } finally {
          set({ isLoading: false });
        }
      },

      // Notification Actions (local only)
      markNotificationRead: (id) =>
        set((state) => ({
          notifications: state.notifications.map((n) =>
            n.id === id ? { ...n, read: true } : n
          ),
        })),

      markAllNotificationsRead: () =>
        set((state) => ({
          notifications: state.notifications.map((n) => ({ ...n, read: true })),
        })),

      addNotification: (notification) =>
        set((state) => ({
          notifications: [notification, ...state.notifications],
        })),
    }),
    {
      name: "admin-store",
      version: 2, // Increment to force localStorage reset
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
