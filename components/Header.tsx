"use client";

import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import { Search, ShoppingBag, User, Menu, X, Settings, ChevronDown, Package, LogOut } from "lucide-react";
import { useAuth } from "@/app/context/AuthContext";
import { useCart } from "@/app/context/CartContext";
import { searchProducts } from "@/app/utils/api";
import { Product } from "@/types/models";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAdmin, logout } = useAuth();
  const { cartCount, addToCart } = useCart();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [scrolled, setScrolled] = useState(false);
  const [swipeStart, setSwipeStart] = useState<{ x: number; y: number } | null>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  // Track scroll for header styling
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Debounce search - works on all devices
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery.trim().length >= 2) {
        performSearch();
      } else {
        setSearchResults([]);
        if (window.innerWidth >= 1024) {
          setShowDropdown(false);
        }
      }
    }, 300);
    return () => clearTimeout(timeoutId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
        setIsSearchFocused(false);
      }
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target as Node)
      ) {
        setShowUserMenu(false);
      }
      // Close mobile menu on outside click (backdrop)
      if (
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(event.target as Node) &&
        showMobileMenu
      ) {
        // Only close if clicking on backdrop, not on menu itself
        const target = event.target as HTMLElement;
        if (target.classList.contains('xl:hidden') && target.classList.contains('fixed')) {
          setShowMobileMenu(false);
        }
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showMobileMenu]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (showMobileMenu) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [showMobileMenu]);

  // Swipe-to-close handler for mobile menu
  const handleTouchStart = (e: React.TouchEvent) => {
    if (!showMobileMenu) return;
    const touch = e.touches[0];
    setSwipeStart({ x: touch.clientX, y: touch.clientY });
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!showMobileMenu || !swipeStart || !mobileMenuRef.current) return;
    const touch = e.touches[0];
    const deltaX = touch.clientX - swipeStart.x;
    const deltaY = touch.clientY - swipeStart.y;

    // Only handle horizontal swipes (right swipe to close)
    if (Math.abs(deltaX) > Math.abs(deltaY) && deltaX > 50) {
      const menu = mobileMenuRef.current;
      const translateX = Math.min(deltaX, menu.offsetWidth);
      menu.style.transform = `translateX(${translateX}px)`;
      menu.style.opacity = `${1 - translateX / menu.offsetWidth}`;
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!showMobileMenu || !swipeStart || !mobileMenuRef.current) return;
    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - swipeStart.x;
    const menu = mobileMenuRef.current;

    // If swiped more than 30% of menu width, close it
    if (deltaX > menu.offsetWidth * 0.3) {
      setShowMobileMenu(false);
    } else {
      // Snap back
      menu.style.transform = "";
      menu.style.opacity = "";
    }
    setSwipeStart(null);
  };

  const performSearch = useCallback(async () => {
    if (!searchQuery.trim()) return;
    setLoading(true);
    try {
      const data = await searchProducts({
        search: searchQuery.trim(),
        limit: 6,
      });
      setSearchResults(data.products || []);
      setShowDropdown(true);
      setSelectedIndex(-1);
    } catch (error) {
      console.error("Search error:", error);
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  }, [searchQuery]);

  const handleSearch = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (searchQuery.trim()) {
        router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
        setSearchQuery("");
        setShowDropdown(false);
        setIsSearchFocused(false);
      }
    },
    [searchQuery, router]
  );

  const handleResultClick = useCallback(
    (product: Product) => {
      if (product?._id) {
        router.push(`/products/${product._id}`);
        setSearchQuery("");
        setShowDropdown(false);
        setIsSearchFocused(false);
      }
    },
    [router]
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showDropdown) return;
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < searchResults.length - 1 ? prev + 1 : prev
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case "Enter":
        e.preventDefault();
        if (selectedIndex >= 0 && searchResults[selectedIndex]) {
          handleResultClick(searchResults[selectedIndex]);
        } else {
          handleSearch(e);
        }
        break;
      case "Escape":
        setShowDropdown(false);
        setIsSearchFocused(false);
        break;
    }
  };

  const navLinks = useMemo(
    () => [
      { href: "/", label: "Home" },
      { href: "/products", label: "Products" },
      { href: "/about", label: "About" },
      { href: "/contact", label: "Contact" },
    ],
    []
  );

  return (
    <>
      <header
        id="main-navigation"
        role="banner"
        className={`fixed top-0 left-0 right-0 z-[100] w-full transition-all duration-300 ${
          scrolled
            ? "bg-white/95 backdrop-blur-lg shadow-lg border-b border-gray-100"
            : "bg-white/90 backdrop-blur-sm shadow-sm border-b border-gray-50"
        }`}
      >
        <div className="w-full mx-auto px-4 lg:px-6 xl:max-w-[85%] 2xl:max-w-[60%]">
          <div className="flex items-center justify-between h-16 gap-2">
            {/* Left: Logo */}
            <Link href="/" className="flex items-center flex-shrink-0 group focus:outline-none focus:ring-0 focus:border-0">
              <div className="relative h-14 md:h-16 w-auto">
                <Image
                  src="/logo/prokrishihublogo.png"
                  alt="ProKrishi Logo"
                  width={200}
                  height={64}
                  className="h-14 md:h-16 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
                  priority
                />
              </div>
            </Link>

            {/* Center: Desktop Navigation */}
            <nav className="hidden xl:flex items-center gap-0 flex-1 justify-center">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`relative px-2.5 py-1.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
                      isActive
                        ? "text-[var(--primary-green)]"
                        : "text-gray-700 hover:text-gray-900"
                    }`}
                  >
                    {link.label}
                    {isActive && (
                      <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-6 h-0.5 bg-[var(--primary-green)] rounded-full" />
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* Right: Search, Actions */}
            <div className="flex items-center gap-2 md:gap-4 lg:gap-6 flex-shrink-0">
              {/* Search Bar - Desktop */}
              <div
                className={`hidden lg:block relative transition-all duration-300 ${
                  isSearchFocused ? "w-80" : "w-64"
                }`}
                ref={searchRef}
              >
                <form onSubmit={handleSearch} className="relative">
                  <div
                    className={`relative transition-all duration-300 ${
                      isSearchFocused || showDropdown
                        ? "shadow-lg shadow-green-100/50"
                        : "shadow-sm"
                    }`}
                  >
                    <div className={`absolute left-4 top-1/2 transform -translate-y-1/2 transition-colors duration-200 ${
                      isSearchFocused ? "text-[var(--primary-green)]" : "text-gray-400"
                    }`}>
                      <Search className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      placeholder="Search products..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={handleKeyDown}
                      onFocus={() => {
                        setIsSearchFocused(true);
                        if (searchResults.length > 0) setShowDropdown(true);
                      }}
                      onBlur={() => {
                        // Delay to allow click on dropdown items
                        setTimeout(() => {
                          if (!showDropdown) {
                            setIsSearchFocused(false);
                          }
                        }, 200);
                      }}
                      className="w-full pl-10 pr-10 py-2 bg-white rounded-xl focus:outline-none text-sm placeholder:text-gray-400 transition-all duration-300 hover:shadow-md focus:shadow-lg focus:shadow-green-100/50"
                      style={{
                        boxShadow: isSearchFocused 
                          ? "0 4px 20px rgba(15, 157, 88, 0.15)" 
                          : "0 2px 8px rgba(0, 0, 0, 0.08)"
                      }}
                    />
                    {loading && (
                      <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                        <div className="w-4 h-4 border-2 border-[var(--primary-green)] border-t-transparent rounded-full animate-spin" />
                      </div>
                    )}
                    {!loading && searchQuery && (
                      <button
                        type="button"
                        onClick={() => {
                          setSearchQuery("");
                          setShowDropdown(false);
                          setIsSearchFocused(false);
                        }}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full p-1 transition-all duration-200"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  {/* Enhanced Search Dropdown */}
                  {showDropdown && (searchResults.length > 0 || searchQuery.trim().length >= 2) && (
                    <Card
                      ref={dropdownRef}
                      padding="none"
                      variant="elevated"
                      className="absolute top-full mt-3 w-full shadow-2xl z-50 overflow-hidden"
                      id="search-results"
                      role="listbox"
                      aria-label="Search results"
                    >
                      {loading ? (
                        <div className="p-8 text-center">
                          <div className="inline-block w-6 h-6 border-2 border-[var(--primary-green)] border-t-transparent rounded-full animate-spin" />
                          <p className="text-sm text-gray-500 mt-3">Searching...</p>
                        </div>
                      ) : searchResults.length > 0 ? (
                        <>
                          <div className="p-3 bg-gradient-to-r from-green-50 to-amber-50 border-b border-gray-100">
                            <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                              Search Results
                            </p>
                          </div>
                          <div className="max-h-96 overflow-y-auto">
                            {searchResults.map((product, index) => (
                              <div
                                key={product._id}
                                role="option"
                                aria-selected={index === selectedIndex}
                                className={`w-full px-4 py-4 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-b-0 ${
                                  index === selectedIndex ? "bg-green-50" : ""
                                }`}
                              >
                                <div className="flex items-center gap-4">
                                  <button
                                    onClick={() => handleResultClick(product)}
                                    className="flex items-center gap-4 flex-1 min-w-0 text-left"
                                  >
                                    <div className="relative w-16 h-16 flex-shrink-0 rounded-xl overflow-hidden bg-gray-100 border border-gray-200">
                                      {product.image ? (
                                        <Image
                                          src={product.image}
                                          alt={product.name}
                                          fill
                                          sizes="64px"
                                          className="object-cover"
                                        />
                                      ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                          <Package className="w-6 h-6 text-gray-400" />
                                        </div>
                                      )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <p className="font-semibold text-gray-900 truncate text-sm mb-1">
                                        {product.name}
                                      </p>
                                      <p className="text-sm font-bold text-[var(--primary-green)]">
                                        ৳{product.price?.toLocaleString()}
                                      </p>
                                    </div>
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      addToCart({ ...product, id: product._id }, 1);
                                    }}
                                    className="px-3 py-1.5 bg-emerald-600 text-white text-xs font-semibold rounded-md hover:bg-emerald-700 transition-colors flex-shrink-0 min-h-[32px] min-w-[60px]"
                                  >
                                    Add
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                          <div className="p-3 bg-gray-50 border-t border-gray-200">
                            <button
                              onClick={handleSearch}
                              className="w-full text-sm font-semibold text-[var(--primary-green)] hover:text-[var(--primary-green)]/80 py-2 transition-colors"
                            >
                              View all results for "{searchQuery}"
                            </button>
                          </div>
                        </>
                      ) : (
                        <div className="p-8 text-center">
                          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                            <Search className="w-6 h-6 text-gray-400" />
                          </div>
                          <p className="text-sm font-medium text-gray-600 mb-1">No products found</p>
                          <p className="text-xs text-gray-400">Try different keywords</p>
                        </div>
                      )}
                    </Card>
                  )}
                </form>
              </div>

              {/* Mobile Search Button */}
              <button
                onClick={() => setShowMobileSearch(true)}
                className="lg:hidden p-2 text-gray-600 hover:text-[var(--primary-green)] hover:bg-gray-50 rounded-lg transition-all duration-200"
                aria-label="Search"
              >
                <Search className="w-5 h-5" />
              </button>

              {/* Cart Button */}
              <Link
                href="/cart"
                className="relative p-2 text-gray-600 hover:text-[var(--primary-green)] hover:bg-gray-50 rounded-lg transition-all duration-200 group"
              >
                <ShoppingBag className="w-5 h-5 transition-transform duration-200 group-hover:scale-110" />
                {cartCount > 0 && (
                  <span className={`absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center shadow-lg animate-pulse ${
                    cartCount > 9 
                      ? "px-1.5 py-0.5 min-w-[24px] h-6" 
                      : "h-5 w-5"
                  }`}>
                    {cartCount}
                  </span>
                )}
              </Link>

              {/* User Menu */}
              {user ? (
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg hover:bg-gray-50 transition-all duration-200 group"
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[var(--primary-green)] to-green-600 text-white flex items-center justify-center text-xs font-bold shadow-md group-hover:shadow-lg transition-shadow">
                      {user.name?.charAt(0).toUpperCase() || "U"}
                    </div>
                    <ChevronDown
                      className={`hidden xl:block w-4 h-4 text-gray-400 transition-transform duration-200 ${
                        showUserMenu ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {/* User Dropdown Menu */}
                  {showUserMenu && (
                    <Card
                      padding="sm"
                      variant="elevated"
                      className="absolute right-0 mt-2 w-56 shadow-2xl z-50 animate-in fade-in slide-in-from-top-2"
                    >
                      <div className="py-2">
                        <div className="px-4 py-3 border-b border-gray-100 mb-2">
                          <p className="text-sm font-semibold text-gray-900 truncate">
                            {user.name}
                          </p>
                          <p className="text-xs text-gray-500 truncate">{user.email || user.phone}</p>
                        </div>
                        <Link
                          href="/account"
                          onClick={() => setShowUserMenu(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-green-50 hover:text-[var(--primary-green)] rounded-lg transition-colors"
                        >
                          <User className="w-4 h-4" />
                          My Account
                        </Link>
                        {isAdmin && (
                          <Link
                            href="/dashboard"
                            onClick={() => setShowUserMenu(false)}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-green-50 hover:text-[var(--primary-green)] rounded-lg transition-colors"
                          >
                            <Settings className="w-4 h-4" />
                            Dashboard
                          </Link>
                        )}
                        <div className="border-t border-gray-100 my-2" />
                        <button
                          onClick={() => {
                            logout();
                            setShowUserMenu(false);
                            router.push("/");
                          }}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <LogOut className="w-4 h-4" />
                          Logout
                        </button>
                      </div>
                    </Card>
                  )}
                </div>
              ) : (
                <Link href="/login">
                  <Button variant="primary" size="sm" className="hidden sm:flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Login
                  </Button>
                  <button className="sm:hidden p-2.5 text-gray-600 hover:text-[var(--primary-green)] hover:bg-gray-50 rounded-xl transition-all duration-200">
                    <User className="w-5 h-5" />
                  </button>
                </Link>
              )}

              {/* Mobile Menu Button */}
              <button
                onClick={() => setShowMobileMenu(true)}
                className="xl:hidden p-2.5 text-gray-600 hover:text-[var(--primary-green)] hover:bg-gray-50 rounded-xl transition-all duration-200"
                aria-label="Menu"
              >
                <Menu className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Enhanced Mobile Menu Drawer - Rendered via Portal */}
        {showMobileMenu && typeof window !== 'undefined' && createPortal(
          <div 
            className="xl:hidden fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm transition-opacity duration-300"
            onClick={() => setShowMobileMenu(false)}
            style={{ opacity: showMobileMenu ? 1 : 0 }}
          >
            <div 
              ref={mobileMenuRef}
              className="bg-white w-80 max-w-[85vw] h-full shadow-2xl overflow-y-auto transition-transform duration-300 ease-out"
              style={{ transform: showMobileMenu ? 'translateX(0)' : 'translateX(-100%)' }}
              onClick={(e) => e.stopPropagation()}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gradient-to-r from-green-50 to-amber-50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--primary-green)] to-green-600 text-white flex items-center justify-center text-sm font-bold">
                    {user?.name?.charAt(0).toUpperCase() || "P"}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      {user?.name || "Guest"}
                    </p>
                    <p className="text-xs text-gray-500">Menu</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowMobileMenu(false)}
                  className="p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center text-gray-600 hover:text-[var(--primary-green)] hover:bg-white rounded-lg transition-colors touch-manipulation active:scale-95"
                  aria-label="Close menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Navigation */}
              <nav className="py-4">
                {navLinks.map((link) => {
                  const isActive = pathname === link.href;
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setShowMobileMenu(false)}
                      className={`flex items-center gap-3 px-6 py-3.5 mx-2 rounded-xl transition-all duration-200 min-h-[44px] touch-manipulation active:scale-[0.98] ${
                        isActive
                          ? "bg-green-50 text-[var(--primary-green)] font-semibold"
                          : "text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      {link.label}
                    </Link>
                  );
                })}

                {isAdmin && (
                  <>
                    <div className="border-t border-gray-100 my-2 mx-4" />
                    <Link
                      href="/dashboard"
                      onClick={() => setShowMobileMenu(false)}
                      className="flex items-center gap-3 px-6 py-3.5 mx-2 rounded-xl text-[var(--primary-green)] hover:bg-green-50 transition-all duration-200 font-semibold"
                    >
                      <Settings className="w-5 h-5" />
                      Dashboard
                    </Link>
                  </>
                )}

                <div className="border-t border-gray-100 my-2 mx-4" />

                {user ? (
                  <>
                    <Link
                      href="/account"
                      onClick={() => setShowMobileMenu(false)}
                      className="flex items-center gap-3 px-6 py-3.5 mx-2 rounded-xl text-gray-700 hover:bg-gray-50 transition-all duration-200"
                    >
                      <User className="w-5 h-5" />
                      My Account
                    </Link>
                    <button
                      onClick={() => {
                        logout();
                        setShowMobileMenu(false);
                        router.push("/");
                      }}
                      className="w-full flex items-center gap-3 px-6 py-3.5 mx-2 rounded-xl text-red-600 hover:bg-red-50 transition-all duration-200 text-left"
                    >
                      <LogOut className="w-5 h-5" />
                      Logout
                    </button>
                  </>
                ) : (
                  <Link
                    href="/login"
                    onClick={() => setShowMobileMenu(false)}
                    className="flex items-center gap-3 px-6 py-3.5 mx-2 rounded-xl text-gray-700 hover:bg-gray-50 transition-all duration-200"
                  >
                    <User className="w-5 h-5" />
                    Login
                  </Link>
                )}
              </nav>
            </div>
          </div>,
          document.body
        )}

        {/* Mobile Search Modal */}
        {showMobileSearch && typeof window !== 'undefined' && createPortal(
          <div 
            className="lg:hidden fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm transition-opacity duration-300"
            onClick={() => {
              setShowMobileSearch(false);
              setShowDropdown(false);
            }}
          >
            <div 
              className="bg-white w-full h-full flex flex-col pb-16"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Mobile Search Header */}
              <div className="flex items-center gap-3 p-4 border-b border-gray-200 bg-white">
                <div className="flex-1 relative">
                  <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                    <Search className="w-5 h-5" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={handleKeyDown}
                    autoFocus
                    className="w-full pl-12 pr-12 py-3 bg-gray-50 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white text-base"
                  />
                  {loading && (
                    <div className="absolute right-12 top-1/2 transform -translate-y-1/2">
                      <div className="w-5 h-5 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
                    </div>
                  )}
                  {!loading && searchQuery && (
                    <button
                      type="button"
                      onClick={() => {
                        setSearchQuery("");
                        setSearchResults([]);
                        setShowDropdown(false);
                      }}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  )}
                </div>
                <button
                  onClick={() => {
                    setShowMobileSearch(false);
                    setShowDropdown(false);
                    setSearchQuery("");
                  }}
                  className="px-4 py-2 text-gray-700 font-medium min-h-[44px]"
                >
                  Cancel
                </button>
              </div>

              {/* Mobile Search Results */}
              <div className="flex-1 overflow-y-auto">
                {loading ? (
                  <div className="p-8 text-center">
                    <div className="inline-block w-8 h-8 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
                    <p className="text-sm text-gray-500 mt-4">Searching...</p>
                  </div>
                ) : searchResults.length > 0 ? (
                  <div className="p-4">
                    <div className="mb-4">
                      <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                        Search Results ({searchResults.length})
                      </p>
                    </div>
                    <div className="space-y-2">
                      {searchResults.map((product, index) => (
                        <div
                          key={product._id}
                          className={`w-full px-4 py-4 bg-white rounded-xl border border-gray-100 ${
                            index === selectedIndex ? "bg-green-50 border-emerald-200" : ""
                          }`}
                        >
                          <div className="flex items-center gap-4">
                            <button
                              onClick={() => {
                                handleResultClick(product);
                                setShowMobileSearch(false);
                              }}
                              className="flex items-center gap-4 flex-1 min-w-0 text-left"
                            >
                              <div className="relative w-20 h-20 flex-shrink-0 rounded-xl overflow-hidden bg-gray-100 border border-gray-200">
                                {product.image ? (
                                  <Image
                                    src={product.image}
                                    alt={product.name}
                                    fill
                                    sizes="80px"
                                    className="object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center">
                                    <Package className="w-8 h-8 text-gray-400" />
                                  </div>
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-semibold text-gray-900 text-base mb-1 line-clamp-2">
                                  {product.name}
                                </p>
                                <p className="text-base font-bold text-emerald-700">
                                  ৳{product.price?.toLocaleString()}
                                </p>
                              </div>
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                addToCart({ ...product, id: product._id }, 1);
                              }}
                              className="px-4 py-2 bg-emerald-600 text-white text-sm font-semibold rounded-md hover:bg-emerald-700 transition-colors flex-shrink-0 min-h-[40px] min-w-[70px]"
                            >
                              Add
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                    <button
                      onClick={() => {
                        handleSearch({ preventDefault: () => {} } as React.FormEvent);
                        setShowMobileSearch(false);
                      }}
                      className="w-full mt-4 px-4 py-3 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 transition-colors"
                    >
                      View all results for "{searchQuery}"
                    </button>
                  </div>
                ) : searchQuery.trim().length >= 2 ? (
                  <div className="p-8 text-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Search className="w-8 h-8 text-gray-400" />
                    </div>
                    <p className="text-base font-medium text-gray-600 mb-2">No products found</p>
                    <p className="text-sm text-gray-400">Try different keywords</p>
                  </div>
                ) : (
                  <div className="p-8 text-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Search className="w-8 h-8 text-gray-400" />
                    </div>
                    <p className="text-base font-medium text-gray-600 mb-2">Start typing to search</p>
                    <p className="text-sm text-gray-400">Type at least 2 characters</p>
                  </div>
                )}
              </div>
            </div>
          </div>,
          document.body
        )}
      </header>
    </>
  );
}
