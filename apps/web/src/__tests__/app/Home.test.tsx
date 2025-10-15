/**
 * @jest-environment jsdom
 */
import React from 'react'
import { render, screen } from '@testing-library/react'
import Home from '@/app/page'

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
  SolutionsSidebar: () => (
    <div data-testid="solutions-sidebar">
      <div>Founders</div>
      <div>Referrers</div>
      <div>Client Solutions</div>
    </div>
  ),
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

  it('renders the main heading and tagline', async () => {
    const HomeComponent = await Home()
    render(HomeComponent)

    expect(screen.getByText('Network. Refer. Earn.')).toBeInTheDocument()
    expect(screen.getByText('Executive Recruitment Network')).toBeInTheDocument()
    expect(screen.getByText(/Refer-ify connects senior executives with premium opportunities/)).toBeInTheDocument()
  })

  it('renders navigation links', async () => {
    const HomeComponent = await Home()
    render(HomeComponent)

    const requestInvitationLink = screen.getByText('Request Invitation')
    const clientSolutionsLink = screen.getByText('Explore Client Solutions')

    expect(requestInvitationLink.closest('a')).toHaveAttribute('href', '/login')
    expect(clientSolutionsLink.closest('a')).toHaveAttribute('href', '/client')
  })

  it('displays trusted companies section', async () => {
    const HomeComponent = await Home()
    render(HomeComponent)

    expect(screen.getByText('Trusted by leaders at')).toBeInTheDocument()
    expect(screen.getByText('Meta')).toBeInTheDocument()
    expect(screen.getByText('Stripe')).toBeInTheDocument()
    expect(screen.getByText('Atlassian')).toBeInTheDocument()
    expect(screen.getByText('Canva')).toBeInTheDocument()
  })

  it('includes value proposition text', async () => {
    const HomeComponent = await Home()
    render(HomeComponent)

    expect(screen.getByText(/Our platform blends the discretion of executive search/)).toBeInTheDocument()
    expect(screen.getByText(/speed, trust, and aligned incentives/)).toBeInTheDocument()
  })

  it('renders the solutions sidebar section', async () => {
    const HomeComponent = await Home()
    render(HomeComponent)

    expect(screen.getByText('Our Solutions')).toBeInTheDocument()
    expect(screen.getByTestId('solutions-sidebar')).toBeInTheDocument()
  })

  it('has proper page structure', async () => {
    const HomeComponent = await Home()
    render(HomeComponent)

    // Check that main element exists
    const mainElement = document.querySelector('main')
    expect(mainElement).toBeInTheDocument()
    expect(mainElement).toHaveClass('min-h-screen', 'bg-[#f8f9fa]')

    // Check responsive grid layout
    const sectionElement = document.querySelector('section')
    expect(sectionElement).toBeInTheDocument()
    expect(sectionElement).toHaveClass('max-w-7xl', 'mx-auto')
  })

  it('calls Supabase auth to get user', async () => {
    await Home()
    
    expect(mockSupabaseClient.auth.getUser).toHaveBeenCalledTimes(1)
  })

  it('handles authenticated user state', async () => {
    const mockUser = { id: 'user-123', email: 'test@example.com' }
    mockSupabaseClient.auth.getUser.mockResolvedValue({
      data: { user: mockUser },
      error: null,
    })

    const HomeComponent = await Home()
    render(HomeComponent)

    // Page should still render all content regardless of auth state
    expect(screen.getByText('Network. Refer. Earn.')).toBeInTheDocument()
    expect(screen.getByText('Request Invitation')).toBeInTheDocument()
  })

  it('handles Supabase auth error gracefully', async () => {
    mockSupabaseClient.auth.getUser.mockResolvedValue({
      data: { user: null },
      error: { message: 'Auth error' },
    })

    const HomeComponent = await Home()
    render(HomeComponent)

    // Page should still render despite auth error
    expect(screen.getByText('Network. Refer. Earn.')).toBeInTheDocument()
  })

  it('uses correct styling for call-to-action buttons', async () => {
    const HomeComponent = await Home()
    render(HomeComponent)

    const requestInvitationButton = screen.getByText('Request Invitation')
    const exploreClientButton = screen.getByText('Explore Client Solutions')

    // Primary button styling
    expect(requestInvitationButton).toHaveClass('bg-black', 'text-white')
    
    // Secondary button styling  
    expect(exploreClientButton).toHaveClass('border')
  })
})