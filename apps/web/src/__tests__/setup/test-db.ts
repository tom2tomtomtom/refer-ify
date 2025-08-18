import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/supabase/database.types'

export function createTestSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321'
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'test-anon-key'
  
  return createClient<Database>(supabaseUrl, supabaseAnonKey)
}

export function createTestSupabaseServiceClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321'
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'test-service-key'
  
  return createClient<Database>(supabaseUrl, serviceRoleKey)
}

export async function cleanupTestData(client: ReturnType<typeof createTestSupabaseClient>) {
  await client.from('referrals').delete().neq('id', '')
  await client.from('jobs').delete().neq('id', '')
  await client.from('user_profiles').delete().neq('id', '')
}

export async function createTestUser(
  client: ReturnType<typeof createTestSupabaseClient>,
  userData: {
    email: string
    role?: 'candidate' | 'client' | 'founding_circle'
    full_name?: string
  }
) {
  const { data: user, error: userError } = await client.auth.signUp({
    email: userData.email,
    password: 'test-password-123',
  })

  if (userError) throw userError

  if (user.user) {
    const { data: profile, error: profileError } = await client
      .from('user_profiles')
      .insert({
        id: user.user.id,
        email: userData.email,
        role: userData.role || 'candidate',
        full_name: userData.full_name || 'Test User',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (profileError) throw profileError
    return { user: user.user, profile }
  }

  throw new Error('Failed to create test user')
}

export async function createTestJob(
  client: ReturnType<typeof createTestSupabaseClient>,
  clientId: string,
  jobData: Partial<{
    title: string
    description: string
    company: string
    location: string
    requirements: string[]
    compensation_min: number
    compensation_max: number
  }> = {}
) {
  const { data, error } = await client
    .from('jobs')
    .insert({
      client_id: clientId,
      title: jobData.title || 'Test Job',
      description: jobData.description || 'Test job description',
      company: jobData.company || 'Test Company',
      location: jobData.location || 'Remote',
      requirements: jobData.requirements || ['Test requirement'],
      compensation_min: jobData.compensation_min || 50000,
      compensation_max: jobData.compensation_max || 100000,
      status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .select()
    .single()

  if (error) throw error
  return data
}