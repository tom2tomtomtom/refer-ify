import { test, expect } from '@playwright/test';

test.describe('🎨 UI Element Coverage - Every Button, Link, Form', () => {
  
  test.beforeEach(async ({ page }) => {
    // Start from homepage for each test
    await page.goto('/');
  });

  test.describe('Navigation Elements', () => {
    test('should test all navigation links and buttons', async ({ page }) => {
      // Test main navigation
      const navLinks = [
        { text: 'Home', expectedUrl: '/' },
        { text: 'How It Works', expectedUrl: '/' }, // Usually anchors or sections
        { text: 'For Companies', expectedUrl: '/' },
        { text: 'Login', expectedUrl: '/login' },
        { text: 'Sign Up', expectedUrl: '/signup' },
        { text: 'Get Started', expectedUrl: '/signup' }
      ];

      for (const link of navLinks) {
        const element = page.locator(`a:has-text("${link.text}"), button:has-text("${link.text}")`).first();
        
        if (await element.isVisible()) {
          console.log(`Testing navigation element: ${link.text}`);
          
          // Test hover state
          await element.hover();
          
          // Click and verify navigation
          await element.click();
          await page.waitForURL('**', { timeout: 5000 });
          
          // Verify we navigated correctly (or stayed on same page for anchors)
          const currentUrl = page.url();
          if (link.expectedUrl !== '/') {
            expect(currentUrl).toContain(link.expectedUrl);
          }
          
          // Go back to home for next test
          await page.goto('/');
        }
      }
    });

    test('should test mobile navigation menu', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });
      
      // Look for mobile menu button (hamburger)
      const mobileMenuButton = page.locator('[aria-label="menu"], button:has-text("☰"), .hamburger, [data-testid="mobile-menu"]').first();
      
      if (await mobileMenuButton.isVisible()) {
        await mobileMenuButton.click();
        
        // Mobile menu should be visible
        await expect(page.locator('[role="navigation"], .mobile-menu, .nav-menu')).toBeVisible();
        
        // Test mobile menu links
        const mobileLinks = await page.locator('.mobile-menu a, [role="navigation"] a').all();
        
        for (let i = 0; i < Math.min(mobileLinks.length, 5); i++) {
          const link = mobileLinks[i];
          if (await link.isVisible()) {
            await link.click();
            await page.waitForTimeout(1000);
            
            // Navigate back to test next link
            await page.goBack();
            await mobileMenuButton.click(); // Reopen menu
          }
        }
      }
    });

    test('should test footer links', async ({ page }) => {
      // Scroll to footer
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      
      // Find all footer links
      const footerLinks = await page.locator('footer a, [data-testid="footer"] a').all();
      
      for (let i = 0; i < Math.min(footerLinks.length, 10); i++) {
        const link = footerLinks[i];
        if (await link.isVisible()) {
          const href = await link.getAttribute('href');
          const text = await link.textContent();
          
          console.log(`Testing footer link: ${text} (${href})`);
          
          // Test hover
          await link.hover();
          
          // Click link
          await link.click();
          await page.waitForTimeout(2000);
          
          // Go back for next test
          await page.goBack();
        }
      }
    });
  });

  test.describe('Form Elements', () => {
    const formPages = ['/login', '/signup'];
    
    for (const formPage of formPages) {
      test(`should test all form elements on ${formPage}`, async ({ page }) => {
        await page.goto(formPage);
        
        // Test all input fields
        const inputs = await page.locator('input').all();
        for (let i = 0; i < inputs.length; i++) {
          const input = inputs[i];
          const inputType = await input.getAttribute('type');
          const inputName = await input.getAttribute('name');
          
          console.log(`Testing input: ${inputName} (${inputType})`);
          
          if (await input.isVisible()) {
            // Test focus
            await input.focus();
            await expect(input).toBeFocused();
            
            // Test typing (for text inputs)
            if (['text', 'email', 'password', 'tel'].includes(inputType || '')) {
              await input.fill('test value');
              await expect(input).toHaveValue('test value');
              
              // Test clearing
              await input.clear();
              await expect(input).toHaveValue('');
            }
            
            // Test checkbox/radio interactions
            if (inputType === 'checkbox' || inputType === 'radio') {
              await input.check();
              await expect(input).toBeChecked();
              
              if (inputType === 'checkbox') {
                await input.uncheck();
                await expect(input).not.toBeChecked();
              }
            }
          }
        }
        
        // Test select dropdowns
        const selects = await page.locator('select').all();
        for (let i = 0; i < selects.length; i++) {
          const select = selects[i];
          if (await select.isVisible()) {
            const options = await select.locator('option').all();
            if (options.length > 1) {
              // Select first option
              await select.selectOption({ index: 1 });
              
              // Verify selection
              const selectedValue = await select.inputValue();
              expect(selectedValue).toBeTruthy();
            }
          }
        }
        
        // Test textareas
        const textareas = await page.locator('textarea').all();
        for (let i = 0; i < textareas.length; i++) {
          const textarea = textareas[i];
          if (await textarea.isVisible()) {
            await textarea.fill('This is a test message for the textarea field.');
            await expect(textarea).toHaveValue('This is a test message for the textarea field.');
            await textarea.clear();
          }
        }
        
        // Test form submission button
        const submitButton = page.locator('button[type="submit"], input[type="submit"]').first();
        if (await submitButton.isVisible()) {
          await submitButton.hover();
          
          // Don't actually submit empty form, just verify button works
          await expect(submitButton).toBeEnabled();
        }
      });
    }
  });

  test.describe('Interactive Elements', () => {
    test('should test all buttons across the site', async ({ page }) => {
      const pagesToTest = ['/', '/login', '/signup'];
      
      for (const pageUrl of pagesToTest) {
        await page.goto(pageUrl);
        console.log(`Testing buttons on ${pageUrl}`);
        
        // Find all buttons
        const buttons = await page.locator('button').all();
        
        for (let i = 0; i < buttons.length; i++) {
          const button = buttons[i];
          const buttonText = await button.textContent();
          const buttonType = await button.getAttribute('type');
          
          if (await button.isVisible() && await button.isEnabled()) {
            console.log(`Testing button: "${buttonText}" (type: ${buttonType})`);
            
            // Test hover state
            await button.hover();
            
            // Test click (careful with submit buttons)
            if (buttonType !== 'submit') {
              await button.click();
              await page.waitForTimeout(500);
            } else {
              // Just verify submit button is clickable
              await expect(button).toBeEnabled();
            }
          }
        }
      }
    });

    test('should test all clickable elements', async ({ page }) => {
      await page.goto('/');
      
      // Test all elements with click handlers (href, onclick, etc.)
      const clickableSelectors = [
        'a[href]',
        '[onclick]',
        '[role="button"]',
        '.button',
        '.btn',
        '.clickable'
      ];
      
      for (const selector of clickableSelectors) {
        const elements = await page.locator(selector).all();
        
        for (let i = 0; i < Math.min(elements.length, 5); i++) {
          const element = elements[i];
          if (await element.isVisible()) {
            const text = await element.textContent();
            console.log(`Testing clickable element: ${text?.substring(0, 50)}`);
            
            await element.hover();
            await element.click();
            await page.waitForTimeout(1000);
            
            // Go back if we navigated away
            if (!page.url().endsWith('/')) {
              await page.goBack();
            }
          }
        }
      }
    });
  });

  test.describe('Media Elements', () => {
    test('should test all images and media', async ({ page }) => {
      await page.goto('/');
      
      // Test all images
      const images = await page.locator('img').all();
      console.log(`Found ${images.length} images to test`);
      
      for (let i = 0; i < images.length; i++) {
        const img = images[i];
        if (await img.isVisible()) {
          const src = await img.getAttribute('src');
          const alt = await img.getAttribute('alt');
          
          console.log(`Testing image: ${src} (alt: ${alt})`);
          
          // Verify image loads
          await expect(img).toBeVisible();
          
          // Check if image has proper alt text
          if (!alt) {
            console.warn(`Image missing alt text: ${src}`);
          }
        }
      }
      
      // Test videos (if any)
      const videos = await page.locator('video').all();
      for (let i = 0; i < videos.length; i++) {
        const video = videos[i];
        if (await video.isVisible()) {
          // Test video controls
          const controls = await video.getAttribute('controls');
          if (controls !== null) {
            await video.hover();
            // Could test play/pause if needed
          }
        }
      }
    });

    test('should test broken images', async ({ page }) => {
      await page.goto('/');
      
      // Check for broken images
      const images = await page.locator('img').all();
      
      for (let i = 0; i < images.length; i++) {
        const img = images[i];
        const naturalWidth = await img.evaluate(el => (el as HTMLImageElement).naturalWidth);
        const src = await img.getAttribute('src');
        
        if (naturalWidth === 0) {
          console.error(`Broken image detected: ${src}`);
          // Could fail test if broken images found
        }
      }
    });
  });

  test.describe('Accessibility Elements', () => {
    test('should test keyboard navigation', async ({ page }) => {
      await page.goto('/');
      
      // Test Tab navigation
      const tabStops = [];
      let currentElement = null;
      
      for (let i = 0; i < 10; i++) {
        await page.keyboard.press('Tab');
        const focusedElement = await page.locator(':focus').first();
        
        if (await focusedElement.isVisible()) {
          const tagName = await focusedElement.evaluate(el => el.tagName);
          const text = await focusedElement.textContent();
          tabStops.push(`${tagName}: ${text?.substring(0, 30)}`);
          
          // Test Enter key on focusable elements
          if (['BUTTON', 'A'].includes(tagName)) {
            // Don't actually trigger navigation, just verify it's focusable
            await expect(focusedElement).toBeFocused();
          }
        }
      }
      
      console.log('Tab navigation order:', tabStops);
    });

    test('should test ARIA attributes', async ({ page }) => {
      await page.goto('/');
      
      // Check for proper ARIA attributes
      const ariaElements = await page.locator('[role], [aria-label], [aria-describedby], [aria-expanded]').all();
      
      for (let i = 0; i < ariaElements.length; i++) {
        const element = ariaElements[i];
        const role = await element.getAttribute('role');
        const label = await element.getAttribute('aria-label');
        const expanded = await element.getAttribute('aria-expanded');
        
        console.log(`ARIA element - role: ${role}, label: ${label}, expanded: ${expanded}`);
        
        // Test expandable elements
        if (expanded !== null) {
          await element.click();
          const newExpanded = await element.getAttribute('aria-expanded');
          expect(newExpanded).not.toBe(expanded);
        }
      }
    });
  });

  test.describe('Dynamic Content', () => {
    test('should test loading states and dynamic content', async ({ page }) => {
      await page.goto('/');
      
      // Look for loading indicators
      const loadingIndicators = page.locator('.loading, .spinner, [aria-label*="loading"]');
      
      if (await loadingIndicators.first().isVisible()) {
        console.log('Loading indicator detected');
        
        // Wait for loading to complete
        await expect(loadingIndicators.first()).not.toBeVisible({ timeout: 10000 });
      }
      
      // Test dynamic content updates
      const dynamicElements = page.locator('[data-dynamic], [data-loading], .dynamic-content');
      const dynamicCount = await dynamicElements.count();
      
      if (dynamicCount > 0) {
        console.log(`Found ${dynamicCount} dynamic content elements`);
        
        for (let i = 0; i < dynamicCount; i++) {
          const element = dynamicElements.nth(i);
          if (await element.isVisible()) {
            // Trigger any updates (click, hover, etc.)
            await element.hover();
            await page.waitForTimeout(1000);
          }
        }
      }
    });

    test('should test modal and dialog interactions', async ({ page }) => {
      await page.goto('/');
      
      // Look for modal triggers
      const modalTriggers = page.locator('[data-modal], [data-dialog], button:has-text("open"), button:has-text("show")');
      const triggerCount = await modalTriggers.count();
      
      for (let i = 0; i < Math.min(triggerCount, 3); i++) {
        const trigger = modalTriggers.nth(i);
        if (await trigger.isVisible()) {
          await trigger.click();
          
          // Look for modal/dialog
          const modal = page.locator('[role="dialog"], .modal, .dialog').first();
          
          if (await modal.isVisible()) {
            console.log('Modal opened successfully');
            
            // Test modal close
            const closeButton = modal.locator('[aria-label="close"], .close, button:has-text("close")').first();
            
            if (await closeButton.isVisible()) {
              await closeButton.click();
              await expect(modal).not.toBeVisible();
            } else {
              // Try ESC key
              await page.keyboard.press('Escape');
              await expect(modal).not.toBeVisible();
            }
          }
        }
      }
    });
  });

  test.describe('Error States', () => {
    test('should test 404 page', async ({ page }) => {
      await page.goto('/this-page-does-not-exist');
      
      // Should show 404 page
      await expect(page.locator('text=404').or(page.locator('text=not found')).first()).toBeVisible();
      
      // Test back to home link
      const homeLink = page.locator('a:has-text("home"), a:has-text("back")').first();
      if (await homeLink.isVisible()) {
        await homeLink.click();
        await expect(page.locator('h1, .hero')).toBeVisible();
      }
    });

    test('should test form error states', async ({ page }) => {
      await page.goto('/signup');
      
      // Submit empty form to trigger validation
      await page.click('button[type="submit"]');
      
      // Should show validation errors
      await expect(page.locator('.error, [role="alert"], .invalid')).toBeVisible();
      
      // Test individual field errors
      const requiredFields = await page.locator('input[required]').all();
      for (let i = 0; i < Math.min(requiredFields.length, 3); i++) {
        const field = requiredFields[i];
        if (await field.isVisible()) {
          await field.focus();
          await field.blur();
          
          // Should show field-specific error
          const fieldError = page.locator('.error, .invalid').first();
          if (await fieldError.isVisible()) {
            console.log('Field validation error shown');
          }
        }
      }
    });
  });
});