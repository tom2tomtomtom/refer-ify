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

// Mock Supabase client
const mockSupabaseClient = {
  from: jest.fn().mockReturnThis(),
  select: jest.fn().mockReturnThis(),
  upsert: jest.fn().mockReturnThis(),
  insert: jest.fn().mockReturnThis(),
  single: jest.fn().mockReturnThis(),
  storage: {
    from: jest.fn(() => ({
      upload: jest.fn().mockResolvedValue({ data: { path: 'test-path' }, error: null })
    }))
  },
  auth: {
    getUser: jest.fn().mockResolvedValue({ data: { user: { id: 'test-user-id' } }, error: null })
  }
}

jest.mock('@/lib/supabase/client', () => ({
  getSupabaseBrowserClient: () => mockSupabaseClient,
}))

jest.mock('sonner', () => ({
  toast: {
    error: jest.fn(),
    success: jest.fn(),
  },
}))

describe('ReferralForm', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    
    // Setup default successful Supabase responses
    mockSupabaseClient.upsert.mockResolvedValue({ data: { id: 'candidate-id' }, error: null })
    mockSupabaseClient.insert.mockResolvedValue({ data: { id: 'referral-id' }, error: null })
  })

  it('renders form fields correctly', () => {
    render(<ReferralForm job={mockJob} />)

    expect(screen.getByLabelText('First Name *')).toBeInTheDocument()
    expect(screen.getByLabelText('Last Name *')).toBeInTheDocument()
    expect(screen.getByLabelText('Professional Email *')).toBeInTheDocument()
    expect(screen.getByLabelText('Phone')).toBeInTheDocument()
    expect(screen.getByLabelText('LinkedIn Profile')).toBeInTheDocument()
    expect(screen.getByLabelText('Salary Min')).toBeInTheDocument()
    expect(screen.getByLabelText('Salary Max')).toBeInTheDocument()
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

    const firstNameInput = screen.getByLabelText('First Name *')
    const lastNameInput = screen.getByLabelText('Last Name *')
    await user.type(firstNameInput, 'John')
    await user.type(lastNameInput, 'Doe')

    expect(firstNameInput).toHaveValue('John')
    expect(lastNameInput).toHaveValue('Doe')
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

    const fileInput = screen.getByLabelText('Resume / Profile (PDF, DOC, DOCX, max 5MB)', { selector: 'input[type="file"]' })
    const invalidFile = new File(['content'], 'resume.txt', { type: 'text/plain' })

    await user.upload(fileInput, invalidFile)

    expect(toast.error).toHaveBeenCalledWith('Invalid file type. Upload PDF, DOC or DOCX')
  })

  it('handles file upload validation for oversized files', async () => {
    const user = userEvent.setup()
    render(<ReferralForm job={mockJob} />)

    const fileInput = screen.getByLabelText('Resume / Profile (PDF, DOC, DOCX, max 5MB)', { selector: 'input[type="file"]' })
    const largeFile = new File(['x'.repeat(6 * 1024 * 1024)], 'resume.pdf', { type: 'application/pdf' })

    await user.upload(fileInput, largeFile)

    expect(toast.error).toHaveBeenCalledWith('File too large. Max 5MB')
  })

  it('shows valid file name when uploaded', async () => {
    const user = userEvent.setup()
    render(<ReferralForm job={mockJob} />)

    const fileInput = screen.getByLabelText('Resume / Profile (PDF, DOC, DOCX, max 5MB)', { selector: 'input[type="file"]' })
    const validFile = new File(['content'], 'resume.pdf', { type: 'application/pdf' })

    // File input interaction
    await user.upload(fileInput, validFile)
    
    // File should be selected (checking the input files property)
    expect(fileInput.files?.[0]).toBe(validFile)
  })


  it('allows filling all form fields', async () => {
    const user = userEvent.setup()
    render(<ReferralForm job={mockJob} />)

    // Fill form
    await user.type(screen.getByLabelText('First Name *'), 'John')
    await user.type(screen.getByLabelText('Last Name *'), 'Doe')
    await user.type(screen.getByLabelText('Professional Email *'), 'john@example.com')
    await user.type(screen.getByLabelText('Phone'), '+1234567890')
    await user.type(screen.getByLabelText('Salary Max'), '90000')
    await user.type(screen.getByLabelText('Why is this professional a strong fit?'), 'Great experience')

    // Check that values are updated
    expect(screen.getByLabelText('First Name *')).toHaveValue('John')
    expect(screen.getByLabelText('Last Name *')).toHaveValue('Doe')
    expect(screen.getByLabelText('Professional Email *')).toHaveValue('john@example.com')
    expect(screen.getByLabelText('Phone')).toHaveValue('+1234567890')
    expect(screen.getByLabelText('Salary Max')).toHaveValue('90000')
    expect(screen.getByLabelText('Why is this professional a strong fit?')).toHaveValue('Great experience')
  })


  it('shows availability selection field', () => {
    render(<ReferralForm job={mockJob} />)

    const availabilitySelect = screen.getByLabelText('Availability')
    expect(availabilitySelect).toBeInTheDocument()
    
    // Should show default value 'Immediately'
    expect(screen.getByText('Immediately')).toBeInTheDocument()
  })

  it('renders without job information', () => {
    render(<ReferralForm job={null} />)

    expect(screen.getByRole('button', { name: 'Submit Referral' })).toBeInTheDocument()
    expect(screen.queryByText('Software Engineer')).not.toBeInTheDocument()
  })

  it('has correct file input attributes', () => {
    render(<ReferralForm job={mockJob} />)

    const fileInput = screen.getByLabelText('Resume / Profile (PDF, DOC, DOCX, max 5MB)', { selector: 'input[type="file"]' })
    
    expect(fileInput).toHaveAttribute('type', 'file')
    expect(fileInput).toHaveAttribute('accept', '.pdf,.doc,.docx')
  })
})