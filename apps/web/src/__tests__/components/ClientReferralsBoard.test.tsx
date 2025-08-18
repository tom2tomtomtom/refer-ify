import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { ClientReferralsBoard } from '@/components/referrals/ClientReferralsBoard'

// Mock Supabase client
const mockSupabaseClient = {
  from: jest.fn().mockReturnThis(),
  select: jest.fn().mockReturnThis(),
  eq: jest.fn().mockReturnThis(),
  order: jest.fn().mockReturnThis(),
  range: jest.fn().mockReturnThis(),
  single: jest.fn(),
}

jest.mock('@/lib/supabase/client', () => ({
  getSupabaseClient: () => mockSupabaseClient,
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
      status: 'pending',
      created_at: '2025-01-01T00:00:00Z',
      jobs: {
        title: 'Senior Developer',
        company: 'Tech Corp',
      },
      profiles: {
        full_name: 'Jane Referrer',
      },
    },
    {
      id: '2', 
      candidate_name: 'Alice Smith',
      candidate_email: 'alice@example.com',
      status: 'reviewing',
      created_at: '2025-01-02T00:00:00Z',
      jobs: {
        title: 'Product Manager',
        company: 'Startup Inc',
      },
      profiles: {
        full_name: 'Bob Referrer',
      },
    },
  ]

  beforeEach(() => {
    jest.clearAllMocks()
    mockSupabaseClient.single.mockResolvedValue({
      data: mockReferrals,
      error: null,
    })
  })

  it('renders loading state initially', () => {
    render(<ClientReferralsBoard />)
    expect(screen.getByText('Loading referrals...')).toBeInTheDocument()
  })

  it('renders referrals list after loading', async () => {
    render(<ClientReferralsBoard />)

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument()
      expect(screen.getByText('Alice Smith')).toBeInTheDocument()
    })

    expect(screen.getByText('john@example.com')).toBeInTheDocument()
    expect(screen.getByText('alice@example.com')).toBeInTheDocument()
    expect(screen.getByText('Senior Developer')).toBeInTheDocument()
    expect(screen.getByText('Product Manager')).toBeInTheDocument()
  })

  it('displays referrer information', async () => {
    render(<ClientReferralsBoard />)

    await waitFor(() => {
      expect(screen.getByText('Referred by Jane Referrer')).toBeInTheDocument()
      expect(screen.getByText('Referred by Bob Referrer')).toBeInTheDocument()
    })
  })

  it('shows status badges correctly', async () => {
    render(<ClientReferralsBoard />)

    await waitFor(() => {
      expect(screen.getByText('Pending')).toBeInTheDocument()
      expect(screen.getByText('Reviewing')).toBeInTheDocument()
    })
  })

  it('filters referrals by status', async () => {
    render(<ClientReferralsBoard />)

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument()
      expect(screen.getByText('Alice Smith')).toBeInTheDocument()
    })

    // Filter by pending status
    const statusFilter = screen.getByLabelText('Filter by Status')
    fireEvent.change(statusFilter, { target: { value: 'pending' } })

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument()
      expect(screen.queryByText('Alice Smith')).not.toBeInTheDocument()
    })
  })

  it('searches referrals by candidate name', async () => {
    render(<ClientReferralsBoard />)

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument()
      expect(screen.getByText('Alice Smith')).toBeInTheDocument()
    })

    // Search for John
    const searchInput = screen.getByLabelText('Search referrals')
    fireEvent.change(searchInput, { target: { value: 'John' } })

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument()
      expect(screen.queryByText('Alice Smith')).not.toBeInTheDocument()
    })
  })

  it('opens referral details modal on click', async () => {
    render(<ClientReferralsBoard />)

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument()
    })

    // Click on referral to open details
    const referralCard = screen.getByText('John Doe').closest('div')
    fireEvent.click(referralCard!)

    await waitFor(() => {
      expect(screen.getByText('Referral Details')).toBeInTheDocument()
      expect(screen.getByText('Candidate Information')).toBeInTheDocument()
    })
  })

  it('updates referral status', async () => {
    // Mock update API call
    mockSupabaseClient.single.mockResolvedValueOnce({
      data: { ...mockReferrals[0], status: 'interviewing' },
      error: null,
    })

    render(<ClientReferralsBoard />)

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument()
    })

    // Open referral details
    const referralCard = screen.getByText('John Doe').closest('div')
    fireEvent.click(referralCard!)

    await waitFor(() => {
      expect(screen.getByText('Referral Details')).toBeInTheDocument()
    })

    // Update status
    const statusSelect = screen.getByLabelText('Status')
    fireEvent.change(statusSelect, { target: { value: 'interviewing' } })

    const updateButton = screen.getByText('Update Status')
    fireEvent.click(updateButton)

    await waitFor(() => {
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('referrals')
    })
  })

  it('handles API errors gracefully', async () => {
    mockSupabaseClient.single.mockResolvedValue({
      data: null,
      error: { message: 'Failed to fetch referrals' },
    })

    render(<ClientReferralsBoard />)

    await waitFor(() => {
      expect(screen.getByText('Error loading referrals')).toBeInTheDocument()
    })
  })

  it('shows empty state when no referrals', async () => {
    mockSupabaseClient.single.mockResolvedValue({
      data: [],
      error: null,
    })

    render(<ClientReferralsBoard />)

    await waitFor(() => {
      expect(screen.getByText('No referrals found')).toBeInTheDocument()
      expect(screen.getByText('You haven\'t received any referrals yet.')).toBeInTheDocument()
    })
  })

  it('paginates referrals correctly', async () => {
    // Mock pagination data
    const paginatedReferrals = Array.from({ length: 15 }, (_, i) => ({
      id: `${i + 1}`,
      candidate_name: `Candidate ${i + 1}`,
      candidate_email: `candidate${i + 1}@example.com`,
      status: 'pending',
      created_at: '2025-01-01T00:00:00Z',
      jobs: {
        title: 'Developer',
        company: 'Company',
      },
      profiles: {
        full_name: 'Referrer',
      },
    }))

    mockSupabaseClient.single.mockResolvedValue({
      data: paginatedReferrals.slice(0, 10),
      error: null,
      count: 15,
    })

    render(<ClientReferralsBoard />)

    await waitFor(() => {
      expect(screen.getByText('Candidate 1')).toBeInTheDocument()
      expect(screen.getByText('Candidate 10')).toBeInTheDocument()
    })

    // Should show pagination controls
    expect(screen.getByText('Next')).toBeInTheDocument()
    expect(screen.getByText('1 of 2')).toBeInTheDocument()
  })

  it('sorts referrals by date correctly', async () => {
    render(<ClientReferralsBoard />)

    await waitFor(() => {
      expect(mockSupabaseClient.order).toHaveBeenCalledWith('created_at', { ascending: false })
    })
  })

  it('includes resume download link when available', async () => {
    const referralsWithResume = [
      {
        ...mockReferrals[0],
        resume_storage_path: 'resumes/john-doe-resume.pdf',
      },
    ]

    mockSupabaseClient.single.mockResolvedValue({
      data: referralsWithResume,
      error: null,
    })

    render(<ClientReferralsBoard />)

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument()
    })

    // Open referral details
    const referralCard = screen.getByText('John Doe').closest('div')
    fireEvent.click(referralCard!)

    await waitFor(() => {
      expect(screen.getByText('Download Resume')).toBeInTheDocument()
    })
  })
})