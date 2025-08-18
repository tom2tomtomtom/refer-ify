import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { ReferralForm } from '@/components/referrals/ReferralForm'

// Mock toast notifications
jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}))

const { toast } = require('sonner')

describe('ReferralForm', () => {
  const mockJob = {
    id: '123',
    title: 'Senior Software Engineer',
    description: 'Join our team as a senior software engineer working with React and TypeScript',
    salary_min: 100000,
    salary_max: 150000,
    currency: 'USD',
    requirements: {
      skills: ['React', 'TypeScript', 'Node.js'],
      experience: '5+ years',
    },
  }

  const mockOnSubmitted = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    // Mock successful fetch responses by default
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          referral: { id: 'ref-123' }
        }),
      })
    ) as jest.Mock
  })

  afterEach(() => {
    (global.fetch as jest.Mock).mockRestore()
  })

  it('renders form with job information', () => {
    render(<ReferralForm job={mockJob} onSubmitted={mockOnSubmitted} />)

    expect(screen.getByText('Refer a Professional')).toBeInTheDocument()
    expect(screen.getByText('Senior Software Engineer')).toBeInTheDocument()
    expect(screen.getByText('Join our team as a senior software engineer working with React and TypeScript')).toBeInTheDocument()
    
    // Check form fields
    expect(screen.getByLabelText('First Name *')).toBeInTheDocument()
    expect(screen.getByLabelText('Last Name *')).toBeInTheDocument()
    expect(screen.getByLabelText('Professional Email *')).toBeInTheDocument()
    expect(screen.getByLabelText('Phone')).toBeInTheDocument()
    expect(screen.getByLabelText('Why is this professional a strong fit?')).toBeInTheDocument()
    
    // Check consent checkbox
    expect(screen.getByRole('checkbox')).toBeInTheDocument()
    expect(screen.getByText(/I confirm the candidate has given permission to be referred/)).toBeInTheDocument()
    
    // Check submit button
    expect(screen.getByRole('button', { name: 'Submit Referral' })).toBeInTheDocument()
  })

  it('renders form without job information when job is null', () => {
    render(<ReferralForm job={null} onSubmitted={mockOnSubmitted} />)

    expect(screen.getByText('Refer a Professional')).toBeInTheDocument()
    expect(screen.queryByText('Senior Software Engineer')).not.toBeInTheDocument()
    
    // Form fields should still be present
    expect(screen.getByLabelText('First Name *')).toBeInTheDocument()
    expect(screen.getByLabelText('Last Name *')).toBeInTheDocument()
    expect(screen.getByLabelText('Professional Email *')).toBeInTheDocument()
  })

  it('allows filling form fields', () => {
    render(<ReferralForm job={mockJob} onSubmitted={mockOnSubmitted} />)

    const firstNameInput = screen.getByLabelText('First Name *')
    const lastNameInput = screen.getByLabelText('Last Name *')
    const emailInput = screen.getByLabelText('Professional Email *')
    const phoneInput = screen.getByLabelText('Phone')
    const notesTextarea = screen.getByLabelText('Why is this professional a strong fit?')

    fireEvent.change(firstNameInput, { target: { value: 'John' } })
    fireEvent.change(lastNameInput, { target: { value: 'Doe' } })
    fireEvent.change(emailInput, { target: { value: 'john@example.com' } })
    fireEvent.change(phoneInput, { target: { value: '+1234567890' } })
    fireEvent.change(notesTextarea, { target: { value: 'Great developer with 5 years experience' } })

    expect(firstNameInput).toHaveValue('John')
    expect(lastNameInput).toHaveValue('Doe')
    expect(emailInput).toHaveValue('john@example.com')
    expect(phoneInput).toHaveValue('+1234567890')
    expect(notesTextarea).toHaveValue('Great developer with 5 years experience')
  })

  it('validates consent checkbox before submission', async () => {
    render(<ReferralForm job={mockJob} onSubmitted={mockOnSubmitted} />)

    // Fill required fields
    fireEvent.change(screen.getByLabelText('First Name *'), { target: { value: 'John' } })
    fireEvent.change(screen.getByLabelText('Last Name *'), { target: { value: 'Doe' } })
    fireEvent.change(screen.getByLabelText('Professional Email *'), { target: { value: 'john@example.com' } })

    // Try to submit without consent
    fireEvent.click(screen.getByRole('button', { name: 'Submit Referral' }))

    expect(toast.error).toHaveBeenCalledWith('You must provide GDPR consent')
    expect(fetch).not.toHaveBeenCalled()
  })

  it('allows form fields to be filled and shows valid state', () => {
    render(<ReferralForm job={mockJob} onSubmitted={mockOnSubmitted} />)

    // Fill form fields
    fireEvent.change(screen.getByLabelText('First Name *'), { target: { value: 'John' } })
    fireEvent.change(screen.getByLabelText('Last Name *'), { target: { value: 'Doe' } })
    fireEvent.change(screen.getByLabelText('Professional Email *'), { target: { value: 'john@example.com' } })
    fireEvent.change(screen.getByLabelText('Phone'), { target: { value: '+1234567890' } })
    fireEvent.change(screen.getByLabelText('Why is this professional a strong fit?'), { target: { value: 'Great fit' } })

    // Verify form fields have correct values
    expect(screen.getByLabelText('First Name *')).toHaveValue('John')
    expect(screen.getByLabelText('Last Name *')).toHaveValue('Doe')
    expect(screen.getByLabelText('Professional Email *')).toHaveValue('john@example.com')
    expect(screen.getByLabelText('Phone')).toHaveValue('+1234567890')
    expect(screen.getByLabelText('Why is this professional a strong fit?')).toHaveValue('Great fit')
  })

  it('validates required fields', async () => {
    render(<ReferralForm job={mockJob} onSubmitted={mockOnSubmitted} />)

    // Try to submit without filling required fields
    fireEvent.click(screen.getByRole('button', { name: 'Submit Referral' }))

    expect(toast.error).toHaveBeenCalledWith('You must provide GDPR consent')
    expect(mockOnSubmitted).not.toHaveBeenCalled()
  })

  it('validates file upload', async () => {
    render(<ReferralForm job={mockJob} onSubmitted={mockOnSubmitted} />)

    const fileInput = screen.getByLabelText('Resume / Profile (PDF, DOC, DOCX, max 5MB)').closest('input') as HTMLInputElement

    // Test invalid file type
    const invalidFile = new File(['test'], 'test.txt', { type: 'text/plain' })
    fireEvent.change(fileInput, { target: { files: [invalidFile] } })

    expect(toast.error).toHaveBeenCalledWith('Invalid file type. Upload PDF, DOC or DOCX')

    jest.clearAllMocks()

    // Test file too large (>5MB)
    const largeFile = new File(['x'.repeat(6 * 1024 * 1024)], 'test.pdf', { type: 'application/pdf' })
    fireEvent.change(fileInput, { target: { files: [largeFile] } })

    expect(toast.error).toHaveBeenCalledWith('File too large. Max 5MB')
  })

  it('allows file input interaction', () => {
    render(<ReferralForm job={mockJob} onSubmitted={mockOnSubmitted} />)

    const fileInput = screen.getByLabelText('Resume / Profile (PDF, DOC, DOCX, max 5MB)').closest('input') as HTMLInputElement
    
    expect(fileInput).toBeInTheDocument()
    expect(fileInput).toHaveAttribute('type', 'file')
    expect(fileInput).toHaveAttribute('accept', '.pdf,.doc,.docx')
  })


  it('renders availability selection field', () => {
    render(<ReferralForm job={mockJob} onSubmitted={mockOnSubmitted} />)

    // Check that availability field is rendered
    expect(screen.getByLabelText('Availability')).toBeInTheDocument()
    
    // Check that it's a select element
    const availabilityField = screen.getByLabelText('Availability')
    expect(availabilityField).toHaveAttribute('role', 'combobox')
  })

})