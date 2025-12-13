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
import type { Order } from "@/types/models";
import { handleApiError } from "@/app/utils/errorHandler";
import { formatCurrency, formatDate, formatDateTimeBD } from "@/app/utils";

export default function OrderDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id as string;
  const [order, setOrder] = useState<Order | null>(null);
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
        setNewStatus(response.order.status || "");
        setNewPaymentStatus(response.order.paymentStatus || "");
        setTransactionId(response.order.transactionId || "");
      } catch (err) {
        setError(handleApiError(err, "loading order"));
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
      if (order) {
        setOrder({ ...order, status: newStatus } as Order);
      }
      setEditingStatus(false);
      setNotes("");
    } catch (err) {
      alert(handleApiError(err, "updating order status"));
    } finally {
      setUpdating(false);
    }
  };

  const handlePaymentUpdate = async () => {
    setUpdating(true);
    try {
      await updateAdminPaymentStatus(orderId, newPaymentStatus, transactionId, notes);
      if (order) {
        setOrder({ ...order, paymentStatus: newPaymentStatus, transactionId } as Order);
      }
      setEditingPayment(false);
      setNotes("");
    } catch (err) {
      alert(handleApiError(err, "updating payment status"));
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-block w-6 h-6 border-2 border-slate-200"></div>
          <p className="text-sm text-slate-500">Loading order...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="space-y-4">
        <div className="bg-red-50">
          <div className="flex items-center gap-3">
            <AlertCircle className="text-red-600" size={20} />
            <div>
              <h3 className="text-sm font-semibold text-red-900">Error</h3>
              <p className="text-sm text-red-700">{error || "Order not found"}</p>
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
    pending: "bg-yellow-100",
    confirmed: "bg-blue-100",
    processing: "bg-indigo-100",
    shipped: "bg-purple-100",
    delivered: "bg-emerald-100",
    cancelled: "bg-red-100",
  };

  const paymentStatusColors: Record<string, string> = {
    pending: "bg-yellow-100",
    completed: "bg-green-100",
    failed: "bg-red-100",
    cancelled: "bg-gray-100",
  };

  const customerName =
    order.user?.name || order.shippingAddress?.name || order.guestInfo?.name || "Guest";
  const customerEmail = order.user?.email || order.guestInfo?.email || "Not provided";
  const customerPhone =
    order.user?.phone || order.shippingAddress?.phone || order.guestInfo?.phone || "Not provided";

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/orders">
            <button className="p-2 rounded-lg text-slate-600">
              <ArrowLeft size={18} />
            </button>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-semibold text-slate-900">
                Order #{order.invoiceNumber || order._id?.slice(-8)}
              </h1>
              {(order as any).orderType === 'fish' && (
                <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded">
                  Fish Order
                </span>
              )}
            </div>
            <p className="text-sm text-slate-500">
              Placed on {formatDateTimeBD(order.createdAt)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span
            className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
              statusColors[order.status || 'pending'] || statusColors.pending
            }`}
          >
            {order.status || "pending"}
          </span>
          <span
            className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
              paymentStatusColors[order.paymentStatus || 'pending'] || paymentStatusColors.pending
            }`}
          >
            {order.paymentStatus || "pending"}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-4">
          {/* Order Items */}
          <div className="bg-white">
            <h2 className="text-sm font-semibold text-slate-900">Order Items</h2>
            <div className="space-y-3">
              {order.orderItems?.map((item, index: number) => (
                <div
                  key={index}
                  className="flex items-center gap-4 p-3 rounded-lg bg-slate-50"
                >
                  {(item as any).variant?.image || (item as any).product?.image ? (
                    <img
                      src={(item as any).variant?.image || (item as any).product?.image}
                      alt={item.name}
                      className="w-16 h-16 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-lg bg-slate-200">
                      <Package className="text-slate-400" size={24} />
                    </div>
                  )}
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-900">{item.name}</p>
                    {(item as any).variant?.label && (
                      <p className="text-xs text-slate-500">
                        {(order as any).orderType === 'fish' ? 'Size' : 'Variant'}: {(item as any).variant.label}
                        {(order as any).orderType === 'fish' && (item as any).variant.pricePerKg && (
                          <span className="ml-1">({formatCurrency((item as any).variant.pricePerKg)}/kg)</span>
                        )}
                      </p>
                    )}
                    <p className="text-xs text-slate-500">
                      {(order as any).orderType === 'fish' ? 'Weight' : 'Quantity'}: {item.quantity} {(order as any).orderType === 'fish' ? 'kg' : ''} × {formatCurrency(item.price || 0)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-slate-900">
                      {formatCurrency((item.price || 0) * (item.quantity || 0))}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <div className="border-t border-slate-200">
              <div className="flex justify-between items-center text-lg font-semibold">
                <span className="text-slate-900">Total Amount:</span>
                <span className="text-emerald-600">
                  {formatCurrency(order.totalAmount || order.totalPrice || 0)}
                </span>
              </div>
            </div>
          </div>

          {/* Order Status Management */}
          <div className="bg-white">
            <h2 className="text-sm font-semibold text-slate-900">Order Status</h2>
            {editingStatus ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700">
                    Status
                  </label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50"
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
                  <label className="block text-sm font-medium text-slate-700">
                    Notes (Optional)
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Add any notes about this status change..."
                    className="w-full px-3 py-2 bg-slate-50"
                    rows={3}
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={handleStatusUpdate}
                    disabled={updating}
                    className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Save size={16} />
                    Save Changes
                  </button>
                  <button
                    onClick={() => {
                      setEditingStatus(false);
                      setNewStatus(order.status || 'pending');
                      setNotes("");
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-100"
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
                      statusColors[order.status || 'pending'] || statusColors.pending
                    }`}
                  >
                    {order.status || "pending"}
                  </span>
                  {((order as any).isDelivered || order.status === 'delivered') && (order as any).deliveredAt && (
                    <span className="text-sm text-slate-500">
                      Delivered on {formatDate((order as any).deliveredAt)}
                    </span>
                  )}
                </div>
                <button
                  onClick={() => setEditingStatus(true)}
                  className="flex items-center gap-2 px-3 py-2 text-emerald-600"
                >
                  <Edit size={16} />
                  Update Status
                </button>
              </div>
            )}
          </div>

          {/* Payment Status Management */}
          <div className="bg-white">
            <h2 className="text-sm font-semibold text-slate-900">Payment Status</h2>
            {editingPayment ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700">
                    Payment Status
                  </label>
                  <select
                    value={newPaymentStatus}
                    onChange={(e) => setNewPaymentStatus(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50"
                  >
                    <option value="pending">Pending</option>
                    <option value="completed">Completed</option>
                    <option value="failed">Failed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">
                    Transaction ID (Optional)
                  </label>
                  <input
                    type="text"
                    value={transactionId}
                    onChange={(e) => setTransactionId(e.target.value)}
                    placeholder="Enter transaction ID..."
                    className="w-full px-3 py-2 bg-slate-50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">
                    Notes (Optional)
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Add any notes about this payment status change..."
                    className="w-full px-3 py-2 bg-slate-50"
                    rows={3}
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={handlePaymentUpdate}
                    disabled={updating}
                    className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Save size={16} />
                    Save Changes
                  </button>
                  <button
                    onClick={() => {
                      setEditingPayment(false);
                      setNewPaymentStatus(order.paymentStatus || 'pending');
                      setTransactionId(order.transactionId || "");
                      setNotes("");
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-100"
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
                      paymentStatusColors[order.paymentStatus || 'pending'] || paymentStatusColors.pending
                    }`}
                  >
                    {order.paymentStatus || "pending"}
                  </span>
                  {((order as any).isPaid || order.paymentStatus === 'completed') && (order as any).paidAt && (
                    <span className="text-sm text-slate-500">
                      Paid on {formatDate((order as any).paidAt)}
                    </span>
                  )}
                  {order.transactionId && (
                    <span className="text-sm text-slate-500">
                      Transaction ID: {order.transactionId}
                    </span>
                  )}
                </div>
                <button
                  onClick={() => setEditingPayment(true)}
                  className="flex items-center gap-2 px-3 py-2 text-emerald-600"
                >
                  <Edit size={16} />
                  Update Payment
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Order Summary */}
          <div className="bg-white">
            <h2 className="text-sm font-semibold text-slate-900">Order Summary</h2>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-slate-100">
                  <DollarSign className="text-slate-600" size={16} />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-slate-500">Subtotal</p>
                  <p className="text-sm font-medium text-slate-900">
                    {formatCurrency(order.totalPrice || 0)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-slate-100">
                  <Package className="text-slate-600" size={16} />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-slate-500">Shipping</p>
                  <p className="text-sm font-medium text-slate-900">
                    {formatCurrency(order.shippingFee || 0)}
                  </p>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-slate-900">Total</p>
                  <p className="text-lg font-bold text-slate-900">
                    {formatCurrency(order.totalAmount || order.totalPrice || 0)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Customer Info */}
          <div className="bg-white">
            <h2 className="text-sm font-semibold text-slate-900">Customer Information</h2>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-slate-100">
                  <User className="text-slate-600" size={16} />
                </div>
                <div>
                  <p className="text-xs text-slate-500">Name</p>
                  <p className="text-sm font-medium text-slate-900">{customerName}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-slate-100">
                  <Mail className="text-slate-600" size={16} />
                </div>
                <div>
                  <p className="text-xs text-slate-500">Email</p>
                  <p className="text-sm font-medium text-slate-900">{customerEmail}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-slate-100">
                  <Phone className="text-slate-600" size={16} />
                </div>
                <div>
                  <p className="text-xs text-slate-500">Phone</p>
                  <p className="text-sm font-medium text-slate-900">{customerPhone}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Shipping Address */}
          {order.shippingAddress && (
            <div className="bg-white">
              <h2 className="text-sm font-semibold text-slate-900">Shipping Address</h2>
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-slate-100">
                  <MapPin className="text-slate-600" size={16} />
                </div>
                <div className="text-sm text-slate-700">
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
          <div className="bg-white">
            <h2 className="text-sm font-semibold text-slate-900">Order Information</h2>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-slate-100">
                  <Calendar className="text-slate-600" size={16} />
                </div>
                <div>
                  <p className="text-xs text-slate-500">Date & Time</p>
                  <p className="text-sm font-medium text-slate-900">
                    {formatDateTimeBD(order.createdAt)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-slate-100">
                  <CreditCard className="text-slate-600" size={16} />
                </div>
                <div>
                  <p className="text-xs text-slate-500">Payment Method</p>
                  <p className="text-sm font-medium text-slate-900">
                    {order.paymentMethod || "N/A"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-slate-100">
                  <Package className="text-slate-600" size={16} />
                </div>
                <div>
                  <p className="text-xs text-slate-500">Total Items</p>
                  <p className="text-sm font-medium text-slate-900">
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
