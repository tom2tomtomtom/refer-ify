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
    expect(screen.getByLabelText('Professional Name *')).toBeInTheDocument()
    expect(screen.getByLabelText('Professional Email *')).toBeInTheDocument()
    expect(screen.getByLabelText('Phone')).toBeInTheDocument()
    expect(screen.getByLabelText('LinkedIn Profile')).toBeInTheDocument()
    expect(screen.getByLabelText('Expected Salary')).toBeInTheDocument()
    expect(screen.getByLabelText('Why is this professional a strong fit?')).toBeInTheDocument()
    
    // Check consent checkbox
    expect(screen.getByRole('checkbox')).toBeInTheDocument()
    expect(screen.getByText(/I have the candidate's consent/)).toBeInTheDocument()
    
    // Check submit button
    expect(screen.getByRole('button', { name: 'Submit Referral' })).toBeInTheDocument()
  })

  it('renders form without job information when job is null', () => {
    render(<ReferralForm job={null} onSubmitted={mockOnSubmitted} />)

    expect(screen.getByText('Refer a Professional')).toBeInTheDocument()
    expect(screen.queryByText('Senior Software Engineer')).not.toBeInTheDocument()
    
    // Form fields should still be present
    expect(screen.getByLabelText('Professional Name *')).toBeInTheDocument()
    expect(screen.getByLabelText('Professional Email *')).toBeInTheDocument()
  })

  it('allows filling form fields', () => {
    render(<ReferralForm job={mockJob} onSubmitted={mockOnSubmitted} />)

    const nameInput = screen.getByLabelText('Professional Name *')
    const emailInput = screen.getByLabelText('Professional Email *')
    const phoneInput = screen.getByLabelText('Phone')
    const linkedinInput = screen.getByLabelText('LinkedIn Profile')
    const salaryInput = screen.getByLabelText('Expected Salary')
    const notesTextarea = screen.getByLabelText('Why is this professional a strong fit?')

    fireEvent.change(nameInput, { target: { value: 'John Doe' } })
    fireEvent.change(emailInput, { target: { value: 'john@example.com' } })
    fireEvent.change(phoneInput, { target: { value: '+1234567890' } })
    fireEvent.change(linkedinInput, { target: { value: 'https://linkedin.com/in/johndoe' } })
    fireEvent.change(salaryInput, { target: { value: '120000' } })
    fireEvent.change(notesTextarea, { target: { value: 'Great developer with 5 years experience' } })

    expect(nameInput).toHaveValue('John Doe')
    expect(emailInput).toHaveValue('john@example.com')
    expect(phoneInput).toHaveValue('+1234567890')
    expect(linkedinInput).toHaveValue('https://linkedin.com/in/johndoe')
    expect(salaryInput).toHaveValue(120000)
    expect(notesTextarea).toHaveValue('Great developer with 5 years experience')
  })

  it('validates consent checkbox before submission', async () => {
    render(<ReferralForm job={mockJob} onSubmitted={mockOnSubmitted} />)

    // Fill required fields
    fireEvent.change(screen.getByLabelText('Professional Name *'), { target: { value: 'John Doe' } })
    fireEvent.change(screen.getByLabelText('Professional Email *'), { target: { value: 'john@example.com' } })

    // Try to submit without consent
    fireEvent.click(screen.getByRole('button', { name: 'Submit Referral' }))

    expect(toast.error).toHaveBeenCalledWith('You must provide GDPR consent')
    expect(fetch).not.toHaveBeenCalled()
  })

  it('submits form successfully with valid data', async () => {
    render(<ReferralForm job={mockJob} onSubmitted={mockOnSubmitted} />)

    // Fill form fields
    fireEvent.change(screen.getByLabelText('Professional Name *'), { target: { value: 'John Doe' } })
    fireEvent.change(screen.getByLabelText('Professional Email *'), { target: { value: 'john@example.com' } })
    fireEvent.change(screen.getByLabelText('Phone'), { target: { value: '+1234567890' } })
    fireEvent.change(screen.getByLabelText('Expected Salary'), { target: { value: '120000' } })
    fireEvent.change(screen.getByLabelText('Why is this professional a strong fit?'), { target: { value: 'Great fit' } })

    // Check consent checkbox
    fireEvent.click(screen.getByRole('checkbox'))

    // Submit form
    fireEvent.click(screen.getByRole('button', { name: 'Submit Referral' }))

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/api/referrals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          job_id: '123',
          candidate_name: 'John Doe',
          candidate_email: 'john@example.com',
          candidate_phone: '+1234567890',
          candidate_linkedin: '',
          referrer_notes: 'Great fit',
          expected_salary: 120000,
          availability: 'immediately',
          consent_given: true,
          resume_storage_path: null,
        }),
      })
    })

    expect(toast.success).toHaveBeenCalledWith('Referral submitted! Tracking ID issued.')
    expect(mockOnSubmitted).toHaveBeenCalledWith('ref-123')
  })

  it('handles submission errors', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: false,
        json: () => Promise.resolve({
          error: 'Invalid email format'
        }),
      })
    ) as jest.Mock

    render(<ReferralForm job={mockJob} onSubmitted={mockOnSubmitted} />)

    // Fill form and submit
    fireEvent.change(screen.getByLabelText('Professional Name *'), { target: { value: 'John Doe' } })
    fireEvent.change(screen.getByLabelText('Professional Email *'), { target: { value: 'john@example.com' } })
    fireEvent.click(screen.getByRole('checkbox'))
    fireEvent.click(screen.getByRole('button', { name: 'Submit Referral' }))

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Invalid email format')
    })

    expect(mockOnSubmitted).not.toHaveBeenCalled()
  })

  it('validates file upload', async () => {
    render(<ReferralForm job={mockJob} onSubmitted={mockOnSubmitted} />)

    const fileInput = screen.getByLabelText('Resume / Profile (PDF, DOC, DOCX, max 10MB)').closest('input') as HTMLInputElement

    // Test invalid file type
    const invalidFile = new File(['test'], 'test.txt', { type: 'text/plain' })
    fireEvent.change(fileInput, { target: { files: [invalidFile] } })

    expect(toast.error).toHaveBeenCalledWith('Invalid file type. Upload PDF, DOC or DOCX')

    jest.clearAllMocks()

    // Test file too large (>10MB)
    const largeFile = new File(['x'.repeat(11 * 1024 * 1024)], 'test.pdf', { type: 'application/pdf' })
    fireEvent.change(fileInput, { target: { files: [largeFile] } })

    expect(toast.error).toHaveBeenCalledWith('File too large. Max 10MB')
  })

  it('handles successful file upload', async () => {
    // Mock successful file upload responses
    global.fetch = jest.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          signedUrl: 'https://example.com/upload',
          token: 'upload-token',
          path: 'resumes/test.pdf'
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
      }) as jest.Mock

    render(<ReferralForm job={mockJob} onSubmitted={mockOnSubmitted} />)

    const fileInput = screen.getByLabelText('Resume / Profile (PDF, DOC, DOCX, max 10MB)').closest('input') as HTMLInputElement
    
    const validFile = new File(['test content'], 'test.pdf', { type: 'application/pdf' })
    fireEvent.change(fileInput, { target: { files: [validFile] } })

    await waitFor(() => {
      expect(screen.getByText('test.pdf')).toBeInTheDocument()
      expect(toast.success).toHaveBeenCalledWith('Resume uploaded')
    })

    // Verify upload API calls
    expect(fetch).toHaveBeenCalledWith('/api/storage/resumes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fileName: 'test.pdf' })
    })

    expect(fetch).toHaveBeenCalledWith('https://example.com/upload', {
      method: 'PUT',
      headers: { 
        'authorization': 'Bearer upload-token',
        'x-upsert': 'true'
      },
      body: validFile
    })
  })

  it('handles file upload errors', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: false,
        json: () => Promise.resolve({
          error: 'Upload failed'
        }),
      })
    ) as jest.Mock

    render(<ReferralForm job={mockJob} onSubmitted={mockOnSubmitted} />)

    const fileInput = screen.getByLabelText('Resume / Profile (PDF, DOC, DOCX, max 10MB)').closest('input') as HTMLInputElement
    
    const validFile = new File(['test content'], 'test.pdf', { type: 'application/pdf' })
    fireEvent.change(fileInput, { target: { files: [validFile] } })

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Upload failed')
    })
  })

  it('renders availability selection with default value', () => {
    render(<ReferralForm job={mockJob} onSubmitted={mockOnSubmitted} />)

    // Check that availability field is rendered
    expect(screen.getByLabelText('Availability')).toBeInTheDocument()
    // The select component shows "Immediately" by default
    expect(screen.getByText('Immediately')).toBeInTheDocument()
  })

  it('disables submit button during file upload', async () => {
    // Mock a slow file upload
    let resolveUpload: (value: any) => void
    const uploadPromise = new Promise(resolve => { resolveUpload = resolve })
    
    global.fetch = jest.fn(() => uploadPromise) as jest.Mock

    render(<ReferralForm job={mockJob} onSubmitted={mockOnSubmitted} />)

    const fileInput = screen.getByLabelText('Resume / Profile (PDF, DOC, DOCX, max 10MB)').closest('input') as HTMLInputElement
    const submitButton = screen.getByRole('button', { name: 'Submit Referral' })
    
    const validFile = new File(['test content'], 'test.pdf', { type: 'application/pdf' })
    fireEvent.change(fileInput, { target: { files: [validFile] } })

    // Submit button should be disabled during upload
    expect(submitButton).toBeDisabled()

    // Resolve the upload
    resolveUpload!({
      ok: false,
      json: () => Promise.resolve({ error: 'Upload failed' })
    })

    await waitFor(() => {
      // Button should be enabled again after upload completes
      expect(submitButton).not.toBeDisabled()
    })
  })
})