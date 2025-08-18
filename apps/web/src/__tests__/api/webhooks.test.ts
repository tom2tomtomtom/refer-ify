import { POST } from '@/app/api/webhooks/route'
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

// Mock Next.js headers
jest.mock('next/headers', () => ({
  headers: jest.fn(),
}))

// Mock Stripe
const mockStripeInstance = {
  webhooks: {
    constructEvent: jest.fn(),
  },
}

jest.mock('@/lib/stripe', () => ({
  getStripeServer: jest.fn(() => mockStripeInstance),
}))

const mockHeaders = require('next/headers').headers

describe('/api/webhooks', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    
    // Mock environment variable
    process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test_secret'
  })

  afterEach(() => {
    delete process.env.STRIPE_WEBHOOK_SECRET
  })

  describe('POST /api/webhooks', () => {
    it('processes webhook event successfully', async () => {
      const mockEvent = {
        type: 'checkout.session.completed',
        id: 'evt_test_123',
        data: {
          object: {
            id: 'cs_test_123',
            customer_email: 'customer@example.com',
          },
        },
      }

      mockHeaders.mockResolvedValue({
        get: jest.fn((header) => {
          if (header === 'stripe-signature') {
            return 'v1=signature_value,t=timestamp'
          }
          return null
        }),
      })

      mockStripeInstance.webhooks.constructEvent.mockReturnValue(mockEvent)

      const request = new NextRequest('http://localhost:3000/api/webhooks', {
        method: 'POST',
        body: JSON.stringify({ test: 'payload' }),
        headers: {
          'Content-Type': 'application/json',
          'stripe-signature': 'v1=signature_value,t=timestamp',
        },
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.received).toBe(true)
      expect(mockStripeInstance.webhooks.constructEvent).toHaveBeenCalledWith(
        JSON.stringify({ test: 'payload' }),
        'v1=signature_value,t=timestamp',
        'whsec_test_secret'
      )
    })

    it('returns 401 when webhook secret is missing', async () => {
      delete process.env.STRIPE_WEBHOOK_SECRET

      mockHeaders.mockResolvedValue({
        get: jest.fn(() => 'v1=signature_value,t=timestamp'),
      })

      const request = new NextRequest('http://localhost:3000/api/webhooks', {
        method: 'POST',
        body: 'test payload',
        headers: {
          'stripe-signature': 'v1=signature_value,t=timestamp',
        },
      })

      const response = await POST(request)

      expect(response.status).toBe(401)
    })

    it('returns 401 when signature is missing', async () => {
      mockHeaders.mockResolvedValue({
        get: jest.fn(() => null),
      })

      const request = new NextRequest('http://localhost:3000/api/webhooks', {
        method: 'POST',
        body: 'test payload',
      })

      const response = await POST(request)

      expect(response.status).toBe(401)
    })

    it('returns 400 when webhook signature verification fails', async () => {
      mockHeaders.mockResolvedValue({
        get: jest.fn(() => 'invalid_signature'),
      })

      const signatureError = new Error('Invalid signature')
      mockStripeInstance.webhooks.constructEvent.mockImplementation(() => {
        throw signatureError
      })

      const request = new NextRequest('http://localhost:3000/api/webhooks', {
        method: 'POST',
        body: 'test payload',
        headers: {
          'stripe-signature': 'invalid_signature',
        },
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Webhook Error: Invalid signature')
    })

    it('handles different event types', async () => {
      const eventTypes = [
        'checkout.session.completed',
        'customer.subscription.created',
        'invoice.payment_succeeded',
        'unknown.event.type',
      ]

      for (const eventType of eventTypes) {
        const mockEvent = {
          type: eventType,
          id: `evt_test_${eventType}`,
          data: { object: {} },
        }

        mockHeaders.mockResolvedValue({
          get: jest.fn(() => 'v1=signature_value,t=timestamp'),
        })

        mockStripeInstance.webhooks.constructEvent.mockReturnValue(mockEvent)

        const request = new NextRequest('http://localhost:3000/api/webhooks', {
          method: 'POST',
          body: 'test payload',
          headers: {
            'stripe-signature': 'v1=signature_value,t=timestamp',
          },
        })

        const response = await POST(request)
        const data = await response.json()

        expect(response.status).toBe(200)
        expect(data.received).toBe(true)
      }
    })

    it('handles webhook construction with raw body', async () => {
      const rawBody = 'raw webhook payload from stripe'
      
      mockHeaders.mockResolvedValue({
        get: jest.fn(() => 'v1=signature_value,t=timestamp'),
      })

      const mockEvent = {
        type: 'checkout.session.completed',
        id: 'evt_test_123',
      }

      mockStripeInstance.webhooks.constructEvent.mockReturnValue(mockEvent)

      const request = new NextRequest('http://localhost:3000/api/webhooks', {
        method: 'POST',
        body: rawBody,
        headers: {
          'stripe-signature': 'v1=signature_value,t=timestamp',
        },
      })

      await POST(request)

      expect(mockStripeInstance.webhooks.constructEvent).toHaveBeenCalledWith(
        rawBody,
        'v1=signature_value,t=timestamp',
        'whsec_test_secret'
      )
    })

    it('handles non-Error exceptions', async () => {
      mockHeaders.mockResolvedValue({
        get: jest.fn(() => 'v1=signature_value,t=timestamp'),
      })

      // Throw a non-Error object
      mockStripeInstance.webhooks.constructEvent.mockImplementation(() => {
        throw 'String error'
      })

      const request = new NextRequest('http://localhost:3000/api/webhooks', {
        method: 'POST',
        body: 'test payload',
        headers: {
          'stripe-signature': 'v1=signature_value,t=timestamp',
        },
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Webhook Error: Unknown error')
    })

    it('handles Stripe server configuration errors', async () => {
      const mockGetStripeServer = require('@/lib/stripe').getStripeServer
      mockGetStripeServer.mockImplementation(() => {
        throw new Error('Missing STRIPE_SECRET_KEY')
      })

      mockHeaders.mockResolvedValue({
        get: jest.fn(() => 'v1=signature_value,t=timestamp'),
      })

      const request = new NextRequest('http://localhost:3000/api/webhooks', {
        method: 'POST',
        body: 'test payload',
        headers: {
          'stripe-signature': 'v1=signature_value,t=timestamp',
        },
      })

      await expect(POST(request)).rejects.toThrow('Missing STRIPE_SECRET_KEY')
    })

    it('processes checkout.session.completed event', async () => {
      const mockEvent = {
        type: 'checkout.session.completed',
        id: 'evt_test_123',
        data: {
          object: {
            id: 'cs_test_123',
            customer_email: 'customer@example.com',
            subscription: 'sub_test_123',
          },
        },
      }

      mockHeaders.mockResolvedValue({
        get: jest.fn(() => 'v1=signature_value,t=timestamp'),
      })

      mockStripeInstance.webhooks.constructEvent.mockReturnValue(mockEvent)

      const request = new NextRequest('http://localhost:3000/api/webhooks', {
        method: 'POST',
        body: 'webhook payload',
        headers: {
          'stripe-signature': 'v1=signature_value,t=timestamp',
        },
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.received).toBe(true)
    })
  })
})