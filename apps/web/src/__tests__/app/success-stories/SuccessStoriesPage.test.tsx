/**
 * @jest-environment jsdom
 */
import React from 'react'
import { render, screen } from '@testing-library/react'
import SuccessStoriesPage from '@/app/success-stories/page'

describe('Success Stories Page', () => {
  it('renders main heading and description', () => {
    render(<SuccessStoriesPage />)

    expect(screen.getByText('Success Stories')).toBeInTheDocument()
    expect(screen.getByText('Real outcomes from warm, relationship-based referrals.')).toBeInTheDocument()
  })

  it('displays all success story articles', () => {
    render(<SuccessStoriesPage />)

    // Check for VP Engineering story
    expect(screen.getByText('VP Engineering • Series B')).toBeInTheDocument()
    expect(screen.getByText('Hired via Referrer referral in 23 days. Reduced interview load by 60%.')).toBeInTheDocument()

    // Check for Head of Product story
    expect(screen.getByText('Head of Product • Fintech')).toBeInTheDocument()
    expect(screen.getByText('Found through a Founder introduction. Offer accepted in 3 weeks.')).toBeInTheDocument()

    // Check for Country GM story
    expect(screen.getByText('Country GM • APAC')).toBeInTheDocument()
    expect(screen.getByText('Warm referral with prior working history. Seamless close and onboarding.')).toBeInTheDocument()
  })

  it('renders stories in grid layout', () => {
    const { container } = render(<SuccessStoriesPage />)

    const grid = container.querySelector('.grid.gap-6.md\\:grid-cols-3')
    expect(grid).toBeInTheDocument()

    const articles = container.querySelectorAll('article')
    expect(articles).toHaveLength(3)
  })

  it('has proper page structure and styling', () => {
    const { container } = render(<SuccessStoriesPage />)

    const main = container.querySelector('main')
    expect(main).toHaveClass('min-h-screen', 'bg-[#f8f9fa]')

    const section = container.querySelector('section')
    expect(section).toHaveClass('mx-auto', 'max-w-6xl', 'px-6', 'py-16')
  })

  it('renders story cards with consistent styling', () => {
    const { container } = render(<SuccessStoriesPage />)

    const storyCards = container.querySelectorAll('article.rounded.border.bg-white.p-6.shadow-sm')
    expect(storyCards).toHaveLength(3)

    storyCards.forEach(card => {
      expect(card).toHaveClass('rounded', 'border', 'bg-white', 'p-6', 'shadow-sm')
    })
  })

  it('displays proper heading hierarchy', () => {
    render(<SuccessStoriesPage />)

    const h1 = screen.getByRole('heading', { level: 1 })
    expect(h1).toHaveTextContent('Success Stories')
    expect(h1).toHaveClass('text-4xl', 'font-extrabold', 'tracking-tight')
  })

  it('maintains content accessibility', () => {
    render(<SuccessStoriesPage />)

    // Check that main content is within main tag
    const main = screen.getByRole('main')
    expect(main).toBeInTheDocument()
    expect(main).toContainElement(screen.getByText('Success Stories'))

    // Check for proper article landmarks
    const articles = screen.getAllByRole('article')
    expect(articles).toHaveLength(3)
  })

  it('has proper text styling for story titles', () => {
    const { container } = render(<SuccessStoriesPage />)

    const storyTitles = container.querySelectorAll('.text-sm.font-semibold')
    expect(storyTitles).toHaveLength(3)

    const titleTexts = Array.from(storyTitles).map(el => el.textContent)
    expect(titleTexts).toContain('VP Engineering • Series B')
    expect(titleTexts).toContain('Head of Product • Fintech')  
    expect(titleTexts).toContain('Country GM • APAC')
  })

  it('has proper text styling for story descriptions', () => {
    const { container } = render(<SuccessStoriesPage />)

    const descriptions = container.querySelectorAll('.mt-2.text-sm.text-muted-foreground')
    expect(descriptions).toHaveLength(3)
  })

  it('includes time-based metrics in stories', () => {
    render(<SuccessStoriesPage />)

    // Check for time references
    expect(screen.getByText(/23 days/)).toBeInTheDocument()
    expect(screen.getByText(/3 weeks/)).toBeInTheDocument()
    
    // Check for efficiency metrics
    expect(screen.getByText(/60%/)).toBeInTheDocument()
  })

  it('showcases different role types and industries', () => {
    render(<SuccessStoriesPage />)

    // Different role types
    expect(screen.getByText(/VP Engineering/)).toBeInTheDocument()
    expect(screen.getByText(/Head of Product/)).toBeInTheDocument()
    expect(screen.getByText(/Country GM/)).toBeInTheDocument()

    // Different contexts
    expect(screen.getByText(/Series B/)).toBeInTheDocument()
    expect(screen.getByText(/Fintech/)).toBeInTheDocument()
    expect(screen.getByText(/APAC/)).toBeInTheDocument()
  })

  it('emphasizes relationship-based referrals', () => {
    render(<SuccessStoriesPage />)

    expect(screen.getByText(/Referrer referral/)).toBeInTheDocument()
    expect(screen.getByText(/Founder introduction/)).toBeInTheDocument()
    expect(screen.getByText(/Warm referral/)).toBeInTheDocument()
    expect(screen.getByText(/prior working history/)).toBeInTheDocument()
  })

  it('highlights positive outcomes and benefits', () => {
    render(<SuccessStoriesPage />)

    expect(screen.getByText(/Reduced interview load/)).toBeInTheDocument()
    expect(screen.getByText(/Offer accepted/)).toBeInTheDocument()
    expect(screen.getByText(/Seamless close and onboarding/)).toBeInTheDocument()
  })

  it('renders within main landmark for accessibility', () => {
    render(<SuccessStoriesPage />)

    const main = screen.getByRole('main')
    expect(main).toBeInTheDocument()
    expect(main).toContainElement(screen.getByText('Success Stories'))
  })

  it('handles dynamic rendering correctly', () => {
    const { container } = render(<SuccessStoriesPage />)
    expect(container.firstChild).toBeInTheDocument()
  })
})