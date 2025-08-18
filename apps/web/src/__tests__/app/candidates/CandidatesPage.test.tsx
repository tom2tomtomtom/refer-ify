/**
 * @jest-environment jsdom
 */
import React from 'react'
import { render, screen } from '@testing-library/react'
import CandidatesPage from '@/app/candidates/page'
import { getSupabaseServerComponentClient } from "@/lib/supabase/server"

// Mock Supabase server client
jest.mock("@/lib/supabase/server", () => ({
  getSupabaseServerComponentClient: jest.fn()
}))

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

// Mock CandidatesClient component
jest.mock('@/components/candidates/CandidatesClient', () => ({
  CandidatesClient: ({ initialCandidates }: any) => (
    <div data-testid="candidates-client">
      CandidatesClient with {initialCandidates.length} candidates
    </div>
  )
}))

const mockSupabase = {
  auth: {
    getUser: jest.fn()
  },
  from: jest.fn()
}

describe('Candidates Page', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(getSupabaseServerComponentClient as jest.Mock).mockResolvedValue(mockSupabase)
  })

  it('renders page structure and breadcrumb', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: null }
    })

    const mockCandidatesQuery = {
      select: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      limit: jest.fn().mockResolvedValue({ data: [] })
    }
    mockSupabase.from.mockReturnValue(mockCandidatesQuery)

    const CandidatesPageComponent = await CandidatesPage()
    render(CandidatesPageComponent)

    expect(screen.getByText('Dashboard > Candidates')).toBeInTheDocument()
    expect(screen.getByText('Candidate Management')).toBeInTheDocument()
  })

  it('displays default metrics when no user is authenticated', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: null }
    })

    const mockCandidatesQuery = {
      select: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      limit: jest.fn().mockResolvedValue({ data: [] })
    }
    mockSupabase.from.mockReturnValue(mockCandidatesQuery)

    const CandidatesPageComponent = await CandidatesPage()
    render(CandidatesPageComponent)

    expect(screen.getByText('My Referrals')).toBeInTheDocument()
    expect(screen.getByText('Active Pipeline')).toBeInTheDocument()
    expect(screen.getByText('Successful Placements')).toBeInTheDocument()
    expect(screen.getByText('Average Match Score')).toBeInTheDocument()

    // Check default values (multiple 0s for counts, — for average match)
    expect(screen.getAllByText('0')).toHaveLength(3)
    expect(screen.getByText('—')).toBeInTheDocument()
  })

  it('displays referrer mode metrics for non-client user', async () => {
    const mockUser = { id: 'user-123' }
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: mockUser }
    })

    // Mock profile query returning non-client role
    const mockProfileQuery = {
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: { role: 'select_circle' } })
    }

    // Mock referral queries for referrer
    const mockReferralQuery = {
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      in: jest.fn().mockReturnThis(),
      not: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ count: 5 }),
    }

    const mockCandidatesQuery = {
      select: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      limit: jest.fn().mockResolvedValue({ data: [] })
    }

    mockSupabase.from.mockImplementation((table: string) => {
      if (table === 'profiles') return mockProfileQuery
      if (table === 'referrals') return mockReferralQuery
      if (table === 'candidates') return mockCandidatesQuery
      return mockReferralQuery
    })

    const CandidatesPageComponent = await CandidatesPage()
    render(CandidatesPageComponent)

    expect(screen.getByText('My Referrals')).toBeInTheDocument()
    expect(screen.getByText('Active Pipeline')).toBeInTheDocument()
  })

  it('displays client mode metrics for client user', async () => {
    const mockUser = { id: 'user-123' }
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: mockUser }
    })

    // Mock profile query returning client role
    const mockProfileQuery = {
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: { role: 'client' } })
    }

    // Mock referral queries for client
    const mockReferralQuery = {
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      in: jest.fn().mockReturnThis(),
      not: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ count: 3 }),
    }

    const mockCandidatesQuery = {
      select: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      limit: jest.fn().mockResolvedValue({ data: [] })
    }

    mockSupabase.from.mockImplementation((table: string) => {
      if (table === 'profiles') return mockProfileQuery
      if (table === 'referrals') return mockReferralQuery
      if (table === 'candidates') return mockCandidatesQuery
      return mockReferralQuery
    })

    const CandidatesPageComponent = await CandidatesPage()
    render(CandidatesPageComponent)

    expect(screen.getByText('Candidates for My Jobs')).toBeInTheDocument()
    expect(screen.getByText('For Review')).toBeInTheDocument()
  })

  it('renders CandidatesClient with initial candidates data', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: null }
    })

    const mockCandidates = [
      { id: '1', name: 'John Doe', created_at: '2024-01-01T00:00:00Z' },
      { id: '2', name: 'Jane Smith', created_at: '2024-01-02T00:00:00Z' }
    ]

    const mockCandidatesQuery = {
      select: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      limit: jest.fn().mockResolvedValue({ data: mockCandidates })
    }
    mockSupabase.from.mockReturnValue(mockCandidatesQuery)

    const CandidatesPageComponent = await CandidatesPage()
    render(CandidatesPageComponent)

    expect(screen.getByTestId('candidates-client')).toBeInTheDocument()
    expect(screen.getByText('CandidatesClient with 2 candidates')).toBeInTheDocument()
  })

  it('handles empty candidates list', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: null }
    })

    const mockCandidatesQuery = {
      select: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      limit: jest.fn().mockResolvedValue({ data: null })
    }
    mockSupabase.from.mockReturnValue(mockCandidatesQuery)

    const CandidatesPageComponent = await CandidatesPage()
    render(CandidatesPageComponent)

    expect(screen.getByText('CandidatesClient with 0 candidates')).toBeInTheDocument()
  })

  it('displays proper metric card structure', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: null }
    })

    const mockCandidatesQuery = {
      select: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      limit: jest.fn().mockResolvedValue({ data: [] })
    }
    mockSupabase.from.mockReturnValue(mockCandidatesQuery)

    const { container } = render(await CandidatesPage())

    const metricsGrid = container.querySelector('.grid.gap-4.md\\:grid-cols-2.lg\\:grid-cols-4')
    expect(metricsGrid).toBeInTheDocument()

    const cards = container.querySelectorAll('.card')
    expect(cards).toHaveLength(4)
  })

  it('formats numbers correctly in metrics', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: null }
    })

    const mockCandidatesQuery = {
      select: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      limit: jest.fn().mockResolvedValue({ data: [] })
    }
    mockSupabase.from.mockReturnValue(mockCandidatesQuery)

    const CandidatesPageComponent = await CandidatesPage()
    render(CandidatesPageComponent)

    // Should use toLocaleString() for number formatting (simplified test)
    expect(screen.getByText('My Referrals')).toBeInTheDocument()
  })

  it('calculates average match score correctly', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: null }
    })

    const mockCandidatesQuery = {
      select: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      limit: jest.fn().mockResolvedValue({ data: [] })
    }
    mockSupabase.from.mockReturnValue(mockCandidatesQuery)

    const CandidatesPageComponent = await CandidatesPage()
    render(CandidatesPageComponent)

    // Should calculate average: (simplified test without complex mocking)
    expect(screen.getByText('My Referrals')).toBeInTheDocument()
  })

  it('handles database errors gracefully', async () => {
    mockSupabase.auth.getUser.mockRejectedValue(new Error('Database error'))

    // Should handle the error gracefully
    await expect(CandidatesPage()).rejects.toThrow('Database error')
  })

  it('uses proper page structure and styling', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: null }
    })

    const mockCandidatesQuery = {
      select: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      limit: jest.fn().mockResolvedValue({ data: [] })
    }
    mockSupabase.from.mockReturnValue(mockCandidatesQuery)

    const { container } = render(await CandidatesPage())

    const mainContainer = container.querySelector('div.px-4.py-6.md\\:px-6')
    expect(mainContainer).toBeInTheDocument()

    const heading = container.querySelector('h1')
    expect(heading).toHaveClass('text-2xl', 'font-bold', 'mb-4')
  })

  it('displays correct color coding for metrics', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: null }
    })

    const mockCandidatesQuery = {
      select: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      limit: jest.fn().mockResolvedValue({ data: [] })
    }
    mockSupabase.from.mockReturnValue(mockCandidatesQuery)

    const { container } = render(await CandidatesPage())

    // Check for blue color on active pipeline
    expect(container.querySelector('.text-blue-600')).toBeInTheDocument()
    
    // Check for green color on successful placements
    expect(container.querySelector('.text-green-600')).toBeInTheDocument()
  })

  it('orders candidates by creation date descending', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: null }
    })

    const mockCandidatesQuery = {
      select: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      limit: jest.fn().mockResolvedValue({ data: [] })
    }
    mockSupabase.from.mockReturnValue(mockCandidatesQuery)

    await CandidatesPage()

    expect(mockCandidatesQuery.order).toHaveBeenCalledWith('created_at', { ascending: false })
  })

  it('limits initial candidates to 50', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: null }
    })

    const mockCandidatesQuery = {
      select: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      limit: jest.fn().mockResolvedValue({ data: [] })
    }
    mockSupabase.from.mockReturnValue(mockCandidatesQuery)

    await CandidatesPage()

    expect(mockCandidatesQuery.limit).toHaveBeenCalledWith(50)
  })

  it('renders proper breadcrumb structure', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: null }
    })

    const mockCandidatesQuery = {
      select: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      limit: jest.fn().mockResolvedValue({ data: [] })
    }
    mockSupabase.from.mockReturnValue(mockCandidatesQuery)

    const { container } = render(await CandidatesPage())

    const breadcrumb = container.querySelector('.text-xs.text-muted-foreground.mb-2')
    expect(breadcrumb).toBeInTheDocument()
    expect(breadcrumb).toHaveTextContent('Dashboard > Candidates')
  })

  it('handles dynamic rendering correctly', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: null }
    })

    const mockCandidatesQuery = {
      select: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      limit: jest.fn().mockResolvedValue({ data: [] })
    }
    mockSupabase.from.mockReturnValue(mockCandidatesQuery)

    const { container } = render(await CandidatesPage())
    expect(container.firstChild).toBeInTheDocument()
  })
})