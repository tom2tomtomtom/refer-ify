/**
 * @jest-environment jsdom
 */
import React from 'react'
import { render, screen } from '@testing-library/react'
import ClientDashboardPage from '@/app/(dashboard)/client/page'

// Mock Next.js Link component
jest.mock('next/link', () => {
  return ({ href, children, ...props }: { href: string; children: React.ReactNode; [key: string]: unknown }) => (
    <a href={href} {...props}>
      {children}
    </a>
  )
})

// Mock authentication
const mockUser = { 
  id: 'client-123', 
  email: 'client@example.com',
  role: 'client'
}

jest.mock('@/lib/auth', () => ({
  requireRole: jest.fn(),
}))

import { requireRole } from '@/lib/auth'

// Mock Supabase server client
const mockSupabaseClient = {
  from: jest.fn().mockReturnThis(),
  select: jest.fn().mockReturnThis(),
  eq: jest.fn().mockReturnThis(),
  order: jest.fn().mockReturnThis(),
}

jest.mock('@/lib/supabase/server', () => ({
  getSupabaseServerComponentClient: jest.fn(() => Promise.resolve(mockSupabaseClient)),
}))

describe('Client Dashboard Page', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    requireRole.mockResolvedValue({ user: mockUser })
  })

  const mockJobs = [
    {
      id: 'job-1',
      title: 'Senior Software Engineer',
      status: 'active',
      client_id: 'client-123',
      created_at: '2024-01-15T10:00:00Z'
    },
    {
      id: 'job-2',
      title: 'Product Manager',
      status: 'draft',
      client_id: 'client-123',
      created_at: '2024-01-10T08:00:00Z'
    },
    {
      id: 'job-3',
      title: 'DevOps Engineer',
      status: 'active',
      client_id: 'client-123',
      created_at: '2024-01-08T14:00:00Z'
    }
  ]

  it('renders dashboard with user jobs and correct statistics', async () => {
    mockSupabaseClient.from.mockReturnValue({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      order: jest.fn().mockResolvedValue({
        data: mockJobs,
        error: null
      })
    })

    const PageComponent = await ClientDashboardPage()
    render(PageComponent)

    // Check main heading and description
    expect(screen.getByText('Client Dashboard')).toBeInTheDocument()
    expect(screen.getByText('Welcome back! Manage your job postings and referrals.')).toBeInTheDocument()

    // Check statistics are calculated correctly
    expect(screen.getByText('Active Jobs: 2')).toBeInTheDocument()
    expect(screen.getByText('Total Jobs: 3')).toBeInTheDocument()
    expect(screen.getByText('Draft Jobs: 1')).toBeInTheDocument()

    // Check job listings
    expect(screen.getByText('Senior Software Engineer')).toBeInTheDocument()
    expect(screen.getByText('Product Manager')).toBeInTheDocument()
    expect(screen.getByText('DevOps Engineer')).toBeInTheDocument()

    // Check job status and dates are displayed
    expect(screen.getAllByText(/Status: active/)).toHaveLength(2)
    expect(screen.getByText(/Status: draft/)).toBeInTheDocument()
    expect(screen.getAllByText(/Created: \d+\/\d+\/\d+/)).toHaveLength(3)
  })

  it('renders quick action buttons with correct links', async () => {
    mockSupabaseClient.from.mockReturnValue({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      order: jest.fn().mockResolvedValue({
        data: [],
        error: null
      })
    })

    const PageComponent = await ClientDashboardPage()
    render(PageComponent)

    // Check quick actions section
    expect(screen.getByText('Quick Actions')).toBeInTheDocument()

    // Check action buttons and their links
    const postJobButton = screen.getByText('Post New Job').closest('a')
    expect(postJobButton).toHaveAttribute('href', '/client/jobs/new')

    const viewAllJobsButton = screen.getByText('View All Jobs').closest('a')
    expect(viewAllJobsButton).toHaveAttribute('href', '/client/jobs')

    const manageSubscriptionButton = screen.getByText('Manage Subscription')
    expect(manageSubscriptionButton).toBeInTheDocument()
  })

  it('displays empty state when no jobs exist', async () => {
    mockSupabaseClient.from.mockReturnValue({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      order: jest.fn().mockResolvedValue({
        data: [],
        error: null
      })
    })

    const PageComponent = await ClientDashboardPage()
    render(PageComponent)

    // Check statistics show zeros
    expect(screen.getByText('Active Jobs: 0')).toBeInTheDocument()
    expect(screen.getByText('Total Jobs: 0')).toBeInTheDocument()
    expect(screen.getByText('Draft Jobs: 0')).toBeInTheDocument()

    // Check empty state message
    expect(screen.getByText('No jobs posted yet')).toBeInTheDocument()
    expect(screen.getByText('Post Your First Job')).toBeInTheDocument()

    const firstJobButton = screen.getByText('Post Your First Job').closest('a')
    expect(firstJobButton).toHaveAttribute('href', '/client/jobs/new')
  })

  it('handles null data from Supabase gracefully', async () => {
    mockSupabaseClient.from.mockReturnValue({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      order: jest.fn().mockResolvedValue({
        data: null,
        error: null
      })
    })

    const PageComponent = await ClientDashboardPage()
    render(PageComponent)

    // Should handle null data gracefully with zero counts
    expect(screen.getByText('Active Jobs: 0')).toBeInTheDocument()
    expect(screen.getByText('Total Jobs: 0')).toBeInTheDocument()
    expect(screen.getByText('Draft Jobs: 0')).toBeInTheDocument()

    // Should show empty state
    expect(screen.getByText('No jobs posted yet')).toBeInTheDocument()
  })

  it('displays only the first 5 recent jobs', async () => {
    const manyJobs = Array.from({ length: 8 }, (_, i) => ({
      id: `job-${i + 1}`,
      title: `Job Title ${i + 1}`,
      status: 'active',
      client_id: 'client-123',
      created_at: `2024-01-${String(i + 1).padStart(2, '0')}T10:00:00Z`
    }))

    mockSupabaseClient.from.mockReturnValue({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      order: jest.fn().mockResolvedValue({
        data: manyJobs,
        error: null
      })
    })

    const PageComponent = await ClientDashboardPage()
    render(PageComponent)

    // Should show correct total count
    expect(screen.getByText('Total Jobs: 8')).toBeInTheDocument()

    // Should only display first 5 jobs in recent section
    expect(screen.getByText('Job Title 1')).toBeInTheDocument()
    expect(screen.getByText('Job Title 5')).toBeInTheDocument()
    expect(screen.queryByText('Job Title 6')).not.toBeInTheDocument()
    expect(screen.queryByText('Job Title 8')).not.toBeInTheDocument()
  })

  it('handles jobs with missing titles', async () => {
    const jobsWithMissingTitles = [
      {
        id: 'job-1',
        title: null,
        status: 'active',
        client_id: 'client-123',
        created_at: '2024-01-15T10:00:00Z'
      },
      {
        id: 'job-2',
        title: '',
        status: 'draft',
        client_id: 'client-123',
        created_at: '2024-01-10T08:00:00Z'
      }
    ]

    mockSupabaseClient.from.mockReturnValue({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      order: jest.fn().mockResolvedValue({
        data: jobsWithMissingTitles,
        error: null
      })
    })

    const PageComponent = await ClientDashboardPage()
    render(PageComponent)

    // Should display fallback title for jobs without titles
    expect(screen.getAllByText('Untitled Job')).toHaveLength(2)
  })

  it('calls requireRole with correct role parameter', async () => {
    mockSupabaseClient.from.mockReturnValue({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      order: jest.fn().mockResolvedValue({
        data: [],
        error: null
      })
    })

    await ClientDashboardPage()

    expect(requireRole).toHaveBeenCalledWith('client')
  })

  it('queries jobs with correct parameters', async () => {
    const mockFrom = jest.fn().mockReturnThis()
    const mockSelect = jest.fn().mockReturnThis()
    const mockEq = jest.fn().mockReturnThis()
    const mockOrder = jest.fn().mockResolvedValue({ data: [], error: null })

    mockSupabaseClient.from = mockFrom
    mockFrom.mockReturnValue({
      select: mockSelect,
      eq: mockEq,
      order: mockOrder
    })

    await ClientDashboardPage()

    expect(mockFrom).toHaveBeenCalledWith('jobs')
    expect(mockSelect).toHaveBeenCalledWith('*')
    expect(mockEq).toHaveBeenCalledWith('client_id', 'client-123')
    expect(mockOrder).toHaveBeenCalledWith('created_at', { ascending: false })
  })

  it('renders view buttons for each job', async () => {
    mockSupabaseClient.from.mockReturnValue({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      order: jest.fn().mockResolvedValue({
        data: mockJobs,
        error: null
      })
    })

    const PageComponent = await ClientDashboardPage()
    render(PageComponent)

    // Should have View buttons for each job
    const viewButtons = screen.getAllByText('View')
    expect(viewButtons).toHaveLength(3)
  })

  it('displays back to home link', async () => {
    mockSupabaseClient.from.mockReturnValue({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      order: jest.fn().mockResolvedValue({
        data: [],
        error: null
      })
    })

    const PageComponent = await ClientDashboardPage()
    render(PageComponent)

    const backLink = screen.getByText('← Back to Home').closest('a')
    expect(backLink).toHaveAttribute('href', '/')
  })

  it('formats creation dates correctly', async () => {
    const testJob = [{
      id: 'job-1',
      title: 'Test Job',
      status: 'active',
      client_id: 'client-123',
      created_at: '2024-01-15T10:30:45Z'
    }]

    mockSupabaseClient.from.mockReturnValue({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      order: jest.fn().mockResolvedValue({
        data: testJob,
        error: null
      })
    })

    const PageComponent = await ClientDashboardPage()
    render(PageComponent)

    // Should display the formatted creation date (flexible for different locales)
    const expectedDate = new Date('2024-01-15T10:30:45Z').toLocaleDateString()
    expect(screen.getByText(new RegExp(`Created: ${expectedDate.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`))).toBeInTheDocument()
  })
})