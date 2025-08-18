import { GET } from '@/app/api/billing/transactions/route'
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
  order: jest.fn().mockReturnThis(),
  range: jest.fn().mockResolvedValue({ data: [], error: null }),
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

describe('/api/billing/transactions', () => {
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

  describe('GET /api/billing/transactions', () => {
    it('returns transaction history for authenticated user', async () => {
      const mockTransactions = [
        {
          id: 'txn-1',
          client_id: 'user-123',
          amount: 50000,
          currency: 'usd',
          type: 'job_posting',
          subscription_tier: 'connect',
          status: 'completed',
          created_at: '2025-08-18T10:00:00Z',
          metadata: { job_title: 'Software Engineer' }
        },
        {
          id: 'txn-2',
          client_id: 'user-123', 
          amount: 150000,
          currency: 'usd',
          type: 'subscription',
          subscription_tier: 'priority',
          status: 'completed',
          created_at: '2025-08-17T10:00:00Z',
          metadata: null
        }
      ]

      mockSupabaseQuery.range.mockResolvedValue({
        data: mockTransactions,
        error: null
      })

      const request = new NextRequest('http://localhost:3000/api/billing/transactions', {
        method: 'GET'
      })

      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.transactions).toEqual(mockTransactions)
      expect(data.count).toBe(2)
    })

    it('handles pagination with limit and offset', async () => {
      const mockTransactions = [
        {
          id: 'txn-3',
          client_id: 'user-123',
          amount: 300000,
          currency: 'usd',
          type: 'job_posting',
          subscription_tier: 'exclusive',
          status: 'completed',
          created_at: '2025-08-16T10:00:00Z'
        }
      ]

      mockSupabaseQuery.range.mockResolvedValue({
        data: mockTransactions,
        error: null
      })

      const request = new NextRequest(
        'http://localhost:3000/api/billing/transactions?limit=10&offset=20',
        { method: 'GET' }
      )

      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(mockSupabaseQuery.range).toHaveBeenCalledWith(20, 29)
    })

    it('returns empty array when no transactions exist', async () => {
      mockSupabaseQuery.range.mockResolvedValue({
        data: [],
        error: null
      })

      const request = new NextRequest('http://localhost:3000/api/billing/transactions', {
        method: 'GET'
      })

      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.transactions).toEqual([])
      expect(data.count).toBe(0)
    })

    it('requires authentication', async () => {
      mockSupabaseInstance.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: new Error('Not authenticated')
      })

      const request = new NextRequest('http://localhost:3000/api/billing/transactions', {
        method: 'GET'
      })

      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error).toBe('Unauthorized')
    })

    it('handles database errors gracefully', async () => {
      mockSupabaseQuery.range.mockResolvedValue({
        data: null,
        error: new Error('Database connection failed')
      })

      const request = new NextRequest('http://localhost:3000/api/billing/transactions', {
        method: 'GET'
      })

      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('Failed to fetch transactions')
    })

    it('filters by client_id to ensure user isolation', async () => {
      const request = new NextRequest('http://localhost:3000/api/billing/transactions', {
        method: 'GET'
      })

      await GET(request)

      expect(mockSupabaseInstance.from).toHaveBeenCalledWith('payment_transactions')
      expect(mockSupabaseQuery.eq).toHaveBeenCalledWith('client_id', 'user-123')
    })
  })
})