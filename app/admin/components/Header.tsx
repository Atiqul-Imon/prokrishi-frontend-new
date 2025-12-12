"use client";

import { useState, useRef, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useRouter } from "next/navigation";
import { Menu, Search, Bell, User, LogOut, ChevronDown, Settings, X, Command } from "lucide-react";
import Link from "next/link";

interface HeaderProps {
  onToggleSidebar: () => void;
}

export default function AdminHeader({ onToggleSidebar }: HeaderProps) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setNotificationsOpen(false);
      }
    };

    // Keyboard shortcut for search (Cmd/Ctrl + K)
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === "k") {
        event.preventDefault();
        searchInputRef.current?.focus();
        setSearchFocused(true);
      }
      if (event.key === "Escape") {
        setSearchFocused(false);
        searchInputRef.current?.blur();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  return (
    <header className="sticky top-0 z-20 bg-white border-b border-slate-200 shadow-sm">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between gap-4">
          {/* Left Section */}
          <div className="flex items-center gap-4 flex-1">
            <button
              onClick={onToggleSidebar}
              className="lg:hidden p-2.5 rounded-xl text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-all duration-200 hover:scale-105"
              aria-label="Toggle sidebar"
              title="Toggle Sidebar"
            >
              <Menu size={20} />
            </button>

            {/* Enhanced Search */}
            <div className="relative flex-1 max-w-xl">
              <div className={`relative transition-all duration-300 ${
                searchFocused ? "scale-[1.02]" : ""
              }`}>
                <Search className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-200 ${
                  searchFocused ? "text-emerald-600" : "text-slate-400"
                }`} size={18} />
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search products, orders, customers..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setSearchFocused(true)}
                  onBlur={() => setSearchFocused(false)}
                  className="w-full pl-12 pr-24 py-3 bg-gradient-to-r from-slate-50 to-white border-2 border-slate-200 rounded-xl text-sm font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all duration-200 shadow-sm hover:shadow-md"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                  <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold text-slate-500 bg-slate-100 border border-slate-300 rounded-lg">
                    <Command size={12} />
                    <span>K</span>
                  </kbd>
                  {searchQuery && (
                    <button
                      onClick={() => {
                        setSearchQuery("");
                        searchInputRef.current?.focus();
                      }}
                      className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                      title="Clear search"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-3">
            {/* Enhanced Notifications */}
            <div className="relative" ref={notificationsRef}>
              <button
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className={`relative p-2.5 rounded-xl text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-all duration-200 hover:scale-105 ${
                  notificationsOpen ? "bg-slate-100 text-slate-900" : ""
                }`}
                aria-label="Notifications"
                title="Notifications"
              >
                <Bell size={20} />
                <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full border-2 border-white shadow-lg animate-pulse"></span>
              </button>

              {notificationsOpen && (
                <div className="absolute right-0 mt-3 w-96 bg-white border-2 border-slate-200 rounded-2xl shadow-2xl z-50 overflow-hidden transition-all duration-200">
                  <div className="p-5 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-white">
                    <div className="flex items-center justify-between">
                      <h3 className="text-base font-bold text-slate-900">Notifications</h3>
                      <button
                        onClick={() => setNotificationsOpen(false)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                        title="Close"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    <div className="p-12 text-center">
                      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
                        <Bell size={24} className="text-slate-400" />
                      </div>
                      <p className="text-sm font-semibold text-slate-700 mb-1">No new notifications</p>
                      <p className="text-xs text-slate-500">You're all caught up!</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Enhanced User Menu */}
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className={`flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-slate-100 transition-all duration-200 hover:scale-105 ${
                  userMenuOpen ? "bg-slate-100" : ""
                }`}
                title="User Menu"
              >
                <div className="relative">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-600 flex items-center justify-center shadow-lg ring-2 ring-white">
                    <span className="text-white text-sm font-bold">
                      {user?.name?.charAt(0).toUpperCase() || "A"}
                    </span>
                  </div>
                  <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full border-2 border-white shadow-sm"></span>
                </div>
                <div className="hidden sm:flex flex-col items-start">
                  <span className="text-sm font-semibold text-slate-900 leading-tight">
                    {user?.name?.split(" ")[0] || "Admin"}
                  </span>
                  <span className="text-xs text-slate-500 leading-tight">Administrator</span>
                </div>
                <ChevronDown size={18} className={`text-slate-500 hidden sm:block transition-transform duration-200 ${
                  userMenuOpen ? "rotate-180" : ""
                }`} />
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 mt-3 w-64 bg-white border-2 border-slate-200 rounded-2xl shadow-2xl z-50 overflow-hidden transition-all duration-200">
                  <div className="p-4 bg-gradient-to-r from-emerald-50 to-teal-50 border-b border-slate-200">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-600 flex items-center justify-center shadow-lg">
                        <span className="text-white text-base font-bold">
                          {user?.name?.charAt(0).toUpperCase() || "A"}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-slate-900 truncate">{user?.name || "Admin"}</p>
                        <p className="text-xs text-slate-600 truncate">{user?.email || ""}</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-2">
                    <Link
                      href="/admin/profile"
                      className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-slate-700 hover:bg-gradient-to-r hover:from-emerald-50 hover:to-teal-50 hover:text-emerald-700 transition-all duration-200 group"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <div className="p-2 rounded-lg bg-slate-100 group-hover:bg-emerald-100 transition-colors">
                        <User size={18} className="text-slate-600 group-hover:text-emerald-600 transition-colors" />
                      </div>
                      <span>Profile</span>
                    </Link>
                    <Link
                      href="/admin/settings"
                      className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-slate-700 hover:bg-gradient-to-r hover:from-purple-50 hover:to-violet-50 hover:text-purple-700 transition-all duration-200 group"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <div className="p-2 rounded-lg bg-slate-100 group-hover:bg-purple-100 transition-colors">
                        <Settings size={18} className="text-slate-600 group-hover:text-purple-600 transition-colors" />
                      </div>
                      <span>Settings</span>
                    </Link>
                    <div className="my-2 border-t border-slate-200"></div>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-red-600 hover:bg-gradient-to-r hover:from-red-50 hover:to-orange-50 transition-all duration-200 group"
                    >
                      <div className="p-2 rounded-lg bg-red-50 group-hover:bg-red-100 transition-colors">
                        <LogOut size={18} className="text-red-600 transition-colors" />
                      </div>
                      <span>Logout</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
