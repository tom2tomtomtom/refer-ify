/**
 * @jest-environment jsdom
 */
import React from 'react'
import { render, screen } from '@testing-library/react'
import ClientJobDetailPage from '@/app/(dashboard)/client/jobs/[id]/page'

jest.mock('@/lib/auth', () => ({ requireRole: jest.fn(() => Promise.resolve({ user: { id: 'client-1' } })) }))

// Mock Next.js Link component
jest.mock('next/link', () => {
  return ({ href, children, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  )
})

import { getSupabaseServerComponentClient } from '@/lib/supabase/server'
jest.mock('@/lib/supabase/server', () => ({ getSupabaseServerComponentClient: jest.fn() }))

const mockSupabase = {
  from: jest.fn(),
  select: jest.fn(),
  eq: jest.fn(),
  single: jest.fn(),
}

;(getSupabaseServerComponentClient as jest.Mock).mockResolvedValue(mockSupabase)

const mockJob = { id: 'job-123', title: 'My Role', status: 'active', created_at: '2024-01-01T00:00:00Z', description: 'desc' }

describe('ClientJobDetailPage analytics link', () => {
  it('renders a link to the analytics page', async () => {
    const query = { select: jest.fn().mockReturnThis(), eq: jest.fn().mockReturnThis(), single: jest.fn().mockResolvedValue({ data: mockJob }) }
    mockSupabase.from.mockReturnValue(query)

    const Page = await ClientJobDetailPage({ params: Promise.resolve({ id: 'job-123' }) } as any)
    render(Page)

    const analyticsLink = screen.getByText('View Analytics').closest('a')
    expect(analyticsLink).toHaveAttribute('href', '/client/jobs/job-123/analytics')
  })
})

