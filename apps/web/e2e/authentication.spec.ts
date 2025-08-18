import { test, expect } from '@playwright/test'

test.describe('Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the home page
    await page.goto('/')
  })

  test('should redirect to login when not authenticated', async ({ page }) => {
    // Try to access a protected route
    await page.goto('/client')
    
    // Should redirect to login
    await expect(page).toHaveURL(/.*\/login/)
    expect(await page.getByText('Sign in')).toBeVisible()
  })

  test('should display login form correctly', async ({ page }) => {
    await page.goto('/login')

    // Check that login form elements are present
    await expect(page.getByLabel('Email')).toBeVisible()
    await expect(page.getByLabel('Password')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Sign In' })).toBeVisible()
    
    // Check for link to signup
    await expect(page.getByText('Sign up')).toBeVisible()
  })

  test('should display signup form correctly', async ({ page }) => {
    await page.goto('/signup')

    // Check that signup form elements are present
    await expect(page.getByLabel('Email')).toBeVisible()
    await expect(page.getByLabel('Password')).toBeVisible()
    await expect(page.getByLabel('Confirm Password')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Sign Up' })).toBeVisible()
    
    // Check for link to login
    await expect(page.getByText('Sign in')).toBeVisible()
  })

  test('should validate email format on login', async ({ page }) => {
    await page.goto('/login')

    // Enter invalid email
    await page.fill('[data-testid="email-input"]', 'invalid-email')
    await page.fill('[data-testid="password-input"]', 'password123')
    
    // Try to submit
    await page.click('[data-testid="signin-button"]')

    // Should show validation error (implementation depends on your validation)
    // This is a placeholder - adjust based on your actual validation UI
    await expect(page.getByText('Please enter a valid email')).toBeVisible()
  })

  test('should handle login errors gracefully', async ({ page }) => {
    await page.goto('/login')

    // Enter credentials for non-existent user
    await page.fill('[data-testid="email-input"]', 'nonexistent@example.com')
    await page.fill('[data-testid="password-input"]', 'wrongpassword')
    
    // Submit form
    await page.click('[data-testid="signin-button"]')

    // Should show error message
    await expect(page.getByText(/Invalid credentials|Login failed/)).toBeVisible()
  })

  test('should navigate between login and signup', async ({ page }) => {
    await page.goto('/login')

    // Click on signup link
    await page.click('text=Sign up')
    await expect(page).toHaveURL(/.*\/signup/)

    // Click on login link from signup
    await page.click('text=Sign in')
    await expect(page).toHaveURL(/.*\/login/)
  })

  test('should show password requirements on signup', async ({ page }) => {
    await page.goto('/signup')

    // Focus on password field to show requirements
    await page.focus('[data-testid="password-input"]')
    
    // Should show password requirements (adjust based on your implementation)
    await expect(page.getByText(/At least 6 characters|Password must contain/)).toBeVisible()
  })

  test('should validate password confirmation match', async ({ page }) => {
    await page.goto('/signup')

    await page.fill('[data-testid="email-input"]', 'test@example.com')
    await page.fill('[data-testid="password-input"]', 'password123')
    await page.fill('[data-testid="confirm-password-input"]', 'password456')
    
    await page.click('[data-testid="signup-button"]')

    // Should show password mismatch error
    await expect(page.getByText(/Passwords do not match/)).toBeVisible()
  })

  test('should handle successful signup flow', async ({ page }) => {
    await page.goto('/signup')

    const testEmail = `test-${Date.now()}@example.com`
    
    await page.fill('[data-testid="email-input"]', testEmail)
    await page.fill('[data-testid="password-input"]', 'password123')
    await page.fill('[data-testid="confirm-password-input"]', 'password123')
    
    await page.click('[data-testid="signup-button"]')

    // Should show success message or redirect
    await expect(page.getByText(/Check your email|Account created|Welcome/)).toBeVisible()
  })

  test('should show loading states during authentication', async ({ page }) => {
    await page.goto('/login')

    await page.fill('[data-testid="email-input"]', 'test@example.com')
    await page.fill('[data-testid="password-input"]', 'password123')
    
    // Click submit and immediately check for loading state
    await page.click('[data-testid="signin-button"]')
    
    // Should show loading indicator (adjust based on your implementation)
    await expect(page.getByText(/Signing in|Loading/)).toBeVisible()
  })

  test('should remember form values on validation error', async ({ page }) => {
    await page.goto('/login')

    const email = 'test@example.com'
    await page.fill('[data-testid="email-input"]', email)
    await page.fill('[data-testid="password-input"]', 'wrongpassword')
    
    await page.click('[data-testid="signin-button"]')
    
    // After error, email should still be filled
    await expect(page.locator('[data-testid="email-input"]')).toHaveValue(email)
  })

  test('should clear sensitive data after logout', async ({ page }) => {
    // This test assumes you have a way to test logout functionality
    // Adjust based on your implementation
    
    await page.goto('/login')
    
    // Assuming successful login leads to dashboard
    await page.fill('[data-testid="email-input"]', 'valid@example.com')
    await page.fill('[data-testid="password-input"]', 'validpassword')
    await page.click('[data-testid="signin-button"]')
    
    // If redirected to dashboard, logout
    if (await page.url().includes('/dashboard') || page.url().includes('/client')) {
      await page.click('[data-testid="logout-button"]')
      
      // Should redirect to home or login
      await expect(page).toHaveURL(/.*\/(login|$)/)
      
      // Should not be able to access protected routes
      await page.goto('/client')
      await expect(page).toHaveURL(/.*\/login/)
    }
  })

  test('should handle session expiration gracefully', async ({ page }) => {
    // Mock an expired session scenario
    // This would require setting up test data or mocking
    
    await page.goto('/client')
    
    // Should redirect to login when session is invalid
    await expect(page).toHaveURL(/.*\/login/)
    
    // Should show appropriate message
    await expect(page.getByText(/Session expired|Please sign in/)).toBeVisible()
  })
})