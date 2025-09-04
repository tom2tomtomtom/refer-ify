import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e/production',
  timeout: 60 * 1000, // Longer timeout for production
  expect: {
    timeout: 10000, // Longer expect timeout for production
  },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 3, // More retries for production stability
  workers: 2, // Limit workers for production testing
  reporter: [
    ['html', { outputFolder: 'playwright-report-production' }],
    ['json', { outputFile: 'test-results-production/results.json' }],
    ['junit', { outputFile: 'test-results-production/results.xml' }]
  ],
  use: {
    baseURL: 'https://web-2ib1ybzbk-tom-hydes-projects.vercel.app',
    trace: 'on',
    screenshot: 'on',
    video: 'on',
    // Extra settings for production testing
    ignoreHTTPSErrors: false,
    colorScheme: 'light',
    locale: 'en-US',
    timezoneId: 'America/New_York',
    viewport: { width: 1280, height: 720 },
    // Add headers to help with debugging
    extraHTTPHeaders: {
      'Accept-Language': 'en-US,en;q=0.9',
    }
  },

  projects: [
    {
      name: 'Desktop Chrome',
      use: { 
        ...devices['Desktop Chrome'],
        viewport: { width: 1280, height: 720 }
      },
    },
    {
      name: 'Desktop Firefox',
      use: { 
        ...devices['Desktop Firefox'],
        viewport: { width: 1280, height: 720 }
      },
    },
    {
      name: 'Desktop Safari',
      use: { 
        ...devices['Desktop Safari'],
        viewport: { width: 1280, height: 720 }
      },
    },
    {
      name: 'Mobile Chrome',
      use: { 
        ...devices['Pixel 5'],
        hasTouch: true,
      },
    },
    {
      name: 'Mobile Safari',
      use: { 
        ...devices['iPhone 12'],
        hasTouch: true,
      },
    },
    {
      name: 'Tablet',
      use: { 
        ...devices['iPad Pro'],
        hasTouch: true,
      },
    },
  ],

  outputDir: 'test-results-production/',
});