import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { getSupabaseServerClient, getSupabaseServerComponentClient } from '@/lib/supabase/server'

// Mock Next.js headers
jest.mock('next/headers')
const mockCookies = cookies as jest.MockedFunction<typeof cookies>

// Mock Supabase SSR
jest.mock('@supabase/ssr')
const mockCreateServerClient = createServerClient as jest.MockedFunction<typeof createServerClient>

describe('Supabase Server Clients', () => {
  const mockCookieStore = {
    get: jest.fn(),
    set: jest.fn(),
    delete: jest.fn(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
    mockCookies.mockResolvedValue(mockCookieStore as any)
  })

  describe('getSupabaseServerClient', () => {
    it('creates server client with proper cookie handling', async () => {
      const mockClient = { id: 'server-client' }
      mockCreateServerClient.mockReturnValue(mockClient as any)

      // Mock environment variables
      const originalUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      const originalKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      
      process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key'

      const client = await getSupabaseServerClient()

      expect(mockCookies).toHaveBeenCalled()
      expect(mockCreateServerClient).toHaveBeenCalledWith(
        'https://test.supabase.co',
        'test-anon-key',
        expect.objectContaining({
          cookies: expect.objectContaining({
            get: expect.any(Function),
            set: expect.any(Function),
            remove: expect.any(Function),
          }),
        })
      )
      expect(client).toBe(mockClient)

      // Restore environment variables
      process.env.NEXT_PUBLIC_SUPABASE_URL = originalUrl
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = originalKey
    })

    it('handles cookie get operations', async () => {
      const mockClient = { id: 'server-client' }
      mockCreateServerClient.mockReturnValue(mockClient as any)
      
      mockCookieStore.get.mockReturnValue({ value: 'cookie-value' })

      process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key'

      await getSupabaseServerClient()

      // Get the cookie configuration
      const cookieConfig = mockCreateServerClient.mock.calls[0][2]
      const result = cookieConfig.cookies.get('test-cookie')

      expect(mockCookieStore.get).toHaveBeenCalledWith('test-cookie')
      expect(result).toBe('cookie-value')
    })

    it('handles cookie set operations', async () => {
      const mockClient = { id: 'server-client' }
      mockCreateServerClient.mockReturnValue(mockClient as any)

      process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key'

      await getSupabaseServerClient()

      // Get the cookie configuration
      const cookieConfig = mockCreateServerClient.mock.calls[0][2]
      cookieConfig.cookies.set('test-cookie', 'test-value', { 
        httpOnly: true, 
        secure: true 
      })

      expect(mockCookieStore.set).toHaveBeenCalledWith({
        name: 'test-cookie',
        value: 'test-value',
        httpOnly: true,
        secure: true,
      })
    })

    it('handles cookie remove operations', async () => {
      const mockClient = { id: 'server-client' }
      mockCreateServerClient.mockReturnValue(mockClient as any)

      process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key'

      await getSupabaseServerClient()

      // Get the cookie configuration
      const cookieConfig = mockCreateServerClient.mock.calls[0][2]
      cookieConfig.cookies.remove('test-cookie', { path: '/' })

      expect(mockCookieStore.set).toHaveBeenCalledWith({
        name: 'test-cookie',
        value: '',
        path: '/',
      })
    })

    it('throws error when URL is missing', async () => {
      const originalUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      const originalKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      
      delete process.env.NEXT_PUBLIC_SUPABASE_URL
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key'

      await expect(getSupabaseServerClient()).rejects.toThrow('Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY')

      // Restore environment variables
      process.env.NEXT_PUBLIC_SUPABASE_URL = originalUrl
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = originalKey
    })

    it('throws error when anon key is missing', async () => {
      const originalUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      const originalKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      
      process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
      delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

      await expect(getSupabaseServerClient()).rejects.toThrow('Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY')

      // Restore environment variables
      process.env.NEXT_PUBLIC_SUPABASE_URL = originalUrl
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = originalKey
    })
  })

  describe('getSupabaseServerComponentClient', () => {
    it('creates server component client with read-only cookie handling', async () => {
      const mockClient = { id: 'server-component-client' }
      mockCreateServerClient.mockReturnValue(mockClient as any)

      process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key'

      const client = await getSupabaseServerComponentClient()

      expect(mockCookies).toHaveBeenCalled()
      expect(mockCreateServerClient).toHaveBeenCalledWith(
        'https://test.supabase.co',
        'test-anon-key',
        expect.objectContaining({
          cookies: expect.objectContaining({
            get: expect.any(Function),
            set: expect.any(Function),
            remove: expect.any(Function),
          }),
        })
      )
      expect(client).toBe(mockClient)
    })

    it('handles cookie get operations for server components', async () => {
      const mockClient = { id: 'server-component-client' }
      mockCreateServerClient.mockReturnValue(mockClient as any)
      
      mockCookieStore.get.mockReturnValue({ value: 'cookie-value' })

      process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key'

      await getSupabaseServerComponentClient()

      // Get the cookie configuration
      const cookieConfig = mockCreateServerClient.mock.calls[0][2]
      const result = cookieConfig.cookies.get('test-cookie')

      expect(mockCookieStore.get).toHaveBeenCalledWith('test-cookie')
      expect(result).toBe('cookie-value')
    })

    it('has no-op cookie set for server components', async () => {
      const mockClient = { id: 'server-component-client' }
      mockCreateServerClient.mockReturnValue(mockClient as any)

      process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key'

      await getSupabaseServerComponentClient()

      // Get the cookie configuration
      const cookieConfig = mockCreateServerClient.mock.calls[0][2]
      
      // set() and remove() should be no-ops for server components
      expect(() => {
        cookieConfig.cookies.set('test-cookie', 'test-value')
        cookieConfig.cookies.remove('test-cookie')
      }).not.toThrow()

      // Should not call cookieStore.set
      expect(mockCookieStore.set).not.toHaveBeenCalled()
    })

    it('throws error when URL is missing', async () => {
      const originalUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      const originalKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      
      delete process.env.NEXT_PUBLIC_SUPABASE_URL
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key'

      await expect(getSupabaseServerComponentClient()).rejects.toThrow('Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY')

      // Restore environment variables
      process.env.NEXT_PUBLIC_SUPABASE_URL = originalUrl
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = originalKey
    })

    it('handles missing cookie values gracefully', async () => {
      const mockClient = { id: 'server-component-client' }
      mockCreateServerClient.mockReturnValue(mockClient as any)
      
      mockCookieStore.get.mockReturnValue(undefined)

      process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key'

      await getSupabaseServerComponentClient()

      // Get the cookie configuration
      const cookieConfig = mockCreateServerClient.mock.calls[0][2]
      const result = cookieConfig.cookies.get('non-existent-cookie')

      expect(mockCookieStore.get).toHaveBeenCalledWith('non-existent-cookie')
      expect(result).toBeUndefined()
    })

    it('works with different environments', async () => {
      const mockClient = { id: 'server-component-client' }
      mockCreateServerClient.mockReturnValue(mockClient as any)

      // Test with local development environment
      process.env.NEXT_PUBLIC_SUPABASE_URL = 'http://localhost:54321'
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'local-dev-key'

      const client = await getSupabaseServerComponentClient()

      expect(mockCreateServerClient).toHaveBeenCalledWith(
        'http://localhost:54321',
        'local-dev-key',
        expect.any(Object)
      )
      expect(client).toBe(mockClient)
    })
  })
})