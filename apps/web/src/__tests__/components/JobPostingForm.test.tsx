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
    expect(screen.getByLabelText('Company *')).toBeInTheDocument()
    expect(screen.getByLabelText('Job Description *')).toBeInTheDocument()
    expect(screen.getByLabelText('Location Type *')).toBeInTheDocument()
    expect(screen.getByLabelText('Experience Level *')).toBeInTheDocument()
    expect(screen.getByLabelText('Job Type *')).toBeInTheDocument()
    expect(screen.getByLabelText('Subscription Tier *')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Post Job' })).toBeInTheDocument()
  })

  it('shows validation errors for empty required fields', async () => {
    render(<JobPostingForm />)
    
    const postButton = screen.getByRole('button', { name: 'Post Job' })
    fireEvent.click(postButton)

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Please fill in all required fields')
    })
  })

  it('updates form state when typing in fields', () => {
    render(<JobPostingForm />)
    
    const titleInput = screen.getByLabelText('Job Title *')
    const companyInput = screen.getByLabelText('Company *')
    
    fireEvent.change(titleInput, { target: { value: 'Senior Developer' } })
    fireEvent.change(companyInput, { target: { value: 'Tech Corp' } })
    
    expect(titleInput).toHaveValue('Senior Developer')
    expect(companyInput).toHaveValue('Tech Corp')
  })

  it('validates salary range correctly', async () => {
    render(<JobPostingForm />)
    
    // Fill in required fields
    fireEvent.change(screen.getByLabelText('Job Title *'), { 
      target: { value: 'Senior Developer' } 
    })
    fireEvent.change(screen.getByLabelText('Company *'), { 
      target: { value: 'Tech Corp' } 
    })
    fireEvent.change(screen.getByRole('textbox', { name: /job description/i }), { 
      target: { value: 'Great job opportunity' } 
    })
    
    // Set invalid salary range (max < min)
    fireEvent.change(screen.getByLabelText('Minimum Salary'), { 
      target: { value: '100000' } 
    })
    fireEvent.change(screen.getByLabelText('Maximum Salary'), { 
      target: { value: '80000' } 
    })
    
    const postButton = screen.getByRole('button', { name: 'Post Job' })
    fireEvent.click(postButton)

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Maximum salary must be greater than minimum salary')
    })
  })

  it('submits form successfully with valid data', async () => {
    ;(fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        job: {
          id: '123',
          title: 'Senior Developer',
          company: 'Tech Corp',
        },
      }),
    })

    render(<JobPostingForm />)
    
    // Fill in all required fields
    fireEvent.change(screen.getByLabelText('Job Title *'), { 
      target: { value: 'Senior Developer' } 
    })
    fireEvent.change(screen.getByLabelText('Company *'), { 
      target: { value: 'Tech Corp' } 
    })
    fireEvent.change(screen.getByRole('textbox', { name: /job description/i }), { 
      target: { value: 'Great job opportunity for a senior developer' } 
    })
    
    const postButton = screen.getByRole('button', { name: 'Post Job' })
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
    fireEvent.change(screen.getByLabelText('Company *'), { 
      target: { value: 'Tech Corp' } 
    })
    fireEvent.change(screen.getByRole('textbox', { name: /job description/i }), { 
      target: { value: 'Great job opportunity' } 
    })
    
    const postButton = screen.getByRole('button', { name: 'Post Job' })
    fireEvent.click(postButton)

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Failed to create job')
    })
  })

  it('handles network errors', async () => {
    ;(fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'))

    render(<JobPostingForm />)
    
    // Fill in required fields
    fireEvent.change(screen.getByLabelText('Job Title *'), { 
      target: { value: 'Senior Developer' } 
    })
    fireEvent.change(screen.getByLabelText('Company *'), { 
      target: { value: 'Tech Corp' } 
    })
    fireEvent.change(screen.getByRole('textbox', { name: /job description/i }), { 
      target: { value: 'Great job opportunity' } 
    })
    
    const postButton = screen.getByRole('button', { name: 'Post Job' })
    fireEvent.click(postButton)

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Network error')
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
    fireEvent.change(screen.getByLabelText('Company *'), { 
      target: { value: 'Tech Corp' } 
    })
    fireEvent.change(screen.getByRole('textbox', { name: /job description/i }), { 
      target: { value: 'Great job opportunity' } 
    })
    
    const postButton = screen.getByRole('button', { name: 'Post Job' })
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

  it('updates skills list correctly', () => {
    render(<JobPostingForm />)
    
    // Add a skill
    const skillInput = screen.getByLabelText('Add Skill')
    fireEvent.change(skillInput, { target: { value: 'React' } })
    fireEvent.keyPress(skillInput, { key: 'Enter', code: 'Enter', charCode: 13 })
    
    expect(screen.getByText('React')).toBeInTheDocument()
  })

  it('removes skills correctly', () => {
    render(<JobPostingForm />)
    
    // Add a skill first
    const skillInput = screen.getByLabelText('Add Skill')
    fireEvent.change(skillInput, { target: { value: 'React' } })
    fireEvent.keyPress(skillInput, { key: 'Enter', code: 'Enter', charCode: 13 })
    
    expect(screen.getByText('React')).toBeInTheDocument()
    
    // Remove the skill
    const removeButton = screen.getByLabelText('Remove React')
    fireEvent.click(removeButton)
    
    expect(screen.queryByText('React')).not.toBeInTheDocument()
  })

  it('defaults to draft status', () => {
    render(<JobPostingForm />)
    
    // The form should default to draft status
    const draftRadio = screen.getByLabelText('Draft')
    expect(draftRadio).toBeChecked()
  })

  it('allows switching between draft and published status', () => {
    render(<JobPostingForm />)
    
    const publishedRadio = screen.getByLabelText('Published')
    fireEvent.click(publishedRadio)
    
    expect(publishedRadio).toBeChecked()
    expect(screen.getByLabelText('Draft')).not.toBeChecked()
  })
})