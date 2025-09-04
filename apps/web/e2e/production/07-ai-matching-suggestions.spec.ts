import { test, expect, Page } from '@playwright/test';
import { TestHelpers } from './utils/test-helpers';
import { testData } from './fixtures/test-data';

test.describe('AI Matching and Suggestions Functionality', () => {
  let page: Page;
  let helpers: TestHelpers;

  test.beforeEach(async ({ page: testPage }) => {
    page = testPage;
    helpers = new TestHelpers(page);
  });

  test('AI matching feature accessibility', async () => {
    console.log('🤖 Testing AI matching feature accessibility...');
    
    // Start from dashboard to look for AI features
    await page.goto('/dashboard');
    await helpers.waitForFullLoad();

    // Look for AI-related features and buttons
    const aiSelectors = [
      'button:has-text("AI")',
      'button:has-text("Smart")',
      'button:has-text("Match")',
      'button:has-text("Suggest")',
      'a:has-text("AI")',
      'a:has-text("Match")',
      'a:has-text("Suggest")',
      'text=/ai.match/i',
      'text=/smart.match/i',
      'text=/intelligent/i',
      '[data-testid*="ai"]',
      '[data-testid*="match"]',
      '[data-testid*="suggest"]',
      '.ai-feature',
      '.smart-match',
      '.suggestions'
    ];

    const foundAIFeatures: string[] = [];

    for (const selector of aiSelectors) {
      const element = page.locator(selector).first();
      if (await element.count() > 0 && await element.isVisible()) {
        const text = await element.textContent();
        foundAIFeatures.push(`${selector}: ${text}`);
        console.log(`✅ AI feature found: ${selector} - ${text}`);
      }
    }

    console.log(`Found ${foundAIFeatures.length} AI-related features`);

    // Check page content for AI mentions
    const pageContent = await page.textContent('body');
    const aiMentions = [
      'artificial intelligence',
      'machine learning',
      'ai-powered',
      'smart matching',
      'intelligent suggestions',
      'algorithmic matching',
      'automated matching'
    ];

    const foundMentions = aiMentions.filter(mention => 
      pageContent?.toLowerCase().includes(mention.toLowerCase())
    );

    if (foundMentions.length > 0) {
      console.log('✅ AI functionality mentioned:', foundMentions);
    } else {
      console.log('ℹ️ No explicit AI functionality mentions found');
    }

    await helpers.takeScreenshot('ai-features-search');
  });

  test('Job matching suggestions for candidates', async () => {
    console.log('🎯 Testing job matching suggestions for candidates...');
    
    await page.goto('/dashboard');
    await helpers.waitForFullLoad();

    // Look for job recommendations or suggestions
    const suggestionSelectors = [
      'section:has-text("Recommend")',
      'section:has-text("Suggest")',
      'section:has-text("Match")',
      'div:has-text("Recommended Jobs")',
      'div:has-text("Suggested Jobs")',
      'div:has-text("Job Matches")',
      '.recommendations',
      '.suggestions',
      '.job-matches',
      '[data-testid*="recommend"]',
      '[data-testid*="suggest"]'
    ];

    let suggestionsFound = false;

    for (const selector of suggestionSelectors) {
      const section = page.locator(selector).first();
      if (await section.count() > 0 && await section.isVisible()) {
        suggestionsFound = true;
        console.log(`✅ Job suggestions section found: ${selector}`);
        
        // Count suggested jobs
        const jobItems = section.locator('.job, .card, .item, li').filter({
          hasNotText: /^$/
        });
        const jobCount = await jobItems.count();
        console.log(`Found ${jobCount} job suggestions`);

        // Check for match percentage or scoring
        const matchScores = section.locator('text=/%/, text=/score/i, text=/match/i, .score, .percentage');
        const scoreCount = await matchScores.count();
        if (scoreCount > 0) {
          console.log(`✅ Found ${scoreCount} match scores/percentages`);
        }

        // Check for "why matched" or explanation
        const explanations = section.locator('text=/why/i, text=/because/i, text=/match.*reason/i, .explanation, .reason');
        const explanationCount = await explanations.count();
        if (explanationCount > 0) {
          console.log(`✅ Found ${explanationCount} match explanations`);
        }

        await helpers.takeScreenshot('job-suggestions-found');
        break;
      }
    }

    if (!suggestionsFound) {
      console.log('ℹ️ No job suggestions section found');
      
      // Check if there's a separate jobs/browse page with AI features
      const jobsLink = page.locator('a[href*="job"], a:has-text("Jobs"), nav a:has-text("Job")').first();
      if (await jobsLink.count() > 0) {
        await jobsLink.click();
        await helpers.waitForFullLoad();
        
        // Look for AI features on jobs page
        const jobsPageContent = await page.textContent('body');
        if (jobsPageContent?.includes('recommend') || jobsPageContent?.includes('suggest') || 
            jobsPageContent?.includes('match')) {
          console.log('✅ AI matching features found on jobs page');
          suggestionsFound = true;
        }
        
        await helpers.takeScreenshot('jobs-page-ai-features');
      }
    }

    if (!suggestionsFound) {
      console.log('❌ No AI job matching/suggestions found');
    }
  });

  test('Candidate matching for job posts', async () => {
    console.log('👥 Testing candidate matching for job posts...');
    
    await page.goto('/dashboard');
    await helpers.waitForFullLoad();

    // Look for job management or posted jobs section
    const jobManagementSelectors = [
      'section:has-text("Job")',
      'div:has-text("My Jobs")',
      'div:has-text("Posted Jobs")',
      '.jobs-list',
      '[data-testid="jobs"]',
      'table:has(th:has-text("Job"))'
    ];

    let jobManagementFound = false;

    for (const selector of jobManagementSelectors) {
      const section = page.locator(selector).first();
      if (await section.count() > 0 && await section.isVisible()) {
        jobManagementFound = true;
        console.log(`✅ Job management section found: ${selector}`);
        
        // Look for candidate suggestions or matching within job management
        const candidateMatches = section.locator('text=/candidate/i, text=/match/i, text=/suggest/i, text=/recommend/i');
        const matchCount = await candidateMatches.count();
        
        if (matchCount > 0) {
          console.log(`✅ Found ${matchCount} candidate matching references`);
          
          // Check for "view matches" or similar buttons
          const viewMatchesButtons = section.locator('button:has-text("Match"), button:has-text("Candidate"), a:has-text("Match"), a:has-text("View")');
          const buttonCount = await viewMatchesButtons.count();
          
          if (buttonCount > 0) {
            console.log(`✅ Found ${buttonCount} candidate matching action buttons`);
            
            // Try clicking the first one
            const firstButton = viewMatchesButtons.first();
            const buttonText = await firstButton.textContent();
            
            try {
              await firstButton.click();
              await page.waitForTimeout(2000);
              await helpers.takeScreenshot(`candidate-matching-${buttonText?.replace(/\s+/g, '-').toLowerCase()}`);
            } catch (error) {
              console.warn('Could not click candidate matching button:', error);
            }
          }
        }
        
        break;
      }
    }

    if (!jobManagementFound) {
      console.log('ℹ️ No job management section found for candidate matching test');
    }

    await helpers.takeScreenshot('candidate-matching-search');
  });

  test('AI-powered search functionality', async () => {
    console.log('🔍 Testing AI-powered search functionality...');
    
    await page.goto('/dashboard');
    await helpers.waitForFullLoad();

    // Look for search functionality
    const searchElements = [
      'input[type="search"]',
      'input[placeholder*="search"]',
      'input[placeholder*="Search"]',
      '[data-testid="search"]',
      '.search-input',
      '.search-bar'
    ];

    let searchFound = false;

    for (const selector of searchElements) {
      const searchInput = page.locator(selector).first();
      if (await searchInput.count() > 0 && await searchInput.isVisible()) {
        searchFound = true;
        console.log(`✅ Search input found: ${selector}`);
        
        // Test AI-enhanced search queries
        const aiSearchQueries = [
          'software engineer with React experience',
          'remote frontend developer',
          'AI machine learning specialist',
          'full-stack developer startup experience'
        ];

        for (const query of aiSearchQueries) {
          await searchInput.fill(query);
          
          // Look for search suggestions or autocomplete
          await page.waitForTimeout(1000);
          
          const suggestions = page.locator('.suggestion, .autocomplete, .dropdown, [role="listbox"]');
          const suggestionCount = await suggestions.count();
          
          if (suggestionCount > 0) {
            console.log(`✅ Search suggestions appeared for "${query}" (${suggestionCount} suggestions)`);
          }
          
          // Submit the search
          await searchInput.press('Enter');
          await page.waitForTimeout(2000);
          
          // Check search results
          const resultsContent = await page.textContent('body');
          if (resultsContent?.includes('result') || resultsContent?.includes('found') || 
              resultsContent?.includes('match')) {
            console.log(`✅ Search results displayed for "${query}"`);
            
            // Look for AI-enhanced result features
            const aiFeatures = page.locator('text=/score/i, text=/match/i, text=/relevance/i, .relevance, .score');
            const aiFeatureCount = await aiFeatures.count();
            if (aiFeatureCount > 0) {
              console.log(`✅ Found ${aiFeatureCount} AI result enhancement features`);
            }
          }
          
          await helpers.takeScreenshot(`search-results-${query.replace(/\s+/g, '-').toLowerCase()}`);
          
          // Clear search for next query
          await searchInput.clear();
        }
        
        break;
      }
    }

    if (!searchFound) {
      console.log('ℹ️ No search functionality found');
    }
  });

  test('Skills-based matching and recommendations', async () => {
    console.log('🛠️ Testing skills-based matching...');
    
    await page.goto('/dashboard');
    await helpers.waitForFullLoad();

    // Look for skills-related sections
    const skillsSelectors = [
      'section:has-text("Skill")',
      'div:has-text("Skills")',
      'input[placeholder*="skill"]',
      'input[name*="skill"]',
      '.skills',
      '[data-testid*="skill"]',
      'text=/skill.*match/i'
    ];

    let skillsFound = false;

    for (const selector of skillsSelectors) {
      const skillsElement = page.locator(selector).first();
      if (await skillsElement.count() > 0 && await skillsElement.isVisible()) {
        skillsFound = true;
        console.log(`✅ Skills section found: ${selector}`);
        
        // If it's an input, try adding skills
        const tagName = await skillsElement.tagName();
        if (tagName === 'INPUT') {
          const testSkills = ['React', 'TypeScript', 'Node.js', 'Python'];
          
          for (const skill of testSkills) {
            await skillsElement.fill(skill);
            await skillsElement.press('Enter');
            await page.waitForTimeout(500);
            
            // Check if skill was added (look for skill tags/chips)
            const skillTags = page.locator('.tag, .chip, .skill-tag, .badge').filter({
              hasText: skill
            });
            const tagCount = await skillTags.count();
            
            if (tagCount > 0) {
              console.log(`✅ Skill "${skill}" added successfully`);
            }
          }
          
          await helpers.takeScreenshot('skills-added');
        }
        
        // Look for skill-based recommendations
        const recommendations = page.locator('text=/based.*skill/i, text=/skill.*match/i, text=/recommend.*skill/i');
        const recCount = await recommendations.count();
        
        if (recCount > 0) {
          console.log(`✅ Found ${recCount} skill-based recommendation features`);
        }
        
        break;
      }
    }

    if (!skillsFound) {
      console.log('ℹ️ No skills-based matching features found');
    }
  });

  test('Personalized dashboard content', async () => {
    console.log('👤 Testing personalized dashboard content...');
    
    await page.goto('/dashboard');
    await helpers.waitForFullLoad();

    // Look for personalization indicators
    const personalizationIndicators = [
      'text=/for you/i',
      'text=/recommended/i',
      'text=/personalized/i',
      'text=/tailored/i',
      'text=/based on/i',
      '.personalized',
      '.recommended',
      '.for-you'
    ];

    const foundPersonalization: string[] = [];

    for (const selector of personalizationIndicators) {
      const elements = page.locator(selector);
      const count = await elements.count();
      
      if (count > 0) {
        const firstText = await elements.first().textContent();
        foundPersonalization.push(`${selector}: ${firstText}`);
        console.log(`✅ Personalization found: ${selector} - ${firstText}`);
      }
    }

    // Check for user-specific content
    const userSpecificContent = [
      'Welcome back',
      'Hi,',
      'Hello,',
      'Your dashboard',
      'Your activity',
      'Your matches'
    ];

    const pageContent = await page.textContent('body');
    
    const foundUserContent = userSpecificContent.filter(content =>
      pageContent?.includes(content)
    );

    if (foundUserContent.length > 0) {
      console.log('✅ User-specific content found:', foundUserContent);
    }

    // Look for dynamic/changing content sections
    const dynamicSections = [
      '.recent-activity',
      '.latest-matches',
      '.new-opportunities',
      '.trending',
      '[data-testid*="dynamic"]'
    ];

    let dynamicContentFound = false;

    for (const selector of dynamicSections) {
      const section = page.locator(selector).first();
      if (await section.count() > 0 && await section.isVisible()) {
        dynamicContentFound = true;
        console.log(`✅ Dynamic content section found: ${selector}`);
        
        // Check if content appears to be date-based or activity-based
        const sectionText = await section.textContent();
        const hasTimestamps = sectionText?.includes('ago') || sectionText?.includes('today') || 
                             sectionText?.includes('yesterday') || /\d+\s*(min|hour|day)/.test(sectionText || '');
        
        if (hasTimestamps) {
          console.log('✅ Dynamic content includes timestamps/recency indicators');
        }
      }
    }

    if (!dynamicContentFound) {
      console.log('ℹ️ No obvious dynamic/personalized content sections found');
    }

    console.log(`Found ${foundPersonalization.length} personalization indicators`);
    await helpers.takeScreenshot('personalized-dashboard');
  });

  test('AI matching algorithm transparency', async () => {
    console.log('🔍 Testing AI matching algorithm transparency...');
    
    await page.goto('/dashboard');
    await helpers.waitForFullLoad();

    // Look for explanations of how matching works
    const transparencyIndicators = [
      'text=/how.*match/i',
      'text=/why.*recommend/i',
      'text=/algorithm/i',
      'text=/score.*based/i',
      'button:has-text("Why")',
      'button:has-text("How")',
      'a:has-text("Learn more")',
      '.explanation',
      '.how-it-works',
      '[data-testid*="explain"]'
    ];

    const foundTransparency: string[] = [];

    for (const selector of transparencyIndicators) {
      const element = page.locator(selector).first();
      if (await element.count() > 0 && await element.isVisible()) {
        const text = await element.textContent();
        foundTransparency.push(`${selector}: ${text}`);
        console.log(`✅ Transparency feature found: ${selector} - ${text}`);
        
        // If it's a clickable element, try to interact with it
        const tagName = await element.tagName();
        if (tagName === 'BUTTON' || tagName === 'A') {
          try {
            await element.click();
            await page.waitForTimeout(2000);
            
            // Check if explanation content appeared
            const explanationContent = page.locator('.modal, .popup, .explanation, .tooltip');
            const explanationCount = await explanationContent.count();
            
            if (explanationCount > 0) {
              console.log('✅ Explanation content displayed after clicking');
              await helpers.takeScreenshot('ai-explanation-modal');
            }
            
            // Close modal/popup if it appeared
            const closeButton = page.locator('button:has-text("Close"), button[aria-label="Close"], .close');
            if (await closeButton.count() > 0) {
              await closeButton.first().click();
            }
            
          } catch (error) {
            console.warn('Could not interact with transparency element:', error);
          }
        }
      }
    }

    // Look for match confidence scores or percentages
    const confidenceScores = page.locator('text=/%/, text=/score/i, text=/confidence/i, .confidence, .score, .percentage');
    const scoreCount = await confidenceScores.count();
    
    if (scoreCount > 0) {
      console.log(`✅ Found ${scoreCount} confidence scores/percentages`);
      
      // Try to get some sample scores
      for (let i = 0; i < Math.min(scoreCount, 3); i++) {
        const score = confidenceScores.nth(i);
        const scoreText = await score.textContent();
        console.log(`Sample confidence score: ${scoreText}`);
      }
    }

    console.log(`Found ${foundTransparency.length} transparency/explanation features`);
    await helpers.takeScreenshot('ai-transparency-check');
  });

  test('Performance of AI-powered features', async () => {
    console.log('⚡ Testing AI feature performance...');
    
    await page.goto('/dashboard');
    
    // Measure initial dashboard load performance
    const initialPerformance = await helpers.checkPageLoadPerformance();
    if (!initialPerformance.isGood) {
      console.warn('⚠️ Dashboard performance issues:', initialPerformance.issues);
    }

    await helpers.waitForFullLoad();

    // Look for AI-powered search to test response time
    const searchInput = page.locator('input[type="search"], input[placeholder*="search"]').first();
    
    if (await searchInput.count() > 0) {
      console.log('Testing AI search response time...');
      
      const startTime = Date.now();
      await searchInput.fill('software engineer React');
      
      // Wait for search suggestions or results
      try {
        await page.waitForSelector('.suggestion, .result, .dropdown', { timeout: 5000 });
        const responseTime = Date.now() - startTime;
        console.log(`AI search response time: ${responseTime}ms`);
        
        if (responseTime > 3000) {
          console.warn(`⚠️ AI search response time (${responseTime}ms) is slow`);
        } else {
          console.log('✅ AI search responds quickly');
        }
      } catch (error) {
        console.log('ℹ️ No search suggestions appeared within timeout');
      }
    }

    // Test loading states for AI features
    const loadingStates = page.locator('.loading, .spinner, text=Loading, text=Searching');
    const loadingCount = await loadingStates.count();
    
    if (loadingCount > 0) {
      console.log(`✅ Found ${loadingCount} loading states for AI features`);
    }

    // Check for any long-running AI operations
    const aiButtons = page.locator('button:has-text("Match"), button:has-text("Suggest"), button:has-text("AI")');
    const aiButtonCount = await aiButtons.count();
    
    if (aiButtonCount > 0) {
      const firstAiButton = aiButtons.first();
      const buttonText = await firstAiButton.textContent();
      
      console.log(`Testing performance of AI button: ${buttonText}`);
      
      const startTime = Date.now();
      
      try {
        await firstAiButton.click();
        
        // Wait for some result or loading indicator
        await Promise.race([
          page.waitForSelector('.result, .match, .suggestion', { timeout: 8000 }),
          page.waitForSelector('.loading, .spinner', { timeout: 2000 })
        ]);
        
        const responseTime = Date.now() - startTime;
        console.log(`AI feature response time: ${responseTime}ms`);
        
        if (responseTime > 5000) {
          console.warn(`⚠️ AI feature response time (${responseTime}ms) is slow`);
        } else {
          console.log('✅ AI feature responds within acceptable time');
        }
      } catch (error) {
        console.log('ℹ️ AI feature did not show immediate response');
      }
    }

    await helpers.takeScreenshot('ai-performance-test');
  });

  test('Mobile AI features experience', async () => {
    console.log('📱 Testing mobile AI features...');
    
    await page.setViewportSize(testData.viewports.mobile);
    await page.goto('/dashboard');
    await helpers.waitForFullLoad();

    // Check mobile responsiveness for AI features
    const mobileIssues = await helpers.checkMobileResponsiveness();
    if (mobileIssues.length > 0) {
      console.warn('⚠️ Mobile responsiveness issues:', mobileIssues);
    }

    // Check if AI features are accessible on mobile
    const aiElements = page.locator('button:has-text("AI"), button:has-text("Match"), input[placeholder*="search"]');
    const aiElementCount = await aiElements.count();
    
    if (aiElementCount > 0) {
      console.log(`✅ Found ${aiElementCount} AI elements on mobile`);
      
      // Test mobile interaction with AI features
      const firstAiElement = aiElements.first();
      const elementType = await firstAiElement.tagName();
      
      if (elementType === 'INPUT') {
        await firstAiElement.fill('test mobile ai search');
        console.log('✅ Mobile AI search input works');
      } else if (elementType === 'BUTTON') {
        await firstAiElement.click();
        await page.waitForTimeout(2000);
        console.log('✅ Mobile AI button interaction works');
      }
    } else {
      console.log('ℹ️ No AI features found on mobile');
    }

    // Check if AI suggestions/matches are mobile-friendly
    const suggestions = page.locator('.suggestion, .match, .recommendation');
    const suggestionCount = await suggestions.count();
    
    if (suggestionCount > 0) {
      console.log(`Found ${suggestionCount} AI suggestions on mobile`);
      
      // Check if they fit mobile viewport
      const firstSuggestion = suggestions.first();
      const suggestionBounds = await firstSuggestion.boundingBox();
      
      if (suggestionBounds && suggestionBounds.width <= testData.viewports.mobile.width) {
        console.log('✅ AI suggestions fit mobile viewport');
      } else {
        console.warn('⚠️ AI suggestions may not fit mobile viewport properly');
      }
    }

    await helpers.takeScreenshot('ai-mobile-experience');
    
    // Reset viewport
    await page.setViewportSize(testData.viewports.desktop);
  });
});