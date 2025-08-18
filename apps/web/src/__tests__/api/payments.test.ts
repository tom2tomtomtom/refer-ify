import { POST } from '@/app/api/payments/route'
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
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('POST /api/payments', () => {
    it('creates checkout session successfully', async () => {
      const mockSession = {
        id: 'cs_test_123',
        url: 'https://checkout.stripe.com/c/pay/cs_test_123',
      }

      mockStripeInstance.checkout.sessions.create.mockResolvedValue(mockSession)

      const requestBody = {
        priceId: 'price_123',
        customerEmail: 'customer@example.com',
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
      expect(data.id).toBe('cs_test_123')
      expect(data.url).toBe('https://checkout.stripe.com/c/pay/cs_test_123')
      
      expect(mockStripeInstance.checkout.sessions.create).toHaveBeenCalledWith({
        mode: 'subscription',
        customer_email: 'customer@example.com',
        line_items: [{ price: 'price_123', quantity: 1 }],
        success_url: 'http://localhost:3000/?success=1',
        cancel_url: 'http://localhost:3000/?canceled=1',
      })
    })

    it('uses NEXT_PUBLIC_BASE_URL when available', async () => {
      const originalBaseUrl = process.env.NEXT_PUBLIC_BASE_URL
      process.env.NEXT_PUBLIC_BASE_URL = 'https://refer-ify.com'

      const mockSession = {
        id: 'cs_test_123',
        url: 'https://checkout.stripe.com/c/pay/cs_test_123',
      }

      mockStripeInstance.checkout.sessions.create.mockResolvedValue(mockSession)

      const requestBody = {
        priceId: 'price_123',
        customerEmail: 'customer@example.com',
      }

      const request = new NextRequest('http://localhost:3000/api/payments', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: {
          'Content-Type': 'application/json',
        },
      })

      await POST(request)

      expect(mockStripeInstance.checkout.sessions.create).toHaveBeenCalledWith({
        mode: 'subscription',
        customer_email: 'customer@example.com',
        line_items: [{ price: 'price_123', quantity: 1 }],
        success_url: 'https://refer-ify.com/?success=1',
        cancel_url: 'https://refer-ify.com/?canceled=1',
      })

      // Restore environment variable
      process.env.NEXT_PUBLIC_BASE_URL = originalBaseUrl
    })

    it('handles Stripe errors gracefully', async () => {
      const stripeError = new Error('Invalid price ID')
      mockStripeInstance.checkout.sessions.create.mockRejectedValue(stripeError)

      const requestBody = {
        priceId: 'invalid_price',
        customerEmail: 'customer@example.com',
      }

      const request = new NextRequest('http://localhost:3000/api/payments', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: {
          'Content-Type': 'application/json',
        },
      })

      await expect(POST(request)).rejects.toThrow('Invalid price ID')
    })

    it('handles missing request body gracefully', async () => {
      const request = new NextRequest('http://localhost:3000/api/payments', {
        method: 'POST',
        body: JSON.stringify({}),
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const mockSession = {
        id: 'cs_test_123',
        url: 'https://checkout.stripe.com/c/pay/cs_test_123',
      }

      mockStripeInstance.checkout.sessions.create.mockResolvedValue(mockSession)

      await POST(request)

      expect(mockStripeInstance.checkout.sessions.create).toHaveBeenCalledWith({
        mode: 'subscription',
        customer_email: undefined,
        line_items: [{ price: undefined, quantity: 1 }],
        success_url: 'http://localhost:3000/?success=1',
        cancel_url: 'http://localhost:3000/?canceled=1',
      })
    })

    it('handles JSON parsing errors', async () => {
      const request = new NextRequest('http://localhost:3000/api/payments', {
        method: 'POST',
        body: 'invalid json',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      await expect(POST(request)).rejects.toThrow()
    })

    it('handles Stripe configuration errors', async () => {
      const mockGetStripeServer = require('@/lib/stripe').getStripeServer
      mockGetStripeServer.mockImplementation(() => {
        throw new Error('Missing STRIPE_SECRET_KEY')
      })

      const requestBody = {
        priceId: 'price_123',
        customerEmail: 'customer@example.com',
      }

      const request = new NextRequest('http://localhost:3000/api/payments', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: {
          'Content-Type': 'application/json',
        },
      })

      await expect(POST(request)).rejects.toThrow('Missing STRIPE_SECRET_KEY')
    })

    it('creates session with correct subscription mode', async () => {
      const mockSession = {
        id: 'cs_test_123',
        url: 'https://checkout.stripe.com/c/pay/cs_test_123',
      }

      mockStripeInstance.checkout.sessions.create.mockResolvedValue(mockSession)

      const requestBody = {
        priceId: 'price_premium_monthly',
        customerEmail: 'premium@example.com',
      }

      const request = new NextRequest('http://localhost:3000/api/payments', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: {
          'Content-Type': 'application/json',
        },
      })

      await POST(request)

      const createCall = mockStripeInstance.checkout.sessions.create.mock.calls[0][0]
      expect(createCall.mode).toBe('subscription')
      expect(createCall.line_items).toHaveLength(1)
      expect(createCall.line_items[0].quantity).toBe(1)
      expect(createCall.line_items[0].price).toBe('price_premium_monthly')
    })
  })
})