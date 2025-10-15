import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'
import { RealTimeJobFeed } from '@/components/jobs/RealTimeJobFeed'
import { toast } from 'sonner'

const mockJobs = [
  {
    id: '1',
    title: 'Senior Software Engineer',
    description: 'Build scalable applications',
    location_type: 'remote' as const,
    salary_min: 100000,
    salary_max: 150000,
    currency: 'USD',
    status: 'active' as const,
    subscription_tier: 'priority' as const,
    skills: ['React', 'TypeScript'],
    experience_level: 'senior' as const,
    job_type: 'full_time' as const,
    created_at: '2023-01-01T00:00:00.000Z',
    client: {
      first_name: 'John',
      last_name: 'Doe',
      company: 'Tech Corp',
    },
  },
  {
    id: '2',
    title: 'Product Manager',
    description: 'Lead product development',
    location_type: 'hybrid' as const,
    salary_min: 80000,
    salary_max: 120000,
    currency: 'USD',
    status: 'active' as const,
    subscription_tier: 'connect' as const,
    skills: ['Product Management', 'Analytics'],
    experience_level: 'mid' as const,
    job_type: 'full_time' as const,
    created_at: '2023-01-02T00:00:00.000Z',
    client: {
      first_name: 'Jane',
      last_name: 'Smith',
      company: 'Product Co',
    },
  },
]

const mockSupabaseClient = {
  from: jest.fn().mockReturnThis(),
  select: jest.fn().mockReturnThis(),
  eq: jest.fn().mockReturnThis(),
  in: jest.fn().mockReturnThis(),
  order: jest.fn().mockReturnThis(),
  limit: jest.fn().mockReturnThis(),
  or: jest.fn().mockReturnThis(),
  overlaps: jest.fn().mockReturnThis(),
  channel: jest.fn().mockReturnThis(),
  on: jest.fn().mockReturnThis(),
  subscribe: jest.fn(),
  removeChannel: jest.fn(),
}

jest.mock('@/lib/supabase/client', () => ({
  getSupabaseBrowserClient: () => mockSupabaseClient,
}))

jest.mock('@/components/jobs/JobCard', () => ({
  JobCard: ({ job }: { job: any }) => (
    <div data-testid={`job-card-${job.id}`}>
      <h3>{job.title}</h3>
      <p>{job.description}</p>
    </div>
  ),
}))

jest.mock('sonner', () => ({
  toast: {
    error: jest.fn(),
    success: jest.fn(),
  },
}))

describe('RealTimeJobFeed', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    
    // Default successful query mock
    mockSupabaseClient.from.mockImplementation(() => {
      const query = {
        ...mockSupabaseClient,
        then: (callback: (result: { data: any; error: null }) => void) => {
          // Use setTimeout to make callback async and avoid act() warnings
          setTimeout(() => callback({ data: mockJobs, error: null }), 0)
        },
      }
      return query
    })
  })

  it('renders job feed header correctly', () => {
    render(<RealTimeJobFeed userRole="select_circle" />)

    expect(screen.getByText('Opportunity Board')).toBeInTheDocument()
    expect(screen.getByText('Executive opportunities in real time')).toBeInTheDocument()
  })

  it('shows founder badge for founding_circle role users', () => {
    render(<RealTimeJobFeed userRole="founding_circle" />)

    expect(screen.getByText('Founder')).toBeInTheDocument()
  })

  it('does not show founder badge for select_circle role users', () => {
    render(<RealTimeJobFeed userRole="select_circle" />)

    expect(screen.queryByText('Founder')).not.toBeInTheDocument()
  })

  it('renders loading skeletons initially', () => {
    const { container } = render(<RealTimeJobFeed userRole="select_circle" />)

    const skeletons = container.querySelectorAll('[class*="animate-pulse"]')
    expect(skeletons.length).toBeGreaterThan(0)
  })

  it('renders job cards when data loads', async () => {
    render(<RealTimeJobFeed userRole="select_circle" />)

    await waitFor(() => {
      expect(screen.getByTestId('job-card-1')).toBeInTheDocument()
      expect(screen.getByTestId('job-card-2')).toBeInTheDocument()
    })

    expect(screen.getByText('Senior Software Engineer')).toBeInTheDocument()
    expect(screen.getByText('Product Manager')).toBeInTheDocument()
  })

  it('shows job count statistics', async () => {
    render(<RealTimeJobFeed userRole="select_circle" />)

    await waitFor(() => {
      expect(screen.getByText('2')).toBeInTheDocument() // Live Jobs count
    })
  })

  it('shows tier-based statistics', async () => {
    render(<RealTimeJobFeed userRole="select_circle" />)

    await waitFor(() => {
      expect(screen.getByText('Connect')).toBeInTheDocument()
      expect(screen.getByText('Priority')).toBeInTheDocument()
    })
  })

  it('shows exclusive tier for founding circle users', async () => {
    render(<RealTimeJobFeed userRole="founding_circle" />)

    await waitFor(() => {
      expect(screen.getByText('Exclusive')).toBeInTheDocument()
    })
  })

  it('filters jobs by search term', async () => {
    const user = userEvent.setup()
    render(<RealTimeJobFeed userRole="select_circle" />)

    const searchInput = screen.getByPlaceholderText('Search opportunities...')
    await user.type(searchInput, 'Software Engineer')

    expect(searchInput).toHaveValue('Software Engineer')
  })

  it('filters jobs by subscription tier', async () => {
    const user = userEvent.setup()
    render(<RealTimeJobFeed userRole="select_circle" />)

    const tierSelect = screen.getByDisplayValue('All Tiers')
    await user.click(tierSelect)

    const priorityOption = screen.getByText('Priority')
    await user.click(priorityOption)

    expect(mockSupabaseClient.eq).toHaveBeenCalledWith('subscription_tier', 'priority')
  })

  it('filters jobs by location type', async () => {
    const user = userEvent.setup()
    render(<RealTimeJobFeed userRole="select_circle" />)

    const locationSelect = screen.getByDisplayValue('All Types')
    await user.click(locationSelect)

    const remoteOption = screen.getByText('Remote')
    await user.click(remoteOption)

    expect(mockSupabaseClient.eq).toHaveBeenCalledWith('location_type', 'remote')
  })

  it('clears all filters when clear button is clicked', async () => {
    const user = userEvent.setup()
    render(<RealTimeJobFeed userRole="select_circle" />)

    // Apply a filter first
    const searchInput = screen.getByPlaceholderText('Search opportunities...')
    await user.type(searchInput, 'test')

    await waitFor(() => {
      expect(screen.getByText(/filter.* applied/)).toBeInTheDocument()
    })

    const clearButton = screen.getByText('Clear all')
    await user.click(clearButton)

    expect(searchInput).toHaveValue('')
  })

  it('handles API errors gracefully', async () => {
    // Mock API error
    mockSupabaseClient.from.mockImplementation(() => {
      const query = {
        ...mockSupabaseClient,
        then: (callback: (result: { data: null; error: Error }) => void) => {
          setTimeout(() => callback({ data: null, error: new Error('API Error') }), 0)
        },
      }
      return query
    })

    render(<RealTimeJobFeed userRole="select_circle" />)

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Failed to load job feed')
    })
  })

  it('shows empty state when no jobs are found', async () => {
    // Mock empty result
    mockSupabaseClient.from.mockImplementation(() => {
      const query = {
        ...mockSupabaseClient,
        then: (callback: (result: { data: any[]; error: null }) => void) => {
          setTimeout(() => callback({ data: [], error: null }), 0)
        },
      }
      return query
    })

    render(<RealTimeJobFeed userRole="select_circle" />)

    await waitFor(() => {
      expect(screen.getByText('No active jobs found')).toBeInTheDocument()
      expect(screen.getByText('Check back soon for new opportunities')).toBeInTheDocument()
    })
  })

  it('shows filtered empty state message when filters are applied', async () => {
    const user = userEvent.setup()
    
    // Mock empty result
    mockSupabaseClient.from.mockImplementation(() => {
      const query = {
        ...mockSupabaseClient,
        then: (callback: (result: { data: any[]; error: null }) => void) => {
          setTimeout(() => callback({ data: [], error: null }), 0)
        },
      }
      return query
    })

    render(<RealTimeJobFeed userRole="select_circle" />)

    // Apply a filter
    const searchInput = screen.getByPlaceholderText('Search opportunities...')
    await user.type(searchInput, 'test')

    await waitFor(() => {
      expect(screen.getByText('Try adjusting your filters to see more opportunities')).toBeInTheDocument()
    })
  })

  it('toggles notifications on/off', async () => {
    const user = userEvent.setup()
    render(<RealTimeJobFeed userRole="select_circle" />)

    const notificationButton = screen.getByRole('button', { name: '' }) // Bell icon button
    await user.click(notificationButton)

    // Verify the button state changed (opacity should be different)
    const bellIcon = notificationButton.querySelector('svg')
    expect(bellIcon).toHaveClass('opacity-50')
  })

  it('shows new jobs count when available', async () => {
    render(<RealTimeJobFeed userRole="select_circle" />)

    // Mock new jobs being detected (would typically happen via real-time updates)
    // This is a simplified test - in reality, the count would update through Supabase subscriptions

    await waitFor(() => {
      // The component starts with lastSeenTime set to now, so no "new" jobs initially
      expect(screen.queryByText(/New$/)).not.toBeInTheDocument()
    })
  })

  it('sets up real-time subscriptions correctly', () => {
    render(<RealTimeJobFeed userRole="select_circle" />)

    expect(mockSupabaseClient.channel).toHaveBeenCalledWith('job-feed-realtime')
    expect(mockSupabaseClient.on).toHaveBeenCalled()
    expect(mockSupabaseClient.subscribe).toHaveBeenCalled()
  })

  it('applies role-based filtering for select circle', () => {
    render(<RealTimeJobFeed userRole="select_circle" />)

    expect(mockSupabaseClient.in).toHaveBeenCalledWith('subscription_tier', ['connect', 'priority'])
  })

  it('applies role-based filtering for founding circle', () => {
    render(<RealTimeJobFeed userRole="founding_circle" />)

    // Founding circle should order by subscription_tier instead of filtering
    expect(mockSupabaseClient.order).toHaveBeenCalledWith('subscription_tier', { ascending: false })
  })
})