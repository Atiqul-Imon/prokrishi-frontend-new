import React, { ReactElement } from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { CartProvider } from '@/app/context/CartContext'
import { AuthProvider } from '@/app/context/AuthContext'

// Custom render function that includes providers
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <AuthProvider>
      <CartProvider>
        {children}
      </CartProvider>
    </AuthProvider>
  )
}

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>,
) => render(ui, { wrapper: AllTheProviders, ...options })

// Re-export everything
export * from '@testing-library/react'
export { customRender as render }

// Mock data helpers
export const mockProduct = {
  _id: '1',
  name: 'Test Product',
  price: 100,
  description: 'Test description',
  image: '/test-image.jpg', // ProductCard uses 'image' not 'images'
  stock: 10,
  category: { _id: '1', name: 'Test Category', slug: 'test-category' },
  slug: 'test-product',
  status: 'active',
  hasVariants: false,
}

export const mockUser = {
  _id: '1',
  name: 'Test User',
  email: 'test@example.com',
  phone: '1234567890',
  role: 'customer',
}

export const mockCartItem = {
  ...mockProduct,
  id: '1',
  quantity: 2,
  totalMeasurement: 2,
}

