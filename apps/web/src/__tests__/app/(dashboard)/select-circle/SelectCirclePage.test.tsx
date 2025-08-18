/**
 * @jest-environment jsdom
 */
import React from 'react'
import { render, screen } from '@testing-library/react'
import SelectCircleDashboardPage from '@/app/(dashboard)/select-circle/page'

// Mock authentication
const mockUser = { 
  id: 'select-123', 
  email: 'select@example.com',
  role: 'select_circle'
}

jest.mock('@/lib/auth', () => ({
  requireRole: jest.fn(),
}))

const { requireRole } = require('@/lib/auth')

// Mock RealTimeJobFeed component
jest.mock('@/components/jobs/RealTimeJobFeed', () => ({
  RealTimeJobFeed: ({ userRole }: { userRole: string }) => (
    <div data-testid="real-time-job-feed" data-user-role={userRole}>
      Real Time Job Feed for {userRole}
    </div>
  ),
}))

describe('Select Circle Dashboard Page', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    requireRole.mockResolvedValue({ user: mockUser })
  })

  it('renders the real-time job feed with correct user role', async () => {
    const PageComponent = await SelectCircleDashboardPage()
    render(PageComponent)

    const jobFeed = screen.getByTestId('real-time-job-feed')
    expect(jobFeed).toBeInTheDocument()
    expect(jobFeed).toHaveAttribute('data-user-role', 'select_circle')
    expect(screen.getByText('Real Time Job Feed for select_circle')).toBeInTheDocument()
  })

  it('includes screen reader accessible heading', async () => {
    const PageComponent = await SelectCircleDashboardPage()
    render(PageComponent)

    const heading = screen.getByText('Opportunity Board')
    expect(heading).toBeInTheDocument()
    expect(heading).toHaveClass('sr-only')
  })

  it('requires select_circle role for access', async () => {
    await SelectCircleDashboardPage()
    expect(requireRole).toHaveBeenCalledWith('select_circle')
  })

  it('throws error if user lacks required role', async () => {
    requireRole.mockRejectedValue(new Error('Access denied - select_circle role required'))

    await expect(SelectCircleDashboardPage()).rejects.toThrow('Access denied - select_circle role required')
  })

  it('passes user context from authentication', async () => {
    const customUser = { 
      id: 'select-456', 
      email: 'custom@select.com',
      role: 'select_circle'
    }
    requireRole.mockResolvedValue({ user: customUser })

    const PageComponent = await SelectCircleDashboardPage()
    render(PageComponent)

    expect(screen.getByTestId('real-time-job-feed')).toBeInTheDocument()
    expect(requireRole).toHaveBeenCalledWith('select_circle')
  })

  it('handles authentication error gracefully', async () => {
    requireRole.mockRejectedValue(new Error('Authentication failed'))

    await expect(SelectCircleDashboardPage()).rejects.toThrow('Authentication failed')
  })

  it('renders within proper container structure', async () => {
    const PageComponent = await SelectCircleDashboardPage()
    const { container } = render(PageComponent)

    const wrapper = container.querySelector('div')
    expect(wrapper).toBeInTheDocument()
    expect(wrapper).toContainElement(screen.getByTestId('real-time-job-feed'))
  })
})