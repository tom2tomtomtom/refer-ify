import { POST, GET } from '@/app/api/ai/suggestions/route'
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
  neq: jest.fn().mockReturnThis(),
  single: jest.fn(),
  insert: jest.fn(),
  limit: jest.fn().mockReturnThis(),
  order: jest.fn().mockReturnThis(),
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

// Mock OpenAI
jest.mock('openai', () => ({
  OpenAI: jest.fn().mockImplementation(() => ({
    chat: {
      completions: {
        create: jest.fn(),
      },
    },
  })),
}))

describe('/api/ai/suggestions', () => {
  const mockUser = {
    id: 'user-123',
    email: 'test@example.com'
  }

  const mockJob = {
    id: 'job-123',
    title: 'Senior Software Engineer',
    description: 'We are looking for a senior software engineer...',
    requirements: 'React, TypeScript, 5+ years experience',
    experience_level: 'Senior',
    location: 'San Francisco, CA',
    salary_min: 120000,
    salary_max: 180000,
    company: 'TechCorp'
  }

  const mockCandidates = [
    {
      id: 'candidate-1',
      email: 'john@example.com',
      first_name: 'John',
      last_name: 'Doe',
      resume_text: 'Experienced React developer with 6 years...',
      skills: ['React', 'TypeScript', 'Node.js'],
      experience_years: 6,
      location: 'San Francisco, CA',
      role: 'member'
    },
    {
      id: 'candidate-2',
      email: 'jane@example.com',
      first_name: 'Jane',
      last_name: 'Smith',
      resume_text: 'Full stack engineer with 4 years...',
      skills: ['JavaScript', 'Python', 'React'],
      experience_years: 4,
      location: 'New York, NY',
      role: 'select_circle'
    }
  ]

  const mockAISuggestions = [
    {
      candidate_id: 'candidate-1',
      match_score: 85,
      reasoning: 'Strong React and TypeScript experience aligns well with job requirements.',
      key_match_points: ['6 years React experience', 'TypeScript expertise', 'Location match'],
      suggested_approach: 'Highlight the exciting technical challenges and growth opportunities.'
    },
    {
      candidate_id: 'candidate-2',
      match_score: 72,
      reasoning: 'Good technical foundation but slightly less experience than preferred.',
      key_match_points: ['React experience', 'Full stack skills', 'Fast learner'],
      suggested_approach: 'Emphasize learning and development opportunities.'
    }
  ]

  let mockOpenAICreate: jest.Mock

  beforeEach(() => {
    jest.clearAllMocks()
    
    // Setup default Supabase auth mock
    mockSupabaseInstance.auth.getUser.mockResolvedValue({
      data: { user: mockUser },
      error: null
    })

    // Get the mocked OpenAI create function
    const { OpenAI } = require('openai')
    mockOpenAICreate = new (OpenAI as jest.Mock)().chat.completions.create

    // Setup default OpenAI mock
    mockOpenAICreate.mockResolvedValue({
      choices: [{
        message: {
          content: JSON.stringify(mockAISuggestions)
        }
      }]
    })
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('POST /api/ai/suggestions', () => {
    it('generates candidate suggestions successfully', async () => {
      // Mock job fetch
      mockSupabaseQuery.single.mockResolvedValue({
        data: mockJob,
        error: null
      })

      // Mock candidates fetch
      mockSupabaseQuery.limit.mockResolvedValue({
        data: mockCandidates,
        error: null
      })

      // Mock suggestions storage
      mockSupabaseQuery.insert.mockResolvedValue({
        data: null,
        error: null
      })

      const requestBody = {
        job_id: 'job-123',
        max_suggestions: 10
      }

      const request = new NextRequest('http://localhost:3000/api/ai/suggestions', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: { 'Content-Type': 'application/json' },
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.job).toMatchObject({
        id: 'job-123',
        title: 'Senior Software Engineer',
        company: 'TechCorp'
      })
      expect(data.suggestions).toHaveLength(2)
      expect(data.suggestions[0]).toMatchObject({
        candidate_id: 'candidate-1',
        match_score: 85,
        candidate: {
          id: 'candidate-1',
          name: 'John Doe',
          email: 'john@example.com'
        }
      })
      expect(data.analyzed_candidates).toBe(2)

      // Verify OpenAI was called
      expect(mockOpenAICreate).toHaveBeenCalledWith({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "You are an expert recruiting AI that provides candidate recommendations for job referrals. Always respond with valid JSON array."
          },
          {
            role: "user",
            content: expect.stringContaining("Senior Software Engineer")
          }
        ],
        temperature: 0.3,
        max_tokens: 3000,
      })

      // Verify suggestions were stored
      expect(mockSupabaseQuery.insert).toHaveBeenCalledWith([
        {
          job_id: 'job-123',
          candidate_id: 'candidate-1',
          match_score: 85,
          reasoning: mockAISuggestions[0].reasoning,
          key_match_points: mockAISuggestions[0].key_match_points,
          suggested_approach: mockAISuggestions[0].suggested_approach,
          created_by: 'user-123',
          status: 'suggested'
        },
        {
          job_id: 'job-123',
          candidate_id: 'candidate-2',
          match_score: 72,
          reasoning: mockAISuggestions[1].reasoning,
          key_match_points: mockAISuggestions[1].key_match_points,
          suggested_approach: mockAISuggestions[1].suggested_approach,
          created_by: 'user-123',
          status: 'suggested'
        }
      ])
    })

    it('validates required job_id parameter', async () => {
      const requestBody = {
        max_suggestions: 10
        // Missing job_id
      }

      const request = new NextRequest('http://localhost:3000/api/ai/suggestions', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: { 'Content-Type': 'application/json' },
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Job ID is required')
    })

    it('handles non-existent job', async () => {
      mockSupabaseQuery.single.mockResolvedValue({
        data: null,
        error: new Error('Job not found')
      })

      const requestBody = {
        job_id: 'non-existent'
      }

      const request = new NextRequest('http://localhost:3000/api/ai/suggestions', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: { 'Content-Type': 'application/json' },
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(404)
      expect(data.error).toBe('Job not found')
    })

    it('handles empty candidate pool', async () => {
      mockSupabaseQuery.single.mockResolvedValue({
        data: mockJob,
        error: null
      })

      mockSupabaseQuery.limit.mockResolvedValue({
        data: [],
        error: null
      })

      const requestBody = {
        job_id: 'job-123'
      }

      const request = new NextRequest('http://localhost:3000/api/ai/suggestions', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: { 'Content-Type': 'application/json' },
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.suggestions).toEqual([])
      expect(data.count).toBe(0)
      expect(data.message).toBe('No candidates available in the network')
    })

    it('requires authentication', async () => {
      mockSupabaseInstance.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: new Error('Not authenticated')
      })

      const requestBody = {
        job_id: 'job-123'
      }

      const request = new NextRequest('http://localhost:3000/api/ai/suggestions', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: { 'Content-Type': 'application/json' },
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error).toBe('Unauthorized')
    })

    it('excludes client roles from candidate pool', async () => {
      mockSupabaseQuery.single.mockResolvedValue({
        data: mockJob,
        error: null
      })

      const requestBody = {
        job_id: 'job-123'
      }

      const request = new NextRequest('http://localhost:3000/api/ai/suggestions', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: { 'Content-Type': 'application/json' },
      })

      await POST(request)

      expect(mockSupabaseQuery.neq).toHaveBeenCalledWith('role', 'client')
      expect(mockSupabaseQuery.limit).toHaveBeenCalledWith(50)
    })

    it('handles OpenAI API errors gracefully', async () => {
      mockSupabaseQuery.single.mockResolvedValue({
        data: mockJob,
        error: null
      })

      mockSupabaseQuery.limit.mockResolvedValue({
        data: mockCandidates,
        error: null
      })

      mockOpenAICreate.mockRejectedValue(
        new Error('OpenAI API error')
      )

      const requestBody = {
        job_id: 'job-123'
      }

      const request = new NextRequest('http://localhost:3000/api/ai/suggestions', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: { 'Content-Type': 'application/json' },
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('Failed to generate candidate suggestions')
    })

    it('handles invalid AI response gracefully', async () => {
      mockSupabaseQuery.single.mockResolvedValue({
        data: mockJob,
        error: null
      })

      mockSupabaseQuery.limit.mockResolvedValue({
        data: mockCandidates,
        error: null
      })

      mockOpenAICreate.mockResolvedValue({
        choices: [{
          message: {
            content: 'Invalid JSON response'
          }
        }]
      })

      const requestBody = {
        job_id: 'job-123'
      }

      const request = new NextRequest('http://localhost:3000/api/ai/suggestions', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: { 'Content-Type': 'application/json' },
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('Failed to parse AI suggestions')
    })

    it('continues even if database storage fails', async () => {
      mockSupabaseQuery.single.mockResolvedValue({
        data: mockJob,
        error: null
      })

      mockSupabaseQuery.limit.mockResolvedValue({
        data: mockCandidates,
        error: null
      })

      mockSupabaseQuery.insert.mockResolvedValue({
        data: null,
        error: new Error('Database error')
      })

      const requestBody = {
        job_id: 'job-123'
      }

      const request = new NextRequest('http://localhost:3000/api/ai/suggestions', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: { 'Content-Type': 'application/json' },
      })

      const response = await POST(request)
      const data = await response.json()

      // Should still return success even if storage fails
      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.suggestions).toHaveLength(2)
    })
  })

  describe('GET /api/ai/suggestions', () => {
    it('returns existing suggestions for a job', async () => {
      const mockStoredSuggestions = [
        {
          id: 'suggestion-1',
          job_id: 'job-123',
          candidate_id: 'candidate-1',
          match_score: 85,
          reasoning: 'Great fit',
          key_match_points: ['React', 'TypeScript'],
          suggested_approach: 'Highlight growth opportunities',
          profiles: {
            first_name: 'John',
            last_name: 'Doe',
            email: 'john@example.com',
            location: 'SF',
            experience_years: 6
          }
        }
      ]

      mockSupabaseQuery.order.mockResolvedValue({
        data: mockStoredSuggestions,
        error: null
      })

      const request = new NextRequest(
        'http://localhost:3000/api/ai/suggestions?job_id=job-123',
        { method: 'GET' }
      )

      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.suggestions).toEqual(mockStoredSuggestions)
      expect(data.count).toBe(1)
    })

    it('requires job_id parameter', async () => {
      const request = new NextRequest(
        'http://localhost:3000/api/ai/suggestions',
        { method: 'GET' }
      )

      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Job ID is required')
    })

    it('requires authentication', async () => {
      mockSupabaseInstance.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: new Error('Not authenticated')
      })

      const request = new NextRequest(
        'http://localhost:3000/api/ai/suggestions?job_id=job-123',
        { method: 'GET' }
      )

      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error).toBe('Unauthorized')
    })
  })
})