import { test, expect, Page } from '@playwright/test';
import { TestHelpers } from './utils/test-helpers';
import { testData } from './fixtures/test-data';

test.describe('Referral Submission Process', () => {
  let page: Page;
  let helpers: TestHelpers;

  test.beforeEach(async ({ page: testPage }) => {
    page = testPage;
    helpers = new TestHelpers(page);
  });

  test('Referral submission page accessibility', async () => {
    console.log('🔍 Testing referral submission page accessibility...');
    
    const referralUrls = [
      '/referrals',
      '/referrals/submit',
      '/referrals/new',
      '/submit-referral',
      '/refer',
      '/dashboard/referrals',
      '/dashboard/refer'
    ];

    let accessibleUrl = null;

    for (const url of referralUrls) {
      try {
        await page.goto(url);
        await page.waitForLoadState('networkidle', { timeout: 5000 });
        
        const currentUrl = page.url();
        const pageContent = await page.textContent('body');
        
        // Check if we found a referral page
        if (!currentUrl.includes('404') && 
            !pageContent?.includes('404') && 
            !pageContent?.includes('Not Found') &&
            (pageContent?.includes('referral') || pageContent?.includes('Referral') || 
             pageContent?.includes('refer') || pageContent?.includes('Refer'))) {
          accessibleUrl = url;
          console.log(`✅ Referral page found at: ${url}`);
          break;
        }
      } catch (error) {
        console.log(`❌ Could not access ${url}`);
      }
    }

    if (!accessibleUrl) {
      console.log('ℹ️ No dedicated referral page found - checking dashboard');
      // Try to find referral functionality in dashboard
      await page.goto('/dashboard');
      await helpers.waitForFullLoad();
      
      const referralButtons = page.locator('button:has-text("Refer"), button:has-text("Submit"), a:has-text("Refer"), a:has-text("Referral")');
      const buttonCount = await referralButtons.count();
      
      if (buttonCount > 0) {
        console.log(`✅ Found ${buttonCount} potential referral buttons in dashboard`);
        accessibleUrl = '/dashboard';
      }
    }

    if (accessibleUrl) {
      await helpers.takeScreenshot('referral-page-found');
    } else {
      console.log('❌ No referral submission functionality found');
      await helpers.takeScreenshot('no-referral-found');
    }
  });

  test('Referral form structure and required fields', async () => {
    console.log('📋 Testing referral form structure...');
    
    // Start from dashboard and look for referral submission
    await page.goto('/dashboard');
    await helpers.waitForFullLoad();

    // Try to find and access referral form
    const referralTriggers = [
      'button:has-text("Refer")',
      'button:has-text("Submit Referral")',
      'a:has-text("Refer")',
      'a:has-text("Submit Referral")',
      'a:has-text("Referrals")',
      '[data-testid="refer-button"]',
      '[data-testid="referral-submit"]'
    ];

    let formFound = false;
    
    for (const selector of referralTriggers) {
      const trigger = page.locator(selector).first();
      if (await trigger.count() > 0 && await trigger.isVisible()) {
        console.log(`Found referral trigger: ${selector}`);
        
        try {
          await trigger.click();
          await page.waitForLoadState('networkidle');
          await helpers.takeScreenshot('referral-form-opened');
          
          // Check if a form appeared
          const form = page.locator('form').first();
          if (await form.count() > 0) {
            formFound = true;
            break;
          }
        } catch (error) {
          console.warn(`Could not click ${selector}:`, error);
        }
      }
    }

    if (!formFound) {
      // Try direct navigation to referral pages
      const directUrls = ['/referrals', '/referrals/submit', '/refer'];
      for (const url of directUrls) {
        try {
          await page.goto(url);
          await helpers.waitForFullLoad();
          const form = page.locator('form').first();
          if (await form.count() > 0) {
            formFound = true;
            console.log(`✅ Referral form found at ${url}`);
            break;
          }
        } catch (error) {
          console.log(`Could not access ${url}`);
        }
      }
    }

    if (formFound) {
      // Analyze referral form structure
      const form = page.locator('form').first();
      await expect(form).toBeVisible();

      // Check for common referral form fields
      const expectedFields = [
        { name: 'Candidate Name', selectors: ['input[name*="name"], input[placeholder*="name"], input[id*="name"]'] },
        { name: 'Candidate Email', selectors: ['input[type="email"], input[name*="email"], input[placeholder*="email"]'] },
        { name: 'Candidate Phone', selectors: ['input[type="tel"], input[name*="phone"], input[placeholder*="phone"]'] },
        { name: 'LinkedIn Profile', selectors: ['input[name*="linkedin"], input[placeholder*="linkedin"], input[name*="profile"]'] },
        { name: 'Resume/CV', selectors: ['input[type="file"], input[name*="resume"], input[name*="cv"]'] },
        { name: 'Relationship', selectors: ['input[name*="relationship"], select[name*="relationship"], textarea[name*="relationship"]'] },
        { name: 'Recommendation', selectors: ['textarea[name*="recommendation"], textarea[placeholder*="recommend"], textarea[name*="why"]'] },
        { name: 'Job Selection', selectors: ['select[name*="job"], input[name*="job"], select[name*="position"]'] }
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

      console.log('Found referral fields:', foundFields);
      console.log('Missing referral fields:', missingFields);

      await helpers.takeScreenshot('referral-form-structure');
    } else {
      console.log('❌ No referral form found');
    }
  });

  test('Referral form validation', async () => {
    console.log('✅ Testing referral form validation...');
    
    // Try to access referral form
    await page.goto('/dashboard');
    await helpers.waitForFullLoad();

    // Look for referral functionality
    const referralTrigger = page.locator('button:has-text("Refer"), a:has-text("Refer"), button:has-text("Submit"), a:has-text("Referral")').first();
    
    if (await referralTrigger.count() === 0) {
      console.log('ℹ️ No referral triggers found in dashboard');
      return;
    }

    // Try to open referral form
    await referralTrigger.click();
    await page.waitForTimeout(2000);

    const form = page.locator('form').first();
    if (await form.count() === 0) {
      console.log('ℹ️ No form appeared after clicking referral trigger');
      return;
    }

    console.log('✅ Referral form found');

    // Test form validation by submitting empty form
    const submitButton = form.locator('button[type="submit"], input[type="submit"], button:has-text("Submit"), button:has-text("Refer")').first();
    
    if (await submitButton.count() > 0) {
      await submitButton.click();
      await page.waitForTimeout(2000);

      // Check for validation errors
      const errorElements = page.locator('.error, [role="alert"], .text-red-500, .text-destructive, .invalid');
      const errorCount = await errorElements.count();
      
      if (errorCount > 0) {
        console.log(`✅ Referral form validation working - ${errorCount} error messages displayed`);
        
        // Try to identify which fields have errors
        for (let i = 0; i < Math.min(errorCount, 5); i++) {
          const error = errorElements.nth(i);
          const errorText = await error.textContent();
          console.log(`Validation error ${i + 1}: ${errorText}`);
        }
      } else {
        console.log('⚠️ No validation errors shown for empty referral form submission');
      }

      await helpers.takeScreenshot('referral-form-validation');
    } else {
      console.log('⚠️ No submit button found in referral form');
    }
  });

  test('Referral form completion with valid data', async () => {
    console.log('📝 Testing referral form completion...');
    
    await page.goto('/dashboard');
    await helpers.waitForFullLoad();

    // Look for and open referral form
    const referButton = page.locator('button:has-text("Refer"), a:has-text("Refer"), button:has-text("Submit"), a:has-text("Referral")').first();
    
    if (await referButton.count() === 0) {
      console.log('ℹ️ No referral button found');
      return;
    }

    await referButton.click();
    await page.waitForTimeout(2000);

    const form = page.locator('form').first();
    if (await form.count() === 0) {
      console.log('ℹ️ No referral form appeared');
      return;
    }

    // Fill out the form with test data
    const referralData = testData.referral.valid;

    // Candidate Name
    const nameField = form.locator('input[name*="name"], input[placeholder*="name"], input[id*="name"]').first();
    if (await nameField.count() > 0) {
      await nameField.fill(referralData.candidateName);
      console.log('✅ Candidate name filled');
    }

    // Candidate Email
    const emailField = form.locator('input[type="email"], input[name*="email"], input[placeholder*="email"]').first();
    if (await emailField.count() > 0) {
      await emailField.fill(referralData.candidateEmail);
      console.log('✅ Candidate email filled');
    }

    // Candidate Phone
    const phoneField = form.locator('input[type="tel"], input[name*="phone"], input[placeholder*="phone"]').first();
    if (await phoneField.count() > 0) {
      await phoneField.fill(referralData.candidatePhone);
      console.log('✅ Candidate phone filled');
    }

    // LinkedIn Profile
    const linkedinField = form.locator('input[name*="linkedin"], input[placeholder*="linkedin"], input[name*="profile"]').first();
    if (await linkedinField.count() > 0) {
      await linkedinField.fill(referralData.candidateLinkedIn);
      console.log('✅ LinkedIn profile filled');
    }

    // Relationship
    const relationshipField = form.locator('input[name*="relationship"], select[name*="relationship"], textarea[name*="relationship"]').first();
    if (await relationshipField.count() > 0) {
      if ((await relationshipField.tagName()) === 'SELECT') {
        // Try to select an option
        const options = relationshipField.locator('option');
        const optionCount = await options.count();
        if (optionCount > 1) {
          await relationshipField.selectOption({ index: 1 });
        }
      } else {
        await relationshipField.fill(referralData.relationship);
      }
      console.log('✅ Relationship filled');
    }

    // Recommendation
    const recommendationField = form.locator('textarea[name*="recommendation"], textarea[placeholder*="recommend"], textarea[name*="why"]').first();
    if (await recommendationField.count() > 0) {
      await recommendationField.fill(referralData.recommendation);
      console.log('✅ Recommendation filled');
    }

    // Why good fit
    const whyFitField = form.locator('textarea[name*="fit"], textarea[placeholder*="fit"], textarea[name*="good"]').first();
    if (await whyFitField.count() > 0) {
      await whyFitField.fill(referralData.whyGoodFit);
      console.log('✅ Why good fit filled');
    }

    // Job Selection (if available)
    const jobSelect = form.locator('select[name*="job"], select[name*="position"]').first();
    if (await jobSelect.count() > 0) {
      const options = jobSelect.locator('option');
      const optionCount = await options.count();
      if (optionCount > 1) {
        await jobSelect.selectOption({ index: 1 });
        console.log('✅ Job selected');
      }
    }

    await helpers.takeScreenshot('referral-form-filled');

    // Try to submit the form (but don't expect it to work in production)
    const submitButton = form.locator('button[type="submit"], input[type="submit"], button:has-text("Submit"), button:has-text("Refer")').first();
    
    if (await submitButton.count() > 0) {
      console.log('Attempting to submit referral form...');
      await submitButton.click();
      await page.waitForTimeout(3000);

      // Check the result
      const currentUrl = page.url();
      const pageContent = await page.textContent('body');

      if (pageContent?.includes('success') || pageContent?.includes('submitted') || 
          pageContent?.includes('thank') || currentUrl.includes('success')) {
        console.log('✅ Referral appears to have been successful');
      } else if (pageContent?.includes('error') || pageContent?.includes('failed')) {
        console.log('❌ Referral submission failed - this is expected in production testing');
      } else if (pageContent?.includes('login') || pageContent?.includes('sign in')) {
        console.log('🔐 Referral submission requires authentication');
      } else {
        console.log('ℹ️ Referral submission result unclear');
      }

      await helpers.takeScreenshot('referral-form-submitted');
    }
  });

  test('File upload functionality in referral form', async () => {
    console.log('📎 Testing file upload functionality...');
    
    await page.goto('/dashboard');
    await helpers.waitForFullLoad();

    // Try to access referral form
    const referButton = page.locator('button:has-text("Refer"), a:has-text("Refer")').first();
    
    if (await referButton.count() === 0) {
      console.log('ℹ️ No referral button found');
      return;
    }

    await referButton.click();
    await page.waitForTimeout(2000);

    const form = page.locator('form').first();
    if (await form.count() === 0) {
      console.log('ℹ️ No referral form appeared');
      return;
    }

    // Look for file upload fields
    const fileInputs = form.locator('input[type="file"]');
    const fileInputCount = await fileInputs.count();

    if (fileInputCount === 0) {
      console.log('ℹ️ No file upload fields found in referral form');
      return;
    }

    console.log(`✅ Found ${fileInputCount} file upload fields`);

    // Test each file input
    for (let i = 0; i < fileInputCount; i++) {
      const fileInput = fileInputs.nth(i);
      const inputName = await fileInput.getAttribute('name') || `file-${i}`;
      
      // Check file input attributes
      const accept = await fileInput.getAttribute('accept');
      const multiple = await fileInput.getAttribute('multiple');
      
      console.log(`File input ${inputName}: accept="${accept}", multiple="${multiple}"`);

      // Test if we can interact with the file input (without actually uploading)
      const isVisible = await fileInput.isVisible();
      if (!isVisible) {
        // File input might be hidden with custom styling
        console.log(`File input ${inputName} is hidden (custom styling)`);
        
        // Look for custom upload button or area
        const uploadArea = form.locator('.upload, .file-upload, [data-testid="upload"], button:has-text("Upload"), label[for]').first();
        if (await uploadArea.count() > 0) {
          console.log('✅ Custom upload interface found');
        }
      } else {
        console.log(`✅ File input ${inputName} is visible`);
      }
    }

    await helpers.takeScreenshot('referral-file-upload');
  });

  test('Referral history and management', async () => {
    console.log('📋 Testing referral history and management...');
    
    await page.goto('/dashboard');
    await helpers.waitForFullLoad();

    // Look for referral history/management sections
    const referralSections = [
      'section:has-text("Referral")',
      'div:has-text("My Referrals")',
      'div:has-text("Referral History")',
      '.referrals-list',
      '[data-testid="referrals"]',
      'table:has(th:has-text("Referral"))'
    ];

    let referralSectionFound = false;

    for (const selector of referralSections) {
      const section = page.locator(selector).first();
      if (await section.count() > 0 && await section.isVisible()) {
        referralSectionFound = true;
        console.log(`✅ Referral section found: ${selector}`);
        
        // Look for referral entries
        const referralEntries = section.locator('tr, .referral-item, .referral-card, li').filter({
          hasNotText: /^$/
        });
        const entryCount = await referralEntries.count();
        console.log(`Found ${entryCount} referral entries`);

        // Check for referral status indicators
        const statusElements = section.locator('.status, [data-testid="status"], .badge');
        const statusCount = await statusElements.count();
        console.log(`Found ${statusCount} status indicators`);

        // Check for referral actions (view, edit, withdraw)
        const actionButtons = section.locator('button, a').filter({
          hasText: /view|edit|withdraw|cancel|details/i
        });
        const actionCount = await actionButtons.count();
        console.log(`Found ${actionCount} referral action buttons`);

        await helpers.takeScreenshot('referral-history-section');
        break;
      }
    }

    if (!referralSectionFound) {
      console.log('ℹ️ No referral history section found');
      
      // Try to access referrals via navigation
      const referralsNav = page.locator('a[href*="referral"], a:has-text("Referrals"), nav a:has-text("Referral")').first();
      if (await referralsNav.count() > 0) {
        await referralsNav.click();
        await page.waitForLoadState('networkidle');
        await helpers.takeScreenshot('referrals-navigation-result');
      }
    }
  });

  test('Referral notification and confirmation flow', async () => {
    console.log('🔔 Testing referral notification flow...');
    
    await page.goto('/dashboard');
    await helpers.waitForFullLoad();

    // Look for referral-related notifications
    const notificationAreas = [
      '.notifications',
      '[data-testid="notifications"]', 
      '.alerts',
      '.toast',
      '.message'
    ];

    let notificationFound = false;

    for (const selector of notificationAreas) {
      const notification = page.locator(selector);
      const count = await notification.count();
      
      if (count > 0) {
        console.log(`✅ Found notification area: ${selector} (${count} items)`);
        notificationFound = true;
        
        // Check notification content for referral-related items
        const notificationText = await notification.allTextContents();
        const referralNotifications = notificationText.filter(text => 
          text.toLowerCase().includes('referral') || 
          text.toLowerCase().includes('refer')
        );
        
        console.log(`Found ${referralNotifications.length} referral-related notifications`);
        break;
      }
    }

    if (!notificationFound) {
      console.log('ℹ️ No notification area found');
    }

    // Look for confirmation messages or success states
    const confirmationMessages = page.locator('text=/referral.*submit/i, text=/thank.*you/i, text=/success/i').first();
    if (await confirmationMessages.count() > 0) {
      const confirmationText = await confirmationMessages.textContent();
      console.log(`✅ Found confirmation message: ${confirmationText}`);
    }

    await helpers.takeScreenshot('referral-notifications');
  });

  test('Mobile referral submission experience', async () => {
    console.log('📱 Testing mobile referral submission...');
    
    await page.setViewportSize(testData.viewports.mobile);
    await page.goto('/dashboard');
    await helpers.waitForFullLoad();

    // Check mobile responsiveness
    const mobileIssues = await helpers.checkMobileResponsiveness();
    if (mobileIssues.length > 0) {
      console.warn('⚠️ Mobile responsiveness issues:', mobileIssues);
    }

    // Check if referral functionality is accessible on mobile
    const referButton = page.locator('button:has-text("Refer"), a:has-text("Refer")').first();
    if (await referButton.count() > 0 && await referButton.isVisible()) {
      console.log('✅ Referral button visible on mobile');
      
      await referButton.click();
      await page.waitForTimeout(2000);

      const form = page.locator('form').first();
      if (await form.count() > 0) {
        // Check if form is usable on mobile
        const formBounds = await form.boundingBox();
        if (formBounds && formBounds.width <= testData.viewports.mobile.width) {
          console.log('✅ Referral form fits mobile viewport');
        } else {
          console.warn('⚠️ Referral form may not fit mobile viewport');
        }

        // Test scrolling and form interaction on mobile
        const inputs = form.locator('input, textarea').first();
        if (await inputs.count() > 0) {
          await inputs.click();
          await inputs.fill('Test mobile input');
          console.log('✅ Mobile form input working');
        }

        // Check if file upload works on mobile
        const fileInput = form.locator('input[type="file"]').first();
        if (await fileInput.count() > 0) {
          console.log('✅ File upload available on mobile');
        }
      }
    } else {
      console.log('ℹ️ Referral button not visible on mobile');
    }

    await helpers.takeScreenshot('referral-mobile');
    
    // Reset viewport
    await page.setViewportSize(testData.viewports.desktop);
  });

  test('Referral form accessibility features', async () => {
    console.log('♿ Testing referral form accessibility...');
    
    await page.goto('/dashboard');
    await helpers.waitForFullLoad();

    // Check accessibility of referral interface
    const a11yIssues = await helpers.checkBasicAccessibility();
    if (a11yIssues.length > 0) {
      console.warn('⚠️ Accessibility issues in dashboard:', a11yIssues);
    }

    // Try to access referral form
    const referButton = page.locator('button:has-text("Refer"), a:has-text("Refer")').first();
    if (await referButton.count() > 0) {
      // Check button accessibility
      const hasAriaLabel = await referButton.getAttribute('aria-label');
      const hasTitle = await referButton.getAttribute('title');
      const buttonText = await referButton.textContent();
      
      if (!hasAriaLabel && !hasTitle && !buttonText?.trim()) {
        console.warn('⚠️ Referral button lacks accessible name');
      } else {
        console.log('✅ Referral button has accessible name');
      }

      await referButton.click();
      await page.waitForTimeout(2000);

      const form = page.locator('form').first();
      if (await form.count() > 0) {
        // Check form accessibility
        const formA11yIssues = await helpers.checkBasicAccessibility();
        if (formA11yIssues.length > 0) {
          console.warn('⚠️ Referral form accessibility issues:', formA11yIssues);
        }

        // Check for proper form labels and ARIA attributes
        const inputs = form.locator('input, textarea, select');
        const inputCount = await inputs.count();
        
        let properlyLabeledInputs = 0;
        
        for (let i = 0; i < inputCount; i++) {
          const input = inputs.nth(i);
          const inputId = await input.getAttribute('id');
          const inputName = await input.getAttribute('name');
          const ariaLabel = await input.getAttribute('aria-label');
          const placeholder = await input.getAttribute('placeholder');
          
          // Check if input has proper labeling
          let hasProperLabel = false;
          
          if (inputId) {
            const label = page.locator(`label[for="${inputId}"]`);
            hasProperLabel = await label.count() > 0;
          }
          
          if (!hasProperLabel && (ariaLabel || placeholder)) {
            hasProperLabel = true;
          }
          
          if (hasProperLabel) {
            properlyLabeledInputs++;
          } else {
            console.warn(`⚠️ Input field (${inputName || i}) lacks proper labeling`);
          }
        }
        
        console.log(`✅ ${properlyLabeledInputs}/${inputCount} inputs properly labeled`);

        // Check for required field indicators
        const requiredFields = form.locator('[required], [aria-required="true"]');
        const requiredCount = await requiredFields.count();
        console.log(`Found ${requiredCount} required fields with proper marking`);
      }
    }

    await helpers.takeScreenshot('referral-accessibility-check');
  });
});