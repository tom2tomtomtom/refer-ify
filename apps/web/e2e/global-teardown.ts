import { FullConfig } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

async function globalTeardown(config: FullConfig) {
  console.log('🧹 Starting Global Teardown');
  
  try {
    const resultsDir = path.join(process.cwd(), 'test-results-comprehensive');
    
    // Generate comprehensive test report
    const reportData = {
      completedAt: new Date().toISOString(),
      summary: 'Comprehensive UI/UX test suite completed',
      testCategories: [
        'Authentication Flows',
        'UI Element Coverage',
        'User Journey Tests',
        'Cross-browser Testing',
        'Mobile Responsiveness',
        'Accessibility Testing'
      ],
      reportFiles: [
        'HTML Report: test-results-comprehensive/index.html',
        'JSON Results: test-results-comprehensive/results.json',
        'Environment Info: test-results-comprehensive/environment-info.json'
      ]
    };
    
    // Save final report
    if (fs.existsSync(resultsDir)) {
      fs.writeFileSync(
        path.join(resultsDir, 'final-report.json'),
        JSON.stringify(reportData, null, 2)
      );
      
      console.log('📊 Final test report generated');
      console.log('📁 Results available in: test-results-comprehensive/');
    }
    
    // Cleanup temporary files if needed
    console.log('🧹 Cleanup completed');
    
  } catch (error) {
    console.error('❌ Global teardown error:', error);
  }
}

export default globalTeardown;