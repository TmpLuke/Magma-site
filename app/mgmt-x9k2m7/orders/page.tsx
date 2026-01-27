"use client";

import { useEffect, useState } from "react";
import { AdminShell } from "@/components/admin/admin-shell";
import { DataTable } from "@/components/admin/data-table";
import { createClient } from "@/lib/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Clock, RefreshCw } from "lucide-react";

interface Order {
  id: string;
  order_number: string;
  customer_email: string;
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

  useEffect(() => {
    loadOrders();
  }, []);

  async function loadOrders() {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error("Failed to load orders:", error);
    } finally {
      setLoading(false);
    }
  }

  async function updateOrderStatus(orderId: string, newStatus: string) {
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("orders")
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq("id", orderId);

      if (error) throw error;
      await loadOrders();
    } catch (error) {
      console.error("Failed to update order:", error);
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
            className="bg-[#1a1a1a] border-[#262626] text-white hover:bg-[#262626]"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
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
                className="text-green-400 hover:text-green-300 hover:bg-green-500/10"
              >
                <CheckCircle className="w-4 h-4" />
              </Button>
            )}
            {order.status === "completed" && (
              <Button
                onClick={() => updateOrderStatus(order.id, "refunded")}
                size="sm"
                variant="ghost"
                className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
              >
                <XCircle className="w-4 h-4" />
              </Button>
            )}
            {order.status === "failed" && (
              <Button
                onClick={() => updateOrderStatus(order.id, "pending")}
                size="sm"
                variant="ghost"
                className="text-yellow-400 hover:text-yellow-300 hover:bg-yellow-500/10"
              >
                <Clock className="w-4 h-4" />
              </Button>
            )}
          </div>
        )}
      />
    </AdminShell>
  );
}
