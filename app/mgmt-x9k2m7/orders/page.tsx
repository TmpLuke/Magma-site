"use client";

import { useState, useEffect } from "react";
import {
  Eye,
  RefreshCcw,
  MoreHorizontal,
  Download,
  Mail,
  XCircle,
  Loader2,
  CheckCircle,
} from "lucide-react";
import { AdminShell } from "@/components/admin/admin-shell";
import { DataTable } from "@/components/admin/data-table";
import { useAdminStore } from "@/lib/admin-store";
import { getOrdersFromDB } from "@/lib/admin-actions";
import { mockOrders } from "@/lib/admin-mock-data";
import type { Order } from "@/lib/admin-types";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

function OrderStatusBadge({ status }: { status: Order["status"] }) {
  const styles = {
    completed: "bg-green-500/10 text-green-400 border-green-500/20",
    pending: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
    failed: "bg-red-500/10 text-red-400 border-red-500/20",
    refunded: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  };

  return (
    <span
      className={cn(
        "px-2.5 py-1 rounded-full text-xs font-medium border",
        styles[status]
      )}
    >
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

function OrderDetailsModal({
  order,
  open,
  onClose,
}: {
  order: Order | null;
  open: boolean;
  onClose: () => void;
}) {
  const { updateOrderStatus, isLoading } = useAdminStore();
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  if (!order) return null;

  const handleRefund = async () => {
    setActionLoading("refund");
    await updateOrderStatus(order.id, "refunded");
    setActionLoading(null);
    onClose();
  };

  const handleResendEmail = () => {
    // Simulate email sending
    alert(`Email resent to ${order.customerEmail}`);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-[#0a0a0a] border-[#1a1a1a] text-white max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            Order {order.orderNumber}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Status */}
          <div className="flex items-center justify-between p-4 bg-[#111111] rounded-lg border border-[#1a1a1a]">
            <span className="text-white/60">Status</span>
            <OrderStatusBadge status={order.status} />
          </div>

          {/* Customer Info */}
          <div className="p-4 bg-[#111111] rounded-lg border border-[#1a1a1a] space-y-3">
            <h4 className="font-medium text-white">Customer Information</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-white/50">Name</span>
                <p className="text-white">{order.customerName}</p>
              </div>
              <div>
                <span className="text-white/50">Email</span>
                <p className="text-white">{order.customerEmail}</p>
              </div>
            </div>
          </div>

          {/* Order Details */}
          <div className="p-4 bg-[#111111] rounded-lg border border-[#1a1a1a] space-y-3">
            <h4 className="font-medium text-white">Order Details</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-white/50">Product</span>
                <span className="text-white">{order.productName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/50">Duration</span>
                <span className="text-white">{order.duration}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/50">Quantity</span>
                <span className="text-white">{order.quantity}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/50">Subtotal</span>
                <span className="text-white">${order.subtotal.toFixed(2)}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between">
                  <span className="text-white/50">
                    Discount{order.couponCode && ` (${order.couponCode})`}
                  </span>
                  <span className="text-green-400">
                    -${order.discount.toFixed(2)}
                  </span>
                </div>
              )}
              <div className="flex justify-between pt-2 border-t border-[#262626]">
                <span className="text-white font-medium">Total</span>
                <span className="text-white font-bold">
                  ${order.total.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Payment Info */}
          <div className="p-4 bg-[#111111] rounded-lg border border-[#1a1a1a] space-y-3">
            <h4 className="font-medium text-white">Payment Information</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-white/50">Method</span>
                <p className="text-white capitalize">{order.paymentMethod}</p>
              </div>
              {order.paymentId && (
                <div>
                  <span className="text-white/50">Payment ID</span>
                  <p className="text-white font-mono text-xs">
                    {order.paymentId}
                  </p>
                </div>
              )}
              <div>
                <span className="text-white/50">Date</span>
                <p className="text-white">
                  {order.createdAt.toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          {order.status === "completed" && (
            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleRefund}
                disabled={isLoading || actionLoading === "refund"}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-purple-500/10 hover:bg-purple-500/20 disabled:opacity-50 text-purple-400 rounded-lg transition-colors"
              >
                {actionLoading === "refund" ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <RefreshCcw className="w-4 h-4" />
                )}
                Issue Refund
              </button>
              <button
                type="button"
                onClick={handleResendEmail}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-[#1a1a1a] hover:bg-[#262626] text-white rounded-lg transition-colors"
              >
                <Mail className="w-4 h-4" />
                Resend Email
              </button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function OrdersPage() {
  const { orders, updateOrderStatus, setOrders, isLoading } = useAdminStore();
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [filter, setFilter] = useState<Order["status"] | "all">("all");
  const [pageLoading, setPageLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  // Load orders from database on mount
  useEffect(() => {
    async function loadOrders() {
      setPageLoading(true);
      try {
        const result = await getOrdersFromDB();
        if (result.success && result.data && result.data.length > 0) {
          const formattedOrders = result.data.map((o) => ({
            id: o.id,
            orderNumber: o.order_number,
            customerName: o.customer_email.split("@")[0],
            customerEmail: o.customer_email,
            productId: o.product_id,
            productName: o.product_name,
            duration: o.duration,
            quantity: 1,
            subtotal: Number(o.amount),
            discount: 0,
            total: Number(o.amount),
            status: o.status as "pending" | "completed" | "failed" | "refunded",
            paymentMethod: o.payment_method,
            createdAt: new Date(o.created_at),
          }));
          setOrders(formattedOrders);
        } else {
          // Use mock data as fallback when DB is empty
          setOrders(mockOrders);
        }
      } catch (error) {
        console.error("[Admin] Error loading orders:", error);
        // Use mock data as fallback on error
        setOrders(mockOrders);
      } finally {
        setPageLoading(false);
      }
    }

    loadOrders();
  }, [setOrders]);

  const filteredOrders =
    filter === "all" ? orders : orders.filter((o) => o.status === filter);

  const handleStatusChange = async (orderId: string, newStatus: Order["status"]) => {
    setActionLoadingId(orderId);
    await updateOrderStatus(orderId, newStatus);
    setActionLoadingId(null);
  };

  const columns = [
    {
      key: "orderNumber",
      label: "Order",
      sortable: true,
      render: (order: Order) => (
        <div>
          <p className="text-white font-medium">{order.orderNumber}</p>
          <p className="text-xs text-white/50">
            {order.createdAt.toLocaleDateString()}
          </p>
        </div>
      ),
    },
    {
      key: "customerEmail",
      label: "Customer",
      sortable: true,
      render: (order: Order) => (
        <div>
          <p className="text-white">{order.customerName}</p>
          <p className="text-xs text-white/50">{order.customerEmail}</p>
        </div>
      ),
    },
    {
      key: "productName",
      label: "Product",
      render: (order: Order) => (
        <div>
          <p className="text-white">{order.productName}</p>
          <p className="text-xs text-white/50">{order.duration}</p>
        </div>
      ),
    },
    {
      key: "total",
      label: "Total",
      sortable: true,
      render: (order: Order) => (
        <span className="text-white font-medium">${order.total.toFixed(2)}</span>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (order: Order) => (
        <div className="flex items-center gap-2">
          <OrderStatusBadge status={order.status} />
          {actionLoadingId === order.id && (
            <Loader2 className="w-3 h-3 animate-spin text-white/50" />
          )}
        </div>
      ),
    },
  ];

  const actions = (order: Order) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button type="button" className="p-2 hover:bg-[#1a1a1a] rounded-lg transition-colors">
          <MoreHorizontal className="w-4 h-4 text-white/60" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="bg-[#111111] border-[#262626]">
        <DropdownMenuItem
          onClick={() => setSelectedOrder(order)}
          className="text-white/70 focus:bg-[#1a1a1a] focus:text-white"
        >
          <Eye className="w-4 h-4 mr-2" />
          View Details
        </DropdownMenuItem>
        <DropdownMenuItem className="text-white/70 focus:bg-[#1a1a1a] focus:text-white">
          <Download className="w-4 h-4 mr-2" />
          Download Invoice
        </DropdownMenuItem>
        <DropdownMenuItem className="text-white/70 focus:bg-[#1a1a1a] focus:text-white">
          <Mail className="w-4 h-4 mr-2" />
          Resend Email
        </DropdownMenuItem>
        {order.status === "completed" && (
          <>
            <DropdownMenuSeparator className="bg-[#262626]" />
            <DropdownMenuItem
              onClick={() => handleStatusChange(order.id, "refunded")}
              disabled={actionLoadingId === order.id}
              className="text-purple-400 focus:bg-[#1a1a1a] focus:text-purple-400"
            >
              <RefreshCcw className="w-4 h-4 mr-2" />
              Issue Refund
            </DropdownMenuItem>
          </>
        )}
        {order.status === "pending" && (
          <>
            <DropdownMenuSeparator className="bg-[#262626]" />
            <DropdownMenuItem
              onClick={() => handleStatusChange(order.id, "completed")}
              disabled={actionLoadingId === order.id}
              className="text-green-400 focus:bg-[#1a1a1a] focus:text-green-400"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Mark Completed
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => handleStatusChange(order.id, "failed")}
              disabled={actionLoadingId === order.id}
              className="text-red-400 focus:bg-[#1a1a1a] focus:text-red-400"
            >
              <XCircle className="w-4 h-4 mr-2" />
              Mark Failed
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );

  const statusCounts = {
    all: orders.length,
    completed: orders.filter((o) => o.status === "completed").length,
    pending: orders.filter((o) => o.status === "pending").length,
    failed: orders.filter((o) => o.status === "failed").length,
    refunded: orders.filter((o) => o.status === "refunded").length,
  };

  if (pageLoading) {
    return (
      <AdminShell title="Orders" subtitle="Manage customer orders and refunds">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-[#dc2626]" />
        </div>
      </AdminShell>
    );
  }

  return (
    <AdminShell title="Orders" subtitle="Manage customer orders and refunds">
      {/* Filter Tabs */}
      <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
        {(
          ["all", "completed", "pending", "failed", "refunded"] as const
        ).map((status) => (
          <button
            key={status}
            type="button"
            onClick={() => setFilter(status)}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap",
              filter === status
                ? "bg-[#dc2626] text-white"
                : "bg-[#1a1a1a] text-white/60 hover:text-white hover:bg-[#262626]"
            )}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
            <span className="ml-2 px-1.5 py-0.5 rounded bg-black/20 text-xs">
              {statusCounts[status]}
            </span>
          </button>
        ))}
      </div>

      {/* Orders Table */}
      <DataTable
        data={filteredOrders}
        columns={columns}
        searchKey="customerEmail"
        searchPlaceholder="Search by email..."
        onRowClick={setSelectedOrder}
        actions={actions}
      />

      {/* Order Details Modal */}
      <OrderDetailsModal
        order={selectedOrder}
        open={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
      />
    </AdminShell>
  );
}
