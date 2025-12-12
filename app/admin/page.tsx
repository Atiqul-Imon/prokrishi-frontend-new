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
  Home,
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "../context/AuthContext";
import type { Order, Product } from "@/types/models";
import { handleApiError } from "@/app/utils/errorHandler";

interface DashboardStats {
  stats?: {
    totalUsers: number;
    totalProducts: number;
    totalOrders: number;
    totalRevenue: number;
  };
  recentOrders?: Order[];
  lowStockProducts?: Product[];
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const data = await getDashboardStats();
        setStats(data);
      } catch (err) {
        setError(handleApiError(err, "loading dashboard data"));
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-slate-100 rounded-xl animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6">
        <div className="flex items-center gap-3">
          <AlertCircle className="text-red-600" size={20} />
          <div>
            <h3 className="text-sm font-semibold text-red-900">Error</h3>
            <p className="text-sm text-red-700 mt-0.5">{error}</p>
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
      color: "purple",
    },
    {
      title: "Products",
      value: stats?.stats?.totalProducts || 0,
      icon: Package,
      change: "+8%",
      isPositive: true,
      href: "/admin/products",
      color: "purple",
    },
    {
      title: "Orders",
      value: stats?.stats?.totalOrders || 0,
      icon: ShoppingBag,
      change: "+15%",
      isPositive: true,
      href: "/admin/orders",
      color: "emerald",
    },
    {
      title: "Revenue",
      value: `৳${(stats?.stats?.totalRevenue || 0).toLocaleString("en-BD")}`,
      icon: DollarSign,
      change: "+22%",
      isPositive: true,
      color: "amber",
    },
  ];

  interface ColorClasses {
    iconBg: string;
    border: string;
    text: string;
    bg: string;
  }

  const getColorClasses = (color: string): ColorClasses => {
    const colors: Record<string, ColorClasses> = {
      purple: {
        iconBg: "bg-gradient-to-br from-purple-500 to-purple-600",
        border: "border-purple-200",
        text: "text-purple-700",
        bg: "bg-purple-50",
      },
      emerald: {
        iconBg: "bg-gradient-to-br from-emerald-500 to-emerald-600",
        border: "border-emerald-200",
        text: "text-emerald-700",
        bg: "bg-emerald-50",
      },
      amber: {
        iconBg: "bg-gradient-to-br from-amber-500 to-amber-600",
        border: "border-amber-200",
        text: "text-amber-700",
        bg: "bg-amber-50",
      },
    };
    return colors[color] || colors.emerald;
  };

  return (
    <div className="space-y-4">
      {/* Welcome Section - Nexus Style */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 mb-1">
            Welcome back, {user?.name?.split(" ")[0] || "Admin"}
          </h1>
          <p className="text-sm text-slate-600">Here's what's happening with your business today</p>
        </div>
        <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-white rounded-lg border border-slate-200 shadow-sm">
          <Home size={16} className="text-slate-500" />
          <span className="text-sm text-slate-600">Dashboard</span>
        </div>
      </div>

      {/* Metrics Grid - Nexus Style Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric, index) => {
          const Icon = metric.icon;
          const colorClasses = getColorClasses(metric.color);
          
          return (
            <div
              key={index}
              className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-all duration-200 group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-lg ${colorClasses.iconBg} shadow-sm`}>
                  <Icon className="text-white" size={20} strokeWidth={2.5} />
                </div>
                {metric.change && (
                  <div className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs font-semibold ${
                    metric.isPositive 
                      ? "bg-emerald-50 text-emerald-700" 
                      : "bg-red-50 text-red-700"
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
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">
                  {metric.title}
                </p>
                <p className="text-2xl font-bold text-slate-900">{metric.value}</p>
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
        })}
      </div>

      {/* Recent Activity & Alerts - Nexus Style */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Recent Orders */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Recent Orders</h2>
              <p className="text-xs text-slate-500 mt-0.5">Latest customer orders</p>
            </div>
            <Link 
              href="/admin/orders" 
              className="text-sm font-medium text-emerald-600 hover:text-emerald-700 transition-colors"
            >
              View all →
            </Link>
          </div>
          <div className="space-y-2">
            {stats?.recentOrders && stats.recentOrders.length > 0 ? (
              stats.recentOrders.slice(0, 5).map((order: Order) => (
                <Link
                  key={order._id}
                  href={`/admin/orders/${order._id}`}
                  className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-100 hover:border-emerald-200 hover:bg-emerald-50/50 transition-all duration-200 group"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-900 truncate group-hover:text-emerald-700 transition-colors">
                      {order.user?.name || order.guestInfo?.name || "Guest"}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5 font-mono">
                      #{order.invoiceNumber || order._id?.slice(-8)}
                    </p>
                  </div>
                  <div className="text-right ml-4">
                    <p className="text-sm font-bold text-slate-900">
                      ৳{order.totalPrice?.toLocaleString() || 0}
                    </p>
                    <p className="text-xs text-slate-500">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </Link>
              ))
            ) : (
              <div className="text-center py-10 text-slate-500">
                <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-slate-100 flex items-center justify-center">
                  <Activity size={20} className="opacity-50" />
                </div>
                <p className="text-sm font-medium">No recent orders</p>
                <p className="text-xs mt-1">Orders will appear here</p>
              </div>
            )}
          </div>
        </div>

        {/* Stock Alerts */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Stock Alerts</h2>
              <p className="text-xs text-slate-500 mt-0.5">Products needing attention</p>
            </div>
            <Link 
              href="/admin/products" 
              className="text-sm font-medium text-emerald-600 hover:text-emerald-700 transition-colors"
            >
              View all →
            </Link>
          </div>
          <div className="space-y-2">
            {stats?.lowStockProducts && stats.lowStockProducts.length > 0 ? (
              stats.lowStockProducts.map((product: Product) => (
                <Link
                  key={product._id}
                  href={`/admin/products/${product._id}`}
                  className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-100 hover:border-red-200 hover:bg-red-50/50 transition-all duration-200 group"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-900 truncate group-hover:text-red-700 transition-colors">
                      {product.name}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {product.stock === 0 ? "Out of stock" : `${product.stock} units left`}
                    </p>
                  </div>
                  <div className={`ml-4 px-2.5 py-1 rounded-md text-xs font-bold ${
                    product.stock === 0
                      ? "bg-red-500 text-white"
                      : "bg-amber-500 text-white"
                  }`}>
                    {product.stock === 0 ? "Critical" : "Low"}
                  </div>
                </Link>
              ))
            ) : (
              <div className="text-center py-10 text-slate-500">
                <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-emerald-100 flex items-center justify-center">
                  <Package size={20} className="text-emerald-600" />
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
