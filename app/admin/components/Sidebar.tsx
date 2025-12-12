"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Users,
  Tag,
  BarChart3,
  Settings,
  User,
  Home,
  Image,
  X,
  Fish,
  ShoppingCart,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

const navItems = [
  { label: "Overview", href: "/admin", icon: LayoutDashboard },
  { label: "Products", href: "/admin/products", icon: Package },
  { label: "Orders", href: "/admin/orders", icon: ShoppingBag },
  { label: "Customers", href: "/admin/customers", icon: Users },
  { label: "Categories", href: "/admin/categories", icon: Tag },
  { label: "Media", href: "/admin/media", icon: Image },
  { label: "Analytics", href: "/admin/reports", icon: BarChart3 },
];

const fishNavItems = [
  { label: "Fish Products", href: "/admin/fish/products", icon: Fish },
  { label: "Fish Orders", href: "/admin/fish/orders", icon: ShoppingCart },
];

const bottomNavItems = [
  { label: "Settings", href: "/admin/settings", icon: Settings },
  { label: "Profile", href: "/admin/profile", icon: User },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AdminSidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const [fishSectionOpen, setFishSectionOpen] = useState(true);

  const sidebarContent = (
    <>
      {/* Logo Section - Enhanced */}
      <div className="px-6 py-6 border-b border-slate-700/50 bg-gradient-to-br from-slate-900 to-slate-800">
        <Link href="/admin" className="flex items-center gap-3 group">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-600 flex items-center justify-center shadow-xl shadow-emerald-500/20 transition-all duration-300 group-hover:scale-110 group-hover:shadow-2xl group-hover:shadow-emerald-500/30">
            <span className="text-white font-bold text-xl">P</span>
          </div>
          <div className="flex flex-col">
            <span className="text-base font-bold text-white tracking-tight">Prokrishi</span>
            <span className="text-xs text-slate-300 font-medium">Admin Panel</span>
          </div>
        </Link>
      </div>

      {/* Main Navigation - Enhanced */}
      <nav className="flex-1 px-4 py-6 overflow-y-auto">
        <div className="space-y-1.5">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (pathname?.startsWith(item.href + "/") && item.href !== "/admin");
            
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                title={item.label}
                className={`group relative flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-semibold transition-all duration-300 ${
                  isActive
                    ? "bg-gradient-to-r from-emerald-600 to-emerald-500 text-white shadow-lg shadow-emerald-500/30 scale-[1.02]"
                    : "text-slate-200 hover:bg-slate-800/70 hover:text-white hover:scale-[1.01]"
                }`}
              >
                <item.icon 
                  size={20} 
                  className={`transition-all duration-300 ${
                    isActive 
                      ? "text-white scale-110" 
                      : "text-slate-300 group-hover:text-white group-hover:scale-110"
                  }`}
                />
                <span className="flex-1">{item.label}</span>
                {isActive && (
                  <>
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-8 bg-white rounded-r-full shadow-lg"></div>
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-emerald-400/20 to-transparent"></div>
                  </>
                )}
              </Link>
            );
          })}
        </div>

        {/* Fish Section - Collapsible */}
        <div className="mt-6 pt-6 border-t border-slate-700/50">
          <button
            onClick={() => setFishSectionOpen(!fishSectionOpen)}
            className="w-full flex items-center justify-between px-4 py-3 mb-3 rounded-xl text-xs font-bold text-slate-300 uppercase tracking-wider hover:bg-slate-800/50 hover:text-white transition-all duration-200 group"
            title="Toggle Fish Section"
          >
            <span className="flex items-center gap-2">
              <Fish size={16} className="text-teal-400 group-hover:text-teal-300 transition-colors" />
              <span>Fish</span>
            </span>
            {fishSectionOpen ? (
              <ChevronUp size={16} className="text-slate-400 group-hover:text-white transition-all duration-200" />
            ) : (
              <ChevronDown size={16} className="text-slate-400 group-hover:text-white transition-all duration-200" />
            )}
          </button>
          {fishSectionOpen && (
            <div className="space-y-1.5 transition-all duration-300 ease-out">
              {fishNavItems.map((item) => {
                const isActive = pathname === item.href || pathname?.startsWith(item.href + "/");
                
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onClose}
                    title={item.label}
                    className={`group relative flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-semibold transition-all duration-300 ${
                      isActive
                        ? "bg-gradient-to-r from-teal-600 to-teal-500 text-white shadow-lg shadow-teal-500/30 scale-[1.02]"
                        : "text-slate-200 hover:bg-slate-800/70 hover:text-white hover:scale-[1.01]"
                    }`}
                  >
                    <item.icon 
                      size={20} 
                      className={`transition-all duration-300 ${
                        isActive 
                          ? "text-white scale-110" 
                          : "text-slate-300 group-hover:text-white group-hover:scale-110"
                      }`}
                    />
                    <span className="flex-1">{item.label}</span>
                    {isActive && (
                      <>
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-8 bg-white rounded-r-full shadow-lg"></div>
                        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-teal-400/20 to-transparent"></div>
                      </>
                    )}
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </nav>

      {/* Bottom Navigation - Enhanced */}
      <div className="px-4 py-4 border-t border-slate-700/50 space-y-1.5 bg-gradient-to-t from-slate-900 to-slate-800/50">
        {bottomNavItems.map((item) => {
          const isActive = pathname === item.href || pathname?.startsWith(item.href + "/");
          
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              title={item.label}
              className={`group relative flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-semibold transition-all duration-300 ${
                isActive
                  ? "bg-gradient-to-r from-purple-600 to-purple-500 text-white shadow-lg shadow-purple-500/30 scale-[1.02]"
                  : "text-slate-200 hover:bg-slate-800/70 hover:text-white hover:scale-[1.01]"
              }`}
            >
              <item.icon 
                size={20} 
                className={`transition-all duration-300 ${
                  isActive 
                    ? "text-white scale-110" 
                    : "text-slate-300 group-hover:text-white group-hover:scale-110"
                }`}
              />
              <span className="flex-1">{item.label}</span>
              {isActive && (
                <>
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-8 bg-white rounded-r-full shadow-lg"></div>
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-400/20 to-transparent"></div>
                </>
              )}
            </Link>
          );
        })}
        <Link
          href="/"
          title="Back to Site"
          className="group flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-semibold text-slate-200 hover:bg-slate-800/70 hover:text-white transition-all duration-300 hover:scale-[1.01] mt-2"
        >
          <Home size={20} className="text-slate-300 group-hover:text-white group-hover:scale-110 transition-all duration-300" />
          <span>Back to Site</span>
        </Link>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Mobile Sidebar - Enhanced */}
      <aside
        className={`fixed inset-y-0 left-0 w-64 bg-gradient-to-b from-slate-900 via-slate-900 to-slate-800 border-r border-slate-700/50 z-50 transform transition-transform duration-300 ease-out lg:hidden flex flex-col shadow-2xl ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700/50 bg-gradient-to-r from-slate-900 to-slate-800 lg:hidden">
          <span className="text-sm font-bold text-white tracking-tight">Menu</span>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-300 hover:bg-slate-800/70 hover:text-white transition-all duration-200 hover:scale-110"
            title="Close Menu"
            aria-label="Close sidebar"
          >
            <X size={20} />
          </button>
        </div>
        {sidebarContent}
      </aside>

      {/* Desktop Sidebar - Enhanced */}
      <aside className="hidden lg:flex fixed inset-y-0 left-0 w-64 bg-gradient-to-b from-slate-900 via-slate-900 to-slate-800 border-r border-slate-700/50 z-30 flex flex-col shadow-2xl">
        {sidebarContent}
      </aside>
    </>
  );
}
