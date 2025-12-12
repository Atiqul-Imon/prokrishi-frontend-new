"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { getUserById } from "../../../utils/api";
import { ArrowLeft, User as UserIcon, Mail, Phone, MapPin, Calendar, Package, AlertCircle } from "lucide-react";
import type { User, Address } from "@/types/models";
import { handleApiError } from "@/app/utils/errorHandler";
import { formatDate } from "@/app/utils";

export default function CustomerDetailsPage() {
  const params = useParams();
  const customerId = params.id as string;
  const [customer, setCustomer] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCustomer = async () => {
      try {
        setLoading(true);
        const result = await getUserById(customerId);
        setCustomer(result.user || result);
      } catch (err) {
        setError(handleApiError(err, "loading customer"));
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
          <div className="inline-block w-6 h-6 border-2 border-slate-200"></div>
          <p className="text-sm text-slate-500">Loading customer...</p>
        </div>
      </div>
    );
  }

  if (error || !customer) {
    return (
      <div className="space-y-4">
        <div className="bg-red-50">
          <div className="flex items-center gap-3">
            <AlertCircle className="text-red-600" size={20} />
            <div>
              <h3 className="text-sm font-semibold text-red-900">Error</h3>
              <p className="text-sm text-red-700">{error || "Customer not found"}</p>
            </div>
          </div>
        </div>
        <Link href="/admin/customers">
          <button className="px-4 py-2 bg-slate-100">
            Back to Customers
          </button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/admin/customers">
          <button className="p-2 rounded-lg text-slate-600">
            <ArrowLeft size={18} />
          </button>
        </Link>
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">
            {customer.name || "Customer"}
          </h1>
          <p className="text-sm text-slate-500">Customer Details</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-4">
          {/* Customer Information */}
          <div className="bg-white">
            <h2 className="text-sm font-semibold text-slate-900">Contact Information</h2>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-slate-100">
                  <UserIcon className="text-slate-600" size={16} />
                </div>
                <div>
                  <p className="text-xs text-slate-500">Name</p>
                  <p className="text-sm font-medium text-slate-900">
                    {customer.name || "N/A"}
                  </p>
                </div>
              </div>

              {customer.email && (
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-slate-100">
                    <Mail className="text-slate-600" size={16} />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Email</p>
                    <p className="text-sm font-medium text-slate-900">{customer.email}</p>
                  </div>
                </div>
              )}

              {customer.phone && (
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-slate-100">
                    <Phone className="text-slate-600" size={16} />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Phone</p>
                    <p className="text-sm font-medium text-slate-900">{customer.phone}</p>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-slate-100">
                  <Calendar className="text-slate-600" size={16} />
                </div>
                <div>
                  <p className="text-xs text-slate-500">Member Since</p>
                  <p className="text-sm font-medium text-slate-900">
                    {customer.createdAt ? formatDate(customer.createdAt) : "N/A"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Addresses */}
          {customer.addresses && customer.addresses.length > 0 && (
            <div className="bg-white">
              <h2 className="text-sm font-semibold text-slate-900">Saved Addresses</h2>
              <div className="space-y-3">
                {customer.addresses.map((address: Address, index: number) => (
                  <div
                    key={index}
                    className="p-4 rounded-lg bg-slate-50"
                  >
                    <div className="flex items-start gap-3">
                      <MapPin className="text-slate-500" size={16} />
                      <div className="flex-1 text-sm text-slate-700">
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
        <div className="space-y-4">
          {/* Account Info */}
          <div className="bg-white">
            <h2 className="text-sm font-semibold text-slate-900">Account Information</h2>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-slate-500">Role</p>
                <span
                  className={`inline-block px-2 py-1 rounded-md text-xs font-medium ${
                    customer.role === "admin"
                      ? "bg-purple-100"
                      : "bg-slate-100"
                  }`}
                >
                  {customer.role || "customer"}
                </span>
              </div>

              <div>
                <p className="text-xs text-slate-500">User ID</p>
                <p className="text-xs font-mono text-slate-700">
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

