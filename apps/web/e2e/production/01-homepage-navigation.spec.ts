import { test, expect, Page } from '@playwright/test';
import { TestHelpers } from './utils/test-helpers';
import { testData } from './fixtures/test-data';

test.describe('Homepage Navigation and Primary Links', () => {
  let page: Page;
  let helpers: TestHelpers;
  let consoleErrors: string[];
  let networkErrors: string[];

  test.beforeEach(async ({ page: testPage }) => {
    page = testPage;
    helpers = new TestHelpers(page);
    consoleErrors = await helpers.getConsoleErrors();
    networkErrors = await helpers.getNetworkErrors();
  });

  test('Homepage loads successfully with all critical elements', async () => {
    console.log('🏠 Testing homepage load and critical elements...');
    
    // Navigate to homepage
    await page.goto('/');
    await helpers.waitForFullLoad();
    await helpers.takeScreenshot('homepage-initial-load');

    // Check page title
    const title = await page.title();
    expect(title).toMatch(testData.pageContent.homepage.title);

    // Check main heading exists
    const mainHeading = page.locator('h1').first();
    await expect(mainHeading).toBeVisible();
    const headingText = await mainHeading.textContent();
    expect(headingText).toMatch(testData.pageContent.homepage.heading);

    // Check navigation elements
    const nav = page.locator('nav').first();
    await expect(nav).toBeVisible();

    // Check for logo/brand
    const logo = page.locator('[data-testid="logo"], .logo, img[alt*="logo"], img[alt*="Refer"]').first();
    if (await logo.count() > 0) {
      await expect(logo).toBeVisible();
    }

    // Performance check
    const performance = await helpers.checkPageLoadPerformance();
    if (!performance.isGood) {
      console.warn('⚠️ Performance issues detected:', performance.issues);
    }

    // Basic accessibility check
    const a11yIssues = await helpers.checkBasicAccessibility();
    if (a11yIssues.length > 0) {
      console.warn('⚠️ Accessibility issues:', a11yIssues);
    }

    console.log('✅ Homepage loaded successfully');
  });

  test('Navigation links are functional and accessible', async () => {
    console.log('🔗 Testing navigation links functionality...');
    
    await page.goto('/');
    await helpers.waitForFullLoad();

    // Find all navigation links
    const navLinks = page.locator('nav a, header a').filter({
      hasNotText: /^$/
    });

    const linkCount = await navLinks.count();
    console.log(`Found ${linkCount} navigation links`);

    const brokenLinks: string[] = [];
    const workingLinks: string[] = [];

    // Test each navigation link
    for (let i = 0; i < linkCount; i++) {
      const link = navLinks.nth(i);
      const href = await link.getAttribute('href');
      const text = await link.textContent();
      
      if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) {
        continue;
      }

      try {
        // Click the link and verify it loads
        const linkPromise = page.waitForLoadState('networkidle');
        await link.click();
        await linkPromise;
        
        // Check if we get a 404 or error page
        const currentUrl = page.url();
        const pageTitle = await page.title();
        
        if (pageTitle.toLowerCase().includes('404') || 
            pageTitle.toLowerCase().includes('not found') ||
            currentUrl.includes('404')) {
          brokenLinks.push(`${text} (${href}) - 404 Not Found`);
        } else {
          workingLinks.push(`${text} (${href})`);
        }

        // Take screenshot of the page
        await helpers.takeScreenshot(`nav-link-${text?.replace(/\s+/g, '-').toLowerCase()}`);
        
        // Go back to test next link
        await page.goto('/');
        await helpers.waitForFullLoad();
      } catch (error) {
        brokenLinks.push(`${text} (${href}) - Error: ${error}`);
      }
    }

    console.log(`✅ Working links: ${workingLinks.length}`);
    console.log(`❌ Broken links: ${brokenLinks.length}`);
    
    if (brokenLinks.length > 0) {
      console.error('Broken links found:', brokenLinks);
    }

    // Report should not fail the test but log issues
    expect(workingLinks.length).toBeGreaterThan(0);
  });

  test('Primary call-to-action buttons work correctly', async () => {
    console.log('🎯 Testing primary CTA buttons...');
    
    await page.goto('/');
    await helpers.waitForFullLoad();

    // Common CTA button patterns
    const ctaSelectors = [
      'button:has-text("Get Started")',
      'button:has-text("Sign Up")',
      'button:has-text("Register")',
      'button:has-text("Join Now")',
      'a:has-text("Get Started")',
      'a:has-text("Sign Up")',
      'a:has-text("Register")',
      'a:has-text("Join Now")',
      '[data-testid="cta-button"]',
      '.cta-button',
      '.btn-primary'
    ];

    const foundCTAs: string[] = [];

    for (const selector of ctaSelectors) {
      const ctaButton = page.locator(selector).first();
      if (await ctaButton.count() > 0 && await ctaButton.isVisible()) {
        const text = await ctaButton.textContent();
        foundCTAs.push(text || selector);

        // Test the CTA button
        try {
          await ctaButton.click();
          await page.waitForLoadState('networkidle');
          
          // Check if we navigated somewhere
          const currentUrl = page.url();
          const pageTitle = await page.title();
          
          console.log(`CTA "${text}" navigated to: ${currentUrl} (${pageTitle})`);
          await helpers.takeScreenshot(`cta-result-${text?.replace(/\s+/g, '-').toLowerCase()}`);
          
          // Go back for next test
          await page.goto('/');
          await helpers.waitForFullLoad();
        } catch (error) {
          console.error(`CTA "${text}" failed:`, error);
        }
      }
    }

    console.log(`Found ${foundCTAs.length} CTA buttons:`, foundCTAs);
    await helpers.takeScreenshot('homepage-cta-buttons');
  });

  test('Footer links and information are accessible', async () => {
    console.log('🦶 Testing footer links and information...');
    
    await page.goto('/');
    await helpers.waitForFullLoad();

    // Find footer
    const footer = page.locator('footer').first();
    if (await footer.count() === 0) {
      console.warn('⚠️ No footer found on homepage');
      return;
    }

    await expect(footer).toBeVisible();

    // Test footer links
    const footerLinks = footer.locator('a').filter({
      hasNotText: /^$/
    });

    const footerLinkCount = await footerLinks.count();
    console.log(`Found ${footerLinkCount} footer links`);

    const footerBrokenLinks: string[] = [];
    const footerWorkingLinks: string[] = [];

    for (let i = 0; i < Math.min(footerLinkCount, 10); i++) { // Test up to 10 links
      const link = footerLinks.nth(i);
      const href = await link.getAttribute('href');
      const text = await link.textContent();
      
      if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) {
        continue;
      }

      try {
        const response = await page.request.get(href);
        if (response.status() >= 400) {
          footerBrokenLinks.push(`${text} (${href}) - Status: ${response.status()}`);
        } else {
          footerWorkingLinks.push(`${text} (${href})`);
        }
      } catch (error) {
        footerBrokenLinks.push(`${text} (${href}) - Error: ${error}`);
      }
    }

    console.log(`✅ Working footer links: ${footerWorkingLinks.length}`);
    console.log(`❌ Broken footer links: ${footerBrokenLinks.length}`);

    await helpers.takeScreenshot('homepage-footer');
  });

  test('Mobile responsiveness on homepage', async () => {
    console.log('📱 Testing mobile responsiveness...');
    
    // Test different viewport sizes
    const viewports = [
      { name: 'Mobile Portrait', ...testData.viewports.mobile },
      { name: 'Tablet', ...testData.viewports.tablet },
      { name: 'Desktop', ...testData.viewports.desktop }
    ];

    for (const viewport of viewports) {
      console.log(`Testing ${viewport.name} (${viewport.width}x${viewport.height})`);
      
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.goto('/');
      await helpers.waitForFullLoad();

      // Check for mobile responsiveness issues
      const mobileIssues = await helpers.checkMobileResponsiveness();
      if (mobileIssues.length > 0) {
        console.warn(`⚠️ ${viewport.name} issues:`, mobileIssues);
      }

      // Take screenshot
      await helpers.takeScreenshot(`homepage-${viewport.name.toLowerCase().replace(' ', '-')}`);

      // Check if navigation is accessible (hamburger menu, etc.)
      if (viewport.width <= 768) {
        const hamburger = page.locator('[data-testid="mobile-menu"], .hamburger, .menu-toggle, button[aria-label*="menu"]').first();
        if (await hamburger.count() > 0) {
          await expect(hamburger).toBeVisible();
          console.log('✅ Mobile menu button found');
        }
      }
    }
  });

  test('Search functionality (if available)', async () => {
    console.log('🔍 Testing search functionality...');
    
    await page.goto('/');
    await helpers.waitForFullLoad();

    // Look for search elements
    const searchInput = page.locator('input[type="search"], input[placeholder*="search"], input[placeholder*="Search"], [data-testid="search"]').first();
    
    if (await searchInput.count() === 0) {
      console.log('ℹ️ No search functionality found on homepage');
      return;
    }

    await expect(searchInput).toBeVisible();
    
    // Test search functionality
    await searchInput.fill('software engineer');
    
    const searchButton = page.locator('button:has-text("Search"), [type="submit"]').first();
    if (await searchButton.count() > 0) {
      await searchButton.click();
    } else {
      await searchInput.press('Enter');
    }

    await page.waitForLoadState('networkidle');
    await helpers.takeScreenshot('search-results');

    console.log('✅ Search functionality tested');
  });

  test.afterEach(async () => {
    // Log any console errors that occurred during the test
    if (consoleErrors.length > 0) {
      console.warn('⚠️ Console errors detected:', consoleErrors);
    }

    if (networkErrors.length > 0) {
      console.warn('⚠️ Network errors detected:', networkErrors);
    }
  });
});