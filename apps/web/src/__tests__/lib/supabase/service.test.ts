import { createClient } from '@supabase/supabase-js'
import { getSupabaseServiceClient } from '@/lib/supabase/service'

// Mock Supabase
jest.mock('@supabase/supabase-js')
const mockCreateClient = createClient as jest.MockedFunction<typeof createClient>

describe('Supabase Service Client', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('creates service client with correct configuration', () => {
    const mockClient = { id: 'supabase-service-client' }
    mockCreateClient.mockReturnValue(mockClient as any)

    // Mock environment variables
    const originalUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const originalServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'service-role-key-123'

    const client = getSupabaseServiceClient()

    expect(mockCreateClient).toHaveBeenCalledWith(
      'https://test.supabase.co',
      'service-role-key-123'
    )
    expect(client).toBe(mockClient)

    // Restore environment variables
    process.env.NEXT_PUBLIC_SUPABASE_URL = originalUrl
    process.env.SUPABASE_SERVICE_ROLE_KEY = originalServiceKey
  })

  it('throws error when URL is missing', () => {
    const originalUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const originalServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    
    delete process.env.NEXT_PUBLIC_SUPABASE_URL
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'service-role-key-123'

    expect(() => getSupabaseServiceClient()).toThrow('Missing Supabase service envs')

    // Restore environment variables
    process.env.NEXT_PUBLIC_SUPABASE_URL = originalUrl
    process.env.SUPABASE_SERVICE_ROLE_KEY = originalServiceKey
  })

  it('throws error when service key is missing', () => {
    const originalUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const originalServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
    delete process.env.SUPABASE_SERVICE_ROLE_KEY

    expect(() => getSupabaseServiceClient()).toThrow('Missing Supabase service envs')

    // Restore environment variables
    process.env.NEXT_PUBLIC_SUPABASE_URL = originalUrl
    process.env.SUPABASE_SERVICE_ROLE_KEY = originalServiceKey
  })

  it('throws error when both URL and service key are missing', () => {
    const originalUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const originalServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    
    delete process.env.NEXT_PUBLIC_SUPABASE_URL
    delete process.env.SUPABASE_SERVICE_ROLE_KEY

    expect(() => getSupabaseServiceClient()).toThrow('Missing Supabase service envs')

    // Restore environment variables
    process.env.NEXT_PUBLIC_SUPABASE_URL = originalUrl
    process.env.SUPABASE_SERVICE_ROLE_KEY = originalServiceKey
  })

  it('works with different environment configurations', () => {
    const mockClient = { id: 'supabase-service-client' }
    mockCreateClient.mockReturnValue(mockClient as any)

    // Test development configuration
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'http://localhost:54321'
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'dev-service-role-key'

    const client = getSupabaseServiceClient()

    expect(mockCreateClient).toHaveBeenCalledWith(
      'http://localhost:54321',
      'dev-service-role-key'
    )
    expect(client).toBe(mockClient)
  })

  it('handles empty string environment variables', () => {
    const originalUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const originalServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    
    process.env.NEXT_PUBLIC_SUPABASE_URL = ''
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'service-role-key-123'

    expect(() => getSupabaseServiceClient()).toThrow('Missing Supabase service envs')

    // Test empty service key
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
    process.env.SUPABASE_SERVICE_ROLE_KEY = ''

    expect(() => getSupabaseServiceClient()).toThrow('Missing Supabase service envs')

    // Restore environment variables
    process.env.NEXT_PUBLIC_SUPABASE_URL = originalUrl
    process.env.SUPABASE_SERVICE_ROLE_KEY = originalServiceKey
  })

  it('creates client with proper TypeScript types', () => {
    const mockClient = { 
      id: 'supabase-service-client',
      from: jest.fn(),
      auth: { 
        admin: { 
          createUser: jest.fn(),
          deleteUser: jest.fn(),
        }
      },
      storage: { from: jest.fn() },
    }
    mockCreateClient.mockReturnValue(mockClient as any)

    // Mock environment variables
    const originalUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const originalServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'service-role-key-123'

    const client = getSupabaseServiceClient()

    // Client should have expected methods for service role
    expect(client.from).toBeDefined()
    expect(client.auth).toBeDefined()
    expect(client.storage).toBeDefined()

    // Restore environment variables
    process.env.NEXT_PUBLIC_SUPABASE_URL = originalUrl
    process.env.SUPABASE_SERVICE_ROLE_KEY = originalServiceKey
  })
})