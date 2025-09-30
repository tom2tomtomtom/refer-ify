import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  timeout: 30 * 1000,
  expect: {
    timeout: 10000, // Longer timeout for production
  },
  fullyParallel: false, // Sequential for production testing
  forbidOnly: true,
  retries: 1, // Retry once if test fails
  workers: 1, // One at a time for production
  reporter: 'list',
  use: {
    baseURL: 'https://refer-ify-production.up.railway.app',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    // Slower for production
    actionTimeout: 15000,
    navigationTimeout: 30000,
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  // No webServer - testing live production site
  outputDir: 'test-results-production/',
});
