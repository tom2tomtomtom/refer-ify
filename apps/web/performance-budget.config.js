/**
 * Performance Budget Configuration
 * 
 * Defines performance budgets for bundle sizes, Core Web Vitals, and other
 * performance metrics. These budgets will fail the build if exceeded,
 * preventing performance regressions from reaching production.
 */

module.exports = {
  // Bundle Size Budgets (in KB)
  bundleSizes: {
    // Main application bundles
    maxMainBundle: 150,      // Main app JavaScript bundle
    maxVendorBundle: 300,    // Third-party dependencies
    maxSharedBundle: 100,    // Shared components/utilities
    
    // Page-level budgets (First Load JS)
    maxPageSize: 250,        // Any individual page
    maxLandingPage: 200,     // Homepage and marketing pages
    maxDashboardPage: 300,   // Complex dashboard pages
    
    // Asset budgets
    maxCSSBundle: 50,        // Total CSS size
    maxImageSize: 500,       // Individual images
    maxFontSize: 100,        // Web fonts total
    
    // Total budgets
    maxTotalJS: 500,         // All JavaScript combined
    maxTotalAssets: 1000,    // All assets combined
  },

  // Core Web Vitals Budgets
  coreWebVitals: {
    // Largest Contentful Paint (LCP) - should be < 2.5s
    maxLCP: 2500,
    
    // First Input Delay (FID) - should be < 100ms
    maxFID: 100,
    
    // Cumulative Layout Shift (CLS) - should be < 0.1
    maxCLS: 0.1,
    
    // First Contentful Paint (FCP) - should be < 1.8s
    maxFCP: 1800,
    
    // Time to Interactive (TTI) - should be < 3.8s
    maxTTI: 3800,
  },

  // Network budgets (for different connection types)
  networkBudgets: {
    // 3G connection (1.6 Mbps)
    slow3G: {
      maxLoadTime: 5000,     // 5 seconds
      maxTotalSize: 300,     // 300KB
    },
    
    // 4G connection (4 Mbps)
    regular4G: {
      maxLoadTime: 3000,     // 3 seconds
      maxTotalSize: 500,     // 500KB
    },
  },

  // Critical resource budgets
  criticalResources: {
    maxCriticalJS: 150,      // JavaScript needed for initial render
    maxCriticalCSS: 30,      // CSS needed for above-the-fold content
    maxCriticalImages: 200,  // Hero images and critical visuals
  },

  // Performance thresholds for warnings vs errors
  thresholds: {
    // Warning level (80% of budget)
    warning: 0.8,
    
    // Error level (100% of budget)
    error: 1.0,
    
    // Critical level (110% of budget) - immediate build failure
    critical: 1.1,
  },

  // Exclusions (files to ignore in budget calculations)
  exclude: [
    '**/*.map',              // Source maps
    '**/*.d.ts',             // TypeScript definitions
    '**/node_modules/**',    // Dependencies (handled separately)
  ],

  // Budget enforcement rules
  enforcement: {
    // Fail build on budget violations
    failOnError: process.env.NODE_ENV === 'production',
    
    // Generate detailed reports
    generateReports: true,
    
    // Compare with previous builds
    compareWithBaseline: true,
  },
};