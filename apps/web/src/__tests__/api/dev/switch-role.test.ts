import { POST } from '@/app/api/dev/switch-role/route'
import { NextRequest } from 'next/server'

// Mock NextResponse for Next.js 15 compatibility
jest.mock('next/server', () => ({
  NextRequest: jest.requireActual('next/server').NextRequest,
  NextResponse: {
    json: jest.fn((data, options) => ({
      json: async () => data,
      status: options?.status || 200,
    })),
  },
}))

// Mock Supabase client
const mockSupabaseClient = {
  auth: {
    getUser: jest.fn(),
  },
  from: jest.fn().mockReturnThis(),
  update: jest.fn().mockReturnThis(),
  eq: jest.fn().mockReturnThis(),
  match: jest.fn().mockReturnThis(),
  select: jest.fn().mockReturnThis(),
  single: jest.fn(),
}

jest.mock('@/lib/supabase/server', () => ({
  getSupabaseServerClient: jest.fn(() => Promise.resolve(mockSupabaseClient)),
}))

describe('/api/dev/switch-role', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  afterEach(() => {
    delete process.env.NEXT_PUBLIC_DEV_SUPERUSER_EMAIL
  })

  describe('POST /api/dev/switch-role', () => {
    it('switches role successfully for authorized superuser', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'dev@example.com',
      }

      const mockUpdatedProfile = {
        id: 'user-123',
        role: 'founding_circle',
      }

      process.env.NEXT_PUBLIC_DEV_SUPERUSER_EMAIL = 'dev@example.com'

      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      })

      mockSupabaseClient.single.mockResolvedValue({
        data: mockUpdatedProfile,
        error: null,
      })

      const requestBody = {
        role: 'founding_circle',
      }

      const request = new NextRequest('http://localhost:3000/api/dev/switch-role', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.profile).toEqual(mockUpdatedProfile)

      expect(mockSupabaseClient.from).toHaveBeenCalledWith('profiles')
      expect(mockSupabaseClient.update).toHaveBeenCalledWith({ role: 'founding_circle' })
      expect(mockSupabaseClient.eq).toHaveBeenCalledWith('id', 'user-123')
      expect(mockSupabaseClient.select).toHaveBeenCalledWith('id, role')
      expect(mockSupabaseClient.single).toHaveBeenCalled()
    })

    it('returns 401 when user is not authenticated', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: { message: 'Not authenticated' },
      })

      const requestBody = {
        role: 'client',
      }

      const request = new NextRequest('http://localhost:3000/api/dev/switch-role', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error).toBe('Unauthorized')
    })

    it('returns 403 when NEXT_PUBLIC_DEV_SUPERUSER_EMAIL is not set', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'regular@example.com',
      }

      // Don't set the environment variable
      delete process.env.NEXT_PUBLIC_DEV_SUPERUSER_EMAIL

      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      })

      const requestBody = {
        role: 'client',
      }

      const request = new NextRequest('http://localhost:3000/api/dev/switch-role', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(403)
      expect(data.error).toBe('Forbidden')
    })

    it('returns 403 when user email does not match superuser email', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'regular@example.com',
      }

      process.env.NEXT_PUBLIC_DEV_SUPERUSER_EMAIL = 'dev@example.com'

      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      })

      const requestBody = {
        role: 'client',
      }

      const request = new NextRequest('http://localhost:3000/api/dev/switch-role', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(403)
      expect(data.error).toBe('Forbidden')
    })

    it('returns 400 when role is missing', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'dev@example.com',
      }

      process.env.NEXT_PUBLIC_DEV_SUPERUSER_EMAIL = 'dev@example.com'

      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      })

      const requestBody = {}

      const request = new NextRequest('http://localhost:3000/api/dev/switch-role', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('role is required')
    })

    it('returns 500 when database update fails', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'dev@example.com',
      }

      process.env.NEXT_PUBLIC_DEV_SUPERUSER_EMAIL = 'dev@example.com'

      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      })

      mockSupabaseClient.single.mockResolvedValue({
        data: null,
        error: { message: 'Database update failed' },
      })

      const requestBody = {
        role: 'client',
      }

      const request = new NextRequest('http://localhost:3000/api/dev/switch-role', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('Database update failed')
    })

    it('switches to different role types', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'dev@example.com',
      }

      process.env.NEXT_PUBLIC_DEV_SUPERUSER_EMAIL = 'dev@example.com'

      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      })

      const roles = ['founding_circle', 'select_circle', 'client', 'candidate']

      for (const role of roles) {
        const mockUpdatedProfile = {
          id: 'user-123',
          role: role,
        }

        mockSupabaseClient.single.mockResolvedValueOnce({
          data: mockUpdatedProfile,
          error: null,
        })

        const requestBody = { role }

        const request = new NextRequest('http://localhost:3000/api/dev/switch-role', {
          method: 'POST',
          body: JSON.stringify(requestBody),
          headers: {
            'Content-Type': 'application/json',
          },
        })

        const response = await POST(request)
        const data = await response.json()

        expect(response.status).toBe(200)
        expect(data.profile.role).toBe(role)
      }
    })

    it('handles JSON parsing errors', async () => {
      const request = new NextRequest('http://localhost:3000/api/dev/switch-role', {
        method: 'POST',
        body: 'invalid json',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      await expect(POST(request)).rejects.toThrow()
    })

    it('handles empty role string', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'dev@example.com',
      }

      process.env.NEXT_PUBLIC_DEV_SUPERUSER_EMAIL = 'dev@example.com'

      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      })

      const requestBody = {
        role: '',
      }

      const request = new NextRequest('http://localhost:3000/api/dev/switch-role', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('role is required')
    })
  })
})