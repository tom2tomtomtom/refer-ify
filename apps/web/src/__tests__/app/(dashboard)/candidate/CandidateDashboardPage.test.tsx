/**
 * @jest-environment jsdom
 */
import React from 'react'
import { render, screen } from '@testing-library/react'
import CandidateDashboardPage from '@/app/(dashboard)/candidate/page'
import { requireRole } from "@/lib/auth"

// Mock auth function
jest.mock("@/lib/auth", () => ({
  requireRole: jest.fn()
}))

describe('Candidate Dashboard Page', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(requireRole as jest.Mock).mockResolvedValue(undefined)
  })

  it('requires candidate role authentication', async () => {
    await CandidateDashboardPage()
    
    expect(requireRole).toHaveBeenCalledWith("candidate")
  })

  it('renders main heading', async () => {
    const CandidateDashboard = await CandidateDashboardPage()
    render(CandidateDashboard)

    expect(screen.getByText('Candidate Dashboard')).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Candidate Dashboard')
  })

  it('has proper page structure and styling', async () => {
    const { container } = render(await CandidateDashboardPage())

    const mainContainer = container.querySelector('div')
    expect(mainContainer).toHaveClass('p-6')
  })

  it('heading has proper styling', async () => {
    const { container } = render(await CandidateDashboardPage())

    const heading = container.querySelector('h1')
    expect(heading).toHaveClass('text-2xl', 'font-semibold')
  })

  it('handles authentication errors gracefully', async () => {
    ;(requireRole as jest.Mock).mockRejectedValue(new Error('Authentication failed'))

    await expect(CandidateDashboardPage()).rejects.toThrow('Authentication failed')
  })

  it('handles dynamic rendering correctly', async () => {
    const { container } = render(await CandidateDashboardPage())
    expect(container.firstChild).toBeInTheDocument()
  })
})