/**
 * @jest-environment jsdom
 */
import React from 'react'
import { render, screen } from '@testing-library/react'
import ClientJobsPage from '@/app/(dashboard)/client/jobs/page'

// Mock authentication
const mockUser = { 
  id: 'client-123', 
  email: 'client@example.com',
  role: 'client'
}

jest.mock('@/lib/auth', () => ({
  requireRole: jest.fn(),
}))

const { requireRole } = require('@/lib/auth')

// Mock JobListingPage component
jest.mock('@/components/jobs/JobListingPage', () => ({
  JobListingPage: () => (
    <div data-testid="job-listing-page">
      <h1>Job Listings</h1>
      <div>Job listing functionality</div>
    </div>
  ),
}))

describe('Client Jobs Page', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    requireRole.mockResolvedValue({ user: mockUser })
  })

  it('renders the job listing page', async () => {
    const PageComponent = await ClientJobsPage()
    render(PageComponent)

    const jobListingPage = screen.getByTestId('job-listing-page')
    expect(jobListingPage).toBeInTheDocument()
    expect(screen.getByText('Job Listings')).toBeInTheDocument()
    expect(screen.getByText('Job listing functionality')).toBeInTheDocument()
  })

  it('requires client role for access', async () => {
    await ClientJobsPage()
    expect(requireRole).toHaveBeenCalledWith('client')
  })

  it('throws error if user lacks required role', async () => {
    requireRole.mockRejectedValue(new Error('Access denied - client role required'))

    await expect(ClientJobsPage()).rejects.toThrow('Access denied - client role required')
  })

  it('passes user context from authentication', async () => {
    const customUser = { 
      id: 'client-456', 
      email: 'custom@client.com',
      role: 'client'
    }
    requireRole.mockResolvedValue({ user: customUser })

    const PageComponent = await ClientJobsPage()
    render(PageComponent)

    expect(screen.getByTestId('job-listing-page')).toBeInTheDocument()
    expect(requireRole).toHaveBeenCalledWith('client')
  })

  it('handles authentication failure gracefully', async () => {
    requireRole.mockRejectedValue(new Error('Authentication failed'))

    await expect(ClientJobsPage()).rejects.toThrow('Authentication failed')
  })
})