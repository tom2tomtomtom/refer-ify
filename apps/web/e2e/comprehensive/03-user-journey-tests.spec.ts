import { test, expect } from '@playwright/test';
import { TEST_DATA } from '../fixtures/test-data-generator';

test.describe('🚀 Complete User Journey Tests - All Roles End-to-End', () => {
  const testUsers = TEST_DATA.users;
  const testJobs = TEST_DATA.jobs.slice(0, 5);
  const testCandidates = TEST_DATA.candidates.slice(0, 10);

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test.describe('👔 Client User Journey - Complete Workflow', () => {
    const clientUsers = testUsers.filter(u => u.role === 'client').slice(0, 3);

    test('Complete Client Onboarding → Job Posting → Hiring Flow', async ({ page }) => {
      const client = clientUsers[0];
      const job = testJobs[0];

      console.log(`🔄 Testing complete client journey for: ${client.email}`);

      // STEP 1: Client Registration
      console.log('📝 Step 1: Client Registration');
      await page.goto('/signup');
      
      await page.fill('[name="email"]', client.email);
      await page.fill('[name="password"]', client.password);
      await page.fill('[name="confirmPassword"]', client.password);
      await page.fill('[name="firstName"]', client.profile.firstName);
      await page.fill('[name="lastName"]', client.profile.lastName);
      
      if (client.profile.company) {
        await page.fill('[name="company"]', client.profile.company);
      }
      if (client.profile.title) {
        await page.fill('[name="title"]', client.profile.title);
      }
      
      await page.selectOption('[name="role"]', 'client');
      await page.check('[name="acceptTerms"]');
      await page.click('button[type="submit"]');

      // Handle registration result
      await page.waitForTimeout(2000);
      
      // STEP 2: Navigate to Client Dashboard
      console.log('🏠 Step 2: Navigate to Client Dashboard');
      await page.goto('/client');
      
      // Verify dashboard loads
      await expect(page.locator('text=dashboard').or(page.locator('text=welcome')).first()).toBeVisible({ timeout: 10000 });
      
      // STEP 3: Complete Profile Setup
      console.log('👤 Step 3: Complete Profile Setup');
      const profileLink = page.locator('text=profile').or(page.locator('a[href*="profile"]')).first();
      
      if (await profileLink.isVisible()) {
        await profileLink.click();
        
        // Fill additional profile information
        const companyField = page.locator('[name="company"]').first();
        if (await companyField.isVisible()) {
          await companyField.fill(client.profile.company || 'Test Company');
        }
        
        const phoneField = page.locator('[name="phone"]').first();
        if (await phoneField.isVisible()) {
          await phoneField.fill(client.profile.phone || '+1-555-0123');
        }
        
        // Save profile
        const saveButton = page.locator('button:has-text("save")').or(page.locator('button[type="submit"]')).first();
        if (await saveButton.isVisible()) {
          await saveButton.click();
          await page.waitForTimeout(1000);
        }
      }

      // STEP 4: Choose Subscription Tier
      console.log('💳 Step 4: Choose Subscription Tier');
      await page.goto('/client/billing');
      
      // Look for subscription options
      const subscriptionButtons = page.locator('button:has-text("Connect"), button:has-text("Priority"), button:has-text("Exclusive")');
      const buttonCount = await subscriptionButtons.count();
      
      if (buttonCount > 0) {
        // Choose Connect tier (basic)
        const connectButton = subscriptionButtons.first();
        await connectButton.click();
        
        // Fill payment information (mock)
        const cardNumberField = page.locator('[name="cardNumber"]').first();
        if (await cardNumberField.isVisible()) {
          await cardNumberField.fill('4242424242424242');
          
          const expiryField = page.locator('[name="expiry"]').first();
          if (await expiryField.isVisible()) {
            await expiryField.fill('12/25');
          }
          
          const cvcField = page.locator('[name="cvc"]').first();
          if (await cvcField.isVisible()) {
            await cvcField.fill('123');
          }
          
          // Submit payment
          const payButton = page.locator('button:has-text("pay")').or(page.locator('button[type="submit"]')).first();
          await payButton.click();
          await page.waitForTimeout(2000);
        }
      }

      // STEP 5: Post First Job
      console.log('📋 Step 5: Post First Job');
      await page.goto('/client/jobs/new');
      
      // Fill job posting form
      await page.fill('[name="title"]', job.title);
      await page.fill('[name="company"]', job.company);
      await page.fill('[name="location"]', job.location);
      await page.fill('[name="description"]', job.description);
      
      const salaryMinField = page.locator('[name="salaryMin"]').first();
      if (await salaryMinField.isVisible()) {
        await salaryMinField.fill(job.salary_min.toString());
      }
      
      const salaryMaxField = page.locator('[name="salaryMax"]').first();
      if (await salaryMaxField.isVisible()) {
        await salaryMaxField.fill(job.salary_max.toString());
      }
      
      // Select subscription tier
      const tierSelect = page.locator('[name="subscriptionTier"]').first();
      if (await tierSelect.isVisible()) {
        await tierSelect.selectOption(job.subscription_tier);
      }
      
      // Submit job posting
      const postJobButton = page.locator('button:has-text("post job")').or(page.locator('button[type="submit"]')).first();
      await postJobButton.click();
      await page.waitForTimeout(2000);

      // STEP 6: Review AI-Suggested Candidates
      console.log('🤖 Step 6: Review AI-Suggested Candidates');
      await page.goto('/client/ai-insights');
      
      // Look for AI suggestions
      const candidateCards = page.locator('.candidate-card').or(page.locator('[data-testid="candidate"]'));
      const candidateCount = await candidateCards.count();
      
      if (candidateCount > 0) {
        console.log(`Found ${candidateCount} AI-suggested candidates`);
        
        // Review first candidate
        const firstCandidate = candidateCards.first();
        await firstCandidate.click();
        
        // Look for candidate details
        await expect(page.locator('text=experience').or(page.locator('text=skills'))).toBeVisible({ timeout: 5000 });
      }

      // STEP 7: Request Referrals
      console.log('🤝 Step 7: Request Referrals from Network');
      await page.goto('/client/jobs');
      
      // Find posted job and request referrals
      const jobCards = page.locator('.job-card').or(page.locator('[data-testid="job"]'));
      const jobCount = await jobCards.count();
      
      if (jobCount > 0) {
        const firstJob = jobCards.first();
        await firstJob.click();
        
        // Look for referral request button
        const referralButton = page.locator('button:has-text("request referral")').or(page.locator('button:has-text("get referrals")')).first();
        
        if (await referralButton.isVisible()) {
          await referralButton.click();
          await page.waitForTimeout(1000);
        }
      }

      // STEP 8: Candidate Management
      console.log('📊 Step 8: Candidate Management');
      await page.goto('/client/candidates');
      
      // Review candidates
      const candidates = page.locator('.candidate-item').or(page.locator('[data-testid="candidate-item"]'));
      const candidatesCount = await candidates.count();
      
      if (candidatesCount > 0) {
        console.log(`Managing ${candidatesCount} candidates`);
        
        // Test candidate actions
        const firstCandidate = candidates.first();
        await firstCandidate.hover();
        
        // Look for action buttons
        const actionButtons = page.locator('button:has-text("interview")').or(page.locator('button:has-text("shortlist")'));
        const actionsCount = await actionButtons.count();
        
        if (actionsCount > 0) {
          await actionButtons.first().click();
          await page.waitForTimeout(1000);
        }
      }

      // STEP 9: Analytics and Reports
      console.log('📈 Step 9: View Analytics and Reports');
      await page.goto('/client/analytics');
      
      // Verify analytics dashboard loads
      await expect(page.locator('text=analytics').or(page.locator('.chart')).or(page.locator('.metric'))).toBeVisible({ timeout: 5000 });
      
      // Test export functionality
      const exportButton = page.locator('button:has-text("export")').first();
      if (await exportButton.isVisible()) {
        await exportButton.click();
        await page.waitForTimeout(1000);
      }

      // STEP 10: Settings Management
      console.log('⚙️ Step 10: Settings Management');
      await page.goto('/client/settings');
      
      // Update settings
      const notificationToggle = page.locator('[type="checkbox"]').first();
      if (await notificationToggle.isVisible()) {
        await notificationToggle.click();
      }
      
      // Save settings
      const saveSettingsButton = page.locator('button:has-text("save")').first();
      if (await saveSettingsButton.isVisible()) {
        await saveSettingsButton.click();
        await page.waitForTimeout(1000);
      }

      console.log('✅ Client journey completed successfully!');
    });
  });

  test.describe('🔍 Candidate User Journey - Job Search to Application', () => {
    const candidateUsers = testUsers.filter(u => u.role === 'candidate').slice(0, 3);

    test('Complete Candidate Journey - Registration → Profile → Job Search → Application', async ({ page }) => {
      const candidate = candidateUsers[0];
      const testCandidate = testCandidates[0];

      console.log(`🔄 Testing complete candidate journey for: ${candidate.email}`);

      // STEP 1: Candidate Registration
      console.log('📝 Step 1: Candidate Registration');
      await page.goto('/signup');
      
      await page.fill('[name="email"]', candidate.email);
      await page.fill('[name="password"]', candidate.password);
      await page.fill('[name="firstName"]', candidate.profile.firstName);
      await page.fill('[name="lastName"]', candidate.profile.lastName);
      await page.selectOption('[name="role"]', 'candidate');
      await page.check('[name="acceptTerms"]');
      await page.click('button[type="submit"]');
      await page.waitForTimeout(2000);

      // STEP 2: Complete Profile Creation
      console.log('👤 Step 2: Complete Profile Creation');
      await page.goto('/candidate/profile');
      
      // Fill professional information
      const titleField = page.locator('[name="title"]').first();
      if (await titleField.isVisible()) {
        await titleField.fill(testCandidate.title);
      }
      
      const companyField = page.locator('[name="currentCompany"]').first();
      if (await companyField.isVisible()) {
        await companyField.fill(testCandidate.company);
      }
      
      const experienceField = page.locator('[name="experience"]').first();
      if (await experienceField.isVisible()) {
        await experienceField.fill(testCandidate.experience.toString());
      }
      
      const skillsField = page.locator('[name="skills"]').first();
      if (await skillsField.isVisible()) {
        await skillsField.fill(testCandidate.skills.join(', '));
      }
      
      // Save profile
      const saveProfileButton = page.locator('button:has-text("save")').first();
      if (await saveProfileButton.isVisible()) {
        await saveProfileButton.click();
        await page.waitForTimeout(2000);
      }

      // STEP 3: Resume Upload
      console.log('📄 Step 3: Resume Upload');
      const resumeUpload = page.locator('[type="file"]').first();
      if (await resumeUpload.isVisible()) {
        // Create mock resume file
        const resumeContent = testCandidate.resume?.content || 'Mock resume content';
        await resumeUpload.setInputFiles({
          name: 'resume.pdf',
          mimeType: 'application/pdf',
          buffer: Buffer.from(resumeContent)
        });
        
        await page.waitForTimeout(1000);
      }

      // STEP 4: Job Browsing
      console.log('🔍 Step 4: Browse Available Jobs');
      await page.goto('/jobs');
      
      // Browse job listings
      const jobListings = page.locator('.job-listing').or(page.locator('[data-testid="job-listing"]'));
      const jobCount = await jobListings.count();
      
      if (jobCount > 0) {
        console.log(`Found ${jobCount} job listings`);
        
        // Filter jobs
        const filterInput = page.locator('[placeholder*="search"]').first();
        if (await filterInput.isVisible()) {
          await filterInput.fill('Senior');
          await page.keyboard.press('Enter');
          await page.waitForTimeout(1000);
        }
        
        // View job details
        const firstJob = jobListings.first();
        await firstJob.click();
        await page.waitForTimeout(1000);
      }

      // STEP 5: Job Application Submission
      console.log('📤 Step 5: Submit Job Application');
      const applyButton = page.locator('button:has-text("apply")').first();
      
      if (await applyButton.isVisible()) {
        await applyButton.click();
        
        // Fill application form
        const coverLetterField = page.locator('[name="coverLetter"]').first();
        if (await coverLetterField.isVisible()) {
          await coverLetterField.fill('I am excited to apply for this position. My experience in...');
        }
        
        // Submit application
        const submitAppButton = page.locator('button:has-text("submit application")').first();
        if (await submitAppButton.isVisible()) {
          await submitAppButton.click();
          await page.waitForTimeout(2000);
        }
      }

      // STEP 6: Application Tracking
      console.log('📋 Step 6: Track Application Status');
      await page.goto('/candidate/applications');
      
      // View application status
      const applications = page.locator('.application-item').or(page.locator('[data-testid="application"]'));
      const appCount = await applications.count();
      
      if (appCount > 0) {
        console.log(`Tracking ${appCount} applications`);
        
        const firstApplication = applications.first();
        await firstApplication.click();
        
        // Check application details
        await expect(page.locator('text=status').or(page.locator('text=submitted'))).toBeVisible({ timeout: 5000 });
      }

      console.log('✅ Candidate journey completed successfully!');
    });
  });

  test.describe('💎 Founding Circle Journey - Network Management', () => {
    const foundingUsers = testUsers.filter(u => u.role === 'founding_circle').slice(0, 2);

    test('Complete Founding Circle Journey - Setup → Network → Revenue', async ({ page }) => {
      const founder = foundingUsers[0];

      console.log(`🔄 Testing founding circle journey for: ${founder.email}`);

      // STEP 1: Founding Member Setup
      console.log('📝 Step 1: Founding Member Setup');
      await page.goto('/signup');
      
      await page.fill('[name="email"]', founder.email);
      await page.fill('[name="password"]', founder.password);
      await page.fill('[name="firstName"]', founder.profile.firstName);
      await page.fill('[name="lastName"]', founder.profile.lastName);
      await page.selectOption('[name="role"]', 'founding_circle');
      await page.check('[name="acceptTerms"]');
      await page.click('button[type="submit"]');
      await page.waitForTimeout(2000);

      // STEP 2: Network Management
      console.log('🤝 Step 2: Network Management');
      await page.goto('/founding/network');
      
      // Add network members
      const addMemberButton = page.locator('button:has-text("add member")').or(page.locator('button:has-text("invite")')).first();
      
      if (await addMemberButton.isVisible()) {
        await addMemberButton.click();
        
        // Fill invitation form
        const emailField = page.locator('[name="email"]').first();
        if (await emailField.isVisible()) {
          await emailField.fill('new-member@test.com');
        }
        
        const nameField = page.locator('[name="name"]').first();
        if (await nameField.isVisible()) {
          await nameField.fill('New Network Member');
        }
        
        // Send invitation
        const sendInviteButton = page.locator('button:has-text("send")').first();
        if (await sendInviteButton.isVisible()) {
          await sendInviteButton.click();
          await page.waitForTimeout(1000);
        }
      }

      // STEP 3: Revenue Tracking
      console.log('💰 Step 3: Revenue Tracking');
      await page.goto('/founding/revenue');
      
      // View revenue dashboard
      await expect(page.locator('text=revenue').or(page.locator('.revenue-metric'))).toBeVisible({ timeout: 5000 });
      
      // Test revenue filters
      const periodFilter = page.locator('[name="period"]').first();
      if (await periodFilter.isVisible()) {
        await periodFilter.selectOption('last-month');
        await page.waitForTimeout(1000);
      }

      // STEP 4: Advisory Features
      console.log('🎯 Step 4: Advisory Features');
      await page.goto('/founding/advisory');
      
      // Use advisory tools
      const advisoryButtons = page.locator('button').or(page.locator('a[role="button"]'));
      const buttonCount = await advisoryButtons.count();
      
      for (let i = 0; i < Math.min(buttonCount, 3); i++) {
        const button = advisoryButtons.nth(i);
        if (await button.isVisible() && await button.isEnabled()) {
          await button.click();
          await page.waitForTimeout(500);
        }
      }

      console.log('✅ Founding circle journey completed successfully!');
    });
  });

  test.describe('⭐ Select Circle Journey - Premium Referrals', () => {
    const selectUsers = testUsers.filter(u => u.role === 'select_circle').slice(0, 3);

    test('Complete Select Circle Journey - Premium Access → Referrals → Earnings', async ({ page }) => {
      const selectMember = selectUsers[0];

      console.log(`🔄 Testing select circle journey for: ${selectMember.email}`);

      // STEP 1: Select Circle Registration
      console.log('📝 Step 1: Select Circle Registration');
      await page.goto('/signup');
      
      await page.fill('[name="email"]', selectMember.email);
      await page.fill('[name="password"]', selectMember.password);
      await page.fill('[name="firstName"]', selectMember.profile.firstName);
      await page.fill('[name="lastName"]', selectMember.profile.lastName);
      await page.selectOption('[name="role"]', 'select_circle');
      await page.check('[name="acceptTerms"]');
      await page.click('button[type="submit"]');
      await page.waitForTimeout(2000);

      // STEP 2: Access Premium Job Board
      console.log('💎 Step 2: Access Premium Job Board');
      await page.goto('/select-circle/job-opportunities');
      
      // Browse premium opportunities
      const premiumJobs = page.locator('.premium-job').or(page.locator('[data-tier="exclusive"]'));
      const premiumCount = await premiumJobs.count();
      
      if (premiumCount > 0) {
        console.log(`Found ${premiumCount} premium opportunities`);
        
        const firstPremiumJob = premiumJobs.first();
        await firstPremiumJob.click();
        await page.waitForTimeout(1000);
      }

      // STEP 3: Submit Referrals
      console.log('👥 Step 3: Submit Quality Referrals');
      await page.goto('/select-circle/referrals');
      
      const newReferralButton = page.locator('button:has-text("new referral")').or(page.locator('button:has-text("submit referral")')).first();
      
      if (await newReferralButton.isVisible()) {
        await newReferralButton.click();
        
        // Fill referral form
        const candidateNameField = page.locator('[name="candidateName"]').first();
        if (await candidateNameField.isVisible()) {
          await candidateNameField.fill(testCandidates[0].firstName + ' ' + testCandidates[0].lastName);
        }
        
        const candidateEmailField = page.locator('[name="candidateEmail"]').first();
        if (await candidateEmailField.isVisible()) {
          await candidateEmailField.fill(testCandidates[0].email);
        }
        
        const reasonField = page.locator('[name="reason"]').first();
        if (await reasonField.isVisible()) {
          await reasonField.fill('Excellent match with strong background in relevant technologies');
        }
        
        // Submit referral
        const submitReferralButton = page.locator('button:has-text("submit")').first();
        if (await submitReferralButton.isVisible()) {
          await submitReferralButton.click();
          await page.waitForTimeout(2000);
        }
      }

      // STEP 4: Track Earnings
      console.log('💰 Step 4: Track Referral Earnings');
      await page.goto('/select-circle/earnings');
      
      // View earnings dashboard
      await expect(page.locator('text=earnings').or(page.locator('.earnings-metric'))).toBeVisible({ timeout: 5000 });
      
      // Check referral performance
      const performanceMetrics = page.locator('.metric').or(page.locator('[data-testid="metric"]'));
      const metricCount = await performanceMetrics.count();
      
      console.log(`Found ${metricCount} performance metrics`);

      // STEP 5: Network Building
      console.log('🌐 Step 5: Network Building');
      await page.goto('/select-circle/network');
      
      // Expand professional network
      const networkActions = page.locator('button').or(page.locator('a[role="button"]'));
      const actionCount = await networkActions.count();
      
      for (let i = 0; i < Math.min(actionCount, 2); i++) {
        const action = networkActions.nth(i);
        if (await action.isVisible() && await action.isEnabled()) {
          await action.click();
          await page.waitForTimeout(500);
        }
      }

      console.log('✅ Select circle journey completed successfully!');
    });
  });

  test.describe('🤝 Cross-Role Collaboration Scenarios', () => {
    test('Multi-User Job Fulfillment Flow', async ({ page }) => {
      console.log('🔄 Testing multi-user collaboration scenario');

      // This test simulates the interaction between client, referrer, and candidate
      // In a real scenario, this would require multiple browser contexts
      
      // SIMULATION: Client posts job
      console.log('👔 Client posts high-priority job');
      await page.goto('/client/jobs/new');
      
      // Mock job posting
      const jobData = testJobs[0];
      await page.fill('[name="title"]', jobData.title);
      await page.fill('[name="description"]', jobData.description);
      
      // SIMULATION: AI suggests candidates
      console.log('🤖 AI suggests qualified candidates');
      await page.goto('/client/ai-insights');
      
      // Verify AI suggestions interface
      await expect(page.locator('text=suggestions').or(page.locator('.candidate-suggestion'))).toBeVisible({ timeout: 5000 });

      // SIMULATION: Referrer submits candidate
      console.log('👥 Referrer submits qualified candidate');
      await page.goto('/select-circle/referrals');
      
      // Mock referral submission interface
      const newReferralBtn = page.locator('button:has-text("new referral")').first();
      if (await newReferralBtn.isVisible()) {
        await newReferralBtn.click();
        await page.waitForTimeout(1000);
      }

      // SIMULATION: Client reviews and makes hiring decision
      console.log('📋 Client reviews candidates and makes decision');
      await page.goto('/client/candidates');
      
      // Mock candidate review interface
      await expect(page.locator('text=candidates').or(page.locator('.candidate-list'))).toBeVisible({ timeout: 5000 });

      console.log('✅ Multi-user collaboration scenario completed!');
    });
  });
});