import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'
import { ReferralForm } from '@/components/referrals/ReferralForm'
import { createTestSupabaseClient, createTestUser, createTestJob, cleanupTestData } from '../setup/test-db'

const mockJob = {
  id: '1',
  title: 'Senior Software Engineer',
  description: 'Build scalable applications with React and TypeScript',
  salary_min: 100000,
  salary_max: 150000,
  currency: 'USD',
  requirements: {},
}

// Mock file upload APIs
global.fetch = jest.fn()

jest.mock('sonner', () => ({
  toast: {
    error: jest.fn(),
    success: jest.fn(),
  },
}))

describe('Referral Flow Integration Tests', () => {
  let testClient: ReturnType<typeof createTestSupabaseClient>

  beforeAll(async () => {
    testClient = createTestSupabaseClient()
  })

  beforeEach(() => {
    jest.clearAllMocks()
  })

  afterEach(async () => {
    await cleanupTestData(testClient)
  })

  it('completes full referral submission flow', async () => {
    const user = userEvent.setup()

    // Mock successful file upload
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
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          referral: { id: 'ref123' },
        }),
      })

    const mockOnSubmitted = jest.fn()
    render(<ReferralForm job={mockJob} onSubmitted={mockOnSubmitted} />)

    // Fill out the form
    await user.type(screen.getByLabelText('Professional Name *'), 'John Doe')
    await user.type(screen.getByLabelText('Professional Email *'), 'john@example.com')
    await user.type(screen.getByLabelText('Phone'), '+1234567890')
    await user.type(screen.getByLabelText('LinkedIn Profile'), 'https://linkedin.com/in/johndoe')
    
    // Upload resume
    const fileInput = screen.getByRole('textbox', { hidden: true })
    const resumeFile = new File(['resume content'], 'resume.pdf', { type: 'application/pdf' })
    await user.upload(fileInput, resumeFile)

    // Wait for file upload to complete
    await waitFor(() => {
      expect(screen.getByText('resume.pdf')).toBeInTheDocument()
    })

    // Fill remaining fields
    await user.type(screen.getByLabelText('Expected Salary'), '120000')
    
    // Select availability
    const availabilitySelect = screen.getByRole('combobox')
    await user.click(availabilitySelect)
    await user.click(screen.getByRole('option', { name: '2 weeks' }))

    // Fill referrer notes
    await user.type(
      screen.getByLabelText('Why is this professional a strong fit?'),
      'Excellent candidate with 5+ years experience in React and TypeScript. Has led multiple successful projects.'
    )

    // Give consent
    const consentCheckbox = screen.getByRole('checkbox')
    await user.click(consentCheckbox)

    // Submit the form
    const submitButton = screen.getByRole('button', { name: 'Submit Referral' })
    await user.click(submitButton)

    // Verify API calls were made in correct order
    expect(global.fetch).toHaveBeenCalledTimes(3)
    
    // File upload initialization
    expect(global.fetch).toHaveBeenNthCalledWith(1, '/api/storage/resumes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fileName: 'resume.pdf' }),
    })

    // File upload to signed URL
    expect(global.fetch).toHaveBeenNthCalledWith(2, 'https://example.com/upload', {
      method: 'PUT',
      headers: { authorization: 'Bearer token123', 'x-upsert': 'true' },
      body: resumeFile,
    })

    // Referral submission
    expect(global.fetch).toHaveBeenNthCalledWith(3, '/api/referrals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        job_id: '1',
        candidate_name: 'John Doe',
        candidate_email: 'john@example.com',
        candidate_phone: '+1234567890',
        candidate_linkedin: 'https://linkedin.com/in/johndoe',
        referrer_notes: 'Excellent candidate with 5+ years experience in React and TypeScript. Has led multiple successful projects.',
        expected_salary: 120000,
        availability: '2_weeks',
        consent_given: true,
        resume_storage_path: '/resumes/resume.pdf',
      }),
    })

    // Verify success callback was called
    await waitFor(() => {
      expect(mockOnSubmitted).toHaveBeenCalledWith('ref123')
    })
  })

  it('handles file upload failure gracefully', async () => {
    const user = userEvent.setup()

    // Mock file upload failure
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 'Upload failed' }),
    })

    render(<ReferralForm job={mockJob} />)

    // Try to upload a file
    const fileInput = screen.getByRole('textbox', { hidden: true })
    const resumeFile = new File(['resume content'], 'resume.pdf', { type: 'application/pdf' })
    await user.upload(fileInput, resumeFile)

    // Should show error and not proceed
    await waitFor(() => {
      expect(screen.getByText('No file selected')).toBeInTheDocument()
    })
  })

  it('validates required fields before submission', async () => {
    const user = userEvent.setup()
    render(<ReferralForm job={mockJob} />)

    // Try to submit without required fields
    const submitButton = screen.getByRole('button', { name: 'Submit Referral' })
    await user.click(submitButton)

    // Should not make any API calls
    expect(global.fetch).not.toHaveBeenCalled()
  })

  it('handles form submission with minimal data', async () => {
    const user = userEvent.setup()

    // Mock successful referral submission
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        referral: { id: 'ref123' },
      }),
    })

    render(<ReferralForm job={mockJob} />)

    // Fill only required fields
    await user.type(screen.getByLabelText('Professional Name *'), 'Jane Smith')
    await user.type(screen.getByLabelText('Professional Email *'), 'jane@example.com')

    // Give consent
    const consentCheckbox = screen.getByRole('checkbox')
    await user.click(consentCheckbox)

    // Submit the form
    const submitButton = screen.getByRole('button', { name: 'Submit Referral' })
    await user.click(submitButton)

    // Verify referral submission with minimal data
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/referrals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          job_id: '1',
          candidate_name: 'Jane Smith',
          candidate_email: 'jane@example.com',
          candidate_phone: '',
          candidate_linkedin: '',
          referrer_notes: '',
          expected_salary: null,
          availability: 'immediately',
          consent_given: true,
          resume_storage_path: null,
        }),
      })
    })
  })

  it('displays job information correctly', () => {
    render(<ReferralForm job={mockJob} />)

    expect(screen.getByText('Senior Software Engineer')).toBeInTheDocument()
    expect(screen.getByText('Build scalable applications with React and TypeScript')).toBeInTheDocument()
  })

  it('handles missing job information', () => {
    render(<ReferralForm job={null} />)

    // Should still render the form
    expect(screen.getByLabelText('Professional Name *')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Submit Referral' })).toBeInTheDocument()
    
    // Should not show job information section
    expect(screen.queryByText('Senior Software Engineer')).not.toBeInTheDocument()
  })

  it('validates file types correctly', async () => {
    const user = userEvent.setup()
    const { toast } = require('sonner')

    render(<ReferralForm job={mockJob} />)

    // Try to upload invalid file type
    const fileInput = screen.getByRole('textbox', { hidden: true })
    const invalidFile = new File(['content'], 'resume.txt', { type: 'text/plain' })
    await user.upload(fileInput, invalidFile)

    expect(toast.error).toHaveBeenCalledWith('Invalid file type. Upload PDF, DOC or DOCX')
    expect(global.fetch).not.toHaveBeenCalled()
  })

  it('validates file size correctly', async () => {
    const user = userEvent.setup()
    const { toast } = require('sonner')

    render(<ReferralForm job={mockJob} />)

    // Try to upload oversized file (11MB)
    const largeFile = new File(['x'.repeat(11 * 1024 * 1024)], 'resume.pdf', { type: 'application/pdf' })
    const fileInput = screen.getByRole('textbox', { hidden: true })
    await user.upload(fileInput, largeFile)

    expect(toast.error).toHaveBeenCalledWith('File too large. Max 10MB')
    expect(global.fetch).not.toHaveBeenCalled()
  })
})