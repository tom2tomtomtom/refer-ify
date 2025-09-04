import { chromium, FullConfig } from '@playwright/test';
import { TEST_DATA } from './fixtures/test-data-generator';

async function globalSetup(config: FullConfig) {
  console.log('🚀 Starting Comprehensive UI/UX Test Suite Setup');
  
  // Setup test environment
  const setupStart = Date.now();
  
  try {
    // Launch browser for setup
    const browser = await chromium.launch();
    const context = await browser.newContext();
    const page = await context.newPage();
    
    // Check if application is running
    console.log('🔍 Checking application availability...');
    const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
    
    try {
      await page.goto(baseUrl, { timeout: 30000 });
      console.log('✅ Application is running and accessible');
    } catch (error) {
      console.error('❌ Application is not accessible:', error);
      throw new Error(`Application not available at ${baseUrl}`);
    }
    
    // Pre-seed test data if needed
    console.log('📊 Preparing test data...');
    const testDataSummary = {
      users: TEST_DATA.users.length,
      jobs: TEST_DATA.jobs.length,
      candidates: TEST_DATA.candidates.length,
      scenarios: Object.keys(TEST_DATA.scenarios).length
    };
    
    console.log('📋 Test Data Summary:', testDataSummary);
    
    // Validate key pages are accessible
    console.log('🔍 Validating key pages...');
    const keyPages = ['/', '/login', '/signup'];
    
    for (const pagePath of keyPages) {
      try {
        await page.goto(`${baseUrl}${pagePath}`, { timeout: 15000 });
        console.log(`✅ ${pagePath} is accessible`);
      } catch (error) {
        console.warn(`⚠️ ${pagePath} may have issues:`, error);
      }
    }
    
    // Create test results directory
    console.log('📁 Setting up test results directory...');
    const fs = require('fs');
    const path = require('path');
    
    const resultsDir = path.join(process.cwd(), 'test-results-comprehensive');
    if (!fs.existsSync(resultsDir)) {
      fs.mkdirSync(resultsDir, { recursive: true });
    }
    
    // Save test environment info
    const environmentInfo = {
      timestamp: new Date().toISOString(),
      baseUrl,
      nodeVersion: process.version,
      platform: process.platform,
      testDataSummary,
      keyPages: keyPages.map(p => ({ path: p, accessible: true }))
    };
    
    fs.writeFileSync(
      path.join(resultsDir, 'environment-info.json'),
      JSON.stringify(environmentInfo, null, 2)
    );
    
    await browser.close();
    
    const setupTime = Date.now() - setupStart;
    console.log(`✅ Global setup completed in ${setupTime}ms`);
    
  } catch (error) {
    console.error('❌ Global setup failed:', error);
    throw error;
  }
}

export default globalSetup;