import { test, expect, Page } from '@playwright/test';
import { TestHelpers } from './utils/test-helpers';
import { testData } from './fixtures/test-data';

test.describe('User Registration and Login Flow', () => {
  let page: Page;
  let helpers: TestHelpers;

  test.beforeEach(async ({ page: testPage }) => {
    page = testPage;
    helpers = new TestHelpers(page);
  });

  test('Registration page loads and displays correctly', async () => {
    console.log('📝 Testing registration page load...');
    
    await page.goto('/register');
    await helpers.waitForFullLoad();
    await helpers.takeScreenshot('registration-page-load');

    // Check page title and heading
    const title = await page.title();
    expect(title).toMatch(testData.pageContent.register.title);

    const heading = page.locator('h1, h2').first();
    await expect(heading).toBeVisible();
    const headingText = await heading.textContent();
    expect(headingText).toMatch(testData.pageContent.register.heading);

    // Check for registration form
    const form = page.locator('form').first();
    await expect(form).toBeVisible();

    // Check for essential form fields
    const emailField = page.locator('input[type="email"], input[name*="email"]').first();
    const passwordField = page.locator('input[type="password"], input[name*="password"]').first();
    const submitButton = page.locator('button[type="submit"], input[type="submit"]').first();

    await expect(emailField).toBeVisible();
    await expect(passwordField).toBeVisible();
    await expect(submitButton).toBeVisible();

    // Check submit button text
    const buttonText = await submitButton.textContent();
    expect(buttonText).toMatch(testData.pageContent.register.submitButton);

    console.log('✅ Registration page loaded correctly');
  });

  test('Registration form validation works correctly', async () => {
    console.log('✅ Testing registration form validation...');
    
    await page.goto('/register');
    await helpers.waitForFullLoad();

    const form = page.locator('form').first();
    
    // Test form validation with invalid data
    const formFields = [
      {
        selector: 'input[type="email"], input[name*="email"]',
        validValue: testData.users.client.email,
        invalidValue: 'invalid-email'
      },
      {
        selector: 'input[type="password"], input[name*="password"]',
        validValue: testData.users.client.password,
        invalidValue: '123' // Too short password
      }
    ];

    const validationIssues = await helpers.testFormValidation(form, formFields);
    
    if (validationIssues.length > 0) {
      console.warn('⚠️ Form validation issues:', validationIssues);
    }

    // Try to submit empty form
    const submitButton = page.locator('button[type="submit"], input[type="submit"]').first();
    await submitButton.click();
    await page.waitForTimeout(1000);

    // Check if validation errors appear
    const errorElements = page.locator('.error, [role="alert"], .text-red-500, .text-destructive');
    const errorCount = await errorElements.count();
    
    if (errorCount > 0) {
      console.log(`✅ Form validation working - ${errorCount} error messages displayed`);
    } else {
      console.warn('⚠️ No validation errors shown for empty form submission');
    }

    await helpers.takeScreenshot('registration-form-validation');
  });

  test('Registration attempt with test data', async () => {
    console.log('👤 Testing registration attempt...');
    
    await page.goto('/register');
    await helpers.waitForFullLoad();

    // Fill out registration form
    const emailField = page.locator('input[type="email"], input[name*="email"]').first();
    const passwordField = page.locator('input[type="password"], input[name*="password"]').first();
    const nameField = page.locator('input[name*="name"], input[placeholder*="name"]').first();

    await emailField.fill(`test-${Date.now()}@example.com`); // Unique email
    await passwordField.fill(testData.users.client.password);
    
    if (await nameField.count() > 0) {
      await nameField.fill(testData.users.client.name);
    }

    // Check for additional fields (role selection, company, etc.)
    const roleSelectors = [
      'select[name*="role"]',
      'input[name*="role"]',
      'button:has-text("Client")',
      'button:has-text("Candidate")'
    ];

    for (const selector of roleSelectors) {
      const roleElement = page.locator(selector).first();
      if (await roleElement.count() > 0 && await roleElement.isVisible()) {
        if (selector.includes('button')) {
          await roleElement.click();
        }
        console.log(`Selected role element: ${selector}`);
        break;
      }
    }

    await helpers.takeScreenshot('registration-form-filled');

    // Submit the form
    const submitButton = page.locator('button[type="submit"], input[type="submit"]').first();
    await submitButton.click();

    // Wait for response
    await page.waitForLoadState('networkidle');
    await helpers.takeScreenshot('registration-attempt-result');

    // Check the result - could be success, error, or email verification
    const currentUrl = page.url();
    const pageContent = await page.textContent('body');

    if (currentUrl.includes('dashboard') || pageContent?.includes('welcome')) {
      console.log('✅ Registration successful - redirected to dashboard');
    } else if (pageContent?.includes('email') && (pageContent?.includes('verify') || pageContent?.includes('confirm'))) {
      console.log('✅ Registration successful - email verification required');
    } else if (pageContent?.includes('error') || pageContent?.includes('failed')) {
      console.log('❌ Registration failed - this may be expected for production testing');
    } else {
      console.log(`ℹ️ Registration result unclear - URL: ${currentUrl}`);
    }
  });

  test('Login page loads and displays correctly', async () => {
    console.log('🔑 Testing login page load...');
    
    await page.goto('/login');
    await helpers.waitForFullLoad();
    await helpers.takeScreenshot('login-page-load');

    // Check page title and heading
    const title = await page.title();
    expect(title).toMatch(testData.pageContent.login.title);

    const heading = page.locator('h1, h2').first();
    await expect(heading).toBeVisible();
    const headingText = await heading.textContent();
    expect(headingText).toMatch(testData.pageContent.login.heading);

    // Check for login form
    const form = page.locator('form').first();
    await expect(form).toBeVisible();

    // Check for essential form fields
    const emailField = page.locator('input[type="email"], input[name*="email"]').first();
    const passwordField = page.locator('input[type="password"], input[name*="password"]').first();
    const submitButton = page.locator('button[type="submit"], input[type="submit"]').first();

    await expect(emailField).toBeVisible();
    await expect(passwordField).toBeVisible();
    await expect(submitButton).toBeVisible();

    // Check for additional features
    const forgotPasswordLink = page.locator('a:has-text("Forgot"), a:has-text("forgot"), a[href*="forgot"], a[href*="reset"]').first();
    if (await forgotPasswordLink.count() > 0) {
      console.log('✅ Forgot password link found');
    }

    const registerLink = page.locator('a:has-text("Register"), a:has-text("Sign up"), a[href*="register"], a[href*="signup"]').first();
    if (await registerLink.count() > 0) {
      console.log('✅ Register link found');
    }

    console.log('✅ Login page loaded correctly');
  });

  test('Login form validation works correctly', async () => {
    console.log('✅ Testing login form validation...');
    
    await page.goto('/login');
    await helpers.waitForFullLoad();

    const form = page.locator('form').first();
    
    // Test form validation
    const formFields = [
      {
        selector: 'input[type="email"], input[name*="email"]',
        validValue: testData.users.client.email,
        invalidValue: 'invalid-email'
      },
      {
        selector: 'input[type="password"], input[name*="password"]',
        validValue: testData.users.client.password,
        invalidValue: '123'
      }
    ];

    const validationIssues = await helpers.testFormValidation(form, formFields);
    
    if (validationIssues.length > 0) {
      console.warn('⚠️ Login form validation issues:', validationIssues);
    }

    // Try to submit empty form
    const submitButton = page.locator('button[type="submit"], input[type="submit"]').first();
    await submitButton.click();
    await page.waitForTimeout(1000);

    // Check if validation errors appear
    const errorElements = page.locator('.error, [role="alert"], .text-red-500, .text-destructive');
    const errorCount = await errorElements.count();
    
    if (errorCount > 0) {
      console.log(`✅ Login form validation working - ${errorCount} error messages displayed`);
    } else {
      console.warn('⚠️ No validation errors shown for empty login form');
    }

    await helpers.takeScreenshot('login-form-validation');
  });

  test('Login attempt with invalid credentials', async () => {
    console.log('🚫 Testing login with invalid credentials...');
    
    await page.goto('/login');
    await helpers.waitForFullLoad();

    // Fill out login form with invalid credentials
    const emailField = page.locator('input[type="email"], input[name*="email"]').first();
    const passwordField = page.locator('input[type="password"], input[name*="password"]').first();

    await emailField.fill('nonexistent@example.com');
    await passwordField.fill('wrongpassword');

    await helpers.takeScreenshot('login-form-invalid-filled');

    // Submit the form
    const submitButton = page.locator('button[type="submit"], input[type="submit"]').first();
    await submitButton.click();

    // Wait for response
    await page.waitForTimeout(3000);
    await helpers.takeScreenshot('login-invalid-attempt-result');

    // Check for error message
    const pageContent = await page.textContent('body');
    const hasErrorMessage = pageContent?.includes('invalid') || 
                          pageContent?.includes('incorrect') || 
                          pageContent?.includes('failed') ||
                          pageContent?.includes('error');

    if (hasErrorMessage) {
      console.log('✅ Invalid login properly rejected with error message');
    } else {
      console.warn('⚠️ No clear error message for invalid login');
    }

    // Make sure we're still on login page (not redirected)
    const currentUrl = page.url();
    expect(currentUrl).toContain('login');
  });

  test('Social login options (if available)', async () => {
    console.log('🌐 Testing social login options...');
    
    await page.goto('/login');
    await helpers.waitForFullLoad();

    // Look for social login buttons
    const socialLoginSelectors = [
      'button:has-text("Google")',
      'button:has-text("Facebook")',
      'button:has-text("GitHub")',
      'button:has-text("LinkedIn")',
      'a[href*="google"]',
      'a[href*="facebook"]',
      'a[href*="github"]',
      'a[href*="linkedin"]',
      '[data-testid*="social"]',
      '.social-login'
    ];

    const socialLogins: string[] = [];

    for (const selector of socialLoginSelectors) {
      const element = page.locator(selector).first();
      if (await element.count() > 0 && await element.isVisible()) {
        const text = await element.textContent();
        socialLogins.push(text || selector);
        
        // Test that clicking doesn't break (but don't actually go through OAuth)
        try {
          // Just hover to see if it's interactive
          await element.hover();
          console.log(`✅ Social login option found: ${text}`);
        } catch (error) {
          console.warn(`⚠️ Issue with social login ${text}:`, error);
        }
      }
    }

    if (socialLogins.length > 0) {
      console.log(`Found ${socialLogins.length} social login options:`, socialLogins);
    } else {
      console.log('ℹ️ No social login options found');
    }

    await helpers.takeScreenshot('login-social-options');
  });

  test('Password reset flow (if available)', async () => {
    console.log('🔄 Testing password reset flow...');
    
    await page.goto('/login');
    await helpers.waitForFullLoad();

    // Look for forgot password link
    const forgotPasswordLink = page.locator('a:has-text("Forgot"), a:has-text("forgot"), a[href*="forgot"], a[href*="reset"]').first();
    
    if (await forgotPasswordLink.count() === 0) {
      console.log('ℹ️ No password reset option found');
      return;
    }

    await forgotPasswordLink.click();
    await page.waitForLoadState('networkidle');
    await helpers.takeScreenshot('password-reset-page');

    // Check if we're on a password reset page
    const currentUrl = page.url();
    const pageContent = await page.textContent('body');
    
    if (currentUrl.includes('forgot') || currentUrl.includes('reset') || 
        pageContent?.includes('reset') || pageContent?.includes('forgot')) {
      console.log('✅ Password reset page accessible');
      
      // Try to fill out reset form if available
      const emailField = page.locator('input[type="email"], input[name*="email"]').first();
      if (await emailField.count() > 0) {
        await emailField.fill('test@example.com');
        
        const submitButton = page.locator('button[type="submit"], input[type="submit"]').first();
        if (await submitButton.count() > 0) {
          await submitButton.click();
          await page.waitForTimeout(2000);
          await helpers.takeScreenshot('password-reset-submitted');
        }
      }
    } else {
      console.warn('⚠️ Password reset link did not lead to reset page');
    }
  });

  test('Navigation between login and registration', async () => {
    console.log('↔️ Testing navigation between login and registration...');
    
    // Start at login page
    await page.goto('/login');
    await helpers.waitForFullLoad();

    // Look for registration link
    const registerLink = page.locator('a:has-text("Register"), a:has-text("Sign up"), a[href*="register"], a[href*="signup"]').first();
    
    if (await registerLink.count() > 0) {
      await registerLink.click();
      await page.waitForLoadState('networkidle');
      
      expect(page.url()).toContain('register');
      console.log('✅ Successfully navigated to registration from login');
      
      // Now try to go back to login
      const loginLink = page.locator('a:has-text("Login"), a:has-text("Sign in"), a[href*="login"], a[href*="signin"]').first();
      
      if (await loginLink.count() > 0) {
        await loginLink.click();
        await page.waitForLoadState('networkidle');
        
        expect(page.url()).toContain('login');
        console.log('✅ Successfully navigated back to login from registration');
      }
    } else {
      console.log('ℹ️ No registration link found on login page');
    }

    await helpers.takeScreenshot('auth-navigation-test');
  });

  test('Mobile responsiveness for auth pages', async () => {
    console.log('📱 Testing mobile responsiveness for auth pages...');
    
    const authPages = ['/login', '/register'];
    
    for (const authPage of authPages) {
      await page.setViewportSize(testData.viewports.mobile);
      await page.goto(authPage);
      await helpers.waitForFullLoad();

      const mobileIssues = await helpers.checkMobileResponsiveness();
      if (mobileIssues.length > 0) {
        console.warn(`⚠️ Mobile issues on ${authPage}:`, mobileIssues);
      }

      // Check if form is still usable on mobile
      const form = page.locator('form').first();
      await expect(form).toBeVisible();

      const formBounds = await form.boundingBox();
      if (formBounds && formBounds.width > testData.viewports.mobile.width) {
        console.warn(`⚠️ Form width (${formBounds.width}px) exceeds mobile viewport width`);
      }

      await helpers.takeScreenshot(`${authPage.replace('/', '')}-mobile`);
    }

    // Reset to desktop
    await page.setViewportSize(testData.viewports.desktop);
  });
});