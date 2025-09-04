import { GET } from '@/app/api/analytics/jobs/[id]/route'

jest.mock('next/server', () => ({
  NextResponse: {
    json: jest.fn((data, options) => ({ json: async () => data, status: options?.status || 200 })),
  },
}))

jest.mock('@/lib/supabase/server', () => ({ getSupabaseServerClient: jest.fn() }))
const { getSupabaseServerClient } = require('@/lib/supabase/server')

const mockSupabase = {
  auth: { getUser: jest.fn() },
  from: jest.fn(),
  select: jest.fn(),
  eq: jest.fn(),
  single: jest.fn(),
}

;(getSupabaseServerClient as jest.Mock).mockResolvedValue(mockSupabase)

function setupJobOwned() {
  const jobQuery = { select: jest.fn().mockReturnThis(), eq: jest.fn().mockReturnThis(), single: jest.fn().mockResolvedValue({ data: { id: 'job-1', client_id: 'client-1', created_at: '2024-01-01T00:00:00Z' }, error: null }) }
  const refQuery = { select: jest.fn().mockReturnThis(), eq: jest.fn().mockResolvedValue({ data: [
    { id: 'r1', status: 'submitted', created_at: '2024-01-02T00:00:00Z' },
    { id: 'r2', status: 'reviewed', created_at: '2024-01-03T00:00:00Z' },
    { id: 'r3', status: 'hired', created_at: '2024-01-10T00:00:00Z' },
  ], error: null }) }
  ;(mockSupabase.from as jest.Mock).mockImplementation((table: string) => {
    if (table === 'jobs') return jobQuery
    if (table === 'referrals') return refQuery
    return mockSupabase
  })
}

describe('/api/analytics/jobs/[id]', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('returns 401 if unauthenticated', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: null } })
    const res = await GET({} as any, { params: { id: 'job-1' } })
    expect(res.status).toBe(401)
  })

  it('returns 403 if job not owned by user', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: { id: 'client-2' } } })
    const jobQuery = { select: jest.fn().mockReturnThis(), eq: jest.fn().mockReturnThis(), single: jest.fn().mockResolvedValue({ data: { id: 'job-1', client_id: 'client-1' }, error: null }) }
    ;(mockSupabase.from as jest.Mock).mockImplementation((table: string) => table === 'jobs' ? jobQuery : ({ select: jest.fn().mockReturnThis(), eq: jest.fn().mockReturnThis() }))

    const res = await GET({} as any, { params: { id: 'job-1' } })
    expect(res.status).toBe(403)
  })

  it('computes metrics for owned job', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: { id: 'client-1' } } })
    setupJobOwned()

    const res = await GET({} as any, { params: { id: 'job-1' } })
    const json = await (res as any).json()
    expect(res.status).toBe(200)
    expect(json.pipelineCounts.submitted).toBe(1)
    expect(json.pipelineCounts.reviewed).toBe(1)
    expect(json.pipelineCounts.hired).toBe(1)
    expect(json.avgTimeToHire).toBeGreaterThanOrEqual(0)
  })
})

