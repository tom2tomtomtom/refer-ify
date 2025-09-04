/**
 * @jest-environment jsdom
 */
import React from 'react'
import { render, screen } from '@testing-library/react'
import ClientAnalyticsPage from '@/app/(dashboard)/client/analytics/page'

jest.mock('@/lib/auth', () => ({ requireRole: jest.fn(() => Promise.resolve({ user: { id: 'client-1' } })) }))

// Mock fetch in server component
global.fetch = jest.fn(async () => ({ json: async () => ({ pipelineCounts: { submitted: 3, reviewed: 2, hired: 1 }, avgTimeToHire: 7 }) })) as any

describe('ClientAnalyticsPage', () => {
  it('renders basic metrics', async () => {
    const Page = await ClientAnalyticsPage()
    render(Page)

    expect(screen.getByText('Analytics')).toBeInTheDocument()
    expect(screen.getByText('Submitted')).toBeInTheDocument()
    expect(screen.getByText('Reviewed')).toBeInTheDocument()
    expect(screen.getByText('Hired')).toBeInTheDocument()
    expect(screen.getByText('Avg time to hire (days)')).toBeInTheDocument()
    expect(screen.getByText('3')).toBeInTheDocument()
    expect(screen.getByText('2')).toBeInTheDocument()
    expect(screen.getByText('1')).toBeInTheDocument()
    expect(screen.getByText('7')).toBeInTheDocument()
  })
})

