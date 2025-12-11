"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
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

  const sidebarContent = (
    <>
      {/* Logo Section */}
      <div className="px-6 py-6 border-b border-slate-700/50">
        <Link href="/admin" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center shadow-lg transition-transform group-hover:scale-105">
            <span className="text-white font-bold text-lg">P</span>
          </div>
          <div className="flex flex-col">
            <span className="text-base font-bold text-white">Prokrishi</span>
            <span className="text-xs text-slate-400 font-medium">Admin Panel</span>
          </div>
        </Link>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 px-4 py-4 overflow-y-auto">
        <div className="space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (pathname?.startsWith(item.href + "/") && item.href !== "/admin");
            
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`group relative flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? "bg-green-600 text-white shadow-lg shadow-green-500/20"
                    : "text-slate-300 hover:bg-slate-800/50 hover:text-white"
                }`}
              >
                <item.icon 
                  size={20} 
                  className={isActive ? "text-white" : "text-slate-400 group-hover:text-white"}
                />
                <span>{item.label}</span>
                {isActive && (
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-white rounded-l-full"></div>
                )}
              </Link>
            );
          })}
        </div>

        {/* Fish Section */}
        <div className="mt-6 pt-6 border-t border-slate-700/50">
          <div className="px-4 mb-3">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Fish</span>
          </div>
          <div className="space-y-1">
            {fishNavItems.map((item) => {
              const isActive = pathname === item.href || pathname?.startsWith(item.href + "/");
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className={`group relative flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? "bg-green-600 text-white shadow-lg shadow-green-500/20"
                      : "text-slate-300 hover:bg-slate-800/50 hover:text-white"
                  }`}
                >
                  <item.icon 
                    size={20} 
                    className={isActive ? "text-white" : "text-slate-400 group-hover:text-white"}
                  />
                  <span>{item.label}</span>
                  {isActive && (
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-white rounded-l-full"></div>
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Bottom Navigation */}
      <div className="px-4 py-4 border-t border-slate-700/50 space-y-1">
        {bottomNavItems.map((item) => {
          const isActive = pathname === item.href || pathname?.startsWith(item.href + "/");
          
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={`group relative flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                isActive
                  ? "bg-green-600 text-white shadow-lg shadow-green-500/20"
                  : "text-slate-300 hover:bg-slate-800/50 hover:text-white"
              }`}
            >
              <item.icon 
                size={20} 
                className={isActive ? "text-white" : "text-slate-400 group-hover:text-white"}
              />
              <span>{item.label}</span>
              {isActive && (
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-white rounded-l-full"></div>
              )}
            </Link>
          );
        })}
        <Link
          href="/"
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-slate-300 hover:bg-slate-800/50 hover:text-white transition-all duration-200 mt-2"
        >
          <Home size={20} className="text-slate-400" />
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

      {/* Mobile Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 w-64 bg-slate-900 border-r border-slate-800 z-50 transform transition-transform duration-200 ease-out lg:hidden flex flex-col shadow-2xl ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700/50 lg:hidden">
          <span className="text-sm font-semibold text-white">Menu</span>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        {sidebarContent}
      </aside>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex fixed inset-y-0 left-0 w-64 bg-slate-900 border-r border-slate-800 z-30 flex flex-col shadow-2xl">
        {sidebarContent}
      </aside>
    </>
  );
}
