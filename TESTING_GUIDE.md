# Testing Guide - Prokrishi Frontend

## 🚀 Quick Start

### Install Dependencies

```bash
npm install
```

### Run Tests

```bash
# Unit & Integration Tests
npm run test              # Watch mode
npm run test:ci          # CI mode with coverage
npm run test:coverage    # Generate coverage report

# E2E Tests
npm run test:e2e         # Run E2E tests
npm run test:e2e:ui      # Run with UI mode
npm run test:e2e:debug   # Debug mode

# All Tests
npm run test:all         # Run all tests
```

## 📝 Writing Tests

### Component Tests

```typescript
import { render, screen } from '@/__tests__/helpers/test-utils'
import MyComponent from '@/components/MyComponent'

describe('MyComponent', () => {
  it('renders correctly', () => {
    render(<MyComponent />)
    expect(screen.getByText('Hello')).toBeInTheDocument()
  })
})
```

### E2E Tests

```typescript
import { test, expect } from '@playwright/test'

test('user can add product to cart', async ({ page }) => {
  await page.goto('/')
  await page.click('[data-testid="product-card"]')
  await page.click('button:has-text("Add to Cart")')
  await expect(page.locator('[data-testid="cart"]')).toBeVisible()
})
```

## 🎯 Test Coverage Goals

- **Overall**: > 80%
- **Critical Paths**: 100%
- **Components**: > 75%
- **Utilities**: > 90%

## 📊 Current Coverage

Run `npm run test:coverage` to see current coverage.

## ✅ Pre-Commit Checklist

- [ ] All tests passing
- [ ] Coverage above threshold
- [ ] No console errors
- [ ] E2E tests passing

