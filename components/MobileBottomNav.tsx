"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCart } from "@/app/context/CartContext";
import { Home, ShoppingBag, User } from "lucide-react";
import { triggerHaptic, HapticType } from "@/app/utils/haptics";

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
      href: "/cart",
      icon: ShoppingBag,
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
    <nav className="fixed bottom-0 left-0 right-0 z-[10000] bg-white border-t border-gray-200 shadow-lg md:hidden">
      <div className="flex items-center justify-around h-16">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.active;
          
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => triggerHaptic(HapticType.SELECTION)}
              className={`flex flex-col items-center justify-center flex-1 h-full relative min-h-[44px] touch-manipulation active:scale-95 ${
                isActive
                  ? "text-[var(--primary-green)]"
                  : "text-gray-600 hover:text-[var(--primary-green)]"
              } transition-all`}
            >
              <div className="relative">
                <Icon className="w-6 h-6" />
                {item.badge && (
                  <span className={`absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center animate-pulse ${
                    item.badge > 9 
                      ? "px-1.5 py-0.5 min-w-[24px] h-6" 
                      : "h-5 w-5"
                  }`}>
                    {item.badge}
                  </span>
                )}
              </div>
              <span className="text-xs font-medium mt-1">{item.label}</span>
              {isActive && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-1 bg-[var(--primary-green)] rounded-b-full transition-all" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

