"use client";

import { useState, useEffect } from "react";
import { getDashboardStats } from "../utils/api";
import {
  Users,
  Package,
  ShoppingBag,
  DollarSign,
  TrendingUp,
  Activity,
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import Link from "next/link";

interface DashboardStats {
  stats?: {
    totalUsers: number;
    totalProducts: number;
    totalOrders: number;
    totalRevenue: number;
  };
  recentOrders?: any[];
  lowStockProducts?: any[];
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const data = await getDashboardStats();
        setStats(data);
      } catch (err: any) {
        setError(err.message || "Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 bg-slate-100 dark:bg-slate-900 rounded-xl animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/30 rounded-xl p-6">
        <div className="flex items-center gap-3">
          <AlertCircle className="text-red-600 dark:text-red-400" size={20} />
          <div>
            <h3 className="text-sm font-semibold text-red-900 dark:text-red-200">Error</h3>
            <p className="text-sm text-red-700 dark:text-red-300 mt-0.5">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  const metrics = [
    {
      title: "Total Users",
      value: stats?.stats?.totalUsers || 0,
      icon: Users,
      change: "+12%",
      isPositive: true,
      href: "/admin/customers",
    },
    {
      title: "Products",
      value: stats?.stats?.totalProducts || 0,
      icon: Package,
      change: "+8%",
      isPositive: true,
      href: "/admin/products",
    },
    {
      title: "Orders",
      value: stats?.stats?.totalOrders || 0,
      icon: ShoppingBag,
      change: "+15%",
      isPositive: true,
      href: "/admin/orders",
    },
    {
      title: "Revenue",
      value: `৳${(stats?.stats?.totalRevenue || 0).toLocaleString("en-BD")}`,
      icon: DollarSign,
      change: "+22%",
      isPositive: true,
    },
  ];

  return (
    <div className="space-y-8">
      {/* Minimal Header */}
      <div>
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">Overview</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Monitor your business at a glance</p>
      </div>

      {/* Metrics Grid - Modern Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric, index) => {
          const Icon = metric.icon;
          const CardContent = (
            <div className="group relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-200">
              <div className="flex items-start justify-between mb-4">
                <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800">
                  <Icon className="text-slate-700 dark:text-slate-300" size={18} />
                </div>
                {metric.change && (
                  <div className={`flex items-center gap-1 text-xs font-medium ${
                    metric.isPositive ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"
                  }`}>
                    {metric.isPositive ? (
                      <ArrowUpRight size={14} />
                    ) : (
                      <ArrowDownRight size={14} />
                    )}
                    <span>{metric.change}</span>
                  </div>
                )}
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">{metric.title}</p>
                <p className="text-2xl font-semibold text-slate-900 dark:text-slate-100">{metric.value}</p>
              </div>
              {metric.href && (
                <Link
                  href={metric.href}
                  className="absolute inset-0 rounded-xl"
                  aria-label={`View ${metric.title}`}
                />
              )}
            </div>
          );

          return <div key={index}>{CardContent}</div>;
        })}
      </div>

      {/* Recent Activity & Alerts - Side by Side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Recent Orders */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Recent Orders</h2>
            <Link href="/admin/orders" className="text-xs text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100">
              View all →
            </Link>
          </div>
          <div className="space-y-3">
            {stats?.recentOrders && stats.recentOrders.length > 0 ? (
              stats.recentOrders.slice(0, 5).map((order: any) => (
                <div key={order._id} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">
                      {order.user?.name || order.guestInfo?.name || "Guest"}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      #{order.invoiceNumber || order._id?.slice(-8)}
                    </p>
                  </div>
                  <div className="text-right ml-4">
                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                      ৳{order.totalPrice?.toLocaleString() || 0}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                <Activity size={24} className="mx-auto mb-2 opacity-50" />
                <p className="text-sm">No recent orders</p>
              </div>
            )}
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Stock Alerts</h2>
            <Link href="/admin/products" className="text-xs text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100">
              View all →
            </Link>
          </div>
          <div className="space-y-3">
            {stats?.lowStockProducts && stats.lowStockProducts.length > 0 ? (
              stats.lowStockProducts.map((product: any) => (
                <Link
                  key={product._id}
                  href={`/admin/products/${product._id}`}
                  className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">{product.name}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      {product.stock === 0 ? "Out of stock" : `${product.stock} units left`}
                    </p>
                  </div>
                  <div className={`ml-4 px-2 py-1 rounded-md text-xs font-medium ${
                    product.stock === 0
                      ? "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400"
                      : "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400"
                  }`}>
                    {product.stock === 0 ? "Critical" : "Low"}
                  </div>
                </Link>
              ))
            ) : (
              <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                <Package size={24} className="mx-auto mb-2 opacity-50" />
                <p className="text-sm">All products in stock</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
