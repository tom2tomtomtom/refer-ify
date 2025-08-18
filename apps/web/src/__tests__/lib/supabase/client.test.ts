import { createBrowserClient } from '@supabase/ssr'
import { getSupabaseBrowserClient } from '@/lib/supabase/client'

// Mock Supabase SSR
jest.mock('@supabase/ssr')
const mockCreateBrowserClient = createBrowserClient as jest.MockedFunction<typeof createBrowserClient>

describe('Supabase Client', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('creates browser client with correct configuration', () => {
    const mockClient = { id: 'supabase-client' }
    mockCreateBrowserClient.mockReturnValue(mockClient as any)

    // Mock environment variables
    const originalUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const originalKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key'

    const client = getSupabaseBrowserClient()

    expect(mockCreateBrowserClient).toHaveBeenCalledWith(
      'https://test.supabase.co',
      'test-anon-key'
    )
    expect(client).toBe(mockClient)

    // Restore environment variables
    process.env.NEXT_PUBLIC_SUPABASE_URL = originalUrl
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = originalKey
  })

  it('throws error when URL is missing', () => {
    const originalUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const originalKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    
    delete process.env.NEXT_PUBLIC_SUPABASE_URL
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key'

    expect(() => getSupabaseBrowserClient()).toThrow('Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY')

    // Restore environment variables
    process.env.NEXT_PUBLIC_SUPABASE_URL = originalUrl
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = originalKey
  })

  it('throws error when anon key is missing', () => {
    const originalUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const originalKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
    delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    expect(() => getSupabaseBrowserClient()).toThrow('Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY')

    // Restore environment variables
    process.env.NEXT_PUBLIC_SUPABASE_URL = originalUrl
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = originalKey
  })

  it('creates singleton instance', () => {
    const mockClient = { id: 'supabase-client' }
    mockCreateBrowserClient.mockReturnValue(mockClient as any)

    // Mock environment variables
    const originalUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const originalKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key'

    const client1 = getSupabaseBrowserClient()
    const client2 = getSupabaseBrowserClient()

    // Should only call createBrowserClient once
    expect(mockCreateBrowserClient).toHaveBeenCalledTimes(1)
    expect(client1).toBe(client2)

    // Restore environment variables
    process.env.NEXT_PUBLIC_SUPABASE_URL = originalUrl
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = originalKey
  })

  it('works with different environment configurations', () => {
    const mockClient = { id: 'supabase-client' }
    mockCreateBrowserClient.mockReturnValue(mockClient as any)

    // Test development configuration
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'http://localhost:54321'
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'dev-anon-key'

    const client = getSupabaseBrowserClient()

    expect(mockCreateBrowserClient).toHaveBeenCalledWith(
      'http://localhost:54321',
      'dev-anon-key'
    )
    expect(client).toBe(mockClient)
  })

  it('handles empty string environment variables', () => {
    const originalUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const originalKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    
    process.env.NEXT_PUBLIC_SUPABASE_URL = ''
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key'

    expect(() => getSupabaseBrowserClient()).toThrow('Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY')

    // Restore environment variables
    process.env.NEXT_PUBLIC_SUPABASE_URL = originalUrl
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = originalKey
  })

  it('creates client with proper TypeScript types', () => {
    const mockClient = { 
      id: 'supabase-client',
      from: jest.fn(),
      auth: { getUser: jest.fn() },
      storage: { from: jest.fn() },
    }
    mockCreateBrowserClient.mockReturnValue(mockClient as any)

    // Mock environment variables
    const originalUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const originalKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key'

    const client = getSupabaseBrowserClient()

    // Client should have expected methods
    expect(client.from).toBeDefined()
    expect(client.auth).toBeDefined()
    expect(client.storage).toBeDefined()

    // Restore environment variables
    process.env.NEXT_PUBLIC_SUPABASE_URL = originalUrl
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = originalKey
  })
})