"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCart } from "@/app/context/CartContext";
import { ShoppingCart } from "lucide-react";

export default function FloatingCartButton() {
  const { cartCount, cartTotal } = useCart();
  const pathname = usePathname();

  // Don't show on mobile or in admin panel
  if (pathname?.startsWith("/admin")) {
    return null;
  }

  return (
    <Link
      href="/cart"
      className="fixed right-4 md:right-6 top-1/2 -translate-y-1/2 z-40 hidden md:block"
      aria-label="Open cart"
    >
      <div className="flex flex-col rounded-xl overflow-hidden shadow-2xl border border-emerald-100 bg-white hover:shadow-emerald-200/70 transition">
        <div className="px-3 py-2 flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white">
          <div className="h-8 w-8 rounded-lg bg-white/20 grid place-items-center">
            <ShoppingCart className="w-4 h-4" />
          </div>
          <div className="text-sm font-semibold">Cart</div>
          <div className="ml-auto text-xs bg-amber-500 text-white px-2 py-1 rounded-full font-bold">
            {cartCount}
          </div>
        </div>
        <div className="px-3 py-2 text-sm font-semibold text-emerald-800 bg-amber-50">
          ৳{cartTotal.toLocaleString()}
        </div>
      </div>
    </Link>
  );
}

