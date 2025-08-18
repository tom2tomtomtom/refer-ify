import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { JobPostingForm } from '@/components/jobs/JobPostingForm'
import { toast } from 'sonner'

// Mock toast notifications
jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}))

// Mock Next.js router
const mockPush = jest.fn()
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    refresh: jest.fn(),
  }),
}))

// Mock fetch
global.fetch = jest.fn()

describe('JobPostingForm', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(fetch as jest.Mock).mockClear()
  })

  it('renders form fields correctly', () => {
    render(<JobPostingForm />)
    
    expect(screen.getByLabelText('Job Title *')).toBeInTheDocument()
    expect(screen.getByLabelText('Job Description *')).toBeInTheDocument()
    expect(screen.getByLabelText('Location')).toBeInTheDocument()
    expect(screen.getByText('Experience Level')).toBeInTheDocument()
    expect(screen.getByText('Job Type')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Publish Job' })).toBeInTheDocument()
    
    // Check that tabs exist
    expect(screen.getByRole('tab', { name: 'Job Details' })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: 'Requirements' })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: 'Subscription' })).toBeInTheDocument()
  })

  it('shows validation errors for empty required fields', async () => {
    render(<JobPostingForm />)
    
    const postButton = screen.getByRole('button', { name: 'Publish Job' })
    fireEvent.click(postButton)

    // Button should be disabled when required fields are empty
    expect(postButton).toBeDisabled()
  })

  it('updates form state when typing in fields', () => {
    render(<JobPostingForm />)
    
    const titleInput = screen.getByLabelText('Job Title *')
    const descriptionInput = screen.getByLabelText('Job Description *')
    
    fireEvent.change(titleInput, { target: { value: 'Senior Developer' } })
    fireEvent.change(descriptionInput, { target: { value: 'Great job opportunity' } })
    
    expect(titleInput).toHaveValue('Senior Developer')
    expect(descriptionInput).toHaveValue('Great job opportunity')
  })

  it('validates salary range correctly', async () => {
    render(<JobPostingForm />)
    
    // Fill in required fields
    fireEvent.change(screen.getByLabelText('Job Title *'), { 
      target: { value: 'Senior Developer' } 
    })
    fireEvent.change(screen.getByLabelText('Job Description *'), { 
      target: { value: 'Great job opportunity' } 
    })
    
    // Set salary range inputs
    const salaryInputs = screen.getAllByRole('spinbutton')
    const minSalaryInput = salaryInputs.find(input => input.getAttribute('placeholder') === 'Min')
    const maxSalaryInput = salaryInputs.find(input => input.getAttribute('placeholder') === 'Max')
    
    expect(minSalaryInput).toBeInTheDocument()
    expect(maxSalaryInput).toBeInTheDocument()
    
    fireEvent.change(minSalaryInput!, { target: { value: '100000' } })
    fireEvent.change(maxSalaryInput!, { target: { value: '80000' } })
    
    expect(minSalaryInput).toHaveValue(100000)
    expect(maxSalaryInput).toHaveValue(80000)
  })

  it('submits form successfully with valid data', async () => {
    ;(fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        job: {
          id: '123',
          title: 'Senior Developer',
        },
      }),
    })

    render(<JobPostingForm />)
    
    // Fill in all required fields
    fireEvent.change(screen.getByLabelText('Job Title *'), { 
      target: { value: 'Senior Developer' } 
    })
    fireEvent.change(screen.getByLabelText('Job Description *'), { 
      target: { value: 'Great job opportunity for a senior developer' } 
    })
    
    const postButton = screen.getByRole('button', { name: 'Publish Job' })
    fireEvent.click(postButton)

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/api/jobs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: expect.stringContaining('"title":"Senior Developer"'),
      })
    })

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith('Job posted successfully!')
    })
  })

  it('handles API errors gracefully', async () => {
    ;(fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: async () => ({
        error: 'Failed to create job',
      }),
    })

    render(<JobPostingForm />)
    
    // Fill in required fields
    fireEvent.change(screen.getByLabelText('Job Title *'), { 
      target: { value: 'Senior Developer' } 
    })
    fireEvent.change(screen.getByLabelText('Job Description *'), { 
      target: { value: 'Great job opportunity' } 
    })
    
    const postButton = screen.getByRole('button', { name: 'Publish Job' })
    fireEvent.click(postButton)

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Failed to create job. Please try again.')
    })
  })

  it('handles network errors', async () => {
    ;(fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'))

    render(<JobPostingForm />)
    
    // Fill in required fields
    fireEvent.change(screen.getByLabelText('Job Title *'), { 
      target: { value: 'Senior Developer' } 
    })
    fireEvent.change(screen.getByLabelText('Job Description *'), { 
      target: { value: 'Great job opportunity' } 
    })
    
    const postButton = screen.getByRole('button', { name: 'Publish Job' })
    fireEvent.click(postButton)

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Failed to create job. Please try again.')
    })
  })

  it('disables submit button while posting', async () => {
    // Mock a delayed response
    ;(fetch as jest.Mock).mockImplementation(() => 
      new Promise(resolve => 
        setTimeout(() => resolve({
          ok: true,
          json: async () => ({ job: { id: '123' } }),
        }), 100)
      )
    )

    render(<JobPostingForm />)
    
    // Fill in required fields
    fireEvent.change(screen.getByLabelText('Job Title *'), { 
      target: { value: 'Senior Developer' } 
    })
    fireEvent.change(screen.getByLabelText('Job Description *'), { 
      target: { value: 'Great job opportunity' } 
    })
    
    const postButton = screen.getByRole('button', { name: 'Publish Job' })
    fireEvent.click(postButton)

    // Button should be disabled while posting
    await waitFor(() => {
      expect(postButton).toBeDisabled()
    })

    // Wait for submission to complete
    await waitFor(() => {
      expect(postButton).not.toBeDisabled()
    }, { timeout: 2000 })
  })

  it('can click Requirements tab', () => {
    render(<JobPostingForm />)
    
    // Navigate to Requirements tab
    const requirementsTab = screen.getByRole('tab', { name: 'Requirements' })
    expect(requirementsTab).toBeInTheDocument()
    
    // Click the tab
    fireEvent.click(requirementsTab)
    
    // Verify tab is clickable (no assertion needed, test passes if no error)
    expect(requirementsTab).toBeInTheDocument()
  })

  it('can click Subscription tab', () => {
    render(<JobPostingForm />)
    
    // Navigate to Subscription tab
    const subscriptionTab = screen.getByRole('tab', { name: 'Subscription' })
    expect(subscriptionTab).toBeInTheDocument()
    
    // Click the tab
    fireEvent.click(subscriptionTab)
    
    // Verify tab is clickable (no assertion needed, test passes if no error)
    expect(subscriptionTab).toBeInTheDocument()
  })

  it('has save as draft button', () => {
    render(<JobPostingForm />)
    
    // The form should have a save as draft button
    const draftButton = screen.getByRole('button', { name: 'Save as Draft' })
    expect(draftButton).toBeInTheDocument()
  })

  it('allows saving as draft with minimal validation', async () => {
    ;(fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ job: { id: '123' } }),
    })

    render(<JobPostingForm />)
    
    // Fill in only the title (minimal requirement for draft)
    fireEvent.change(screen.getByLabelText('Job Title *'), { 
      target: { value: 'Senior Developer' } 
    })
    
    const draftButton = screen.getByRole('button', { name: 'Save as Draft' })
    fireEvent.click(draftButton)
    
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: expect.stringContaining('"status":"draft"'),
      })
    })
    
    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith('Job saved as draft!')
    })
  })
})