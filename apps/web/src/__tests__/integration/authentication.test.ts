import { getCurrentUser, requireAuth, requireRole } from '@/lib/auth'
import { createTestSupabaseClient, createTestUser, cleanupTestData } from '../setup/test-db'
import { redirect } from 'next/navigation'

jest.mock('next/navigation', () => ({
  redirect: jest.fn(),
}))

describe('Authentication Integration Tests', () => {
  let testClient: ReturnType<typeof createTestSupabaseClient>

  beforeAll(() => {
    testClient = createTestSupabaseClient()
  })

  afterEach(async () => {
    await cleanupTestData(testClient)
    jest.clearAllMocks()
  })

  describe('User Authentication Flow', () => {
    it('successfully authenticates a valid user', async () => {
      // This is a simplified test since we can't easily mock the full Supabase client
      // In a real integration test, you'd want to use a test database
      
      const mockUser = {
        id: 'test-user-id',
        email: 'test@example.com',
        email_confirmed_at: new Date().toISOString(),
        phone: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        app_metadata: {},
        user_metadata: {},
        aud: 'authenticated',
        role: 'authenticated',
      }

      // Mock the Supabase client to return a valid user
      const mockSupabaseClient = {
        auth: {
          getUser: jest.fn().mockResolvedValue({
            data: { user: mockUser },
            error: null,
          }),
        },
        from: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: { role: 'client' },
          error: null,
        }),
      }

      // Temporarily mock the Supabase client
      jest.doMock('@/lib/supabase/server', () => ({
        getSupabaseServerClient: jest.fn(() => Promise.resolve(mockSupabaseClient)),
      }))

      const user = await getCurrentUser()
      expect(user).toEqual(mockUser)
    })

    it('handles authentication failure', async () => {
      const mockSupabaseClient = {
        auth: {
          getUser: jest.fn().mockResolvedValue({
            data: { user: null },
            error: { message: 'Invalid token' },
          }),
        },
      }

      jest.doMock('@/lib/supabase/server', () => ({
        getSupabaseServerClient: jest.fn(() => Promise.resolve(mockSupabaseClient)),
      }))

      const user = await getCurrentUser()
      expect(user).toBeNull()
    })
  })

  describe('Authorization Flow', () => {
    it('grants access to user with correct role', async () => {
      const mockUser = {
        id: 'test-user-id',
        email: 'client@example.com',
      }

      const mockSupabaseClient = {
        auth: {
          getUser: jest.fn().mockResolvedValue({
            data: { user: mockUser },
            error: null,
          }),
        },
        from: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: { role: 'client' },
          error: null,
        }),
      }

      jest.doMock('@/lib/supabase/server', () => ({
        getSupabaseServerClient: jest.fn(() => Promise.resolve(mockSupabaseClient)),
      }))

      const result = await requireRole('client')
      expect(result.user).toEqual(mockUser)
      expect(result.role).toBe('client')
      expect(redirect).not.toHaveBeenCalled()
    })

    it('denies access to user with incorrect role', async () => {
      const mockUser = {
        id: 'test-user-id',
        email: 'candidate@example.com',
      }

      const mockSupabaseClient = {
        auth: {
          getUser: jest.fn().mockResolvedValue({
            data: { user: mockUser },
            error: null,
          }),
        },
        from: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: { role: 'candidate' },
          error: null,
        }),
      }

      jest.doMock('@/lib/supabase/server', () => ({
        getSupabaseServerClient: jest.fn(() => Promise.resolve(mockSupabaseClient)),
      }))

      await requireRole('client')
      expect(redirect).toHaveBeenCalledWith('/')
    })

    it('handles multiple allowed roles correctly', async () => {
      const mockUser = {
        id: 'test-user-id',
        email: 'founding@example.com',
      }

      const mockSupabaseClient = {
        auth: {
          getUser: jest.fn().mockResolvedValue({
            data: { user: mockUser },
            error: null,
          }),
        },
        from: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: { role: 'founding_circle' },
          error: null,
        }),
      }

      jest.doMock('@/lib/supabase/server', () => ({
        getSupabaseServerClient: jest.fn(() => Promise.resolve(mockSupabaseClient)),
      }))

      const result = await requireRole(['client', 'founding_circle'])
      expect(result.user).toEqual(mockUser)
      expect(result.role).toBe('founding_circle')
      expect(redirect).not.toHaveBeenCalled()
    })
  })

  describe('Authentication Edge Cases', () => {
    it('handles missing user profile', async () => {
      const mockUser = {
        id: 'test-user-id',
        email: 'user@example.com',
      }

      const mockSupabaseClient = {
        auth: {
          getUser: jest.fn().mockResolvedValue({
            data: { user: mockUser },
            error: null,
          }),
        },
        from: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: null,
          error: { message: 'No profile found' },
        }),
      }

      jest.doMock('@/lib/supabase/server', () => ({
        getSupabaseServerClient: jest.fn(() => Promise.resolve(mockSupabaseClient)),
      }))

      await requireRole('client')
      expect(redirect).toHaveBeenCalledWith('/')
    })

    it('handles user with null role', async () => {
      const mockUser = {
        id: 'test-user-id',
        email: 'user@example.com',
      }

      const mockSupabaseClient = {
        auth: {
          getUser: jest.fn().mockResolvedValue({
            data: { user: mockUser },
            error: null,
          }),
        },
        from: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: { role: null },
          error: null,
        }),
      }

      jest.doMock('@/lib/supabase/server', () => ({
        getSupabaseServerClient: jest.fn(() => Promise.resolve(mockSupabaseClient)),
      }))

      await requireRole('client')
      expect(redirect).toHaveBeenCalledWith('/')
    })

    it('redirects to custom path when unauthorized', async () => {
      const mockUser = {
        id: 'test-user-id',
        email: 'user@example.com',
      }

      const mockSupabaseClient = {
        auth: {
          getUser: jest.fn().mockResolvedValue({
            data: { user: mockUser },
            error: null,
          }),
        },
        from: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: { role: 'candidate' },
          error: null,
        }),
      }

      jest.doMock('@/lib/supabase/server', () => ({
        getSupabaseServerClient: jest.fn(() => Promise.resolve(mockSupabaseClient)),
      }))

      await requireRole('client', '/unauthorized')
      expect(redirect).toHaveBeenCalledWith('/unauthorized')
    })
  })

  describe('Session Management', () => {
    it('handles expired session gracefully', async () => {
      const mockSupabaseClient = {
        auth: {
          getUser: jest.fn().mockResolvedValue({
            data: { user: null },
            error: { message: 'JWT expired' },
          }),
        },
      }

      jest.doMock('@/lib/supabase/server', () => ({
        getSupabaseServerClient: jest.fn(() => Promise.resolve(mockSupabaseClient)),
      }))

      await requireAuth()
      expect(redirect).toHaveBeenCalledWith('/login')
    })

    it('handles invalid token gracefully', async () => {
      const mockSupabaseClient = {
        auth: {
          getUser: jest.fn().mockResolvedValue({
            data: { user: null },
            error: { message: 'Invalid JWT' },
          }),
        },
      }

      jest.doMock('@/lib/supabase/server', () => ({
        getSupabaseServerClient: jest.fn(() => Promise.resolve(mockSupabaseClient)),
      }))

      const user = await getCurrentUser()
      expect(user).toBeNull()
    })
  })
})