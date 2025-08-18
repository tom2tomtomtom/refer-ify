import React from 'react'
import { render, screen } from '@testing-library/react'
import { Button } from '@/components/ui/button'

describe('Button Component', () => {
  it('renders with default props', () => {
    render(<Button>Click me</Button>)
    
    const button = screen.getByRole('button', { name: 'Click me' })
    expect(button).toBeInTheDocument()
    expect(button).toHaveClass('inline-flex')
  })

  it('renders with different variants', () => {
    const variants = ['default', 'destructive', 'outline', 'secondary', 'ghost', 'link'] as const
    
    variants.forEach((variant) => {
      render(<Button variant={variant}>Button</Button>)
      const button = screen.getByRole('button', { name: 'Button' })
      expect(button).toBeInTheDocument()
    })
  })

  it('renders with different sizes', () => {
    const sizes = ['default', 'sm', 'lg', 'icon'] as const
    
    sizes.forEach((size) => {
      render(<Button size={size}>Button</Button>)
      const button = screen.getByRole('button', { name: 'Button' })
      expect(button).toBeInTheDocument()
    })
  })

  it('renders as different HTML elements', () => {
    render(<Button asChild><a href="/test">Link Button</a></Button>)
    
    const link = screen.getByRole('link', { name: 'Link Button' })
    expect(link).toBeInTheDocument()
    expect(link.tagName).toBe('A')
  })

  it('passes through custom className', () => {
    render(<Button className="custom-class">Button</Button>)
    
    const button = screen.getByRole('button', { name: 'Button' })
    expect(button).toHaveClass('custom-class')
  })

  it('handles disabled state', () => {
    render(<Button disabled>Disabled Button</Button>)
    
    const button = screen.getByRole('button', { name: 'Disabled Button' })
    expect(button).toBeDisabled()
  })

  it('passes through other props', () => {
    render(<Button type="submit" data-testid="submit-button">Submit</Button>)
    
    const button = screen.getByTestId('submit-button')
    expect(button).toHaveAttribute('type', 'submit')
  })
})