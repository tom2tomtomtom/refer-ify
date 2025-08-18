/**
 * @jest-environment jsdom
 */
import React from 'react'
import { render, screen } from '@testing-library/react'
import ReferCandidatePage from '@/app/(referrals)/refer/[jobId]/page'

// Mock authentication
const mockUser = { 
  id: 'select-123', 
  email: 'select@example.com',
  role: 'select_circle'
}

jest.mock('@/lib/auth', () => ({
  requireRole: jest.fn(),
}))

const { requireRole } = require('@/lib/auth')

// Mock Supabase server client
const mockSupabaseClient = {
  from: jest.fn().mockReturnThis(),
  select: jest.fn().mockReturnThis(),
  eq: jest.fn().mockReturnThis(),
  single: jest.fn(),
}

jest.mock('@/lib/supabase/server', () => ({
  getSupabaseServerComponentClient: jest.fn(() => Promise.resolve(mockSupabaseClient)),
}))

// Mock ReferralForm component
jest.mock('@/components/referrals/ReferralForm', () => ({
  ReferralForm: ({ job }: { job: any }) => (
    <div data-testid="referral-form" data-job-id={job?.id}>
      <h1>Refer a Candidate</h1>
      <div>Job: {job?.title || 'Unknown Job'}</div>
      <form>
        <input placeholder="Candidate name" />
        <input placeholder="Candidate email" />
        <button type="submit">Submit Referral</button>
      </form>
    </div>
  ),
}))

describe('Refer Candidate Page', () => {
  const mockJob = {
    id: 'job-123',
    title: 'Senior Software Engineer',
    description: 'Looking for experienced developer',
    salary_min: 120000,
    salary_max: 180000,
  }

  beforeEach(() => {
    jest.clearAllMocks()
    requireRole.mockResolvedValue({ user: mockUser })
    mockSupabaseClient.single.mockResolvedValue({
      data: mockJob,
      error: null,
    })
  })

  it('renders referral form with job data', async () => {
    const mockParams = Promise.resolve({ jobId: 'job-123' })
    const PageComponent = await ReferCandidatePage({ params: mockParams })
    render(PageComponent)

    const referralForm = screen.getByTestId('referral-form')
    expect(referralForm).toBeInTheDocument()
    expect(referralForm).toHaveAttribute('data-job-id', 'job-123')
    
    expect(screen.getByText('Refer a Candidate')).toBeInTheDocument()
    expect(screen.getByText('Job: Senior Software Engineer')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Candidate name')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Candidate email')).toBeInTheDocument()
    expect(screen.getByText('Submit Referral')).toBeInTheDocument()
  })

  it('requires select_circle or founding_circle role for access', async () => {
    const mockParams = Promise.resolve({ jobId: 'job-123' })
    await ReferCandidatePage({ params: mockParams })
    
    expect(requireRole).toHaveBeenCalledWith(['select_circle', 'founding_circle'])
  })

  it('fetches job data by ID', async () => {
    const mockParams = Promise.resolve({ jobId: 'job-456' })
    await ReferCandidatePage({ params: mockParams })

    expect(mockSupabaseClient.from).toHaveBeenCalledWith('jobs')
    expect(mockSupabaseClient.select).toHaveBeenCalledWith('*')
    expect(mockSupabaseClient.eq).toHaveBeenCalledWith('id', 'job-456')
    expect(mockSupabaseClient.single).toHaveBeenCalled()
  })

  it('handles job not found gracefully', async () => {
    mockSupabaseClient.single.mockResolvedValue({
      data: null,
      error: { message: 'Job not found' },
    })

    const mockParams = Promise.resolve({ jobId: 'nonexistent-job' })
    const PageComponent = await ReferCandidatePage({ params: mockParams })
    render(PageComponent)

    const referralForm = screen.getByTestId('referral-form')
    expect(referralForm).toBeInTheDocument()
    expect(screen.getByText('Job: Unknown Job')).toBeInTheDocument()
  })

  it('throws error if user lacks required role', async () => {
    requireRole.mockRejectedValue(new Error('Access denied - insufficient role'))

    const mockParams = Promise.resolve({ jobId: 'job-123' })
    await expect(ReferCandidatePage({ params: mockParams })).rejects.toThrow('Access denied - insufficient role')
  })

  it('handles different job IDs correctly', async () => {
    const jobIds = ['job-001', 'job-002', 'job-003']

    for (const jobId of jobIds) {
      const customJob = { ...mockJob, id: jobId, title: `Job ${jobId}` }
      mockSupabaseClient.single.mockResolvedValue({
        data: customJob,
        error: null,
      })

      const mockParams = Promise.resolve({ jobId })
      const PageComponent = await ReferCandidatePage({ params: mockParams })
      const { unmount } = render(PageComponent)

      expect(screen.getByTestId('referral-form')).toHaveAttribute('data-job-id', jobId)
      expect(screen.getByText(`Job: Job ${jobId}`)).toBeInTheDocument()
      
      unmount() // Clean up DOM between iterations
    }
  })

  it('works with founding_circle role', async () => {
    const foundingUser = { 
      id: 'founding-123', 
      email: 'founding@example.com',
      role: 'founding_circle'
    }
    requireRole.mockResolvedValue({ user: foundingUser })

    const mockParams = Promise.resolve({ jobId: 'job-123' })
    const PageComponent = await ReferCandidatePage({ params: mockParams })
    render(PageComponent)

    expect(screen.getByTestId('referral-form')).toBeInTheDocument()
    expect(requireRole).toHaveBeenCalledWith(['select_circle', 'founding_circle'])
  })

  it('handles database connection errors', async () => {
    mockSupabaseClient.single.mockRejectedValue(new Error('Database connection failed'))

    const mockParams = Promise.resolve({ jobId: 'job-123' })
    
    // Should throw database error
    await expect(ReferCandidatePage({ params: mockParams })).rejects.toThrow('Database connection failed')
  })

  it('passes correct job data structure to ReferralForm', async () => {
    const complexJob = {
      id: 'job-complex',
      title: 'VP Engineering',
      description: 'Lead engineering organization',
      salary_min: 200000,
      salary_max: 300000,
      location: 'San Francisco',
      remote_ok: true,
      client_id: 'client-123',
    }

    mockSupabaseClient.single.mockResolvedValue({
      data: complexJob,
      error: null,
    })

    const mockParams = Promise.resolve({ jobId: 'job-complex' })
    const PageComponent = await ReferCandidatePage({ params: mockParams })
    render(PageComponent)

    const referralForm = screen.getByTestId('referral-form')
    expect(referralForm).toHaveAttribute('data-job-id', 'job-complex')
    expect(screen.getByText('Job: VP Engineering')).toBeInTheDocument()
  })

  it('awaits params correctly', async () => {
    let resolveParams: (value: { jobId: string }) => void
    const paramsPromise = new Promise<{ jobId: string }>((resolve) => {
      resolveParams = resolve
    })

    // Start the page component render
    const pagePromise = ReferCandidatePage({ params: paramsPromise })

    // Resolve params after a delay
    setTimeout(() => resolveParams!({ jobId: 'delayed-job' }), 10)

    const PageComponent = await pagePromise
    render(PageComponent)

    expect(mockSupabaseClient.eq).toHaveBeenCalledWith('id', 'delayed-job')
  })
})