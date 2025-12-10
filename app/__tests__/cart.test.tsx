import { render, screen, waitFor, act } from '@/__tests__/helpers/test-utils'
import { useCart } from '@/app/context/CartContext'
import { mockProduct } from '@/__tests__/helpers/test-utils'

// Mock the cart page component
const CartPage = () => {
  const { cart, addToCart, removeFromCart, updateQuantity } = useCart()

  return (
    <div>
      <h1>Cart</h1>
      {cart.length === 0 ? (
        <p>Your cart is empty</p>
      ) : (
        <ul>
          {cart.map((item) => (
            <li key={item._id}>
              {item.name} - Quantity: {item.quantity}
              <button onClick={() => updateQuantity(item._id, item.quantity + 1)}>
                Increase
              </button>
              <button onClick={() => removeFromCart(item._id)}>
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}
      <button onClick={() => addToCart(mockProduct, 1)}>
        Add Test Product
      </button>
    </div>
  )
}

describe('Cart Functionality', () => {
  it('displays empty cart message when cart is empty', () => {
    render(<CartPage />)
    expect(screen.getByText('Your cart is empty')).toBeInTheDocument()
  })

  it('adds product to cart', async () => {
    render(<CartPage />)
    const addButton = screen.getByText('Add Test Product')
    
    // Wrap in act() to avoid warnings
    await act(async () => {
      addButton.click()
    })

    // Text is split: "Test Product - Quantity: 1", so check for the list item containing both
    await waitFor(() => {
      const cartItem = screen.getByText((content, element) => {
        return element?.tagName.toLowerCase() === 'li' && 
               content.includes('Test Product') && 
               content.includes('Quantity:')
      })
      expect(cartItem).toBeInTheDocument()
    })
  })

  it('updates product quantity', async () => {
    render(<CartPage />)
    const addButton = screen.getByText('Add Test Product')
    
    await act(async () => {
      addButton.click()
    })

    // Wait for cart item to appear
    let initialQuantity: number
    await waitFor(() => {
      const cartItem = screen.getByText((content, element) => {
        return element?.tagName.toLowerCase() === 'li' && 
               element?.textContent?.includes('Test Product')
      })
      expect(cartItem).toBeInTheDocument()
      // Extract quantity from textContent
      const match = cartItem.textContent?.match(/Quantity:\s*(\d+)/)
      expect(match).toBeTruthy()
      initialQuantity = parseInt(match![1], 10)
      expect(initialQuantity).toBeGreaterThan(0)
    })

    // Click increase button
    const increaseButton = screen.getByText('Increase')
    await act(async () => {
      increaseButton.click()
    })

    // Check quantity increased by 1
    await waitFor(() => {
      const updatedCartItem = screen.getByText((content, element) => {
        return element?.tagName.toLowerCase() === 'li' && 
               element?.textContent?.includes('Test Product')
      })
      const match = updatedCartItem.textContent?.match(/Quantity:\s*(\d+)/)
      expect(match).toBeTruthy()
      const newQuantity = parseInt(match![1], 10)
      expect(newQuantity).toBe(initialQuantity! + 1)
    }, { timeout: 3000 })
  })

  it('removes product from cart', async () => {
    render(<CartPage />)
    const addButton = screen.getByText('Add Test Product')
    
    await act(async () => {
      addButton.click()
    })

    await waitFor(async () => {
      const removeButton = screen.getByText('Remove')
      await act(async () => {
        removeButton.click()
      })
    })

    await waitFor(() => {
      expect(screen.getByText('Your cart is empty')).toBeInTheDocument()
    })
  })
})

