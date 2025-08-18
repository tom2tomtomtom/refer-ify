import { POST } from '@/app/api/storage/resumes/route'
import { NextRequest } from 'next/server'

// Mock Supabase clients
const mockSupabaseClient = {
  auth: {
    getUser: jest.fn(),
  },
}

const mockServiceClient = {
  storage: {
    from: jest.fn().mockReturnThis(),
    createSignedUploadUrl: jest.fn(),
  },
}

jest.mock('@/lib/supabase/server', () => ({
  getSupabaseServerClient: jest.fn(() => Promise.resolve(mockSupabaseClient)),
}))

jest.mock('@/lib/supabase/service', () => ({
  getSupabaseServiceClient: jest.fn(() => mockServiceClient),
}))

// Mock Date.now to make tests deterministic
const mockDateNow = jest.spyOn(Date, 'now')

describe('/api/storage/resumes', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockDateNow.mockReturnValue(1640995200000) // 2022-01-01T00:00:00.000Z
  })

  afterEach(() => {
    mockDateNow.mockRestore()
  })

  describe('POST /api/storage/resumes', () => {
    it('creates signed upload URL successfully', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
      }

      const mockSignedUrl = {
        signedUrl: 'https://supabase.co/storage/upload/signed-url',
        token: 'upload-token-123',
      }

      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      })

      mockServiceClient.storage.createSignedUploadUrl.mockResolvedValue({
        data: mockSignedUrl,
        error: null,
      })

      const requestBody = {
        fileName: 'resume.pdf',
      }

      const request = new NextRequest('http://localhost:3000/api/storage/resumes', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.path).toBe('user-123/1640995200000-resume.pdf')
      expect(data.signedUrl).toBe('https://supabase.co/storage/upload/signed-url')
      expect(data.token).toBe('upload-token-123')

      expect(mockServiceClient.storage.from).toHaveBeenCalledWith('resumes')
      expect(mockServiceClient.storage.createSignedUploadUrl).toHaveBeenCalledWith(
        'user-123/1640995200000-resume.pdf'
      )
    })

    it('returns 401 when user is not authenticated', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: { message: 'Not authenticated' },
      })

      const requestBody = {
        fileName: 'resume.pdf',
      }

      const request = new NextRequest('http://localhost:3000/api/storage/resumes', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error).toBe('Unauthorized')
    })

    it('returns 400 when fileName is missing', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
      }

      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      })

      const requestBody = {}

      const request = new NextRequest('http://localhost:3000/api/storage/resumes', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('fileName required')
    })

    it('returns 500 when storage operation fails', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
      }

      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      })

      mockServiceClient.storage.createSignedUploadUrl.mockResolvedValue({
        data: null,
        error: { message: 'Storage bucket not found' },
      })

      const requestBody = {
        fileName: 'resume.pdf',
      }

      const request = new NextRequest('http://localhost:3000/api/storage/resumes', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('Storage bucket not found')
    })

    it('generates unique path with timestamp', async () => {
      const mockUser = {
        id: 'user-456',
        email: 'another@example.com',
      }

      const mockSignedUrl = {
        signedUrl: 'https://supabase.co/storage/upload/signed-url',
        token: 'upload-token-456',
      }

      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      })

      mockServiceClient.storage.createSignedUploadUrl.mockResolvedValue({
        data: mockSignedUrl,
        error: null,
      })

      // Change the mocked timestamp
      mockDateNow.mockReturnValue(1641081600000) // 2022-01-02T00:00:00.000Z

      const requestBody = {
        fileName: 'my-resume.docx',
      }

      const request = new NextRequest('http://localhost:3000/api/storage/resumes', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.path).toBe('user-456/1641081600000-my-resume.docx')

      expect(mockServiceClient.storage.createSignedUploadUrl).toHaveBeenCalledWith(
        'user-456/1641081600000-my-resume.docx'
      )
    })

    it('handles JSON parsing errors', async () => {
      const request = new NextRequest('http://localhost:3000/api/storage/resumes', {
        method: 'POST',
        body: 'invalid json',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      await expect(POST(request)).rejects.toThrow()
    })

    it('handles different file extensions', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
      }

      const mockSignedUrl = {
        signedUrl: 'https://supabase.co/storage/upload/signed-url',
        token: 'upload-token-123',
      }

      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      })

      mockServiceClient.storage.createSignedUploadUrl.mockResolvedValue({
        data: mockSignedUrl,
        error: null,
      })

      const testCases = [
        'resume.pdf',
        'cv.docx',
        'portfolio.txt',
        'resume with spaces.pdf',
      ]

      for (const fileName of testCases) {
        const requestBody = { fileName }

        const request = new NextRequest('http://localhost:3000/api/storage/resumes', {
          method: 'POST',
          body: JSON.stringify(requestBody),
          headers: {
            'Content-Type': 'application/json',
          },
        })

        const response = await POST(request)
        const data = await response.json()

        expect(response.status).toBe(200)
        expect(data.path).toBe(`user-123/1640995200000-${fileName}`)
      }
    })

    it('handles empty fileName string', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
      }

      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      })

      const requestBody = {
        fileName: '',
      }

      const request = new NextRequest('http://localhost:3000/api/storage/resumes', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('fileName required')
    })
  })
})