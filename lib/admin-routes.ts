/** Route path (prefix) → required permission. Staff must have permission to access. */
export const ROUTE_PERMISSION_MAP: Record<string, string> = {
  "/mgmt-x9k2m7": "dashboard",
  "/mgmt-x9k2m7/status": "manage_products",
  "/mgmt-x9k2m7/categories": "manage_categories",
  "/mgmt-x9k2m7/orders": "manage_orders",
  "/mgmt-x9k2m7/licenses": "stock_keys",
  "/mgmt-x9k2m7/products": "manage_products",
  "/mgmt-x9k2m7/coupons": "manage_coupons",
  "/mgmt-x9k2m7/webhooks": "manage_webhooks",
  "/mgmt-x9k2m7/team": "manage_team",
  "/mgmt-x9k2m7/settings": "manage_settings",
  "/mgmt-x9k2m7/logins": "manage_logins",
};

/** Get required permission for a path. Best match (longest prefix) wins. */
export function getRequiredPermissionForPath(pathname: string): string | null {
  const normalized = pathname.replace(/\/$/, "") || "/mgmt-x9k2m7";
  let best: { path: string; perm: string } | null = null;
  for (const [path, perm] of Object.entries(ROUTE_PERMISSION_MAP)) {
    if (normalized === path || normalized.startsWith(path + "/")) {
      if (!best || path.length > best.path.length) best = { path, perm };
    }
  }
  return best?.perm ?? null;
}
