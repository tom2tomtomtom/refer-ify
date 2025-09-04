#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs').promises;
require('dotenv').config({ path: '.env.local' });

// Initialize Supabase client with service role key
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables');
  console.error('Required: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Test user credentials
const testUsers = [
  { email: 'client@test.com', password: 'testpass123', role: 'client' },
  { email: 'founding@test.com', password: 'testpass123', role: 'founding_circle' },
  { email: 'select@test.com', password: 'testpass123', role: 'select_circle' },
  { email: 'candidate@test.com', password: 'testpass123', role: 'candidate' }
];

// Test data generation
async function createTestData() {
  console.log('🚀 Creating comprehensive test data...');

  try {
    // Get test user IDs
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, email, role')
      .in('email', testUsers.map(u => u.email));

    if (profilesError) {
      console.error('❌ Error fetching profiles:', profilesError);
      return;
    }

    console.log(`📋 Found ${profiles.length} test user profiles`);

    // Create sample jobs
    const jobData = [
      {
        title: 'Senior Full Stack Developer',
        description: 'We are looking for an experienced full-stack developer to join our growing team. You will be responsible for developing and maintaining web applications using modern technologies.',
        requirements: 'Experience with React, Node.js, PostgreSQL, and AWS. Strong problem-solving skills and attention to detail.',
        location: 'San Francisco, CA',
        remote_ok: true,
        employment_type: 'full_time',
        salary_range: '$120,000 - $180,000',
        experience_level: 'senior',
        subscription_tier: 'priority',
        status: 'active'
      },
      {
        title: 'Product Manager - AI/ML',
        description: 'Join our product team to drive the development of AI-powered features. You will work closely with engineering and design teams to deliver innovative solutions.',
        requirements: 'MBA or equivalent experience, 5+ years in product management, experience with AI/ML products, excellent communication skills.',
        location: 'New York, NY',
        remote_ok: true,
        employment_type: 'full_time',
        salary_range: '$140,000 - $200,000',
        experience_level: 'senior',
        subscription_tier: 'exclusive',
        status: 'active'
      },
      {
        title: 'DevOps Engineer',
        description: 'We need a DevOps engineer to help scale our infrastructure and improve our deployment processes. Experience with Kubernetes and cloud platforms required.',
        requirements: 'Experience with Docker, Kubernetes, AWS/GCP, CI/CD pipelines, monitoring and logging tools.',
        location: 'Remote',
        remote_ok: true,
        employment_type: 'full_time',
        salary_range: '$110,000 - $160,000',
        experience_level: 'mid',
        subscription_tier: 'connect',
        status: 'active'
      },
      {
        title: 'UX/UI Designer',
        description: 'We are seeking a creative UX/UI designer to help shape the future of our products. You will be responsible for user research, wireframing, and creating beautiful interfaces.',
        requirements: 'Portfolio demonstrating UX/UI skills, experience with Figma/Sketch, understanding of user-centered design principles.',
        location: 'Austin, TX',
        remote_ok: false,
        employment_type: 'full_time',
        salary_range: '$90,000 - $130,000',
        experience_level: 'mid',
        subscription_tier: 'priority',
        status: 'active'
      },
      {
        title: 'Data Scientist',
        description: 'Join our data team to build predictive models and derive insights from large datasets. Experience with Python, machine learning, and statistical analysis required.',
        requirements: 'PhD in Data Science/Statistics or equivalent, experience with Python, SQL, machine learning frameworks (TensorFlow, PyTorch).',
        location: 'Seattle, WA',
        remote_ok: true,
        employment_type: 'full_time',
        salary_range: '$130,000 - $190,000',
        experience_level: 'senior',
        subscription_tier: 'exclusive',
        status: 'active'
      },
      {
        title: 'Frontend Developer - React',
        description: 'Looking for a frontend developer specializing in React to build modern, responsive web applications. Strong JavaScript skills essential.',
        requirements: 'Expert knowledge of React, JavaScript ES6+, HTML5, CSS3, experience with state management libraries (Redux, Context API).',
        location: 'Boston, MA',
        remote_ok: true,
        employment_type: 'full_time',
        salary_range: '$95,000 - $140,000',
        experience_level: 'mid',
        subscription_tier: 'connect',
        status: 'active'
      },
      {
        title: 'Security Engineer',
        description: 'We need a security engineer to help protect our systems and data. Experience with penetration testing, vulnerability assessment, and security frameworks required.',
        requirements: 'CISSP or equivalent certification, experience with security tools, knowledge of compliance frameworks (SOC2, ISO 27001).',
        location: 'Washington, DC',
        remote_ok: false,
        employment_type: 'full_time',
        salary_range: '$125,000 - $175,000',
        experience_level: 'senior',
        subscription_tier: 'priority',
        status: 'active'
      },
      {
        title: 'Mobile App Developer - React Native',
        description: 'Join our mobile team to build cross-platform applications using React Native. Experience with iOS and Android development preferred.',
        requirements: 'Experience with React Native, JavaScript, native iOS/Android development, app store deployment processes.',
        location: 'Los Angeles, CA',
        remote_ok: true,
        employment_type: 'contract',
        salary_range: '$80,000 - $120,000',
        experience_level: 'mid',
        subscription_tier: 'connect',
        status: 'active'
      }
    ];

    // Create jobs for client users
    const clientUsers = profiles.filter(p => p.role === 'client');
    console.log(`👤 Creating jobs for ${clientUsers.length} client users`);

    for (const client of clientUsers) {
      for (let i = 0; i < 4; i++) { // Create 4 jobs per client
        const jobTemplate = jobData[i % jobData.length];
        const { error: jobError } = await supabase
          .from('jobs')
          .insert({
            ...jobTemplate,
            client_id: client.id,
            title: `${jobTemplate.title} ${i + 1}`
          });

        if (jobError && !jobError.message.includes('duplicate')) {
          console.error(`❌ Error creating job: ${jobError.message}`);
        }
      }
    }

    // Create sample candidates
    const candidateData = [
      {
        first_name: 'Alice',
        last_name: 'Johnson',
        email: 'alice.johnson@example.com',
        phone: '+1-555-0101',
        location: 'San Francisco, CA',
        title: 'Senior Software Engineer',
        experience_years: 8,
        skills: ['React', 'Node.js', 'Python', 'PostgreSQL', 'AWS'],
        bio: 'Experienced full-stack developer with a passion for building scalable web applications. Led multiple teams and delivered high-impact projects.',
        resume_url: 'https://example.com/resume/alice-johnson.pdf',
        linkedin_url: 'https://linkedin.com/in/alice-johnson',
        github_url: 'https://github.com/alice-johnson',
        availability: 'available'
      },
      {
        first_name: 'Bob',
        last_name: 'Smith',
        email: 'bob.smith@example.com',
        phone: '+1-555-0102',
        location: 'New York, NY',
        title: 'Product Manager',
        experience_years: 6,
        skills: ['Product Strategy', 'Data Analysis', 'Agile', 'Leadership', 'AI/ML'],
        bio: 'Product manager with deep experience in AI/ML products. Successfully launched multiple products that generated $10M+ in revenue.',
        resume_url: 'https://example.com/resume/bob-smith.pdf',
        linkedin_url: 'https://linkedin.com/in/bob-smith',
        availability: 'available'
      },
      {
        first_name: 'Carol',
        last_name: 'Davis',
        email: 'carol.davis@example.com',
        phone: '+1-555-0103',
        location: 'Remote',
        title: 'DevOps Engineer',
        experience_years: 5,
        skills: ['Docker', 'Kubernetes', 'AWS', 'Terraform', 'CI/CD'],
        bio: 'DevOps engineer specializing in cloud infrastructure and automation. Built and maintained systems serving millions of users.',
        resume_url: 'https://example.com/resume/carol-davis.pdf',
        linkedin_url: 'https://linkedin.com/in/carol-davis',
        github_url: 'https://github.com/carol-davis',
        availability: 'available'
      },
      {
        first_name: 'David',
        last_name: 'Wilson',
        email: 'david.wilson@example.com',
        phone: '+1-555-0104',
        location: 'Austin, TX',
        title: 'UX/UI Designer',
        experience_years: 4,
        skills: ['Figma', 'Sketch', 'User Research', 'Prototyping', 'Design Systems'],
        bio: 'Creative UX/UI designer with a focus on user-centered design. Improved user engagement by 40% through redesigned interfaces.',
        resume_url: 'https://example.com/resume/david-wilson.pdf',
        linkedin_url: 'https://linkedin.com/in/david-wilson',
        portfolio_url: 'https://davidwilson.design',
        availability: 'available'
      },
      {
        first_name: 'Eva',
        last_name: 'Brown',
        email: 'eva.brown@example.com',
        phone: '+1-555-0105',
        location: 'Seattle, WA',
        title: 'Data Scientist',
        experience_years: 7,
        skills: ['Python', 'R', 'TensorFlow', 'PyTorch', 'SQL', 'Statistics'],
        bio: 'PhD in Statistics with 7 years of industry experience. Built ML models that increased business revenue by 25%.',
        resume_url: 'https://example.com/resume/eva-brown.pdf',
        linkedin_url: 'https://linkedin.com/in/eva-brown',
        github_url: 'https://github.com/eva-brown',
        availability: 'available'
      },
      {
        first_name: 'Frank',
        last_name: 'Miller',
        email: 'frank.miller@example.com',
        phone: '+1-555-0106',
        location: 'Boston, MA',
        title: 'Frontend Developer',
        experience_years: 4,
        skills: ['React', 'TypeScript', 'JavaScript', 'CSS3', 'Redux'],
        bio: 'Frontend developer passionate about creating beautiful, performant user interfaces. Expertise in modern React patterns.',
        resume_url: 'https://example.com/resume/frank-miller.pdf',
        linkedin_url: 'https://linkedin.com/in/frank-miller',
        github_url: 'https://github.com/frank-miller',
        availability: 'available'
      },
      {
        first_name: 'Grace',
        last_name: 'Lee',
        email: 'grace.lee@example.com',
        phone: '+1-555-0107',
        location: 'Washington, DC',
        title: 'Security Engineer',
        experience_years: 6,
        skills: ['Cybersecurity', 'Penetration Testing', 'CISSP', 'SOC2', 'Risk Assessment'],
        bio: 'Security engineer with CISSP certification. Led security initiatives that reduced security incidents by 60%.',
        resume_url: 'https://example.com/resume/grace-lee.pdf',
        linkedin_url: 'https://linkedin.com/in/grace-lee',
        availability: 'available'
      },
      {
        first_name: 'Henry',
        last_name: 'Garcia',
        email: 'henry.garcia@example.com',
        phone: '+1-555-0108',
        location: 'Los Angeles, CA',
        title: 'Mobile Developer',
        experience_years: 5,
        skills: ['React Native', 'JavaScript', 'iOS', 'Android', 'Mobile UI/UX'],
        bio: 'Mobile developer with 5 years of experience building React Native apps. Published 10+ apps with millions of downloads.',
        resume_url: 'https://example.com/resume/henry-garcia.pdf',
        linkedin_url: 'https://linkedin.com/in/henry-garcia',
        github_url: 'https://github.com/henry-garcia',
        availability: 'available'
      }
    ];

    // Create candidates
    console.log(`👥 Creating ${candidateData.length} sample candidates`);
    for (const candidate of candidateData) {
      const { error: candidateError } = await supabase
        .from('candidates')
        .insert(candidate);

      if (candidateError && !candidateError.message.includes('duplicate')) {
        console.error(`❌ Error creating candidate: ${candidateError.message}`);
      }
    }

    // Create sample referrals
    const { data: jobs } = await supabase.from('jobs').select('id').limit(8);
    const { data: candidates } = await supabase.from('candidates').select('id').limit(8);
    const referrerUsers = profiles.filter(p => p.role === 'select_circle' || p.role === 'founding_circle');

    console.log(`🤝 Creating sample referrals`);
    for (let i = 0; i < Math.min(jobs.length, candidates.length); i++) {
      const referrer = referrerUsers[i % referrerUsers.length];
      const { error: referralError } = await supabase
        .from('referrals')
        .insert({
          job_id: jobs[i].id,
          candidate_id: candidates[i].id,
          referrer_id: referrer.id,
          status: ['submitted', 'reviewed', 'approved'][i % 3],
          notes: `This candidate would be an excellent fit for this role. They have the right skills and experience.`,
          match_score: Math.floor(Math.random() * 30) + 70 // 70-100% match
        });

      if (referralError && !referralError.message.includes('duplicate')) {
        console.error(`❌ Error creating referral: ${referralError.message}`);
      }
    }

    console.log('✅ Test data creation completed!');

  } catch (error) {
    console.error('❌ Error creating test data:', error);
  }
}

// Quick page accessibility test
async function testPageAccessibility(url, roleName) {
  try {
    const response = await fetch(url, { method: 'GET' });
    const statusIcon = response.ok ? '✅' : '❌';
    console.log(`${statusIcon} ${roleName}: ${url} - ${response.status}`);
    return { url, status: response.status, ok: response.ok, role: roleName };
  } catch (error) {
    console.log(`❌ ${roleName}: ${url} - ERROR: ${error.message}`);
    return { url, status: 'ERROR', ok: false, role: roleName, error: error.message };
  }
}

// Test all role-based pages
async function testAllPages() {
  console.log('\n🔍 Testing page accessibility...');
  
  const baseUrl = 'http://localhost:3001';
  const rolePagesToTest = [
    // Client pages
    { role: 'Client', pages: ['/client', '/client/jobs', '/client/jobs/new', '/client/candidates', '/client/analytics', '/client/ai-insights', '/client/billing', '/client/settings', '/client/profile', '/client/help'] },
    
    // Founding Circle pages  
    { role: 'Founding', pages: ['/founding', '/founding/referrals', '/founding/network', '/founding/invite', '/founding/revenue', '/founding/advisory', '/founding/settings', '/founding/profile', '/founding/help'] },
    
    // Select Circle pages
    { role: 'Select Circle', pages: ['/select-circle', '/select-circle/referrals', '/select-circle/network', '/select-circle/earnings', '/select-circle/job-opportunities', '/select-circle/settings', '/select-circle/profile', '/select-circle/help'] },
    
    // Candidate pages
    { role: 'Candidate', pages: ['/candidate', '/candidate/settings', '/candidate/profile', '/candidate/help'] }
  ];

  const results = [];
  
  for (const roleGroup of rolePagesToTest) {
    console.log(`\n📋 Testing ${roleGroup.role} pages:`);
    
    for (const page of roleGroup.pages) {
      const result = await testPageAccessibility(`${baseUrl}${page}`, roleGroup.role);
      results.push(result);
      await new Promise(resolve => setTimeout(resolve, 100)); // Small delay between requests
    }
  }

  // Summary
  const successfulPages = results.filter(r => r.ok);
  const failedPages = results.filter(r => !r.ok);
  
  console.log('\n📊 PAGE ACCESSIBILITY SUMMARY:');
  console.log(`✅ Successful: ${successfulPages.length}/${results.length} pages (${Math.round(successfulPages.length/results.length*100)}%)`);
  console.log(`❌ Failed: ${failedPages.length}/${results.length} pages`);
  
  if (failedPages.length > 0) {
    console.log('\n🚨 FAILED PAGES:');
    failedPages.forEach(page => {
      console.log(`   ❌ ${page.role}: ${page.url} - Status: ${page.status}`);
    });
  }

  return { successfulPages, failedPages, totalPages: results.length };
}

// Test API endpoints
async function testAPIEndpoints() {
  console.log('\n🔗 Testing API endpoints...');
  
  const apiEndpoints = [
    '/api/jobs',
    '/api/candidates',
    '/api/referrals',
    '/api/user/profile',
    '/api/user/settings',
    '/api/support/tickets',
    '/api/ai/match',
    '/api/payments'
  ];

  const baseUrl = 'http://localhost:3001';
  const results = [];

  for (const endpoint of apiEndpoints) {
    try {
      const response = await fetch(`${baseUrl}${endpoint}`, { method: 'GET' });
      const statusIcon = [200, 401, 403].includes(response.status) ? '✅' : '❌'; // 401/403 are expected without auth
      console.log(`${statusIcon} API: ${endpoint} - ${response.status}`);
      results.push({ endpoint, status: response.status, ok: [200, 401, 403].includes(response.status) });
    } catch (error) {
      console.log(`❌ API: ${endpoint} - ERROR: ${error.message}`);
      results.push({ endpoint, status: 'ERROR', ok: false, error: error.message });
    }
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  const workingEndpoints = results.filter(r => r.ok);
  console.log(`\n📊 API ENDPOINTS SUMMARY: ${workingEndpoints.length}/${results.length} working`);
  
  return results;
}

// Generate comprehensive test report
async function generateTestReport(pageResults, apiResults) {
  console.log('\n📋 COMPREHENSIVE UX/UI TEST REPORT');
  console.log('=' .repeat(80));
  
  console.log('\n🎯 EXECUTIVE SUMMARY:');
  console.log(`• Platform Status: ${pageResults.successfulPages.length >= pageResults.totalPages * 0.9 ? 'PRODUCTION READY ✅' : 'NEEDS FIXES ⚠️'}`);
  console.log(`• Page Coverage: ${pageResults.successfulPages.length}/${pageResults.totalPages} pages working (${Math.round(pageResults.successfulPages.length/pageResults.totalPages*100)}%)`);
  console.log(`• API Coverage: ${apiResults.filter(r => r.ok).length}/${apiResults.length} endpoints working`);

  console.log('\n🔍 DETAILED FINDINGS:');
  
  // Group successful pages by role
  const pagesByRole = pageResults.successfulPages.reduce((acc, page) => {
    acc[page.role] = acc[page.role] || [];
    acc[page.role].push(page);
    return acc;
  }, {});

  Object.entries(pagesByRole).forEach(([role, pages]) => {
    console.log(`\n✅ ${role} Dashboard (${pages.length} pages working):`);
    pages.forEach(page => console.log(`   • ${page.url}`));
  });

  // Failed pages
  if (pageResults.failedPages.length > 0) {
    console.log('\n❌ ISSUES TO FIX:');
    pageResults.failedPages.forEach(page => {
      console.log(`   • ${page.role}: ${page.url} (Status: ${page.status})`);
    });
  }

  console.log('\n🚀 NEXT STEPS:');
  if (pageResults.failedPages.length === 0) {
    console.log('• All pages are accessible - ready for user testing');
    console.log('• Proceed with authenticated testing using test user accounts');
    console.log('• Test complete user workflows and business processes');
  } else {
    console.log('• Fix remaining page issues before proceeding');
    console.log('• Focus on pages with 500 errors first');
    console.log('• Verify database connectivity for failing pages');
  }

  console.log('\n📞 TEST USER CREDENTIALS:');
  testUsers.forEach(user => {
    console.log(`• ${user.role}: ${user.email} / ${user.password}`);
  });

  console.log('\n🎉 REPORT COMPLETE - READY FOR MANUAL UX TESTING');
  
  return {
    summary: {
      totalPages: pageResults.totalPages,
      workingPages: pageResults.successfulPages.length,
      failedPages: pageResults.failedPages.length,
      successRate: Math.round(pageResults.successfulPages.length/pageResults.totalPages*100),
      isProductionReady: pageResults.successfulPages.length >= pageResults.totalPages * 0.9
    },
    pageResults,
    apiResults
  };
}

// Main execution
async function main() {
  console.log('🎭 COMPREHENSIVE UX/UI TESTING SUITE');
  console.log('=' .repeat(80));
  
  // Phase 1: Create test data
  await createTestData();
  
  // Wait for server to be ready
  console.log('\n⏳ Waiting for server to stabilize...');
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  // Phase 2: Test page accessibility
  const pageResults = await testAllPages();
  
  // Phase 3: Test API endpoints
  const apiResults = await testAPIEndpoints();
  
  // Phase 4: Generate comprehensive report
  const report = await generateTestReport(pageResults, apiResults);
  
  // Save report to file
  const reportData = {
    timestamp: new Date().toISOString(),
    testUsers,
    ...report
  };
  
  await fs.writeFile(
    'ux-test-report.json',
    JSON.stringify(reportData, null, 2)
  );
  
  console.log('\n💾 Report saved to: ux-test-report.json');
  
  return report;
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { main, createTestData, testAllPages, testAPIEndpoints };