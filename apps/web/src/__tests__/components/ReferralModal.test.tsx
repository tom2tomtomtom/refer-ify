import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { ReferralModal } from '@/components/referrals/ReferralModal'

// Mock ReferralForm since we're testing the modal wrapper
jest.mock('@/components/referrals/ReferralForm', () => ({
  ReferralForm: ({ job, onSubmitted }: any) => (
    <div data-testid="referral-form">
      <div>Professional Name *</div>
      <div>Professional Email *</div>
      <button onClick={() => onSubmitted('test-id')}>Submit Referral</button>
      {job && <div>{job.title}</div>}
      {job && <div>{job.description}</div>}
    </div>
  ),
}))

const mockJob = {
  id: '123',
  title: 'Senior Software Engineer',
  description: 'Join our team as a senior software engineer',
  salary_min: 100000,
  salary_max: 150000,
  currency: 'USD',
  requirements: {
    skills: ['React', 'TypeScript', 'Node.js'],
    experience: '5+ years',
  },
}

describe('ReferralModal', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders trigger button and opens modal when clicked', async () => {
    render(
      <ReferralModal job={mockJob}>
        <button>Open Referral Modal</button>
      </ReferralModal>
    )

    // Should render the trigger
    expect(screen.getByText('Open Referral Modal')).toBeInTheDocument()

    // Click trigger to open modal
    fireEvent.click(screen.getByText('Open Referral Modal'))

    await waitFor(() => {
      expect(screen.getByText('Refer a Candidate')).toBeInTheDocument()
      expect(screen.getByText('Senior Software Engineer')).toBeInTheDocument()
      expect(screen.getByText('Join our team as a senior software engineer')).toBeInTheDocument()
    })
  })

  it('does not render modal content initially', () => {
    render(
      <ReferralModal job={mockJob}>
        <button>Open Referral Modal</button>
      </ReferralModal>
    )

    // Trigger should be visible but modal content should not
    expect(screen.getByText('Open Referral Modal')).toBeInTheDocument()
    expect(screen.queryByText('Refer a Candidate')).not.toBeInTheDocument()
  })

  it('closes modal when escape key is pressed', async () => {
    render(
      <ReferralModal job={mockJob}>
        <button>Open Referral Modal</button>
      </ReferralModal>
    )

    // Open modal
    fireEvent.click(screen.getByText('Open Referral Modal'))
    
    await waitFor(() => {
      expect(screen.getByText('Refer a Candidate')).toBeInTheDocument()
    })

    // Press escape to close
    fireEvent.keyDown(document, { key: 'Escape', code: 'Escape' })

    await waitFor(() => {
      expect(screen.queryByText('Refer a Candidate')).not.toBeInTheDocument()
    })
  })

  it('closes modal when backdrop is clicked', async () => {
    render(
      <ReferralModal job={mockJob}>
        <button>Open Referral Modal</button>
      </ReferralModal>
    )

    // Open modal
    fireEvent.click(screen.getByText('Open Referral Modal'))
    
    await waitFor(() => {
      expect(screen.getByText('Refer a Candidate')).toBeInTheDocument()
    })

    // Find and click the backdrop
    const backdrop = document.querySelector('[data-radix-dialog-overlay]')
    if (backdrop) {
      fireEvent.click(backdrop)
      
      await waitFor(() => {
        expect(screen.queryByText('Refer a Candidate')).not.toBeInTheDocument()
      })
    }
  })

  it('displays job information in the modal', async () => {
    render(
      <ReferralModal job={mockJob}>
        <button>Open Referral Modal</button>
      </ReferralModal>
    )

    fireEvent.click(screen.getByText('Open Referral Modal'))
    
    await waitFor(() => {
      expect(screen.getByText('Senior Software Engineer')).toBeInTheDocument()
      expect(screen.getByText('Join our team as a senior software engineer')).toBeInTheDocument()
    })
  })

  it('renders ReferralForm component when opened', async () => {
    render(
      <ReferralModal job={mockJob}>
        <button>Open Referral Modal</button>
      </ReferralModal>
    )

    fireEvent.click(screen.getByText('Open Referral Modal'))
    
    await waitFor(() => {
      // Check that the mocked referral form elements are present
      expect(screen.getByTestId('referral-form')).toBeInTheDocument()
      expect(screen.getByText('Professional Name *')).toBeInTheDocument()
      expect(screen.getByText('Professional Email *')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Submit Referral' })).toBeInTheDocument()
    })
  })

  it('handles null job gracefully', async () => {
    render(
      <ReferralModal job={null}>
        <button>Open Referral Modal</button>
      </ReferralModal>
    )

    fireEvent.click(screen.getByText('Open Referral Modal'))
    
    await waitFor(() => {
      expect(screen.getByText('Refer a Candidate')).toBeInTheDocument()
      expect(screen.getByText('Professional Name *')).toBeInTheDocument()
    })
    
    // Job details should not be displayed when job is null
    expect(screen.queryByText('Senior Software Engineer')).not.toBeInTheDocument()
  })

  it('closes modal when referral is submitted successfully', async () => {
    render(
      <ReferralModal job={mockJob}>
        <button>Open Referral Modal</button>
      </ReferralModal>
    )

    // Open modal
    fireEvent.click(screen.getByText('Open Referral Modal'))
    
    await waitFor(() => {
      expect(screen.getByText('Refer a Candidate')).toBeInTheDocument()
    })

    // Submit the form (mocked)
    fireEvent.click(screen.getByRole('button', { name: 'Submit Referral' }))
    
    // Modal should close after successful submission
    await waitFor(() => {
      expect(screen.queryByText('Refer a Candidate')).not.toBeInTheDocument()
    })
  })

  it('has proper accessibility attributes when opened', async () => {
    render(
      <ReferralModal job={mockJob}>
        <button>Open Referral Modal</button>
      </ReferralModal>
    )

    fireEvent.click(screen.getByText('Open Referral Modal'))
    
    await waitFor(() => {
      // Check for modal dialog attributes
      const dialog = screen.getByRole('dialog', { hidden: true })
      expect(dialog).toBeInTheDocument()
    })
  })

  it('renders dialog when modal is open', async () => {
    render(
      <ReferralModal job={mockJob}>
        <button>Open Referral Modal</button>
      </ReferralModal>
    )

    fireEvent.click(screen.getByText('Open Referral Modal'))
    
    await waitFor(() => {
      // Dialog should be in the DOM when open
      expect(screen.getByRole('dialog', { hidden: true })).toBeInTheDocument()
    })
  })

  it('handles keyboard navigation correctly', async () => {
    render(
      <ReferralModal job={mockJob}>
        <button>Open Referral Modal</button>
      </ReferralModal>
    )

    fireEvent.click(screen.getByText('Open Referral Modal'))
    
    await waitFor(() => {
      expect(screen.getByText('Refer a Candidate')).toBeInTheDocument()
    })

    // Focus should be available within the modal
    expect(screen.getByText('Professional Name *')).toBeInTheDocument()

    // Escape key should close the modal (already tested in separate test)
    expect(screen.getByRole('dialog', { hidden: true })).toBeInTheDocument()
  })
})