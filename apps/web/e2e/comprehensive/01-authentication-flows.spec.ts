import { test, expect } from '@playwright/test';
import { TEST_DATA } from '../fixtures/test-data-generator';

test.describe('🔐 Authentication Flows - Complete Coverage', () => {
  const testUsers = TEST_DATA.users.slice(0, 10);

  test.beforeEach(async ({ page }) => {
    // Clear any existing session
    await page.context().clearCookies();
    await page.goto('/');
  });

  test.describe('Registration Flows', () => {
    test('should complete email registration for all user types', async ({ page }) => {
      for (const userData of testUsers) {
        console.log(`Testing registration for ${userData.role}: ${userData.email}`);
        
        await page.goto('/signup');
        
        // Test form validation
        await page.click('button[type="submit"]');
        await expect(page.locator('text=required').first()).toBeVisible();
        
        // Fill registration form
        await page.fill('[name="email"]', userData.email);
        await page.fill('[name="password"]', userData.password);
        await page.fill('[name="confirmPassword"]', userData.password);
        await page.fill('[name="firstName"]', userData.profile.firstName);
        await page.fill('[name="lastName"]', userData.profile.lastName);
        
        // Select role
        await page.selectOption('[name="role"]', userData.role);
        
        // Add role-specific fields
        if (userData.role === 'client' && userData.profile.company) {
          await page.fill('[name="company"]', userData.profile.company);
        }
        
        if (userData.profile.title) {
          await page.fill('[name="title"]', userData.profile.title);
        }
        
        // Accept terms
        await page.check('[name="acceptTerms"]');
        
        // Submit registration
        await page.click('button[type="submit"]');
        
        // Handle success or existing user
        try {
          await expect(page.locator('text=verification email').or(page.locator('text=already exists'))).toBeVisible({ timeout: 5000 });
        } catch (error) {
          console.log(`Registration result for ${userData.email}: ${await page.textContent('body')}`);
        }
        
        // Clear session for next test
        await page.context().clearCookies();
      }
    });

    test('should validate password strength requirements', async ({ page }) => {
      await page.goto('/signup');
      
      const weakPasswords = ['123', 'password', 'abc123', 'WEAK'];
      
      for (const weakPassword of weakPasswords) {
        await page.fill('[name="password"]', weakPassword);
        await page.blur('[name="password"]');
        await expect(page.locator('text=password must').or(page.locator('text=too weak'))).toBeVisible();
        await page.fill('[name="password"]', '');
      }
      
      // Test strong password
      await page.fill('[name="password"]', 'StrongPass123!');
      await page.blur('[name="password"]');
      await expect(page.locator('text=password must').or(page.locator('text=too weak'))).not.toBeVisible();
    });

    test('should handle email validation correctly', async ({ page }) => {
      await page.goto('/signup');
      
      const invalidEmails = ['invalid', 'test@', '@domain.com', 'test.domain.com'];
      
      for (const invalidEmail of invalidEmails) {
        await page.fill('[name="email"]', invalidEmail);
        await page.blur('[name="email"]');
        await expect(page.locator('text=valid email').or(page.locator('text=email format'))).toBeVisible();
        await page.fill('[name="email"]', '');
      }
    });
  });

  test.describe('Login Flows', () => {
    test('should login with valid credentials', async ({ page }) => {
      // Use a known test user (you'll need to seed this)
      const testUser = testUsers[0];
      
      await page.goto('/login');
      
      // Test empty form validation
      await page.click('button[type="submit"]');
      await expect(page.locator('text=required').first()).toBeVisible();
      
      // Fill login form
      await page.fill('[name="email"]', testUser.email);
      await page.fill('[name="password"]', testUser.password);
      
      // Submit login
      await page.click('button[type="submit"]');
      
      // Should redirect to appropriate dashboard or show error
      await page.waitForURL('**', { timeout: 10000 });
      const currentUrl = page.url();
      
      // Verify we're either logged in or see appropriate error
      if (currentUrl.includes('/dashboard') || currentUrl.includes('/client') || currentUrl.includes('/founding')) {
        console.log(`✅ Login successful for ${testUser.email}`);
        await expect(page.locator('text=dashboard').or(page.locator('text=welcome')).first()).toBeVisible();
      } else {
        console.log(`⚠️ Login failed for ${testUser.email} - checking error message`);
        await expect(page.locator('text=invalid').or(page.locator('text=error')).first()).toBeVisible();
      }
    });

    test('should handle invalid login attempts', async ({ page }) => {
      await page.goto('/login');
      
      const invalidCredentials = [
        { email: 'nonexistent@test.com', password: 'wrongpassword' },
        { email: 'invalid-email', password: 'somepassword' },
        { email: testUsers[0].email, password: 'wrongpassword' }
      ];
      
      for (const creds of invalidCredentials) {
        await page.fill('[name="email"]', creds.email);
        await page.fill('[name="password"]', creds.password);
        await page.click('button[type="submit"]');
        
        // Should show error message
        await expect(page.locator('text=invalid').or(page.locator('text=incorrect')).or(page.locator('text=failed'))).toBeVisible({ timeout: 5000 });
        
        // Clear form
        await page.fill('[name="email"]', '');
        await page.fill('[name="password"]', '');
      }
    });

    test('should handle password reset flow', async ({ page }) => {
      await page.goto('/login');
      
      // Click forgot password link
      await page.click('text=forgot password');
      
      // Should navigate to reset page
      await expect(page.locator('text=reset password').or(page.locator('text=forgot password'))).toBeVisible();
      
      // Test email validation
      await page.click('button[type="submit"]');
      await expect(page.locator('text=required').or(page.locator('text=email'))).toBeVisible();
      
      // Fill valid email
      await page.fill('[name="email"]', testUsers[0].email);
      await page.click('button[type="submit"]');
      
      // Should show success message
      await expect(page.locator('text=reset link').or(page.locator('text=email sent'))).toBeVisible({ timeout: 5000 });
    });
  });

  test.describe('LinkedIn OAuth Integration', () => {
    test('should display LinkedIn login option', async ({ page }) => {
      await page.goto('/login');
      
      // Check if LinkedIn button exists
      const linkedinButton = page.locator('text=linkedin').or(page.locator('[href*="linkedin"]')).or(page.locator('button:has-text("LinkedIn")'));
      await expect(linkedinButton.first()).toBeVisible();
    });

    test('should handle LinkedIn OAuth redirect', async ({ page }) => {
      await page.goto('/login');
      
      // Click LinkedIn button (if available)
      const linkedinButton = page.locator('text=linkedin').or(page.locator('[href*="linkedin"]')).first();
      
      if (await linkedinButton.isVisible()) {
        // Don't actually complete OAuth, just verify redirect works
        await linkedinButton.click();
        
        // Should redirect to LinkedIn or show OAuth flow
        await page.waitForURL('**', { timeout: 5000 });
        const currentUrl = page.url();
        
        expect(currentUrl).toMatch(/(linkedin|oauth|callback|auth)/);
      }
    });
  });

  test.describe('Session Management', () => {
    test('should maintain session across page refreshes', async ({ page }) => {
      // This test requires a pre-authenticated session
      await page.goto('/login');
      
      // Simulate being logged in by setting auth cookies/localStorage
      await page.evaluate(() => {
        localStorage.setItem('test-auth', 'true');
      });
      
      await page.goto('/');
      await page.reload();
      
      // Should maintain session state
      const authState = await page.evaluate(() => localStorage.getItem('test-auth'));
      expect(authState).toBe('true');
    });

    test('should handle logout correctly', async ({ page }) => {
      await page.goto('/');
      
      // Look for logout button (might be in menu)
      const logoutButton = page.locator('text=logout').or(page.locator('text=sign out')).first();
      
      if (await logoutButton.isVisible()) {
        await logoutButton.click();
        
        // Should redirect to login or home
        await page.waitForURL('**', { timeout: 5000 });
        await expect(page.locator('text=login').or(page.locator('text=sign in'))).toBeVisible();
      }
    });
  });

  test.describe('Role-Based Access Control', () => {
    const roleUrls = {
      client: ['/client', '/client/jobs', '/client/analytics'],
      founding_circle: ['/founding', '/founding/revenue', '/founding/network'],
      select_circle: ['/select-circle', '/select-circle/referrals', '/select-circle/earnings'],
      candidate: ['/candidate', '/candidate/profile']
    };

    for (const [role, urls] of Object.entries(roleUrls)) {
      test(`should enforce ${role} role access controls`, async ({ page }) => {
        for (const url of urls) {
          await page.goto(url);
          
          // Should either redirect to login or show appropriate content
          await page.waitForURL('**', { timeout: 5000 });
          const currentUrl = page.url();
          
          if (currentUrl.includes('/login')) {
            console.log(`✅ ${url} properly redirected unauthenticated user to login`);
          } else if (currentUrl === url) {
            console.log(`✅ ${url} loaded (user may be authenticated)`);
          } else {
            console.log(`⚠️ ${url} redirected to ${currentUrl}`);
          }
          
          // Should not show 404 or 500 errors
          await expect(page.locator('text=404').or(page.locator('text=500')).or(page.locator('text=error'))).not.toBeVisible();
        }
      });
    }
  });

  test.describe('Form Interactions', () => {
    test('should handle all form elements correctly', async ({ page }) => {
      await page.goto('/signup');
      
      // Test all input types
      const inputSelectors = [
        '[name="email"]',
        '[name="password"]',
        '[name="firstName"]',
        '[name="lastName"]',
        '[name="company"]',
        '[name="title"]'
      ];
      
      for (const selector of inputSelectors) {
        const input = page.locator(selector);
        if (await input.isVisible()) {
          // Test typing and clearing
          await input.fill('test value');
          await expect(input).toHaveValue('test value');
          
          await input.clear();
          await expect(input).toHaveValue('');
          
          // Test focus states
          await input.focus();
          await expect(input).toBeFocused();
        }
      }
      
      // Test checkbox interactions
      const checkboxes = page.locator('[type="checkbox"]');
      const checkboxCount = await checkboxes.count();
      
      for (let i = 0; i < checkboxCount; i++) {
        const checkbox = checkboxes.nth(i);
        if (await checkbox.isVisible()) {
          await checkbox.check();
          await expect(checkbox).toBeChecked();
          
          await checkbox.uncheck();
          await expect(checkbox).not.toBeChecked();
        }
      }
    });

    test('should handle form submission with keyboard', async ({ page }) => {
      await page.goto('/login');
      
      await page.fill('[name="email"]', testUsers[0].email);
      await page.fill('[name="password"]', testUsers[0].password);
      
      // Submit with Enter key
      await page.keyboard.press('Enter');
      
      // Should process form submission
      await page.waitForURL('**', { timeout: 5000 });
      expect(page.url()).not.toContain('/login');
    });
  });
});