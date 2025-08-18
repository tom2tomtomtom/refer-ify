import { POST, GET } from '@/app/api/payments/route'
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
  single: jest.fn(),
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

// Mock Stripe
const mockStripeInstance = {
  checkout: {
    sessions: {
      create: jest.fn(),
    },
  },
}

jest.mock('@/lib/stripe', () => ({
  getStripeServer: jest.fn(() => mockStripeInstance),
}))

describe('/api/payments', () => {
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

    // Reset Stripe mock to default implementation
    const mockGetStripeServer = require('@/lib/stripe').getStripeServer
    mockGetStripeServer.mockImplementation(() => mockStripeInstance)
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('POST /api/payments', () => {
    it('creates job posting payment session successfully', async () => {
      const mockSession = {
        id: 'cs_test_123',
        url: 'https://checkout.stripe.com/c/pay/cs_test_123',
      }

      mockStripeInstance.checkout.sessions.create.mockResolvedValue(mockSession)

      const requestBody = {
        type: 'job_posting',
        subscription_tier: 'connect',
        customerEmail: 'test@example.com',
        job_data: {
          title: 'Software Engineer',
          subscription_tier: 'connect'
        }
      }

      const request = new NextRequest('http://localhost:3000/api/payments', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.sessionId).toBe('cs_test_123')
      expect(data.url).toBe('https://checkout.stripe.com/c/pay/cs_test_123')
      expect(data.type).toBe('job_posting')
      
      expect(mockStripeInstance.checkout.sessions.create).toHaveBeenCalledWith({
        mode: 'payment',
        customer_email: 'test@example.com',
        line_items: [{
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Job Posting - Connect Plan',
              description: 'Post a job with connect tier features',
            },
            unit_amount: 50000,
          },
          quantity: 1,
        }],
        metadata: {
          type: 'job_posting',
          subscription_tier: 'connect',
          client_id: 'user-123',
          job_title: 'Software Engineer'
        },
        success_url: 'http://localhost:3000/client/jobs?payment=success',
        cancel_url: 'http://localhost:3000/client/post-job?payment=cancelled',
      })
    })

    it('creates subscription payment session successfully', async () => {
      const mockSession = {
        id: 'cs_test_456',
        url: 'https://checkout.stripe.com/c/pay/cs_test_456',
      }

      mockStripeInstance.checkout.sessions.create.mockResolvedValue(mockSession)

      const requestBody = {
        type: 'subscription',
        subscription_tier: 'priority',
        customerEmail: 'test@example.com'
      }

      const request = new NextRequest('http://localhost:3000/api/payments', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.sessionId).toBe('cs_test_456')
      expect(data.type).toBe('subscription')
      
      expect(mockStripeInstance.checkout.sessions.create).toHaveBeenCalledWith({
        mode: 'subscription',
        customer_email: 'test@example.com',
        line_items: [{
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Priority Plan',
              description: 'Monthly priority subscription',
            },
            unit_amount: 150000,
            recurring: {
              interval: 'month',
            },
          },
          quantity: 1,
        }],
        metadata: {
          type: 'subscription',
          subscription_tier: 'priority',
          client_id: 'user-123'
        },
        success_url: 'http://localhost:3000/client/billing?subscription=success',
        cancel_url: 'http://localhost:3000/client/billing?subscription=cancelled',
      })
    })

    it('validates subscription tier correctly', async () => {
      const requestBody = {
        type: 'job_posting',
        subscription_tier: 'invalid_tier',
        customerEmail: 'test@example.com',
        job_data: {
          title: 'Software Engineer'
        }
      }

      const request = new NextRequest('http://localhost:3000/api/payments', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Invalid subscription tier')
    })

    it('requires authentication', async () => {
      mockSupabaseInstance.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: new Error('Not authenticated')
      })

      const requestBody = {
        type: 'job_posting',
        subscription_tier: 'connect',
        customerEmail: 'test@example.com'
      }

      const request = new NextRequest('http://localhost:3000/api/payments', {
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

    it('handles invalid payment type', async () => {
      const requestBody = {
        type: 'invalid_type',
        subscription_tier: 'connect',
        customerEmail: 'test@example.com'
      }

      const request = new NextRequest('http://localhost:3000/api/payments', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Invalid payment type')
    })

    it('uses correct pricing for different tiers', async () => {
      const mockSession = { id: 'cs_test', url: 'https://checkout.stripe.com/test' }
      mockStripeInstance.checkout.sessions.create.mockResolvedValue(mockSession)

      // Test exclusive tier pricing
      const requestBody = {
        type: 'job_posting',
        subscription_tier: 'exclusive',
        customerEmail: 'test@example.com',
        job_data: { title: 'CEO Position' }
      }

      const request = new NextRequest('http://localhost:3000/api/payments', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: { 'Content-Type': 'application/json' },
      })

      await POST(request)

      expect(mockStripeInstance.checkout.sessions.create).toHaveBeenCalledWith(
        expect.objectContaining({
          line_items: [{
            price_data: expect.objectContaining({
              unit_amount: 300000, // $3000 for exclusive tier
            }),
            quantity: 1,
          }],
        })
      )
    })
  })

  describe('GET /api/payments', () => {
    it('returns subscription status for authenticated user', async () => {
      const mockSubscription = {
        id: 'sub-123',
        client_id: 'user-123',
        tier: 'priority',
        status: 'active',
        stripe_subscription_id: 'sub_stripe_123'
      }

      mockSupabaseQuery.single.mockResolvedValue({
        data: mockSubscription,
        error: null
      })

      const request = new NextRequest('http://localhost:3000/api/payments', {
        method: 'GET'
      })

      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.subscription).toEqual(mockSubscription)
      expect(data.has_active_subscription).toBe(true)
    })

    it('returns null when no active subscription exists', async () => {
      mockSupabaseQuery.single.mockResolvedValue({
        data: null,
        error: { code: 'PGRST116' } // No rows found
      })

      const request = new NextRequest('http://localhost:3000/api/payments', {
        method: 'GET'
      })

      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.subscription).toBe(null)
      expect(data.has_active_subscription).toBe(false)
    })

    it('requires authentication for GET requests', async () => {
      mockSupabaseInstance.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: new Error('Not authenticated')
      })

      const request = new NextRequest('http://localhost:3000/api/payments', {
        method: 'GET'
      })

      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error).toBe('Unauthorized')
    })
  })
})