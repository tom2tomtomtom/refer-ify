#!/usr/bin/env node

/**
 * Test each user login and check for 404 pages
 * This script will test the actual login flow and navigation
 */

const { chromium } = require('playwright');

const TEST_USERS = [
  { email: 'client@test.com', password: 'testpass123', role: 'client', expectedDashboard: '/client' },
  { email: 'founding@test.com', password: 'testpass123', role: 'founding_circle', expectedDashboard: '/founding' },
  { email: 'select@test.com', password: 'testpass123', role: 'select_circle', expectedDashboard: '/select-circle' },
  { email: 'candidate@test.com', password: 'testpass123', role: 'candidate', expectedDashboard: '/candidate' }
];

async function testLoginFlow() {
  console.log('🧪 Testing actual login flows and checking for 404s...\n');
  
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  const results = [];
  
  for (const user of TEST_USERS) {
    console.log(`\n=== Testing ${user.role.toUpperCase()}: ${user.email} ===`);
    
    try {
      // Navigate to login page
      console.log('1. Navigating to login page...');
      await page.goto('http://localhost:3000/login', { waitUntil: 'networkidle', timeout: 10000 });
      
      // Check if login page loads - look for email input instead of form
      const emailInputExists = await page.locator('input[type="email"]').isVisible({ timeout: 5000 });
      if (!emailInputExists) {
        console.log('❌ Login form not found');
        results.push({ user: user.email, issue: 'Login form not found' });
        continue;
      }
      
      console.log('✅ Login page loaded');
      
      // Fill in credentials
      console.log('2. Filling in credentials...');
      await page.fill('#email', user.email);
      await page.fill('#password', user.password);
      
      // Submit form
      console.log('3. Submitting login form...');
      await page.click('button[type="submit"]');
      
      // Wait for redirect
      await page.waitForTimeout(3000);
      
      // Check current URL
      const currentUrl = page.url();
      console.log(`4. Current URL after login: ${currentUrl}`);
      
      // Check if redirected to expected dashboard
      const expectedUrl = `http://localhost:3000${user.expectedDashboard}`;
      const isCorrectRedirect = currentUrl === expectedUrl;
      
      if (!isCorrectRedirect) {
        console.log(`❌ Redirect issue: Expected ${expectedUrl}, got ${currentUrl}`);
        results.push({ 
          user: user.email, 
          issue: `Wrong redirect: expected ${user.expectedDashboard}, got ${currentUrl.replace('http://localhost:3000', '')}` 
        });
      } else {
        console.log(`✅ Correct redirect to ${user.expectedDashboard}`);
      }
      
      // Check if page loads without 404
      const pageContent = await page.textContent('body');
      const is404 = pageContent.includes('404') || pageContent.includes('Not Found') || pageContent.includes('This page could not be found');
      
      if (is404) {
        console.log('❌ Dashboard page shows 404');
        results.push({ user: user.email, issue: `Dashboard ${user.expectedDashboard} returns 404` });
      } else {
        console.log('✅ Dashboard page loads');
      }
      
      // Test navigation links from the role-specific menu
      console.log('5. Testing navigation links...');
      const navLinks = await page.locator('nav a').all();
      const brokenLinks = [];
      
      for (let i = 0; i < Math.min(navLinks.length, 5); i++) { // Test first 5 nav links
        try {
          const link = navLinks[i];
          const href = await link.getAttribute('href');
          if (href && href.startsWith('/')) {
            console.log(`   Testing navigation link: ${href}`);
            await page.goto(`http://localhost:3000${href}`, { waitUntil: 'domcontentloaded', timeout: 5000 });
            
            const linkPageContent = await page.textContent('body');
            const linkIs404 = linkPageContent.includes('404') || linkPageContent.includes('Not Found');
            
            if (linkIs404) {
              console.log(`   ❌ 404: ${href}`);
              brokenLinks.push(href);
            } else {
              console.log(`   ✅ OK: ${href}`);
            }
          }
        } catch (error) {
          console.log(`   ❌ Error loading nav link: ${error.message}`);
        }
      }
      
      if (brokenLinks.length > 0) {
        results.push({ 
          user: user.email, 
          issue: `404 navigation links: ${brokenLinks.join(', ')}` 
        });
      }
      
      // Sign out for next test
      try {
        await page.evaluate(() => {
          localStorage.clear();
          sessionStorage.clear();
        });
        await page.goto('http://localhost:3000', { waitUntil: 'domcontentloaded' });
      } catch (error) {
        console.log('Warning: Could not clear session');
      }
      
    } catch (error) {
      console.log(`❌ Test failed for ${user.email}: ${error.message}`);
      results.push({ user: user.email, issue: `Test failed: ${error.message}` });
    }
  }
  
  await browser.close();
  
  // Report results
  console.log('\n\n📊 COMPREHENSIVE TEST RESULTS');
  console.log('===============================');
  
  if (results.length === 0) {
    console.log('🎉 All tests passed! No issues found.');
  } else {
    console.log(`❌ Found ${results.length} issues:\n`);
    results.forEach((result, i) => {
      console.log(`${i + 1}. ${result.user}: ${result.issue}`);
    });
    
    console.log('\n🔧 RECOMMENDED FIXES:');
    console.log('- Check login redirect logic in auth components');
    console.log('- Create missing dashboard pages');
    console.log('- Fix 404 navigation links');
    console.log('- Verify role-based routing works correctly');
  }
  
  return results;
}

// Check if Playwright is available
async function checkPlaywright() {
  try {
    const { chromium } = require('playwright');
    return true;
  } catch (error) {
    console.log('❌ Playwright not available. Install with: npm install -D playwright');
    console.log('   Then run: npx playwright install');
    return false;
  }
}

// Run the test
checkPlaywright().then(async (hasPlaywright) => {
  if (!hasPlaywright) {
    console.log('\n🔧 Alternative: Test manually by visiting http://localhost:3000/login');
    console.log('   and logging in with each user to check for 404s');
    return;
  }
  
  const results = await testLoginFlow();
  process.exit(results.length > 0 ? 1 : 0);
}).catch(error => {
  console.error('💥 Test script failed:', error);
  process.exit(1);
});