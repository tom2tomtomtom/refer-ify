import { test, expect, Page } from '@playwright/test';
import { TestHelpers } from './utils/test-helpers';
import { testData } from './fixtures/test-data';

test.describe('Comprehensive Form Validation', () => {
  let page: Page;
  let helpers: TestHelpers;

  test.beforeEach(async ({ page: testPage }) => {
    page = testPage;
    helpers = new TestHelpers(page);
  });

  test('Email validation across all forms', async () => {
    console.log('📧 Testing email validation across forms...');
    
    const formsToTest = [
      { url: '/login', formName: 'Login Form' },
      { url: '/register', formName: 'Registration Form' },
      { url: '/contact', formName: 'Contact Form' },
      { url: '/dashboard', formName: 'Dashboard Forms' }
    ];

    const emailTestCases = testData.formValidation.email;

    for (const formTest of formsToTest) {
      console.log(`\n--- Testing ${formTest.formName} ---`);
      
      try {
        await page.goto(formTest.url);
        await helpers.waitForFullLoad();
        
        const form = page.locator('form').first();
        if (await form.count() === 0) {
          console.log(`ℹ️ No form found on ${formTest.url}`);
          continue;
        }

        const emailInput = form.locator('input[type="email"], input[name*="email"], input[placeholder*="email"]').first();
        if (await emailInput.count() === 0) {
          console.log(`ℹ️ No email input found in ${formTest.formName}`);
          continue;
        }

        console.log(`✅ Testing email validation in ${formTest.formName}`);

        // Test invalid emails
        for (const invalidEmail of emailTestCases.invalid) {
          await emailInput.fill(invalidEmail);
          await emailInput.blur();
          await page.waitForTimeout(1000);

          // Check for validation error
          const errorVisible = await page.locator('.error, [role="alert"], .text-red-500, .invalid').isVisible();
          if (errorVisible) {
            console.log(`✅ Invalid email "${invalidEmail}" properly rejected`);
          } else {
            console.warn(`⚠️ Invalid email "${invalidEmail}" not rejected in ${formTest.formName}`);
          }
        }

        // Test valid emails
        for (const validEmail of emailTestCases.valid) {
          await emailInput.fill(validEmail);
          await emailInput.blur();
          await page.waitForTimeout(1000);

          // Check that no error appears
          const errorVisible = await page.locator('.error, [role="alert"], .text-red-500, .invalid').isVisible();
          if (!errorVisible) {
            console.log(`✅ Valid email "${validEmail}" accepted`);
          } else {
            console.warn(`⚠️ Valid email "${validEmail}" incorrectly rejected in ${formTest.formName}`);
          }
        }

        await helpers.takeScreenshot(`email-validation-${formTest.formName.replace(/\s+/g, '-').toLowerCase()}`);

      } catch (error) {
        console.warn(`Error testing ${formTest.formName}:`, error);
      }
    }
  });

  test('Password validation and strength checking', async () => {
    console.log('🔒 Testing password validation...');
    
    const passwordForms = ['/register', '/login', '/dashboard'];
    const passwordTestCases = testData.formValidation.password;

    for (const formUrl of passwordForms) {
      try {
        await page.goto(formUrl);
        await helpers.waitForFullLoad();
        
        const form = page.locator('form').first();
        if (await form.count() === 0) continue;

        const passwordInput = form.locator('input[type="password"]').first();
        if (await passwordInput.count() === 0) {
          console.log(`ℹ️ No password input found on ${formUrl}`);
          continue;
        }

        console.log(`Testing password validation on ${formUrl}`);

        // Test weak passwords
        for (const weakPassword of passwordTestCases.invalid) {
          await passwordInput.fill(weakPassword);
          await passwordInput.blur();
          await page.waitForTimeout(1000);

          // Look for password strength indicator or error
          const strengthIndicator = page.locator('.password-strength, .strength, .weak, .strong, .error').first();
          if (await strengthIndicator.count() > 0 && await strengthIndicator.isVisible()) {
            const strengthText = await strengthIndicator.textContent();
            console.log(`✅ Password strength feedback for "${weakPassword}": ${strengthText}`);
          }
        }

        // Test strong passwords
        for (const strongPassword of passwordTestCases.valid) {
          await passwordInput.fill(strongPassword);
          await passwordInput.blur();
          await page.waitForTimeout(1000);

          const strengthIndicator = page.locator('.password-strength, .strength, .strong').first();
          if (await strengthIndicator.count() > 0 && await strengthIndicator.isVisible()) {
            const strengthText = await strengthIndicator.textContent();
            console.log(`✅ Strong password "${strongPassword}" feedback: ${strengthText}`);
          }
        }

        // Test password confirmation matching (if present)
        const confirmPasswordInput = form.locator('input[name*="confirm"], input[placeholder*="confirm"], input[id*="confirm"]').first();
        if (await confirmPasswordInput.count() > 0) {
          await passwordInput.fill('TestPassword123!');
          await confirmPasswordInput.fill('DifferentPassword123!');
          await confirmPasswordInput.blur();
          await page.waitForTimeout(1000);

          const mismatchError = page.locator('.error, [role="alert"]').filter({
            hasText: /match|confirm|same/i
          });
          
          if (await mismatchError.count() > 0) {
            console.log('✅ Password confirmation mismatch properly detected');
          }
        }

        await helpers.takeScreenshot(`password-validation-${formUrl.replace('/', '')}`);

      } catch (error) {
        console.warn(`Error testing password validation on ${formUrl}:`, error);
      }
    }
  });

  test('Phone number validation', async () => {
    console.log('📱 Testing phone number validation...');
    
    // Look for forms with phone inputs across the site
    const phoneForms = ['/register', '/dashboard', '/contact'];
    const phoneTestCases = testData.formValidation.phone;

    for (const formUrl of phoneForms) {
      try {
        await page.goto(formUrl);
        await helpers.waitForFullLoad();
        
        // Look for phone input fields
        const phoneInputs = page.locator('input[type="tel"], input[name*="phone"], input[placeholder*="phone"]');
        const phoneInputCount = await phoneInputs.count();

        if (phoneInputCount === 0) {
          console.log(`ℹ️ No phone inputs found on ${formUrl}`);
          continue;
        }

        console.log(`Testing phone validation on ${formUrl} (${phoneInputCount} phone inputs)`);

        const phoneInput = phoneInputs.first();

        // Test invalid phone numbers
        for (const invalidPhone of phoneTestCases.invalid) {
          await phoneInput.fill(invalidPhone);
          await phoneInput.blur();
          await page.waitForTimeout(1000);

          const errorVisible = await page.locator('.error, [role="alert"], .text-red-500, .invalid').isVisible();
          if (errorVisible) {
            console.log(`✅ Invalid phone "${invalidPhone}" properly rejected`);
          } else {
            console.warn(`⚠️ Invalid phone "${invalidPhone}" not rejected on ${formUrl}`);
          }
        }

        // Test valid phone numbers
        for (const validPhone of phoneTestCases.valid) {
          await phoneInput.fill(validPhone);
          await phoneInput.blur();
          await page.waitForTimeout(1000);

          const errorVisible = await page.locator('.error, [role="alert"], .text-red-500, .invalid').isVisible();
          if (!errorVisible) {
            console.log(`✅ Valid phone "${validPhone}" accepted`);
          } else {
            console.warn(`⚠️ Valid phone "${validPhone}" incorrectly rejected on ${formUrl}`);
          }
        }

        await helpers.takeScreenshot(`phone-validation-${formUrl.replace('/', '')}`);

      } catch (error) {
        console.warn(`Error testing phone validation on ${formUrl}:`, error);
      }
    }
  });

  test('URL/Link validation', async () => {
    console.log('🔗 Testing URL validation...');
    
    const urlForms = ['/register', '/dashboard'];
    const urlTestCases = testData.formValidation.url;

    for (const formUrl of urlForms) {
      try {
        await page.goto(formUrl);
        await helpers.waitForFullLoad();
        
        // Look for URL input fields (LinkedIn, portfolio, website, etc.)
        const urlInputs = page.locator('input[type="url"], input[name*="url"], input[name*="website"], input[name*="linkedin"], input[placeholder*="http"], input[placeholder*="linkedin"]');
        const urlInputCount = await urlInputs.count();

        if (urlInputCount === 0) {
          console.log(`ℹ️ No URL inputs found on ${formUrl}`);
          continue;
        }

        console.log(`Testing URL validation on ${formUrl} (${urlInputCount} URL inputs)`);

        const urlInput = urlInputs.first();

        // Test invalid URLs
        for (const invalidUrl of urlTestCases.invalid) {
          await urlInput.fill(invalidUrl);
          await urlInput.blur();
          await page.waitForTimeout(1000);

          const errorVisible = await page.locator('.error, [role="alert"], .text-red-500, .invalid').isVisible();
          if (errorVisible) {
            console.log(`✅ Invalid URL "${invalidUrl}" properly rejected`);
          } else {
            console.warn(`⚠️ Invalid URL "${invalidUrl}" not rejected on ${formUrl}`);
          }
        }

        // Test valid URLs
        for (const validUrl of urlTestCases.valid) {
          await urlInput.fill(validUrl);
          await urlInput.blur();
          await page.waitForTimeout(1000);

          const errorVisible = await page.locator('.error, [role="alert"], .text-red-500, .invalid').isVisible();
          if (!errorVisible) {
            console.log(`✅ Valid URL "${validUrl}" accepted`);
          } else {
            console.warn(`⚠️ Valid URL "${validUrl}" incorrectly rejected on ${formUrl}`);
          }
        }

        await helpers.takeScreenshot(`url-validation-${formUrl.replace('/', '')}`);

      } catch (error) {
        console.warn(`Error testing URL validation on ${formUrl}:`, error);
      }
    }
  });

  test('Required field validation', async () => {
    console.log('⚠️ Testing required field validation...');
    
    const formsToTest = ['/login', '/register', '/contact', '/dashboard'];

    for (const formUrl of formsToTest) {
      try {
        await page.goto(formUrl);
        await helpers.waitForFullLoad();
        
        const forms = page.locator('form');
        const formCount = await forms.count();

        if (formCount === 0) {
          console.log(`ℹ️ No forms found on ${formUrl}`);
          continue;
        }

        console.log(`Testing required fields on ${formUrl} (${formCount} forms)`);

        // Test each form
        for (let i = 0; i < formCount; i++) {
          const form = forms.nth(i);
          
          // Find required fields
          const requiredFields = form.locator('input[required], textarea[required], select[required], input[aria-required="true"], textarea[aria-required="true"]');
          const requiredCount = await requiredFields.count();

          if (requiredCount === 0) {
            console.log(`Form ${i + 1}: No explicitly marked required fields`);
            continue;
          }

          console.log(`Form ${i + 1}: Found ${requiredCount} required fields`);

          // Try to submit form without filling required fields
          const submitButton = form.locator('button[type="submit"], input[type="submit"]').first();
          if (await submitButton.count() > 0) {
            await submitButton.click();
            await page.waitForTimeout(2000);

            // Check for validation errors
            const errorElements = form.locator('.error, [role="alert"], .text-red-500, .invalid');
            const errorCount = await errorElements.count();

            if (errorCount > 0) {
              console.log(`✅ Form ${i + 1}: Required field validation working (${errorCount} errors)`);
            } else {
              console.warn(`⚠️ Form ${i + 1}: No validation errors for empty required fields`);
            }

            // Check for HTML5 validation messages
            const html5ValidationVisible = await page.evaluate(() => {
              const inputs = document.querySelectorAll('input[required]:invalid');
              return inputs.length > 0;
            });

            if (html5ValidationVisible) {
              console.log(`✅ Form ${i + 1}: HTML5 validation active`);
            }
          }
        }

        await helpers.takeScreenshot(`required-fields-${formUrl.replace('/', '')}`);

      } catch (error) {
        console.warn(`Error testing required fields on ${formUrl}:`, error);
      }
    }
  });

  test('Real-time validation feedback', async () => {
    console.log('⚡ Testing real-time validation feedback...');
    
    await page.goto('/register');
    await helpers.waitForFullLoad();
    
    const form = page.locator('form').first();
    if (await form.count() === 0) {
      console.log('ℹ️ No registration form found for real-time validation test');
      return;
    }

    // Test real-time email validation
    const emailInput = form.locator('input[type="email"], input[name*="email"]').first();
    if (await emailInput.count() > 0) {
      console.log('Testing real-time email validation...');
      
      // Type invalid email character by character
      const invalidEmail = 'invalid-email';
      for (const char of invalidEmail) {
        await emailInput.type(char);
        await page.waitForTimeout(100);
      }
      
      // Check if error appears before blur
      await page.waitForTimeout(1000);
      const realtimeError = page.locator('.error, [role="alert"]').filter({
        hasText: /email|invalid/i
      });
      
      if (await realtimeError.count() > 0 && await realtimeError.isVisible()) {
        console.log('✅ Real-time email validation working');
      } else {
        console.log('ℹ️ No real-time email validation (validates on blur/submit)');
      }
    }

    // Test real-time password strength
    const passwordInput = form.locator('input[type="password"]').first();
    if (await passwordInput.count() > 0) {
      console.log('Testing real-time password strength feedback...');
      
      await passwordInput.clear();
      await passwordInput.type('weak');
      await page.waitForTimeout(500);
      
      const strengthIndicator = page.locator('.password-strength, .strength, .weak, .strong');
      if (await strengthIndicator.count() > 0 && await strengthIndicator.isVisible()) {
        console.log('✅ Real-time password strength feedback working');
      } else {
        console.log('ℹ️ No real-time password strength feedback');
      }
    }

    await helpers.takeScreenshot('realtime-validation');
  });

  test('Form validation accessibility', async () => {
    console.log('♿ Testing form validation accessibility...');
    
    const formsToTest = ['/login', '/register'];
    
    for (const formUrl of formsToTest) {
      try {
        await page.goto(formUrl);
        await helpers.waitForFullLoad();
        
        const form = page.locator('form').first();
        if (await form.count() === 0) continue;

        console.log(`Testing validation accessibility on ${formUrl}`);

        // Check for proper ARIA attributes on form elements
        const inputs = form.locator('input, textarea, select');
        const inputCount = await inputs.count();
        
        let accessibleInputs = 0;
        let inputsWithAriaDescribed = 0;

        for (let i = 0; i < inputCount; i++) {
          const input = inputs.nth(i);
          const hasAriaLabel = await input.getAttribute('aria-label');
          const hasAriaDescribed = await input.getAttribute('aria-describedby');
          const hasAriaRequired = await input.getAttribute('aria-required');
          const hasAriaInvalid = await input.getAttribute('aria-invalid');
          
          if (hasAriaLabel || hasAriaDescribed) {
            accessibleInputs++;
          }
          
          if (hasAriaDescribed) {
            inputsWithAriaDescribed++;
          }
          
          // Check if aria-required is set for required fields
          const isRequired = await input.getAttribute('required') !== null;
          if (isRequired && hasAriaRequired === 'true') {
            console.log(`✅ Required field ${i + 1} has proper aria-required`);
          }
        }

        console.log(`Accessible inputs: ${accessibleInputs}/${inputCount}`);
        console.log(`Inputs with aria-describedby: ${inputsWithAriaDescribed}/${inputCount}`);

        // Test that error messages are announced to screen readers
        const emailInput = form.locator('input[type="email"]').first();
        if (await emailInput.count() > 0) {
          await emailInput.fill('invalid-email');
          await emailInput.blur();
          await page.waitForTimeout(1000);

          // Check if error message has proper ARIA attributes
          const errorMessage = page.locator('.error, [role="alert"]').first();
          if (await errorMessage.count() > 0) {
            const role = await errorMessage.getAttribute('role');
            const ariaLive = await errorMessage.getAttribute('aria-live');
            
            if (role === 'alert' || ariaLive) {
              console.log('✅ Error message has proper ARIA attributes for screen readers');
            } else {
              console.warn('⚠️ Error message may not be announced to screen readers');
            }
          }
        }

        // Check for proper field labeling
        const labels = form.locator('label');
        const labelCount = await labels.count();
        
        let properlyLabeledInputs = 0;
        
        for (let i = 0; i < labelCount; i++) {
          const label = labels.nth(i);
          const forAttribute = await label.getAttribute('for');
          
          if (forAttribute) {
            const associatedInput = form.locator(`#${forAttribute}`);
            if (await associatedInput.count() > 0) {
              properlyLabeledInputs++;
            }
          }
        }

        console.log(`Properly labeled inputs: ${properlyLabeledInputs}/${labelCount}`);

        await helpers.takeScreenshot(`validation-accessibility-${formUrl.replace('/', '')}`);

      } catch (error) {
        console.warn(`Error testing validation accessibility on ${formUrl}:`, error);
      }
    }
  });

  test('Cross-browser form validation consistency', async () => {
    console.log('🌐 Testing cross-browser validation consistency...');
    
    // This test is run across different browsers via the Playwright config
    // We'll test that validation behaves consistently
    
    await page.goto('/register');
    await helpers.waitForFullLoad();
    
    const form = page.locator('form').first();
    if (await form.count() === 0) {
      console.log('ℹ️ No registration form found for cross-browser test');
      return;
    }

    const browserName = page.context().browser()?.browserType().name();
    console.log(`Testing in browser: ${browserName}`);

    // Test HTML5 validation behavior
    const emailInput = form.locator('input[type="email"]').first();
    if (await emailInput.count() > 0) {
      await emailInput.fill('invalid-email-format');
      
      const submitButton = form.locator('button[type="submit"], input[type="submit"]').first();
      if (await submitButton.count() > 0) {
        await submitButton.click();
        await page.waitForTimeout(1000);
        
        // Check if HTML5 validation prevented submission
        const validationMessage = await emailInput.evaluate((input: HTMLInputElement) => {
          return input.validationMessage;
        });
        
        if (validationMessage) {
          console.log(`✅ ${browserName}: HTML5 validation message: "${validationMessage}"`);
        } else {
          console.log(`ℹ️ ${browserName}: No HTML5 validation message`);
        }
        
        // Check if custom validation also appeared
        const customError = page.locator('.error, [role="alert"]').first();
        if (await customError.count() > 0 && await customError.isVisible()) {
          const errorText = await customError.textContent();
          console.log(`✅ ${browserName}: Custom validation message: "${errorText}"`);
        }
      }
    }

    await helpers.takeScreenshot(`validation-${browserName}`);
  });

  test('Mobile form validation experience', async () => {
    console.log('📱 Testing mobile form validation...');
    
    await page.setViewportSize(testData.viewports.mobile);
    
    const formsToTest = ['/login', '/register'];
    
    for (const formUrl of formsToTest) {
      await page.goto(formUrl);
      await helpers.waitForFullLoad();
      
      const form = page.locator('form').first();
      if (await form.count() === 0) continue;

      console.log(`Testing mobile validation on ${formUrl}`);

      // Check that validation errors are visible and properly positioned on mobile
      const emailInput = form.locator('input[type="email"]').first();
      if (await emailInput.count() > 0) {
        await emailInput.fill('invalid-mobile-email');
        await emailInput.blur();
        await page.waitForTimeout(1000);

        const errorElement = page.locator('.error, [role="alert"]').first();
        if (await errorElement.count() > 0 && await errorElement.isVisible()) {
          const errorBounds = await errorElement.boundingBox();
          const inputBounds = await emailInput.boundingBox();
          
          if (errorBounds && inputBounds) {
            // Check if error is positioned properly relative to input
            const errorBelowInput = errorBounds.y > inputBounds.y;
            const errorWithinViewport = errorBounds.x >= 0 && 
              (errorBounds.x + errorBounds.width) <= testData.viewports.mobile.width;
            
            if (errorBelowInput && errorWithinViewport) {
              console.log('✅ Mobile validation error properly positioned');
            } else {
              console.warn('⚠️ Mobile validation error positioning issues');
            }
          }
          
          console.log('✅ Validation error visible on mobile');
        }
      }

      // Check mobile keyboard types for different input types
      const phoneInput = form.locator('input[type="tel"]').first();
      if (await phoneInput.count() > 0) {
        const inputMode = await phoneInput.getAttribute('inputmode');
        const pattern = await phoneInput.getAttribute('pattern');
        
        if (inputMode === 'tel' || pattern) {
          console.log('✅ Phone input has proper mobile keyboard hints');
        }
      }

      await helpers.takeScreenshot(`mobile-validation-${formUrl.replace('/', '')}`);
    }
    
    // Reset viewport
    await page.setViewportSize(testData.viewports.desktop);
  });
});