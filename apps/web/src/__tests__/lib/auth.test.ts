import { getCurrentUser, requireAuth, requireRole } from '@/lib/auth'
import { redirect } from 'next/navigation'

const mockSupabaseClient = {
  auth: {
    getUser: jest.fn(),
  },
  from: jest.fn().mockReturnThis(),
  select: jest.fn().mockReturnThis(),
  eq: jest.fn().mockReturnThis(),
  single: jest.fn(),
}

jest.mock('@/lib/supabase/server', () => ({
  getSupabaseServerClient: jest.fn(() => Promise.resolve(mockSupabaseClient)),
}))

jest.mock('next/navigation', () => ({
  redirect: jest.fn(),
}))

describe('Auth Utils', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('getCurrentUser', () => {
    it('returns user when authentication succeeds', async () => {
      const mockUser = { id: 'user123', email: 'test@example.com' }
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      })

      const result = await getCurrentUser()

      expect(result).toEqual(mockUser)
    })

    it('returns null when authentication fails', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: { message: 'Invalid token' },
      })

      const result = await getCurrentUser()

      expect(result).toBeNull()
    })

    it('returns null when user is null', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null,
      })

      const result = await getCurrentUser()

      expect(result).toBeNull()
    })
  })

  describe('requireAuth', () => {
    it('returns user when authenticated', async () => {
      const mockUser = { id: 'user123', email: 'test@example.com' }
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      })

      const result = await requireAuth()

      expect(result).toEqual(mockUser)
      expect(redirect).not.toHaveBeenCalled()
    })

    it('redirects to default login page when not authenticated', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null,
      })

      await requireAuth()

      expect(redirect).toHaveBeenCalledWith('/login')
    })

    it('redirects to custom path when not authenticated', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null,
      })

      await requireAuth('/custom-login')

      expect(redirect).toHaveBeenCalledWith('/custom-login')
    })

    it('redirects when authentication error occurs', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: { message: 'Token expired' },
      })

      await requireAuth()

      expect(redirect).toHaveBeenCalledWith('/login')
    })
  })

  describe('requireRole', () => {
    it('returns user and role when user has required role', async () => {
      const mockUser = { id: 'user123', email: 'test@example.com' }
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      })

      mockSupabaseClient.single.mockResolvedValue({
        data: { role: 'client' },
        error: null,
      })

      const result = await requireRole('client')

      expect(result.user).toEqual(mockUser)
      expect(result.role).toBe('client')
      expect(redirect).not.toHaveBeenCalled()
    })

    it('works with array of roles', async () => {
      const mockUser = { id: 'user123', email: 'test@example.com' }
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      })

      mockSupabaseClient.single.mockResolvedValue({
        data: { role: 'candidate' },
        error: null,
      })

      const result = await requireRole(['client', 'candidate'])

      expect(result.user).toEqual(mockUser)
      expect(result.role).toBe('candidate')
      expect(redirect).not.toHaveBeenCalled()
    })

    it('redirects when user does not have required role', async () => {
      const mockUser = { id: 'user123', email: 'test@example.com' }
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      })

      mockSupabaseClient.single.mockResolvedValue({
        data: { role: 'candidate' },
        error: null,
      })

      await requireRole('client')

      expect(redirect).toHaveBeenCalledWith('/')
    })

    it('redirects to custom path when role check fails', async () => {
      const mockUser = { id: 'user123', email: 'test@example.com' }
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      })

      mockSupabaseClient.single.mockResolvedValue({
        data: { role: 'candidate' },
        error: null,
      })

      await requireRole('client', '/unauthorized')

      expect(redirect).toHaveBeenCalledWith('/unauthorized')
    })

    it('redirects when user profile is not found', async () => {
      const mockUser = { id: 'user123', email: 'test@example.com' }
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      })

      mockSupabaseClient.single.mockResolvedValue({
        data: null,
        error: { message: 'Profile not found' },
      })

      await requireRole('client')

      expect(redirect).toHaveBeenCalledWith('/')
    })

    it('redirects when user profile has no role', async () => {
      const mockUser = { id: 'user123', email: 'test@example.com' }
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      })

      mockSupabaseClient.single.mockResolvedValue({
        data: { role: null },
        error: null,
      })

      await requireRole('client')

      expect(redirect).toHaveBeenCalledWith('/')
    })

    it('calls requireAuth first (redirects when not authenticated)', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null,
      })

      await requireRole('client')

      expect(redirect).toHaveBeenCalledWith('/login')
      // Profile query should not be called if user is not authenticated
      expect(mockSupabaseClient.from).not.toHaveBeenCalled()
    })

    it('queries correct profile table and fields', async () => {
      const mockUser = { id: 'user123', email: 'test@example.com' }
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      })

      mockSupabaseClient.single.mockResolvedValue({
        data: { role: 'client' },
        error: null,
      })

      await requireRole('client')

      expect(mockSupabaseClient.from).toHaveBeenCalledWith('profiles')
      expect(mockSupabaseClient.select).toHaveBeenCalledWith('role')
      expect(mockSupabaseClient.eq).toHaveBeenCalledWith('id', 'user123')
    })

    it('works with founding_circle role', async () => {
      const mockUser = { id: 'user123', email: 'test@example.com' }
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      })

      mockSupabaseClient.single.mockResolvedValue({
        data: { role: 'founding_circle' },
        error: null,
      })

      const result = await requireRole('founding_circle')

      expect(result.user).toEqual(mockUser)
      expect(result.role).toBe('founding_circle')
      expect(redirect).not.toHaveBeenCalled()
    })

    it('handles multiple roles correctly', async () => {
      const mockUser = { id: 'user123', email: 'test@example.com' }
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      })

      mockSupabaseClient.single.mockResolvedValue({
        data: { role: 'founding_circle' },
        error: null,
      })

      const result = await requireRole(['client', 'candidate', 'founding_circle'])

      expect(result.user).toEqual(mockUser)
      expect(result.role).toBe('founding_circle')
      expect(redirect).not.toHaveBeenCalled()
    })
  })
})