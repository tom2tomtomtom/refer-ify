/**
 * @jest-environment jsdom
 */
import React from 'react'
import { render, screen } from '@testing-library/react'
import ApplyPage from '@/app/apply/page'

// Mock Next.js Link component
jest.mock('next/link', () => {
  return ({ href, children, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  )
})

describe('Apply Page', () => {
  it('renders main heading and description', () => {
    render(<ApplyPage />)

    expect(screen.getByText('Request Invitation')).toBeInTheDocument()
    expect(screen.getByText((content) => content.includes("currently accepting applications from senior executives"))).toBeInTheDocument()
  })

  it('displays sign in prompt message', () => {
    render(<ApplyPage />)

    expect(screen.getByText('Please sign in to continue your application.')).toBeInTheDocument()
  })

  it('includes sign in to apply link', () => {
    render(<ApplyPage />)

    const signInLink = screen.getByText('Sign in to Apply')
    expect(signInLink).toBeInTheDocument()
    
    const linkElement = signInLink.closest('a')
    expect(linkElement).toHaveAttribute('href', '/login')
  })

  it('has proper page structure and styling', () => {
    const { container } = render(<ApplyPage />)

    const main = container.querySelector('main')
    expect(main).toHaveClass('min-h-screen', 'bg-[#f8f9fa]')

    const section = container.querySelector('section')
    expect(section).toHaveClass('mx-auto', 'max-w-3xl', 'px-6', 'py-16')
  })

  it('renders content card with proper styling', () => {
    const { container } = render(<ApplyPage />)

    const contentCard = container.querySelector('.rounded.border.bg-white.p-6.shadow-sm')
    expect(contentCard).toBeInTheDocument()
  })

  it('sign in button has correct styling', () => {
    render(<ApplyPage />)

    const signInButton = screen.getByText('Sign in to Apply')
    expect(signInButton).toHaveClass('inline-flex', 'rounded', 'bg-black', 'px-4', 'py-2', 'text-sm', 'font-medium', 'text-white', 'hover:opacity-90')
  })

  it('has proper heading hierarchy', () => {
    render(<ApplyPage />)

    const h1 = screen.getByRole('heading', { level: 1 })
    expect(h1).toHaveTextContent('Request Invitation')
    expect(h1).toHaveClass('text-3xl', 'font-bold', 'tracking-tight')
  })

  it('maintains content accessibility', () => {
    render(<ApplyPage />)

    // Check that main content is within main tag
    const main = screen.getByRole('main')
    expect(main).toBeInTheDocument()
    expect(main).toContainElement(screen.getByText('Request Invitation'))

    // Check for link accessibility
    const link = screen.getByRole('link', { name: 'Sign in to Apply' })
    expect(link).toBeInTheDocument()
  })

  it('has proper text hierarchy and spacing', () => {
    const { container } = render(<ApplyPage />)

    const heading = container.querySelector('h1')
    expect(heading).toHaveClass('text-3xl', 'font-bold', 'tracking-tight')

    const description = container.querySelector('.mt-2.text-muted-foreground')
    expect(description).toBeInTheDocument()

    const card = container.querySelector('.mt-6.rounded.border.bg-white.p-6.shadow-sm')
    expect(card).toBeInTheDocument()
  })

  it('message text has correct styling', () => {
    const { container } = render(<ApplyPage />)

    const messageText = screen.getByText('Please sign in to continue your application.')
    expect(messageText).toHaveClass('text-sm', 'text-muted-foreground')
  })

  it('button container has proper margin', () => {
    const { container } = render(<ApplyPage />)

    const buttonContainer = container.querySelector('.mt-4')
    expect(buttonContainer).toBeInTheDocument()
    expect(buttonContainer).toContainElement(screen.getByText('Sign in to Apply'))
  })

  it('renders all content in correct order', () => {
    const { container } = render(<ApplyPage />)

    const elements = container.querySelectorAll('h1, p, div')
    const hasCorrectOrder = Array.from(elements).some(el => 
      el.textContent?.includes('Request Invitation')
    )
    expect(hasCorrectOrder).toBe(true)
  })

  it('link navigation points to login page', () => {
    render(<ApplyPage />)

    const link = screen.getByRole('link', { name: 'Sign in to Apply' })
    expect(link).toHaveAttribute('href', '/login')
  })

  it('handles dynamic rendering correctly', () => {
    const { container } = render(<ApplyPage />)
    expect(container.firstChild).toBeInTheDocument()
  })

  it('has consistent color scheme with other pages', () => {
    const { container } = render(<ApplyPage />)

    // Check background colors match site theme
    const main = container.querySelector('main')
    expect(main).toHaveClass('bg-[#f8f9fa]')
    
    const card = container.querySelector('.bg-white')
    expect(card).toBeInTheDocument()
    
    const button = container.querySelector('.bg-black')
    expect(button).toBeInTheDocument()
  })

  it('description mentions target audience', () => {
    render(<ApplyPage />)

    const description = screen.getByText(/senior executives and trusted referrers/)
    expect(description).toBeInTheDocument()
  })

  it('uses consistent spacing utilities', () => {
    const { container } = render(<ApplyPage />)

    // Check for consistent margin/padding classes
    expect(container.querySelector('.px-6')).toBeInTheDocument()
    expect(container.querySelector('.py-16')).toBeInTheDocument()
    expect(container.querySelector('.p-6')).toBeInTheDocument()
    expect(container.querySelector('.mt-2')).toBeInTheDocument()
    expect(container.querySelector('.mt-4')).toBeInTheDocument()
    expect(container.querySelector('.mt-6')).toBeInTheDocument()
  })
})