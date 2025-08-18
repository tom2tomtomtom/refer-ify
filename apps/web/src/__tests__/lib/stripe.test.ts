import { loadStripe } from '@stripe/stripe-js'
import { getStripe } from '@/lib/stripe'

// Mock Stripe
jest.mock('@stripe/stripe-js')
const mockLoadStripe = loadStripe as jest.MockedFunction<typeof loadStripe>

describe('Stripe Client', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    // Clear any cached stripe instance
    delete (global as any).__stripe
  })

  it('loads Stripe with publishable key', async () => {
    const mockStripeInstance = { id: 'stripe-instance' }
    mockLoadStripe.mockResolvedValue(mockStripeInstance as any)

    // Mock environment variable
    const originalEnv = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
    process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY = 'pk_test_123'

    const stripe = await getStripe()

    expect(mockLoadStripe).toHaveBeenCalledWith('pk_test_123')
    expect(stripe).toBe(mockStripeInstance)

    // Restore environment variable
    process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY = originalEnv
  })

  it('returns null when no publishable key is provided', async () => {
    // Mock missing environment variable
    const originalEnv = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
    delete process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY

    const stripe = await getStripe()

    expect(mockLoadStripe).not.toHaveBeenCalled()
    expect(stripe).toBeNull()

    // Restore environment variable
    process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY = originalEnv
  })

  it('caches Stripe instance', async () => {
    const mockStripeInstance = { id: 'stripe-instance' }
    mockLoadStripe.mockResolvedValue(mockStripeInstance as any)

    // Mock environment variable
    const originalEnv = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
    process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY = 'pk_test_123'

    // First call
    const stripe1 = await getStripe()
    expect(mockLoadStripe).toHaveBeenCalledTimes(1)

    // Second call should use cached instance
    const stripe2 = await getStripe()
    expect(mockLoadStripe).toHaveBeenCalledTimes(1)
    expect(stripe1).toBe(stripe2)

    // Restore environment variable
    process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY = originalEnv
  })

  it('handles Stripe loading errors', async () => {
    const error = new Error('Failed to load Stripe')
    mockLoadStripe.mockRejectedValue(error)

    // Mock environment variable
    const originalEnv = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
    process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY = 'pk_test_123'

    // Should not throw, but return null on error
    const stripe = await getStripe()

    expect(mockLoadStripe).toHaveBeenCalledWith('pk_test_123')
    expect(stripe).toBeNull()

    // Restore environment variable
    process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY = originalEnv
  })

  it('works in different environments', async () => {
    const mockStripeInstance = { id: 'stripe-instance' }
    mockLoadStripe.mockResolvedValue(mockStripeInstance as any)

    // Test with development key
    process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY = 'pk_test_development'
    await getStripe()
    expect(mockLoadStripe).toHaveBeenCalledWith('pk_test_development')

    // Clear cache
    delete (global as any).__stripe
    mockLoadStripe.mockClear()

    // Test with production key
    process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY = 'pk_live_production'
    await getStripe()
    expect(mockLoadStripe).toHaveBeenCalledWith('pk_live_production')
  })

  it('handles concurrent calls correctly', async () => {
    const mockStripeInstance = { id: 'stripe-instance' }
    mockLoadStripe.mockResolvedValue(mockStripeInstance as any)

    // Mock environment variable
    const originalEnv = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
    process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY = 'pk_test_123'

    // Make multiple concurrent calls
    const promises = [getStripe(), getStripe(), getStripe()]
    const results = await Promise.all(promises)

    // Should only call loadStripe once
    expect(mockLoadStripe).toHaveBeenCalledTimes(1)
    
    // All results should be the same instance
    expect(results[0]).toBe(mockStripeInstance)
    expect(results[1]).toBe(mockStripeInstance)
    expect(results[2]).toBe(mockStripeInstance)

    // Restore environment variable
    process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY = originalEnv
  })
})