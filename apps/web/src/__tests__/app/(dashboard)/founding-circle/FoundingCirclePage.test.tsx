/**
 * @jest-environment jsdom
 */
import React from 'react'
import { render, screen } from '@testing-library/react'
import FoundingCircleDashboardPage from '@/app/(dashboard)/founding-circle/page'

// Mock authentication
const mockUser = { 
  id: 'founding-123', 
  email: 'founding@example.com',
  role: 'founding_circle'
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

describe('Founding Circle Dashboard Page', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    requireRole.mockResolvedValue({ user: mockUser })
  })

  it('renders the real-time job feed with correct user role', async () => {
    const PageComponent = await FoundingCircleDashboardPage()
    render(PageComponent)

    const jobFeed = screen.getByTestId('real-time-job-feed')
    expect(jobFeed).toBeInTheDocument()
    expect(jobFeed).toHaveAttribute('data-user-role', 'founding_circle')
    expect(screen.getByText('Real Time Job Feed for founding_circle')).toBeInTheDocument()
  })

  it('requires founding_circle role for access', async () => {
    await FoundingCircleDashboardPage()
    expect(requireRole).toHaveBeenCalledWith('founding_circle')
  })

  it('throws error if user lacks required role', async () => {
    requireRole.mockRejectedValue(new Error('Access denied'))

    await expect(FoundingCircleDashboardPage()).rejects.toThrow('Access denied')
  })

  it('passes user context from authentication', async () => {
    const customUser = { 
      id: 'founding-456', 
      email: 'custom@founding.com',
      role: 'founding_circle'
    }
    requireRole.mockResolvedValue({ user: customUser })

    const PageComponent = await FoundingCircleDashboardPage()
    render(PageComponent)

    // Component should render regardless of specific user details
    expect(screen.getByTestId('real-time-job-feed')).toBeInTheDocument()
    expect(requireRole).toHaveBeenCalledWith('founding_circle')
  })
})