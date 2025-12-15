import type { ReactNode } from "react";
import type { User, CartItem, Product } from "./models";
import type { LoginRequest, RegisterRequest } from "./api";

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  isAdmin: boolean;
  login: (form: LoginRequest) => Promise<{ success: boolean; message?: string }>;
  register: (form: RegisterRequest) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  updateUser: (user: User) => void;
}

export interface CartContextType {
  cart: CartItem[];
  loading: boolean;
  syncing?: boolean;
  cartTotal: number;
  cartCount: number;
  addToCart: (product: Product, qty?: number, variantId?: string) => void;
  updateQuantity: (id: string, quantity: number, variantId?: string) => void;
  removeFromCart: (id: string, variantId?: string) => void;
  clearCart: () => Promise<void>;
  getItemDisplayQuantity: (item: CartItem) => { value: number; unit?: string; displayText: string };
  isSidebarOpen: boolean;
  openSidebar: () => void;
  closeSidebar: () => void;
}

export interface ProviderProps {
  children: ReactNode;
}

