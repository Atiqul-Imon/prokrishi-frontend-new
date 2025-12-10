"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  getAdminOrderById,
  updateAdminOrderStatus,
  updateAdminPaymentStatus,
} from "../../../utils/api";
import {
  ArrowLeft,
  Package,
  MapPin,
  Phone,
  Mail,
  DollarSign,
  Calendar,
  User,
  AlertCircle,
  Edit,
  Save,
  X,
  Truck,
  CheckCircle,
  Clock,
  CreditCard,
} from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function OrderDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id as string;
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingStatus, setEditingStatus] = useState(false);
  const [editingPayment, setEditingPayment] = useState(false);
  const [newStatus, setNewStatus] = useState("");
  const [newPaymentStatus, setNewPaymentStatus] = useState("");
  const [transactionId, setTransactionId] = useState("");
  const [notes, setNotes] = useState("");
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await getAdminOrderById(orderId);
        setOrder(response.order);
        setNewStatus(response.order.status);
        setNewPaymentStatus(response.order.paymentStatus);
        setTransactionId(response.order.transactionId || "");
      } catch (err: any) {
        setError(err.message || "Failed to load order");
      } finally {
        setLoading(false);
      }
    };

    if (orderId) {
      fetchOrder();
    }
  }, [orderId]);

  const handleStatusUpdate = async () => {
    setUpdating(true);
    try {
      await updateAdminOrderStatus(orderId, newStatus, notes);
      setOrder({ ...order, status: newStatus });
      setEditingStatus(false);
      setNotes("");
    } catch (err: any) {
      alert(err.message || "Failed to update order status");
    } finally {
      setUpdating(false);
    }
  };

  const handlePaymentUpdate = async () => {
    setUpdating(true);
    try {
      await updateAdminPaymentStatus(orderId, newPaymentStatus, transactionId, notes);
      setOrder({ ...order, paymentStatus: newPaymentStatus, transactionId });
      setEditingPayment(false);
      setNotes("");
    } catch (err: any) {
      alert(err.message || "Failed to update payment status");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-block w-6 h-6 border-2 border-slate-200 dark:border-slate-800 border-t-slate-900 dark:border-t-slate-100 rounded-full animate-spin"></div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-3">Loading order...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="space-y-6">
        <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/30 rounded-xl p-6">
          <div className="flex items-center gap-3">
            <AlertCircle className="text-red-600 dark:text-red-400" size={20} />
            <div>
              <h3 className="text-sm font-semibold text-red-900 dark:text-red-200">Error</h3>
              <p className="text-sm text-red-700 dark:text-red-300 mt-0.5">{error || "Order not found"}</p>
            </div>
          </div>
        </div>
        <Link href="/admin/orders">
          <Button variant="outline">Back to Orders</Button>
        </Link>
      </div>
    );
  }

  const statusColors: Record<string, string> = {
    pending: "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400",
    confirmed: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400",
    processing: "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400",
    shipped: "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400",
    delivered: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400",
    cancelled: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400",
  };

  const paymentStatusColors: Record<string, string> = {
    pending: "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400",
    completed: "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400",
    failed: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400",
    cancelled: "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-400",
  };

  const customerName =
    order.user?.name || order.shippingAddress?.name || order.guestInfo?.name || "Guest";
  const customerEmail = order.user?.email || order.guestInfo?.email || "Not provided";
  const customerPhone =
    order.user?.phone || order.shippingAddress?.phone || order.guestInfo?.phone || "Not provided";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/orders">
            <button className="p-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
              <ArrowLeft size={18} />
            </button>
          </Link>
          <div>
            <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
              Order #{order.invoiceNumber || order._id?.slice(-8)}
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Placed on {new Date(order.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span
            className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
              statusColors[order.status] || statusColors.pending
            }`}
          >
            {order.status || "pending"}
          </span>
          <span
            className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
              paymentStatusColors[order.paymentStatus] || paymentStatusColors.pending
            }`}
          >
            {order.paymentStatus || "pending"}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Items */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6">
            <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-4">Order Items</h2>
            <div className="space-y-3">
              {order.orderItems?.map((item: any, index: number) => (
                <div
                  key={index}
                  className="flex items-center gap-4 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50"
                >
                  {item.variant?.image || item.product?.image ? (
                    <img
                      src={item.variant?.image || item.product?.image}
                      alt={item.name}
                      className="w-16 h-16 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-lg bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
                      <Package className="text-slate-400" size={24} />
                    </div>
                  )}
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{item.name}</p>
                    {item.variant?.label && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        Variant: {item.variant.label}
                      </p>
                    )}
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Quantity: {item.quantity} × ৳{item.price?.toLocaleString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                      ৳{((item.price || 0) * (item.quantity || 0)).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <div className="border-t border-slate-200 dark:border-slate-800 pt-4 mt-4">
              <div className="flex justify-between items-center text-lg font-semibold">
                <span className="text-slate-900 dark:text-slate-100">Total Amount:</span>
                <span className="text-green-600 dark:text-green-400">
                  ৳{order.totalAmount?.toLocaleString() || order.totalPrice?.toLocaleString() || 0}
                </span>
              </div>
            </div>
          </div>

          {/* Order Status Management */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6">
            <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-4">Order Status</h2>
            {editingStatus ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Status
                  </label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-400"
                  >
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Notes (Optional)
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Add any notes about this status change..."
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-400"
                    rows={3}
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={handleStatusUpdate}
                    disabled={updating}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Save size={16} />
                    Save Changes
                  </button>
                  <button
                    onClick={() => {
                      setEditingStatus(false);
                      setNewStatus(order.status);
                      setNotes("");
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700"
                  >
                    <X size={16} />
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
                      statusColors[order.status] || statusColors.pending
                    }`}
                  >
                    {order.status || "pending"}
                  </span>
                  {order.isDelivered && order.deliveredAt && (
                    <span className="text-sm text-slate-500 dark:text-slate-400">
                      Delivered on {new Date(order.deliveredAt).toLocaleDateString()}
                    </span>
                  )}
                </div>
                <button
                  onClick={() => setEditingStatus(true)}
                  className="flex items-center gap-2 px-3 py-2 text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30"
                >
                  <Edit size={16} />
                  Update Status
                </button>
              </div>
            )}
          </div>

          {/* Payment Status Management */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6">
            <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-4">Payment Status</h2>
            {editingPayment ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Payment Status
                  </label>
                  <select
                    value={newPaymentStatus}
                    onChange={(e) => setNewPaymentStatus(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-400"
                  >
                    <option value="pending">Pending</option>
                    <option value="completed">Completed</option>
                    <option value="failed">Failed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Transaction ID (Optional)
                  </label>
                  <input
                    type="text"
                    value={transactionId}
                    onChange={(e) => setTransactionId(e.target.value)}
                    placeholder="Enter transaction ID..."
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Notes (Optional)
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Add any notes about this payment status change..."
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-400"
                    rows={3}
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={handlePaymentUpdate}
                    disabled={updating}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Save size={16} />
                    Save Changes
                  </button>
                  <button
                    onClick={() => {
                      setEditingPayment(false);
                      setNewPaymentStatus(order.paymentStatus);
                      setTransactionId(order.transactionId || "");
                      setNotes("");
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700"
                  >
                    <X size={16} />
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
                      paymentStatusColors[order.paymentStatus] || paymentStatusColors.pending
                    }`}
                  >
                    {order.paymentStatus || "pending"}
                  </span>
                  {order.isPaid && order.paidAt && (
                    <span className="text-sm text-slate-500 dark:text-slate-400">
                      Paid on {new Date(order.paidAt).toLocaleDateString()}
                    </span>
                  )}
                  {order.transactionId && (
                    <span className="text-sm text-slate-500 dark:text-slate-400">
                      Transaction ID: {order.transactionId}
                    </span>
                  )}
                </div>
                <button
                  onClick={() => setEditingPayment(true)}
                  className="flex items-center gap-2 px-3 py-2 text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30"
                >
                  <Edit size={16} />
                  Update Payment
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Order Summary */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6">
            <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-4">Order Summary</h2>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800">
                  <DollarSign className="text-slate-600 dark:text-slate-400" size={16} />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-slate-500 dark:text-slate-400">Subtotal</p>
                  <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                    ৳{order.totalPrice?.toLocaleString() || 0}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800">
                  <Package className="text-slate-600 dark:text-slate-400" size={16} />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-slate-500 dark:text-slate-400">Shipping</p>
                  <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                    ৳{order.shippingFee?.toLocaleString() || 0}
                  </p>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-slate-800">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">Total</p>
                  <p className="text-lg font-bold text-slate-900 dark:text-slate-100">
                    ৳{order.totalAmount?.toLocaleString() || order.totalPrice?.toLocaleString() || 0}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Customer Info */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6">
            <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-4">Customer Information</h2>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800">
                  <User className="text-slate-600 dark:text-slate-400" size={16} />
                </div>
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Name</p>
                  <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{customerName}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800">
                  <Mail className="text-slate-600 dark:text-slate-400" size={16} />
                </div>
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Email</p>
                  <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{customerEmail}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800">
                  <Phone className="text-slate-600 dark:text-slate-400" size={16} />
                </div>
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Phone</p>
                  <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{customerPhone}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Shipping Address */}
          {order.shippingAddress && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6">
              <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-4">Shipping Address</h2>
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800">
                  <MapPin className="text-slate-600 dark:text-slate-400" size={16} />
                </div>
                <div className="text-sm text-slate-700 dark:text-slate-300">
                  <p className="font-medium">{order.shippingAddress.name || customerName}</p>
                  <p className="mt-1">{order.shippingAddress.address}</p>
                  {order.shippingAddress.upazila && (
                    <p>
                      {order.shippingAddress.upazila}
                      {order.shippingAddress.district && `, ${order.shippingAddress.district}`}
                      {order.shippingAddress.division && `, ${order.shippingAddress.division}`}
                    </p>
                  )}
                  {order.shippingAddress.phone && (
                    <p className="mt-1">{order.shippingAddress.phone}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Order Info */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6">
            <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-4">Order Information</h2>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800">
                  <Calendar className="text-slate-600 dark:text-slate-400" size={16} />
                </div>
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Date</p>
                  <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800">
                  <CreditCard className="text-slate-600 dark:text-slate-400" size={16} />
                </div>
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Payment Method</p>
                  <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                    {order.paymentMethod || "N/A"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800">
                  <Package className="text-slate-600 dark:text-slate-400" size={16} />
                </div>
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Total Items</p>
                  <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                    {order.orderItems?.length || 0}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
