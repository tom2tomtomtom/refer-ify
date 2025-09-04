/**
 * @jest-environment jsdom
 */
import React from 'react'
import { render, screen } from '@testing-library/react'
import SelectCircleReferralsPage from '@/app/(dashboard)/select-circle/referrals/page'
import { getSupabaseServerComponentClient } from '@/lib/supabase/server'

jest.mock('@/lib/supabase/server', () => ({
  getSupabaseServerComponentClient: jest.fn(),
}))

const mockSupabase = {
  auth: { getUser: jest.fn() },
  from: jest.fn(),
  select: jest.fn(),
  match: jest.fn(),
  order: jest.fn(),
}

describe('SelectCircleReferralsPage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(getSupabaseServerComponentClient as jest.Mock).mockResolvedValue(mockSupabase)
  })

  it('renders metrics and list when user present', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    const query = { select: jest.fn().mockReturnThis(), match: jest.fn().mockReturnThis(), order: jest.fn().mockResolvedValue({ data: [] }) }
    mockSupabase.from.mockReturnValue(query)

    const Page = await SelectCircleReferralsPage()
    const { container } = render(Page)

    expect(screen.getByText('My Referrals')).toBeInTheDocument()
    expect(container.querySelector('.grid.gap-4.md\\:grid-cols-2.lg\\:grid-cols-4')).toBeInTheDocument()
  })

  it('returns null if no user', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: null } })
    const Page = await SelectCircleReferralsPage()
    const { container } = render(Page)
    expect(container.firstChild).toBeNull()
  })
})

