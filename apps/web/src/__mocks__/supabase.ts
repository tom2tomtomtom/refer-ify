// Mock Supabase client for testing
export const createMockSupabaseClient = (overrides = {}) => ({
  auth: {
    getUser: jest.fn().mockResolvedValue({
      data: { user: { id: 'test-user', email: 'test@example.com' } },
      error: null,
    }),
    signUp: jest.fn().mockResolvedValue({
      data: { user: { id: 'new-user', email: 'new@example.com' } },
      error: null,
    }),
    signInWithPassword: jest.fn().mockResolvedValue({
      data: { user: { id: 'test-user', email: 'test@example.com' } },
      error: null,
    }),
    signOut: jest.fn().mockResolvedValue({
      error: null,
    }),
    onAuthStateChange: jest.fn().mockReturnValue({
      data: { subscription: { unsubscribe: jest.fn() } },
    }),
    getSession: jest.fn().mockResolvedValue({
      data: { session: { access_token: 'mock-token' } },
      error: null,
    }),
  },
  from: jest.fn().mockReturnThis(),
  select: jest.fn().mockReturnThis(),
  insert: jest.fn().mockReturnThis(),
  update: jest.fn().mockReturnThis(),
  delete: jest.fn().mockReturnThis(),
  eq: jest.fn().mockReturnThis(),
  neq: jest.fn().mockReturnThis(),
  gt: jest.fn().mockReturnThis(),
  lt: jest.fn().mockReturnThis(),
  gte: jest.fn().mockReturnThis(),
  lte: jest.fn().mockReturnThis(),
  like: jest.fn().mockReturnThis(),
  ilike: jest.fn().mockReturnThis(),
  in: jest.fn().mockReturnThis(),
  is: jest.fn().mockReturnThis(),
  order: jest.fn().mockReturnThis(),
  limit: jest.fn().mockReturnThis(),
  offset: jest.fn().mockReturnThis(),
  range: jest.fn().mockReturnThis(),
  single: jest.fn().mockResolvedValue({
    data: { id: 1, name: 'Test Item' },
    error: null,
  }),
  maybeSingle: jest.fn().mockResolvedValue({
    data: { id: 1, name: 'Test Item' },
    error: null,
  }),
  or: jest.fn().mockReturnThis(),
  filter: jest.fn().mockReturnThis(),
  match: jest.fn().mockReturnThis(),
  overlaps: jest.fn().mockReturnThis(),
  contains: jest.fn().mockReturnThis(),
  containedBy: jest.fn().mockReturnThis(),
  rangeGt: jest.fn().mockReturnThis(),
  rangeLt: jest.fn().mockReturnThis(),
  rangeGte: jest.fn().mockReturnThis(),
  rangeLte: jest.fn().mockReturnThis(),
  rangeAdjacent: jest.fn().mockReturnThis(),
  textSearch: jest.fn().mockReturnThis(),
  then: jest.fn().mockImplementation((callback) => {
    return callback({
      data: [{ id: 1, name: 'Test Item' }],
      error: null,
      count: 1,
    })
  }),
  // Real-time subscriptions
  channel: jest.fn().mockReturnValue({
    on: jest.fn().mockReturnThis(),
    subscribe: jest.fn().mockResolvedValue({ status: 'success' }),
    unsubscribe: jest.fn(),
  }),
  removeChannel: jest.fn(),
  removeAllChannels: jest.fn(),
  // Storage
  storage: {
    from: jest.fn().mockReturnValue({
      upload: jest.fn().mockResolvedValue({
        data: { path: 'test-file.pdf' },
        error: null,
      }),
      download: jest.fn().mockResolvedValue({
        data: new Blob(['file content']),
        error: null,
      }),
      remove: jest.fn().mockResolvedValue({
        data: null,
        error: null,
      }),
      createSignedUrl: jest.fn().mockResolvedValue({
        data: { signedUrl: 'https://example.com/signed-url' },
        error: null,
      }),
      getPublicUrl: jest.fn().mockReturnValue({
        data: { publicUrl: 'https://example.com/public-url' },
      }),
    }),
  },
  // Functions
  functions: {
    invoke: jest.fn().mockResolvedValue({
      data: { result: 'success' },
      error: null,
    }),
  },
  ...overrides,
})

// Mock for browser client
export const mockBrowserClient = createMockSupabaseClient()

// Mock for server client
export const mockServerClient = createMockSupabaseClient()

// Mock the actual imports
jest.mock('@/lib/supabase/client', () => ({
  getSupabaseBrowserClient: jest.fn(() => mockBrowserClient),
}))

jest.mock('@/lib/supabase/server', () => ({
  getSupabaseServerClient: jest.fn(() => Promise.resolve(mockServerClient)),
}))

// Helper to reset all mocks
export const resetSupabaseMocks = () => {
  Object.values(mockBrowserClient).forEach(mock => {
    if (typeof mock === 'function') {
      mock.mockClear?.()
    }
  })
  
  Object.values(mockServerClient).forEach(mock => {
    if (typeof mock === 'function') {
      mock.mockClear?.()
    }
  })
}

// Helper to configure auth state
export const setAuthState = (user: any = null, error: any = null) => {
  mockBrowserClient.auth.getUser.mockResolvedValue({
    data: { user },
    error,
  })
  
  mockServerClient.auth.getUser.mockResolvedValue({
    data: { user },
    error,
  })
}

// Helper to configure query responses
export const setQueryResponse = (data: any, error: any = null, count?: number) => {
  const response = { data, error, count }
  
  mockBrowserClient.then.mockImplementation((callback) => callback(response))
  mockServerClient.then.mockImplementation((callback) => callback(response))
  
  // Also mock direct resolved value for single/maybeSingle
  mockBrowserClient.single.mockResolvedValue(response)
  mockServerClient.single.mockResolvedValue(response)
  mockBrowserClient.maybeSingle.mockResolvedValue(response)
  mockServerClient.maybeSingle.mockResolvedValue(response)
}

// Helper to simulate real-time updates
export const simulateRealtimeUpdate = (table: string, eventType: 'INSERT' | 'UPDATE' | 'DELETE', record: any) => {
  // This would trigger the callback registered with channel.on()
  const mockCallback = jest.fn()
  mockBrowserClient.channel().on.mockImplementation((event, filter, callback) => {
    if (filter.table === table && event === `postgres_changes`) {
      // Simulate the callback being called
      setTimeout(() => callback({
        eventType,
        new: eventType !== 'DELETE' ? record : undefined,
        old: eventType !== 'INSERT' ? record : undefined,
      }), 100)
    }
    return mockBrowserClient.channel()
  })
}

// Export the mocks for direct use in tests
export { mockBrowserClient, mockServerClient }