"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { apiRequest } from "../../utils/api";
import { Search, User, Mail, Phone, RefreshCw, Eye } from "lucide-react";

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params: any = { page: currentPage, limit: 20 };
      if (searchQuery) params.search = searchQuery;
      
      const result = await apiRequest<any>("/user/admin", {
        method: "GET",
        params,
      });
      
      // Backend returns: { success: true, message: "...", data: users[], pagination: {...} }
      // Transform interceptor may wrap it, so check both result.data and direct properties
      console.log("API Response:", result); // Debug log
      
      const users = result.data || result.users || [];
      const pagination = result.pagination || result.data?.pagination;
      
      if (!Array.isArray(users)) {
        console.error("Users is not an array:", users);
        setCustomers([]);
      } else {
        setCustomers(users);
      }
      
      setTotalPages(pagination?.totalPages || 1);
    } catch (err: any) {
      console.error("Error fetching customers:", err);
      setError(err.message || "Failed to load customers");
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchQuery]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  return (
    <div className="space-y-4">
      {/* Enhanced Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-2">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Customers</h1>
          <p className="text-sm text-slate-600">Manage customer accounts</p>
        </div>
      </div>

      {/* Enhanced Search */}
      <div className="bg-white">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search customers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50"
            />
          </div>
          <button
            onClick={fetchCustomers}
            className="px-4 py-2.5 bg-gradient-to-r from-slate-100 to-slate-200"
          >
            <RefreshCw size={18} />
            Refresh
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800 font-semibold">Error loading customers</p>
          <p className="text-red-600 text-sm mt-1">{error}</p>
          <p className="text-red-500 text-xs mt-2">
            Please check: 1) You are logged in as admin, 2) API is running, 3) Check browser console for details
          </p>
        </div>
      )}

      {/* Enhanced Customers Table */}
      <div className="bg-white">
        {loading ? (
          <div className="p-12 text-center">
            <div className="inline-block w-8 h-8 border-4 border-gray-200"></div>
            <p className="text-gray-500">Loading customers...</p>
          </div>
        ) : customers.length === 0 ? (
          <div className="p-12 text-center">
            <User className="mx-auto text-gray-400" size={48} />
            <p className="text-gray-500">No customers found</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-slate-50 to-slate-100">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-700">
                      Customer
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-700">
                      Contact
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-700">
                      Role
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-700">
                      Joined
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-bold text-slate-700">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {customers.map((customer) => (
                    <tr
                      key={customer._id}
                      className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
                            <span className="text-white text-sm font-bold">
                              {customer.name?.charAt(0).toUpperCase() || "U"}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              {customer.name || "Unknown"}
                            </p>
                            <p className="text-sm text-gray-500">
                              ID: {customer._id?.slice(-8)}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          {customer.email && (
                            <div className="flex items-center gap-2 text-sm text-gray-900">
                              <Mail size={14} className="text-gray-400" />
                              {customer.email}
                            </div>
                          )}
                          {customer.phone && (
                            <div className="flex items-center gap-2 text-sm text-gray-900">
                              <Phone size={14} className="text-gray-400" />
                              {customer.phone}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm ${
                            customer.role === "admin"
                              ? "bg-gradient-to-r from-purple-500 to-violet-600 text-white"
                              : "bg-gradient-to-r from-slate-400 to-slate-500 text-white"
                          }`}
                        >
                          {customer.role || "customer"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-900">
                          {new Date(customer.createdAt).toLocaleDateString()}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/admin/customers/${customer._id}`}
                            className="p-2 text-emerald-600"
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

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-6 py-4 border-t border-gray-200">
                <p className="text-sm text-gray-500">
                  Page {currentPage} of {totalPages}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 bg-gray-100"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 bg-gray-100"
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

