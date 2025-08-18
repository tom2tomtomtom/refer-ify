import { test, expect } from '@playwright/test'

test.describe('Subscription Management Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Login as a client user
    await page.goto('/login')
    await page.fill('[data-testid="email-input"]', 'client@example.com')
    await page.fill('[data-testid="password-input"]', 'testpassword')
    await page.click('[data-testid="signin-button"]')
    await page.waitForURL(/\/client/)
  })

  test('should display current subscription status', async ({ page }) => {
    await page.goto('/client/subscription')
    
    // Should show current plan information
    await expect(page.getByText(/Current Plan|Subscription Status/)).toBeVisible()
    await expect(page.getByText(/Connect|Priority|Exclusive/)).toBeVisible()
    
    // Should show plan features
    await expect(page.getByText(/Features|Included/)).toBeVisible()
  })

  test('should display pricing plans correctly', async ({ page }) => {
    await page.goto('/pricing')
    
    // Should show all three tiers
    await expect(page.getByText('Connect')).toBeVisible()
    await expect(page.getByText('Priority')).toBeVisible()
    await expect(page.getByText('Exclusive')).toBeVisible()
    
    // Should show pricing for each tier
    await expect(page.getByText(/\$.*\/month|\$.*\/year/)).toHaveCount({ min: 3 })
    
    // Should show features for each plan
    await expect(page.getByText(/job posts|referrals|support/)).toHaveCount({ min: 3 })
  })

  test('should initiate subscription upgrade flow', async ({ page }) => {
    await page.goto('/pricing')
    
    // Click upgrade button for Priority plan
    const prioritySection = page.locator('[data-testid="priority-plan"]')
    await prioritySection.getByRole('button', { name: /Upgrade|Get Started/ }).click()
    
    // Should redirect to payment flow or show upgrade modal
    await expect(page.getByText(/Payment|Billing|Checkout/)).toBeVisible()
  })

  test('should handle successful subscription upgrade', async ({ page }) => {
    // Mock successful payment flow
    await page.route('**/api/payments', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ 
          success: true, 
          subscription: { 
            id: 'sub_123', 
            status: 'active',
            plan: 'priority' 
          } 
        })
      })
    })

    await page.goto('/pricing')
    
    // Start upgrade process
    const prioritySection = page.locator('[data-testid="priority-plan"]')
    await prioritySection.getByRole('button', { name: /Upgrade/ }).click()
    
    // Fill payment information (mock Stripe form)
    await page.fill('[data-testid="card-number"]', '4242424242424242')
    await page.fill('[data-testid="card-expiry"]', '12/25')
    await page.fill('[data-testid="card-cvc"]', '123')
    
    await page.click('[data-testid="complete-payment"]')
    
    // Should show success message
    await expect(page.getByText(/Upgrade successful|Welcome to Priority/)).toBeVisible()
    
    // Should redirect to dashboard
    await page.waitForURL(/\/client/)
  })

  test('should handle payment failures gracefully', async ({ page }) => {
    // Mock payment failure
    await page.route('**/api/payments', route => {
      route.fulfill({
        status: 400,
        contentType: 'application/json',
        body: JSON.stringify({ 
          error: 'Your card was declined.',
          code: 'card_declined'
        })
      })
    })

    await page.goto('/pricing')
    
    const prioritySection = page.locator('[data-testid="priority-plan"]')
    await prioritySection.getByRole('button', { name: /Upgrade/ }).click()
    
    // Fill payment information with declined card
    await page.fill('[data-testid="card-number"]', '4000000000000002')
    await page.fill('[data-testid="card-expiry"]', '12/25')
    await page.fill('[data-testid="card-cvc"]', '123')
    
    await page.click('[data-testid="complete-payment"]')
    
    // Should show error message
    await expect(page.getByText(/Your card was declined|Payment failed/)).toBeVisible()
    
    // Should allow retry
    await expect(page.locator('[data-testid="complete-payment"]')).toBeEnabled()
  })

  test('should display usage limits for current plan', async ({ page }) => {
    await page.goto('/client')
    
    // Should show usage information
    await expect(page.getByText(/Job Posts|Posts remaining|Usage/)).toBeVisible()
    
    // Should show progress bars or counters
    const usageIndicators = page.locator('[data-testid="usage-indicator"]')
    await expect(usageIndicators).toHaveCount({ min: 1 })
  })

  test('should warn when approaching usage limits', async ({ page }) => {
    // Mock user near usage limit
    await page.route('**/api/users', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          user: {
            subscription: { plan: 'connect' },
            usage: { job_posts: 8, limit: 10 } // Near limit
          }
        })
      })
    })

    await page.goto('/client')
    
    // Should show warning about approaching limit
    await expect(page.getByText(/approaching limit|2 posts remaining/i)).toBeVisible()
    
    // Should show upgrade suggestion
    await expect(page.getByText(/Upgrade|Get more posts/)).toBeVisible()
  })

  test('should prevent actions when limits are exceeded', async ({ page }) => {
    // Mock user who has exceeded limits
    await page.route('**/api/users', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          user: {
            subscription: { plan: 'connect' },
            usage: { job_posts: 10, limit: 10 } // At limit
          }
        })
      })
    })

    await page.goto('/client/jobs/new')
    
    // Should show upgrade required message
    await expect(page.getByText(/Upgrade required|Limit reached/)).toBeVisible()
    
    // Submit button should be disabled or hidden
    await expect(page.getByRole('button', { name: 'Post Job' })).toBeDisabled()
    
    // Should show upgrade CTA
    await expect(page.getByRole('button', { name: /Upgrade Now/ })).toBeVisible()
  })

  test('should handle subscription cancellation', async ({ page }) => {
    await page.goto('/client/subscription')
    
    // Click cancel subscription
    await page.click('[data-testid="cancel-subscription"]')
    
    // Should show confirmation modal
    await expect(page.getByText(/Are you sure|Cancel subscription/)).toBeVisible()
    
    // Confirm cancellation
    await page.click('[data-testid="confirm-cancellation"]')
    
    // Should show cancellation confirmation
    await expect(page.getByText(/Subscription cancelled|Access until/)).toBeVisible()
  })

  test('should show plan comparison', async ({ page }) => {
    await page.goto('/pricing')
    
    // Should have comparison table
    await expect(page.locator('[data-testid="plan-comparison"]')).toBeVisible()
    
    // Should show features for each plan
    const featureRows = page.locator('[data-testid="feature-row"]')
    await expect(featureRows).toHaveCount({ min: 5 })
    
    // Should show checkmarks or X marks for features
    await expect(page.locator('[data-testid="feature-included"]')).toHaveCount({ min: 10 })
  })

  test('should handle annual vs monthly billing toggle', async ({ page }) => {
    await page.goto('/pricing')
    
    // Should have billing toggle
    const billingToggle = page.locator('[data-testid="billing-toggle"]')
    await expect(billingToggle).toBeVisible()
    
    // Default should be monthly
    await expect(page.getByText(/\/month/)).toHaveCount({ min: 3 })
    
    // Toggle to annual
    await billingToggle.click()
    
    // Should show annual pricing
    await expect(page.getByText(/\/year/)).toHaveCount({ min: 3 })
    
    // Should show savings indicator
    await expect(page.getByText(/Save|% off/)).toBeVisible()
  })

  test('should show current plan badge', async ({ page }) => {
    await page.goto('/pricing')
    
    // Should highlight current plan
    await expect(page.locator('[data-testid="current-plan-badge"]')).toBeVisible()
    
    // Current plan should have different styling
    const currentPlan = page.locator('[data-testid="current-plan"]')
    await expect(currentPlan).toHaveClass(/current|active|highlighted/)
  })

  test('should handle Stripe webhook simulation', async ({ page }) => {
    // This test simulates what happens when Stripe sends a webhook
    // In practice, this would be tested via API tests, but we can test the UI response
    
    // Navigate to a page that might be affected by subscription changes
    await page.goto('/client')
    
    // Simulate subscription update via API
    await page.evaluate(() => {
      // Trigger a simulated subscription update event
      window.dispatchEvent(new CustomEvent('subscription-updated', {
        detail: { plan: 'priority' }
      }))
    })
    
    // Should reflect the updated subscription
    await expect(page.getByText(/Priority Plan|Upgraded/)).toBeVisible()
  })

  test('should show billing history', async ({ page }) => {
    await page.goto('/client/billing')
    
    // Should show billing history table
    await expect(page.getByText(/Invoice|Date|Amount/)).toBeVisible()
    
    // Should show past payments
    const invoiceRows = page.locator('[data-testid="invoice-row"]')
    await expect(invoiceRows).toHaveCount({ min: 1 })
    
    // Should have download links
    await expect(page.getByText(/Download|PDF/)).toBeVisible()
  })

  test('should update payment method', async ({ page }) => {
    await page.goto('/client/billing')
    
    // Should show current payment method
    await expect(page.getByText(/•••• 4242|Payment method/)).toBeVisible()
    
    // Click update payment method
    await page.click('[data-testid="update-payment-method"]')
    
    // Should show payment form
    await expect(page.locator('[data-testid="card-number"]')).toBeVisible()
    
    // Update payment method
    await page.fill('[data-testid="card-number"]', '4000056655665556')
    await page.fill('[data-testid="card-expiry"]', '12/26')
    await page.fill('[data-testid="card-cvc"]', '123')
    
    await page.click('[data-testid="save-payment-method"]')
    
    // Should show success message
    await expect(page.getByText(/Payment method updated/)).toBeVisible()
  })
})