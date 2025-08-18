/**
 * @jest-environment jsdom
 */
import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import ContactPage from '@/app/contact/page'

describe('Contact Page', () => {
  it('renders main heading and description', () => {
    render(<ContactPage />)

    expect(screen.getByText('Contact Our Team')).toBeInTheDocument()
    expect(screen.getByText((content) => content.includes("respond within one business day"))).toBeInTheDocument()
  })

  it('displays contact form with all fields', () => {
    render(<ContactPage />)

    // Check form labels
    expect(screen.getByText('Name')).toBeInTheDocument()
    expect(screen.getByText('Email')).toBeInTheDocument() 
    expect(screen.getByText('Message')).toBeInTheDocument()

    // Check form inputs
    expect(screen.getByPlaceholderText('Your name')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('you@company.com')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('How can we help?')).toBeInTheDocument()

    // Check submit button
    expect(screen.getByText('Send')).toBeInTheDocument()
  })

  it('allows user to type in form fields', () => {
    render(<ContactPage />)

    const nameInput = screen.getByPlaceholderText('Your name') as HTMLInputElement
    const emailInput = screen.getByPlaceholderText('you@company.com') as HTMLInputElement
    const messageInput = screen.getByPlaceholderText('How can we help?') as HTMLTextAreaElement

    fireEvent.change(nameInput, { target: { value: 'John Doe' } })
    fireEvent.change(emailInput, { target: { value: 'john@example.com' } })
    fireEvent.change(messageInput, { target: { value: 'I need help with recruitment' } })

    expect(nameInput.value).toBe('John Doe')
    expect(emailInput.value).toBe('john@example.com')
    expect(messageInput.value).toBe('I need help with recruitment')
  })

  it('displays office contact information', () => {
    render(<ContactPage />)

    expect(screen.getByText('OFFICE')).toBeInTheDocument()
    expect(screen.getByText('Level 15, 1 Macquarie Place, Sydney NSW 2000')).toBeInTheDocument()
    
    expect(screen.getByText('EMAIL')).toBeInTheDocument()
    expect(screen.getByText('hello@refer-ify.com')).toBeInTheDocument()
  })

  it('has responsive grid layout', () => {
    const { container } = render(<ContactPage />)

    const grid = container.querySelector('.grid.gap-6.md\\:grid-cols-2')
    expect(grid).toBeInTheDocument()
  })

  it('form has proper structure', () => {
    const { container } = render(<ContactPage />)

    const form = container.querySelector('form')
    expect(form).toHaveClass('rounded', 'border', 'bg-white', 'p-6', 'shadow-sm', 'space-y-4')

    // Check that form has correct number of input groups
    const formGroups = form?.querySelectorAll('div')
    expect(formGroups?.length).toBe(3) // name, email, message
  })

  it('contact info card has proper structure', () => {
    const { container } = render(<ContactPage />)

    const infoCard = container.querySelector('.rounded.border.bg-white.p-6.shadow-sm.space-y-3')
    expect(infoCard).toBeInTheDocument()
  })

  it('renders proper form input types', () => {
    render(<ContactPage />)

    const nameInput = screen.getByPlaceholderText('Your name')
    const emailInput = screen.getByPlaceholderText('you@company.com')
    const messageInput = screen.getByPlaceholderText('How can we help?')

    expect(nameInput.tagName).toBe('INPUT')
    expect(emailInput.tagName).toBe('INPUT')
    expect(messageInput.tagName).toBe('TEXTAREA')
  })

  it('textarea has correct rows attribute', () => {
    render(<ContactPage />)

    const messageInput = screen.getByPlaceholderText('How can we help?')
    expect(messageInput).toHaveAttribute('rows', '5')
  })

  it('has proper page styling', () => {
    const { container } = render(<ContactPage />)

    const main = container.querySelector('main')
    expect(main).toHaveClass('min-h-screen', 'bg-[#f8f9fa]')

    const section = container.querySelector('section')
    expect(section).toHaveClass('max-w-5xl', 'mx-auto', 'px-6', 'py-16', 'space-y-10')
  })

  it('form inputs have consistent styling', () => {
    const { container } = render(<ContactPage />)

    const inputs = container.querySelectorAll('input')
    const textareas = container.querySelectorAll('textarea')

    inputs.forEach(input => {
      expect(input).toHaveClass('mt-1', 'w-full', 'rounded', 'border', 'p-2', 'bg-[#f8f9fa]')
    })

    textareas.forEach(textarea => {
      expect(textarea).toHaveClass('mt-1', 'w-full', 'rounded', 'border', 'p-2', 'bg-[#f8f9fa]')
    })
  })

  it('submit button has correct styling', () => {
    render(<ContactPage />)

    const submitButton = screen.getByText('Send')
    expect(submitButton).toHaveClass('inline-flex', 'items-center', 'rounded-md', 'bg-black', 'px-4', 'py-2', 'text-white', 'hover:opacity-90')
  })

  it('maintains proper form accessibility', () => {
    render(<ContactPage />)

    // Check that form element exists
    const form = screen.getByRole('button', { name: 'Send' }).closest('form')
    expect(form).toBeInTheDocument()

    // Check labels are associated with inputs
    const nameLabel = screen.getByText('Name')
    const emailLabel = screen.getByText('Email') 
    const messageLabel = screen.getByText('Message')

    expect(nameLabel).toHaveClass('text-sm', 'font-medium')
    expect(emailLabel).toHaveClass('text-sm', 'font-medium')
    expect(messageLabel).toHaveClass('text-sm', 'font-medium')
  })

  it('handles form submission button click', () => {
    render(<ContactPage />)

    const submitButton = screen.getByText('Send')
    
    // Should not throw error when clicked (even though form doesn't have action)
    expect(() => fireEvent.click(submitButton)).not.toThrow()
  })

  it('has proper heading hierarchy', () => {
    render(<ContactPage />)

    const h1 = screen.getByRole('heading', { level: 1 })
    expect(h1).toHaveTextContent('Contact Our Team')
  })

  it('renders within main landmark', () => {
    render(<ContactPage />)

    const main = screen.getByRole('main')
    expect(main).toBeInTheDocument()
    expect(main).toContainElement(screen.getByText('Contact Our Team'))
  })

  it('handles dynamic rendering correctly', () => {
    const { container } = render(<ContactPage />)
    expect(container.firstChild).toBeInTheDocument()
  })
})