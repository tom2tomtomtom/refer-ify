import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { JobListingPage } from '@/components/jobs/JobListingPage'

// Mock fetch
global.fetch = jest.fn()

// Mock toast notifications
jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}))

describe('JobListingPage', () => {
  const mockJobs = [
    {
      id: '1',
      title: 'Senior Software Engineer',
      company: 'Tech Corp',
      description: 'Join our amazing team',
      location: 'Remote',
      salary_min: 100000,
      salary_max: 150000,
      currency: 'USD',
      skills: ['React', 'TypeScript'],
      experience_level: 'senior',
      job_type: 'full_time',
      subscription_tier: 'priority',
      status: 'active',
      created_at: '2025-01-01T00:00:00Z',
      referrals: [{ count: 5 }],
    },
    {
      id: '2',
      title: 'Product Manager',
      company: 'Startup Inc',
      description: 'Lead our product strategy',
      location: 'San Francisco',
      salary_min: 120000,
      salary_max: 180000,
      currency: 'USD',
      skills: ['Product Management', 'Analytics'],
      experience_level: 'mid',
      job_type: 'full_time',
      subscription_tier: 'connect',
      status: 'active',
      created_at: '2025-01-02T00:00:00Z',
      referrals: [{ count: 2 }],
    },
  ]

  beforeEach(() => {
    jest.clearAllMocks()
    ;(fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({
        jobs: mockJobs,
        total: 2,
        page: 1,
        limit: 12,
        hasMore: false,
      }),
    })
  })

  it('renders loading state initially', () => {
    render(<JobListingPage userRole="founding_circle" />)
    expect(screen.getByText('Loading jobs...')).toBeInTheDocument()
  })

  it('renders job listings after loading', async () => {
    render(<JobListingPage userRole="founding_circle" />)

    await waitFor(() => {
      expect(screen.getByText('Senior Software Engineer')).toBeInTheDocument()
      expect(screen.getByText('Product Manager')).toBeInTheDocument()
    })

    expect(screen.getByText('Tech Corp')).toBeInTheDocument()
    expect(screen.getByText('Startup Inc')).toBeInTheDocument()
  })

  it('displays job details correctly', async () => {
    render(<JobListingPage userRole="founding_circle" />)

    await waitFor(() => {
      expect(screen.getByText('Senior Software Engineer')).toBeInTheDocument()
    })

    expect(screen.getByText('Join our amazing team')).toBeInTheDocument()
    expect(screen.getByText('Remote')).toBeInTheDocument()
    expect(screen.getByText('$100,000 - $150,000')).toBeInTheDocument()
    expect(screen.getByText('React')).toBeInTheDocument()
    expect(screen.getByText('TypeScript')).toBeInTheDocument()
    expect(screen.getByText('5 referrals')).toBeInTheDocument()
  })

  it('filters jobs based on user role (founding_circle sees all)', async () => {
    render(<JobListingPage userRole="founding_circle" />)

    await waitFor(() => {
      expect(screen.getByText('Senior Software Engineer')).toBeInTheDocument()
      expect(screen.getByText('Product Manager')).toBeInTheDocument()
    })

    // Founding circle should see both priority and connect tier jobs
    expect(screen.getByText('Priority Tier')).toBeInTheDocument()
    expect(screen.getByText('Connect Tier')).toBeInTheDocument()
  })

  it('filters jobs for select_circle (no exclusive tier)', async () => {
    render(<JobListingPage userRole="select_circle" />)

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('tier=connect,priority'),
        expect.any(Object)
      )
    })
  })

  it('searches jobs correctly', async () => {
    render(<JobListingPage userRole="founding_circle" />)

    await waitFor(() => {
      expect(screen.getByText('Senior Software Engineer')).toBeInTheDocument()
    })

    const searchInput = screen.getByPlaceholderText('Search jobs...')
    fireEvent.change(searchInput, { target: { value: 'Engineer' } })
    fireEvent.submit(searchInput.closest('form')!)

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('search=Engineer'),
        expect.any(Object)
      )
    })
  })

  it('filters by experience level', async () => {
    render(<JobListingPage userRole="founding_circle" />)

    await waitFor(() => {
      expect(screen.getByText('Senior Software Engineer')).toBeInTheDocument()
    })

    const experienceFilter = screen.getByLabelText('Experience Level')
    fireEvent.change(experienceFilter, { target: { value: 'senior' } })

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('experience=senior'),
        expect.any(Object)
      )
    })
  })

  it('filters by job type', async () => {
    render(<JobListingPage userRole="founding_circle" />)

    await waitFor(() => {
      expect(screen.getByText('Senior Software Engineer')).toBeInTheDocument()
    })

    const jobTypeFilter = screen.getByLabelText('Job Type')
    fireEvent.change(jobTypeFilter, { target: { value: 'contract' } })

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('type=contract'),
        expect.any(Object)
      )
    })
  })

  it('filters by salary range', async () => {
    render(<JobListingPage userRole="founding_circle" />)

    await waitFor(() => {
      expect(screen.getByText('Senior Software Engineer')).toBeInTheDocument()
    })

    const minSalaryInput = screen.getByLabelText('Minimum Salary')
    const maxSalaryInput = screen.getByLabelText('Maximum Salary')

    fireEvent.change(minSalaryInput, { target: { value: '120000' } })
    fireEvent.change(maxSalaryInput, { target: { value: '200000' } })

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('salary_min=120000&salary_max=200000'),
        expect.any(Object)
      )
    })
  })

  it('handles pagination correctly', async () => {
    // Mock response with hasMore: true
    ;(fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        jobs: mockJobs,
        total: 25,
        page: 1,
        limit: 12,
        hasMore: true,
      }),
    })

    render(<JobListingPage userRole="founding_circle" />)

    await waitFor(() => {
      expect(screen.getByText('Senior Software Engineer')).toBeInTheDocument()
    })

    expect(screen.getByText('Load More')).toBeInTheDocument()

    // Click load more
    const loadMoreButton = screen.getByText('Load More')
    fireEvent.click(loadMoreButton)

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('page=2'),
        expect.any(Object)
      )
    })
  })

  it('opens referral modal when refer button is clicked', async () => {
    render(<JobListingPage userRole="founding_circle" />)

    await waitFor(() => {
      expect(screen.getByText('Senior Software Engineer')).toBeInTheDocument()
    })

    const referButtons = screen.getAllByText('Refer Someone')
    fireEvent.click(referButtons[0])

    await waitFor(() => {
      expect(screen.getByText('Refer a Professional')).toBeInTheDocument()
    })
  })

  it('handles API errors gracefully', async () => {
    ;(fetch as jest.Mock).mockResolvedValue({
      ok: false,
      json: async () => ({
        error: 'Failed to fetch jobs',
      }),
    })

    render(<JobListingPage userRole="founding_circle" />)

    await waitFor(() => {
      expect(screen.getByText('Error loading jobs')).toBeInTheDocument()
    })
  })

  it('shows empty state when no jobs found', async () => {
    ;(fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({
        jobs: [],
        total: 0,
        page: 1,
        limit: 12,
        hasMore: false,
      }),
    })

    render(<JobListingPage userRole="founding_circle" />)

    await waitFor(() => {
      expect(screen.getByText('No jobs found')).toBeInTheDocument()
      expect(screen.getByText('Try adjusting your filters')).toBeInTheDocument()
    })
  })

  it('clears filters correctly', async () => {
    render(<JobListingPage userRole="founding_circle" />)

    await waitFor(() => {
      expect(screen.getByText('Senior Software Engineer')).toBeInTheDocument()
    })

    // Apply some filters
    const searchInput = screen.getByPlaceholderText('Search jobs...')
    fireEvent.change(searchInput, { target: { value: 'Engineer' } })

    const experienceFilter = screen.getByLabelText('Experience Level')
    fireEvent.change(experienceFilter, { target: { value: 'senior' } })

    // Clear filters
    const clearButton = screen.getByText('Clear Filters')
    fireEvent.click(clearButton)

    expect(searchInput).toHaveValue('')
    expect(experienceFilter).toHaveValue('all')
  })

  it('sorts jobs correctly', async () => {
    render(<JobListingPage userRole="founding_circle" />)

    await waitFor(() => {
      expect(screen.getByText('Senior Software Engineer')).toBeInTheDocument()
    })

    const sortSelect = screen.getByLabelText('Sort by')
    fireEvent.change(sortSelect, { target: { value: 'salary_desc' } })

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('sort=salary_desc'),
        expect.any(Object)
      )
    })
  })

  it('displays correct tier badges', async () => {
    render(<JobListingPage userRole="founding_circle" />)

    await waitFor(() => {
      expect(screen.getByText('Priority Tier')).toBeInTheDocument()
      expect(screen.getByText('Connect Tier')).toBeInTheDocument()
    })

    // Check badge styling
    const priorityBadge = screen.getByText('Priority Tier')
    expect(priorityBadge).toHaveClass('bg-blue-100', 'text-blue-800')
  })
})