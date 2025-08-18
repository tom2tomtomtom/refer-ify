import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'
import { ReferralForm } from '@/components/referrals/ReferralForm'
import { toast } from 'sonner'

const mockJob = {
  id: '1',
  title: 'Software Engineer',
  description: 'Build amazing applications',
  salary_min: 80000,
  salary_max: 120000,
  currency: 'USD',
  requirements: {},
}

global.fetch = jest.fn()
jest.mock('sonner', () => ({
  toast: {
    error: jest.fn(),
    success: jest.fn(),
  },
}))

describe('ReferralForm', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(global.fetch as jest.Mock).mockClear()
  })

  it('renders form fields correctly', () => {
    render(<ReferralForm job={mockJob} />)

    expect(screen.getByLabelText('Professional Name *')).toBeInTheDocument()
    expect(screen.getByLabelText('Professional Email *')).toBeInTheDocument()
    expect(screen.getByLabelText('Phone')).toBeInTheDocument()
    expect(screen.getByLabelText('LinkedIn Profile')).toBeInTheDocument()
    expect(screen.getByLabelText('Expected Salary')).toBeInTheDocument()
    expect(screen.getByLabelText('Availability')).toBeInTheDocument()
    expect(screen.getByLabelText('Why is this professional a strong fit?')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Submit Referral' })).toBeInTheDocument()
  })

  it('displays job information when job is provided', () => {
    render(<ReferralForm job={mockJob} />)

    expect(screen.getByText('Software Engineer')).toBeInTheDocument()
    expect(screen.getByText('Build amazing applications')).toBeInTheDocument()
  })

  it('updates form fields when user types', async () => {
    const user = userEvent.setup()
    render(<ReferralForm job={mockJob} />)

    const nameInput = screen.getByLabelText('Professional Name *')
    await user.type(nameInput, 'John Doe')

    expect(nameInput).toHaveValue('John Doe')
  })

  it('shows error when submitting without consent', async () => {
    const user = userEvent.setup()
    render(<ReferralForm job={mockJob} />)

    const submitButton = screen.getByRole('button', { name: 'Submit Referral' })
    await user.click(submitButton)

    expect(toast.error).toHaveBeenCalledWith('You must provide GDPR consent')
  })

  it('handles file upload validation for invalid file types', async () => {
    const user = userEvent.setup()
    render(<ReferralForm job={mockJob} />)

    const fileInput = screen.getByRole('textbox', { hidden: true })
    const invalidFile = new File(['content'], 'resume.txt', { type: 'text/plain' })

    await user.upload(fileInput, invalidFile)

    expect(toast.error).toHaveBeenCalledWith('Invalid file type. Upload PDF, DOC or DOCX')
  })

  it('handles file upload validation for oversized files', async () => {
    const user = userEvent.setup()
    render(<ReferralForm job={mockJob} />)

    const fileInput = screen.getByRole('textbox', { hidden: true })
    const largeFile = new File(['x'.repeat(11 * 1024 * 1024)], 'resume.pdf', { type: 'application/pdf' })

    await user.upload(fileInput, largeFile)

    expect(toast.error).toHaveBeenCalledWith('File too large. Max 10MB')
  })

  it('successfully uploads a valid file', async () => {
    const user = userEvent.setup()
    ;(global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          signedUrl: 'https://example.com/upload',
          token: 'token123',
          path: '/resumes/resume.pdf',
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
      })

    render(<ReferralForm job={mockJob} />)

    const fileInput = screen.getByRole('textbox', { hidden: true })
    const validFile = new File(['content'], 'resume.pdf', { type: 'application/pdf' })

    await user.upload(fileInput, validFile)

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith('Resume uploaded')
    })

    expect(screen.getByText('resume.pdf')).toBeInTheDocument()
  })

  it('handles file upload error', async () => {
    const user = userEvent.setup()
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 'Upload failed' }),
    })

    render(<ReferralForm job={mockJob} />)

    const fileInput = screen.getByRole('textbox', { hidden: true })
    const validFile = new File(['content'], 'resume.pdf', { type: 'application/pdf' })

    await user.upload(fileInput, validFile)

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Upload failed')
    })
  })

  it('submits form successfully with valid data', async () => {
    const user = userEvent.setup()
    const mockOnSubmitted = jest.fn()

    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        referral: { id: 'ref123' },
      }),
    })

    render(<ReferralForm job={mockJob} onSubmitted={mockOnSubmitted} />)

    // Fill form
    await user.type(screen.getByLabelText('Professional Name *'), 'John Doe')
    await user.type(screen.getByLabelText('Professional Email *'), 'john@example.com')
    await user.type(screen.getByLabelText('Phone'), '+1234567890')
    await user.type(screen.getByLabelText('Expected Salary'), '90000')
    await user.type(screen.getByLabelText('Why is this professional a strong fit?'), 'Great experience')

    // Check consent
    const consentCheckbox = screen.getByRole('checkbox')
    await user.click(consentCheckbox)

    // Submit
    const submitButton = screen.getByRole('button', { name: 'Submit Referral' })
    await user.click(submitButton)

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/referrals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          job_id: '1',
          candidate_name: 'John Doe',
          candidate_email: 'john@example.com',
          candidate_phone: '+1234567890',
          candidate_linkedin: '',
          referrer_notes: 'Great experience',
          expected_salary: 90000,
          availability: 'immediately',
          consent_given: true,
          resume_storage_path: null,
        }),
      })
    })

    expect(toast.success).toHaveBeenCalledWith('Referral submitted! Tracking ID issued.')
    expect(mockOnSubmitted).toHaveBeenCalledWith('ref123')
  })

  it('handles form submission error', async () => {
    const user = userEvent.setup()

    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 'Submission failed' }),
    })

    render(<ReferralForm job={mockJob} />)

    // Check consent and submit
    const consentCheckbox = screen.getByRole('checkbox')
    await user.click(consentCheckbox)

    const submitButton = screen.getByRole('button', { name: 'Submit Referral' })
    await user.click(submitButton)

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Submission failed')
    })
  })

  it('updates availability selection', async () => {
    const user = userEvent.setup()
    render(<ReferralForm job={mockJob} />)

    const availabilitySelect = screen.getByRole('combobox')
    await user.click(availabilitySelect)

    const twoWeeksOption = screen.getByRole('option', { name: '2 weeks' })
    await user.click(twoWeeksOption)

    expect(screen.getByDisplayValue('2 weeks')).toBeInTheDocument()
  })

  it('renders without job information', () => {
    render(<ReferralForm job={null} />)

    expect(screen.getByRole('button', { name: 'Submit Referral' })).toBeInTheDocument()
    expect(screen.queryByText('Software Engineer')).not.toBeInTheDocument()
  })

  it('disables submit button while uploading', async () => {
    const user = userEvent.setup()
    
    // Mock a slow upload to keep uploading state
    ;(global.fetch as jest.Mock).mockImplementationOnce(
      () => new Promise((resolve) => setTimeout(() => resolve({
        ok: true,
        json: async () => ({
          signedUrl: 'https://example.com/upload',
          token: 'token123',
          path: '/resumes/resume.pdf',
        }),
      }), 100))
    )

    render(<ReferralForm job={mockJob} />)

    const fileInput = screen.getByRole('textbox', { hidden: true })
    const validFile = new File(['content'], 'resume.pdf', { type: 'application/pdf' })

    await user.upload(fileInput, validFile)

    const submitButton = screen.getByRole('button', { name: 'Submit Referral' })
    expect(submitButton).toBeDisabled()
  })
})