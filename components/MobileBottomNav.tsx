"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCart } from "@/app/context/CartContext";
import { Home, Search, ShoppingCart, User } from "lucide-react";

export default function MobileBottomNav() {
  const pathname = usePathname();
  const { cartCount } = useCart();

  // Don't show on admin routes
  if (pathname?.startsWith("/admin")) {
    return null;
  }

  const navItems = [
    {
      href: "/",
      icon: Home,
      label: "Home",
      active: pathname === "/",
    },
    {
      href: "/search",
      icon: Search,
      label: "Search",
      active: pathname?.startsWith("/search"),
    },
    {
      href: "/cart",
      icon: ShoppingCart,
      label: "Cart",
      active: pathname === "/cart",
      badge: cartCount > 0 ? cartCount : null,
    },
    {
      href: "/account",
      icon: User,
      label: "Account",
      active: pathname?.startsWith("/account"),
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-lg md:hidden">
      <div className="flex items-center justify-around h-16">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.active;
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center flex-1 h-full relative ${
                isActive
                  ? "text-[var(--primary-green)]"
                  : "text-gray-600 hover:text-[var(--primary-green)]"
              } transition-colors`}
            >
              <div className="relative">
                <Icon className="w-6 h-6" />
                {item.badge && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                    {item.badge > 9 ? "9+" : item.badge}
                  </span>
                )}
              </div>
              <span className="text-xs font-medium mt-1">{item.label}</span>
              {isActive && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-1 bg-[var(--primary-green)] rounded-b-full" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

