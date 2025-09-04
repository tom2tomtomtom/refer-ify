import { test, expect, Page } from '@playwright/test';
import { TestHelpers } from './utils/test-helpers';
import { testData } from './fixtures/test-data';

test.describe('Mobile Responsiveness Testing', () => {
  let page: Page;
  let helpers: TestHelpers;

  test.beforeEach(async ({ page: testPage }) => {
    page = testPage;
    helpers = new TestHelpers(page);
  });

  test('Cross-device viewport testing', async () => {
    console.log('📱 Testing across different device viewports...');
    
    const viewports = [
      { name: 'iPhone SE', width: 375, height: 667 },
      { name: 'iPhone 12', width: 390, height: 844 },
      { name: 'iPhone 12 Pro Max', width: 428, height: 926 },
      { name: 'Samsung Galaxy S20', width: 360, height: 800 },
      { name: 'iPad Mini', width: 768, height: 1024 },
      { name: 'iPad Pro', width: 1024, height: 1366 },
      { name: 'Small Desktop', width: 1280, height: 720 },
      { name: 'Large Desktop', width: 1920, height: 1080 }
    ];

    const pagesToTest = ['/', '/dashboard', '/login', '/register'];

    for (const viewport of viewports) {
      console.log(`\n--- Testing ${viewport.name} (${viewport.width}x${viewport.height}) ---`);
      
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      
      for (const pageUrl of pagesToTest) {
        try {
          await page.goto(pageUrl);
          await helpers.waitForFullLoad();
          
          console.log(`Testing ${pageUrl} on ${viewport.name}`);

          // Check for horizontal scroll
          const hasHorizontalScroll = await page.evaluate(() => {
            return document.body.scrollWidth > window.innerWidth;
          });
          
          if (hasHorizontalScroll) {
            console.log(`⚠️ Horizontal scroll detected on ${pageUrl} at ${viewport.name}`);
          } else {
            console.log(`✅ No horizontal scroll on ${pageUrl} at ${viewport.name}`);
          }

          // Check for overlapping elements
          const overlappingElements = await page.evaluate(() => {
            const elements = Array.from(document.querySelectorAll('*'));
            const issues: string[] = [];
            
            elements.forEach((el: any) => {
              const rect = el.getBoundingClientRect();
              if (rect.width > 0 && rect.height > 0) {
                if (rect.left < 0) {
                  issues.push(`Element extends left: ${el.tagName}`);
                }
                if (rect.right > window.innerWidth) {
                  issues.push(`Element extends right: ${el.tagName}`);
                }
              }
            });
            
            return issues.slice(0, 5); // Limit to first 5 issues
          });

          if (overlappingElements.length > 0) {
            console.log(`⚠️ Overlapping elements on ${pageUrl}:`, overlappingElements);
          }

          // Check text readability (font sizes)
          const textReadability = await page.evaluate(() => {
            const textElements = document.querySelectorAll('p, span, div, a, button, input, label');
            let smallTextCount = 0;
            let totalTextElements = 0;
            
            textElements.forEach(el => {
              const styles = window.getComputedStyle(el);
              const fontSize = parseInt(styles.fontSize, 10);
              
              if (fontSize > 0) {
                totalTextElements++;
                if (fontSize < 14) {
                  smallTextCount++;
                }
              }
            });
            
            return { smallTextCount, totalTextElements };
          });

          if (textReadability.smallTextCount > 0) {
            console.log(`⚠️ Found ${textReadability.smallTextCount}/${textReadability.totalTextElements} elements with small text (<14px)`);
          }

          // Check touch target sizes
          const touchTargets = await page.evaluate(() => {
            const interactiveElements = document.querySelectorAll('button, a, input, select, textarea');
            let smallTargets = 0;
            let totalTargets = 0;
            
            interactiveElements.forEach(el => {
              const rect = el.getBoundingClientRect();
              if (rect.width > 0 && rect.height > 0) {
                totalTargets++;
                // Touch targets should be at least 44px (iOS) or 48dp (Android) 
                if (rect.width < 44 || rect.height < 44) {
                  smallTargets++;
                }
              }
            });
            
            return { smallTargets, totalTargets };
          });

          if (touchTargets.smallTargets > 0) {
            console.log(`⚠️ Found ${touchTargets.smallTargets}/${touchTargets.totalTargets} touch targets smaller than 44px`);
          } else {
            console.log(`✅ All touch targets meet minimum size requirements`);
          }

          await helpers.takeScreenshot(`${viewport.name.replace(/\s+/g, '-')}-${pageUrl.replace('/', 'home')}`);

        } catch (error) {
          console.warn(`Error testing ${pageUrl} on ${viewport.name}:`, error);
        }
      }
    }
  });

  test('Mobile navigation menu functionality', async () => {
    console.log('🍔 Testing mobile navigation menu...');
    
    await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE size
    await page.goto('/');
    await helpers.waitForFullLoad();

    // Look for hamburger menu or mobile navigation toggle
    const mobileNavTriggers = [
      'button[aria-label*="menu"]',
      'button[aria-label*="Menu"]',
      '.hamburger',
      '.menu-toggle',
      '.mobile-menu-trigger',
      '[data-testid="mobile-menu"]',
      '[data-testid="hamburger"]',
      'button:has-text("Menu")',
      'button:has([data-icon="menu"])'
    ];

    let mobileNavFound = false;

    for (const selector of mobileNavTriggers) {
      const trigger = page.locator(selector).first();
      if (await trigger.count() > 0 && await trigger.isVisible()) {
        mobileNavFound = true;
        console.log(`✅ Mobile navigation trigger found: ${selector}`);
        
        // Test opening the menu
        await trigger.click();
        await page.waitForTimeout(1000);
        
        // Look for opened navigation menu
        const mobileMenus = [
          '.mobile-menu',
          '.nav-menu',
          '[data-testid="mobile-menu-content"]',
          '.menu-dropdown',
          'nav[aria-expanded="true"]',
          '.navigation.open'
        ];

        let menuOpened = false;
        for (const menuSelector of mobileMenus) {
          const menu = page.locator(menuSelector).first();
          if (await menu.count() > 0 && await menu.isVisible()) {
            menuOpened = true;
            console.log(`✅ Mobile menu opened successfully: ${menuSelector}`);
            
            // Count menu items
            const menuItems = menu.locator('a, button').filter({ hasNotText: /^$/ });
            const itemCount = await menuItems.count();
            console.log(`Found ${itemCount} menu items`);
            
            // Test menu item interaction
            if (itemCount > 0) {
              const firstItem = menuItems.first();
              const itemText = await firstItem.textContent();
              const itemHref = await firstItem.getAttribute('href');
              
              console.log(`First menu item: "${itemText}" (href: ${itemHref})`);
              
              // Check if menu item is properly sized for touch
              const itemBounds = await firstItem.boundingBox();
              if (itemBounds && itemBounds.height >= 44) {
                console.log('✅ Menu items have adequate touch target size');
              } else {
                console.log('⚠️ Menu items may be too small for touch interaction');
              }
            }
            
            break;
          }
        }

        if (!menuOpened) {
          console.log('⚠️ Mobile menu trigger found but menu content not detected');
        }

        // Try to close the menu
        const closeButtons = [
          'button[aria-label*="close"]',
          'button[aria-label*="Close"]',
          '.close-menu',
          '.menu-close',
          trigger // Sometimes the same button toggles
        ];

        for (const closeSelector of closeButtons) {
          const closeButton = page.locator(closeSelector).first();
          if (await closeButton.count() > 0 && await closeButton.isVisible()) {
            await closeButton.click();
            await page.waitForTimeout(500);
            console.log('✅ Mobile menu closed');
            break;
          }
        }

        await helpers.takeScreenshot('mobile-navigation-menu');
        break;
      }
    }

    if (!mobileNavFound) {
      console.log('ℹ️ No dedicated mobile navigation trigger found');
      
      // Check if regular navigation is still usable on mobile
      const regularNav = page.locator('nav').first();
      if (await regularNav.count() > 0) {
        const navVisible = await regularNav.isVisible();
        const navBounds = await regularNav.boundingBox();
        
        if (navVisible && navBounds) {
          if (navBounds.width <= 375) {
            console.log('✅ Regular navigation fits mobile viewport');
          } else {
            console.log('⚠️ Regular navigation may overflow on mobile');
          }
        }
      }
    }
  });

  test('Form usability on mobile devices', async () => {
    console.log('📝 Testing form usability on mobile...');
    
    const mobileViewports = [
      { name: 'Portrait Phone', width: 375, height: 667 },
      { name: 'Landscape Phone', width: 667, height: 375 }
    ];

    const formsToTest = ['/login', '/register'];

    for (const viewport of mobileViewports) {
      console.log(`\n--- Testing forms on ${viewport.name} ---`);
      await page.setViewportSize({ width: viewport.width, height: viewport.height });

      for (const formUrl of formsToTest) {
        try {
          await page.goto(formUrl);
          await helpers.waitForFullLoad();

          console.log(`Testing ${formUrl} form on ${viewport.name}`);

          const form = page.locator('form').first();
          if (await form.count() === 0) {
            console.log(`ℹ️ No form found on ${formUrl}`);
            continue;
          }

          // Check form fits viewport
          const formBounds = await form.boundingBox();
          if (formBounds) {
            if (formBounds.width <= viewport.width) {
              console.log('✅ Form fits within viewport width');
            } else {
              console.log(`⚠️ Form width (${formBounds.width}px) exceeds viewport (${viewport.width}px)`);
            }
          }

          // Test input field usability
          const inputs = form.locator('input, textarea');
          const inputCount = await inputs.count();
          
          for (let i = 0; i < inputCount; i++) {
            const input = inputs.nth(i);
            const inputType = await input.getAttribute('type');
            const inputName = await input.getAttribute('name') || `input-${i}`;
            
            // Check input size
            const inputBounds = await input.boundingBox();
            if (inputBounds) {
              if (inputBounds.height >= 44) {
                console.log(`✅ ${inputName} has adequate height (${inputBounds.height}px)`);
              } else {
                console.log(`⚠️ ${inputName} height (${inputBounds.height}px) may be too small for touch`);
              }
            }

            // Test input focus and keyboard
            await input.click();
            await page.waitForTimeout(500);
            
            // Check if input is focused
            const isFocused = await input.evaluate(el => el === document.activeElement);
            if (isFocused) {
              console.log(`✅ ${inputName} receives focus on mobile`);
            }

            // Check keyboard attributes for mobile
            const inputMode = await input.getAttribute('inputmode');
            const autoComplete = await input.getAttribute('autocomplete');
            
            if (inputType === 'email' && (inputMode === 'email' || inputType === 'email')) {
              console.log(`✅ ${inputName} will show email keyboard`);
            }
            if (inputType === 'tel' && (inputMode === 'tel' || inputType === 'tel')) {
              console.log(`✅ ${inputName} will show numeric keyboard`);
            }
            if (autoComplete) {
              console.log(`✅ ${inputName} has autocomplete: ${autoComplete}`);
            }

            // Type some text to test
            await input.fill('mobile test');
            await page.waitForTimeout(200);
          }

          // Test form submission button
          const submitButton = form.locator('button[type="submit"], input[type="submit"]').first();
          if (await submitButton.count() > 0) {
            const buttonBounds = await submitButton.boundingBox();
            if (buttonBounds) {
              if (buttonBounds.height >= 44) {
                console.log('✅ Submit button has adequate touch target size');
              } else {
                console.log('⚠️ Submit button may be too small for touch interaction');
              }
            }
          }

          await helpers.takeScreenshot(`form-mobile-${formUrl.replace('/', '')}-${viewport.name.replace(/\s+/g, '-')}`);

        } catch (error) {
          console.warn(`Error testing form ${formUrl} on ${viewport.name}:`, error);
        }
      }
    }
  });

  test('Mobile image and media responsiveness', async () => {
    console.log('🖼️ Testing mobile image and media responsiveness...');
    
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    await helpers.waitForFullLoad();

    // Test images
    const images = page.locator('img');
    const imageCount = await images.count();
    console.log(`Found ${imageCount} images to test`);

    for (let i = 0; i < Math.min(imageCount, 10); i++) { // Test first 10 images
      const image = images.nth(i);
      const imageBounds = await image.boundingBox();
      const imageSrc = await image.getAttribute('src');
      const imageAlt = await image.getAttribute('alt');
      
      if (imageBounds) {
        if (imageBounds.width <= 375) {
          console.log(`✅ Image ${i + 1} (${imageSrc?.substring(0, 30)}...) fits mobile viewport`);
        } else {
          console.log(`⚠️ Image ${i + 1} (${imageSrc?.substring(0, 30)}...) width (${imageBounds.width}px) exceeds viewport`);
        }

        // Check if image has responsive attributes
        const responsiveAttributes = {
          srcset: await image.getAttribute('srcset'),
          sizes: await image.getAttribute('sizes'),
          loading: await image.getAttribute('loading'),
          alt: imageAlt
        };

        if (responsiveAttributes.srcset) {
          console.log(`✅ Image ${i + 1} has responsive srcset`);
        }
        if (responsiveAttributes.sizes) {
          console.log(`✅ Image ${i + 1} has sizes attribute`);
        }
        if (responsiveAttributes.loading === 'lazy') {
          console.log(`✅ Image ${i + 1} has lazy loading`);
        }
        if (!responsiveAttributes.alt) {
          console.log(`⚠️ Image ${i + 1} missing alt text`);
        }
      }
    }

    // Test videos (if any)
    const videos = page.locator('video');
    const videoCount = await videos.count();
    
    if (videoCount > 0) {
      console.log(`Found ${videoCount} videos to test`);
      
      for (let i = 0; i < videoCount; i++) {
        const video = videos.nth(i);
        const videoBounds = await video.boundingBox();
        const controls = await video.getAttribute('controls');
        const autoplay = await video.getAttribute('autoplay');
        
        if (videoBounds) {
          if (videoBounds.width <= 375) {
            console.log(`✅ Video ${i + 1} fits mobile viewport`);
          } else {
            console.log(`⚠️ Video ${i + 1} may not fit mobile viewport properly`);
          }
        }

        if (controls) {
          console.log(`✅ Video ${i + 1} has controls`);
        }
        if (!autoplay) {
          console.log(`✅ Video ${i + 1} doesn't autoplay (mobile-friendly)`);
        } else {
          console.log(`⚠️ Video ${i + 1} autoplays (may consume mobile data)`);
        }
      }
    }

    await helpers.takeScreenshot('mobile-media-responsiveness');
  });

  test('Mobile typography and readability', async () => {
    console.log('📖 Testing mobile typography and readability...');
    
    const mobileViewports = [
      { width: 320, height: 568 }, // iPhone 5
      { width: 375, height: 667 }, // iPhone 6/7/8
      { width: 414, height: 896 }  // iPhone XR
    ];

    for (const viewport of mobileViewports) {
      console.log(`\nTesting typography at ${viewport.width}x${viewport.height}`);
      
      await page.setViewportSize(viewport);
      await page.goto('/');
      await helpers.waitForFullLoad();

      // Test heading hierarchy and sizes
      const headings = page.locator('h1, h2, h3, h4, h5, h6');
      const headingCount = await headings.count();
      
      console.log(`Found ${headingCount} headings`);

      const headingSizes: { [key: string]: number[] } = {};

      for (let i = 0; i < headingCount; i++) {
        const heading = headings.nth(i);
        const tagName = await heading.tagName();
        const fontSize = await heading.evaluate(el => {
          return parseInt(window.getComputedStyle(el).fontSize, 10);
        });
        
        if (!headingSizes[tagName]) {
          headingSizes[tagName] = [];
        }
        headingSizes[tagName].push(fontSize);
      }

      // Analyze heading sizes
      Object.entries(headingSizes).forEach(([tag, sizes]) => {
        const avgSize = sizes.reduce((a, b) => a + b, 0) / sizes.length;
        console.log(`${tag}: Average ${avgSize.toFixed(1)}px (${sizes.length} instances)`);
        
        if (avgSize < 16 && tag === 'H1') {
          console.log(`⚠️ ${tag} may be too small for mobile (${avgSize.toFixed(1)}px)`);
        }
      });

      // Test body text readability
      const bodyText = page.locator('p, div, span, li').filter({ hasText: /.{20,}/ });
      const bodyTextCount = await bodyText.count();
      
      if (bodyTextCount > 0) {
        const sampleText = bodyText.first();
        const textStyles = await sampleText.evaluate(el => {
          const styles = window.getComputedStyle(el);
          return {
            fontSize: parseInt(styles.fontSize, 10),
            lineHeight: styles.lineHeight,
            color: styles.color,
            backgroundColor: styles.backgroundColor
          };
        });

        console.log(`Body text styles:`, textStyles);

        if (textStyles.fontSize < 14) {
          console.log(`⚠️ Body text (${textStyles.fontSize}px) may be too small for mobile`);
        } else {
          console.log(`✅ Body text size (${textStyles.fontSize}px) is mobile-friendly`);
        }
      }

      // Test line length
      const textBlocks = page.locator('p').filter({ hasText: /.{50,}/ });
      const textBlockCount = await textBlocks.count();
      
      if (textBlockCount > 0) {
        const firstBlock = textBlocks.first();
        const blockWidth = await firstBlock.evaluate(el => el.getBoundingClientRect().width);
        const charactersPerLine = blockWidth / 7; // Rough estimate (7px per character)
        
        console.log(`Estimated characters per line: ${charactersPerLine.toFixed(0)}`);
        
        if (charactersPerLine > 70) {
          console.log('⚠️ Lines may be too long for comfortable mobile reading');
        } else if (charactersPerLine < 30) {
          console.log('⚠️ Lines may be too short, causing excessive line breaks');
        } else {
          console.log('✅ Line length appears optimal for mobile reading');
        }
      }

      await helpers.takeScreenshot(`typography-${viewport.width}x${viewport.height}`);
    }
  });

  test('Mobile performance optimization', async () => {
    console.log('⚡ Testing mobile performance optimization...');
    
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Test with simulated slow network
    await page.context().setNetwork('Slow 3G');
    
    const startTime = Date.now();
    await page.goto('/');
    await helpers.waitForFullLoad();
    const loadTime = Date.now() - startTime;
    
    console.log(`Page load time on slow 3G: ${loadTime}ms`);
    
    if (loadTime > 10000) {
      console.log('⚠️ Page load time on slow network is very slow (>10s)');
    } else if (loadTime > 5000) {
      console.log('⚠️ Page load time on slow network is slow (>5s)');
    } else {
      console.log('✅ Page loads reasonably fast on slow network');
    }

    // Check for performance optimizations
    const performanceOptimizations = await page.evaluate(() => {
      const optimizations = {
        lazyImages: document.querySelectorAll('img[loading="lazy"]').length,
        totalImages: document.querySelectorAll('img').length,
        deferredScripts: document.querySelectorAll('script[defer]').length,
        asyncScripts: document.querySelectorAll('script[async]').length,
        totalScripts: document.querySelectorAll('script').length,
        preloadLinks: document.querySelectorAll('link[rel="preload"]').length,
        prefetchLinks: document.querySelectorAll('link[rel="prefetch"]').length
      };
      
      return optimizations;
    });

    console.log('Performance optimizations detected:', performanceOptimizations);

    if (performanceOptimizations.lazyImages > 0) {
      console.log(`✅ ${performanceOptimizations.lazyImages}/${performanceOptimizations.totalImages} images use lazy loading`);
    }
    
    if (performanceOptimizations.deferredScripts + performanceOptimizations.asyncScripts > 0) {
      const optimizedScripts = performanceOptimizations.deferredScripts + performanceOptimizations.asyncScripts;
      console.log(`✅ ${optimizedScripts}/${performanceOptimizations.totalScripts} scripts are deferred or async`);
    }

    // Reset network conditions
    await page.context().setNetwork(null);

    // Test Core Web Vitals (basic check)
    const webVitals = await page.evaluate(() => {
      return new Promise((resolve) => {
        // This is a simplified check - real CWV measurement requires more sophisticated timing
        const observer = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const vitals: any = {};
          
          entries.forEach((entry: any) => {
            if (entry.entryType === 'paint' && entry.name === 'first-contentful-paint') {
              vitals.fcp = entry.startTime;
            }
            if (entry.entryType === 'largest-contentful-paint') {
              vitals.lcp = entry.startTime;
            }
          });
          
          resolve(vitals);
        });
        
        observer.observe({ entryTypes: ['paint', 'largest-contentful-paint'] });
        
        // Fallback timeout
        setTimeout(() => resolve({}), 3000);
      });
    });

    console.log('Core Web Vitals (approximation):', webVitals);

    await helpers.takeScreenshot('mobile-performance-test');
  });

  test('Mobile accessibility features', async () => {
    console.log('♿ Testing mobile accessibility features...');
    
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    await helpers.waitForFullLoad();

    // Test zoom capability
    console.log('Testing zoom capability...');
    
    const viewportMeta = await page.locator('meta[name="viewport"]').getAttribute('content');
    console.log(`Viewport meta: ${viewportMeta}`);
    
    if (viewportMeta?.includes('user-scalable=no')) {
      console.log('⚠️ Zoom is disabled - may cause accessibility issues');
    } else {
      console.log('✅ Zoom appears to be enabled');
    }

    // Test with simulated zoom
    await page.setViewportSize({ width: 375, height: 667 });
    await page.evaluate(() => {
      document.body.style.zoom = '200%';
    });
    
    await page.waitForTimeout(1000);
    
    // Check if content is still accessible when zoomed
    const mainContent = page.locator('main, [role="main"], h1').first();
    const contentVisible = await mainContent.isVisible();
    
    if (contentVisible) {
      console.log('✅ Content remains accessible when zoomed to 200%');
    } else {
      console.log('⚠️ Content may not be accessible when zoomed');
    }

    // Reset zoom
    await page.evaluate(() => {
      document.body.style.zoom = '100%';
    });

    // Test touch target sizes
    console.log('Testing touch target accessibility...');
    
    const interactiveElements = page.locator('button, a, input, select');
    const interactiveCount = await interactiveElements.count();
    
    let adequateTargets = 0;
    
    for (let i = 0; i < Math.min(interactiveCount, 20); i++) {
      const element = interactiveElements.nth(i);
      const bounds = await element.boundingBox();
      
      if (bounds && bounds.width >= 44 && bounds.height >= 44) {
        adequateTargets++;
      }
    }

    const percentage = (adequateTargets / Math.min(interactiveCount, 20)) * 100;
    console.log(`${adequateTargets}/${Math.min(interactiveCount, 20)} interactive elements (${percentage.toFixed(0)}%) meet 44px minimum touch target size`);

    if (percentage >= 80) {
      console.log('✅ Good touch target accessibility');
    } else {
      console.log('⚠️ Many touch targets may be too small for accessibility');
    }

    // Test color contrast (basic check)
    console.log('Testing color contrast...');
    
    const textElements = page.locator('p, h1, h2, h3, h4, h5, h6, button, a').first();
    if (await textElements.count() > 0) {
      const contrastInfo = await textElements.evaluate(el => {
        const styles = window.getComputedStyle(el);
        return {
          color: styles.color,
          backgroundColor: styles.backgroundColor,
          fontSize: styles.fontSize
        };
      });
      
      console.log('Sample text contrast info:', contrastInfo);
      // Note: Actual contrast ratio calculation would require color parsing and WCAG formula
    }

    await helpers.takeScreenshot('mobile-accessibility-test');
  });

  test('Mobile orientation change handling', async () => {
    console.log('🔄 Testing mobile orientation change handling...');
    
    // Test portrait to landscape transition
    console.log('Testing portrait orientation...');
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    await helpers.waitForFullLoad();
    
    await helpers.takeScreenshot('portrait-orientation');
    
    console.log('Testing landscape orientation...');
    await page.setViewportSize({ width: 667, height: 375 });
    await page.waitForTimeout(1000); // Allow for reflow
    
    // Check if layout adapts to landscape
    const landscapeIssues = await helpers.checkMobileResponsiveness();
    if (landscapeIssues.length > 0) {
      console.log('⚠️ Issues in landscape orientation:', landscapeIssues);
    } else {
      console.log('✅ Layout adapts well to landscape orientation');
    }
    
    // Test specific landscape considerations
    const headerHeight = await page.evaluate(() => {
      const header = document.querySelector('header, nav, [role="banner"]');
      return header ? header.getBoundingClientRect().height : 0;
    });
    
    if (headerHeight > 100) {
      console.log(`⚠️ Header height (${headerHeight}px) may be too large for landscape view`);
    } else {
      console.log(`✅ Header height (${headerHeight}px) is appropriate for landscape`);
    }
    
    await helpers.takeScreenshot('landscape-orientation');
    
    // Test back to portrait
    console.log('Testing back to portrait...');
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(1000);
    
    const portraitIssues = await helpers.checkMobileResponsiveness();
    if (portraitIssues.length > 0) {
      console.log('⚠️ Issues after returning to portrait:', portraitIssues);
    } else {
      console.log('✅ Layout properly restored in portrait mode');
    }
    
    await helpers.takeScreenshot('portrait-restored');
  });
});