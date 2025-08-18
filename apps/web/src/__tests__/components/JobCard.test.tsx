import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { JobCard } from '@/components/jobs/JobCard'

const mockJob = {
  id: '1',
  title: 'Software Engineer',
  description: 'Build amazing applications with React and TypeScript',
  location_type: 'remote' as const,
  location_city: 'San Francisco',
  salary_min: 80000,
  salary_max: 120000,
  currency: 'USD',
  status: 'active' as const,
  subscription_tier: 'connect' as const,
  skills: ['React', 'TypeScript', 'Node.js'],
  experience_level: 'mid' as const,
  job_type: 'full_time' as const,
  created_at: '2023-01-01T00:00:00.000Z',
  _count: {
    referrals: 5,
  },
}

jest.mock('next/link', () => {
  return ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href} data-testid="next-link">
      {children}
    </a>
  )
})

jest.mock('@/components/referrals/ReferralModal', () => ({
  ReferralModal: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="referral-modal">{children}</div>
  ),
}))

describe('JobCard', () => {
  it('renders job information correctly', () => {
    render(<JobCard job={mockJob} />)

    expect(screen.getByText('Software Engineer')).toBeInTheDocument()
    expect(screen.getByText('Build amazing applications with React and TypeScript')).toBeInTheDocument()
    expect(screen.getByText('Remote')).toBeInTheDocument()
    expect(screen.getByText('Full-time')).toBeInTheDocument()
    expect(screen.getByText('Mid-level')).toBeInTheDocument()
    expect(screen.getByText('active')).toBeInTheDocument()
    expect(screen.getByText('$80,000 - $120,000')).toBeInTheDocument()
    expect(screen.getByText('5 referrals')).toBeInTheDocument()
  })

  it('renders skills correctly', () => {
    render(<JobCard job={mockJob} />)

    expect(screen.getByText('React')).toBeInTheDocument()
    expect(screen.getByText('TypeScript')).toBeInTheDocument()
    expect(screen.getByText('Node.js')).toBeInTheDocument()
  })

  it('handles skills overflow correctly', () => {
    const jobWithManySkills = {
      ...mockJob,
      skills: ['React', 'TypeScript', 'Node.js', 'Python', 'Java', 'Go'],
    }

    render(<JobCard job={jobWithManySkills} />)

    expect(screen.getByText('React')).toBeInTheDocument()
    expect(screen.getByText('TypeScript')).toBeInTheDocument()
    expect(screen.getByText('Node.js')).toBeInTheDocument()
    expect(screen.getByText('+3')).toBeInTheDocument()
  })

  it('shows client actions when variant is client', () => {
    render(<JobCard job={mockJob} variant="client" showActions={true} />)

    const dropdownButton = screen.getByRole('button')
    expect(dropdownButton).toBeInTheDocument()
  })

  it('shows referral button when variant is referrer', () => {
    render(<JobCard job={mockJob} variant="referrer" />)

    expect(screen.getByText('Refer Professional')).toBeInTheDocument()
    expect(screen.getByTestId('referral-modal')).toBeInTheDocument()
  })

  it('calls onStatusChange when status change action is clicked', () => {
    const mockOnStatusChange = jest.fn()
    render(<JobCard job={mockJob} onStatusChange={mockOnStatusChange} />)

    const dropdownButton = screen.getByRole('button')
    fireEvent.click(dropdownButton)

    const pauseButton = screen.getByText('Pause Job')
    fireEvent.click(pauseButton)

    expect(mockOnStatusChange).toHaveBeenCalledWith('1', 'paused')
  })

  it('calls onDelete when delete action is clicked', () => {
    const mockOnDelete = jest.fn()
    render(<JobCard job={mockJob} onDelete={mockOnDelete} />)

    const dropdownButton = screen.getByRole('button')
    fireEvent.click(dropdownButton)

    const deleteButton = screen.getByText('Archive Job')
    fireEvent.click(deleteButton)

    expect(mockOnDelete).toHaveBeenCalledWith('1')
  })

  it('formats salary correctly for single value', () => {
    const jobWithMinSalary = {
      ...mockJob,
      salary_min: 90000,
      salary_max: undefined,
    }

    render(<JobCard job={jobWithMinSalary} />)
    expect(screen.getByText('$90,000')).toBeInTheDocument()
  })

  it('handles missing salary gracefully', () => {
    const jobWithoutSalary = {
      ...mockJob,
      salary_min: undefined,
      salary_max: undefined,
    }

    render(<JobCard job={jobWithoutSalary} />)
    
    const dollarSignIcon = screen.queryByTestId('dollar-sign')
    expect(dollarSignIcon).not.toBeInTheDocument()
  })

  it('formats different location types correctly', () => {
    const hybridJob = {
      ...mockJob,
      location_type: 'hybrid' as const,
      location_city: 'New York',
    }

    render(<JobCard job={hybridJob} />)
    expect(screen.getByText('New York')).toBeInTheDocument()
  })

  it('shows paused status correctly', () => {
    const pausedJob = {
      ...mockJob,
      status: 'paused' as const,
    }

    render(<JobCard job={pausedJob} />)
    expect(screen.getByText('paused')).toBeInTheDocument()
  })

  it('hides actions when showActions is false', () => {
    render(<JobCard job={mockJob} showActions={false} />)

    const dropdownButton = screen.queryByRole('button')
    expect(dropdownButton).not.toBeInTheDocument()
  })

  it('renders date correctly', () => {
    render(<JobCard job={mockJob} />)
    
    expect(screen.getByText('1/1/2023')).toBeInTheDocument()
  })

  it('handles missing referral count', () => {
    const jobWithoutCount = {
      ...mockJob,
      _count: undefined,
    }

    render(<JobCard job={jobWithoutCount} />)
    
    const referralsText = screen.queryByText(/referrals/)
    expect(referralsText).not.toBeInTheDocument()
  })

  it('renders subscription tier styling correctly', () => {
    const priorityJob = {
      ...mockJob,
      subscription_tier: 'priority' as const,
    }

    const { container } = render(<JobCard job={priorityJob} />)
    const card = container.querySelector('.bg-purple-50')
    expect(card).toBeInTheDocument()
  })
})