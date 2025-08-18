/**
 * @jest-environment jsdom
 */
import React from 'react'
import { render, screen } from '@testing-library/react'
import AboutPage from '@/app/about/page'

describe('About Page', () => {
  it('renders main heading and tagline', () => {
    render(<AboutPage />)

    expect(screen.getByText('About Refer-ify')).toBeInTheDocument()
    expect(screen.getByText("Proving that 'Network = Networth' through ethical relationship monetization")).toBeInTheDocument()
  })

  it('displays mission section', () => {
    render(<AboutPage />)

    expect(screen.getByText('Mission')).toBeInTheDocument()
    expect(screen.getByText(/We connect senior technology executives with premium opportunities/)).toBeInTheDocument()
    expect(screen.getByText(/across APAC & EMEA through trusted/)).toBeInTheDocument()
    expect(screen.getByText(/Our mission is to reward integrity, accelerate hiring/)).toBeInTheDocument()
  })

  it('renders company history milestones', () => {
    render(<AboutPage />)

    expect(screen.getByText('Company History')).toBeInTheDocument()
    
    // Check for milestone numbers
    expect(screen.getByText('01')).toBeInTheDocument()
    expect(screen.getByText('02')).toBeInTheDocument()
    expect(screen.getByText('03')).toBeInTheDocument()

    // Check for milestone titles
    expect(screen.getByText('Milestone 1')).toBeInTheDocument()
    expect(screen.getByText('Milestone 2')).toBeInTheDocument()
    expect(screen.getByText('Milestone 3')).toBeInTheDocument()

    // Check that all milestones have descriptions
    const descriptions = screen.getAllByText('Key achievements and growth moments shaping our network and client outcomes.')
    expect(descriptions).toHaveLength(3)
  })

  it('displays all company values', () => {
    render(<AboutPage />)

    expect(screen.getByText('Values')).toBeInTheDocument()

    // Check for value titles
    expect(screen.getByText('Integrity')).toBeInTheDocument()
    expect(screen.getByText('Velocity')).toBeInTheDocument()
    expect(screen.getByText('Excellence')).toBeInTheDocument()
    expect(screen.getByText('Alignment')).toBeInTheDocument()

    // Check for value descriptions
    expect(screen.getByText('We prioritize ethical relationships and discretion.')).toBeInTheDocument()
    expect(screen.getByText('We reduce hiring cycles through trusted introductions.')).toBeInTheDocument()
    expect(screen.getByText('We focus on senior roles where quality matters most.')).toBeInTheDocument()
    expect(screen.getByText('We reward outcomes and shared success.')).toBeInTheDocument()

    // Check for VALUE labels
    const valueLabels = screen.getAllByText('VALUE')
    expect(valueLabels).toHaveLength(4)
  })

  it('has proper page structure and styling', () => {
    const { container } = render(<AboutPage />)

    const main = container.querySelector('main')
    expect(main).toHaveClass('min-h-screen', 'bg-[#f8f9fa]')

    const section = container.querySelector('section')
    expect(section).toHaveClass('max-w-5xl', 'mx-auto', 'px-6', 'py-16', 'space-y-10')
  })

  it('renders milestone cards with correct structure', () => {
    const { container } = render(<AboutPage />)

    const milestoneCards = container.querySelectorAll('.rounded.border.bg-white.p-4.shadow-sm')
    expect(milestoneCards.length).toBeGreaterThanOrEqual(3) // At least 3 milestone cards
  })

  it('renders value cards in responsive grid', () => {
    const { container } = render(<AboutPage />)

    const valueGrid = container.querySelector('.grid.sm\\:grid-cols-2.gap-4')
    expect(valueGrid).toBeInTheDocument()
  })

  it('uses consistent card styling for milestones and values', () => {
    const { container } = render(<AboutPage />)

    const allCards = container.querySelectorAll('.rounded.border.bg-white.p-4.shadow-sm')
    expect(allCards.length).toBe(7) // 3 milestones + 4 values
  })

  it('displays proper heading hierarchy', () => {
    render(<AboutPage />)

    // Main heading
    const h1 = screen.getByRole('heading', { level: 1 })
    expect(h1).toHaveTextContent('About Refer-ify')

    // Section headings
    const h2Elements = screen.getAllByRole('heading', { level: 2 })
    expect(h2Elements).toHaveLength(3)
    
    const headingTexts = h2Elements.map(h => h.textContent)
    expect(headingTexts).toContain('Mission')
    expect(headingTexts).toContain('Company History')
    expect(headingTexts).toContain('Values')
  })

  it('maintains content accessibility', () => {
    render(<AboutPage />)

    // Check that main content is within main tag
    const main = screen.getByRole('main')
    expect(main).toBeInTheDocument()

    // Check heading structure
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument()
    expect(screen.getAllByRole('heading', { level: 2 })).toHaveLength(3)
  })

  it('renders all sections in correct order', () => {
    const { container } = render(<AboutPage />)

    const sections = container.querySelectorAll('section')
    expect(sections).toHaveLength(4) // Main intro + 3 content sections

    const headings = container.querySelectorAll('h1, h2')
    const headingOrder = Array.from(headings).map(h => h.textContent)
    
    expect(headingOrder).toEqual([
      'About Refer-ify',
      'Mission', 
      'Company History',
      'Values'
    ])
  })

  it('handles dynamic rendering correctly', () => {
    // Test that the component renders without client-side issues
    const { container } = render(<AboutPage />)
    expect(container.firstChild).toBeInTheDocument()
  })
})