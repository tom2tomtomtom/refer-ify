import { GET, POST } from '@/app/api/auth/route'
import { NextRequest } from 'next/server'

// Mock Supabase client
const mockSupabaseClient = {
  auth: {
    signInWithOAuth: jest.fn(),
    signOut: jest.fn(),
    getUser: jest.fn(),
  },
  from: jest.fn().mockReturnThis(),
  select: jest.fn().mockReturnThis(),
  eq: jest.fn().mockReturnThis(),
  single: jest.fn(),
  insert: jest.fn().mockReturnThis(),
}

jest.mock('@/lib/supabase/server', () => ({
  getSupabaseServerClient: jest.fn(() => Promise.resolve(mockSupabaseClient)),
}))

describe('/api/auth', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('GET /api/auth', () => {
    it('returns current user when authenticated', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        user_metadata: { full_name: 'Test User' },
      }

      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      })

      mockSupabaseClient.single.mockResolvedValue({
        data: { role: 'client', full_name: 'Test User' },
        error: null,
      })

      const request = new NextRequest('http://localhost:3000/api/auth')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.user).toEqual(mockUser)
      expect(data.profile.role).toBe('client')
    })

    it('returns 401 when not authenticated', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: { message: 'Not authenticated' },
      })

      const request = new NextRequest('http://localhost:3000/api/auth')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error).toBe('Unauthorized')
    })

    it('returns 404 when user profile not found', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
      }

      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      })

      mockSupabaseClient.single.mockResolvedValue({
        data: null,
        error: { message: 'Profile not found' },
      })

      const request = new NextRequest('http://localhost:3000/api/auth')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(404)
      expect(data.error).toBe('Profile not found')
    })
  })

  describe('POST /api/auth', () => {
    it('creates user profile successfully', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        user_metadata: { full_name: 'Test User' },
      }

      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      })

      mockSupabaseClient.single.mockResolvedValue({
        data: {
          id: 'user-123',
          email: 'test@example.com',
          role: 'client',
          full_name: 'Test User',
        },
        error: null,
      })

      const requestBody = {
        role: 'client',
        full_name: 'Test User',
      }

      const request = new NextRequest('http://localhost:3000/api/auth', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(201)
      expect(data.profile.role).toBe('client')
      expect(data.profile.full_name).toBe('Test User')
    })

    it('returns 401 when not authenticated', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: { message: 'Not authenticated' },
      })

      const requestBody = {
        role: 'client',
        full_name: 'Test User',
      }

      const request = new NextRequest('http://localhost:3000/api/auth', {
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

    it('returns 400 when required fields are missing', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
      }

      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      })

      const requestBody = {
        // Missing role and full_name
      }

      const request = new NextRequest('http://localhost:3000/api/auth', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Role and full name are required')
    })

    it('returns 400 for invalid role', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
      }

      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      })

      const requestBody = {
        role: 'invalid_role',
        full_name: 'Test User',
      }

      const request = new NextRequest('http://localhost:3000/api/auth', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Invalid role')
    })

    it('handles database errors gracefully', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
      }

      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      })

      mockSupabaseClient.single.mockResolvedValue({
        data: null,
        error: { message: 'Database error' },
      })

      const requestBody = {
        role: 'client',
        full_name: 'Test User',
      }

      const request = new NextRequest('http://localhost:3000/api/auth', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('Database error')
    })

    it('prevents duplicate profile creation', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
      }

      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      })

      // First call - profile exists
      mockSupabaseClient.single
        .mockResolvedValueOnce({
          data: { role: 'client', full_name: 'Existing User' },
          error: null,
        })

      const requestBody = {
        role: 'client',
        full_name: 'Test User',
      }

      const request = new NextRequest('http://localhost:3000/api/auth', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(409)
      expect(data.error).toBe('Profile already exists')
    })
  })
})