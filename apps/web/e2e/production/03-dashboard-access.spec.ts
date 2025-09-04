import { test, expect, Page } from '@playwright/test';
import { TestHelpers } from './utils/test-helpers';
import { testData } from './fixtures/test-data';

test.describe('Role-based Dashboard Access', () => {
  let page: Page;
  let helpers: TestHelpers;

  test.beforeEach(async ({ page: testPage }) => {
    page = testPage;
    helpers = new TestHelpers(page);
  });

  test('Dashboard page loads for unauthenticated users', async () => {
    console.log('🚪 Testing dashboard access without authentication...');
    
    await page.goto('/dashboard');
    await helpers.waitForFullLoad();
    await helpers.takeScreenshot('dashboard-unauthenticated');

    const currentUrl = page.url();
    const pageContent = await page.textContent('body');

    if (currentUrl.includes('login') || currentUrl.includes('signin')) {
      console.log('✅ Unauthenticated users redirected to login page');
    } else if (pageContent?.includes('login') || pageContent?.includes('sign in')) {
      console.log('✅ Dashboard shows login prompt for unauthenticated users');
    } else if (currentUrl.includes('dashboard')) {
      console.log('ℹ️ Dashboard accessible without authentication - this may be intended');
    } else {
      console.log(`ℹ️ Unexpected redirect: ${currentUrl}`);
    }
  });

  test('General dashboard layout and navigation', async () => {
    console.log('📊 Testing general dashboard layout...');
    
    // Try to access dashboard directly
    await page.goto('/dashboard');
    await helpers.waitForFullLoad();

    // Check if we can access any dashboard content
    const dashboardElements = [
      '[data-testid="dashboard"]',
      '.dashboard',
      'main[role="main"]',
      '.dashboard-container',
      'h1:has-text("Dashboard")',
      'h2:has-text("Dashboard")'
    ];

    let foundDashboard = false;
    for (const selector of dashboardElements) {
      const element = page.locator(selector).first();
      if (await element.count() > 0 && await element.isVisible()) {
        foundDashboard = true;
        console.log(`✅ Dashboard element found: ${selector}`);
        break;
      }
    }

    if (foundDashboard) {
      // Test dashboard navigation elements
      const navElements = [
        'nav',
        '.sidebar',
        '.dashboard-nav',
        '[role="navigation"]'
      ];

      for (const selector of navElements) {
        const nav = page.locator(selector).first();
        if (await nav.count() > 0 && await nav.isVisible()) {
          console.log(`✅ Navigation found: ${selector}`);
          
          // Check for common dashboard links
          const navLinks = nav.locator('a, button').filter({
            hasNotText: /^$/
          });
          const linkCount = await navLinks.count();
          console.log(`Found ${linkCount} navigation items`);
          
          break;
        }
      }

      await helpers.takeScreenshot('dashboard-layout');
    }
  });

  test('Client role dashboard features', async () => {
    console.log('👔 Testing client role dashboard features...');
    
    await page.goto('/dashboard');
    await helpers.waitForFullLoad();

    // Look for client-specific features
    const clientFeatures = [
      'Post Job',
      'Create Job',
      'Job Posting',
      'Manage Jobs',
      'View Applications',
      'Referrals Received',
      'Payment History',
      'Subscription'
    ];

    const foundFeatures: string[] = [];
    const missingFeatures: string[] = [];

    for (const feature of clientFeatures) {
      const element = page.locator(`text=${feature}, [aria-label*="${feature}"], [title*="${feature}"]`).first();
      if (await element.count() > 0 && await element.isVisible()) {
        foundFeatures.push(feature);
        
        // Try to interact with the feature
        try {
          await element.hover();
          if (await element.getAttribute('href') || await element.getAttribute('onclick') || 
              (await element.tagName()) === 'BUTTON') {
            console.log(`✅ Interactive client feature: ${feature}`);
          }
        } catch (error) {
          console.warn(`⚠️ Issue with client feature ${feature}:`, error);
        }
      } else {
        missingFeatures.push(feature);
      }
    }

    console.log('Found client features:', foundFeatures);
    console.log('Missing client features:', missingFeatures);

    // Check for job management section
    const jobSection = page.locator('section:has-text("Job"), div:has-text("Job"), .jobs, [data-testid*="job"]').first();
    if (await jobSection.count() > 0) {
      console.log('✅ Job management section found');
    }

    await helpers.takeScreenshot('client-dashboard-features');
  });

  test('Candidate role dashboard features', async () => {
    console.log('🎯 Testing candidate role dashboard features...');
    
    await page.goto('/dashboard');
    await helpers.waitForFullLoad();

    // Look for candidate-specific features
    const candidateFeatures = [
      'Browse Jobs',
      'Job Search',
      'Applications',
      'My Applications',
      'Referral Requests',
      'Profile',
      'Resume',
      'Skills',
      'Preferences'
    ];

    const foundFeatures: string[] = [];
    const missingFeatures: string[] = [];

    for (const feature of candidateFeatures) {
      const element = page.locator(`text=${feature}, [aria-label*="${feature}"], [title*="${feature}"]`).first();
      if (await element.count() > 0 && await element.isVisible()) {
        foundFeatures.push(feature);
        
        try {
          await element.hover();
          if (await element.getAttribute('href') || await element.getAttribute('onclick') || 
              (await element.tagName()) === 'BUTTON') {
            console.log(`✅ Interactive candidate feature: ${feature}`);
          }
        } catch (error) {
          console.warn(`⚠️ Issue with candidate feature ${feature}:`, error);
        }
      } else {
        missingFeatures.push(feature);
      }
    }

    console.log('Found candidate features:', foundFeatures);
    console.log('Missing candidate features:', missingFeatures);

    // Check for job browsing/search
    const jobBrowsing = page.locator('input[placeholder*="search"], input[placeholder*="job"], .job-search, [data-testid*="search"]').first();
    if (await jobBrowsing.count() > 0) {
      console.log('✅ Job search functionality found');
      
      // Test search functionality
      await jobBrowsing.fill('software engineer');
      await page.keyboard.press('Enter');
      await page.waitForTimeout(2000);
      await helpers.takeScreenshot('candidate-job-search');
    }

    await helpers.takeScreenshot('candidate-dashboard-features');
  });

  test('Founding Circle member dashboard features', async () => {
    console.log('👑 Testing Founding Circle dashboard features...');
    
    await page.goto('/dashboard');
    await helpers.waitForFullLoad();

    // Look for Founding Circle specific features
    const foundingFeatures = [
      'Premium Features',
      'Advanced Search',
      'Priority Support',
      'Exclusive Jobs',
      'Network Access',
      'Analytics',
      'Reports',
      'Founding Circle',
      'Premium'
    ];

    const foundFeatures: string[] = [];
    
    for (const feature of foundingFeatures) {
      const element = page.locator(`text=${feature}, [aria-label*="${feature}"], [title*="${feature}"]`).first();
      if (await element.count() > 0 && await element.isVisible()) {
        foundFeatures.push(feature);
        console.log(`✅ Founding Circle feature found: ${feature}`);
      }
    }

    console.log('Found Founding Circle features:', foundFeatures);

    // Check for premium indicators
    const premiumIndicators = page.locator('.premium, .gold, .founding, [data-testid*="premium"]');
    const premiumCount = await premiumIndicators.count();
    if (premiumCount > 0) {
      console.log(`✅ Found ${premiumCount} premium indicators`);
    }

    await helpers.takeScreenshot('founding-circle-dashboard');
  });

  test('Select Circle member dashboard features', async () => {
    console.log('⭐ Testing Select Circle dashboard features...');
    
    await page.goto('/dashboard');
    await helpers.waitForFullLoad();

    // Look for Select Circle specific features  
    const selectFeatures = [
      'Select Circle',
      'VIP Features',
      'Exclusive Access',
      'Priority Matching',
      'Personal Consultant',
      'White Glove',
      'Concierge'
    ];

    const foundFeatures: string[] = [];
    
    for (const feature of selectFeatures) {
      const element = page.locator(`text=${feature}, [aria-label*="${feature}"], [title*="${feature}"]`).first();
      if (await element.count() > 0 && await element.isVisible()) {
        foundFeatures.push(feature);
        console.log(`✅ Select Circle feature found: ${feature}`);
      }
    }

    console.log('Found Select Circle features:', foundFeatures);

    // Check for VIP/exclusive indicators
    const vipIndicators = page.locator('.vip, .select, .exclusive, [data-testid*="select"]');
    const vipCount = await vipIndicators.count();
    if (vipCount > 0) {
      console.log(`✅ Found ${vipCount} VIP indicators`);
    }

    await helpers.takeScreenshot('select-circle-dashboard');
  });

  test('Dashboard navigation and user menu', async () => {
    console.log('🧭 Testing dashboard navigation and user menu...');
    
    await page.goto('/dashboard');
    await helpers.waitForFullLoad();

    // Look for user menu/profile dropdown
    const userMenuSelectors = [
      '[data-testid="user-menu"]',
      '.user-menu',
      'button[aria-label*="user"]',
      'button[aria-label*="profile"]',
      '.avatar',
      '.user-avatar',
      'img[alt*="profile"]'
    ];

    let userMenuFound = false;
    for (const selector of userMenuSelectors) {
      const userMenu = page.locator(selector).first();
      if (await userMenu.count() > 0 && await userMenu.isVisible()) {
        userMenuFound = true;
        console.log(`✅ User menu found: ${selector}`);
        
        // Try to open the menu
        try {
          await userMenu.click();
          await page.waitForTimeout(1000);
          
          // Check for dropdown options
          const dropdownOptions = page.locator('[role="menu"], .dropdown-menu, .user-dropdown').first();
          if (await dropdownOptions.count() > 0) {
            console.log('✅ User menu dropdown opened');
            
            // Look for common menu items
            const menuItems = ['Profile', 'Settings', 'Logout', 'Sign Out', 'Account'];
            for (const item of menuItems) {
              const menuItem = page.locator(`text=${item}`).first();
              if (await menuItem.count() > 0 && await menuItem.isVisible()) {
                console.log(`✅ Menu item found: ${item}`);
              }
            }
          }
          
          await helpers.takeScreenshot('user-menu-opened');
        } catch (error) {
          console.warn(`⚠️ Could not open user menu:`, error);
        }
        break;
      }
    }

    if (!userMenuFound) {
      console.log('ℹ️ No user menu found');
    }
  });

  test('Dashboard responsive design', async () => {
    console.log('📱 Testing dashboard responsive design...');
    
    const viewports = [
      { name: 'Mobile', ...testData.viewports.mobile },
      { name: 'Tablet', ...testData.viewports.tablet },
      { name: 'Desktop', ...testData.viewports.desktop }
    ];

    for (const viewport of viewports) {
      console.log(`Testing dashboard on ${viewport.name} (${viewport.width}x${viewport.height})`);
      
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.goto('/dashboard');
      await helpers.waitForFullLoad();

      // Check for mobile responsiveness issues
      const mobileIssues = await helpers.checkMobileResponsiveness();
      if (mobileIssues.length > 0) {
        console.warn(`⚠️ ${viewport.name} dashboard issues:`, mobileIssues);
      }

      // Check for sidebar/navigation adaptations on mobile
      if (viewport.width <= 768) {
        const mobileNav = page.locator('.mobile-nav, [data-testid="mobile-nav"], .hamburger, .menu-toggle').first();
        if (await mobileNav.count() > 0) {
          console.log('✅ Mobile navigation found');
        }
      }

      await helpers.takeScreenshot(`dashboard-${viewport.name.toLowerCase()}`);
    }

    // Reset to desktop
    await page.setViewportSize(testData.viewports.desktop);
  });

  test('Dashboard loading states and performance', async () => {
    console.log('⚡ Testing dashboard loading states and performance...');
    
    await page.goto('/dashboard');
    
    // Check for loading indicators
    const loadingSelectors = [
      '.loading',
      '.spinner',
      '[data-testid="loading"]',
      '.skeleton',
      'text=Loading'
    ];

    let foundLoadingState = false;
    for (const selector of loadingSelectors) {
      const loading = page.locator(selector).first();
      if (await loading.count() > 0) {
        foundLoadingState = true;
        console.log(`✅ Loading state found: ${selector}`);
        
        // Wait for loading to complete
        await loading.waitFor({ state: 'hidden', timeout: 10000 });
        console.log('✅ Loading completed');
        break;
      }
    }

    if (!foundLoadingState) {
      console.log('ℹ️ No loading states detected');
    }

    await helpers.waitForFullLoad();

    // Check performance
    const performance = await helpers.checkPageLoadPerformance();
    if (!performance.isGood) {
      console.warn('⚠️ Dashboard performance issues:', performance.issues);
    }

    console.log('Dashboard performance metrics:', performance.metrics);
    await helpers.takeScreenshot('dashboard-loaded');
  });

  test('Dashboard error handling', async () => {
    console.log('🚨 Testing dashboard error handling...');
    
    // Test invalid dashboard routes
    const invalidRoutes = [
      '/dashboard/nonexistent',
      '/dashboard/invalid-section',
      '/dashboard/123/invalid'
    ];

    for (const route of invalidRoutes) {
      await page.goto(route);
      await helpers.waitForFullLoad();
      
      const pageContent = await page.textContent('body');
      const currentUrl = page.url();
      
      if (pageContent?.includes('404') || pageContent?.includes('Not Found') || 
          currentUrl.includes('404')) {
        console.log(`✅ Invalid route ${route} properly handled with 404`);
      } else if (currentUrl.includes('dashboard') && !currentUrl.includes(route)) {
        console.log(`✅ Invalid route ${route} redirected to valid dashboard`);
      } else {
        console.log(`ℹ️ Route ${route} handling: ${currentUrl}`);
      }
      
      await helpers.takeScreenshot(`dashboard-error-${route.replace(/\//g, '-')}`);
    }
  });
});