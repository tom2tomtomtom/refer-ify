/**
 * @jest-environment jsdom
 */
import { GET } from '@/app/api/auth/route'
import { NextRequest } from 'next/server'

// Mock Supabase client
const mockSupabaseClient = {
  auth: {
    getUser: jest.fn(),
  },
}

jest.mock('@/lib/supabase/server', () => ({
  getSupabaseServerClient: jest.fn(() => Promise.resolve(mockSupabaseClient)),
}))

// Mock NextResponse for Next.js 15 compatibility
jest.mock('next/server', () => ({
  NextResponse: {
    json: jest.fn((data, options) => ({
      json: async () => data,
      status: options?.status || 200,
    })),
  },
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

      const response = await GET()
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.user).toEqual(mockUser)
    })

    it('returns user null when not authenticated', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: { message: 'Not authenticated' },
      })

      const response = await GET()
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.user).toBeNull()
    })

    it('handles errors gracefully', async () => {
      mockSupabaseClient.auth.getUser.mockRejectedValue(new Error('Database error'))

      const response = await GET()
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.user).toBeNull()
      expect(data.error).toBe('Database error')
    })
  })
})