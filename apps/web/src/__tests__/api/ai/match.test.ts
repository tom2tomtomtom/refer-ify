import { POST, GET } from '@/app/api/ai/match/route'
import { NextRequest } from 'next/server'
import { OpenAI } from 'openai'

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
  single: jest.fn(),
  insert: jest.fn().mockReturnThis(),
  order: jest.fn().mockReturnThis(),
  gte: jest.fn().mockReturnThis(),
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

describe('/api/ai/match', () => {
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
    salary_max: 180000
  }

  const mockAIResponse = {
    overall_score: 85,
    skills_match: 90,
    experience_match: 80,
    education_match: 85,
    reasoning: 'This candidate shows strong alignment with the role requirements...',
    key_strengths: ['Strong React experience', 'TypeScript expertise', 'Senior-level experience'],
    potential_concerns: ['No direct fintech experience mentioned']
  }

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
          content: JSON.stringify(mockAIResponse)
        }
      }]
    })
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('POST /api/ai/match', () => {
    it('analyzes candidate match successfully', async () => {
      mockSupabaseQuery.single.mockResolvedValue({
        data: mockJob,
        error: null
      })

      const mockAnalysisRecord = {
        id: 'analysis-123',
        job_id: 'job-123',
        candidate_email: 'candidate@example.com',
        ...mockAIResponse,
        created_at: '2025-08-18T10:00:00Z'
      }

      mockSupabaseQuery.insert.mockResolvedValue({
        data: mockAnalysisRecord,
        error: null
      })

      const requestBody = {
        job_id: 'job-123',
        candidate_resume: 'Experienced software engineer with 6 years in React and TypeScript...',
        candidate_email: 'candidate@example.com'
      }

      const request = new NextRequest('http://localhost:3000/api/ai/match', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: { 'Content-Type': 'application/json' },
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.match_analysis).toMatchObject({
        job_id: 'job-123',
        candidate_email: 'candidate@example.com',
        overall_score: 85,
        skills_match: 90,
        experience_match: 80,
        education_match: 85
      })

      // Verify OpenAI was called with correct parameters
      expect(mockOpenAICreate).toHaveBeenCalledWith({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "You are an expert recruiting AI that provides objective candidate-job match analysis. Always respond with valid JSON."
          },
          {
            role: "user",
            content: expect.stringContaining("Senior Software Engineer")
          }
        ],
        temperature: 0.3,
        max_tokens: 1500,
      })

      // Verify database storage
      expect(mockSupabaseQuery.insert).toHaveBeenCalledWith({
        job_id: 'job-123',
        candidate_email: 'candidate@example.com',
        overall_score: 85,
        skills_match: 90,
        experience_match: 80,
        education_match: 85,
        reasoning: mockAIResponse.reasoning,
        key_strengths: mockAIResponse.key_strengths,
        potential_concerns: mockAIResponse.potential_concerns,
        resume_text: 'Experienced software engineer with 6 years in React and TypeScript...',
        created_by: 'user-123'
      })
    })

    it('validates required parameters', async () => {
      const requestBody = {
        job_id: 'job-123'
        // Missing candidate_resume
      }

      const request = new NextRequest('http://localhost:3000/api/ai/match', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: { 'Content-Type': 'application/json' },
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Job ID and candidate resume are required')
    })

    it('handles non-existent job', async () => {
      mockSupabaseQuery.single.mockResolvedValue({
        data: null,
        error: new Error('Job not found')
      })

      const requestBody = {
        job_id: 'non-existent',
        candidate_resume: 'Some resume text...'
      }

      const request = new NextRequest('http://localhost:3000/api/ai/match', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: { 'Content-Type': 'application/json' },
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(404)
      expect(data.error).toBe('Job not found')
    })

    it('requires authentication', async () => {
      mockSupabaseInstance.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: new Error('Not authenticated')
      })

      const requestBody = {
        job_id: 'job-123',
        candidate_resume: 'Some resume text...'
      }

      const request = new NextRequest('http://localhost:3000/api/ai/match', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: { 'Content-Type': 'application/json' },
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error).toBe('Unauthorized')
    })

    it('handles OpenAI API errors gracefully', async () => {
      mockSupabaseQuery.single.mockResolvedValue({
        data: mockJob,
        error: null
      })

      mockOpenAICreate.mockRejectedValue(
        new Error('OpenAI API error')
      )

      const requestBody = {
        job_id: 'job-123',
        candidate_resume: 'Some resume text...'
      }

      const request = new NextRequest('http://localhost:3000/api/ai/match', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: { 'Content-Type': 'application/json' },
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('Failed to analyze candidate match')
    })

    it('handles invalid AI response JSON', async () => {
      mockSupabaseQuery.single.mockResolvedValue({
        data: mockJob,
        error: null
      })

      mockOpenAICreate.mockResolvedValue({
        choices: [{
          message: {
            content: 'Invalid JSON response from AI'
          }
        }]
      })

      const requestBody = {
        job_id: 'job-123',
        candidate_resume: 'Some resume text...'
      }

      const request = new NextRequest('http://localhost:3000/api/ai/match', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: { 'Content-Type': 'application/json' },
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('Failed to parse AI analysis')
    })

    it('continues even if database storage fails', async () => {
      mockSupabaseQuery.single.mockResolvedValue({
        data: mockJob,
        error: null
      })

      mockSupabaseQuery.insert.mockResolvedValue({
        data: null,
        error: new Error('Database error')
      })

      const requestBody = {
        job_id: 'job-123',
        candidate_resume: 'Some resume text...',
        candidate_email: 'test@example.com'
      }

      const request = new NextRequest('http://localhost:3000/api/ai/match', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: { 'Content-Type': 'application/json' },
      })

      const response = await POST(request)
      const data = await response.json()

      // Should still return success with AI analysis even if storage fails
      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.match_analysis).toMatchObject(mockAIResponse)
    })
  })

  describe('GET /api/ai/match', () => {
    it('returns AI match analyses for a job', async () => {
      const mockAnalyses = [
        {
          id: 'analysis-1',
          job_id: 'job-123',
          candidate_email: 'candidate1@example.com',
          overall_score: 85,
          created_at: '2025-08-18T10:00:00Z'
        },
        {
          id: 'analysis-2',
          job_id: 'job-123',
          candidate_email: 'candidate2@example.com',
          overall_score: 75,
          created_at: '2025-08-17T10:00:00Z'
        }
      ]

      mockSupabaseQuery.order.mockResolvedValue({
        data: mockAnalyses,
        error: null
      })

      const request = new NextRequest(
        'http://localhost:3000/api/ai/match?job_id=job-123',
        { method: 'GET' }
      )

      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.analyses).toEqual(mockAnalyses)
      expect(data.count).toBe(2)
      expect(mockSupabaseQuery.order).toHaveBeenCalledWith('overall_score', { ascending: false })
    })

    it('filters by minimum score when provided', async () => {
      mockSupabaseQuery.order.mockResolvedValue({
        data: [],
        error: null
      })

      const request = new NextRequest(
        'http://localhost:3000/api/ai/match?job_id=job-123&min_score=80',
        { method: 'GET' }
      )

      await GET(request)

      expect(mockSupabaseQuery.gte).toHaveBeenCalledWith('overall_score', 80)
    })

    it('requires job_id parameter', async () => {
      const request = new NextRequest(
        'http://localhost:3000/api/ai/match',
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
        'http://localhost:3000/api/ai/match?job_id=job-123',
        { method: 'GET' }
      )

      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error).toBe('Unauthorized')
    })
  })
})