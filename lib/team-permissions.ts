/**
 * Team permission slugs and labels. Used for invite checkboxes and display.
 */
export const TEAM_PERMISSIONS = [
  { id: "dashboard", label: "Dashboard", description: "View dashboard & stats" },
  { id: "stock_keys", label: "Stock keys", description: "License keys & stock" },
  { id: "manage_products", label: "Manage products", description: "Add, edit, delete products" },
  { id: "manage_orders", label: "Manage orders", description: "View and manage orders" },
  { id: "manage_coupons", label: "Manage coupons", description: "Create and edit coupons" },
  { id: "manage_webhooks", label: "Manage webhooks", description: "Configure webhooks" },
  { id: "manage_team", label: "Manage team", description: "Invite and manage team members" },
  { id: "manage_categories", label: "Manage categories", description: "Product categories" },
  { id: "manage_settings", label: "Manage settings", description: "Store & app settings" },
] as const;

export type PermissionId = (typeof TEAM_PERMISSIONS)[number]["id"];

export const PERMISSION_IDS = TEAM_PERMISSIONS.map((p) => p.id);

export function getPermissionLabel(id: string): string {
  return TEAM_PERMISSIONS.find((p) => p.id === id)?.label ?? id;
}
