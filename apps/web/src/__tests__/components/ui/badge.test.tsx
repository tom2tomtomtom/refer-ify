import React from 'react'
import { render, screen } from '@testing-library/react'
import { Badge } from '@/components/ui/badge'

describe('Badge Component', () => {
  it('renders with default props', () => {
    render(<Badge>Default Badge</Badge>)
    
    const badge = screen.getByText('Default Badge')
    expect(badge).toBeInTheDocument()
    expect(badge).toHaveClass('inline-flex')
  })

  it('renders with different variants', () => {
    const variants = ['default', 'secondary', 'destructive', 'outline'] as const
    
    variants.forEach((variant, index) => {
      const { unmount } = render(<Badge variant={variant}>Badge {index}</Badge>)
      const badge = screen.getByText(`Badge ${index}`)
      expect(badge).toBeInTheDocument()
      unmount()
    })
  })

  it('passes through custom className', () => {
    render(<Badge className="custom-badge">Custom Badge</Badge>)
    
    const badge = screen.getByText('Custom Badge')
    expect(badge).toHaveClass('custom-badge')
  })

  it('renders different content types', () => {
    render(
      <div>
        <Badge>Text Content</Badge>
        <Badge>
          <span>Complex Content</span>
        </Badge>
        <Badge>{123}</Badge>
      </div>
    )
    
    expect(screen.getByText('Text Content')).toBeInTheDocument()
    expect(screen.getByText('Complex Content')).toBeInTheDocument()
    expect(screen.getByText('123')).toBeInTheDocument()
  })

  it('passes through other props', () => {
    render(<Badge data-testid="test-badge" role="status">Status Badge</Badge>)
    
    const badge = screen.getByTestId('test-badge')
    expect(badge).toHaveAttribute('role', 'status')
  })
})