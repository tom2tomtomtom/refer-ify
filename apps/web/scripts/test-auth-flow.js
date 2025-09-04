#!/usr/bin/env node

/**
 * Test authentication flow for all test users
 * Usage: node scripts/test-auth-flow.js
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !anonKey) {
  console.error('❌ Missing environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, anonKey);

const TEST_USERS = [
  { email: 'client@test.com', password: 'testpass123', expectedRole: 'client', expectedRedirect: '/client' },
  { email: 'founding@test.com', password: 'testpass123', expectedRole: 'founding_circle', expectedRedirect: '/founding' },
  { email: 'select@test.com', password: 'testpass123', expectedRole: 'select_circle', expectedRedirect: '/select-circle' },
  { email: 'candidate@test.com', password: 'testpass123', expectedRole: 'candidate', expectedRedirect: '/candidate' }
];

async function testAuthFlow() {
  console.log('🧪 Testing authentication flow for all users...\n');
  
  const results = [];
  
  for (const user of TEST_USERS) {
    console.log(`Testing ${user.expectedRole}: ${user.email}`);
    
    try {
      // Test sign in
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: user.password
      });

      if (authError) {
        console.error(`❌ Auth failed: ${authError.message}`);
        results.push({
          email: user.email,
          role: user.expectedRole,
          authSuccess: false,
          profileSuccess: false,
          error: authError.message
        });
        continue;
      }

      console.log(`✅ Authentication successful`);

      // Test profile retrieval
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role, first_name, last_name, company')
        .eq('id', authData.user.id)
        .single();

      if (profileError) {
        console.error(`❌ Profile fetch failed: ${profileError.message}`);
        results.push({
          email: user.email,
          role: user.expectedRole,
          authSuccess: true,
          profileSuccess: false,
          error: profileError.message
        });
      } else {
        const roleMatch = profile.role === user.expectedRole;
        console.log(`✅ Profile retrieved: ${profile.first_name} ${profile.last_name}`);
        console.log(`✅ Role: ${profile.role} ${roleMatch ? '✅' : '❌ MISMATCH'}`);
        console.log(`✅ Company: ${profile.company || 'N/A'}`);
        
        results.push({
          email: user.email,
          role: user.expectedRole,
          actualRole: profile.role,
          authSuccess: true,
          profileSuccess: true,
          roleMatch,
          profile: {
            name: `${profile.first_name} ${profile.last_name}`,
            company: profile.company
          }
        });
      }

      // Sign out for next test
      await supabase.auth.signOut();

    } catch (error) {
      console.error(`❌ Unexpected error: ${error.message}`);
      results.push({
        email: user.email,
        role: user.expectedRole,
        authSuccess: false,
        profileSuccess: false,
        error: error.message
      });
    }
    
    console.log('');
  }

  // Summary report
  console.log('📊 AUTHENTICATION TEST RESULTS');
  console.log('================================');
  
  const successful = results.filter(r => r.authSuccess && r.profileSuccess && r.roleMatch);
  const failed = results.filter(r => !r.authSuccess || !r.profileSuccess || !r.roleMatch);
  
  console.log(`✅ Successful: ${successful.length}/${results.length}`);
  console.log(`❌ Failed: ${failed.length}/${results.length}`);
  console.log('');

  if (successful.length > 0) {
    console.log('✅ WORKING USERS:');
    successful.forEach(user => {
      console.log(`   ${user.actualRole}: ${user.email} → ${user.profile.name}`);
    });
    console.log('');
  }

  if (failed.length > 0) {
    console.log('❌ ISSUES:');
    failed.forEach(user => {
      console.log(`   ${user.email}: ${user.error || 'Role mismatch'}`);
    });
    console.log('');
  }

  console.log('🔗 Ready to test in browser:');
  console.log('   Start dev server: npm run dev');
  console.log('   Visit: http://localhost:3000/login');
  console.log('   Use any working credentials above');

  return results;
}

// Run the test
testAuthFlow().then((results) => {
  const allWorking = results.every(r => r.authSuccess && r.profileSuccess && r.roleMatch);
  console.log(allWorking ? '🎉 All users working perfectly!' : '⚠️ Some issues found - check above');
  process.exit(allWorking ? 0 : 1);
}).catch(error => {
  console.error('💥 Test failed:', error);
  process.exit(1);
});