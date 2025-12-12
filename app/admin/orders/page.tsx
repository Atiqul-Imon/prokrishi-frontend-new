"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  getAdminOrders,
  getAdminOrderStats,
  updateAdminOrderStatus,
  deleteAdminOrder,
  AdminOrderFilters,
} from "../../utils/api";
import { Search, Eye, RefreshCw, Package, ShoppingCart, DollarSign, CheckCircle, Clock, Trash2, X } from "lucide-react";

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<AdminOrderFilters>({
    page: 1,
    limit: 20,
    sortBy: "createdAt",
    sortOrder: "desc",
  });
  const [pagination, setPagination] = useState<any>(null);
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
    } catch (err: any) {
      const errorMsg = err.message || "Failed to fetch orders";
      setError(errorMsg);
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
      console.error("Failed to fetch stats:", err);
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

  const handleDeleteOrder = (orderId: string) => {
    setDeleteConfirm(orderId);
  };

  const confirmDeleteOrder = async () => {
    if (!deleteConfirm) return;
    try {
      await deleteAdminOrder(deleteConfirm);
      setSelectedIds((prev) => {
        const next = new Set(prev);
        next.delete(deleteConfirm);
        return next;
      });
      fetchOrders();
      setDeleteConfirm(null);
    } catch (err: any) {
      alert(err.message || "Failed to delete order");
      setDeleteConfirm(null);
    }
  };

  const handleBulkDelete = () => {
    if (selectedIds.size === 0) return;
    setBulkDeleteConfirm(true);
  };

  const confirmBulkDelete = async () => {
    try {
      const deletePromises = Array.from(selectedIds).map((id) => deleteAdminOrder(id));
      await Promise.all(deletePromises);
      setSelectedIds(new Set());
      fetchOrders();
      setBulkDeleteConfirm(false);
    } catch (err: any) {
      alert(err.message || "Failed to delete orders");
      setBulkDeleteConfirm(false);
    }
  };

  const handleBulkStatusUpdate = (status: string) => {
    if (selectedIds.size === 0) return;
    setBulkStatusConfirm(status);
  };

  const confirmBulkStatusUpdate = async () => {
    if (!bulkStatusConfirm) return;
    try {
      const updatePromises = Array.from(selectedIds).map((id) =>
        updateAdminOrderStatus(id, bulkStatusConfirm)
      );
      await Promise.all(updatePromises);
      setSelectedIds(new Set());
      fetchOrders();
      setBulkStatusConfirm(null);
    } catch (err: any) {
      alert(err.message || "Failed to update order statuses");
      setBulkStatusConfirm(null);
    }
  };

  const handleFilterChange = useCallback((key: string, value: any) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      page: key !== "page" ? 1 : value,
    }));
  }, []);

  const handlePageChange = (page: number) => {
    handleFilterChange("page", page);
  };

  const handleSelect = (id: string, selected: boolean) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (selected) {
        next.add(id);
      } else {
        next.delete(id);
      }
      return next;
    });
  };

  const handleSelectAll = (selected: boolean) => {
    if (selected) {
      setSelectedIds(new Set(orders.map((o) => o._id)));
    } else {
      setSelectedIds(new Set());
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

  const allSelected = orders.length > 0 && orders.every((o) => selectedIds.has(o._id));
  const someSelected = orders.some((o) => selectedIds.has(o._id));

  return (
    <div className="space-y-4">
      {/* Header - Nexus Style */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 mb-1">Orders</h1>
          <p className="text-sm text-slate-600">Manage customer orders</p>
        </div>
      </div>

      {/* Statistics Cards - Nexus Style */}
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
                {stats.totalOrders?.toLocaleString() || "0"}
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
                ৳{(stats.totalRevenue || 0).toLocaleString()}
              </p>
              <p className="text-xs text-slate-500 mt-1 font-medium">
                Last 30 days: ৳{(stats.periodRevenue || 0).toLocaleString()}
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

      {/* Search and Filters - Nexus Style */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Search orders..."
              value={filters.search || ""}
              onChange={(e) => handleFilterChange("search", e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all"
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
            <button
              onClick={fetchOrders}
              className="px-4 py-2.5 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-all shadow-sm hover:shadow-md flex items-center gap-2 font-medium"
            >
              <RefreshCw size={18} strokeWidth={2} />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Bulk Actions - Nexus Style */}
      {selectedIds.size > 0 && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-emerald-900">
              {selectedIds.size} order{selectedIds.size !== 1 ? "s" : ""} selected
            </p>
            <div className="flex items-center gap-2">
              <select
                onChange={(e) => {
                  if (e.target.value) {
                    handleBulkStatusUpdate(e.target.value);
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
                onClick={handleBulkDelete}
                className="px-3 py-1.5 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors flex items-center gap-2 text-sm font-medium"
              >
                <Trash2 size={16} strokeWidth={2} />
                Delete
              </button>
              <button
                onClick={() => setSelectedIds(new Set())}
                className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors flex items-center gap-2 text-sm font-medium"
              >
                <X size={16} strokeWidth={2} />
                Clear
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialogs - Nexus Style */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4 shadow-xl border border-slate-200">
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Delete Order</h3>
            <p className="text-sm text-slate-600 mb-4">
              Are you sure you want to delete this order? This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteOrder}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {bulkDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4 shadow-xl border border-slate-200">
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Delete Multiple Orders</h3>
            <p className="text-sm text-slate-600 mb-4">
              Are you sure you want to delete {selectedIds.size} order(s)? This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setBulkDeleteConfirm(false)}
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmBulkDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Delete All
              </button>
            </div>
          </div>
        </div>
      )}

      {bulkStatusConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4 shadow-xl border border-slate-200">
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Update Order Status</h3>
            <p className="text-sm text-slate-600 mb-4">
              Update {selectedIds.size} order(s) to "{bulkStatusConfirm}"?
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setBulkStatusConfirm(null)}
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmBulkStatusUpdate}
                className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
              >
                Update
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <p className="text-red-800 text-sm">{error}</p>
        </div>
      )}

      {/* Orders Table - Nexus Style */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-12 text-center">
            <div className="inline-block w-8 h-8 border-4 border-slate-200 border-t-emerald-500 rounded-full animate-spin"></div>
            <p className="text-slate-500 mt-4">Loading orders...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="p-12 text-center">
            <Package className="mx-auto text-slate-400 mb-4" size={48} strokeWidth={1.5} />
            <p className="text-slate-500">No orders found</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-3 text-left">
                      <input
                        type="checkbox"
                        checked={allSelected}
                        ref={(input) => {
                          if (input) input.indeterminate = someSelected && !allSelected;
                        }}
                        onChange={(e) => handleSelectAll(e.target.checked)}
                        className="w-4 h-4 rounded border-2 border-slate-300 text-emerald-600 focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                      />
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Order ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Total
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Payment
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {orders.map((order) => (
                    <tr
                      key={order._id}
                      className="hover:bg-emerald-50/50 transition-all duration-200"
                    >
                      <td className="px-6 py-4">
                        <input
                          type="checkbox"
                          checked={selectedIds.has(order._id)}
                          onChange={(e) => handleSelect(order._id, e.target.checked)}
                          className="w-4 h-4 rounded border-2 border-slate-300 text-emerald-600 focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                        />
                      </td>
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
                          {new Date(order.createdAt).toLocaleDateString()}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-medium text-slate-900">
                          ৳{order.totalAmount?.toLocaleString() || order.totalPrice?.toLocaleString() || 0}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 rounded-md text-xs font-semibold ${
                            statusColors[order.status] || statusColors.pending
                          }`}
                        >
                          {order.status || "pending"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 rounded-md text-xs font-semibold ${
                            paymentStatusColors[order.paymentStatus] || paymentStatusColors.pending
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
                            onClick={() => handleDeleteOrder(order._id)}
                            className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all"
                            title="Delete"
                          >
                            <Trash2 size={18} strokeWidth={2} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-between bg-slate-50">
                <p className="text-sm text-slate-600">
                  Page {pagination.currentPage} of {pagination.totalPages} ({pagination.totalOrders || pagination.total} total)
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => handlePageChange(pagination.currentPage - 1)}
                    disabled={pagination.currentPage === 1 || pagination.hasPrev === false || pagination.hasPrevPage === false}
                    className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => handlePageChange(pagination.currentPage + 1)}
                    disabled={pagination.currentPage === pagination.totalPages || pagination.hasNext === false || pagination.hasNextPage === false}
                    className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
