/**
 * @jest-environment jsdom
 */
import React from 'react'
import { render, screen } from '@testing-library/react'
import PricingPage from '@/app/pricing/page'

// Mock Next.js Link component
jest.mock('next/link', () => {
  return ({ href, children, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  )
})

describe('Pricing Page', () => {
  it('renders main pricing content', () => {
    render(<PricingPage />)

    expect(screen.getByText('Choose Your Access Level')).toBeInTheDocument()
    expect(screen.getByText('Relationship-first executive hiring with clear pricing.')).toBeInTheDocument()
  })

  it('displays all three pricing plans', () => {
    render(<PricingPage />)

    // Check all plan names
    expect(screen.getByText('CONNECT')).toBeInTheDocument()
    expect(screen.getByText('PRIORITY')).toBeInTheDocument()
    expect(screen.getByText('EXCLUSIVE')).toBeInTheDocument()

    // Check all prices
    expect(screen.getByText('$500/mo')).toBeInTheDocument()
    expect(screen.getByText('$1,500/mo')).toBeInTheDocument()
    expect(screen.getByText('$3,000/mo')).toBeInTheDocument()
  })

  it('displays CONNECT plan features correctly', () => {
    render(<PricingPage />)

    expect(screen.getByText('• Standard visibility')).toBeInTheDocument()
    expect(screen.getByText('• Relationship-based referrals')).toBeInTheDocument()
    expect(screen.getByText('• Access to Connect opportunities')).toBeInTheDocument()
    expect(screen.getByText('Placement fee applies')).toBeInTheDocument()
    expect(screen.getByText('Perfect for: Scaling teams with predictable hiring')).toBeInTheDocument()
  })

  it('displays PRIORITY plan features correctly', () => {
    render(<PricingPage />)

    expect(screen.getByText('• Featured listings')).toBeInTheDocument()
    expect(screen.getByText('• Faster intros and priority reviews')).toBeInTheDocument()
    expect(screen.getByText('• Access to Priority opportunities')).toBeInTheDocument()
    expect(screen.getByText('Reduced placement fee')).toBeInTheDocument()
    expect(screen.getByText('Perfect for: Time-sensitive leadership hires')).toBeInTheDocument()
  })

  it('displays EXCLUSIVE plan features correctly', () => {
    render(<PricingPage />)

    expect(screen.getByText('• Premium placement & dedicated support')).toBeInTheDocument()
    expect(screen.getByText('• Highest signal intros')).toBeInTheDocument()
    expect(screen.getByText('• Full analytics')).toBeInTheDocument()
    expect(screen.getByText('Best placement fee terms')).toBeInTheDocument()
    expect(screen.getByText('Perfect for: Confidential or critical exec roles')).toBeInTheDocument()
  })

  it('highlights PRIORITY plan as recommended', () => {
    const { container } = render(<PricingPage />)
    
    // Find the PRIORITY plan card and check for highlight styling
    const priorityCard = screen.getByText('PRIORITY').closest('.rounded')
    expect(priorityCard).toHaveClass('ring-2', 'ring-black')

    // Other plans should not have highlight
    const connectCard = screen.getByText('CONNECT').closest('.rounded')
    const exclusiveCard = screen.getByText('EXCLUSIVE').closest('.rounded')
    
    expect(connectCard).not.toHaveClass('ring-2')
    expect(exclusiveCard).not.toHaveClass('ring-2')
  })

  it('includes get started links for all plans', () => {
    render(<PricingPage />)

    const getStartedLinks = screen.getAllByText('Get Started')
    expect(getStartedLinks).toHaveLength(3)

    getStartedLinks.forEach(link => {
      expect(link.closest('a')).toHaveAttribute('href', '/client')
    })
  })

  it('displays ROI calculator section', () => {
    render(<PricingPage />)

    expect(screen.getByText('ROI Calculator')).toBeInTheDocument()
    expect(screen.getByText(/Example: filling a Director role with a \$180K placement fee/)).toBeInTheDocument()
    expect(screen.getByText(/vs traditional executive search can save 60-80%/)).toBeInTheDocument()
  })

  it('has proper responsive grid layout', () => {
    const { container } = render(<PricingPage />)

    const grid = container.querySelector('.grid.gap-6.md\\:grid-cols-3')
    expect(grid).toBeInTheDocument()
  })

  it('uses correct styling classes', () => {
    const { container } = render(<PricingPage />)

    const main = container.querySelector('main')
    expect(main).toHaveClass('min-h-screen', 'bg-[#f8f9fa]')

    const section = container.querySelector('section')
    expect(section).toHaveClass('max-w-6xl', 'mx-auto', 'px-6', 'py-16', 'space-y-10')
  })

  it('renders all plan labels correctly', () => {
    render(<PricingPage />)

    const planLabels = screen.getAllByText('PLAN')
    expect(planLabels).toHaveLength(3)
  })

  it('displays all plan cards with correct structure', () => {
    const { container } = render(<PricingPage />)

    const cards = container.querySelectorAll('.rounded.border.bg-white.p-6.shadow-sm')
    expect(cards).toHaveLength(3)

    cards.forEach(card => {
      expect(card).toBeInTheDocument()
    })
  })

  it('includes pricing section anchor', () => {
    const { container } = render(<PricingPage />)

    const pricingSection = container.querySelector('#pricing')
    expect(pricingSection).toBeInTheDocument()
  })

  it('handles dynamic rendering correctly', () => {
    // Test that the component renders without client-side issues
    const { container } = render(<PricingPage />)
    expect(container.firstChild).toBeInTheDocument()
  })
})