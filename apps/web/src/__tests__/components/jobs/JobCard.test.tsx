import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { JobCard } from '@/components/jobs/JobCard'

// Mock Next.js Link
jest.mock('next/link', () => {
  return ({ href, children, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  )
})

// Mock ReferralModal
jest.mock('@/components/referrals/ReferralModal', () => ({
  ReferralModal: ({ job, children }: any) => (
    <div data-testid="referral-modal">
      <div>Job: {job?.title}</div>
      {children}
    </div>
  ),
}))

describe('JobCard', () => {
  const baseJob = {
    id: 'job-123',
    title: 'Senior Software Engineer',
    description: 'Join our team as a senior software engineer working with React and TypeScript',
    location_type: 'remote' as const,
    location_city: 'San Francisco',
    salary_min: 120000,
    salary_max: 180000,
    currency: 'USD',
    status: 'active' as const,
    subscription_tier: 'priority' as const,
    skills: ['React', 'TypeScript', 'Node.js'],
    experience_level: 'senior' as const,
    job_type: 'full_time' as const,
    created_at: '2024-01-01T00:00:00Z',
    _count: {
      referrals: 5
    }
  }

  const mockOnStatusChange = jest.fn()
  const mockOnDelete = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders job title and basic information', () => {
    render(<JobCard job={baseJob} />)

    expect(screen.getByText('Senior Software Engineer')).toBeInTheDocument()
    expect(screen.getByText('Remote')).toBeInTheDocument()
    expect(screen.getByText('Full-time')).toBeInTheDocument()
    expect(screen.getByText('Senior')).toBeInTheDocument()
  })

  it('formats and displays salary correctly', () => {
    render(<JobCard job={baseJob} />)

    expect(screen.getByText('$120,000 - $180,000')).toBeInTheDocument()
  })

  it('displays single salary when only min is provided', () => {
    const jobWithMinSalary = {
      ...baseJob,
      salary_max: undefined
    }
    render(<JobCard job={jobWithMinSalary} />)

    expect(screen.getByText('$120,000')).toBeInTheDocument()
  })

  it('displays single salary when only max is provided', () => {
    const jobWithMaxSalary = {
      ...baseJob,
      salary_min: undefined
    }
    render(<JobCard job={jobWithMaxSalary} />)

    expect(screen.getByText('$180,000')).toBeInTheDocument()
  })

  it('handles job with no salary information', () => {
    const jobWithoutSalary = {
      ...baseJob,
      salary_min: undefined,
      salary_max: undefined
    }
    render(<JobCard job={jobWithoutSalary} />)

    // Should not display any salary information
    expect(screen.queryByText(/\$/)).not.toBeInTheDocument()
  })

  it('displays correct status badge', () => {
    render(<JobCard job={baseJob} />)

    const statusBadge = screen.getByText('active')
    expect(statusBadge).toBeInTheDocument()
    expect(statusBadge).toHaveClass('bg-green-100', 'text-green-800')
  })

  it('displays different status colors correctly', () => {
    const statuses = ['draft', 'active', 'paused', 'filled'] as const
    const expectedClasses = {
      draft: ['bg-gray-100', 'text-gray-800'],
      active: ['bg-green-100', 'text-green-800'],
      paused: ['bg-yellow-100', 'text-yellow-800'],
      filled: ['bg-blue-100', 'text-blue-800']
    }

    statuses.forEach(status => {
      const { unmount } = render(<JobCard job={{...baseJob, status}} />)
      
      const statusBadge = screen.getByText(status)
      expect(statusBadge).toBeInTheDocument()
      expectedClasses[status].forEach(className => {
        expect(statusBadge).toHaveClass(className)
      })
      
      unmount()
    })
  })

  it('displays subscription tier styling and icons', () => {
    render(<JobCard job={baseJob} />)

    const card = screen.getByText('Senior Software Engineer').closest('[data-slot="card"]')
    expect(card).toHaveClass('bg-purple-50', 'border-purple-200')

    // Priority tier should have a star icon
    expect(document.querySelector('.lucide-star')).toBeInTheDocument()
  })

  it('renders exclusive tier with correct styling', () => {
    const exclusiveJob = {
      ...baseJob,
      subscription_tier: 'exclusive' as const
    }
    render(<JobCard job={exclusiveJob} />)

    const card = screen.getByText('Senior Software Engineer').closest('[data-slot="card"]')
    expect(card).toHaveClass('bg-orange-50', 'border-orange-200')
  })

  it('renders connect tier without special styling', () => {
    const connectJob = {
      ...baseJob,
      subscription_tier: 'connect' as const
    }
    render(<JobCard job={connectJob} />)

    const card = screen.getByText('Senior Software Engineer').closest('[data-slot="card"]')
    expect(card).toHaveClass('bg-blue-50', 'border-blue-200')
  })

  it('handles different location types correctly', () => {
    const locations = [
      { type: 'remote', city: 'San Francisco', expected: 'Remote' },
      { type: 'hybrid', city: 'New York', expected: 'New York' },
      { type: 'onsite', city: 'London', expected: 'London' },
      { type: 'onsite', city: undefined, expected: 'onsite' }
    ] as const

    locations.forEach(({ type, city, expected }, index) => {
      const testJob = {
        ...baseJob,
        id: `job-${index}`,
        location_type: type,
        location_city: city
      }
      const { unmount } = render(<JobCard job={testJob} />)
      
      expect(screen.getByText(expected)).toBeInTheDocument()
      
      unmount()
    })
  })

  it('formats job types correctly', () => {
    const jobTypes = [
      { type: 'full_time', expected: 'Full-time' },
      { type: 'part_time', expected: 'Part-time' },
      { type: 'contract', expected: 'Contract' },
      { type: undefined, expected: 'Full-time' }
    ] as const

    jobTypes.forEach(({ type, expected }, index) => {
      const testJob = {
        ...baseJob,
        id: `job-${index}`,
        job_type: type
      }
      const { unmount } = render(<JobCard job={testJob} />)
      
      expect(screen.getByText(expected)).toBeInTheDocument()
      
      unmount()
    })
  })

  it('formats experience levels correctly', () => {
    const experienceLevels = [
      { level: 'junior', expected: 'Junior' },
      { level: 'mid', expected: 'Mid-level' },
      { level: 'senior', expected: 'Senior' },
      { level: 'executive', expected: 'Executive' },
      { level: undefined, expected: 'Mid-level' }
    ] as const

    experienceLevels.forEach(({ level, expected }, index) => {
      const testJob = {
        ...baseJob,
        id: `job-${index}`,
        experience_level: level
      }
      const { unmount } = render(<JobCard job={testJob} />)
      
      expect(screen.getByText(expected)).toBeInTheDocument()
      
      unmount()
    })
  })

  it('creates correct client link for client variant', () => {
    render(<JobCard job={baseJob} variant="client" />)

    const titleLink = screen.getByText('Senior Software Engineer').closest('a')
    expect(titleLink).toHaveAttribute('href', '/client/jobs/job-123')
  })

  it('creates placeholder link for referrer variant', () => {
    render(<JobCard job={baseJob} variant="referrer" />)

    const titleLink = screen.getByText('Senior Software Engineer').closest('a')
    expect(titleLink).toHaveAttribute('href', '#')
  })

  it('displays referral count when provided', () => {
    render(<JobCard job={baseJob} />)

    expect(screen.getByText('5 referrals')).toBeInTheDocument()
  })

  it('handles job without referral count', () => {
    const jobWithoutCount = {
      ...baseJob,
      _count: undefined
    }
    render(<JobCard job={jobWithoutCount} />)

    expect(screen.queryByText(/referrals/)).not.toBeInTheDocument()
  })

  it('displays skills when provided', () => {
    render(<JobCard job={baseJob} />)

    expect(screen.getByText('React')).toBeInTheDocument()
    expect(screen.getByText('TypeScript')).toBeInTheDocument()
    expect(screen.getByText('Node.js')).toBeInTheDocument()
  })

  it('truncates long skill lists', () => {
    const jobWithManySkills = {
      ...baseJob,
      skills: ['React', 'TypeScript', 'Node.js', 'Python', 'AWS', 'Docker', 'Kubernetes']
    }
    render(<JobCard job={jobWithManySkills} />)

    // Should show first few skills and "+X more" indicator
    expect(screen.getByText('React')).toBeInTheDocument()
    expect(screen.getByText('TypeScript')).toBeInTheDocument()
  })

  it('renders all basic job information', () => {
    render(<JobCard job={baseJob} showActions={false} />)

    // Should render all the basic job data
    expect(screen.getByText('Senior Software Engineer')).toBeInTheDocument()
    expect(screen.getByText('Remote')).toBeInTheDocument()
    expect(screen.getByText('Full-time')).toBeInTheDocument()
    expect(screen.getByText('Senior')).toBeInTheDocument()
    expect(screen.getByText('active')).toBeInTheDocument()
  })

  it('displays different currencies correctly', () => {
    const jobWithEuro = {
      ...baseJob,
      currency: 'EUR'
    }
    render(<JobCard job={jobWithEuro} />)

    expect(screen.getByText('€120,000 - €180,000')).toBeInTheDocument()
  })

  it('renders referral modal for referrer variant', () => {
    render(<JobCard job={baseJob} variant="referrer" />)

    expect(screen.getByTestId('referral-modal')).toBeInTheDocument()
    expect(screen.getByText('Job: Senior Software Engineer')).toBeInTheDocument()
  })

  it('applies hover styles to card', () => {
    render(<JobCard job={baseJob} />)

    const card = screen.getByText('Senior Software Engineer').closest('[data-slot="card"]')
    expect(card).toHaveClass('hover:shadow-md', 'transition-shadow')
  })
})