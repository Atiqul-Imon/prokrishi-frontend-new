import { test, expect } from '@playwright/test'

test.describe('Checkout Process E2E', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000')
    
    // Add product to cart
    const productCard = page.locator('[data-testid="product-card"]').first()
    await productCard.click()
    await page.getByRole('button', { name: /add to cart/i }).click()
  })

  test('should complete checkout flow', async ({ page }) => {
    // Go to cart
    await page.getByRole('button', { name: /cart/i }).click()
    await page.getByRole('link', { name: /checkout|proceed/i }).click()

    // Fill shipping address
    await page.fill('input[name="name"]', 'Test User')
    await page.fill('input[name="phone"]', '1234567890')
    await page.fill('textarea[name="address"]', '123 Test Street')
    await page.selectOption('select[name="division"]', 'Dhaka')
    await page.selectOption('select[name="district"]', 'Dhaka')
    await page.selectOption('select[name="upazila"]', 'Dhanmondi')

    // Verify COD is selected (only payment method)
    await expect(page.getByText(/cash on delivery|cod/i)).toBeVisible()

    // Place order
    const placeOrderButton = page.getByRole('button', { name: /place order|confirm/i })
    await placeOrderButton.click()

    // Verify order success
    await page.waitForURL(/\/order\/success/)
    await expect(page.getByText(/order.*success|thank you/i)).toBeVisible()
  })

  test('should validate required fields', async ({ page }) => {
    await page.getByRole('button', { name: /cart/i }).click()
    await page.getByRole('link', { name: /checkout/i }).click()

    // Try to submit without filling fields
    const placeOrderButton = page.getByRole('button', { name: /place order/i })
    await placeOrderButton.click()

    // Verify validation errors
    await expect(page.getByText(/required|please fill/i)).toBeVisible()
  })

  test('should display order summary correctly', async ({ page }) => {
    await page.getByRole('button', { name: /cart/i }).click()
    await page.getByRole('link', { name: /checkout/i }).click()

    // Verify order summary section
    await expect(page.getByText(/order summary|total/i)).toBeVisible()
    await expect(page.getByText(/subtotal|shipping|total/i)).toBeVisible()
  })

  test('should calculate shipping fee correctly', async ({ page }) => {
    await page.getByRole('button', { name: /cart/i }).click()
    await page.getByRole('link', { name: /checkout/i }).click()

    // Select shipping zone
    await page.selectOption('select[name="division"]', 'Dhaka')
    
    // Verify shipping fee is calculated
    await expect(page.getByText(/shipping.*fee|delivery.*charge/i)).toBeVisible()
  })
})

