/**
 * Lighthouse CI Configuration
 * 
 * Configures Lighthouse CI for automated performance, accessibility,
 * and best practices auditing. Integrates with performance budgets
 * to provide comprehensive web performance monitoring.
 */

module.exports = {
  ci: {
    // Build configuration
    collect: {
      // URLs to audit (can be local build or deployed URLs)
      url: [
        'http://localhost:3000',
        'http://localhost:3000/client/jobs',
        'http://localhost:3000/refer/test-job-id',
        'http://localhost:3000/candidates',
      ],
      
      // Number of runs per URL (for consistent results)
      numberOfRuns: 3,
      
      // Chrome flags for consistent testing environment
      chromeFlags: [
        '--no-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--headless',
      ],
      
      // Lighthouse settings
      settings: {
        // Audit configuration
        preset: 'perf',
        
        // Throttling settings (simulates slower devices/networks)
        throttling: {
          rttMs: 40,
          throughputKbps: 10240,
          cpuSlowdownMultiplier: 1,
          requestLatencyMs: 0,
          downloadThroughputKbps: 0,
          uploadThroughputKbps: 0,
        },
        
        // Device emulation
        emulatedFormFactor: 'mobile',
        
        // Skip certain audits that might not be relevant
        skipAudits: [
          'canonical',
          'robots-txt',
          'hreflang',
        ],
      },
    },

    // Performance budgets (aligned with our performance-budget.config.js)
    assert: {
      // Performance assertions
      assertions: {
        // Core Web Vitals
        'largest-contentful-paint': ['error', { maxNumericValue: 2500 }],
        'first-contentful-paint': ['error', { maxNumericValue: 1800 }],
        'cumulative-layout-shift': ['error', { maxNumericValue: 0.1 }],
        'total-blocking-time': ['error', { maxNumericValue: 300 }],
        
        // Resource budgets
        'total-byte-weight': ['error', { maxNumericValue: 1000000 }], // 1MB
        'dom-size': ['error', { maxNumericValue: 1500 }],
        'interactive': ['error', { maxNumericValue: 3800 }],
        
        // Performance scores
        'categories:performance': ['error', { minScore: 0.9 }],
        'categories:accessibility': ['warn', { minScore: 0.9 }],
        'categories:best-practices': ['warn', { minScore: 0.9 }],
        'categories:seo': ['warn', { minScore: 0.9 }],
        
        // Specific metrics
        'speed-index': ['error', { maxNumericValue: 3000 }],
        'uses-responsive-images': 'error',
        'efficient-animated-content': 'error',
        'unused-css-rules': 'warn',
        'unused-javascript': 'warn',
        'modern-image-formats': 'warn',
        'uses-webp-images': 'warn',
        'uses-optimized-images': 'warn',
      },
    },

    // Upload configuration (for CI/CD integration)
    upload: {
      // Target for storing results
      target: 'temporary-public-storage',
      
      // Report generation
      reportFilenamePattern: '%%PATHNAME%%-%%DATETIME%%-report.%%EXTENSION%%',
      
      // GitHub integration (when running in GitHub Actions)
      githubAppToken: process.env.LHCI_GITHUB_APP_TOKEN,
    },
    
    // Server configuration (if using LHCI server)
    server: {
      // Optional: LHCI server URL
      // baseURL: 'https://your-lhci-server.com',
    },
  },

  // Budget configuration specific to Lighthouse
  budgets: [
    {
      // Path pattern to apply budgets
      path: '/*',
      
      // Resource count budgets
      resourceCounts: [
        { resourceType: 'script', budget: 10 },
        { resourceType: 'stylesheet', budget: 5 },
        { resourceType: 'image', budget: 15 },
        { resourceType: 'font', budget: 4 },
      ],
      
      // Resource size budgets (in KB)
      resourceSizes: [
        { resourceType: 'script', budget: 300 },
        { resourceType: 'stylesheet', budget: 50 },
        { resourceType: 'image', budget: 500 },
        { resourceType: 'font', budget: 100 },
        { resourceType: 'total', budget: 1000 },
      ],
      
      // Timing budgets (in ms)
      timings: [
        { metric: 'first-contentful-paint', budget: 1800 },
        { metric: 'largest-contentful-paint', budget: 2500 },
        { metric: 'speed-index', budget: 3000 },
        { metric: 'interactive', budget: 3800 },
      ],
    },
    
    // Specific budgets for dashboard pages
    {
      path: '/client/*',
      resourceSizes: [
        { resourceType: 'script', budget: 400 }, // Higher budget for complex pages
        { resourceType: 'total', budget: 1200 },
      ],
      timings: [
        { metric: 'interactive', budget: 4000 }, // Slightly higher for complex interactions
      ],
    },
  ],
};