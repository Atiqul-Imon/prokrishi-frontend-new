"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { logger } from "@/app/utils/logger";
import {
  getAdminOrders,
  getAdminOrderStats,
  updateAdminOrderStatus,
  deleteAdminOrder,
  AdminOrderFilters,
  AdminOrderStats,
  AdminOrderResponse,
} from "../../utils/api";
import type { Order } from "@/types/models";
import { handleApiError } from "@/app/utils/errorHandler";
import { formatCurrency, formatDate, formatNumber } from "@/app/utils";
import { Eye, Package, ShoppingCart, DollarSign, CheckCircle, Clock, Trash2 } from "lucide-react";
import {
  AdminListPageLayout,
  AdminTableHeader,
  AdminTableRow,
  ConfirmDialog,
  type TableColumn,
} from "@/components/admin";

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState<AdminOrderStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<AdminOrderFilters>({
    page: 1,
    limit: 20,
    sortBy: "createdAt",
    sortOrder: "desc",
  });
  const [pagination, setPagination] = useState<AdminOrderResponse['pagination'] | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [bulkDeleteConfirm, setBulkDeleteConfirm] = useState(false);
  const [bulkStatusConfirm, setBulkStatusConfirm] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getAdminOrders(filters);
      setOrders(response.orders || []);
      setPagination(response.pagination);
    } catch (err) {
      setError(handleApiError(err, "fetching orders"));
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const fetchStats = useCallback(async () => {
    try {
      setStatsLoading(true);
      const response = await getAdminOrderStats(30);
      setStats(response.stats);
    } catch (err) {
      logger.error("Failed to fetch stats:", err);
    } finally {
      setStatsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const handleDeleteOrder = async (orderId: string) => {
    try {
      await deleteAdminOrder(orderId);
      setSelectedIds((prev) => {
        const next = new Set(prev);
        next.delete(orderId);
        return next;
      });
      fetchOrders();
      setDeleteConfirm(null);
    } catch (err) {
      setError(handleApiError(err, "deleting order"));
      setDeleteConfirm(null);
    }
  };

  const handleBulkDelete = async () => {
    try {
      const deletePromises = Array.from(selectedIds).map((id) => deleteAdminOrder(id));
      await Promise.all(deletePromises);
      setSelectedIds(new Set());
      fetchOrders();
      setBulkDeleteConfirm(false);
    } catch (err) {
      setError(handleApiError(err, "deleting orders"));
      setBulkDeleteConfirm(false);
    }
  };

  const handleBulkStatusUpdate = async (status: string) => {
    try {
      const updatePromises = Array.from(selectedIds).map((id) =>
        updateAdminOrderStatus(id, status)
      );
      await Promise.all(updatePromises);
      setSelectedIds(new Set());
      fetchOrders();
      setBulkStatusConfirm(null);
    } catch (err) {
      setError(handleApiError(err, "updating order statuses"));
      setBulkStatusConfirm(null);
    }
  };

  const handleFilterChange = useCallback((key: string, value: string | number | undefined) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      page: key !== "page" ? 1 : value,
    }));
  }, []);

  const handlePageChange = (page: number) => {
    handleFilterChange("page", page);
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === orders.length && orders.length > 0) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(orders.map((o) => o._id || "").filter(Boolean)));
    }
  };

  const statusColors: Record<string, string> = {
    pending: "bg-amber-100 text-amber-700",
    confirmed: "bg-purple-100 text-purple-700",
    processing: "bg-teal-100 text-teal-700",
    shipped: "bg-purple-100 text-purple-700",
    delivered: "bg-emerald-100 text-emerald-700",
    cancelled: "bg-red-100 text-red-700",
  };

  const paymentStatusColors: Record<string, string> = {
    pending: "bg-amber-100 text-amber-700",
    completed: "bg-emerald-100 text-emerald-700",
    failed: "bg-red-100 text-red-700",
    cancelled: "bg-slate-100 text-slate-700",
  };

  const columns: TableColumn[] = [
    { key: "orderId", label: "Order ID", align: "left" },
    { key: "customer", label: "Customer", align: "left" },
    { key: "date", label: "Date", align: "left" },
    { key: "total", label: "Total", align: "left" },
    { key: "status", label: "Status", align: "left" },
    { key: "payment", label: "Payment", align: "left" },
    { key: "actions", label: "Actions", align: "right" },
  ];

  const bulkActions = selectedIds.size > 0 ? (
    <div className="flex items-center justify-between w-full">
      <span className="text-sm font-medium text-emerald-900">
        {selectedIds.size} order{selectedIds.size !== 1 ? "s" : ""} selected
      </span>
      <div className="flex items-center gap-2">
        <select
          onChange={(e) => {
            if (e.target.value) {
              setBulkStatusConfirm(e.target.value);
            }
          }}
          className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
          defaultValue=""
        >
          <option value="">Update Status</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="processing">Processing</option>
          <option value="shipped">Shipped</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <button
          onClick={() => setBulkDeleteConfirm(true)}
          className="px-3 py-1.5 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors flex items-center gap-2 text-sm font-medium"
        >
          <Trash2 size={16} strokeWidth={2} />
          Delete
        </button>
      </div>
    </div>
  ) : undefined;

  return (
    <>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 mb-1">Orders</h1>
            <p className="text-sm text-slate-600">Manage customer orders</p>
          </div>
        </div>

        {/* Statistics Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-all duration-200">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 shadow-sm">
                  <ShoppingCart className="text-white" size={20} strokeWidth={2.5} />
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Total Orders</p>
                <p className="text-2xl font-bold text-slate-900">
                  {formatNumber(stats.totalOrders || 0)}
                </p>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-all duration-200">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-sm">
                  <DollarSign className="text-white" size={20} strokeWidth={2.5} />
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Total Revenue</p>
                <p className="text-2xl font-bold text-slate-900">
                  {formatCurrency(stats.totalRevenue || 0)}
                </p>
                <p className="text-xs text-slate-500 mt-1 font-medium">
                  Last 30 days: {formatCurrency(stats.periodRevenue || 0)}
                </p>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-all duration-200">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-lg bg-gradient-to-br from-amber-500 to-amber-600 shadow-sm">
                  <Clock className="text-white" size={20} strokeWidth={2.5} />
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Pending Orders</p>
                <p className="text-2xl font-bold text-slate-900">
                  {stats.statusBreakdown?.pending || 0}
                </p>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-all duration-200">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 shadow-sm">
                  <CheckCircle className="text-white" size={20} strokeWidth={2.5} />
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Delivered Orders</p>
                <p className="text-2xl font-bold text-slate-900">
                  {stats.statusBreakdown?.delivered || 0}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Search and Filters */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Search orders..."
                value={filters.search || ""}
                onChange={(e) => handleFilterChange("search", e.target.value)}
                className="w-full pl-4 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all"
              />
            </div>
            <div className="flex gap-2">
              <select
                value={filters.status || "all"}
                onChange={(e) => handleFilterChange("status", e.target.value === "all" ? undefined : e.target.value)}
                className="px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all font-medium"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="processing">Processing</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
              <select
                value={filters.paymentStatus || "all"}
                onChange={(e) =>
                  handleFilterChange("paymentStatus", e.target.value === "all" ? undefined : e.target.value)
                }
                className="px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all font-medium"
              >
                <option value="all">All Payment</option>
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
                <option value="failed">Failed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </div>

        <AdminListPageLayout
          title=""
          description=""
          searchPlaceholder=""
          searchValue=""
          onSearchChange={() => {}}
          error={error}
          onErrorDismiss={() => setError(null)}
          loading={loading}
          empty={!loading && orders.length === 0}
          emptyIcon={<Package className="mx-auto text-slate-400 mb-4" size={48} strokeWidth={1.5} />}
          emptyTitle="No orders found"
          pagination={
            pagination && pagination.totalPages > 1
              ? {
                  currentPage: pagination.currentPage || 1,
                  totalPages: pagination.totalPages || 1,
                  onPageChange: handlePageChange,
                }
              : undefined
          }
          bulkActions={bulkActions}
        >
          <table className="w-full">
            <AdminTableHeader
              columns={columns}
              selectable
              selectedCount={selectedIds.size}
              totalCount={orders.length}
              onSelectAll={toggleSelectAll}
            />
            <tbody className="divide-y divide-slate-100">
              {orders.map((order) => (
                <AdminTableRow
                  key={order._id}
                  selectable
                  selected={selectedIds.has(order._id || "")}
                  onSelect={(selected) => {
                    if (order._id) {
                      toggleSelect(order._id);
                    }
                  }}
                >
                  <td className="px-6 py-4">
                    <span className="font-mono text-sm text-slate-900">
                      #{order.invoiceNumber || order._id?.slice(-8)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium text-slate-900">
                        {order.user?.name || order.guestInfo?.name || "Guest"}
                      </p>
                      <p className="text-sm text-slate-500">
                        {order.user?.email || order.guestInfo?.email || order.guestInfo?.phone || ""}
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-slate-900">
                      {formatDate(order.createdAt)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-medium text-slate-900">
                      {formatCurrency(order.totalAmount || order.totalPrice || 0)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 rounded-md text-xs font-semibold ${
                        statusColors[order.status || ""] || statusColors.pending
                      }`}
                    >
                      {order.status || "pending"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 rounded-md text-xs font-semibold ${
                        paymentStatusColors[order.paymentStatus || ""] || paymentStatusColors.pending
                      }`}
                    >
                      {order.paymentStatus || "pending"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/admin/orders/${order._id}`}
                        className="p-2 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-all"
                        title="View"
                      >
                        <Eye size={18} strokeWidth={2} />
                      </Link>
                      <button
                        onClick={() => setDeleteConfirm(order._id || null)}
                        className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all"
                        title="Delete"
                      >
                        <Trash2 size={18} strokeWidth={2} />
                      </button>
                    </div>
                  </td>
                </AdminTableRow>
              ))}
            </tbody>
          </table>
        </AdminListPageLayout>
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!deleteConfirm}
        title="Delete Order"
        message="Are you sure you want to delete this order? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        onConfirm={() => {
          if (deleteConfirm) {
            handleDeleteOrder(deleteConfirm);
          }
        }}
        onCancel={() => setDeleteConfirm(null)}
      />

      {/* Bulk Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={bulkDeleteConfirm}
        title="Delete Multiple Orders"
        message={`Are you sure you want to delete ${selectedIds.size} order(s)? This action cannot be undone.`}
        confirmText="Delete All"
        cancelText="Cancel"
        variant="danger"
        onConfirm={handleBulkDelete}
        onCancel={() => setBulkDeleteConfirm(false)}
      />

      {/* Bulk Status Update Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!bulkStatusConfirm}
        title="Update Order Status"
        message={`Update ${selectedIds.size} order(s) to "${bulkStatusConfirm}"?`}
        confirmText="Update"
        cancelText="Cancel"
        variant="info"
        onConfirm={() => {
          if (bulkStatusConfirm) {
            handleBulkStatusUpdate(bulkStatusConfirm);
          }
        }}
        onCancel={() => setBulkStatusConfirm(null)}
      />
    </>
  );
}
