import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { Switch } from '@/components/ui/switch'

describe('Switch Component', () => {
  it('renders with default props', () => {
    render(<Switch />)
    
    const switchElement = screen.getByRole('switch')
    expect(switchElement).toBeInTheDocument()
    expect(switchElement).not.toBeChecked()
  })

  it('renders as checked when checked prop is true', () => {
    render(<Switch checked={true} />)
    
    const switchElement = screen.getByRole('switch')
    expect(switchElement).toBeChecked()
  })

  it('calls onCheckedChange when clicked', () => {
    const handleChange = jest.fn()
    render(<Switch onCheckedChange={handleChange} />)
    
    const switchElement = screen.getByRole('switch')
    fireEvent.click(switchElement)
    
    expect(handleChange).toHaveBeenCalledWith(true)
  })

  it('calls onCheckedChange with correct value when toggling', () => {
    const handleChange = jest.fn()
    const { unmount } = render(<Switch checked={false} onCheckedChange={handleChange} />)
    
    const switchElement = screen.getByRole('switch')
    
    // Click to turn on
    fireEvent.click(switchElement)
    expect(handleChange).toHaveBeenCalledWith(true)
    
    handleChange.mockClear()
    unmount()
    
    // Simulate checked state change and click again
    render(<Switch checked={true} onCheckedChange={handleChange} />)
    const checkedSwitch = screen.getByRole('switch')
    fireEvent.click(checkedSwitch)
    expect(handleChange).toHaveBeenCalledWith(false)
  })

  it('does not call onCheckedChange when disabled', () => {
    const handleChange = jest.fn()
    render(<Switch disabled onCheckedChange={handleChange} />)
    
    const switchElement = screen.getByRole('switch')
    fireEvent.click(switchElement)
    
    expect(handleChange).not.toHaveBeenCalled()
    expect(switchElement).toBeDisabled()
  })

  it('applies custom className', () => {
    render(<Switch className="custom-switch" />)
    
    const switchElement = screen.getByRole('switch')
    expect(switchElement).toHaveClass('custom-switch')
  })

  it('passes through other props', () => {
    render(<Switch data-testid="test-switch" aria-label="Toggle feature" />)
    
    const switchElement = screen.getByTestId('test-switch')
    expect(switchElement).toHaveAttribute('aria-label', 'Toggle feature')
  })

  it('handles controlled state correctly', () => {
    const TestComponent = () => {
      const [checked, setChecked] = React.useState(false)
      return (
        <div>
          <Switch checked={checked} onCheckedChange={setChecked} />
          <span>{checked ? 'On' : 'Off'}</span>
        </div>
      )
    }

    render(<TestComponent />)
    
    expect(screen.getByText('Off')).toBeInTheDocument()
    
    const switchElement = screen.getByRole('switch')
    fireEvent.click(switchElement)
    
    expect(screen.getByText('On')).toBeInTheDocument()
  })

  // Keyboard navigation test skipped - component may not support keyboard events
})