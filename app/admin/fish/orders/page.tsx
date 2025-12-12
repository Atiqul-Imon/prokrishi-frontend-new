"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { fishOrderApi } from "../../../utils/fishApi";
import { Search, Eye, RefreshCw, Fish, Package } from "lucide-react";

export default function AdminFishOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fishOrderApi.getAll();
      let filtered = result.fishOrders || [];
      if (searchQuery) {
        filtered = filtered.filter((order: any) =>
          order.orderNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          order.shippingAddress?.name?.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }
      setOrders(filtered);
    } catch (err: any) {
      setError(err.message || "Failed to load fish orders");
    } finally {
      setLoading(false);
    }
  }, [searchQuery]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const statusColors: Record<string, string> = {
    pending: "bg-yellow-100",
    confirmed: "bg-blue-100",
    processing: "bg-indigo-100",
    shipped: "bg-purple-100",
    delivered: "bg-green-100",
    cancelled: "bg-red-100",
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Fish Orders</h1>
        <p className="text-gray-500">Manage fish product orders</p>
      </div>

      {/* Search */}
      <div className="bg-white">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search fish orders..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-50"
            />
          </div>
          <button
            onClick={fetchOrders}
            className="px-4 py-2 bg-gray-100"
          >
            <RefreshCw size={18} />
            Refresh
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Orders Table */}
      <div className="bg-white">
        {loading ? (
          <div className="p-12 text-center">
            <div className="inline-block w-8 h-8 border-4 border-gray-200"></div>
            <p className="text-gray-500">Loading fish orders...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="p-12 text-center">
            <Fish className="mx-auto text-gray-400" size={48} />
            <p className="text-gray-500">No fish orders found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500">
                    Order ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500">
                    Items
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500">
                    Date
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {orders.map((order) => (
                  <tr
                    key={order._id}
                    className="hover:bg-gray-50"
                  >
                    <td className="px-6 py-4">
                      <span className="font-mono text-sm text-gray-900">
                        #{order.orderNumber || order._id?.slice(-8)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-900">
                          {order.user?.name || order.guestInfo?.name || "Guest"}
                        </p>
                        <p className="text-sm text-gray-500">
                          {order.shippingAddress?.phone || order.guestInfo?.phone || ""}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-900">
                        {order.orderItems?.length || 0} item{(order.orderItems?.length || 0) !== 1 ? "s" : ""}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-medium text-gray-900">
                        ৳{order.totalAmount?.toLocaleString() || order.totalPrice?.toLocaleString() || 0}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          statusColors[order.status] || statusColors.pending
                        }`}
                      >
                        {order.status || "pending"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-900">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/admin/fish/orders/${order._id}`}
                          className="p-2 text-gray-600"
                          title="View"
                        >
                          <Eye size={18} />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

