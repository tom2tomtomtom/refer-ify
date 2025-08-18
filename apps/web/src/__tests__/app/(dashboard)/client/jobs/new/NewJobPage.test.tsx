/**
 * @jest-environment jsdom
 */
import React from 'react'
import { render, screen } from '@testing-library/react'
import NewJobPage from '@/app/(dashboard)/client/jobs/new/page'

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

// Mock JobPostingForm component
jest.mock('@/components/jobs/JobPostingForm', () => ({
  JobPostingForm: () => (
    <div data-testid="job-posting-form">
      <h1>Post New Job</h1>
      <form>
        <input placeholder="Job title" />
        <textarea placeholder="Job description" />
        <button type="submit">Post Job</button>
      </form>
    </div>
  ),
}))

describe('New Job Page', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    requireRole.mockResolvedValue({ user: mockUser })
  })

  it('renders the job posting form', async () => {
    const PageComponent = await NewJobPage()
    render(PageComponent)

    const jobForm = screen.getByTestId('job-posting-form')
    expect(jobForm).toBeInTheDocument()
    expect(screen.getByText('Post New Job')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Job title')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Job description')).toBeInTheDocument()
    expect(screen.getByText('Post Job')).toBeInTheDocument()
  })

  it('requires client role for access', async () => {
    await NewJobPage()
    expect(requireRole).toHaveBeenCalledWith('client')
  })

  it('throws error if user lacks required role', async () => {
    requireRole.mockRejectedValue(new Error('Access denied - client role required'))

    await expect(NewJobPage()).rejects.toThrow('Access denied - client role required')
  })

  it('passes user context from authentication', async () => {
    const customUser = { 
      id: 'client-456', 
      email: 'custom@client.com',
      role: 'client'
    }
    requireRole.mockResolvedValue({ user: customUser })

    const PageComponent = await NewJobPage()
    render(PageComponent)

    expect(screen.getByTestId('job-posting-form')).toBeInTheDocument()
    expect(requireRole).toHaveBeenCalledWith('client')
  })

  it('handles authentication failure gracefully', async () => {
    requireRole.mockRejectedValue(new Error('Authentication timeout'))

    await expect(NewJobPage()).rejects.toThrow('Authentication timeout')
  })

  it('renders form directly without wrapper', async () => {
    const PageComponent = await NewJobPage()
    const { container } = render(PageComponent)

    // Should render the JobPostingForm component directly
    expect(container.firstChild).toEqual(screen.getByTestId('job-posting-form'))
  })

  it('handles different user IDs correctly', async () => {
    const users = [
      { id: 'client-001', email: 'user1@company.com', role: 'client' },
      { id: 'client-002', email: 'user2@company.com', role: 'client' },
    ]

    for (const user of users) {
      requireRole.mockResolvedValue({ user })
      const PageComponent = await NewJobPage()
      const { unmount } = render(PageComponent)
      
      expect(screen.getByTestId('job-posting-form')).toBeInTheDocument()
      expect(requireRole).toHaveBeenCalledWith('client')
      
      unmount() // Clean up DOM between iterations
    }
  })
})