/**
 * @jest-environment jsdom
 */
import React from 'react'
import { render, screen } from '@testing-library/react'
import HomePage from '@/app/page'

// Mock Next.js Link component
jest.mock('next/link', () => {
  return ({ href, children, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  )
})

// Mock SolutionsSidebar component
jest.mock('@/components/home/SolutionsSidebar', () => ({
  SolutionsSidebar: () => <div data-testid="solutions-sidebar">Solutions Sidebar</div>,
}))

// Mock Supabase server client
const mockSupabaseClient = {
  auth: {
    getUser: jest.fn(),
  },
}

jest.mock('@/lib/supabase/server', () => ({
  getSupabaseServerComponentClient: jest.fn(() => Promise.resolve(mockSupabaseClient)),
}))

describe('Home Page', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockSupabaseClient.auth.getUser.mockResolvedValue({
      data: { user: null },
      error: null,
    })
  })

  it('renders main landing page content', async () => {
    const PageComponent = await HomePage()
    render(PageComponent)

    // Main heading and tagline
    expect(screen.getByText('Network. Refer. Earn.')).toBeInTheDocument()
    expect(screen.getByText('Executive Recruitment Network')).toBeInTheDocument()
    
    // Description text
    expect(screen.getByText(/Refer-ify connects senior executives with premium opportunities/)).toBeInTheDocument()
    expect(screen.getByText(/across APAC & EMEA/)).toBeInTheDocument()
  })

  it('renders call-to-action buttons with correct links', async () => {
    const PageComponent = await HomePage()
    render(PageComponent)

    const requestInviteButton = screen.getByText('Request Invitation').closest('a')
    expect(requestInviteButton).toHaveAttribute('href', '/login')

    const clientSolutionsButton = screen.getByText('Explore Client Solutions').closest('a')
    expect(clientSolutionsButton).toHaveAttribute('href', '/client')
  })

  it('displays trusted companies section', async () => {
    const PageComponent = await HomePage()
    render(PageComponent)

    expect(screen.getByText('Trusted by leaders at')).toBeInTheDocument()
    expect(screen.getByText('Meta')).toBeInTheDocument()
    expect(screen.getByText('Stripe')).toBeInTheDocument()
    expect(screen.getByText('Atlassian')).toBeInTheDocument()
    expect(screen.getByText('Canva')).toBeInTheDocument()
  })

  it('renders solutions sidebar', async () => {
    const PageComponent = await HomePage()
    render(PageComponent)

    expect(screen.getByText('Our Solutions')).toBeInTheDocument()
    expect(screen.getByTestId('solutions-sidebar')).toBeInTheDocument()
  })

  it('displays platform description', async () => {
    const PageComponent = await HomePage()
    render(PageComponent)

    expect(screen.getByText(/Our platform blends the discretion of executive search/)).toBeInTheDocument()
    expect(screen.getByText(/Members refer exceptional professionals/)).toBeInTheDocument()
  })

  it('queries user authentication status', async () => {
    await HomePage()
    expect(mockSupabaseClient.auth.getUser).toHaveBeenCalled()
  })

  it('has proper responsive layout classes', async () => {
    const PageComponent = await HomePage()
    const { container } = render(PageComponent)

    const mainSection = container.querySelector('.grid.grid-cols-1.lg\\:grid-cols-\\[1fr_320px\\]')
    expect(mainSection).toBeInTheDocument()

    const companiesGrid = container.querySelector('.grid.grid-cols-2.sm\\:grid-cols-4')
    expect(companiesGrid).toBeInTheDocument()
  })

  it('renders with correct styling classes', async () => {
    const PageComponent = await HomePage()
    const { container } = render(PageComponent)

    const main = container.querySelector('main')
    expect(main).toHaveClass('min-h-screen', 'bg-[#f8f9fa]')
  })

  it('handles user authentication state', async () => {
    mockSupabaseClient.auth.getUser.mockResolvedValue({
      data: { user: { id: 'user-123', email: 'test@example.com' } },
      error: null,
    })

    const PageComponent = await HomePage()
    render(PageComponent)

    // Page should render normally regardless of auth state
    expect(screen.getByText('Network. Refer. Earn.')).toBeInTheDocument()
  })

  it('handles authentication error gracefully', async () => {
    mockSupabaseClient.auth.getUser.mockResolvedValue({
      data: { user: null },
      error: { message: 'Authentication failed' },
    })

    const PageComponent = await HomePage()
    render(PageComponent)

    // Page should still render even with auth error
    expect(screen.getByText('Network. Refer. Earn.')).toBeInTheDocument()
  })
})