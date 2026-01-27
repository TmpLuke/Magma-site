"use client";

import { useEffect, useState } from "react";
import { AdminShell } from "@/components/admin/admin-shell";
import { DataTable } from "@/components/admin/data-table";
import { createClient } from "@/lib/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Clock, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Order {
  id: string;
  order_number: string;
  customer_email: string;
  product_id: string | null;
  product_name: string;
  duration: string;
  amount: number;
  status: string;
  payment_method: string;
  created_at: string;
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadOrders();
  }, []);

  async function loadOrders() {
    try {
      setLoading(true);
      const supabase = createClient();
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error("Failed to load orders:", error);
      toast({
        title: "Error",
        description: "Failed to load orders. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  async function updateOrderStatus(orderId: string, newStatus: string) {
    try {
      setUpdating(orderId);
      const supabase = createClient();
      
      const order = orders.find(o => o.id === orderId);
      if (!order) throw new Error("Order not found");

      // Update order status
      const { error: orderError } = await supabase
        .from("orders")
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq("id", orderId);

      if (orderError) throw orderError;

      // If completing order, generate license
      if (newStatus === "completed") {
        const licenseKey = generateLicenseKey(order.product_name, order.duration);
        const expiresAt = calculateExpiryDate(order.duration);

        const { error: licenseError } = await supabase.from("licenses").insert({
          license_key: licenseKey,
          order_id: order.id,
          product_id: order.product_id,
          product_name: order.product_name,
          customer_email: order.customer_email,
          status: "active",
          expires_at: expiresAt.toISOString(),
        });

        if (licenseError) {
          console.error("Failed to create license:", licenseError);
          toast({
            title: "Warning",
            description: "Order completed but license generation failed. Please create manually.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Success",
            description: `Order completed and license ${licenseKey} generated!`,
          });
        }
      } else if (newStatus === "refunded") {
        // Revoke license if refunding
        const { error: revokeError } = await supabase
          .from("licenses")
          .update({ status: "revoked", updated_at: new Date().toISOString() })
          .eq("order_id", orderId);

        if (revokeError) {
          console.error("Failed to revoke license:", revokeError);
        }

        toast({
          title: "Success",
          description: "Order refunded and license revoked.",
        });
      } else {
        toast({
          title: "Success",
          description: `Order status updated to ${newStatus}.`,
        });
      }

      await loadOrders();
    } catch (error) {
      console.error("Failed to update order:", error);
      toast({
        title: "Error",
        description: "Failed to update order status. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUpdating(null);
    }
  }

  function generateLicenseKey(productName: string, duration: string): string {
    const prefix = productName.slice(0, 4).toUpperCase().replace(/[^A-Z]/g, 'X');
    const durationCode = duration.includes("30") ? "30D" : duration.includes("7") ? "7D" : "1D";
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    const random1 = Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
    const random2 = Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
    return `MGMA-${prefix}-${durationCode}-${random1}-${random2}`;
  }

  function calculateExpiryDate(duration: string): Date {
    const now = new Date();
    if (duration.includes("30")) {
      return new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    } else if (duration.includes("7")) {
      return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    } else {
      return new Date(now.getTime() + 24 * 60 * 60 * 1000);
    }
  }

  const columns = [
    {
      key: "order_number",
      label: "Order #",
      sortable: true,
      render: (order: Order) => (
        <span className="font-mono text-white">{order.order_number}</span>
      ),
    },
    {
      key: "customer_email",
      label: "Customer",
      sortable: true,
      render: (order: Order) => (
        <span className="text-white/70">{order.customer_email}</span>
      ),
    },
    {
      key: "product_name",
      label: "Product",
      sortable: true,
      render: (order: Order) => (
        <div>
          <p className="text-white font-medium">{order.product_name}</p>
          <p className="text-xs text-white/50">{order.duration}</p>
        </div>
      ),
    },
    {
      key: "amount",
      label: "Amount",
      sortable: true,
      render: (order: Order) => (
        <span className="text-white font-semibold">${order.amount.toFixed(2)}</span>
      ),
    },
    {
      key: "status",
      label: "Status",
      sortable: true,
      render: (order: Order) => {
        const statusColors = {
          pending: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
          completed: "bg-green-500/10 text-green-400 border-green-500/20",
          failed: "bg-red-500/10 text-red-400 border-red-500/20",
          refunded: "bg-gray-500/10 text-gray-400 border-gray-500/20",
        };
        return (
          <Badge className={statusColors[order.status as keyof typeof statusColors] || ""}>
            {order.status}
          </Badge>
        );
      },
    },
    {
      key: "created_at",
      label: "Date",
      sortable: true,
      render: (order: Order) => (
        <span className="text-white/50 text-sm">
          {new Date(order.created_at).toLocaleDateString()}
        </span>
      ),
    },
  ];

  if (loading) {
    return (
      <AdminShell title="Orders" subtitle="Manage customer orders">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#dc2626]" />
        </div>
      </AdminShell>
    );
  }

  return (
    <AdminShell title="Orders" subtitle="Manage customer orders">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex gap-2">
          <Button
            onClick={() => loadOrders()}
            variant="outline"
            size="sm"
            disabled={loading}
            className="bg-[#1a1a1a] border-[#262626] text-white hover:bg-[#262626]"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </div>

      <DataTable
        data={orders}
        columns={columns}
        searchKey="customer_email"
        searchPlaceholder="Search by email..."
        actions={(order) => (
          <div className="flex gap-2">
            {order.status === "pending" && (
              <Button
                onClick={() => updateOrderStatus(order.id, "completed")}
                size="sm"
                variant="ghost"
                disabled={updating === order.id}
                className="text-green-400 hover:text-green-300 hover:bg-green-500/10"
              >
                {updating === order.id ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <CheckCircle className="w-4 h-4" />
                )}
              </Button>
            )}
            {order.status === "completed" && (
              <Button
                onClick={() => updateOrderStatus(order.id, "refunded")}
                size="sm"
                variant="ghost"
                disabled={updating === order.id}
                className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
              >
                {updating === order.id ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <XCircle className="w-4 h-4" />
                )}
              </Button>
            )}
            {order.status === "failed" && (
              <Button
                onClick={() => updateOrderStatus(order.id, "pending")}
                size="sm"
                variant="ghost"
                disabled={updating === order.id}
                className="text-yellow-400 hover:text-yellow-300 hover:bg-yellow-500/10"
              >
                {updating === order.id ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Clock className="w-4 h-4" />
                )}
              </Button>
            )}
          </div>
        )}
      />
    </AdminShell>
  );
}
