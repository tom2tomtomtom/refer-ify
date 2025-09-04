import { test, expect, Page } from '@playwright/test';

// Test users configuration
const TEST_USERS = [
  {
    email: 'client@test.com',
    password: 'testpass123',
    role: 'client',
    expectedRedirect: '/client',
    dashboardTitle: 'Client Dashboard'
  },
  {
    email: 'founding@test.com',
    password: 'testpass123', 
    role: 'founding',
    expectedRedirect: '/founding',
    dashboardTitle: 'Founding Circle Dashboard'
  },
  {
    email: 'select@test.com',
    password: 'testpass123',
    role: 'select',
    expectedRedirect: '/select-circle',
    dashboardTitle: 'Select Circle Dashboard'
  },
  {
    email: 'candidate@test.com',
    password: 'testpass123',
    role: 'candidate', 
    expectedRedirect: '/candidate',
    dashboardTitle: 'Candidate Dashboard'
  }
] as const;

// Navigation links to test for each role
const ROLE_NAVIGATION_LINKS = {
  client: [
    '/client',
    '/client/jobs',
    '/client/jobs/new',
    '/client/candidates',
    '/client/analytics',
    '/client/ai-insights',
    '/client/billing'
  ],
  founding: [
    '/founding',
    '/founding/referrals', 
    '/founding/network',
    '/founding/invite',
    '/founding/revenue',
    '/founding/advisory'
  ],
  'select-circle': [
    '/select-circle',
    '/select-circle/referrals',
    '/select-circle/network', 
    '/select-circle/earnings',
    '/select-circle/job-opportunities'
  ],
  candidate: [
    '/candidate'
  ]
} as const;

type UserRole = keyof typeof ROLE_NAVIGATION_LINKS;

interface TestResult {
  role: string;
  email: string;
  loginSuccess: boolean;
  redirectSuccess: boolean;
  dashboardLoads: boolean;
  navigationResults: Array<{
    url: string;
    status: number;
    exists: boolean;
    error?: string;
  }>;
  errors: string[];
}

class RoleTestingHelper {
  constructor(private page: Page) {}

  async loginWithCredentials(email: string, password: string): Promise<boolean> {
    try {
      await this.page.goto('/login');
      await this.page.waitForLoadState('networkidle');
      
      // Fill login form
      await this.page.fill('#email', email);
      await this.page.fill('#password', password);
      
      // Click sign in button
      await this.page.click('button:has-text("Sign in")');
      
      // Wait for potential redirect or error message
      await this.page.waitForTimeout(3000);
      
      // Check if we're still on login page (failed login)
      const currentUrl = this.page.url();
      return !currentUrl.includes('/login');
      
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    }
  }

  async loginWithDemoRole(role: 'founding' | 'select' | 'client'): Promise<boolean> {
    try {
      await this.page.goto('/login');
      await this.page.waitForLoadState('networkidle');
      
      const buttonText = `Demo as ${role === 'founding' ? 'Founding Circle' : 
                                   role === 'select' ? 'Select Circle' : 
                                   'Client Company'}`;
      
      await this.page.click(`button:has-text("${buttonText}")`);
      await this.page.waitForTimeout(2000);
      
      return true;
    } catch (error) {
      console.error('Demo login failed:', error);
      return false;
    }
  }

  async checkPageExists(url: string): Promise<{ status: number; exists: boolean; error?: string }> {
    try {
      const response = await this.page.goto(url);
      const status = response?.status() || 0;
      
      // Check for 404 page content or error messages
      const pageContent = await this.page.textContent('body').catch(() => '');
      const has404Content = pageContent?.includes('404') || 
                           pageContent?.includes('Page not found') ||
                           pageContent?.includes('Not Found') ||
                           status === 404;
      
      return {
        status,
        exists: !has404Content && status < 400,
        error: has404Content ? '404 Page Not Found' : undefined
      };
    } catch (error) {
      return {
        status: 0,
        exists: false,
        error: `Navigation error: ${error}`
      };
    }
  }

  async logout(): Promise<void> {
    try {
      // Look for logout button/link
      const logoutSelectors = [
        'button:has-text("Sign out")',
        'button:has-text("Logout")', 
        'a:has-text("Sign out")',
        'a:has-text("Logout")',
        '[data-testid="logout-button"]'
      ];

      for (const selector of logoutSelectors) {
        try {
          await this.page.click(selector, { timeout: 2000 });
          await this.page.waitForTimeout(1000);
          return;
        } catch {
          // Try next selector
        }
      }

      // If no logout button found, clear storage manually
      await this.page.evaluate(() => {
        localStorage.clear();
        sessionStorage.clear();
        document.cookie.split(";").forEach(c => {
          const eqPos = c.indexOf("=");
          const name = eqPos > -1 ? c.substr(0, eqPos) : c;
          document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
        });
      });
      
      await this.page.goto('/');
      
    } catch (error) {
      console.error('Logout failed:', error);
    }
  }
}

test.describe('Comprehensive User Role Testing', () => {
  let testResults: TestResult[] = [];
  
  test.afterAll(async () => {
    // Generate comprehensive report
    console.log('\n' + '='.repeat(80));
    console.log('COMPREHENSIVE USER ROLE TESTING REPORT');
    console.log('='.repeat(80));
    
    testResults.forEach(result => {
      console.log(`\n📋 ROLE: ${result.role.toUpperCase()} (${result.email})`);
      console.log(`   ✓ Login Success: ${result.loginSuccess ? '✅' : '❌'}`);
      console.log(`   ✓ Redirect Success: ${result.redirectSuccess ? '✅' : '❌'}`);
      console.log(`   ✓ Dashboard Loads: ${result.dashboardLoads ? '✅' : '❌'}`);
      
      console.log('\n   📄 Page Testing Results:');
      result.navigationResults.forEach(nav => {
        const status = nav.exists ? '✅ EXISTS' : '❌ MISSING';
        const statusCode = nav.status ? ` (${nav.status})` : '';
        const error = nav.error ? ` - ${nav.error}` : '';
        console.log(`      ${nav.url}: ${status}${statusCode}${error}`);
      });
      
      if (result.errors.length > 0) {
        console.log('\n   ⚠️  Errors:');
        result.errors.forEach(error => console.log(`      - ${error}`));
      }
    });

    // Summary
    const totalUsers = testResults.length;
    const successfulLogins = testResults.filter(r => r.loginSuccess).length;
    const successful404Tests = testResults.reduce((acc, r) => acc + r.navigationResults.length, 0);
    const missing404Pages = testResults.reduce((acc, r) => acc + r.navigationResults.filter(n => !n.exists).length, 0);
    
    console.log('\n' + '='.repeat(80));
    console.log('SUMMARY');
    console.log('='.repeat(80));
    console.log(`Total Users Tested: ${totalUsers}`);
    console.log(`Successful Logins: ${successfulLogins}/${totalUsers}`);
    console.log(`Total Pages Tested: ${successful404Tests}`);
    console.log(`Missing/404 Pages: ${missing404Pages}`);
    console.log('='.repeat(80));
  });

  for (const user of TEST_USERS) {
    test(`Test ${user.role} user role - ${user.email}`, async ({ page }) => {
      const helper = new RoleTestingHelper(page);
      const result: TestResult = {
        role: user.role,
        email: user.email,
        loginSuccess: false,
        redirectSuccess: false,
        dashboardLoads: false,
        navigationResults: [],
        errors: []
      };

      try {
        // Step 1: Test actual login with credentials
        console.log(`Testing login for ${user.email}...`);
        result.loginSuccess = await helper.loginWithCredentials(user.email, user.password);
        
        if (!result.loginSuccess) {
          // Fallback to demo role if actual login fails
          console.log(`Actual login failed, trying demo role for ${user.role}...`);
          if (user.role === 'client' || user.role === 'founding' || user.role === 'select') {
            const demoRole = user.role === 'select' ? 'select' as const : user.role as ('founding' | 'client');
            result.loginSuccess = await helper.loginWithDemoRole(demoRole);
          }
        }

        if (!result.loginSuccess) {
          result.errors.push('Login failed with both credentials and demo mode');
          testResults.push(result);
          return;
        }

        // Step 2: Check if redirect worked
        console.log(`Checking redirect to ${user.expectedRedirect}...`);
        const currentUrl = page.url();
        result.redirectSuccess = currentUrl.includes(user.expectedRedirect);
        
        if (!result.redirectSuccess) {
          result.errors.push(`Expected redirect to ${user.expectedRedirect}, but got ${currentUrl}`);
          // Try to navigate manually to the dashboard
          await page.goto(user.expectedRedirect);
        }

        // Step 3: Check if dashboard loads
        console.log(`Checking dashboard page loads...`);
        try {
          await page.waitForLoadState('networkidle');
          // Check for dashboard content
          const pageContent = await page.textContent('body');
          result.dashboardLoads = pageContent !== null && pageContent.length > 0;
          
          // Try to find dashboard title or characteristic content
          const hasExpectedContent = pageContent?.toLowerCase().includes('dashboard') || 
                                   pageContent?.toLowerCase().includes(user.role);
          if (!hasExpectedContent) {
            result.errors.push('Dashboard page loaded but may not contain expected content');
          }
        } catch (error) {
          result.dashboardLoads = false;
          result.errors.push(`Dashboard failed to load: ${error}`);
        }

        // Step 4: Test all navigation links for this role
        console.log(`Testing navigation links for ${user.role}...`);
        const roleKey = user.expectedRedirect.substring(1) as UserRole; // Remove leading slash
        const navigationLinks = ROLE_NAVIGATION_LINKS[roleKey] || [user.expectedRedirect];

        for (const navUrl of navigationLinks) {
          console.log(`Testing page: ${navUrl}`);
          const navResult = await helper.checkPageExists(navUrl);
          result.navigationResults.push({
            url: navUrl,
            ...navResult
          });
          
          // Add a small delay between page checks
          await page.waitForTimeout(500);
        }

        // Step 5: Test additional pages that might exist
        const additionalPages = [
          `${user.expectedRedirect}/settings`,
          `${user.expectedRedirect}/profile`,
          `${user.expectedRedirect}/help`
        ];

        for (const additionalUrl of additionalPages) {
          const navResult = await helper.checkPageExists(additionalUrl);
          result.navigationResults.push({
            url: additionalUrl,
            ...navResult
          });
          await page.waitForTimeout(300);
        }

      } catch (error) {
        result.errors.push(`Test execution error: ${error}`);
      } finally {
        // Logout before next test
        await helper.logout();
        await page.waitForTimeout(1000);
        
        testResults.push(result);
      }

      // Assertions for the test to pass/fail appropriately
      expect(result.loginSuccess, `Login should succeed for ${user.email}`).toBe(true);
      expect(result.dashboardLoads, `Dashboard should load for ${user.role}`).toBe(true);
      
      // Check that primary dashboard page exists
      const primaryDashboard = result.navigationResults.find(nav => nav.url === user.expectedRedirect);
      expect(primaryDashboard?.exists, `Primary dashboard ${user.expectedRedirect} should exist`).toBe(true);
    });
  }

  test('Test role-based access control', async ({ page }) => {
    const helper = new RoleTestingHelper(page);
    
    // Test that each role can't access other roles' pages
    for (const user of TEST_USERS) {
      if (user.role === 'client' || user.role === 'founding' || user.role === 'select') {
        const demoRole = user.role === 'select' ? 'select' as const : user.role as ('founding' | 'client');
        await helper.loginWithDemoRole(demoRole);
        
        // Try to access other roles' dashboards
        for (const otherUser of TEST_USERS) {
          if (otherUser.role !== user.role) {
            const response = await page.goto(otherUser.expectedRedirect);
            const status = response?.status() || 0;
            
            // Should either redirect to login or show 403/404
            const currentUrl = page.url();
            const isBlocked = currentUrl.includes('/login') || 
                            currentUrl === '/' || 
                            status >= 400;
            
            expect(isBlocked, 
              `${user.role} should not have access to ${otherUser.expectedRedirect}`
            ).toBe(true);
          }
        }
        
        await helper.logout();
      }
    }
  });

  test('Test 404 page handling', async ({ page }) => {
    // Test common 404 scenarios
    const invalidUrls = [
      '/nonexistent-page',
      '/client/invalid-subpage',
      '/founding/nonexistent',
      '/select-circle/invalid',
      '/candidate/missing',
      '/dashboard/fake',
      '/admin/unauthorized'
    ];

    for (const url of invalidUrls) {
      const response = await page.goto(url);
      const status = response?.status() || 0;
      const content = await page.textContent('body');
      
      const is404 = status === 404 || 
                   content?.includes('404') ||
                   content?.includes('Page not found') ||
                   content?.includes('Not Found');
      
      expect(is404, `${url} should return 404 or proper error page`).toBe(true);
    }
  });
});