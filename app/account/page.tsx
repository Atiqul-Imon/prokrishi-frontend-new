"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";
import {
  User,
  MapPin,
  ShoppingBag,
  Settings,
  Lock,
  Heart,
  LogOut,
  ShieldAlert,
} from "lucide-react";
import Orders from "./components/Orders";
import AddressBook from "./components/AddressBook";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import Link from "next/link";

const TABS = [
  {
    name: "Profile",
    icon: User,
    description: "Manage your personal information",
    color: "green",
  },
  {
    name: "Orders",
    icon: ShoppingBag,
    description: "View your order history",
    color: "amber",
  },
  {
    name: "Addresses",
    icon: MapPin,
    description: "Your delivery addresses",
    color: "blue",
  },
  {
    name: "Settings",
    icon: Settings,
    description: "Account preferences",
    color: "gray",
  },
];

export default function AccountPage() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("Orders");
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-[var(--primary-green)] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading account...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <ShieldAlert className="w-16 h-16 text-red-500 mb-4" />
        <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
        <p className="text-gray-600 mb-4">
          Please log in to view your account details.
        </p>
        <Link href="/login">
          <Button variant="primary">Go to Login</Button>
        </Link>
      </div>
    );
  }

  const handleTabClick = (name: string) => {
    if (name === "Logout") {
      setShowLogoutConfirm(true);
    } else {
      setActiveTab(name);
    }
  };

  const confirmLogout = () => {
    logout();
    setShowLogoutConfirm(false);
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="w-full mx-auto px-4 py-8 xl:max-w-[90%] 2xl:max-w-[70%]">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Account</h1>
          <p className="text-gray-600">
            Manage your profile, orders, and preferences
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <Card padding="md" variant="elevated">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Account Menu
              </h2>
              <nav className="space-y-2">
                {TABS.map(({ name, icon: Icon, description, color }) => {
                  const isActive = activeTab === name;
                  const colorClasses = {
                    green: isActive ? "bg-green-50 text-green-700 ring-2 ring-green-500" : "hover:bg-green-50/50",
                    amber: isActive ? "bg-amber-50 text-amber-700 ring-2 ring-amber-500" : "hover:bg-amber-50/50",
                    blue: isActive ? "bg-blue-50 text-blue-700 ring-2 ring-blue-500" : "hover:bg-blue-50/50",
                    gray: isActive ? "bg-gray-50 text-gray-700 ring-2 ring-gray-500" : "hover:bg-gray-50",
                  };
                  return (
                    <button
                      key={name}
                      className={`w-full flex items-start gap-3 p-4 rounded-xl text-left transition-all shadow-sm ${
                        isActive ? colorClasses[color as keyof typeof colorClasses] : "text-gray-700 hover:shadow-md"
                      }`}
                      onClick={() => handleTabClick(name)}
                    >
                      <Icon size={22} className="mt-0.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-base">{name}</div>
                        <div className="text-xs text-gray-600 mt-1">
                          {description}
                        </div>
                      </div>
                    </button>
                  );
                })}
                <button
                  className="w-full flex items-start gap-3 p-4 rounded-xl text-left transition-all hover:bg-red-50 text-red-700 shadow-sm hover:shadow-md"
                  onClick={() => setShowLogoutConfirm(true)}
                >
                  <LogOut size={22} className="mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-base">Logout</div>
                    <div className="text-xs text-gray-600 mt-1">
                      Sign out of your account
                    </div>
                  </div>
                </button>
              </nav>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <Card padding="lg" variant="elevated">
              {/* Tab Header */}
              <div className="bg-gradient-to-r from-green-50 via-amber-50 to-green-50 px-6 py-5 mb-6 rounded-xl shadow-sm">
                <div className="flex items-center gap-4">
                  {(() => {
                    const currentTab = TABS.find((t) => t.name === activeTab);
                    const Icon = currentTab?.icon;
                    return Icon ? (
                      <div className="w-12 h-12 rounded-lg bg-white flex items-center justify-center shadow-sm">
                        <Icon size={24} className="text-[var(--primary-green)]" />
                      </div>
                    ) : null;
                  })()}
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      {activeTab}
                    </h2>
                    <p className="text-sm text-gray-600 mt-1">
                      {TABS.find((t) => t.name === activeTab)?.description}
                    </p>
                  </div>
                </div>
              </div>

              {/* Tab Content */}
              <div>
                {activeTab === "Profile" && (
                  <div className="space-y-6">
                    <div className="flex items-center gap-5 pb-6 border-b border-gray-200">
                      <div className="w-20 h-20 rounded-full bg-gradient-to-br from-green-100 to-amber-100 flex items-center justify-center shadow-md">
                        <User className="w-10 h-10 text-[var(--primary-green)]" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-1">{user.name}</h3>
                        <p className="text-base text-gray-600">
                          {user.email || user.phone ? "Active Member" : "Member"}
                        </p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <Card padding="md" variant="default" className="bg-gradient-to-br from-gray-50 to-white">
                        <p className="text-sm font-medium text-gray-600 mb-2">Email Address</p>
                        <p className="text-lg font-semibold text-gray-900">{user.email || "Not provided"}</p>
                      </Card>
                      <Card padding="md" variant="default" className="bg-gradient-to-br from-gray-50 to-white">
                        <p className="text-sm font-medium text-gray-600 mb-2">Phone Number</p>
                        <p className="text-lg font-semibold text-gray-900">{user.phone || "Not provided"}</p>
                      </Card>
                    </div>
                  </div>
                )}
                {activeTab === "Orders" && <Orders />}
                {activeTab === "Addresses" && <AddressBook />}
                {activeTab === "Settings" && (
                  <div className="text-center py-12">
                    <Settings size={48} className="text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Settings
                    </h3>
                    <p className="text-gray-600">
                      Account settings and preferences coming soon.
                    </p>
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Logout Confirmation */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card padding="lg" className="max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Confirm Logout</h3>
            <p className="text-gray-600 mb-6">Are you sure you want to logout?</p>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={confirmLogout}
                className="flex-1"
              >
                Logout
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

