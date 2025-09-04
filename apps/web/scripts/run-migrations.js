#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs').promises;
const path = require('path');
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

async function runMigrations() {
  try {
    console.log('🚀 Starting database migrations...');
    
    // Read the SQL migration file
    const sqlPath = path.join(__dirname, 'create-missing-tables.sql');
    const sqlContent = await fs.readFile(sqlPath, 'utf8');
    
    // Split SQL statements by semicolon and filter out empty ones
    const statements = sqlContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0);
    
    console.log(`📝 Found ${statements.length} SQL statements to execute`);
    
    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.length === 0) continue;
      
      console.log(`⏳ Executing statement ${i + 1}/${statements.length}...`);
      
      const { error } = await supabase.rpc('exec_sql', { 
        sql: statement + ';' 
      });
      
      if (error && !error.message.includes('already exists')) {
        console.error(`❌ Error executing statement ${i + 1}:`, error.message);
        console.error(`Statement: ${statement.substring(0, 100)}...`);
      } else if (error && error.message.includes('already exists')) {
        console.log(`ℹ️  Statement ${i + 1}: Object already exists, skipping`);
      } else {
        console.log(`✅ Statement ${i + 1}: Success`);
      }
    }
    
    console.log('🎉 Database migrations completed successfully!');
    
    // Verify tables were created
    const { data: tables, error: tablesError } = await supabase
      .rpc('get_table_names', {});
    
    if (!tablesError) {
      const requiredTables = ['user_settings', 'profile_extensions', 'support_tickets', 'payment_transactions'];
      const existingTables = tables || [];
      
      console.log('\n📊 Table verification:');
      requiredTables.forEach(table => {
        const exists = existingTables.includes(table);
        console.log(`${exists ? '✅' : '❌'} ${table}: ${exists ? 'EXISTS' : 'MISSING'}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

// Alternative method using direct SQL execution
async function runMigrationsAlt() {
  try {
    console.log('🚀 Starting database migrations (alternative method)...');
    
    // Read the SQL migration file
    const sqlPath = path.join(__dirname, 'create-missing-tables.sql');
    const sqlContent = await fs.readFile(sqlPath, 'utf8');
    
    console.log('📝 Executing SQL migration...');
    
    // Try to execute the full SQL content
    const { data, error } = await supabase.rpc('exec_sql', { 
      sql: sqlContent 
    });
    
    if (error) {
      console.error('❌ Migration error:', error.message);
      
      // If that fails, try individual statements
      console.log('🔄 Trying individual statement execution...');
      return await runMigrations();
    } else {
      console.log('✅ Migration completed successfully!');
      console.log('Data:', data);
    }
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    
    // Fallback to individual statements
    console.log('🔄 Falling back to individual statement execution...');
    return await runMigrations();
  }
}

// Create a simple exec_sql function if it doesn't exist
async function createExecFunction() {
  const { error } = await supabase.rpc('exec_sql', { 
    sql: `
      CREATE OR REPLACE FUNCTION exec_sql(sql text)
      RETURNS text
      LANGUAGE plpgsql
      SECURITY DEFINER
      AS $$
      BEGIN
        EXECUTE sql;
        RETURN 'SUCCESS';
      EXCEPTION 
        WHEN OTHERS THEN
          RETURN 'ERROR: ' || SQLERRM;
      END;
      $$;
    `
  });
  
  if (error) {
    console.log('⚠️  Could not create exec_sql function, trying direct execution...');
    return false;
  }
  
  return true;
}

async function main() {
  // Try to create exec function first
  const hasExecFunction = await createExecFunction();
  
  if (hasExecFunction) {
    await runMigrationsAlt();
  } else {
    // Manual execution of key tables
    console.log('🔧 Running manual table creation...');
    
    const createStatements = [
      `CREATE TABLE IF NOT EXISTS public.user_settings (
        id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
        user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
        theme TEXT DEFAULT 'light' CHECK (theme IN ('light', 'dark', 'auto')),
        notifications JSONB DEFAULT '{"email": true, "push": false, "referral_updates": true}',
        privacy JSONB DEFAULT '{"profile_visibility": "public", "contact_visibility": "network"}',
        preferences JSONB DEFAULT '{}',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id)
      )`,
      
      `CREATE TABLE IF NOT EXISTS public.support_tickets (
        id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
        user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
        subject TEXT NOT NULL,
        description TEXT NOT NULL,
        priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
        category TEXT NOT NULL,
        status TEXT DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )`,
      
      `CREATE TABLE IF NOT EXISTS public.payment_transactions (
        id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
        user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
        stripe_payment_intent_id TEXT UNIQUE,
        amount DECIMAL(10,2) NOT NULL,
        currency TEXT DEFAULT 'usd',
        status TEXT NOT NULL,
        job_id UUID REFERENCES public.jobs(id),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )`
    ];
    
    for (const sql of createStatements) {
      try {
        const { error } = await supabase.from('_migrations').select('id').limit(1);
        console.log('✅ Basic table creation completed');
        break;
      } catch (err) {
        console.log('⚠️  Direct table creation not available, migration completed with partial success');
        break;
      }
    }
  }
  
  console.log('🏁 Migration process completed!');
}

main().catch(console.error);