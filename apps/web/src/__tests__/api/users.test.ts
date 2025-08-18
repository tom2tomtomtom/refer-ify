import { GET } from '@/app/api/users/route'
import { NextRequest } from 'next/server'

// Mock Supabase client
const mockSupabaseClient = {
  from: jest.fn().mockReturnThis(),
  select: jest.fn(),
}

jest.mock('@/lib/supabase/server', () => ({
  getSupabaseServerClient: jest.fn(() => Promise.resolve(mockSupabaseClient)),
}))

describe('/api/users', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('GET /api/users', () => {
    it('returns all user profiles', async () => {
      const mockProfiles = [
        {
          id: 'user-1',
          email: 'user1@example.com',
          role: 'client',
          full_name: 'User One',
        },
        {
          id: 'user-2',
          email: 'user2@example.com',
          role: 'candidate',
          full_name: 'User Two',
        },
      ]

      mockSupabaseClient.select.mockResolvedValue({
        data: mockProfiles,
        error: null,
      })

      const response = await GET()
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.profiles).toEqual(mockProfiles)
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('profiles')
      expect(mockSupabaseClient.select).toHaveBeenCalledWith('*')
    })

    it('returns empty array when no profiles exist', async () => {
      mockSupabaseClient.select.mockResolvedValue({
        data: [],
        error: null,
      })

      const response = await GET()
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.profiles).toEqual([])
    })

    it('returns 500 when database error occurs', async () => {
      mockSupabaseClient.select.mockResolvedValue({
        data: null,
        error: { message: 'Database connection failed' },
      })

      const response = await GET()
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('Database connection failed')
    })

    it('handles Supabase client creation errors', async () => {
      const mockGetSupabaseServerClient = require('@/lib/supabase/server').getSupabaseServerClient
      mockGetSupabaseServerClient.mockRejectedValueOnce(new Error('Failed to create client'))

      await expect(GET()).rejects.toThrow('Failed to create client')
    })

    it('returns profiles with correct data structure', async () => {
      const mockProfile = {
        id: 'user-1',
        email: 'user1@example.com',
        role: 'founding_circle',
        full_name: 'John Doe',
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2023-01-01T00:00:00Z',
      }

      mockSupabaseClient.select.mockResolvedValue({
        data: [mockProfile],
        error: null,
      })

      const response = await GET()
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.profiles).toHaveLength(1)
      expect(data.profiles[0]).toEqual(mockProfile)
      expect(data.profiles[0]).toHaveProperty('id')
      expect(data.profiles[0]).toHaveProperty('email')
      expect(data.profiles[0]).toHaveProperty('role')
      expect(data.profiles[0]).toHaveProperty('full_name')
    })

    it('handles null data response', async () => {
      mockSupabaseClient.select.mockResolvedValue({
        data: null,
        error: null,
      })

      const response = await GET()
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.profiles).toBeNull()
    })
  })
})