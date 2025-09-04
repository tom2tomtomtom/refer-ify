import { GET } from '@/app/api/analytics/client/route'

// Mock NextResponse to simplify return shape
jest.mock('next/server', () => ({
  NextResponse: {
    json: jest.fn((data, options) => ({ json: async () => data, status: options?.status || 200 })),
  },
}))

// Mock Supabase server client
jest.mock('@/lib/supabase/server', () => ({
  getSupabaseServerClient: jest.fn(),
}))

const mockSupabase = {
  auth: { getUser: jest.fn() },
  from: jest.fn(() => mockSupabase),
  select: jest.fn(() => mockSupabase),
  match: jest.fn(() => mockSupabase),
  in: jest.fn(() => ({ data: [], error: null })),
}

const { getSupabaseServerClient } = require('@/lib/supabase/server')
;(getSupabaseServerClient as jest.Mock).mockResolvedValue(mockSupabase)

describe('/api/analytics/client', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('returns 401 when unauthenticated', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: null } })
    const res = await GET()
    expect(res.status).toBe(401)
  })

  it('computes pipeline and conversions', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: { id: 'client-1' } } })

    // First, jobs select for ids
    const jobsData = { data: [{ id: 'job-1' }, { id: 'job-2' }], error: null }
    ;(mockSupabase.select as jest.Mock).mockImplementationOnce(() => ({ match: jest.fn(() => jobsData) }))

    // Then, referrals query with .in(...)
    ;(mockSupabase.in as jest.Mock).mockResolvedValue({
      data: [
        { id: 'r1', status: 'submitted', created_at: '2024-01-01T00:00:00Z' },
        { id: 'r2', status: 'reviewed', created_at: '2024-01-02T00:00:00Z' },
        { id: 'r3', status: 'shortlisted', created_at: '2024-01-03T00:00:00Z' },
        { id: 'r4', status: 'hired', created_at: '2024-01-10T00:00:00Z' },
      ],
      error: null,
    })

    const res = await GET()
    const json = await (res as any).json()

    expect(res.status).toBe(200)
    expect(json.pipelineCounts.submitted).toBe(1)
    expect(json.pipelineCounts.reviewed).toBe(1)
    expect(json.pipelineCounts.shortlisted).toBe(1)
    expect(json.pipelineCounts.hired).toBe(1)

    expect(json.conversionRates.submitted_to_reviewed).toBeGreaterThanOrEqual(1/1)
    expect(json.avgTimeToHire).toBeGreaterThanOrEqual(0)
  })
})

