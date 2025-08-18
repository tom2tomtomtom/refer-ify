/**
 * @jest-environment jsdom
 */
import React from 'react'
import { render, screen } from '@testing-library/react'
import FoundingDashboardPage from '@/app/(dashboard)/founding/page'
import { getSupabaseServerComponentClient } from "@/lib/supabase/server"

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

// Mock Lucide icons
jest.mock('lucide-react', () => ({
  DollarSign: () => <div data-testid="dollar-sign">DollarSign</div>,
  TrendingUp: () => <div data-testid="trending-up">TrendingUp</div>,
  Users: () => <div data-testid="users">Users</div>,
  Clock: () => <div data-testid="clock">Clock</div>,
  PlusCircle: () => <div data-testid="plus-circle">PlusCircle</div>,
  Activity: () => <div data-testid="activity">Activity</div>,
  ArrowRightCircle: () => <div data-testid="arrow-right-circle">ArrowRightCircle</div>
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

jest.mock('@/components/ui/button', () => ({
  Button: ({ children, className, variant, ...props }: any) => (
    <button className={`button ${variant || 'default'} ${className || ''}`} {...props}>
      {children}
    </button>
  )
}))

jest.mock('@/components/ui/badge', () => ({
  Badge: ({ children, className, variant, ...props }: any) => (
    <span className={`badge ${variant || 'default'} ${className || ''}`} {...props}>
      {children}
    </span>
  )
}))

const mockSupabase = {
  auth: {
    getUser: jest.fn()
  },
  from: jest.fn()
}

describe('Founding Dashboard Page', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(getSupabaseServerComponentClient as jest.Mock).mockResolvedValue(mockSupabase)
    
    // Default mock - no user
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: null }
    })
  })

  it('renders with default values when no user data', async () => {
    const FoundingDashboard = await FoundingDashboardPage()
    render(FoundingDashboard)

    expect(screen.getByText('Welcome back, Member')).toBeInTheDocument()
    expect(screen.getByText('Founding Circle')).toBeInTheDocument()
    expect(screen.getByText('Your network drives premium outcomes across the platform.')).toBeInTheDocument()
  })

  it('displays breadcrumb navigation', async () => {
    const FoundingDashboard = await FoundingDashboardPage()
    render(FoundingDashboard)

    expect(screen.getByText('Dashboard > Founding Circle')).toBeInTheDocument()
  })

  it('shows all action buttons in header', async () => {
    const FoundingDashboard = await FoundingDashboardPage()
    render(FoundingDashboard)

    expect(screen.getByText('Invite New Member')).toBeInTheDocument()
    expect(screen.getByText('Manage Advisory')).toBeInTheDocument()
    expect(screen.getByText('Network Growth')).toBeInTheDocument()
    expect(screen.getByText('Revenue Details')).toBeInTheDocument()

    // Check links
    const inviteLink = screen.getByText('Invite New Member').closest('a')
    expect(inviteLink).toHaveAttribute('href', '/founding/invite')

    const advisoryLink = screen.getByText('Manage Advisory').closest('a')
    expect(advisoryLink).toHaveAttribute('href', '/founding/advisory')

    const networkLink = screen.getByText('Network Growth').closest('a')
    expect(networkLink).toHaveAttribute('href', '/founding/network')

    const revenueLink = screen.getByText('Revenue Details').closest('a')
    expect(revenueLink).toHaveAttribute('href', '/founding/revenue')
  })

  it('displays all metric cards with default values', async () => {
    const FoundingDashboard = await FoundingDashboardPage()
    render(FoundingDashboard)

    // Total Network Revenue
    expect(screen.getByText('Total Network Revenue')).toBeInTheDocument()
    expect(screen.getByText('$47,250/mo')).toBeInTheDocument()
    expect(screen.getByText('+12% growth')).toBeInTheDocument()

    // Your Monthly Earnings
    expect(screen.getByText('Your Monthly Earnings (15%)')).toBeInTheDocument()
    expect(screen.getByText('$7,088')).toBeInTheDocument()

    // Members Invited
    expect(screen.getByText('Members You Invited (Active)')).toBeInTheDocument()
    expect(screen.getByText('23')).toBeInTheDocument()

    // Advisory Hours
    expect(screen.getByText('Advisory Hours Available')).toBeInTheDocument()
    expect(screen.getByText('8.5 hrs')).toBeInTheDocument()
  })

  it('renders all metric card icons', async () => {
    const FoundingDashboard = await FoundingDashboardPage()
    render(FoundingDashboard)

    expect(screen.getByTestId('trending-up')).toBeInTheDocument()
    expect(screen.getByTestId('dollar-sign')).toBeInTheDocument()
    expect(screen.getAllByTestId('users')).toHaveLength(2) // One in header, one in metrics
    expect(screen.getByTestId('clock')).toBeInTheDocument()
  })

  it('renders header action icons', async () => {
    const FoundingDashboard = await FoundingDashboardPage()
    render(FoundingDashboard)

    expect(screen.getByTestId('plus-circle')).toBeInTheDocument()
    expect(screen.getByTestId('activity')).toBeInTheDocument()
    expect(screen.getAllByTestId('users')).toHaveLength(2) // One in header, one in metrics
    expect(screen.getByTestId('arrow-right-circle')).toBeInTheDocument()
  })

  it('displays recent activity section', async () => {
    const FoundingDashboard = await FoundingDashboardPage()
    render(FoundingDashboard)

    expect(screen.getByText('Recent Activity')).toBeInTheDocument()
    expect(screen.getByText('Sarah Chen (Meta) joined through your invitation')).toBeInTheDocument()
    expect(screen.getByText('2 hours ago')).toBeInTheDocument()
    expect(screen.getByText('Placement completed: $8,000 network bonus earned')).toBeInTheDocument()
    expect(screen.getByText('Yesterday')).toBeInTheDocument()
    expect(screen.getByText('Advisory session scheduled with TechCorp')).toBeInTheDocument()
    expect(screen.getByText('3 days ago')).toBeInTheDocument()
  })

  it('renders with user profile data when available', async () => {
    const mockUser = { id: 'user-123' }
    const mockProfile = { first_name: 'John', last_name: 'Doe' }

    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: mockUser }
    })

    const mockProfileQuery = {
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: mockProfile })
    }

    mockSupabase.from.mockReturnValue(mockProfileQuery)

    const FoundingDashboard = await FoundingDashboardPage()
    render(FoundingDashboard)

    expect(screen.getByText('Welcome back, John Doe')).toBeInTheDocument()
  })

  it('handles database query errors gracefully', async () => {
    const mockUser = { id: 'user-123' }

    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: mockUser }
    })

    // Mock failing database queries
    const mockErrorQuery = {
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockRejectedValue(new Error('Database error')),
      order: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      maybeSingle: jest.fn().mockRejectedValue(new Error('Database error'))
    }

    mockSupabase.from.mockReturnValue(mockErrorQuery)

    const FoundingDashboard = await FoundingDashboardPage()
    render(FoundingDashboard)

    // Should still render with default values
    expect(screen.getByText('Welcome back, Member')).toBeInTheDocument()
    expect(screen.getByText('$47,250/mo')).toBeInTheDocument()
  })

  it('metric cards are clickable and link to correct pages', async () => {
    const FoundingDashboard = await FoundingDashboardPage()
    render(FoundingDashboard)

    // Check that revenue cards link to revenue page
    const revenueCards = screen.getAllByText('Total Network Revenue')
    expect(revenueCards[0].closest('a')).toHaveAttribute('href', '/founding/revenue')

    const earningsCard = screen.getByText('Your Monthly Earnings (15%)').closest('a')
    expect(earningsCard).toHaveAttribute('href', '/founding/revenue')

    // Check that network card links to network page
    const networkCard = screen.getByText('Members You Invited (Active)').closest('a')
    expect(networkCard).toHaveAttribute('href', '/founding/network')

    // Check that advisory card links to advisory page
    const advisoryCard = screen.getByText('Advisory Hours Available').closest('a')
    expect(advisoryCard).toHaveAttribute('href', '/founding/advisory')
  })

  it('has proper responsive layout classes', async () => {
    const { container } = render(await FoundingDashboardPage())

    // Check grid layouts
    const metricsGrid = container.querySelector('.grid.gap-4.md\\:grid-cols-2.lg\\:grid-cols-4')
    expect(metricsGrid).toBeInTheDocument()

    // Check responsive header
    const header = container.querySelector('.flex.flex-col.md\\:flex-row')
    expect(header).toBeInTheDocument()
  })

  it('cards have hover effects and proper styling', async () => {
    const { container } = render(await FoundingDashboardPage())

    const hoverCards = container.querySelectorAll('.cursor-pointer.hover\\:shadow-lg.transition-shadow')
    expect(hoverCards).toHaveLength(4) // 4 metric cards
  })

  it('displays proper badge styling', async () => {
    const FoundingDashboard = await FoundingDashboardPage()
    render(FoundingDashboard)

    const badge = screen.getByText('Founding Circle')
    expect(badge).toHaveClass('badge', 'secondary')
  })

  it('shows growth indicator with proper styling', async () => {
    const { container } = render(await FoundingDashboardPage())

    const growthIndicator = screen.getByText('+12% growth')
    expect(growthIndicator).toHaveClass('text-xs', 'text-green-600')
  })

  it('renders activity timestamps with proper styling', async () => {
    const { container } = render(await FoundingDashboardPage())

    const timestamps = container.querySelectorAll('.text-xs.text-muted-foreground')
    expect(timestamps.length).toBeGreaterThan(2) // Multiple timestamp elements
  })

  it('handles missing user gracefully', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: null }
    })

    const FoundingDashboard = await FoundingDashboardPage()
    render(FoundingDashboard)

    expect(screen.getByText('Welcome back, Member')).toBeInTheDocument()
  })

  it('uses proper text hierarchy and spacing', async () => {
    const { container } = render(await FoundingDashboardPage())

    // Check main heading
    const mainHeading = container.querySelector('h1')
    expect(mainHeading).toHaveClass('text-2xl', 'md:text-3xl', 'font-bold', 'tracking-tight')

    // Check card titles
    const cardTitles = container.querySelectorAll('.card-title')
    expect(cardTitles.length).toBeGreaterThan(0)
  })

  it('displays metrics in correct format', async () => {
    const FoundingDashboard = await FoundingDashboardPage()
    render(FoundingDashboard)

    // Revenue formatted with commas and /mo suffix
    expect(screen.getByText('$47,250/mo')).toBeInTheDocument()
    
    // Earnings formatted with commas
    expect(screen.getByText('$7,088')).toBeInTheDocument()
    
    // Hours formatted with decimal and unit
    expect(screen.getByText('8.5 hrs')).toBeInTheDocument()
    
    // Member count as simple number
    expect(screen.getByText('23')).toBeInTheDocument()
  })

  it('handles dynamic rendering correctly', async () => {
    const { container } = render(await FoundingDashboardPage())
    expect(container.firstChild).toBeInTheDocument()
  })
})