import { NextRequest } from 'next/server'
import { GET, POST } from '@/app/api/referrals/route'

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

const mockSupabaseClient = {
  auth: {
    getUser: jest.fn(),
  },
  from: jest.fn().mockReturnThis(),
  select: jest.fn().mockReturnThis(),
  range: jest.fn().mockReturnThis(),
  order: jest.fn().mockReturnThis(),
  insert: jest.fn().mockReturnThis(),
  single: jest.fn().mockReturnThis(),
}

jest.mock('@/lib/supabase/server', () => ({
  getSupabaseServerClient: jest.fn(() => Promise.resolve(mockSupabaseClient)),
}))

describe('/api/referrals', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('GET /api/referrals', () => {
    it('returns referrals successfully with default pagination', async () => {
      const mockReferrals = [
        {
          id: '1',
          candidate_name: 'John Doe',
          candidate_email: 'john@example.com',
          job_id: 'job1',
          created_at: '2023-01-01',
        },
        {
          id: '2',
          candidate_name: 'Jane Smith',
          candidate_email: 'jane@example.com',
          job_id: 'job2',
          created_at: '2023-01-02',
        },
      ]

      const mockQuery = {
        data: mockReferrals,
        error: null,
        count: 2,
      }

      jest.spyOn(mockSupabaseClient, 'from').mockReturnValue({
        select: jest.fn().mockReturnValue({
          range: jest.fn().mockReturnValue({
            order: jest.fn().mockResolvedValue(mockQuery)
          })
        })
      })

      const request = new NextRequest('http://localhost/api/referrals')
      const response = await GET(request)

      expect(response.status).toBe(200)
      
      const body = await response.json()
      expect(body.referrals).toEqual(mockReferrals)
      expect(body.total).toBe(2)
      expect(body.page).toBe(1)
      expect(body.limit).toBe(20)
    })

    it('handles pagination parameters correctly', async () => {
      const mockRange = jest.fn().mockReturnValue({
        order: jest.fn().mockResolvedValue({ data: [], error: null, count: 0 })
      })

      jest.spyOn(mockSupabaseClient, 'from').mockReturnValue({
        select: jest.fn().mockReturnValue({
          range: mockRange
        })
      })

      const request = new NextRequest('http://localhost/api/referrals?page=3&limit=10')
      const response = await GET(request)

      expect(mockRange).toHaveBeenCalledWith(20, 29) // page 3 with limit 10: offset 20, end 29
      expect(response.status).toBe(200)
      
      const body = await response.json()
      expect(body.page).toBe(3)
      expect(body.limit).toBe(10)
    })

    it('handles database errors', async () => {
      jest.spyOn(mockSupabaseClient, 'from').mockReturnValue({
        select: jest.fn().mockReturnValue({
          range: jest.fn().mockReturnValue({
            order: jest.fn().mockResolvedValue({
              data: null,
              error: { message: 'Database connection failed' },
              count: null,
            })
          })
        })
      })

      const request = new NextRequest('http://localhost/api/referrals')
      const response = await GET(request)

      expect(response.status).toBe(500)
      
      const body = await response.json()
      expect(body.error).toBe('Database connection failed')
    })

    it('orders referrals by created_at descending', async () => {
      const mockOrder = jest.fn().mockResolvedValue({ data: [], error: null, count: 0 })

      jest.spyOn(mockSupabaseClient, 'from').mockReturnValue({
        select: jest.fn().mockReturnValue({
          range: jest.fn().mockReturnValue({
            order: mockOrder
          })
        })
      })

      const request = new NextRequest('http://localhost/api/referrals')
      await GET(request)

      expect(mockOrder).toHaveBeenCalledWith('created_at', { ascending: false })
    })
  })

  describe('POST /api/referrals', () => {
    it('returns 401 when user is not authenticated', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({ data: { user: null } })

      const request = new NextRequest('http://localhost/api/referrals', {
        method: 'POST',
        body: JSON.stringify({
          job_id: 'job1',
          candidate_name: 'John Doe',
          candidate_email: 'john@example.com',
        }),
      })

      const response = await POST(request)

      expect(response.status).toBe(401)
      
      const body = await response.json()
      expect(body.error).toBe('Unauthorized')
    })

    it('creates referral successfully with authenticated user', async () => {
      const mockUser = { id: 'user123', email: 'referrer@example.com' }
      const mockReferral = {
        id: 'ref123',
        job_id: 'job1',
        candidate_name: 'John Doe',
        candidate_email: 'john@example.com',
        referrer_id: 'user123',
        consent_timestamp: '2023-01-01T00:00:00.000Z',
        created_at: '2023-01-01T00:00:00.000Z',
      }

      mockSupabaseClient.auth.getUser.mockResolvedValue({ data: { user: mockUser } })

      const mockSelect = jest.fn().mockReturnValue({
        single: jest.fn().mockResolvedValue({
          data: mockReferral,
          error: null,
        })
      })

      jest.spyOn(mockSupabaseClient, 'from').mockReturnValue({
        insert: jest.fn().mockReturnValue({
          select: mockSelect
        })
      })

      const referralData = {
        job_id: 'job1',
        candidate_name: 'John Doe',
        candidate_email: 'john@example.com',
        candidate_phone: '+1234567890',
        referrer_notes: 'Excellent candidate',
        expected_salary: 100000,
        availability: 'immediately',
        consent_given: true,
      }

      const request = new NextRequest('http://localhost/api/referrals', {
        method: 'POST',
        body: JSON.stringify(referralData),
      })

      const response = await POST(request)

      expect(response.status).toBe(201)
      
      const body = await response.json()
      expect(body.referral).toEqual(mockReferral)
    })

    it('adds referrer_id and consent_timestamp to payload', async () => {
      const mockUser = { id: 'user123', email: 'referrer@example.com' }
      mockSupabaseClient.auth.getUser.mockResolvedValue({ data: { user: mockUser } })

      const mockInsert = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: { id: 'ref123' },
            error: null,
          })
        })
      })

      jest.spyOn(mockSupabaseClient, 'from').mockReturnValue({
        insert: mockInsert
      })

      const referralData = {
        job_id: 'job1',
        candidate_name: 'John Doe',
        candidate_email: 'john@example.com',
      }

      const request = new NextRequest('http://localhost/api/referrals', {
        method: 'POST',
        body: JSON.stringify(referralData),
      })

      await POST(request)

      expect(mockInsert).toHaveBeenCalledWith([{
        ...referralData,
        referrer_id: 'user123',
        consent_timestamp: expect.any(String),
      }])

      const callArgs = mockInsert.mock.calls[0][0][0]
      expect(callArgs.consent_timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/)
    })

    it('handles database errors during creation', async () => {
      const mockUser = { id: 'user123', email: 'referrer@example.com' }
      mockSupabaseClient.auth.getUser.mockResolvedValue({ data: { user: mockUser } })

      const mockSelect = jest.fn().mockReturnValue({
        single: jest.fn().mockResolvedValue({
          data: null,
          error: { message: 'Validation failed' },
        })
      })

      jest.spyOn(mockSupabaseClient, 'from').mockReturnValue({
        insert: jest.fn().mockReturnValue({
          select: mockSelect
        })
      })

      const request = new NextRequest('http://localhost/api/referrals', {
        method: 'POST',
        body: JSON.stringify({
          job_id: 'job1',
          candidate_name: 'John Doe',
          candidate_email: 'john@example.com',
        }),
      })

      const response = await POST(request)

      expect(response.status).toBe(500)
      
      const body = await response.json()
      expect(body.error).toBe('Validation failed')
    })

    it('handles malformed JSON in request body', async () => {
      const mockUser = { id: 'user123', email: 'referrer@example.com' }
      mockSupabaseClient.auth.getUser.mockResolvedValue({ data: { user: mockUser } })

      const request = new NextRequest('http://localhost/api/referrals', {
        method: 'POST',
        body: 'invalid json',
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe("Invalid JSON in request body")
    })

    it('preserves all provided referral data in the payload', async () => {
      const mockUser = { id: 'user123', email: 'referrer@example.com' }
      mockSupabaseClient.auth.getUser.mockResolvedValue({ data: { user: mockUser } })

      const mockInsert = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: { id: 'ref123' },
            error: null,
          })
        })
      })

      jest.spyOn(mockSupabaseClient, 'from').mockReturnValue({
        insert: mockInsert
      })

      const fullReferralData = {
        job_id: 'job1',
        candidate_name: 'John Doe',
        candidate_email: 'john@example.com',
        candidate_phone: '+1234567890',
        candidate_linkedin: 'https://linkedin.com/in/johndoe',
        referrer_notes: 'Excellent candidate with 5 years experience',
        expected_salary: 100000,
        availability: '2_weeks',
        consent_given: true,
        resume_storage_path: '/resumes/john-doe-resume.pdf',
      }

      const request = new NextRequest('http://localhost/api/referrals', {
        method: 'POST',
        body: JSON.stringify(fullReferralData),
      })

      await POST(request)

      expect(mockInsert).toHaveBeenCalledWith([{
        ...fullReferralData,
        referrer_id: 'user123',
        consent_timestamp: expect.any(String),
      }])
    })

    it('successfully creates referral with minimal required data', async () => {
      const mockUser = { id: 'user123', email: 'referrer@example.com' }
      const mockReferral = { id: 'ref123', candidate_name: 'John Doe' }

      mockSupabaseClient.auth.getUser.mockResolvedValue({ data: { user: mockUser } })

      jest.spyOn(mockSupabaseClient, 'from').mockReturnValue({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: mockReferral,
              error: null,
            })
          })
        })
      })

      const minimalData = {
        job_id: 'job1',
        candidate_name: 'John Doe',
        candidate_email: 'john@example.com',
      }

      const request = new NextRequest('http://localhost/api/referrals', {
        method: 'POST',
        body: JSON.stringify(minimalData),
      })

      const response = await POST(request)

      expect(response.status).toBe(201)
      
      const body = await response.json()
      expect(body.referral).toEqual(mockReferral)
    })
  })
})