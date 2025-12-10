import { render, screen } from '@/__tests__/helpers/test-utils'
import ProductCard from '../ProductCard'

const mockProduct = {
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

describe('ProductCard', () => {
  it('renders product name', () => {
    render(<ProductCard product={mockProduct} />)
    expect(screen.getByText('Test Product')).toBeInTheDocument()
  })

  it('renders product price', () => {
    render(<ProductCard product={mockProduct} />)
    expect(screen.getByText(/100/)).toBeInTheDocument()
  })

  it('renders product image', () => {
    render(<ProductCard product={mockProduct} />)
    const image = screen.getByAltText('Test Product')
    expect(image).toBeInTheDocument()
    expect(image).toHaveAttribute('src', '/test-image.jpg')
  })

  it('displays out of stock when stock is 0', () => {
    const outOfStockProduct = { ...mockProduct, stock: 0 }
    render(<ProductCard product={outOfStockProduct} />)
    expect(screen.getByText(/out of stock/i)).toBeInTheDocument()
  })

  it('links to product detail page', () => {
    render(<ProductCard product={mockProduct} />)
    // ProductCard has multiple links (image + title), both link to /products/_id
    const links = screen.getAllByRole('link')
    expect(links.length).toBeGreaterThan(0)
    // Both links should point to the product detail page using _id
    links.forEach(link => {
      expect(link).toHaveAttribute('href', '/products/1')
    })
  })
})

