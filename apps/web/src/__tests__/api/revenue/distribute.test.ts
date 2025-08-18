import { POST, GET } from '@/app/api/revenue/distribute/route'
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

// Mock Supabase
const mockSupabaseQuery = {
  select: jest.fn().mockReturnThis(),
  eq: jest.fn().mockReturnThis(),
  or: jest.fn().mockReturnThis(),
  order: jest.fn().mockReturnThis(),
  insert: jest.fn().mockReturnThis(),
  update: jest.fn().mockReturnThis(),
  single: jest.fn(),
  limit: jest.fn().mockReturnThis(),
}

const mockSupabaseInstance = {
  auth: {
    getUser: jest.fn(),
  },
  from: jest.fn(() => mockSupabaseQuery),
}

jest.mock('@/lib/supabase/server', () => ({
  getSupabaseServerClient: jest.fn(() => Promise.resolve(mockSupabaseInstance)),
}))

describe('/api/revenue/distribute', () => {
  const mockUser = {
    id: 'user-123',
    email: 'test@example.com'
  }

  beforeEach(() => {
    jest.clearAllMocks()
    
    // Setup default Supabase auth mock
    mockSupabaseInstance.auth.getUser.mockResolvedValue({
      data: { user: mockUser },
      error: null
    })
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('POST /api/revenue/distribute', () => {
    it('calculates revenue distribution correctly', async () => {
      const mockReferral = {
        id: 'referral-123',
        referrer_id: 'referrer-456',
        jobs: { client_id: 'client-789' }
      }

      const mockReferrer = {
        id: 'referrer-456',
        role: 'select_circle'
      }

      const mockFoundingMember = {
        id: 'founding-123',
        role: 'founding_circle'
      }

      const mockDistribution = {
        id: 'dist-123',
        referral_id: 'referral-123',
        placement_fee: 10000,
        platform_share: 4500,
        select_share: 4000,
        founding_share: 1500
      }

      // Mock database calls
      mockSupabaseQuery.single
        .mockResolvedValueOnce({ data: mockReferral, error: null })
        .mockResolvedValueOnce({ data: mockReferrer, error: null })
        .mockResolvedValueOnce({ data: mockFoundingMember, error: null })
        .mockResolvedValueOnce({ data: mockDistribution, error: null })

      mockSupabaseQuery.insert.mockResolvedValue({
        data: mockDistribution,
        error: null
      })

      mockSupabaseQuery.update.mockResolvedValue({
        data: { id: 'referral-123' },
        error: null
      })

      const requestBody = {
        referral_id: 'referral-123',
        placement_fee: 10000,
        currency: 'USD'
      }

      const request = new NextRequest('http://localhost:3000/api/revenue/distribute', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: { 'Content-Type': 'application/json' },
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.distribution).toMatchObject({
        total_fee: 10000,
        currency: 'USD',
        breakdown: {
          platform: { amount: 4500, percentage: 45 },
          select: { amount: 4000, percentage: 40 },
          founding: { amount: 1500, percentage: 15 }
        }
      })
    })

    it('validates required parameters', async () => {
      const requestBody = {
        referral_id: 'referral-123'
        // Missing placement_fee
      }

      const request = new NextRequest('http://localhost:3000/api/revenue/distribute', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: { 'Content-Type': 'application/json' },
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Referral ID and placement fee are required')
    })

    it('handles non-existent referral', async () => {
      mockSupabaseQuery.single.mockResolvedValue({
        data: null,
        error: new Error('No referral found')
      })

      const requestBody = {
        referral_id: 'non-existent',
        placement_fee: 10000
      }

      const request = new NextRequest('http://localhost:3000/api/revenue/distribute', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: { 'Content-Type': 'application/json' },
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(404)
      expect(data.error).toBe('Referral not found')
    })

    it('requires authentication', async () => {
      mockSupabaseInstance.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: new Error('Not authenticated')
      })

      const requestBody = {
        referral_id: 'referral-123',
        placement_fee: 10000
      }

      const request = new NextRequest('http://localhost:3000/api/revenue/distribute', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: { 'Content-Type': 'application/json' },
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error).toBe('Unauthorized')
    })

    it('handles different member role assignments correctly', async () => {
      const mockReferral = {
        id: 'referral-123',
        referrer_id: 'founding-member-456',
        jobs: { client_id: 'client-789' }
      }

      const mockFoundingReferrer = {
        id: 'founding-member-456',
        role: 'founding_circle'
      }

      const mockSelectMember = {
        id: 'select-123',
        role: 'select_circle'
      }

      mockSupabaseQuery.single
        .mockResolvedValueOnce({ data: mockReferral, error: null })
        .mockResolvedValueOnce({ data: mockFoundingReferrer, error: null })
        .mockResolvedValueOnce({ data: mockSelectMember, error: null })

      const mockDistribution = {
        id: 'dist-123',
        founding_member_id: 'founding-member-456',
        select_member_id: 'select-123'
      }

      mockSupabaseQuery.insert.mockResolvedValue({
        data: mockDistribution,
        error: null
      })

      mockSupabaseQuery.update.mockResolvedValue({
        data: { id: 'referral-123' },
        error: null
      })

      const requestBody = {
        referral_id: 'referral-123',
        placement_fee: 10000
      }

      const request = new NextRequest('http://localhost:3000/api/revenue/distribute', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: { 'Content-Type': 'application/json' },
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.distribution.breakdown.founding.member_id).toBe('founding-member-456')
      expect(data.distribution.breakdown.select.member_id).toBe('select-123')
    })
  })

  describe('GET /api/revenue/distribute', () => {
    it('returns revenue distributions for user', async () => {
      const mockDistributions = [
        {
          id: 'dist-1',
          referral_id: 'ref-1',
          placement_fee: 10000,
          platform_share: 4500,
          select_share: 4000,
          founding_share: 1500,
          status: 'calculated',
          created_at: '2025-08-18T10:00:00Z',
          referrals: {
            candidate_email: 'candidate@example.com',
            jobs: { title: 'Software Engineer', client_id: 'client-1' }
          }
        }
      ]

      mockSupabaseQuery.order.mockResolvedValue({
        data: mockDistributions,
        error: null
      })

      const request = new NextRequest('http://localhost:3000/api/revenue/distribute', {
        method: 'GET'
      })

      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.distributions).toEqual(mockDistributions)
      expect(data.count).toBe(1)
    })

    it('filters by status when provided', async () => {
      mockSupabaseQuery.order.mockResolvedValue({
        data: [],
        error: null
      })

      const request = new NextRequest(
        'http://localhost:3000/api/revenue/distribute?status=paid',
        { method: 'GET' }
      )

      await GET(request)

      expect(mockSupabaseQuery.eq).toHaveBeenCalledWith('status', 'paid')
    })

    it('requires authentication', async () => {
      mockSupabaseInstance.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: new Error('Not authenticated')
      })

      const request = new NextRequest('http://localhost:3000/api/revenue/distribute', {
        method: 'GET'
      })

      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error).toBe('Unauthorized')
    })

    it('filters distributions by user membership', async () => {
      const request = new NextRequest('http://localhost:3000/api/revenue/distribute', {
        method: 'GET'
      })

      await GET(request)

      expect(mockSupabaseQuery.or).toHaveBeenCalledWith(
        `founding_member_id.eq.${mockUser.id},select_member_id.eq.${mockUser.id}`
      )
    })
  })
})