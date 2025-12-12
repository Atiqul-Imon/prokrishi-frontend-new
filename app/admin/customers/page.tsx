"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { apiRequest } from "../../utils/api";
import { Search, User, Mail, Phone, RefreshCw, Eye } from "lucide-react";
import type { User } from "@/types/models";
import { handleApiError } from "@/app/utils/errorHandler";

interface AdminUsersResponse {
  users?: User[];
  pagination?: {
    totalPages?: number;
  };
}

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params: { page: number; limit: number; search?: string } = { page: currentPage, limit: 20 };
      if (searchQuery) params.search = searchQuery;
      
      const result = await apiRequest<AdminUsersResponse>("/user/admin", {
        method: "GET",
        params,
      });
      setCustomers(result.users || []);
      setTotalPages(result.pagination?.totalPages || 1);
    } catch (err) {
      setError(handleApiError(err, "loading customers"));
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchQuery]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  return (
    <div className="space-y-4">
      {/* Header - Nexus Style */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 mb-1">Customers</h1>
          <p className="text-sm text-slate-600">Manage customer accounts</p>
        </div>
      </div>

      {/* Search - Nexus Style */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Search customers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all"
            />
          </div>
          <button
            onClick={fetchCustomers}
            className="px-4 py-2.5 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-all shadow-sm hover:shadow-md flex items-center gap-2 text-sm font-medium"
          >
            <RefreshCw size={18} strokeWidth={2} />
            Refresh
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <p className="text-red-800 text-sm">{error}</p>
        </div>
      )}

      {/* Customers Table - Nexus Style */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-12 text-center">
            <div className="inline-block w-8 h-8 border-4 border-slate-200 border-t-emerald-500 rounded-full animate-spin"></div>
            <p className="text-slate-500 mt-4">Loading customers...</p>
          </div>
        ) : customers.length === 0 ? (
          <div className="p-12 text-center">
            <User className="mx-auto text-slate-400 mb-4" size={48} strokeWidth={1.5} />
            <p className="text-slate-500">No customers found</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
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
                            <p className="font-medium text-slate-900">
                              {customer.name || "Unknown"}
                            </p>
                            <p className="text-sm text-slate-500">
                              ID: {customer._id?.slice(-8)}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          {customer.email && (
                            <div className="flex items-center gap-2 text-sm text-slate-900">
                              <Mail size={14} className="text-slate-400" />
                              {customer.email}
                            </div>
                          )}
                          {customer.phone && (
                            <div className="flex items-center gap-2 text-sm text-slate-900">
                              <Phone size={14} className="text-slate-400" />
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
                        <span className="text-sm text-slate-900">
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
              <div className="px-6 py-4 border-t border-slate-200">
                <p className="text-sm text-slate-500">
                  Page {currentPage} of {totalPages}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 bg-slate-100"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 bg-slate-100"
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

