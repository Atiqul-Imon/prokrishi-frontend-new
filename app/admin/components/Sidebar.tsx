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
  ChevronRight,
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
      {/* Logo Section - Nexus Style */}
      <div className="px-6 py-6 border-b border-emerald-800/30">
        <Link href="/admin" className="flex items-center gap-3 group">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/20 transition-all duration-300 group-hover:scale-105">
            <span className="text-white font-bold text-xl">P</span>
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-bold text-white tracking-tight">Prokrishi</span>
            <span className="text-xs text-emerald-200 font-medium">Admin Panel</span>
          </div>
        </Link>
      </div>

      {/* Main Navigation - Nexus Style */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto">
        <div className="space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (pathname?.startsWith(item.href + "/") && item.href !== "/admin");
            const Icon = item.icon;
            const hasSubmenu = false; // Can be extended for submenus
            
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                title={item.label}
                className={`group relative flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? "bg-emerald-500/20 text-white shadow-sm"
                    : "text-emerald-100 hover:bg-emerald-800/30 hover:text-white"
                }`}
                style={{ color: isActive ? '#ffffff' : '#d1fae5' }}
              >
                <div className="flex items-center gap-3 flex-1">
                  <Icon 
                    size={18} 
                    strokeWidth={2.5}
                    className="transition-all duration-200"
                    style={{ 
                      color: isActive ? '#ffffff' : '#d1fae5',
                      stroke: isActive ? '#ffffff' : '#d1fae5'
                    }}
                  />
                  <span className="flex-1" style={{ color: isActive ? '#ffffff' : '#d1fae5' }}>{item.label}</span>
                </div>
                {hasSubmenu && (
                  <ChevronRight 
                    size={16} 
                    strokeWidth={2}
                    style={{ color: isActive ? '#ffffff' : '#d1fae5' }}
                    className="opacity-60"
                  />
                )}
                {isActive && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-400 rounded-r-full"></div>
                )}
              </Link>
            );
          })}
        </div>

        {/* Fish Section - Collapsible */}
        <div className="mt-4 pt-4 border-t border-emerald-800/30">
          <button
            onClick={() => setFishSectionOpen(!fishSectionOpen)}
            className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium text-emerald-100 hover:bg-emerald-800/30 hover:text-white transition-all duration-200 group"
            title="Toggle Fish Section"
            style={{ color: '#d1fae5' }}
          >
            <div className="flex items-center gap-3">
              <Fish 
                size={18} 
                strokeWidth={2.5}
                style={{ color: '#5eead4', stroke: '#5eead4' }}
                className="group-hover:scale-110 transition-all duration-200"
              />
              <span>Fish</span>
            </div>
            {fishSectionOpen ? (
              <ChevronUp 
                size={16} 
                strokeWidth={2}
                style={{ color: '#d1fae5', stroke: '#d1fae5' }}
                className="opacity-60 group-hover:opacity-100 transition-all duration-200"
              />
            ) : (
              <ChevronDown 
                size={16} 
                strokeWidth={2}
                style={{ color: '#d1fae5', stroke: '#d1fae5' }}
                className="opacity-60 group-hover:opacity-100 transition-all duration-200"
              />
            )}
          </button>
          {fishSectionOpen && (
            <div className="mt-1 space-y-1 transition-all duration-300 ease-out">
              {fishNavItems.map((item) => {
                const isActive = pathname === item.href || pathname?.startsWith(item.href + "/");
                const Icon = item.icon;
                
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onClose}
                    title={item.label}
                    className={`group relative flex items-center gap-3 px-3 py-2.5 ml-6 rounded-lg text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? "bg-emerald-500/20 text-white shadow-sm"
                        : "text-emerald-100 hover:bg-emerald-800/30 hover:text-white"
                    }`}
                    style={{ color: isActive ? '#ffffff' : '#d1fae5' }}
                  >
                    <Icon 
                      size={18} 
                      strokeWidth={2.5}
                      className="transition-all duration-200"
                      style={{ 
                        color: isActive ? '#ffffff' : '#d1fae5',
                        stroke: isActive ? '#ffffff' : '#d1fae5'
                      }}
                    />
                    <span className="flex-1" style={{ color: isActive ? '#ffffff' : '#d1fae5' }}>{item.label}</span>
                    {isActive && (
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-400 rounded-r-full"></div>
                    )}
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </nav>

      {/* Bottom Navigation */}
      <div className="px-3 py-4 border-t border-emerald-800/30 space-y-1">
        {bottomNavItems.map((item) => {
          const isActive = pathname === item.href || pathname?.startsWith(item.href + "/");
          const Icon = item.icon;
          
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              title={item.label}
              className={`group relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                isActive
                  ? "bg-emerald-500/20 text-white shadow-sm"
                  : "text-emerald-100 hover:bg-emerald-800/30 hover:text-white"
              }`}
              style={{ color: isActive ? '#ffffff' : '#d1fae5' }}
            >
              <Icon 
                size={18} 
                strokeWidth={2.5}
                className="transition-all duration-200"
                style={{ 
                  color: isActive ? '#ffffff' : '#d1fae5',
                  stroke: isActive ? '#ffffff' : '#d1fae5'
                }}
              />
              <span className="flex-1" style={{ color: isActive ? '#ffffff' : '#d1fae5' }}>{item.label}</span>
              {isActive && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-400 rounded-r-full"></div>
              )}
            </Link>
          );
        })}
        <Link
          href="/"
          title="Back to Site"
          className="group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-emerald-100 hover:bg-emerald-800/30 hover:text-white transition-all duration-200 mt-2"
          style={{ color: '#d1fae5' }}
        >
          <Home 
            size={18} 
            strokeWidth={2.5}
            style={{ color: '#d1fae5', stroke: '#d1fae5' }}
            className="group-hover:scale-110 transition-all duration-200"
          />
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
        className={`fixed inset-y-0 left-0 w-64 bg-gradient-to-b from-emerald-900 via-emerald-900 to-emerald-950 border-r border-emerald-800/30 z-50 transform transition-transform duration-300 ease-out lg:hidden flex flex-col shadow-2xl ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-emerald-800/30 lg:hidden">
          <span className="text-sm font-bold text-white tracking-tight">Menu</span>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-emerald-800/30 transition-all duration-200"
            title="Close Menu"
            aria-label="Close sidebar"
          >
            <X 
              size={20} 
              strokeWidth={2.5}
              style={{ color: '#ffffff', stroke: '#ffffff' }}
            />
          </button>
        </div>
        {sidebarContent}
      </aside>

      {/* Desktop Sidebar - Nexus Dark Green Theme */}
      <aside className="hidden lg:flex fixed inset-y-0 left-0 w-64 bg-gradient-to-b from-emerald-900 via-emerald-900 to-emerald-950 border-r border-emerald-800/30 z-30 flex flex-col shadow-2xl">
        {sidebarContent}
      </aside>
    </>
  );
}
