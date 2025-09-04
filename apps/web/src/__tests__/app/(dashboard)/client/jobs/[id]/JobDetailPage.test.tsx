/**
 * @jest-environment jsdom
 */
import React from 'react'
import { render, screen } from '@testing-library/react'
import ClientJobDetailPage from '@/app/(dashboard)/client/jobs/[id]/page'
import { requireRole } from "@/lib/auth"
import { getSupabaseServerComponentClient } from "@/lib/supabase/server"

// Mock auth function
jest.mock("@/lib/auth", () => ({
  requireRole: jest.fn()
}))

// Mock Supabase server client
jest.mock("@/lib/supabase/server", () => ({
  getSupabaseServerComponentClient: jest.fn()
}))

// Mock Next.js Link component
jest.mock('next/link', () => {
  return ({ href, children, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  )
})

// Mock UI components
jest.mock('@/components/ui/card', () => ({
  Card: ({ children, className, ...props }: any) => (
    <div className={`card ${className || ''}`} {...props}>{children}</div>
  ),
  CardContent: ({ children, className, ...props }: any) => (
    <div className={`card-content ${className || ''}`} {...props}>{children}</div>
  ),
  CardHeader: ({ children, className, ...props }: any) => (
    <div className={`card-header ${className || ''}`} {...props}>{children}</div>
  ),
  CardTitle: ({ children, className, ...props }: any) => (
    <h3 className={`card-title ${className || ''}`} {...props}>{children}</h3>
  )
}))

jest.mock('@/components/ui/badge', () => ({
  Badge: ({ children, className, variant, ...props }: any) => (
    <span className={`badge ${variant || 'default'} ${className || ''}`} {...props}>
      {children}
    </span>
  )
}))

jest.mock('@/components/ui/button', () => ({
  Button: ({ children, className, variant, ...props }: any) => (
    <button className={`button ${variant || 'default'} ${className || ''}`} {...props}>
      {children}
    </button>
  )
}))

const mockSupabase = {
  from: jest.fn()
}

describe('Client Job Detail Page', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(requireRole as jest.Mock).mockResolvedValue(undefined)
    ;(getSupabaseServerComponentClient as jest.Mock).mockResolvedValue(mockSupabase)
  })

  it('requires client role authentication', async () => {
    const params = Promise.resolve({ id: 'job-123' })
    
    const mockJobQuery = {
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: null })
    }
    mockSupabase.from.mockReturnValue(mockJobQuery)
    
    await ClientJobDetailPage({ params })
    
    expect(requireRole).toHaveBeenCalledWith("client")
  })

  it('renders job not found when job does not exist', async () => {
    const params = Promise.resolve({ id: 'nonexistent-job' })
    
    const mockJobQuery = {
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: null })
    }
    mockSupabase.from.mockReturnValue(mockJobQuery)

    const JobDetailPageComponent = await ClientJobDetailPage({ params })
    render(JobDetailPageComponent)

    expect(screen.getByText('Job not found.')).toBeInTheDocument()
    expect(screen.getByText('← Back to Jobs')).toBeInTheDocument()
    
    const backLink = screen.getByText('← Back to Jobs').closest('a')
    expect(backLink).toHaveAttribute('href', '/client/jobs')
  })

  it('renders job details when job exists', async () => {
    const params = Promise.resolve({ id: 'job-123' })
    
    const mockJob = {
      id: 'job-123',
      title: 'Senior Software Engineer',
      status: 'active',
      description: 'We are looking for a senior software engineer to join our team.',
      created_at: '2024-01-15T10:30:00Z'
    }

    const mockJobQuery = {
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: mockJob })
    }
    mockSupabase.from.mockReturnValue(mockJobQuery)

    const JobDetailPageComponent = await ClientJobDetailPage({ params })
    render(JobDetailPageComponent)

    expect(screen.getByText('Senior Software Engineer')).toBeInTheDocument()
    expect(screen.getByText('active')).toBeInTheDocument()
    expect(screen.getByText('We are looking for a senior software engineer to join our team.')).toBeInTheDocument()
  })

  it('displays fallback title when job has no title', async () => {
    const params = Promise.resolve({ id: 'job-123' })
    
    const mockJob = {
      id: 'job-123',
      title: null,
      status: 'draft',
      description: 'Job description here',
      created_at: '2024-01-15T10:30:00Z'
    }

    const mockJobQuery = {
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: mockJob })
    }
    mockSupabase.from.mockReturnValue(mockJobQuery)

    const JobDetailPageComponent = await ClientJobDetailPage({ params })
    render(JobDetailPageComponent)

    expect(screen.getByText('Untitled Job')).toBeInTheDocument()
  })

  it('displays created date when available', async () => {
    const params = Promise.resolve({ id: 'job-123' })
    
    const mockJob = {
      id: 'job-123',
      title: 'Test Job',
      status: 'active',
      created_at: '2024-01-15T10:30:00Z'
    }

    const mockJobQuery = {
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: mockJob })
    }
    mockSupabase.from.mockReturnValue(mockJobQuery)

    const JobDetailPageComponent = await ClientJobDetailPage({ params })
    render(JobDetailPageComponent)

    // Should display formatted date
    expect(screen.getByText(/Created/)).toBeInTheDocument()
    expect(screen.getByText(/15\/01\/2024/)).toBeInTheDocument()
  })

  it('hides description section when no description is provided', async () => {
    const params = Promise.resolve({ id: 'job-123' })
    
    const mockJob = {
      id: 'job-123',
      title: 'Test Job',
      status: 'active',
      description: null,
      created_at: '2024-01-15T10:30:00Z'
    }

    const mockJobQuery = {
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: mockJob })
    }
    mockSupabase.from.mockReturnValue(mockJobQuery)

    const JobDetailPageComponent = await ClientJobDetailPage({ params })
    render(JobDetailPageComponent)

    expect(screen.queryByText('Description')).not.toBeInTheDocument()
  })

  it('shows description section when description is provided', async () => {
    const params = Promise.resolve({ id: 'job-123' })
    
    const mockJob = {
      id: 'job-123',
      title: 'Test Job',
      status: 'active',
      description: 'This is a detailed job description.\nWith multiple lines.',
      created_at: '2024-01-15T10:30:00Z'
    }

    const mockJobQuery = {
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: mockJob })
    }
    mockSupabase.from.mockReturnValue(mockJobQuery)

    const JobDetailPageComponent = await ClientJobDetailPage({ params })
    render(JobDetailPageComponent)

    expect(screen.getByText('Description')).toBeInTheDocument()
    expect(screen.getByText((content) => content.includes('This is a detailed job description'))).toBeInTheDocument()
  })

  it('renders manage referrals button with correct link', async () => {
    const params = Promise.resolve({ id: 'job-123' })
    
    const mockJob = {
      id: 'job-123',
      title: 'Test Job',
      status: 'active',
      created_at: '2024-01-15T10:30:00Z'
    }

    const mockJobQuery = {
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: mockJob })
    }
    mockSupabase.from.mockReturnValue(mockJobQuery)

    const JobDetailPageComponent = await ClientJobDetailPage({ params })
    render(JobDetailPageComponent)

    const manageButton = screen.getByText('Manage Referrals')
    expect(manageButton).toBeInTheDocument()
    
    const buttonLink = manageButton.closest('a')
    expect(buttonLink).toHaveAttribute('href', '/client/jobs/job-123/referrals')
  })

  it('displays status badge with correct variant', async () => {
    const params = Promise.resolve({ id: 'job-123' })
    
    const mockJob = {
      id: 'job-123',
      title: 'Test Job',
      status: 'draft',
      created_at: '2024-01-15T10:30:00Z'
    }

    const mockJobQuery = {
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: mockJob })
    }
    mockSupabase.from.mockReturnValue(mockJobQuery)

    const JobDetailPageComponent = await ClientJobDetailPage({ params })
    render(JobDetailPageComponent)

    const statusBadge = screen.getByText('draft')
    expect(statusBadge).toHaveClass('badge', 'secondary')
  })

  it('has proper page structure and styling', async () => {
    const params = Promise.resolve({ id: 'job-123' })
    
    const mockJob = {
      id: 'job-123',
      title: 'Test Job',
      status: 'active',
      created_at: '2024-01-15T10:30:00Z'
    }

    const mockJobQuery = {
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: mockJob })
    }
    mockSupabase.from.mockReturnValue(mockJobQuery)

    const { container } = render(await ClientJobDetailPage({ params }))

    const mainContainer = container.querySelector('div.p-6.max-w-4xl.mx-auto.space-y-4')
    expect(mainContainer).toBeInTheDocument()
  })

  it('renders back to jobs navigation link', async () => {
    const params = Promise.resolve({ id: 'job-123' })
    
    const mockJob = {
      id: 'job-123',
      title: 'Test Job',
      status: 'active',
      created_at: '2024-01-15T10:30:00Z'
    }

    const mockJobQuery = {
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: mockJob })
    }
    mockSupabase.from.mockReturnValue(mockJobQuery)

    const JobDetailPageComponent = await ClientJobDetailPage({ params })
    render(JobDetailPageComponent)

    const backLinks = screen.getAllByText('← Back to Jobs')
    expect(backLinks).toHaveLength(1)
    
    const backLink = backLinks[0].closest('a')
    expect(backLink).toHaveAttribute('href', '/client/jobs')
    expect(backLink).toHaveClass('text-blue-600', 'hover:text-blue-800')
  })

  it('handles database query errors gracefully', async () => {
    const params = Promise.resolve({ id: 'job-123' })
    
    const mockJobQuery = {
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockRejectedValue(new Error('Database error'))
    }
    mockSupabase.from.mockReturnValue(mockJobQuery)

    // Should not throw, instead should handle the error
    await expect(ClientJobDetailPage({ params })).rejects.toThrow('Database error')
  })

  it('handles authentication errors gracefully', async () => {
    const params = Promise.resolve({ id: 'job-123' })
    
    ;(requireRole as jest.Mock).mockRejectedValue(new Error('Authentication failed'))

    await expect(ClientJobDetailPage({ params })).rejects.toThrow('Authentication failed')
  })

  it('card header has proper flex layout for title and badge', async () => {
    const params = Promise.resolve({ id: 'job-123' })
    
    const mockJob = {
      id: 'job-123',
      title: 'Test Job',
      status: 'active',
      created_at: '2024-01-15T10:30:00Z'
    }

    const mockJobQuery = {
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: mockJob })
    }
    mockSupabase.from.mockReturnValue(mockJobQuery)

    const { container } = render(await ClientJobDetailPage({ params }))

    const cardTitle = container.querySelector('.card-title')
    expect(cardTitle).toHaveClass('flex', 'items-center', 'justify-between')
  })

  it('preserves whitespace in multiline descriptions', async () => {
    const params = Promise.resolve({ id: 'job-123' })
    
    const mockJob = {
      id: 'job-123',
      title: 'Test Job',
      status: 'active',
      description: 'Line 1\nLine 2\nLine 3',
      created_at: '2024-01-15T10:30:00Z'
    }

    const mockJobQuery = {
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: mockJob })
    }
    mockSupabase.from.mockReturnValue(mockJobQuery)

    const { container } = render(await ClientJobDetailPage({ params }))

    const description = container.querySelector('p.whitespace-pre-line')
    expect(description).toBeInTheDocument()
    expect(description).toHaveTextContent('Line 1 Line 2 Line 3')
  })

  it('handles dynamic rendering correctly', async () => {
    const params = Promise.resolve({ id: 'job-123' })
    
    const mockJob = {
      id: 'job-123',
      title: 'Test Job',
      status: 'active',
      created_at: '2024-01-15T10:30:00Z'
    }

    const mockJobQuery = {
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: mockJob })
    }
    mockSupabase.from.mockReturnValue(mockJobQuery)

    const { container } = render(await ClientJobDetailPage({ params }))
    expect(container.firstChild).toBeInTheDocument()
  })
})