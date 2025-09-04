import { Page, expect, Locator } from '@playwright/test';

export class TestHelpers {
  constructor(private page: Page) {}

  // Screenshot utility with timestamp
  async takeScreenshot(name: string): Promise<void> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    await this.page.screenshot({ 
      path: `test-results-production/screenshots/${name}-${timestamp}.png`,
      fullPage: true 
    });
  }

  // Check for console errors
  async getConsoleErrors(): Promise<string[]> {
    const errors: string[] = [];
    this.page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    return errors;
  }

  // Check for network failures
  async getNetworkErrors(): Promise<string[]> {
    const networkErrors: string[] = [];
    this.page.on('requestfailed', request => {
      networkErrors.push(`${request.method()} ${request.url()} - ${request.failure()?.errorText}`);
    });
    return networkErrors;
  }

  // Wait for page to be fully loaded
  async waitForFullLoad(): Promise<void> {
    try {
      await this.page.waitForLoadState('domcontentloaded', { timeout: 10000 });
      // Try networkidle but don't fail if it times out (some sites have persistent connections)
      await this.page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {
        console.log('Page did not reach networkidle within 15s, continuing...');
      });
    } catch (error) {
      console.log('Page load state timeout, continuing with available content...');
    }
  }

  // Check accessibility issues (basic)
  async checkBasicAccessibility(): Promise<string[]> {
    const issues: string[] = [];
    
    // Check for images without alt text
    const imagesWithoutAlt = await this.page.locator('img:not([alt])').count();
    if (imagesWithoutAlt > 0) {
      issues.push(`Found ${imagesWithoutAlt} images without alt text`);
    }

    // Check for buttons without accessible names
    const buttonsWithoutName = await this.page.locator('button:not([aria-label]):not([title])').filter({
      hasNotText: /.+/
    }).count();
    if (buttonsWithoutName > 0) {
      issues.push(`Found ${buttonsWithoutName} buttons without accessible names`);
    }

    // Check for forms without labels
    const inputsWithoutLabels = await this.page.locator('input[type="text"], input[type="email"], input[type="password"]').filter({
      has: this.page.locator(':not(label)')
    }).count();
    if (inputsWithoutLabels > 0) {
      issues.push(`Found ${inputsWithoutLabels} inputs without proper labels`);
    }

    return issues;
  }

  // Performance metrics
  async getPerformanceMetrics(): Promise<any> {
    const performanceMetrics = await this.page.evaluate(() => {
      const perfData = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      return {
        loadTime: perfData.loadEventEnd - perfData.loadEventStart,
        domContentLoaded: perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart,
        firstPaint: performance.getEntriesByName('first-paint')[0]?.startTime || 0,
        firstContentfulPaint: performance.getEntriesByName('first-contentful-paint')[0]?.startTime || 0,
        totalLoadTime: perfData.loadEventEnd - perfData.fetchStart,
      };
    });
    return performanceMetrics;
  }

  // Check for broken links
  async checkLinksOnPage(): Promise<{ working: number; broken: string[] }> {
    const links = await this.page.locator('a[href]').all();
    const broken: string[] = [];
    let working = 0;

    for (const link of links) {
      const href = await link.getAttribute('href');
      if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) {
        continue;
      }

      try {
        const response = await this.page.request.get(href);
        if (response.status() >= 400) {
          broken.push(`${href} - Status: ${response.status()}`);
        } else {
          working++;
        }
      } catch (error) {
        broken.push(`${href} - Error: ${error}`);
      }
    }

    return { working, broken };
  }

  // Form validation helper
  async testFormValidation(form: Locator, fields: { selector: string; validValue: string; invalidValue: string; expectedError?: string }[]): Promise<string[]> {
    const issues: string[] = [];

    for (const field of fields) {
      const input = form.locator(field.selector);
      
      // Test with invalid value
      await input.fill(field.invalidValue);
      await input.blur();
      
      // Check if validation error appears
      const hasError = await this.page.locator('.error, [role="alert"], .text-red-500').isVisible();
      if (!hasError) {
        issues.push(`No validation error shown for ${field.selector} with invalid value: ${field.invalidValue}`);
      }

      // Test with valid value
      await input.fill(field.validValue);
      await input.blur();
      
      // Check if error disappears
      const stillHasError = await this.page.locator('.error, [role="alert"], .text-red-500').isVisible();
      if (stillHasError) {
        issues.push(`Validation error persists for ${field.selector} even with valid value: ${field.validValue}`);
      }
    }

    return issues;
  }

  // Mobile responsiveness helper
  async checkMobileResponsiveness(): Promise<string[]> {
    const issues: string[] = [];
    
    // Check for horizontal scroll
    const hasHorizontalScroll = await this.page.evaluate(() => {
      return document.body.scrollWidth > window.innerWidth;
    });
    
    if (hasHorizontalScroll) {
      issues.push('Page has horizontal scroll on mobile viewport');
    }

    // Check for overlapping elements
    const overlappingElements = await this.page.evaluate(() => {
      const elements = Array.from(document.querySelectorAll('*'));
      const overlaps: string[] = [];
      
      elements.forEach(el => {
        const rect = el.getBoundingClientRect();
        if (rect.left < 0 || rect.right > window.innerWidth) {
          overlaps.push(`Element ${el.tagName} extends beyond viewport`);
        }
      });
      
      return overlaps.slice(0, 10); // Limit to first 10 issues
    });

    issues.push(...overlappingElements);
    return issues;
  }

  // Wait for element with timeout and error handling
  async waitForElementWithTimeout(selector: string, timeout: number = 10000): Promise<boolean> {
    try {
      await this.page.waitForSelector(selector, { timeout });
      return true;
    } catch (error) {
      return false;
    }
  }

  // Check page load performance
  async checkPageLoadPerformance(): Promise<{ isGood: boolean; metrics: any; issues: string[] }> {
    const metrics = await this.getPerformanceMetrics();
    const issues: string[] = [];
    
    // Performance thresholds (in milliseconds)
    const thresholds = {
      totalLoadTime: 5000,
      firstContentfulPaint: 2000,
      domContentLoaded: 3000
    };

    if (metrics.totalLoadTime > thresholds.totalLoadTime) {
      issues.push(`Total load time (${metrics.totalLoadTime}ms) exceeds threshold (${thresholds.totalLoadTime}ms)`);
    }

    if (metrics.firstContentfulPaint > thresholds.firstContentfulPaint) {
      issues.push(`First Contentful Paint (${metrics.firstContentfulPaint}ms) exceeds threshold (${thresholds.firstContentfulPaint}ms)`);
    }

    if (metrics.domContentLoaded > thresholds.domContentLoaded) {
      issues.push(`DOM Content Loaded (${metrics.domContentLoaded}ms) exceeds threshold (${thresholds.domContentLoaded}ms)`);
    }

    return {
      isGood: issues.length === 0,
      metrics,
      issues
    };
  }
}