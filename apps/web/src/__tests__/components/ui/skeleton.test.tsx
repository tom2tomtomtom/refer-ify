import React from 'react'
import { render, screen } from '@testing-library/react'
import { Skeleton } from '@/components/ui/skeleton'

describe('Skeleton Component', () => {
  it('renders with default props', () => {
    render(<Skeleton data-testid="skeleton" />)
    
    const skeleton = screen.getByTestId('skeleton')
    expect(skeleton).toBeInTheDocument()
    expect(skeleton).toHaveClass('animate-pulse')
  })

  it('applies custom className', () => {
    render(<Skeleton className="custom-skeleton" data-testid="skeleton" />)
    
    const skeleton = screen.getByTestId('skeleton')
    expect(skeleton).toHaveClass('custom-skeleton')
    expect(skeleton).toHaveClass('animate-pulse') // Should still have default classes
  })

  it('renders with proper data attributes', () => {
    render(<Skeleton data-testid="skeleton" />)
    
    const skeleton = screen.getByTestId('skeleton')
    expect(skeleton).toHaveAttribute('data-slot', 'skeleton')
  })

  it('passes through other props', () => {
    render(
      <Skeleton 
        data-testid="skeleton" 
        role="status" 
        aria-label="Loading content"
        style={{ width: '100px', height: '20px' }}
      />
    )
    
    const skeleton = screen.getByTestId('skeleton')
    expect(skeleton).toHaveAttribute('role', 'status')
    expect(skeleton).toHaveAttribute('aria-label', 'Loading content')
    expect(skeleton).toHaveStyle('width: 100px; height: 20px;')
  })

  it('creates multiple skeleton elements', () => {
    render(
      <div>
        <Skeleton className="h-4 w-48 mb-2" />
        <Skeleton className="h-4 w-32 mb-2" />
        <Skeleton className="h-20 w-full" />
      </div>
    )
    
    const skeletons = document.querySelectorAll('.animate-pulse')
    expect(skeletons).toHaveLength(3)
  })

  it('works with common skeleton patterns', () => {
    render(
      <div className="space-y-3">
        {/* Avatar skeleton */}
        <Skeleton className="h-12 w-12 rounded-full" />
        
        {/* Text line skeletons */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-4/5" />
        </div>
        
        {/* Card skeleton */}
        <div className="p-4 border rounded">
          <Skeleton className="h-6 w-3/4 mb-3" />
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      </div>
    )
    
    const skeletons = document.querySelectorAll('.animate-pulse')
    expect(skeletons.length).toBeGreaterThan(0)
  })

  it('maintains accessibility when used as loading state', () => {
    render(
      <div>
        <Skeleton 
          className="h-8 w-48 mb-4" 
          role="status" 
          aria-label="Loading title"
        />
        <Skeleton 
          className="h-4 w-full mb-2" 
          role="status" 
          aria-label="Loading paragraph"
        />
      </div>
    )
    
    const titleSkeleton = screen.getByLabelText('Loading title')
    const paragraphSkeleton = screen.getByLabelText('Loading paragraph')
    
    expect(titleSkeleton).toHaveAttribute('role', 'status')
    expect(paragraphSkeleton).toHaveAttribute('role', 'status')
  })
})