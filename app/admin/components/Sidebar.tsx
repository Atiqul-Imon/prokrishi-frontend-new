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
      {/* Logo Section - Minimal */}
      <div className="px-5 py-6">
        <Link href="/admin" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-slate-900 to-slate-700 dark:from-slate-100 dark:to-slate-300 flex items-center justify-center transition-transform group-hover:scale-105">
            <span className="text-white dark:text-slate-900 font-bold text-sm">P</span>
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">Prokrishi</span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Admin</span>
          </div>
        </Link>
      </div>

      {/* Main Navigation - Ultra Minimal */}
      <nav className="flex-1 px-3 py-2 overflow-y-auto">
        <div className="space-y-0.5">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (pathname?.startsWith(item.href + "/") && item.href !== "/admin");
            
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`group relative flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
                  isActive
                    ? "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-100"
                }`}
              >
                <item.icon 
                  size={18} 
                  className={isActive ? "text-slate-900 dark:text-slate-100" : "text-slate-500 dark:text-slate-500"}
                />
                <span>{item.label}</span>
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-slate-900 dark:bg-slate-100 rounded-r-full"></div>
                )}
              </Link>
            );
          })}
        </div>

        {/* Fish Section - Subtle Divider */}
        <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-800">
          <div className="px-3 mb-2">
            <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Fish</span>
          </div>
          <div className="space-y-0.5">
            {fishNavItems.map((item) => {
              const isActive = pathname === item.href || pathname?.startsWith(item.href + "/");
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className={`group relative flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
                    isActive
                      ? "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                      : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-100"
                  }`}
                >
                  <item.icon 
                    size={18} 
                    className={isActive ? "text-slate-900 dark:text-slate-100" : "text-slate-500 dark:text-slate-500"}
                  />
                  <span>{item.label}</span>
                  {isActive && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-slate-900 dark:bg-slate-100 rounded-r-full"></div>
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Bottom Navigation */}
      <div className="px-3 py-4 border-t border-slate-200 dark:border-slate-800 space-y-0.5">
        {bottomNavItems.map((item) => {
          const isActive = pathname === item.href || pathname?.startsWith(item.href + "/");
          
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={`group relative flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
                isActive
                  ? "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-100"
              }`}
            >
              <item.icon 
                size={18} 
                className={isActive ? "text-slate-900 dark:text-slate-100" : "text-slate-500 dark:text-slate-500"}
              />
              <span>{item.label}</span>
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-slate-900 dark:bg-slate-100 rounded-r-full"></div>
              )}
            </Link>
          );
        })}
        <Link
          href="/"
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-100 transition-all duration-150 mt-2"
        >
          <Home size={18} className="text-slate-500 dark:text-slate-500" />
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
        className={`fixed inset-y-0 left-0 w-64 bg-white dark:bg-slate-950 border-r border-slate-200 dark:border-slate-900 z-50 transform transition-transform duration-200 ease-out lg:hidden flex flex-col ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-900 lg:hidden">
          <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">Menu</span>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X size={18} />
          </button>
        </div>
        {sidebarContent}
      </aside>

      {/* Desktop Sidebar - Ultra Thin */}
      <aside className="hidden lg:flex fixed inset-y-0 left-0 w-56 bg-white dark:bg-slate-950 border-r border-slate-200 dark:border-slate-900 z-30 flex flex-col">
        {sidebarContent}
      </aside>
    </>
  );
}
