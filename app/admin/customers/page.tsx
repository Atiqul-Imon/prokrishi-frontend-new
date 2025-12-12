"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { apiRequest } from "../../utils/api";
import { User, Mail, Phone, Eye } from "lucide-react";
import type { User as UserType } from "@/types/models";
import { handleApiError } from "@/app/utils/errorHandler";
import { formatDate, formatPhone } from "@/app/utils";
import {
  AdminListPageLayout,
  AdminTableHeader,
  AdminTableRow,
  type TableColumn,
} from "@/components/admin";

interface AdminUsersResponse {
  users?: UserType[];
  pagination?: {
    totalPages?: number;
  };
}

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<UserType[]>([]);
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

  const columns: TableColumn[] = [
    { key: "customer", label: "Customer", align: "left" },
    { key: "contact", label: "Contact", align: "left" },
    { key: "role", label: "Role", align: "left" },
    { key: "joined", label: "Joined", align: "left" },
    { key: "actions", label: "Actions", align: "right" },
  ];

  return (
    <AdminListPageLayout
      title="Customers"
      description="Manage customer accounts"
      searchPlaceholder="Search customers..."
      searchValue={searchQuery}
      onSearchChange={setSearchQuery}
      onRefresh={fetchCustomers}
      error={error}
      onErrorDismiss={() => setError(null)}
      loading={loading}
      empty={!loading && customers.length === 0}
      emptyIcon={<User className="mx-auto text-slate-400 mb-4" size={48} strokeWidth={1.5} />}
      emptyTitle="No customers found"
      pagination={
        totalPages > 1
          ? {
              currentPage,
              totalPages,
              onPageChange: setCurrentPage,
            }
          : undefined
      }
    >
      <table className="w-full">
        <AdminTableHeader columns={columns} />
        <tbody className="divide-y divide-slate-200">
          {customers.map((customer) => (
            <AdminTableRow key={customer._id}>
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
                      {formatPhone(customer.phone)}
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
                  {formatDate(customer.createdAt)}
                </span>
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center justify-end gap-2">
                  <Link
                    href={`/admin/customers/${customer._id}`}
                    className="p-2 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-all"
                    title="View"
                  >
                    <Eye size={18} strokeWidth={2} />
                  </Link>
                </div>
              </td>
            </AdminTableRow>
          ))}
        </tbody>
      </table>
    </AdminListPageLayout>
  );
}
