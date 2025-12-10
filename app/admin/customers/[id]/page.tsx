"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { getUserById } from "../../../utils/api";
import { ArrowLeft, User, Mail, Phone, MapPin, Calendar, Package, AlertCircle } from "lucide-react";

export default function CustomerDetailsPage() {
  const params = useParams();
  const customerId = params.id as string;
  const [customer, setCustomer] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCustomer = async () => {
      try {
        setLoading(true);
        const result = await getUserById(customerId);
        setCustomer(result.user || result);
      } catch (err: any) {
        setError(err.message || "Failed to load customer");
      } finally {
        setLoading(false);
      }
    };

    if (customerId) {
      fetchCustomer();
    }
  }, [customerId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-block w-6 h-6 border-2 border-slate-200 dark:border-slate-800 border-t-slate-900 dark:border-t-slate-100 rounded-full animate-spin"></div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-3">Loading customer...</p>
        </div>
      </div>
    );
  }

  if (error || !customer) {
    return (
      <div className="space-y-6">
        <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/30 rounded-xl p-6">
          <div className="flex items-center gap-3">
            <AlertCircle className="text-red-600 dark:text-red-400" size={20} />
            <div>
              <h3 className="text-sm font-semibold text-red-900 dark:text-red-200">Error</h3>
              <p className="text-sm text-red-700 dark:text-red-300 mt-0.5">{error || "Customer not found"}</p>
            </div>
          </div>
        </div>
        <Link href="/admin/customers">
          <button className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-sm">
            Back to Customers
          </button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/admin/customers">
          <button className="p-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            <ArrowLeft size={18} />
          </button>
        </Link>
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
            {customer.name || "Customer"}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Customer Details</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Customer Information */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6">
            <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-4">Contact Information</h2>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800">
                  <User className="text-slate-600 dark:text-slate-400" size={16} />
                </div>
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Name</p>
                  <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                    {customer.name || "N/A"}
                  </p>
                </div>
              </div>

              {customer.email && (
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800">
                    <Mail className="text-slate-600 dark:text-slate-400" size={16} />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Email</p>
                    <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{customer.email}</p>
                  </div>
                </div>
              )}

              {customer.phone && (
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800">
                    <Phone className="text-slate-600 dark:text-slate-400" size={16} />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Phone</p>
                    <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{customer.phone}</p>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800">
                  <Calendar className="text-slate-600 dark:text-slate-400" size={16} />
                </div>
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Member Since</p>
                  <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                    {new Date(customer.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Addresses */}
          {customer.addresses && customer.addresses.length > 0 && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6">
              <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-4">Saved Addresses</h2>
              <div className="space-y-3">
                {customer.addresses.map((address: any, index: number) => (
                  <div
                    key={index}
                    className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800"
                  >
                    <div className="flex items-start gap-3">
                      <MapPin className="text-slate-500 dark:text-slate-400 mt-0.5" size={16} />
                      <div className="flex-1 text-sm text-slate-700 dark:text-slate-300">
                        <p className="font-medium">{address.name}</p>
                        <p className="mt-1">{address.address}</p>
                        {address.upazila && (
                          <p>
                            {address.upazila}
                            {address.district && `, ${address.district}`}
                            {address.division && `, ${address.division}`}
                          </p>
                        )}
                        {address.phone && <p className="mt-1">{address.phone}</p>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Account Info */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6">
            <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-4">Account Information</h2>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Role</p>
                <span
                  className={`inline-block px-2 py-1 rounded-md text-xs font-medium ${
                    customer.role === "admin"
                      ? "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                  }`}
                >
                  {customer.role || "customer"}
                </span>
              </div>

              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">User ID</p>
                <p className="text-xs font-mono text-slate-700 dark:text-slate-300">
                  {customer._id?.slice(-8)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

