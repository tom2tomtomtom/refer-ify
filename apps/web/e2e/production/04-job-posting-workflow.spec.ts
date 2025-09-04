import { test, expect, Page } from '@playwright/test';
import { TestHelpers } from './utils/test-helpers';
import { testData } from './fixtures/test-data';

test.describe('Job Posting Workflow for Clients', () => {
  let page: Page;
  let helpers: TestHelpers;

  test.beforeEach(async ({ page: testPage }) => {
    page = testPage;
    helpers = new TestHelpers(page);
  });

  test('Job posting page/form accessibility', async () => {
    console.log('📝 Testing job posting page accessibility...');
    
    const jobPostingUrls = [
      '/jobs/create',
      '/jobs/new', 
      '/post-job',
      '/create-job',
      '/dashboard/jobs/create',
      '/dashboard/post-job'
    ];

    let accessibleUrl = null;

    for (const url of jobPostingUrls) {
      try {
        await page.goto(url);
        await page.waitForLoadState('networkidle', { timeout: 5000 });
        
        const currentUrl = page.url();
        const pageContent = await page.textContent('body');
        
        // Check if we found a job posting page
        if (!currentUrl.includes('404') && 
            !pageContent?.includes('404') && 
            !pageContent?.includes('Not Found') &&
            (pageContent?.includes('job') || pageContent?.includes('Job') || 
             pageContent?.includes('post') || pageContent?.includes('create'))) {
          accessibleUrl = url;
          console.log(`✅ Job posting page found at: ${url}`);
          break;
        }
      } catch (error) {
        console.log(`❌ Could not access ${url}`);
      }
    }

    if (!accessibleUrl) {
      console.log('ℹ️ No dedicated job posting page found - may be integrated in dashboard');
      // Try to find job posting functionality in dashboard
      await page.goto('/dashboard');
      await helpers.waitForFullLoad();
      
      const jobButtons = page.locator('button:has-text("Post"), button:has-text("Create"), button:has-text("Job"), a:has-text("Post"), a:has-text("Create")');
      const buttonCount = await jobButtons.count();
      
      if (buttonCount > 0) {
        console.log(`✅ Found ${buttonCount} potential job posting buttons in dashboard`);
        accessibleUrl = '/dashboard';
      }
    }

    if (accessibleUrl) {
      await helpers.takeScreenshot('job-posting-page-found');
    } else {
      console.log('❌ No job posting functionality found');
      await helpers.takeScreenshot('no-job-posting-found');
    }
  });

  test('Job posting form structure and fields', async () => {
    console.log('🏗️ Testing job posting form structure...');
    
    // Start from dashboard and look for job posting
    await page.goto('/dashboard');
    await helpers.waitForFullLoad();

    // Try to find and click job posting button
    const jobPostingButtons = [
      'button:has-text("Post Job")',
      'button:has-text("Create Job")', 
      'button:has-text("New Job")',
      'a:has-text("Post Job")',
      'a:has-text("Create Job")',
      'a:has-text("New Job")',
      '[data-testid="post-job"]',
      '[data-testid="create-job"]'
    ];

    let formFound = false;
    
    for (const selector of jobPostingButtons) {
      const button = page.locator(selector).first();
      if (await button.count() > 0 && await button.isVisible()) {
        console.log(`Found job posting button: ${selector}`);
        
        try {
          await button.click();
          await page.waitForLoadState('networkidle');
          await helpers.takeScreenshot('job-posting-form-opened');
          formFound = true;
          break;
        } catch (error) {
          console.warn(`Could not click ${selector}:`, error);
        }
      }
    }

    if (!formFound) {
      // Try direct URLs again
      const directUrls = ['/jobs/create', '/post-job', '/dashboard/jobs/create'];
      for (const url of directUrls) {
        try {
          await page.goto(url);
          await helpers.waitForFullLoad();
          const form = page.locator('form').first();
          if (await form.count() > 0) {
            formFound = true;
            console.log(`✅ Job posting form found at ${url}`);
            break;
          }
        } catch (error) {
          console.log(`Could not access ${url}`);
        }
      }
    }

    if (formFound) {
      // Analyze form structure
      const form = page.locator('form').first();
      await expect(form).toBeVisible();

      // Check for common job posting fields
      const expectedFields = [
        { name: 'Job Title', selectors: ['input[name*="title"], input[placeholder*="title"], input[id*="title"]'] },
        { name: 'Company', selectors: ['input[name*="company"], input[placeholder*="company"], input[id*="company"]'] },
        { name: 'Location', selectors: ['input[name*="location"], input[placeholder*="location"], input[id*="location"]'] },
        { name: 'Description', selectors: ['textarea[name*="description"], textarea[placeholder*="description"], textarea[id*="description"]'] },
        { name: 'Requirements', selectors: ['textarea[name*="requirements"], textarea[placeholder*="requirements"], textarea[id*="requirements"]'] },
        { name: 'Salary', selectors: ['input[name*="salary"], input[placeholder*="salary"], input[id*="salary"]'] },
        { name: 'Employment Type', selectors: ['select[name*="type"], input[name*="type"], select[name*="employment"]'] }
      ];

      const foundFields: string[] = [];
      const missingFields: string[] = [];

      for (const field of expectedFields) {
        let fieldFound = false;
        for (const selector of field.selectors) {
          const element = page.locator(selector).first();
          if (await element.count() > 0 && await element.isVisible()) {
            foundFields.push(field.name);
            fieldFound = true;
            console.log(`✅ Field found: ${field.name}`);
            break;
          }
        }
        if (!fieldFound) {
          missingFields.push(field.name);
        }
      }

      console.log('Found fields:', foundFields);
      console.log('Missing fields:', missingFields);

      await helpers.takeScreenshot('job-posting-form-structure');
    } else {
      console.log('❌ No job posting form found');
    }
  });

  test('Job posting form validation', async () => {
    console.log('✅ Testing job posting form validation...');
    
    // Try to access job posting form
    await page.goto('/dashboard');
    await helpers.waitForFullLoad();

    // Look for job posting functionality
    const jobPostingTriggers = page.locator('button:has-text("Post"), button:has-text("Create"), a:has-text("Post"), a:has-text("Create")');
    const triggerCount = await jobPostingTriggers.count();

    if (triggerCount === 0) {
      console.log('ℹ️ No job posting triggers found in dashboard');
      return;
    }

    // Try to open job posting form
    const firstTrigger = jobPostingTriggers.first();
    await firstTrigger.click();
    await page.waitForTimeout(2000);

    const form = page.locator('form').first();
    if (await form.count() === 0) {
      console.log('ℹ️ No form appeared after clicking job posting trigger');
      return;
    }

    console.log('✅ Job posting form found');

    // Test form validation by submitting empty form
    const submitButton = form.locator('button[type="submit"], input[type="submit"], button:has-text("Post"), button:has-text("Create"), button:has-text("Submit")').first();
    
    if (await submitButton.count() > 0) {
      await submitButton.click();
      await page.waitForTimeout(2000);

      // Check for validation errors
      const errorElements = page.locator('.error, [role="alert"], .text-red-500, .text-destructive, .invalid');
      const errorCount = await errorElements.count();
      
      if (errorCount > 0) {
        console.log(`✅ Form validation working - ${errorCount} error messages displayed`);
        
        // Try to identify which fields have errors
        for (let i = 0; i < errorCount; i++) {
          const error = errorElements.nth(i);
          const errorText = await error.textContent();
          console.log(`Validation error ${i + 1}: ${errorText}`);
        }
      } else {
        console.log('⚠️ No validation errors shown for empty form submission');
      }

      await helpers.takeScreenshot('job-posting-form-validation');
    } else {
      console.log('⚠️ No submit button found in job posting form');
    }
  });

  test('Job posting form completion with valid data', async () => {
    console.log('📋 Testing job posting form completion...');
    
    await page.goto('/dashboard');
    await helpers.waitForFullLoad();

    // Look for and open job posting form
    const postJobButton = page.locator('button:has-text("Post"), a:has-text("Post"), button:has-text("Create"), a:has-text("Create")').first();
    
    if (await postJobButton.count() === 0) {
      console.log('ℹ️ No job posting button found');
      return;
    }

    await postJobButton.click();
    await page.waitForTimeout(2000);

    const form = page.locator('form').first();
    if (await form.count() === 0) {
      console.log('ℹ️ No job posting form appeared');
      return;
    }

    // Fill out the form with test data
    const jobData = testData.jobPosting.valid;

    // Job Title
    const titleField = form.locator('input[name*="title"], input[placeholder*="title"], input[id*="title"]').first();
    if (await titleField.count() > 0) {
      await titleField.fill(jobData.title);
      console.log('✅ Job title filled');
    }

    // Company
    const companyField = form.locator('input[name*="company"], input[placeholder*="company"], input[id*="company"]').first();
    if (await companyField.count() > 0) {
      await companyField.fill(jobData.company);
      console.log('✅ Company filled');
    }

    // Location
    const locationField = form.locator('input[name*="location"], input[placeholder*="location"], input[id*="location"]').first();
    if (await locationField.count() > 0) {
      await locationField.fill(jobData.location);
      console.log('✅ Location filled');
    }

    // Description
    const descriptionField = form.locator('textarea[name*="description"], textarea[placeholder*="description"], textarea[id*="description"]').first();
    if (await descriptionField.count() > 0) {
      await descriptionField.fill(jobData.description);
      console.log('✅ Description filled');
    }

    // Requirements
    const requirementsField = form.locator('textarea[name*="requirements"], textarea[placeholder*="requirements"], textarea[id*="requirements"], textarea[name*="requirement"]').first();
    if (await requirementsField.count() > 0) {
      await requirementsField.fill(jobData.requirements.join('\n'));
      console.log('✅ Requirements filled');
    }

    // Salary
    const salaryField = form.locator('input[name*="salary"], input[placeholder*="salary"], input[id*="salary"]').first();
    if (await salaryField.count() > 0) {
      await salaryField.fill(jobData.salary);
      console.log('✅ Salary filled');
    }

    await helpers.takeScreenshot('job-posting-form-filled');

    // Try to submit the form (but don't expect it to work in production)
    const submitButton = form.locator('button[type="submit"], input[type="submit"], button:has-text("Post"), button:has-text("Create"), button:has-text("Submit")').first();
    
    if (await submitButton.count() > 0) {
      console.log('Attempting to submit job posting form...');
      await submitButton.click();
      await page.waitForTimeout(3000);

      // Check the result
      const currentUrl = page.url();
      const pageContent = await page.textContent('body');

      if (pageContent?.includes('success') || pageContent?.includes('posted') || 
          pageContent?.includes('created') || currentUrl.includes('success')) {
        console.log('✅ Job posting appears to have been successful');
      } else if (pageContent?.includes('error') || pageContent?.includes('failed')) {
        console.log('❌ Job posting failed - this is expected in production testing');
      } else if (pageContent?.includes('login') || pageContent?.includes('sign in')) {
        console.log('🔐 Job posting requires authentication');
      } else {
        console.log('ℹ️ Job posting result unclear');
      }

      await helpers.takeScreenshot('job-posting-form-submitted');
    }
  });

  test('Job management and listing', async () => {
    console.log('📋 Testing job management and listing...');
    
    await page.goto('/dashboard');
    await helpers.waitForFullLoad();

    // Look for job management sections
    const jobSections = [
      'section:has-text("Job")',
      'div:has-text("My Jobs")',
      'div:has-text("Posted Jobs")',
      '.jobs-list',
      '[data-testid="jobs"]',
      'table:has(th:has-text("Job"))'
    ];

    let jobSectionFound = false;

    for (const selector of jobSections) {
      const section = page.locator(selector).first();
      if (await section.count() > 0 && await section.isVisible()) {
        jobSectionFound = true;
        console.log(`✅ Job section found: ${selector}`);
        
        // Look for job entries
        const jobEntries = section.locator('tr, .job-item, .job-card, li').filter({
          hasNotText: /^$/
        });
        const entryCount = await jobEntries.count();
        console.log(`Found ${entryCount} job entries`);

        // Check for job actions (edit, delete, view applications)
        const actionButtons = section.locator('button, a').filter({
          hasText: /edit|delete|view|applications|manage/i
        });
        const actionCount = await actionButtons.count();
        console.log(`Found ${actionCount} job action buttons`);

        await helpers.takeScreenshot('job-management-section');
        break;
      }
    }

    if (!jobSectionFound) {
      console.log('ℹ️ No job management section found');
      
      // Try to access jobs via navigation
      const jobsNav = page.locator('a[href*="job"], a:has-text("Jobs"), nav a:has-text("Job")').first();
      if (await jobsNav.count() > 0) {
        await jobsNav.click();
        await page.waitForLoadState('networkidle');
        await helpers.takeScreenshot('jobs-navigation-result');
      }
    }
  });

  test('Job posting accessibility and usability', async () => {
    console.log('♿ Testing job posting accessibility...');
    
    await page.goto('/dashboard');
    await helpers.waitForFullLoad();

    // Check accessibility of job posting interface
    const a11yIssues = await helpers.checkBasicAccessibility();
    if (a11yIssues.length > 0) {
      console.warn('⚠️ Accessibility issues in dashboard:', a11yIssues);
    }

    // Look for job posting form again
    const postJobButton = page.locator('button:has-text("Post"), a:has-text("Post")').first();
    if (await postJobButton.count() > 0) {
      // Check if button has proper accessibility attributes
      const hasAriaLabel = await postJobButton.getAttribute('aria-label');
      const hasTitle = await postJobButton.getAttribute('title');
      const buttonText = await postJobButton.textContent();
      
      if (!hasAriaLabel && !hasTitle && !buttonText?.trim()) {
        console.warn('⚠️ Job posting button lacks accessible name');
      } else {
        console.log('✅ Job posting button has accessible name');
      }

      await postJobButton.click();
      await page.waitForTimeout(2000);

      const form = page.locator('form').first();
      if (await form.count() > 0) {
        // Check form accessibility
        const formA11yIssues = await helpers.checkBasicAccessibility();
        if (formA11yIssues.length > 0) {
          console.warn('⚠️ Job posting form accessibility issues:', formA11yIssues);
        }

        // Check for proper form labels
        const inputs = form.locator('input, textarea, select');
        const inputCount = await inputs.count();
        
        for (let i = 0; i < inputCount; i++) {
          const input = inputs.nth(i);
          const inputId = await input.getAttribute('id');
          const inputName = await input.getAttribute('name');
          const inputPlaceholder = await input.getAttribute('placeholder');
          
          // Check if input has associated label
          let hasLabel = false;
          if (inputId) {
            const label = page.locator(`label[for="${inputId}"]`);
            hasLabel = await label.count() > 0;
          }
          
          if (!hasLabel && !inputPlaceholder) {
            console.warn(`⚠️ Input field (${inputName || i}) lacks proper label`);
          }
        }
      }
    }

    await helpers.takeScreenshot('job-posting-accessibility-check');
  });

  test('Mobile job posting experience', async () => {
    console.log('📱 Testing mobile job posting experience...');
    
    await page.setViewportSize(testData.viewports.mobile);
    await page.goto('/dashboard');
    await helpers.waitForFullLoad();

    // Check mobile responsiveness
    const mobileIssues = await helpers.checkMobileResponsiveness();
    if (mobileIssues.length > 0) {
      console.warn('⚠️ Mobile responsiveness issues:', mobileIssues);
    }

    // Check if job posting is accessible on mobile
    const postJobButton = page.locator('button:has-text("Post"), a:has-text("Post")').first();
    if (await postJobButton.count() > 0 && await postJobButton.isVisible()) {
      console.log('✅ Job posting button visible on mobile');
      
      await postJobButton.click();
      await page.waitForTimeout(2000);

      const form = page.locator('form').first();
      if (await form.count() > 0) {
        // Check if form is usable on mobile
        const formBounds = await form.boundingBox();
        if (formBounds && formBounds.width <= testData.viewports.mobile.width) {
          console.log('✅ Job posting form fits mobile viewport');
        } else {
          console.warn('⚠️ Job posting form may not fit mobile viewport');
        }

        // Test scrolling and form interaction on mobile
        const inputs = form.locator('input, textarea').first();
        if (await inputs.count() > 0) {
          await inputs.click();
          await inputs.fill('Test mobile input');
          console.log('✅ Mobile form input working');
        }
      }
    } else {
      console.log('ℹ️ Job posting button not visible on mobile');
    }

    await helpers.takeScreenshot('job-posting-mobile');
    
    // Reset viewport
    await page.setViewportSize(testData.viewports.desktop);
  });

  test('Job posting performance and loading', async () => {
    console.log('⚡ Testing job posting performance...');
    
    await page.goto('/dashboard');
    
    // Check dashboard load performance
    const performance = await helpers.checkPageLoadPerformance();
    if (!performance.isGood) {
      console.warn('⚠️ Dashboard performance issues:', performance.issues);
    }

    // Try to measure job posting form load time
    const postJobButton = page.locator('button:has-text("Post"), a:has-text("Post")').first();
    if (await postJobButton.count() > 0) {
      const startTime = Date.now();
      await postJobButton.click();
      
      // Wait for form to appear
      const form = page.locator('form').first();
      await form.waitFor({ state: 'visible', timeout: 10000 });
      
      const loadTime = Date.now() - startTime;
      console.log(`Job posting form loaded in ${loadTime}ms`);
      
      if (loadTime > 3000) {
        console.warn(`⚠️ Job posting form load time (${loadTime}ms) is slow`);
      } else {
        console.log('✅ Job posting form loads quickly');
      }
    }

    await helpers.takeScreenshot('job-posting-performance-test');
  });
});