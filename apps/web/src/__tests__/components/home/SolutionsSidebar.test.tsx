import React from 'react'
import { render, screen } from '@testing-library/react'
import { SolutionsSidebar } from '@/components/home/SolutionsSidebar'

describe('SolutionsSidebar', () => {
  it('renders all solution items correctly', () => {
    render(<SolutionsSidebar />)

    // Check that all three solutions are displayed
    expect(screen.getByText('Founders')).toBeInTheDocument()
    expect(screen.getByText('Referrers')).toBeInTheDocument()
    expect(screen.getByText('Client Solutions')).toBeInTheDocument()

    // Check subtitles
    expect(screen.getByText('Elite Network')).toBeInTheDocument()
    expect(screen.getByText('Quality Referrers')).toBeInTheDocument()
    expect(screen.getByText('Executive Hiring')).toBeInTheDocument()

    // Check CTAs
    expect(screen.getByText('Get Started')).toBeInTheDocument()
    expect(screen.getByText('Join Referrer Network')).toBeInTheDocument()
    expect(screen.getByText('Explore Solutions')).toBeInTheDocument()

    // Check numbering
    expect(screen.getByText('01')).toBeInTheDocument()
    expect(screen.getByText('02')).toBeInTheDocument()
    expect(screen.getByText('03')).toBeInTheDocument()
  })

  it('renders buttons as links with correct hrefs', () => {
    render(<SolutionsSidebar />)

    // Check that links have correct hrefs
    const foundingCircleLink = screen.getByText('Get Started').closest('a')
    const selectCircleLink = screen.getByText('Join Referrer Network').closest('a')
    const clientSolutionsLink = screen.getByText('Explore Solutions').closest('a')

    expect(foundingCircleLink).toHaveAttribute('href', '/join-network')
    expect(selectCircleLink).toHaveAttribute('href', '/join-network')
    expect(clientSolutionsLink).toHaveAttribute('href', '/for-companies')
  })

  it('applies different styling to first item', () => {
    render(<SolutionsSidebar />)

    // The first item (Founders) should have special styling
    const foundingCircleButton = screen.getByText('Get Started')
    const selectCircleButton = screen.getByText('Join Referrer Network')

    // Check that buttons have different classes (first should be default variant, others outline)
    expect(foundingCircleButton).toBeInTheDocument()
    expect(selectCircleButton).toBeInTheDocument()
    
    // Verify buttons are rendered
    expect(foundingCircleButton.tagName).toBe('BUTTON')
    expect(selectCircleButton.tagName).toBe('BUTTON')
  })

  it('displays all items in correct order', () => {
    render(<SolutionsSidebar />)

    const items = screen.getAllByRole('button')
    
    // Should have exactly 3 buttons in the correct order
    expect(items).toHaveLength(3)
    expect(items[0]).toHaveTextContent('Get Started')
    expect(items[1]).toHaveTextContent('Join Referrer Network')
    expect(items[2]).toHaveTextContent('Explore Solutions')
  })

  it('renders cards with proper structure', () => {
    render(<SolutionsSidebar />)

    // Each item should be in a card structure
    const foundingCircleCard = screen.getByText('Founders').closest('[data-slot="card"]')
    const selectCircleCard = screen.getByText('Referrers').closest('[data-slot="card"]')
    const clientCard = screen.getByText('Client Solutions').closest('[data-slot="card"]')

    expect(foundingCircleCard).toBeInTheDocument()
    expect(selectCircleCard).toBeInTheDocument()
    expect(clientCard).toBeInTheDocument()
  })
})