#!/usr/bin/env node

/**
 * Create test users for development
 * Usage: node scripts/create-test-users.js
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('❌ Missing environment variables:');
  console.error('NEXT_PUBLIC_SUPABASE_URL:', !!supabaseUrl);
  console.error('SUPABASE_SERVICE_ROLE_KEY:', !!serviceRoleKey);
  console.error('\nMake sure these are set in your .env.local file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

const TEST_USERS = [
  {
    email: 'client@test.com',
    password: 'testpass123',
    role: 'client',
    first_name: 'Test',
    last_name: 'Client',
    company: 'Test Corp'
  },
  {
    email: 'founding@test.com', 
    password: 'testpass123',
    role: 'founding_circle',
    first_name: 'Test',
    last_name: 'Founder',
    company: 'Refer-ify'
  },
  {
    email: 'select@test.com',
    password: 'testpass123', 
    role: 'select_circle',
    first_name: 'Test',
    last_name: 'Selector',
    company: 'Select Inc'
  },
  {
    email: 'candidate@test.com',
    password: 'testpass123',
    role: 'candidate', 
    first_name: 'Test',
    last_name: 'Candidate',
    company: null
  }
];

async function createTestUsers() {
  console.log('🚀 Creating test users...\n');
  
  for (const user of TEST_USERS) {
    try {
      console.log(`Creating ${user.role}: ${user.email}`);
      
      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: user.email,
        password: user.password,
        email_confirm: true, // Skip email confirmation
        user_metadata: {
          first_name: user.first_name,
          last_name: user.last_name,
        }
      });

      if (authError) {
        console.error(`❌ Auth creation failed: ${authError.message}`);
        continue;
      }

      // Create profile
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: authData.user.id,
          email: user.email,
          role: user.role,
          first_name: user.first_name,
          last_name: user.last_name,
          company: user.company,
          created_at: new Date().toISOString()
        });

      if (profileError) {
        console.error(`❌ Profile creation failed: ${profileError.message}`);
      } else {
        console.log(`✅ Created successfully (ID: ${authData.user.id})`);
      }

    } catch (error) {
      console.error(`❌ Error creating ${user.email}:`, error.message);
    }
    
    console.log('');
  }

  console.log('📋 Test User Credentials:');
  console.log('========================');
  TEST_USERS.forEach(user => {
    console.log(`${user.role.toUpperCase().replace('_', ' ')}: ${user.email} / ${user.password}`);
  });
  console.log('');
  console.log('🔗 You can now login at: http://localhost:3000/login');
}

async function cleanup() {
  console.log('🧹 Cleaning up test users...\n');
  
  // Get all test users
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, email')
    .in('email', TEST_USERS.map(u => u.email));

  if (profiles) {
    for (const profile of profiles) {
      try {
        console.log(`Deleting: ${profile.email}`);
        
        // Delete auth user (this should cascade to profile)
        const { error } = await supabase.auth.admin.deleteUser(profile.id);
        
        if (error) {
          console.error(`❌ Failed: ${error.message}`);
        } else {
          console.log(`✅ Deleted successfully`);
        }
        
      } catch (error) {
        console.error(`❌ Error deleting ${profile.email}:`, error.message);
      }
      console.log('');
    }
  }
}

// Handle command line arguments
const command = process.argv[2];

if (command === 'cleanup') {
  cleanup().then(() => {
    console.log('✨ Cleanup complete!');
    process.exit(0);
  }).catch(error => {
    console.error('💥 Cleanup failed:', error);
    process.exit(1);
  });
} else {
  createTestUsers().then(() => {
    console.log('✨ Test users created successfully!');
    process.exit(0);
  }).catch(error => {
    console.error('💥 Creation failed:', error);
    process.exit(1);
  });
}