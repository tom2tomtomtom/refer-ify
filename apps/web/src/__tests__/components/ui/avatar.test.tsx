import React from 'react'
import { render, screen } from '@testing-library/react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

describe('Avatar Components', () => {
  it('renders avatar structure with image and fallback', () => {
    render(
      <Avatar>
        <AvatarImage src="https://example.com/avatar.jpg" alt="User Avatar" />
        <AvatarFallback>UA</AvatarFallback>
      </Avatar>
    )

    // In test environment, images don't load, so fallback should be displayed
    const fallback = screen.getByText('UA')
    expect(fallback).toBeInTheDocument()
    
    // Avatar container should have proper data attribute
    const avatar = screen.getByText('UA').closest('[data-slot="avatar"]')
    expect(avatar).toBeInTheDocument()
  })

  it('renders fallback when image is not provided', () => {
    render(
      <Avatar>
        <AvatarFallback>JD</AvatarFallback>
      </Avatar>
    )

    expect(screen.getByText('JD')).toBeInTheDocument()
  })

  it('renders fallback when image fails to load', () => {
    render(
      <Avatar>
        <AvatarImage src="invalid-url" alt="User Avatar" />
        <AvatarFallback>FB</AvatarFallback>
      </Avatar>
    )

    expect(screen.getByText('FB')).toBeInTheDocument()
  })

  it('applies custom className to avatar', () => {
    render(
      <Avatar className="custom-avatar">
        <AvatarFallback>CA</AvatarFallback>
      </Avatar>
    )

    const avatar = screen.getByText('CA').closest('[data-slot="avatar"]')
    expect(avatar).toHaveClass('custom-avatar')
  })

  it('applies custom className to fallback', () => {
    render(
      <Avatar>
        <AvatarFallback className="custom-fallback">CF</AvatarFallback>
      </Avatar>
    )

    const fallback = screen.getByText('CF')
    expect(fallback).toHaveClass('custom-fallback')
  })

  it('renders fallback when image fails to load', () => {
    render(
      <Avatar>
        <AvatarImage 
          src="https://example.com/avatar.jpg" 
          alt="User Avatar"
          data-testid="avatar-image"
        />
        <AvatarFallback>UA</AvatarFallback>
      </Avatar>
    )

    // In test environment, image fails to load, so fallback should be displayed
    const fallback = screen.getByText('UA')
    expect(fallback).toBeInTheDocument()
    expect(fallback).toHaveAttribute('data-slot', 'avatar-fallback')
  })

  it('handles different fallback content types', () => {
    render(
      <div>
        <Avatar>
          <AvatarFallback>Text</AvatarFallback>
        </Avatar>
        <Avatar>
          <AvatarFallback>
            <span>Complex</span>
          </AvatarFallback>
        </Avatar>
        <Avatar>
          <AvatarFallback>👤</AvatarFallback>
        </Avatar>
      </div>
    )

    expect(screen.getByText('Text')).toBeInTheDocument()
    expect(screen.getByText('Complex')).toBeInTheDocument()
    expect(screen.getByText('👤')).toBeInTheDocument()
  })
})