/**
 * @jest-environment jsdom
 */
import React from 'react'
import { render, screen } from '@testing-library/react'
import FoundingReferralsPage from '@/app/(dashboard)/founding/referrals/page'
import { getSupabaseServerComponentClient } from '@/lib/supabase/server'

jest.mock('@/lib/supabase/server', () => ({
  getSupabaseServerComponentClient: jest.fn(),
}))

const mockSupabase = {
  auth: { getUser: jest.fn() },
  from: jest.fn(),
}

describe('FoundingReferralsPage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(getSupabaseServerComponentClient as jest.Mock).mockResolvedValue(mockSupabase)
  })

  it('renders metrics and list when user present', async () => {
    const mockUser = { id: 'founder-1' }
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser } })
    
    // Mock profile query for auth role check
    const mockProfileQuery = {
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: { role: 'founding_circle' } })
    }
    
    // Mock referrals query
    const mockReferralsQuery = {
      select: jest.fn().mockReturnThis(),
      match: jest.fn().mockReturnThis(),
      order: jest.fn().mockResolvedValue({ data: [] })
    }
    
    mockSupabase.from.mockImplementation((table: string) => {
      if (table === 'profiles') return mockProfileQuery
      if (table === 'referrals') return mockReferralsQuery
      return mockReferralsQuery
    })

    const Page = await FoundingReferralsPage()
    const { container } = render(Page)

    expect(screen.getByText(/My Referrals \(Founding\)/)).toBeInTheDocument()
    expect(container.querySelector('.grid.gap-4.md\\:grid-cols-3')).toBeInTheDocument()
  })

  it('returns null if no user', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: null } })
    
    // Mock the query that would throw if called
    const mockQuery = {
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: null })
    }
    mockSupabase.from.mockReturnValue(mockQuery)
    
    // This should redirect, not return a page
    await expect(FoundingReferralsPage()).rejects.toThrow('NEXT_REDIRECT')
  })
})

