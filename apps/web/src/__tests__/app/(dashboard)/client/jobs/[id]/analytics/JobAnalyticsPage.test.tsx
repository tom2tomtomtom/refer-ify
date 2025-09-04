/**
 * @jest-environment jsdom
 */
import React from 'react'
import { render, screen } from '@testing-library/react'
import JobAnalyticsPage from '@/app/(dashboard)/client/jobs/[id]/analytics/page'

jest.mock('@/lib/auth', () => ({ requireRole: jest.fn(() => Promise.resolve({ user: { id: 'client-1' } })) }))

// Mock fetch in server component
global.fetch = jest.fn(async () => ({ json: async () => ({ pipelineCounts: { submitted: 5, reviewed: 3, shortlisted: 2, hired: 1 }, avgTimeToHire: 9 }) })) as any

describe('JobAnalyticsPage', () => {
  it('renders job analytics metrics and back link', async () => {
    const Page = await JobAnalyticsPage({ params: { id: 'job-123' } as any } as any)
    const { container } = render(Page)

    expect(screen.getByText('Job Analytics')).toBeInTheDocument()
    expect(screen.getByText('Submitted')).toBeInTheDocument()
    expect(screen.getByText('Reviewed')).toBeInTheDocument()
    expect(screen.getByText('Shortlisted')).toBeInTheDocument()
    expect(screen.getByText('Hired')).toBeInTheDocument()
    expect(screen.getByText('Avg time to hire (days)')).toBeInTheDocument()

    const back = screen.getByText('← Back to Job').closest('a')
    expect(back).toHaveAttribute('href', '/client/jobs/job-123')

    // grid should be 4 columns on md
    expect(container.querySelector('.grid.gap-4.md\\:grid-cols-4')).toBeInTheDocument()
  })
})

