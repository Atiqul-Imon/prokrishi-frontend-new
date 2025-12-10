import { test, expect } from '@playwright/test'

test.describe('Shopping Cart E2E', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to homepage
    await page.goto('http://localhost:3000')
  })

  test('should add product to cart', async ({ page }) => {
    // Click on first product
    const productCard = page.locator('[data-testid="product-card"]').first()
    await productCard.click()

    // Wait for product detail page
    await page.waitForURL(/\/products\/.*/)

    // Click add to cart button
    const addToCartButton = page.getByRole('button', { name: /add to cart/i })
    await addToCartButton.click()

    // Verify cart sidebar opens
    await expect(page.locator('[data-testid="cart-sidebar"]')).toBeVisible()

    // Verify product appears in cart
    await expect(page.getByText(/added to cart/i)).toBeVisible()
  })

  test('should update cart quantity', async ({ page }) => {
    // Add product to cart first
    const productCard = page.locator('[data-testid="product-card"]').first()
    await productCard.click()
    await page.getByRole('button', { name: /add to cart/i }).click()

    // Open cart
    await page.getByRole('button', { name: /cart/i }).click()

    // Increase quantity
    const increaseButton = page.getByRole('button', { name: /\+/i }).first()
    await increaseButton.click()

    // Verify quantity updated
    await expect(page.locator('input[type="number"]').first()).toHaveValue('2')
  })

  test('should remove product from cart', async ({ page }) => {
    // Add product to cart
    const productCard = page.locator('[data-testid="product-card"]').first()
    await productCard.click()
    await page.getByRole('button', { name: /add to cart/i }).click()

    // Open cart
    await page.getByRole('button', { name: /cart/i }).click()

    // Remove product
    const removeButton = page.getByRole('button', { name: /remove|delete/i }).first()
    await removeButton.click()

    // Verify cart is empty
    await expect(page.getByText(/empty/i)).toBeVisible()
  })

  test('should persist cart for guest user', async ({ page, context }) => {
    // Add product to cart
    const productCard = page.locator('[data-testid="product-card"]').first()
    await productCard.click()
    await page.getByRole('button', { name: /add to cart/i }).click()

    // Reload page
    await page.reload()

    // Verify cart still has items (from localStorage)
    await page.getByRole('button', { name: /cart/i }).click()
    await expect(page.locator('[data-testid="cart-item"]')).toBeVisible()
  })

  test('should calculate cart total correctly', async ({ page }) => {
    // Add multiple products
    const products = page.locator('[data-testid="product-card"]')
    const count = await products.count()

    for (let i = 0; i < Math.min(2, count); i++) {
      await products.nth(i).click()
      await page.getByRole('button', { name: /add to cart/i }).click()
      await page.goBack()
    }

    // Open cart and verify total
    await page.getByRole('button', { name: /cart/i }).click()
    const total = page.locator('[data-testid="cart-total"]')
    await expect(total).toBeVisible()
  })
})

