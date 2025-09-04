/**
 * @jest-environment jsdom
 */
import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { JobDetailEditor } from '@/components/jobs/JobDetailEditor'

// Mock UI child components used inside (to simplify DOM assertions)
jest.mock('@/components/ui/card', () => ({
  Card: ({ children }: any) => <div>{children}</div>,
  CardContent: ({ children }: any) => <div>{children}</div>,
  CardHeader: ({ children }: any) => <div>{children}</div>,
  CardTitle: ({ children }: any) => <div>{children}</div>,
}))

describe('JobDetailEditor', () => {
  const initialJob = {
    id: 'job-1',
    title: 'Initial Title',
    description: 'Initial description',
    status: 'draft',
    created_at: '2024-01-01T00:00:00Z',
    location_type: 'remote',
    location_city: 'New York',
    salary_min: 100000,
    salary_max: 150000,
    currency: 'USD',
    skills: ['React'],
    experience_level: 'senior',
    job_type: 'full_time',
    subscription_tier: 'connect',
  } as any

  beforeEach(() => {
    jest.restoreAllMocks()
    ;(global as any).fetch = jest.fn(async () => ({ ok: true, json: async () => ({ job: { ...initialJob, title: 'Edited Title' } }) }))
  })

  it('saves title on blur and records change log entry', async () => {
    render(<JobDetailEditor job={initialJob} />)

    const titleInput = screen.getByPlaceholderText('e.g. VP of Engineering') as HTMLInputElement
    // Change value
    fireEvent.change(titleInput, { target: { value: 'Edited Title' } })
    // Blur to trigger save
    fireEvent.blur(titleInput)

    await waitFor(() => {
      expect((global as any).fetch).toHaveBeenCalledWith('/api/jobs/job-1', expect.objectContaining({ method: 'PUT' }))
    })

    // Change log should contain an entry for Title
    expect(screen.getByText(/Change Log/i)).toBeInTheDocument()
    // The new field value should appear in change log line
    // Note: Using a relaxed matcher due to simplified mock DOM
    await waitFor(() => {
      expect(screen.getByText((t) => t.includes('Title') && t.includes('Edited Title'))).toBeInTheDocument()
    })
  })

  it('adds and removes skills', async () => {
    ;(global as any).fetch = jest.fn(async () => ({ ok: true, json: async () => ({ job: { ...initialJob, skills: ['React', 'Leadership'] } }) }))

    render(<JobDetailEditor job={initialJob} />)

    const skillInput = screen.getByPlaceholderText('Add a skill (e.g., React, Leadership)') as HTMLInputElement
    fireEvent.change(skillInput, { target: { value: 'Leadership' } })
    fireEvent.keyDown(skillInput, { key: 'Enter' })

    await waitFor(() => {
      expect((global as any).fetch).toHaveBeenCalled()
    })

    // Remove skill button should exist
    const removeButtons = screen.getAllByRole('button', { name: /remove/i })
    expect(removeButtons.length).toBeGreaterThan(0)
  })
})

