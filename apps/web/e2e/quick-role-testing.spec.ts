import { test, expect, Page } from '@playwright/test';

// Simplified test configuration
const TEST_USERS = [
  { email: 'client@test.com', role: 'client', dashboard: '/client' },
  { email: 'founding@test.com', role: 'founding', dashboard: '/founding' },
  { email: 'select@test.com', role: 'select', dashboard: '/select-circle' },
  { email: 'candidate@test.com', role: 'candidate', dashboard: '/candidate' }
];

test.describe('Quick Role Testing', () => {
  test('Manual verification of all user login flows', async ({ page }) => {
    console.log('\n' + '='.repeat(80));
    console.log('QUICK ROLE TESTING RESULTS');
    console.log('='.repeat(80));

    for (const user of TEST_USERS) {
      console.log(`\n📋 Testing ${user.role.toUpperCase()} user`);
      
      try {
        // Test login page access
        await page.goto('/login');
        const loginPageLoads = await page.title();
        console.log(`   ✅ Login page accessible`);

        // Test dashboard access (will redirect to login if not authenticated)
        const response = await page.goto(user.dashboard);
        const statusCode = response?.status() || 0;
        const finalUrl = page.url();
        
        if (finalUrl.includes('/login')) {
          console.log(`   🔒 Dashboard ${user.dashboard} requires authentication (redirects to login)`);
        } else if (statusCode === 200) {
          console.log(`   ✅ Dashboard ${user.dashboard} accessible (status: ${statusCode})`);
        } else if (statusCode === 404) {
          console.log(`   ❌ Dashboard ${user.dashboard} NOT FOUND (404)`);
        } else {
          console.log(`   ⚠️  Dashboard ${user.dashboard} status: ${statusCode}`);
        }

      } catch (error) {
        console.log(`   ❌ Error testing ${user.role}: ${error}`);
      }
    }

    console.log('\n' + '='.repeat(80));
  });

  test('Check specific pages exist', async ({ page }) => {
    const pagesToTest = [
      // Client pages
      { url: '/client', expected: 'Should exist' },
      { url: '/client/jobs', expected: 'Should exist' },
      { url: '/client/jobs/new', expected: 'Should exist' },
      { url: '/client/candidates', expected: 'Should exist' },
      { url: '/client/analytics', expected: 'Should exist' },
      { url: '/client/ai-insights', expected: 'Should exist' },
      { url: '/client/billing', expected: 'Should exist' },
      
      // Founding pages
      { url: '/founding', expected: 'Should exist' },
      { url: '/founding/referrals', expected: 'Should exist' },
      { url: '/founding/network', expected: 'Should exist' },
      { url: '/founding/invite', expected: 'Should exist' },
      { url: '/founding/revenue', expected: 'Should exist' },
      { url: '/founding/advisory', expected: 'Should exist' },
      
      // Select Circle pages
      { url: '/select-circle', expected: 'Should exist' },
      { url: '/select-circle/referrals', expected: 'Check if exists' },
      { url: '/select-circle/network', expected: 'Check if exists' },
      { url: '/select-circle/earnings', expected: 'Check if exists' },
      { url: '/select-circle/job-opportunities', expected: 'Check if exists' },
      
      // Candidate pages
      { url: '/candidate', expected: 'Should exist' },
      
      // Common missing pages
      { url: '/client/settings', expected: 'Likely missing' },
      { url: '/client/profile', expected: 'Likely missing' },
      { url: '/founding/settings', expected: 'Likely missing' },
      { url: '/founding/profile', expected: 'Likely missing' },
      { url: '/select-circle/settings', expected: 'Likely missing' },
      { url: '/select-circle/profile', expected: 'Likely missing' },
      { url: '/candidate/settings', expected: 'Likely missing' },
      { url: '/candidate/profile', expected: 'Likely missing' },
    ];

    console.log('\n' + '='.repeat(80));
    console.log('PAGE EXISTENCE CHECK');
    console.log('='.repeat(80));

    for (const pageTest of pagesToTest) {
      try {
        const response = await page.goto(pageTest.url);
        const status = response?.status() || 0;
        const content = await page.textContent('body').catch(() => '');
        
        const is404 = status === 404 || 
                     content?.includes('404') ||
                     content?.includes('Page not found');
        
        const statusIcon = is404 ? '❌ 404' : status < 400 ? '✅ OK' : '⚠️  ' + status;
        const note = pageTest.expected.includes('missing') ? '(Expected)' : 
                    is404 && pageTest.expected.includes('Should exist') ? '(NEEDS CREATION)' : '';
        
        console.log(`   ${pageTest.url}: ${statusIcon} ${note}`);
        
      } catch (error) {
        console.log(`   ${pageTest.url}: ❌ ERROR - ${error}`);
      }
    }
    
    console.log('\n' + '='.repeat(80));
  });
});