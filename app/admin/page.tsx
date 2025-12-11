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
      {/* Enhanced Header */}
      <div className="mb-2">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">Overview</h1>
        <p className="text-base text-slate-600 dark:text-slate-400">Monitor your business at a glance</p>
      </div>

      {/* Metrics Grid - Enhanced Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric, index) => {
          const Icon = metric.icon;
          
          // Color schemes for different metrics
          const colorSchemes = [
            { // Users - Blue
              iconBg: "bg-gradient-to-br from-blue-500 to-indigo-600",
              iconColor: "text-white",
              borderColor: "border-blue-200 dark:border-blue-900/50",
              hoverBorder: "hover:border-blue-300 dark:hover:border-blue-800",
              shadow: "shadow-blue-100 dark:shadow-blue-900/20",
            },
            { // Products - Purple
              iconBg: "bg-gradient-to-br from-purple-500 to-violet-600",
              iconColor: "text-white",
              borderColor: "border-purple-200 dark:border-purple-900/50",
              hoverBorder: "hover:border-purple-300 dark:hover:border-purple-800",
              shadow: "shadow-purple-100 dark:shadow-purple-900/20",
            },
            { // Orders - Green
              iconBg: "bg-gradient-to-br from-emerald-500 to-teal-600",
              iconColor: "text-white",
              borderColor: "border-emerald-200 dark:border-emerald-900/50",
              hoverBorder: "hover:border-emerald-300 dark:hover:border-emerald-800",
              shadow: "shadow-emerald-100 dark:shadow-emerald-900/20",
            },
            { // Revenue - Amber
              iconBg: "bg-gradient-to-br from-amber-500 to-orange-600",
              iconColor: "text-white",
              borderColor: "border-amber-200 dark:border-amber-900/50",
              hoverBorder: "hover:border-amber-300 dark:hover:border-amber-800",
              shadow: "shadow-amber-100 dark:shadow-amber-900/20",
            },
          ];
          
          const scheme = colorSchemes[index] || colorSchemes[0];
          
          const CardContent = (
            <div className={`group relative bg-white dark:bg-slate-900 border-2 ${scheme.borderColor} rounded-2xl p-6 ${scheme.hoverBorder} hover:shadow-xl ${scheme.shadow} transition-all duration-300 hover:-translate-y-1`}>
              <div className="flex items-start justify-between mb-5">
                <div className={`p-3 rounded-xl ${scheme.iconBg} shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className={scheme.iconColor} size={20} />
                </div>
                {metric.change && (
                  <div className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold ${
                    metric.isPositive 
                      ? "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400" 
                      : "bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400"
                  }`}>
                    {metric.isPositive ? (
                      <ArrowUpRight size={12} />
                    ) : (
                      <ArrowDownRight size={12} />
                    )}
                    <span>{metric.change}</span>
                  </div>
                )}
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wide">{metric.title}</p>
                <p className="text-3xl font-bold text-slate-900 dark:text-slate-100 leading-tight">{metric.value}</p>
              </div>
              {metric.href && (
                <Link
                  href={metric.href}
                  className="absolute inset-0 rounded-2xl"
                  aria-label={`View ${metric.title}`}
                />
              )}
            </div>
          );

          return <div key={index}>{CardContent}</div>;
        })}
      </div>

      {/* Recent Activity & Alerts - Side by Side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Recent Orders</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Latest customer orders</p>
            </div>
            <Link href="/admin/orders" className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors">
              View all →
            </Link>
          </div>
          <div className="space-y-3">
            {stats?.recentOrders && stats.recentOrders.length > 0 ? (
              stats.recentOrders.slice(0, 5).map((order: any) => (
                <Link
                  key={order._id}
                  href={`/admin/orders/${order._id}`}
                  className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-slate-50 to-slate-100/50 dark:from-slate-800/50 dark:to-slate-800/30 border border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-md transition-all duration-200 group"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {order.user?.name || order.guestInfo?.name || "Guest"}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-mono">
                      #{order.invoiceNumber || order._id?.slice(-8)}
                    </p>
                  </div>
                  <div className="text-right ml-4">
                    <p className="text-sm font-bold text-slate-900 dark:text-slate-100">
                      ৳{order.totalPrice?.toLocaleString() || 0}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </Link>
              ))
            ) : (
              <div className="text-center py-12 text-slate-500 dark:text-slate-400">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                  <Activity size={24} className="opacity-50" />
                </div>
                <p className="text-sm font-medium">No recent orders</p>
                <p className="text-xs mt-1">Orders will appear here</p>
              </div>
            )}
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className="bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Stock Alerts</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Products needing attention</p>
            </div>
            <Link href="/admin/products" className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors">
              View all →
            </Link>
          </div>
          <div className="space-y-3">
            {stats?.lowStockProducts && stats.lowStockProducts.length > 0 ? (
              stats.lowStockProducts.map((product: any) => (
                <Link
                  key={product._id}
                  href={`/admin/products/${product._id}`}
                  className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-slate-50 to-slate-100/50 dark:from-slate-800/50 dark:to-slate-800/30 border border-slate-200 dark:border-slate-700 hover:border-red-300 dark:hover:border-red-700 hover:shadow-md transition-all duration-200 group"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">{product.name}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      {product.stock === 0 ? "Out of stock" : `${product.stock} units left`}
                    </p>
                  </div>
                  <div className={`ml-4 px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm ${
                    product.stock === 0
                      ? "bg-gradient-to-r from-red-500 to-red-600 text-white"
                      : "bg-gradient-to-r from-amber-500 to-orange-500 text-white"
                  }`}>
                    {product.stock === 0 ? "Critical" : "Low"}
                  </div>
                </Link>
              ))
            ) : (
              <div className="text-center py-12 text-slate-500 dark:text-slate-400">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                  <Package size={24} className="text-emerald-600 dark:text-emerald-400" />
                </div>
                <p className="text-sm font-medium">All products in stock</p>
                <p className="text-xs mt-1">Great job managing inventory!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
