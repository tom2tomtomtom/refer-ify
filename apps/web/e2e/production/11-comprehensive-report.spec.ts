import { test, expect, Page } from '@playwright/test';
import { TestHelpers } from './utils/test-helpers';
import { testData } from './fixtures/test-data';

interface TestResult {
  category: string;
  testName: string;
  status: 'passed' | 'failed' | 'warning';
  details: string[];
  screenshots: string[];
  recommendations: string[];
}

test.describe('Comprehensive Site Analysis and Report Generation', () => {
  let page: Page;
  let helpers: TestHelpers;
  let testResults: TestResult[] = [];

  test.beforeEach(async ({ page: testPage }) => {
    page = testPage;
    helpers = new TestHelpers(page);
    testResults = [];
  });

  const addResult = (category: string, testName: string, status: 'passed' | 'failed' | 'warning', details: string[], recommendations: string[] = []) => {
    testResults.push({
      category,
      testName,
      status,
      details,
      screenshots: [],
      recommendations
    });
  };

  test('Complete site audit and analysis', async () => {
    console.log('🔍 Starting comprehensive site audit...');
    
    // 1. Homepage Analysis
    console.log('\n=== HOMEPAGE ANALYSIS ===');
    try {
      await page.goto('/', { timeout: 30000 });
      await helpers.waitForFullLoad();
      
      // Check if homepage loads
      const title = await page.title();
      const hasContent = await page.locator('body').textContent();
      
      if (hasContent && hasContent.length > 100) {
        addResult('Homepage', 'Page Loading', 'passed', [`Title: ${title}`, `Content length: ${hasContent.length} chars`]);
      } else {
        addResult('Homepage', 'Page Loading', 'failed', ['Homepage appears to be empty or not loading properly']);
      }

      // Check navigation
      const navLinks = page.locator('nav a, header a').filter({ hasNotText: /^$/ });
      const navCount = await navLinks.count();
      
      if (navCount > 0) {
        addResult('Homepage', 'Navigation', 'passed', [`Found ${navCount} navigation links`]);
        
        // Test a few key links
        const keyLinks = ['login', 'register', 'about', 'contact', 'pricing'];
        for (const linkText of keyLinks) {
          const link = page.locator(`a:has-text("${linkText}"), a[href*="${linkText}"]`).first();
          if (await link.count() > 0) {
            addResult('Homepage', `${linkText} Link`, 'passed', [`${linkText} link found`]);
          } else {
            addResult('Homepage', `${linkText} Link`, 'warning', [`${linkText} link not found`]);
          }
        }
      } else {
        addResult('Homepage', 'Navigation', 'failed', ['No navigation links found']);
      }

      await helpers.takeScreenshot('homepage-audit');

    } catch (error) {
      addResult('Homepage', 'Overall', 'failed', [`Error: ${error}`], ['Check if site is accessible and DNS is properly configured']);
    }

    // 2. Authentication Pages
    console.log('\n=== AUTHENTICATION ANALYSIS ===');
    const authPages = ['/login', '/register'];
    
    for (const authPage of authPages) {
      try {
        console.log(`Testing ${authPage}...`);
        await page.goto(authPage, { timeout: 15000 });
        await helpers.waitForFullLoad();
        
        const pageTitle = await page.title();
        const form = page.locator('form').first();
        const hasForm = await form.count() > 0;
        
        if (hasForm) {
          addResult('Authentication', `${authPage} Form`, 'passed', [`Page title: ${pageTitle}`, 'Form found']);
          
          // Check form fields
          const emailField = form.locator('input[type="email"], input[name*="email"]');
          const passwordField = form.locator('input[type="password"]');
          const submitButton = form.locator('button[type="submit"], input[type="submit"]');
          
          const fieldChecks = [
            { name: 'Email Field', element: emailField },
            { name: 'Password Field', element: passwordField },
            { name: 'Submit Button', element: submitButton }
          ];
          
          for (const check of fieldChecks) {
            const count = await check.element.count();
            if (count > 0) {
              addResult('Authentication', `${authPage} ${check.name}`, 'passed', [`${check.name} found`]);
            } else {
              addResult('Authentication', `${authPage} ${check.name}`, 'warning', [`${check.name} not found`]);
            }
          }
        } else {
          addResult('Authentication', `${authPage} Form`, 'failed', [`No form found on ${authPage}`], ['Ensure authentication forms are properly implemented']);
        }
        
        await helpers.takeScreenshot(`auth-${authPage.replace('/', '')}`);
        
      } catch (error) {
        addResult('Authentication', `${authPage}`, 'failed', [`Error accessing ${authPage}: ${error}`]);
      }
    }

    // 3. Dashboard Access
    console.log('\n=== DASHBOARD ANALYSIS ===');
    try {
      await page.goto('/dashboard', { timeout: 15000 });
      await helpers.waitForFullLoad();
      
      const currentUrl = page.url();
      const pageContent = await page.textContent('body');
      
      if (currentUrl.includes('login') || currentUrl.includes('signin')) {
        addResult('Dashboard', 'Access Control', 'passed', ['Unauthenticated users properly redirected to login']);
      } else if (pageContent?.includes('dashboard') || pageContent?.includes('Dashboard')) {
        addResult('Dashboard', 'Access Control', 'warning', ['Dashboard accessible without authentication - verify if this is intended']);
      } else {
        addResult('Dashboard', 'Access Control', 'warning', ['Dashboard behavior unclear']);
      }
      
      await helpers.takeScreenshot('dashboard-access');
      
    } catch (error) {
      addResult('Dashboard', 'Access', 'failed', [`Error: ${error}`]);
    }

    // 4. Mobile Responsiveness Check
    console.log('\n=== MOBILE RESPONSIVENESS ===');
    const viewports = [
      { name: 'Mobile', width: 375, height: 667 },
      { name: 'Tablet', width: 768, height: 1024 },
      { name: 'Desktop', width: 1280, height: 720 }
    ];

    for (const viewport of viewports) {
      try {
        await page.setViewportSize({ width: viewport.width, height: viewport.height });
        await page.goto('/', { timeout: 15000 });
        await helpers.waitForFullLoad();
        
        const mobileIssues = await helpers.checkMobileResponsiveness();
        
        if (mobileIssues.length === 0) {
          addResult('Mobile Responsiveness', viewport.name, 'passed', [`No responsive issues on ${viewport.name}`]);
        } else {
          addResult('Mobile Responsiveness', viewport.name, 'warning', [`Issues on ${viewport.name}:`, ...mobileIssues]);
        }
        
        await helpers.takeScreenshot(`responsive-${viewport.name.toLowerCase()}`);
        
      } catch (error) {
        addResult('Mobile Responsiveness', viewport.name, 'failed', [`Error testing ${viewport.name}: ${error}`]);
      }
    }

    // Reset to desktop
    await page.setViewportSize({ width: 1280, height: 720 });

    // 5. Performance Analysis
    console.log('\n=== PERFORMANCE ANALYSIS ===');
    try {
      await page.goto('/', { timeout: 30000 });
      
      const performance = await helpers.checkPageLoadPerformance();
      
      if (performance.isGood) {
        addResult('Performance', 'Load Times', 'passed', ['All performance metrics within acceptable ranges'], performance.metrics);
      } else {
        addResult('Performance', 'Load Times', 'warning', ['Some performance metrics exceed thresholds', ...performance.issues], ['Consider optimizing page load performance']);
      }
      
    } catch (error) {
      addResult('Performance', 'Analysis', 'failed', [`Error: ${error}`]);
    }

    // 6. Accessibility Check
    console.log('\n=== ACCESSIBILITY ANALYSIS ===');
    try {
      await page.goto('/', { timeout: 15000 });
      await helpers.waitForFullLoad();
      
      const a11yIssues = await helpers.checkBasicAccessibility();
      
      if (a11yIssues.length === 0) {
        addResult('Accessibility', 'Basic Checks', 'passed', ['No basic accessibility issues found']);
      } else {
        addResult('Accessibility', 'Basic Checks', 'warning', ['Accessibility issues found:', ...a11yIssues], ['Review accessibility guidelines and fix identified issues']);
      }
      
    } catch (error) {
      addResult('Accessibility', 'Analysis', 'failed', [`Error: ${error}`]);
    }

    // 7. Error Pages
    console.log('\n=== ERROR HANDLING ANALYSIS ===');
    const errorUrls = ['/nonexistent-page', '/invalid-route'];
    
    for (const errorUrl of errorUrls) {
      try {
        const response = await page.goto(errorUrl, { timeout: 15000 });
        await helpers.waitForFullLoad();
        
        const statusCode = response?.status();
        const pageContent = await page.textContent('body');
        
        const is404 = statusCode === 404 || pageContent?.includes('404') || pageContent?.toLowerCase().includes('not found');
        
        if (is404) {
          addResult('Error Handling', '404 Pages', 'passed', [`${errorUrl} properly returns 404`]);
        } else {
          addResult('Error Handling', '404 Pages', 'warning', [`${errorUrl} may not be handled as 404 properly`]);
        }
        
      } catch (error) {
        addResult('Error Handling', '404 Pages', 'warning', [`Error testing ${errorUrl}: ${error}`]);
      }
    }

    // Generate the final report
    await generateFinalReport();
  });

  const generateFinalReport = async () => {
    console.log('\n' + '='.repeat(80));
    console.log('                        COMPREHENSIVE TEST REPORT');
    console.log('='.repeat(80));
    
    const categories = [...new Set(testResults.map(r => r.category))];
    let totalTests = testResults.length;
    let passedTests = testResults.filter(r => r.status === 'passed').length;
    let warningTests = testResults.filter(r => r.status === 'warning').length;
    let failedTests = testResults.filter(r => r.status === 'failed').length;
    
    console.log(`\nOVERALL SUMMARY:`);
    console.log(`📊 Total Tests: ${totalTests}`);
    console.log(`✅ Passed: ${passedTests} (${(passedTests/totalTests*100).toFixed(1)}%)`);
    console.log(`⚠️  Warnings: ${warningTests} (${(warningTests/totalTests*100).toFixed(1)}%)`);
    console.log(`❌ Failed: ${failedTests} (${(failedTests/totalTests*100).toFixed(1)}%)`);
    
    for (const category of categories) {
      const categoryResults = testResults.filter(r => r.category === category);
      const categoryPassed = categoryResults.filter(r => r.status === 'passed').length;
      const categoryWarning = categoryResults.filter(r => r.status === 'warning').length;
      const categoryFailed = categoryResults.filter(r => r.status === 'failed').length;
      
      console.log(`\n${category.toUpperCase()}:`);
      console.log(`  ✅ Passed: ${categoryPassed}, ⚠️  Warnings: ${categoryWarning}, ❌ Failed: ${categoryFailed}`);
      
      for (const result of categoryResults) {
        const statusIcon = result.status === 'passed' ? '✅' : result.status === 'warning' ? '⚠️' : '❌';
        console.log(`  ${statusIcon} ${result.testName}`);
        
        if (result.details.length > 0) {
          result.details.forEach(detail => {
            console.log(`     • ${detail}`);
          });
        }
        
        if (result.recommendations.length > 0) {
          console.log(`     💡 Recommendations:`);
          result.recommendations.forEach(rec => {
            console.log(`        - ${rec}`);
          });
        }
      }
    }
    
    // Key Findings Summary
    console.log('\n' + '='.repeat(80));
    console.log('KEY FINDINGS AND RECOMMENDATIONS:');
    console.log('='.repeat(80));
    
    const criticalIssues = testResults.filter(r => r.status === 'failed');
    if (criticalIssues.length > 0) {
      console.log('\n🚨 CRITICAL ISSUES (Must Fix):');
      criticalIssues.forEach((issue, index) => {
        console.log(`${index + 1}. ${issue.category} - ${issue.testName}`);
        issue.details.forEach(detail => console.log(`   ${detail}`));
      });
    }
    
    const warnings = testResults.filter(r => r.status === 'warning');
    if (warnings.length > 0) {
      console.log('\n⚠️ WARNINGS (Should Review):');
      warnings.slice(0, 10).forEach((warning, index) => { // Show top 10 warnings
        console.log(`${index + 1}. ${warning.category} - ${warning.testName}`);
        if (warning.details.length > 0) {
          console.log(`   ${warning.details[0]}`); // Show first detail
        }
      });
      
      if (warnings.length > 10) {
        console.log(`   ... and ${warnings.length - 10} more warnings`);
      }
    }
    
    // Recommendations by category
    const allRecommendations = testResults.flatMap(r => r.recommendations);
    const uniqueRecommendations = [...new Set(allRecommendations)];
    
    if (uniqueRecommendations.length > 0) {
      console.log('\n💡 CONSOLIDATED RECOMMENDATIONS:');
      uniqueRecommendations.forEach((rec, index) => {
        console.log(`${index + 1}. ${rec}`);
      });
    }
    
    console.log('\n' + '='.repeat(80));
    console.log('Report completed at:', new Date().toISOString());
    console.log('='.repeat(80));
    
    // Take a final screenshot
    await helpers.takeScreenshot('final-report');
  };
});