/**
 * @jest-environment jsdom
 */
import React from 'react'
import { render, screen } from '@testing-library/react'
import DashboardIndexPage from '@/app/(dashboard)/page'

// Mock Next.js Link component
jest.mock('next/link', () => {
  return ({ href, children, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  )
})

describe('Dashboard Index Page', () => {
  it('renders main heading', () => {
    render(<DashboardIndexPage />)

    expect(screen.getByText('Dashboards')).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Dashboards')
  })

  it('displays all dashboard links', () => {
    render(<DashboardIndexPage />)

    expect(screen.getByText('Client')).toBeInTheDocument()
    expect(screen.getByText('Candidate')).toBeInTheDocument()
    expect(screen.getByText('Founder')).toBeInTheDocument()
    expect(screen.getByText('Referrer')).toBeInTheDocument()
  })

  it('renders dashboard links with correct hrefs', () => {
    render(<DashboardIndexPage />)

    const clientLink = screen.getByText('Client').closest('a')
    expect(clientLink).toHaveAttribute('href', '/client')

    const candidateLink = screen.getByText('Candidate').closest('a')
    expect(candidateLink).toHaveAttribute('href', '/candidate')

    const foundingLink = screen.getByText('Founder').closest('a')
    expect(foundingLink).toHaveAttribute('href', '/founding-circle')

    const selectLink = screen.getByText('Referrer').closest('a')
    expect(selectLink).toHaveAttribute('href', '/select-circle')
  })

  it('renders links as list items', () => {
    render(<DashboardIndexPage />)

    const listItems = screen.getAllByRole('listitem')
    expect(listItems).toHaveLength(4)
  })

  it('uses proper list styling', () => {
    const { container } = render(<DashboardIndexPage />)

    const list = container.querySelector('ul')
    expect(list).toHaveClass('list-disc', 'pl-6')
  })

  it('has proper page structure and spacing', () => {
    const { container } = render(<DashboardIndexPage />)

    const mainContainer = container.querySelector('div')
    expect(mainContainer).toHaveClass('p-6', 'space-y-4')
  })

  it('heading has proper styling', () => {
    const { container } = render(<DashboardIndexPage />)

    const heading = container.querySelector('h1')
    expect(heading).toHaveClass('text-2xl', 'font-semibold')
  })

  it('handles dynamic rendering correctly', () => {
    const { container } = render(<DashboardIndexPage />)
    expect(container.firstChild).toBeInTheDocument()
  })
})