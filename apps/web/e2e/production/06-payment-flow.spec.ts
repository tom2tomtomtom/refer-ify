import { test, expect, Page } from '@playwright/test';
import { TestHelpers } from './utils/test-helpers';
import { testData } from './fixtures/test-data';

test.describe('Payment Flow Testing (Up to Checkout)', () => {
  let page: Page;
  let helpers: TestHelpers;

  test.beforeEach(async ({ page: testPage }) => {
    page = testPage;
    helpers = new TestHelpers(page);
  });

  test('Pricing page accessibility and content', async () => {
    console.log('💰 Testing pricing page...');
    
    const pricingUrls = [
      '/pricing',
      '/plans',
      '/subscription',
      '/membership',
      '/upgrade'
    ];

    let pricingUrl = null;

    for (const url of pricingUrls) {
      try {
        await page.goto(url);
        await page.waitForLoadState('networkidle', { timeout: 5000 });
        
        const currentUrl = page.url();
        const pageContent = await page.textContent('body');
        
        // Check if we found a pricing page
        if (!currentUrl.includes('404') && 
            !pageContent?.includes('404') && 
            !pageContent?.includes('Not Found') &&
            (pageContent?.includes('pricing') || pageContent?.includes('plan') || 
             pageContent?.includes('subscription') || pageContent?.includes('$') ||
             pageContent?.includes('price') || pageContent?.includes('upgrade'))) {
          pricingUrl = url;
          console.log(`✅ Pricing page found at: ${url}`);
          break;
        }
      } catch (error) {
        console.log(`❌ Could not access ${url}`);
      }
    }

    if (!pricingUrl) {
      console.log('ℹ️ No dedicated pricing page found - checking for upgrade options in dashboard');
      await page.goto('/dashboard');
      await helpers.waitForFullLoad();
      
      const upgradeButtons = page.locator('button:has-text("Upgrade"), a:has-text("Upgrade"), button:has-text("Subscribe"), a:has-text("Subscribe")');
      const buttonCount = await upgradeButtons.count();
      
      if (buttonCount > 0) {
        console.log(`✅ Found ${buttonCount} upgrade/subscribe buttons in dashboard`);
      }
      
      await helpers.takeScreenshot('dashboard-upgrade-options');
      return;
    }

    // Analyze pricing page content
    await helpers.takeScreenshot('pricing-page-loaded');

    // Look for pricing plans
    const pricingPlans = page.locator('.plan, .pricing-card, .subscription-plan, [data-testid*="plan"]');
    const planCount = await pricingPlans.count();
    console.log(`Found ${planCount} pricing plans`);

    // Check for plan features
    if (planCount > 0) {
      for (let i = 0; i < planCount; i++) {
        const plan = pricingPlans.nth(i);
        const planContent = await plan.textContent();
        
        // Look for plan name/title
        const planTitle = plan.locator('h1, h2, h3, h4, .title, .plan-name').first();
        const title = await planTitle.textContent() || `Plan ${i + 1}`;
        
        console.log(`Plan ${i + 1}: ${title}`);
        
        // Check for pricing information
        const hasPricing = planContent?.includes('$') || planContent?.includes('price') || planContent?.includes('free');
        if (hasPricing) {
          console.log(`✅ Plan ${i + 1} has pricing information`);
        }

        // Look for CTA buttons
        const ctaButton = plan.locator('button, a').filter({
          hasText: /subscribe|upgrade|choose|select|get started|buy/i
        }).first();
        
        if (await ctaButton.count() > 0) {
          console.log(`✅ Plan ${i + 1} has CTA button`);
        }
      }
    }

    // Check for Founding Circle and Select Circle mentions
    const foundingCircle = page.locator('text=/founding.*circle/i, text=/founding/i').first();
    const selectCircle = page.locator('text=/select.*circle/i, text=/select/i').first();
    
    if (await foundingCircle.count() > 0) {
      console.log('✅ Founding Circle plan found');
    }
    if (await selectCircle.count() > 0) {
      console.log('✅ Select Circle plan found');
    }
  });

  test('Payment plan selection flow', async () => {
    console.log('📋 Testing payment plan selection...');
    
    // Start from pricing page or dashboard
    let startUrl = '/pricing';
    
    try {
      await page.goto(startUrl);
      await helpers.waitForFullLoad();
    } catch (error) {
      console.log('Pricing page not accessible, trying dashboard');
      startUrl = '/dashboard';
      await page.goto(startUrl);
      await helpers.waitForFullLoad();
    }

    // Look for subscription/upgrade buttons
    const subscriptionButtons = [
      'button:has-text("Subscribe")',
      'button:has-text("Upgrade")',
      'button:has-text("Choose Plan")',
      'button:has-text("Get Started")',
      'a:has-text("Subscribe")',
      'a:has-text("Upgrade")',
      'a:has-text("Choose Plan")',
      'a:has-text("Get Started")',
      '[data-testid*="subscribe"]',
      '[data-testid*="upgrade"]'
    ];

    let subscriptionFlow = false;
    
    for (const selector of subscriptionButtons) {
      const button = page.locator(selector).first();
      if (await button.count() > 0 && await button.isVisible()) {
        console.log(`Found subscription button: ${selector}`);
        const buttonText = await button.textContent();
        
        try {
          await button.click();
          await page.waitForLoadState('networkidle');
          await helpers.takeScreenshot(`subscription-flow-${buttonText?.replace(/\s+/g, '-').toLowerCase()}`);
          
          const currentUrl = page.url();
          const pageContent = await page.textContent('body');
          
          // Check if we're in a payment flow
          if (currentUrl.includes('checkout') || currentUrl.includes('payment') ||
              currentUrl.includes('subscribe') || currentUrl.includes('upgrade') ||
              pageContent?.includes('payment') || pageContent?.includes('checkout') ||
              pageContent?.includes('credit card') || pageContent?.includes('billing')) {
            console.log('✅ Successfully entered payment flow');
            subscriptionFlow = true;
            break;
          } else {
            console.log(`Button led to: ${currentUrl}`);
            // Go back and try next button
            await page.goBack();
            await helpers.waitForFullLoad();
          }
        } catch (error) {
          console.warn(`Could not click ${selector}:`, error);
        }
      }
    }

    if (!subscriptionFlow) {
      console.log('ℹ️ No payment/subscription flow found');
    }

    await helpers.takeScreenshot('payment-plan-selection');
  });

  test('Checkout page structure and form fields', async () => {
    console.log('🛒 Testing checkout page structure...');
    
    // Try to access checkout directly or through subscription flow
    const checkoutUrls = [
      '/checkout',
      '/payment',
      '/subscribe',
      '/billing'
    ];

    let checkoutFound = false;

    for (const url of checkoutUrls) {
      try {
        await page.goto(url);
        await page.waitForLoadState('networkidle', { timeout: 5000 });
        
        const currentUrl = page.url();
        const pageContent = await page.textContent('body');
        
        // Check if we found a checkout/payment page
        if (!currentUrl.includes('404') && 
            !pageContent?.includes('404') && 
            !pageContent?.includes('Not Found')) {
          
          if (pageContent?.includes('payment') || pageContent?.includes('checkout') ||
              pageContent?.includes('credit card') || pageContent?.includes('billing') ||
              pageContent?.includes('card number') || pageContent?.includes('stripe')) {
            checkoutFound = true;
            console.log(`✅ Checkout page found at: ${url}`);
            break;
          }
        }
      } catch (error) {
        console.log(`❌ Could not access ${url}`);
      }
    }

    if (!checkoutFound) {
      // Try to reach checkout through subscription flow from pricing
      await page.goto('/dashboard');
      await helpers.waitForFullLoad();
      
      const upgradeButton = page.locator('button:has-text("Upgrade"), a:has-text("Upgrade"), button:has-text("Subscribe")').first();
      if (await upgradeButton.count() > 0) {
        await upgradeButton.click();
        await page.waitForLoadState('networkidle');
        
        const pageContent = await page.textContent('body');
        if (pageContent?.includes('payment') || pageContent?.includes('checkout')) {
          checkoutFound = true;
          console.log('✅ Reached checkout through upgrade flow');
        }
      }
    }

    if (checkoutFound) {
      await helpers.takeScreenshot('checkout-page-loaded');
      
      // Analyze checkout form structure
      const form = page.locator('form').first();
      if (await form.count() > 0) {
        console.log('✅ Checkout form found');

        // Check for payment form fields
        const expectedFields = [
          { name: 'Card Number', selectors: ['input[name*="card"], input[placeholder*="card number"], input[id*="card"], [data-stripe="number"]'] },
          { name: 'Expiry Date', selectors: ['input[name*="expiry"], input[placeholder*="expiry"], input[name*="exp"], [data-stripe="exp"]'] },
          { name: 'CVC/CVV', selectors: ['input[name*="cvc"], input[name*="cvv"], input[placeholder*="cvc"], [data-stripe="cvc"]'] },
          { name: 'Cardholder Name', selectors: ['input[name*="name"], input[placeholder*="name"], input[placeholder*="cardholder"]'] },
          { name: 'Billing Address', selectors: ['input[name*="address"], input[placeholder*="address"], input[name*="street"]'] },
          { name: 'ZIP/Postal Code', selectors: ['input[name*="zip"], input[name*="postal"], input[placeholder*="zip"]'] }
        ];

        const foundFields: string[] = [];
        const missingFields: string[] = [];

        for (const field of expectedFields) {
          let fieldFound = false;
          for (const selector of field.selectors) {
            const element = page.locator(selector).first();
            if (await element.count() > 0) {
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

        console.log('Found payment fields:', foundFields);
        console.log('Missing payment fields:', missingFields);

        // Check for Stripe Elements or other payment processors
        const stripeElements = page.locator('[data-stripe], .StripeElement, #stripe-elements');
        const stripeCount = await stripeElements.count();
        if (stripeCount > 0) {
          console.log(`✅ Found ${stripeCount} Stripe payment elements`);
        }

        // Check for PayPal or other payment options
        const paypalButtons = page.locator('button:has-text("PayPal"), .paypal, #paypal');
        const paypalCount = await paypalButtons.count();
        if (paypalCount > 0) {
          console.log(`✅ Found ${paypalCount} PayPal payment options`);
        }

      } else {
        console.log('⚠️ No form found on checkout page');
      }
    } else {
      console.log('❌ No checkout page found');
    }
  });

  test('Payment form validation (up to validation only)', async () => {
    console.log('✅ Testing payment form validation...');
    
    // Try to access checkout page
    await page.goto('/dashboard');
    await helpers.waitForFullLoad();

    // Look for upgrade/subscription options
    const subscribeButton = page.locator('button:has-text("Subscribe"), a:has-text("Subscribe"), button:has-text("Upgrade")').first();
    
    if (await subscribeButton.count() === 0) {
      console.log('ℹ️ No subscription options found');
      return;
    }

    await subscribeButton.click();
    await page.waitForTimeout(3000);

    // Check if we're now on a payment page
    const pageContent = await page.textContent('body');
    if (!pageContent?.includes('payment') && !pageContent?.includes('checkout') && 
        !pageContent?.includes('card') && !pageContent?.includes('billing')) {
      console.log('ℹ️ Did not reach payment page');
      return;
    }

    console.log('✅ Reached payment form');
    await helpers.takeScreenshot('payment-form-loaded');

    const form = page.locator('form').first();
    if (await form.count() === 0) {
      console.log('⚠️ No payment form found');
      return;
    }

    // Test payment form validation by submitting empty form
    const submitButton = form.locator('button[type="submit"], input[type="submit"], button:has-text("Pay"), button:has-text("Subscribe"), button:has-text("Complete")').first();
    
    if (await submitButton.count() > 0) {
      console.log('Testing empty form submission...');
      await submitButton.click();
      await page.waitForTimeout(2000);

      // Check for validation errors
      const errorElements = page.locator('.error, [role="alert"], .text-red-500, .text-destructive, .invalid, .field-error');
      const errorCount = await errorElements.count();
      
      if (errorCount > 0) {
        console.log(`✅ Payment form validation working - ${errorCount} error messages displayed`);
        
        // Log validation errors
        for (let i = 0; i < Math.min(errorCount, 5); i++) {
          const error = errorElements.nth(i);
          const errorText = await error.textContent();
          console.log(`Validation error ${i + 1}: ${errorText}`);
        }
      } else {
        console.log('⚠️ No validation errors shown for empty payment form');
      }

      await helpers.takeScreenshot('payment-form-validation');
    } else {
      console.log('⚠️ No submit button found in payment form');
    }
  });

  test('Payment form field interactions (no actual payment)', async () => {
    console.log('💳 Testing payment form field interactions...');
    
    // Try to reach payment form
    await page.goto('/dashboard');
    await helpers.waitForFullLoad();

    const subscribeButton = page.locator('button:has-text("Subscribe"), button:has-text("Upgrade")').first();
    
    if (await subscribeButton.count() === 0) {
      console.log('ℹ️ No subscription button found');
      return;
    }

    await subscribeButton.click();
    await page.waitForTimeout(3000);

    const form = page.locator('form').first();
    if (await form.count() === 0) {
      console.log('ℹ️ No payment form found');
      return;
    }

    // Test filling payment form fields (but don't submit)
    const testCard = testData.payment.testCard;

    // Card number field
    const cardNumberField = form.locator('input[name*="card"], input[placeholder*="card"], [data-stripe="number"]').first();
    if (await cardNumberField.count() > 0) {
      await cardNumberField.fill(testCard.cardNumber);
      console.log('✅ Card number field interaction works');
      
      // Clear the field immediately
      await cardNumberField.clear();
    }

    // Expiry field
    const expiryField = form.locator('input[name*="expiry"], input[name*="exp"], [data-stripe="exp"]').first();
    if (await expiryField.count() > 0) {
      await expiryField.fill(`${testCard.expiryMonth}/${testCard.expiryYear}`);
      console.log('✅ Expiry field interaction works');
      
      // Clear the field
      await expiryField.clear();
    }

    // CVC field
    const cvcField = form.locator('input[name*="cvc"], input[name*="cvv"], [data-stripe="cvc"]').first();
    if (await cvcField.count() > 0) {
      await cvcField.fill(testCard.cvc);
      console.log('✅ CVC field interaction works');
      
      // Clear the field
      await cvcField.clear();
    }

    // Name field
    const nameField = form.locator('input[name*="name"], input[placeholder*="name"]').first();
    if (await nameField.count() > 0) {
      await nameField.fill(testCard.name);
      console.log('✅ Name field interaction works');
      
      // Clear the field
      await nameField.clear();
    }

    await helpers.takeScreenshot('payment-form-interactions');

    console.log('⚠️ Payment form interaction test completed - no actual payment attempted');
  });

  test('Subscription plan comparison and features', async () => {
    console.log('📊 Testing subscription plan comparison...');
    
    await page.goto('/pricing');
    await helpers.waitForFullLoad();
    
    // If pricing page doesn't exist, check dashboard
    const pageContent = await page.textContent('body');
    if (pageContent?.includes('404') || pageContent?.includes('Not Found')) {
      await page.goto('/dashboard');
      await helpers.waitForFullLoad();
    }

    // Look for plan comparison or features
    const planElements = page.locator('.plan, .pricing-card, .subscription, [data-testid*="plan"]');
    const planCount = await planElements.count();

    if (planCount > 0) {
      console.log(`Found ${planCount} subscription plans`);
      
      // Analyze each plan
      for (let i = 0; i < planCount; i++) {
        const plan = planElements.nth(i);
        const planText = await plan.textContent();
        
        // Check for plan tiers mentioned in requirements
        const isClient = planText?.toLowerCase().includes('client');
        const isCandidate = planText?.toLowerCase().includes('candidate');
        const isFoundingCircle = planText?.toLowerCase().includes('founding');
        const isSelectCircle = planText?.toLowerCase().includes('select');
        
        if (isFoundingCircle) {
          console.log(`✅ Found Founding Circle plan: Plan ${i + 1}`);
        }
        if (isSelectCircle) {
          console.log(`✅ Found Select Circle plan: Plan ${i + 1}`);
        }
        if (isClient) {
          console.log(`✅ Found Client plan: Plan ${i + 1}`);
        }
        if (isCandidate) {
          console.log(`✅ Found Candidate plan: Plan ${i + 1}`);
        }

        // Check for pricing information
        const hasPricing = planText?.includes('$') || planText?.includes('free');
        if (hasPricing) {
          console.log(`Plan ${i + 1} has pricing information`);
        }

        // Check for feature lists
        const featureList = plan.locator('ul, .features, .plan-features');
        const featureCount = await featureList.count();
        if (featureCount > 0) {
          console.log(`Plan ${i + 1} has ${featureCount} feature lists`);
        }
      }
    } else {
      console.log('ℹ️ No subscription plans found');
    }

    await helpers.takeScreenshot('subscription-plan-comparison');
  });

  test('Payment security and SSL verification', async () => {
    console.log('🔒 Testing payment security features...');
    
    // Check if the site uses HTTPS
    const currentUrl = page.url();
    if (currentUrl.startsWith('https://')) {
      console.log('✅ Site uses HTTPS');
    } else {
      console.warn('⚠️ Site does not use HTTPS - security concern for payments');
    }

    // Try to access payment page
    await page.goto('/dashboard');
    await helpers.waitForFullLoad();

    const subscribeButton = page.locator('button:has-text("Subscribe"), button:has-text("Upgrade")').first();
    
    if (await subscribeButton.count() > 0) {
      await subscribeButton.click();
      await page.waitForTimeout(3000);

      // Check if payment page is secure
      const paymentUrl = page.url();
      if (paymentUrl.startsWith('https://')) {
        console.log('✅ Payment page uses HTTPS');
      } else {
        console.warn('⚠️ Payment page does not use HTTPS');
      }

      // Look for security indicators
      const securityElements = page.locator('text=/secure/i, text=/ssl/i, text=/encrypted/i, .security, .secure');
      const securityCount = await securityElements.count();
      if (securityCount > 0) {
        console.log(`✅ Found ${securityCount} security indicators`);
      }

      // Check for payment processor branding (Stripe, PayPal, etc.)
      const stripeElements = page.locator('text=/stripe/i, .stripe, [data-stripe]');
      const paypalElements = page.locator('text=/paypal/i, .paypal');
      
      const stripeCount = await stripeElements.count();
      const paypalCount = await paypalElements.count();
      
      if (stripeCount > 0) {
        console.log(`✅ Stripe payment processing detected (${stripeCount} elements)`);
      }
      if (paypalCount > 0) {
        console.log(`✅ PayPal payment option detected (${paypalCount} elements)`);
      }

      // Check for trust badges or security seals
      const trustBadges = page.locator('img[alt*="secure"], img[alt*="ssl"], img[alt*="verified"], .trust-badge');
      const badgeCount = await trustBadges.count();
      if (badgeCount > 0) {
        console.log(`✅ Found ${badgeCount} trust badges/security seals`);
      }
    }

    await helpers.takeScreenshot('payment-security-check');
  });

  test('Mobile payment experience', async () => {
    console.log('📱 Testing mobile payment experience...');
    
    await page.setViewportSize(testData.viewports.mobile);
    await page.goto('/dashboard');
    await helpers.waitForFullLoad();

    // Check mobile responsiveness
    const mobileIssues = await helpers.checkMobileResponsiveness();
    if (mobileIssues.length > 0) {
      console.warn('⚠️ Mobile responsiveness issues:', mobileIssues);
    }

    // Check if payment/subscription options are accessible on mobile
    const subscribeButton = page.locator('button:has-text("Subscribe"), button:has-text("Upgrade")').first();
    if (await subscribeButton.count() > 0 && await subscribeButton.isVisible()) {
      console.log('✅ Subscription button visible on mobile');
      
      await subscribeButton.click();
      await page.waitForTimeout(3000);

      // Check if payment form is mobile-friendly
      const form = page.locator('form').first();
      if (await form.count() > 0) {
        const formBounds = await form.boundingBox();
        if (formBounds && formBounds.width <= testData.viewports.mobile.width) {
          console.log('✅ Payment form fits mobile viewport');
        } else {
          console.warn('⚠️ Payment form may not fit mobile viewport properly');
        }

        // Test mobile input interactions
        const cardField = form.locator('input[name*="card"], [data-stripe="number"]').first();
        if (await cardField.count() > 0) {
          await cardField.click();
          console.log('✅ Mobile payment field interaction works');
        }
      }
    } else {
      console.log('ℹ️ Subscription button not visible on mobile');
    }

    await helpers.takeScreenshot('payment-mobile');
    
    // Reset viewport
    await page.setViewportSize(testData.viewports.desktop);
  });

  test('Payment error handling and edge cases', async () => {
    console.log('🚨 Testing payment error handling...');
    
    await page.goto('/dashboard');
    await helpers.waitForFullLoad();

    const subscribeButton = page.locator('button:has-text("Subscribe"), button:has-text("Upgrade")').first();
    
    if (await subscribeButton.count() === 0) {
      console.log('ℹ️ No subscription button found for error testing');
      return;
    }

    await subscribeButton.click();
    await page.waitForTimeout(3000);

    const form = page.locator('form').first();
    if (await form.count() === 0) {
      console.log('ℹ️ No payment form found for error testing');
      return;
    }

    // Test with invalid payment data (but don't submit)
    const invalidCard = testData.payment.invalidCard;

    // Test invalid card number format
    const cardField = form.locator('input[name*="card"], [data-stripe="number"]').first();
    if (await cardField.count() > 0) {
      await cardField.fill(invalidCard.cardNumber);
      await cardField.blur();
      
      // Check for real-time validation error
      await page.waitForTimeout(1000);
      const cardError = page.locator('.error, [role="alert"]').first();
      if (await cardError.count() > 0 && await cardError.isVisible()) {
        console.log('✅ Invalid card number validation working');
      }
      
      await cardField.clear();
    }

    // Test invalid expiry
    const expiryField = form.locator('input[name*="expiry"], [data-stripe="exp"]').first();
    if (await expiryField.count() > 0) {
      await expiryField.fill(`${invalidCard.expiryMonth}/${invalidCard.expiryYear}`);
      await expiryField.blur();
      
      await page.waitForTimeout(1000);
      const expiryError = page.locator('.error, [role="alert"]').first();
      if (await expiryError.count() > 0 && await expiryError.isVisible()) {
        console.log('✅ Invalid expiry validation working');
      }
      
      await expiryField.clear();
    }

    // Test invalid CVC
    const cvcField = form.locator('input[name*="cvc"], [data-stripe="cvc"]').first();
    if (await cvcField.count() > 0) {
      await cvcField.fill(invalidCard.cvc);
      await cvcField.blur();
      
      await page.waitForTimeout(1000);
      const cvcError = page.locator('.error, [role="alert"]').first();
      if (await cvcError.count() > 0 && await cvcError.isVisible()) {
        console.log('✅ Invalid CVC validation working');
      }
      
      await cvcField.clear();
    }

    await helpers.takeScreenshot('payment-error-handling');
    
    console.log('⚠️ Payment error handling test completed - no actual payment attempted');
  });
});