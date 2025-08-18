import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'

describe('Dialog Components', () => {
  it('renders dialog trigger', () => {
    render(
      <Dialog>
        <DialogTrigger asChild>
          <button>Open Dialog</button>
        </DialogTrigger>
        <DialogContent>
          <p>Dialog content</p>
        </DialogContent>
      </Dialog>
    )

    expect(screen.getByText('Open Dialog')).toBeInTheDocument()
  })

  it('opens dialog when trigger is clicked', () => {
    render(
      <Dialog>
        <DialogTrigger asChild>
          <button>Open Dialog</button>
        </DialogTrigger>
        <DialogContent>
          <DialogTitle>Dialog Title</DialogTitle>
          <p>Dialog content</p>
        </DialogContent>
      </Dialog>
    )

    const trigger = screen.getByText('Open Dialog')
    fireEvent.click(trigger)

    expect(screen.getByText('Dialog Title')).toBeInTheDocument()
    expect(screen.getByText('Dialog content')).toBeInTheDocument()
  })

  it('renders dialog header with title and description', () => {
    render(
      <Dialog defaultOpen>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Test Title</DialogTitle>
            <DialogDescription>Test Description</DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    )

    expect(screen.getByText('Test Title')).toBeInTheDocument()
    expect(screen.getByText('Test Description')).toBeInTheDocument()
  })

  it('renders dialog footer', () => {
    render(
      <Dialog defaultOpen>
        <DialogContent>
          <DialogFooter>
            <button>Cancel</button>
            <button>Confirm</button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    )

    expect(screen.getByText('Cancel')).toBeInTheDocument()
    expect(screen.getByText('Confirm')).toBeInTheDocument()
  })

  it('closes dialog when close button is clicked', () => {
    render(
      <Dialog defaultOpen>
        <DialogContent>
          <DialogTitle>Dialog Title</DialogTitle>
          <p>Dialog content</p>
        </DialogContent>
      </Dialog>
    )

    expect(screen.getByText('Dialog Title')).toBeInTheDocument()

    const closeButton = screen.getByRole('button', { name: /close/i })
    fireEvent.click(closeButton)

    expect(screen.queryByText('Dialog Title')).not.toBeInTheDocument()
  })

  it('closes dialog when escape key is pressed', () => {
    render(
      <Dialog defaultOpen>
        <DialogContent>
          <DialogTitle>Dialog Title</DialogTitle>
          <p>Dialog content</p>
        </DialogContent>
      </Dialog>
    )

    expect(screen.getByText('Dialog Title')).toBeInTheDocument()

    fireEvent.keyDown(document, { key: 'Escape' })

    expect(screen.queryByText('Dialog Title')).not.toBeInTheDocument()
  })

  it('traps focus within dialog', () => {
    render(
      <Dialog defaultOpen>
        <DialogContent>
          <DialogTitle>Dialog Title</DialogTitle>
          <input placeholder="First input" />
          <input placeholder="Second input" />
          <button>Submit</button>
        </DialogContent>
      </Dialog>
    )

    const firstInput = screen.getByPlaceholderText('First input')
    const secondInput = screen.getByPlaceholderText('Second input')
    const submitButton = screen.getByText('Submit')

    // Focus should cycle within the dialog
    fireEvent.keyDown(submitButton, { key: 'Tab' })
    expect(firstInput).toHaveFocus()

    fireEvent.keyDown(firstInput, { key: 'Tab' })
    expect(secondInput).toHaveFocus()
  })

  it('has proper accessibility attributes', () => {
    render(
      <Dialog defaultOpen>
        <DialogContent>
          <DialogTitle>Test Title</DialogTitle>
          <DialogDescription>Test Description</DialogDescription>
          <p>Content</p>
        </DialogContent>
      </Dialog>
    )

    const dialog = screen.getByRole('dialog')
    expect(dialog).toHaveAttribute('aria-labelledby')
    expect(dialog).toHaveAttribute('aria-describedby')
  })

  it('renders with custom className', () => {
    render(
      <Dialog defaultOpen>
        <DialogContent className="custom-dialog">
          <DialogTitle>Test Title</DialogTitle>
        </DialogContent>
      </Dialog>
    )

    const dialog = screen.getByRole('dialog')
    expect(dialog).toHaveClass('custom-dialog')
  })

  it('supports controlled state', () => {
    const MockControlledDialog = () => {
      const [open, setOpen] = React.useState(false)

      return (
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <button>Open Controlled Dialog</button>
          </DialogTrigger>
          <DialogContent>
            <DialogTitle>Controlled Dialog</DialogTitle>
            <button onClick={() => setOpen(false)}>Close</button>
          </DialogContent>
        </Dialog>
      )
    }

    render(<MockControlledDialog />)

    expect(screen.queryByText('Controlled Dialog')).not.toBeInTheDocument()

    const trigger = screen.getByText('Open Controlled Dialog')
    fireEvent.click(trigger)

    expect(screen.getByText('Controlled Dialog')).toBeInTheDocument()

    const closeButton = screen.getByText('Close')
    fireEvent.click(closeButton)

    expect(screen.queryByText('Controlled Dialog')).not.toBeInTheDocument()
  })
})