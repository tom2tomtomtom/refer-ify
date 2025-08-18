import { NextRequest } from 'next/server'
import { GET, POST } from '@/app/api/jobs/route'

const mockSupabaseClient = {
  auth: {
    getUser: jest.fn(),
  },
  from: jest.fn().mockReturnThis(),
  select: jest.fn().mockReturnThis(),
  eq: jest.fn().mockReturnThis(),
  range: jest.fn().mockReturnThis(),
  order: jest.fn().mockReturnThis(),
  or: jest.fn().mockReturnThis(),
  insert: jest.fn().mockReturnThis(),
  single: jest.fn().mockReturnThis(),
}

jest.mock('@/lib/supabase/server', () => ({
  getSupabaseServerClient: jest.fn(() => Promise.resolve(mockSupabaseClient)),
}))

describe('/api/jobs', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('GET /api/jobs', () => {
    it('returns 401 when user is not authenticated', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({ data: { user: null } })

      const request = new NextRequest('http://localhost/api/jobs')
      const response = await GET(request)

      expect(response.status).toBe(401)
      
      const body = await response.json()
      expect(body.error).toBe('Unauthorized')
    })

    it('returns jobs successfully for authenticated user', async () => {
      const mockUser = { id: 'user123', email: 'test@example.com' }
      const mockJobs = [
        {
          id: '1',
          title: 'Software Engineer',
          description: 'Build apps',
          client_id: 'user123',
          created_at: '2023-01-01',
          referrals: [{ count: 5 }],
        },
      ]

      mockSupabaseClient.auth.getUser.mockResolvedValue({ data: { user: mockUser } })
      
      const mockQuery = {
        data: mockJobs,
        error: null,
        count: 1,
      }
      
      // Mock the query chain
      jest.spyOn(mockSupabaseClient, 'from').mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            range: jest.fn().mockReturnValue({
              order: jest.fn().mockResolvedValue(mockQuery)
            })
          })
        })
      })

      const request = new NextRequest('http://localhost/api/jobs')
      const response = await GET(request)

      expect(response.status).toBe(200)
      
      const body = await response.json()
      expect(body.jobs).toEqual(mockJobs)
      expect(body.total).toBe(1)
      expect(body.page).toBe(1)
      expect(body.limit).toBe(12)
    })

    it('applies search filter correctly', async () => {
      const mockUser = { id: 'user123', email: 'test@example.com' }
      mockSupabaseClient.auth.getUser.mockResolvedValue({ data: { user: mockUser } })

      const mockOr = jest.fn().mockResolvedValue({ data: [], error: null, count: 0 })
      
      jest.spyOn(mockSupabaseClient, 'from').mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            range: jest.fn().mockReturnValue({
              order: jest.fn().mockReturnValue({
                or: mockOr
              })
            })
          })
        })
      })

      const request = new NextRequest('http://localhost/api/jobs?search=engineer')
      const response = await GET(request)

      expect(mockOr).toHaveBeenCalledWith('title.ilike.%engineer%,description.ilike.%engineer%')
      expect(response.status).toBe(200)
    })

    it('applies status filter correctly', async () => {
      const mockUser = { id: 'user123', email: 'test@example.com' }
      mockSupabaseClient.auth.getUser.mockResolvedValue({ data: { user: mockUser } })

      const mockEqStatus = jest.fn().mockResolvedValue({ data: [], error: null, count: 0 })
      
      jest.spyOn(mockSupabaseClient, 'from').mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            range: jest.fn().mockReturnValue({
              order: jest.fn().mockReturnValue({
                eq: mockEqStatus
              })
            })
          })
        })
      })

      const request = new NextRequest('http://localhost/api/jobs?status=active')
      const response = await GET(request)

      expect(mockEqStatus).toHaveBeenCalledWith('status', 'active')
      expect(response.status).toBe(200)
    })

    it('handles pagination correctly', async () => {
      const mockUser = { id: 'user123', email: 'test@example.com' }
      mockSupabaseClient.auth.getUser.mockResolvedValue({ data: { user: mockUser } })

      const mockRange = jest.fn().mockReturnValue({
        order: jest.fn().mockResolvedValue({ data: [], error: null, count: 0 })
      })
      
      jest.spyOn(mockSupabaseClient, 'from').mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            range: mockRange
          })
        })
      })

      const request = new NextRequest('http://localhost/api/jobs?page=2&limit=5')
      const response = await GET(request)

      expect(mockRange).toHaveBeenCalledWith(5, 9) // page 2 with limit 5: offset 5, end 9
      expect(response.status).toBe(200)
      
      const body = await response.json()
      expect(body.page).toBe(2)
      expect(body.limit).toBe(5)
    })

    it('handles database errors', async () => {
      const mockUser = { id: 'user123', email: 'test@example.com' }
      mockSupabaseClient.auth.getUser.mockResolvedValue({ data: { user: mockUser } })

      jest.spyOn(mockSupabaseClient, 'from').mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            range: jest.fn().mockReturnValue({
              order: jest.fn().mockResolvedValue({
                data: null,
                error: { message: 'Database error' },
                count: null,
              })
            })
          })
        })
      })

      const request = new NextRequest('http://localhost/api/jobs')
      const response = await GET(request)

      expect(response.status).toBe(500)
      
      const body = await response.json()
      expect(body.error).toBe('Database error')
    })
  })

  describe('POST /api/jobs', () => {
    it('returns 401 when user is not authenticated', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({ data: { user: null } })

      const request = new NextRequest('http://localhost/api/jobs', {
        method: 'POST',
        body: JSON.stringify({
          title: 'Test Job',
          description: 'Test description',
        }),
      })

      const response = await POST(request)

      expect(response.status).toBe(401)
      
      const body = await response.json()
      expect(body.error).toBe('Unauthorized')
    })

    it('creates job successfully with valid data', async () => {
      const mockUser = { id: 'user123', email: 'test@example.com' }
      const mockJob = {
        id: 'job123',
        title: 'Software Engineer',
        description: 'Build applications',
        client_id: 'user123',
        status: 'draft',
      }

      mockSupabaseClient.auth.getUser.mockResolvedValue({ data: { user: mockUser } })

      const mockSelect = jest.fn().mockReturnValue({
        single: jest.fn().mockResolvedValue({
          data: mockJob,
          error: null,
        })
      })

      jest.spyOn(mockSupabaseClient, 'from').mockReturnValue({
        insert: jest.fn().mockReturnValue({
          select: mockSelect
        })
      })

      const jobData = {
        title: 'Software Engineer',
        description: 'Build applications',
        location_type: 'remote',
        salary_min: 80000,
        salary_max: 120000,
        skills: ['React', 'TypeScript'],
      }

      const request = new NextRequest('http://localhost/api/jobs', {
        method: 'POST',
        body: JSON.stringify(jobData),
      })

      const response = await POST(request)

      expect(response.status).toBe(201)
      
      const body = await response.json()
      expect(body.job).toEqual(mockJob)
    })

    it('returns 400 when title is missing', async () => {
      const mockUser = { id: 'user123', email: 'test@example.com' }
      mockSupabaseClient.auth.getUser.mockResolvedValue({ data: { user: mockUser } })

      const request = new NextRequest('http://localhost/api/jobs', {
        method: 'POST',
        body: JSON.stringify({
          description: 'Test description',
        }),
      })

      const response = await POST(request)

      expect(response.status).toBe(400)
      
      const body = await response.json()
      expect(body.error).toBe('Title and description are required')
    })

    it('returns 400 when description is missing', async () => {
      const mockUser = { id: 'user123', email: 'test@example.com' }
      mockSupabaseClient.auth.getUser.mockResolvedValue({ data: { user: mockUser } })

      const request = new NextRequest('http://localhost/api/jobs', {
        method: 'POST',
        body: JSON.stringify({
          title: 'Test Job',
        }),
      })

      const response = await POST(request)

      expect(response.status).toBe(400)
      
      const body = await response.json()
      expect(body.error).toBe('Title and description are required')
    })

    it('handles database errors during creation', async () => {
      const mockUser = { id: 'user123', email: 'test@example.com' }
      mockSupabaseClient.auth.getUser.mockResolvedValue({ data: { user: mockUser } })

      const mockSelect = jest.fn().mockReturnValue({
        single: jest.fn().mockResolvedValue({
          data: null,
          error: { message: 'Database error' },
        })
      })

      jest.spyOn(mockSupabaseClient, 'from').mockReturnValue({
        insert: jest.fn().mockReturnValue({
          select: mockSelect
        })
      })

      const request = new NextRequest('http://localhost/api/jobs', {
        method: 'POST',
        body: JSON.stringify({
          title: 'Test Job',
          description: 'Test description',
        }),
      })

      const response = await POST(request)

      expect(response.status).toBe(500)
      
      const body = await response.json()
      expect(body.error).toBe('Database error')
    })

    it('applies default values correctly', async () => {
      const mockUser = { id: 'user123', email: 'test@example.com' }
      mockSupabaseClient.auth.getUser.mockResolvedValue({ data: { user: mockUser } })

      const mockInsert = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: { id: 'job123' },
            error: null,
          })
        })
      })

      jest.spyOn(mockSupabaseClient, 'from').mockReturnValue({
        insert: mockInsert
      })

      const request = new NextRequest('http://localhost/api/jobs', {
        method: 'POST',
        body: JSON.stringify({
          title: 'Test Job',
          description: 'Test description',
        }),
      })

      await POST(request)

      expect(mockInsert).toHaveBeenCalledWith([{
        client_id: 'user123',
        title: 'Test Job',
        description: 'Test description',
        requirements: {},
        location_type: undefined,
        location_city: undefined,
        salary_min: null,
        salary_max: null,
        currency: 'USD',
        skills: [],
        experience_level: 'mid',
        job_type: 'full_time',
        subscription_tier: 'connect',
        status: 'draft',
      }])
    })

    it('handles malformed JSON in request body', async () => {
      const mockUser = { id: 'user123', email: 'test@example.com' }
      mockSupabaseClient.auth.getUser.mockResolvedValue({ data: { user: mockUser } })

      const request = new NextRequest('http://localhost/api/jobs', {
        method: 'POST',
        body: 'invalid json',
      })

      const response = await POST(request)

      expect(response.status).toBe(500)
      
      const body = await response.json()
      expect(body.error).toContain('Failed to create job')
    })
  })
})