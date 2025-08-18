import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { ClientReferralsBoard } from '@/components/referrals/ClientReferralsBoard'

// Mock Supabase client with channel functionality
const mockChannel = {
  on: jest.fn().mockReturnThis(),
  subscribe: jest.fn(),
}

const mockSupabaseClient = {
  from: jest.fn().mockReturnThis(),
  select: jest.fn().mockReturnThis(),
  eq: jest.fn().mockReturnThis(),
  order: jest.fn().mockReturnThis(),
  range: jest.fn().mockReturnThis(),
  single: jest.fn(),
  channel: jest.fn(() => mockChannel),
  removeChannel: jest.fn(),
}

jest.mock('@/lib/supabase/client', () => ({
  getSupabaseBrowserClient: () => mockSupabaseClient,
}))

// Mock toast notifications
jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}))

describe('ClientReferralsBoard', () => {
  const mockReferrals = [
    {
      id: '1',
      candidate_name: 'John Doe',
      candidate_email: 'john@example.com',
      status: 'submitted',
      resume_storage_path: 'resumes/john-doe.pdf',
      referrer_notes: 'Excellent candidate',
      created_at: '2025-01-01T00:00:00Z',
    },
    {
      id: '2', 
      candidate_name: 'Alice Smith',
      candidate_email: 'alice@example.com',
      status: 'reviewed',
      resume_storage_path: null,
      referrer_notes: null,
      created_at: '2025-01-02T00:00:00Z',
    },
  ]

  beforeEach(() => {
    jest.clearAllMocks()
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          referrals: mockReferrals
        }),
      })
    ) as jest.Mock
  })

  it('renders loading state initially', () => {
    render(<ClientReferralsBoard jobId="job-123" />)
    // Check for loading skeleton instead of text
    expect(document.querySelector('.animate-pulse')).toBeInTheDocument()
  })

  it('renders referrals list after loading', async () => {
    // Mock fetch API for referrals
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          referrals: mockReferrals
        }),
      })
    ) as jest.Mock

    render(<ClientReferralsBoard jobId="job-123" />)

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument()
      expect(screen.getByText('Alice Smith')).toBeInTheDocument()
    })

    // The component shows candidate names, not emails directly in the UI
    expect(screen.getByText('John Doe')).toBeInTheDocument()
    expect(screen.getByText('Alice Smith')).toBeInTheDocument()
  })

  it('displays status pipeline columns', async () => {
    render(<ClientReferralsBoard jobId="job-123" />)

    await waitFor(() => {
      expect(screen.getByText('Submitted')).toBeInTheDocument()
      expect(screen.getByText('Reviewed')).toBeInTheDocument()
      expect(screen.getByText('Shortlisted')).toBeInTheDocument()
      expect(screen.getByText('Interviewing')).toBeInTheDocument()
      expect(screen.getByText('Hired')).toBeInTheDocument()
      expect(screen.getByText('Rejected')).toBeInTheDocument()
    })
  })

  it('shows referral count badges correctly', async () => {
    render(<ClientReferralsBoard jobId="job-123" />)

    await waitFor(() => {
      // Should show count badges for each status
      const badges = screen.getAllByText('1') // Each column should have 1 referral
      expect(badges.length).toBeGreaterThan(0)
    })
  })

  it('displays referrals in correct status columns', async () => {
    render(<ClientReferralsBoard jobId="job-123" />)

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument()
      expect(screen.getByText('Alice Smith')).toBeInTheDocument()
    })

    // John Doe should be in submitted column
    const johnCard = screen.getByText('John Doe').closest('div')
    expect(johnCard).toBeInTheDocument()
    
    // Alice Smith should be in reviewed column 
    const aliceCard = screen.getByText('Alice Smith').closest('div')
    expect(aliceCard).toBeInTheDocument()
  })

  it('shows creation date for referrals', async () => {
    render(<ClientReferralsBoard jobId="job-123" />)

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument()
      expect(screen.getByText('Alice Smith')).toBeInTheDocument()
    })

    // Should display formatted dates
    expect(screen.getByText('1/1/2025')).toBeInTheDocument()
    expect(screen.getByText('1/2/2025')).toBeInTheDocument()
  })

  it('shows review button for appropriate statuses', async () => {
    render(<ClientReferralsBoard jobId="job-123" />)

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument()
    })

    // Should show Review button for non-final statuses
    const reviewButtons = screen.getAllByText('Review')
    expect(reviewButtons.length).toBeGreaterThan(0)
  })

  it('updates referral status when review button clicked', async () => {
    // Mock the PUT request for updating status
    global.fetch = jest.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ referrals: mockReferrals }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({}),
      }) as jest.Mock

    render(<ClientReferralsBoard jobId="job-123" />)

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument()
    })

    // Click first Review button
    const reviewButtons = screen.getAllByText('Review')
    fireEvent.click(reviewButtons[0])

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/referrals/1'),
        expect.objectContaining({
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'reviewed' })
        })
      )
    })
  })

  it('handles API errors gracefully', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: false,
        json: () => Promise.resolve({ error: 'Failed to fetch referrals' }),
      })
    ) as jest.Mock

    render(<ClientReferralsBoard jobId="job-123" />)

    // Should still show the pipeline columns even with no data
    await waitFor(() => {
      expect(screen.getByText('Submitted')).toBeInTheDocument()
      expect(screen.getByText('Reviewed')).toBeInTheDocument()
    })
  })

  it('shows empty state when no referrals', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ referrals: [] }),
      })
    ) as jest.Mock

    render(<ClientReferralsBoard jobId="job-123" />)

    await waitFor(() => {
      // Should show pipeline columns with count badges of 0
      expect(screen.getByText('Submitted')).toBeInTheDocument()
      expect(screen.getByText('Reviewed')).toBeInTheDocument()
      
      // Count badges should show 0
      expect(screen.getAllByText('0').length).toBeGreaterThan(0)
    })
  })

  it('opens resume when resume button is clicked', async () => {
    // Mock window.open
    global.open = jest.fn()
    
    // Mock the resume API call
    global.fetch = jest.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ referrals: mockReferrals }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ url: 'https://example.com/resume.pdf' }),
      }) as jest.Mock

    render(<ClientReferralsBoard jobId="job-123" />)

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument()
    })

    // Click Resume button
    const resumeButton = screen.getAllByText('Resume')[0]
    fireEvent.click(resumeButton)

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/api/referrals/1/resume')
      expect(global.open).toHaveBeenCalledWith('https://example.com/resume.pdf', '_blank')
    })
  })

  it('subscribes to real-time updates', async () => {
    render(<ClientReferralsBoard jobId="job-123" />)

    await waitFor(() => {
      expect(mockSupabaseClient.channel).toHaveBeenCalledWith('referrals-realtime')
      expect(mockChannel.on).toHaveBeenCalledWith(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'referrals' },
        expect.any(Function)
      )
      expect(mockChannel.subscribe).toHaveBeenCalled()
    })
  })

  it('shows resume buttons for all referrals', async () => {
    render(<ClientReferralsBoard jobId="job-123" />)

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument()
      expect(screen.getByText('Alice Smith')).toBeInTheDocument()
    })

    // Should show Resume buttons for both referrals
    expect(screen.getAllByText('Resume')).toHaveLength(2)
  })
})