/**
 * Global setup for API route tests
 * Mocks NextResponse for Next.js 15 compatibility
 */

// Mock NextResponse for all API tests
jest.mock('next/server', () => ({
  NextResponse: {
    json: jest.fn((data, options) => ({
      json: async () => data,
      status: options?.status || 200,
    })),
  },
  NextRequest: jest.requireActual('next/server').NextRequest,
}))

// Mock Next.js headers function 
jest.mock('next/headers', () => ({
  headers: jest.fn(() => 
    Promise.resolve({
      get: jest.fn((key: string) => {
        // Default mock values for common headers
        if (key === 'stripe-signature') return 'test_signature'
        return null
      }),
    })
  ),
}))