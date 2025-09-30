import { test, expect } from '@playwright/test';

test.describe('Production Demo Mode Testing', () => {
  
  test('Homepage loads and has working navigation', async ({ page }) => {
    await page.goto('/');
    
    // Check homepage loads
    await expect(page.locator('h1')).toContainText('Network. Refer. Earn');
    
    // Check Sign In link exists
    await expect(page.locator('text=Sign In')).toBeVisible();
    
    // Check main CTAs
    await expect(page.locator('text=Request Invitation')).toBeVisible();
    await expect(page.locator('text=Explore Client Solutions')).toBeVisible();
  });

  test('Demo switcher page works', async ({ page }) => {
    await page.goto('/demo');
    
    // Check demo page loads
    await expect(page.locator('text=Demo Mode')).toBeVisible();
    
    // Check all 4 role buttons exist
    await expect(page.locator('text=Client Company')).toBeVisible();
    await expect(page.locator('text=Founding Circle')).toBeVisible();
    await expect(page.locator('text=Select Circle')).toBeVisible();
    await expect(page.locator('text=Candidate')).toBeVisible();
  });

  test('Client demo mode works with full navigation', async ({ page }) => {
    await page.goto('/demo');
    
    // Click Client Company demo button
    await page.click('text=Client Company');
    
    // Should redirect to /client
    await page.waitForURL(/\/client/);
    
    // Check client dashboard loaded
    await expect(page.locator('h1')).toContainText('Client Dashboard');
    
    // Check navigation items appear
    await expect(page.locator('text=Dashboard')).toBeVisible();
    await expect(page.locator('text=Jobs')).toBeVisible();
    await expect(page.locator('text=Analytics')).toBeVisible();
    
    // Navigate to Analytics (best page)
    await page.click('a:has-text("Analytics")');
    await expect(page.locator('h1')).toContainText('Client Analytics');
    
    // Check analytics has data
    await expect(page.locator('text=Referrals Submitted')).toBeVisible();
    
    // Navigate to Candidates
    await page.click('a:has-text("Candidates")');
    await expect(page.locator('h1')).toContainText('Candidates');
    
    // Check candidates has demo data
    await expect(page.locator('text=Total')).toBeVisible();
  });

  test('Founding Circle demo mode works', async ({ page }) => {
    await page.goto('/demo');
    
    // Click Founding Circle
    await page.click('text=Founding Circle');
    
    // Should go to founding dashboard
    await page.waitForURL(/\/founding/);
    
    // Check navigation
    await expect(page.locator('text=Network Growth')).toBeVisible();
    await expect(page.locator('text=Revenue')).toBeVisible();
    
    // Test Revenue page (was broken)
    await page.click('a:has-text("Revenue")');
    await expect(page.locator('h1')).toContainText('Revenue Dashboard');
    
    // Should NOT say "Please sign in"
    await expect(page.locator('text=Please sign in')).not.toBeVisible();
    
    // Should have demo data
    await expect(page.locator('text=Total Monthly Revenue')).toBeVisible();
  });

  test('Select Circle demo mode works', async ({ page }) => {
    await page.goto('/demo');
    
    // Click Select Circle
    await page.click('text=Select Circle');
    
    // Should go to select dashboard
    await page.waitForURL(/\/select-circle/);
    
    // Check navigation
    await expect(page.locator('text=Earnings')).toBeVisible();
    
    // Test Earnings page (was blank)
    await page.click('a:has-text("Earnings")');
    await expect(page.locator('h1')).toContainText('Earnings Dashboard');
    
    // Should have demo data
    await expect(page.locator('text=YTD Earned')).toBeVisible();
    
    // Test Referrals page (was blank)
    await page.click('a:has-text("My Referrals")');
    await expect(page.locator('h1')).toContainText('My Referrals');
    
    // Should have demo data
    await expect(page.locator('text=Total Earnings')).toBeVisible();
  });

  test('Sign Out returns to demo page', async ({ page }) => {
    await page.goto('/demo');
    await page.click('text=Client Company');
    
    // Wait for dashboard
    await page.waitForURL(/\/client/);
    
    // Click Sign Out
    await page.click('text=Sign Out');
    
    // Should return to /demo
    await page.waitForURL(/\/demo/);
    await expect(page.locator('text=Demo Mode')).toBeVisible();
  });

  test('All marketing pages load correctly', async ({ page }) => {
    const pages = [
      { url: '/for-companies', title: 'Stop Hiring from Job Boards' },
      { url: '/join-network', title: 'Turn Your Network Into Income' },
      { url: '/how-it-works', title: 'Your Network Is Your' },
      { url: '/pricing', title: 'Choose Your Access Level' },
      { url: '/about', title: 'About Refer-ify' },
    ];

    for (const { url, title } of pages) {
      await page.goto(url);
      await expect(page.locator('h1')).toContainText(title, { timeout: 10000 });
    }
  });
});
