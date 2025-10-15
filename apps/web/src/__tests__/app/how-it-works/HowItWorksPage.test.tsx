/**
 * @jest-environment jsdom
 */
import React from 'react'
import { render, screen } from '@testing-library/react'
import HowItWorksPage from '@/app/how-it-works/page'

// Mock Lucide icons
jest.mock('lucide-react', () => ({
  CheckCircle: () => <div data-testid="check-circle">CheckCircle</div>,
  Users: () => <div data-testid="users">Users</div>,
  Briefcase: () => <div data-testid="briefcase">Briefcase</div>,
  DollarSign: () => <div data-testid="dollar-sign">DollarSign</div>,
  Shield: () => <div data-testid="shield">Shield</div>,
  Zap: () => <div data-testid="zap">Zap</div>,
  ArrowRight: () => <div data-testid="arrow-right">ArrowRight</div>,
  Star: () => <div data-testid="star">Star</div>,
  TrendingUp: () => <div data-testid="trending-up">TrendingUp</div>
}))

describe('How It Works Page', () => {
  it('renders hero section with main heading', () => {
    render(<HowItWorksPage />)

    expect(screen.getByText('Your Network Is Your')).toBeInTheDocument()
    expect(screen.getByText('Net Worth')).toBeInTheDocument()
    expect(screen.getByText('Transform your professional relationships into substantial income. Refer-ify connects elite tech executives through warm introductions, not cold applications.')).toBeInTheDocument()
  })

  it('displays invitation-only network badge', () => {
    render(<HowItWorksPage />)

    expect(screen.getByText('Invitation-Only Network')).toBeInTheDocument()
    expect(screen.getAllByTestId('shield')).toHaveLength(2) // Hero section and differentiators section
  })

  it('shows key value propositions in hero', () => {
    render(<HowItWorksPage />)

    expect(screen.getByText('$150K+ average placement fees')).toBeInTheDocument()
    expect(screen.getByText('40% referrer commission')).toBeInTheDocument()
    expect(screen.getAllByTestId('check-circle')).toHaveLength(2)
  })

  it('renders three audience sections', () => {
    render(<HowItWorksPage />)

    expect(screen.getByText('How Different Roles Use Refer-ify')).toBeInTheDocument()
    expect(screen.getByText('Choose your path based on your position in the network')).toBeInTheDocument()

    // Founder
    expect(screen.getByText('Founder')).toBeInTheDocument()
    expect(screen.getByText('Elite Executives')).toBeInTheDocument()
    expect(screen.getByText('Senior tech leaders who founded this network')).toBeInTheDocument()

    // Referrer
    expect(screen.getByText('Referrer')).toBeInTheDocument()
    expect(screen.getByText('Network Builders')).toBeInTheDocument()
    expect(screen.getByText('Trusted professionals making referrals')).toBeInTheDocument()

    // Client Companies
    expect(screen.getByText('Client Companies')).toBeInTheDocument()
    expect(screen.getByText('Hiring Companies')).toBeInTheDocument()
    expect(screen.getByText('Organizations seeking top talent')).toBeInTheDocument()
  })

  it('displays founding circle process steps', () => {
    render(<HowItWorksPage />)

    expect(screen.getByText('Invite Select Members')).toBeInTheDocument()
    expect(screen.getByText('Curate network quality through personal invitations')).toBeInTheDocument()
    
    expect(screen.getByText('Strategic Referrals')).toBeInTheDocument()
    expect(screen.getByText('Make high-value connections to top opportunities')).toBeInTheDocument()
    
    expect(screen.getByText('Network Growth Rewards')).toBeInTheDocument()
    expect(screen.getByText('15% of all network placements + referral fees')).toBeInTheDocument()
  })

  it('displays select circle process steps', () => {
    render(<HowItWorksPage />)

    expect(screen.getByText('Browse Opportunities')).toBeInTheDocument()
    expect(screen.getByText('See curated job requirements from elite companies')).toBeInTheDocument()
    
    expect(screen.getByText('Refer Your Network')).toBeInTheDocument()
    expect(screen.getByText('Connect people you know to perfect opportunities')).toBeInTheDocument()
    
    expect(screen.getByText('Earn Referral Fees')).toBeInTheDocument()
    expect(screen.getByText('40% of placement fees for successful hires')).toBeInTheDocument()
  })

  it('displays client company process steps', () => {
    render(<HowItWorksPage />)

    expect(screen.getByText('Post Requirements')).toBeInTheDocument()
    expect(screen.getByText('Share detailed role specs with the network')).toBeInTheDocument()
    
    expect(screen.getByText('Receive Warm Introductions')).toBeInTheDocument()
    expect(screen.getByText('Get pre-vetted candidates through trusted referrals')).toBeInTheDocument()
    
    expect(screen.getByText('Fast, Quality Hires')).toBeInTheDocument()
    expect(screen.getByText('Skip lengthy screening with relationship-based referrals')).toBeInTheDocument()
  })

  it('renders referral process section', () => {
    render(<HowItWorksPage />)

    expect(screen.getByText('The Referral Process')).toBeInTheDocument()
    expect(screen.getByText('See how our relationship-based approach creates better outcomes for everyone')).toBeInTheDocument()

    expect(screen.getByText('Company Posts Opportunity')).toBeInTheDocument()
    expect(screen.getByText('Client shares detailed role requirements privately with the network. No public job boards.')).toBeInTheDocument()

    expect(screen.getByText('Network Makes Referrals')).toBeInTheDocument()
    expect(screen.getByText('Select Circle members refer people they know personally. Warm introductions, not cold applications.')).toBeInTheDocument()

    expect(screen.getByText('Everyone Wins')).toBeInTheDocument()
    expect(screen.getByText('Quality hire made, referrer earns commission, network grows stronger through successful placements.')).toBeInTheDocument()
  })

  it('displays key differentiators section', () => {
    render(<HowItWorksPage />)

    expect(screen.getByText('Why Refer-ify Works')).toBeInTheDocument()
    expect(screen.getByText('Built on relationships, not algorithms')).toBeInTheDocument()

    expect(screen.getByText('Invitation Only')).toBeInTheDocument()
    expect(screen.getByText('Curated network of verified tech executives maintains quality')).toBeInTheDocument()

    expect(screen.getByText('Relationship Based')).toBeInTheDocument()
    expect(screen.getByText('Personal referrals create stronger connections than cold outreach')).toBeInTheDocument()

    expect(screen.getByText('AI Enhanced')).toBeInTheDocument()
    expect(screen.getByText('Smart matching helps identify the best referral opportunities')).toBeInTheDocument()

    expect(screen.getByText('High Value')).toBeInTheDocument()
    expect(screen.getByText('Focus on senior roles with substantial placement fees')).toBeInTheDocument()
  })

  it('renders pricing section with tiers', () => {
    render(<HowItWorksPage />)

    expect(screen.getByText('Pricing')).toBeInTheDocument()
    expect(screen.getByText('Subscription tiers plus performance-based placement fees')).toBeInTheDocument()

    // Client pricing tiers
    expect(screen.getByText('Connect')).toBeInTheDocument()
    expect(screen.getByText('$500')).toBeInTheDocument()
    expect(screen.getByText('+ 10-12% placement fee')).toBeInTheDocument()

    expect(screen.getByText('Priority')).toBeInTheDocument()
    expect(screen.getByText('$1,500')).toBeInTheDocument()
    expect(screen.getByText('+ 8% placement fee')).toBeInTheDocument()

    expect(screen.getByText('Exclusive')).toBeInTheDocument()
    expect(screen.getAllByText('$3,000')).toHaveLength(2)
    expect(screen.getByText('+ 6% placement fee')).toBeInTheDocument()
  })

  it('displays placement fee distribution example', () => {
    render(<HowItWorksPage />)

    expect(screen.getByText('Placement Fee Distribution')).toBeInTheDocument()
    expect(screen.getByText('Example: $200K salary hire = $20K total placement fee (10%)')).toBeInTheDocument()

    expect(screen.getByText('$8,000')).toBeInTheDocument()
    expect(screen.getByText('Referrer (40%)')).toBeInTheDocument()
    expect(screen.getByText('Referrer reward')).toBeInTheDocument()

    expect(screen.getAllByText('$3,000')).toHaveLength(2)
    expect(screen.getByText('Founder (15%)')).toBeInTheDocument()
    expect(screen.getByText('Network bonus')).toBeInTheDocument()

    expect(screen.getByText('$9,000')).toBeInTheDocument()
    expect(screen.getByText('Platform (45%)')).toBeInTheDocument()
    expect(screen.getByText('Operations & growth')).toBeInTheDocument()
  })

  it('shows annual earning potential breakdowns', () => {
    render(<HowItWorksPage />)

    expect(screen.getByText('Founder Earnings')).toBeInTheDocument()
    expect(screen.getByText('$31K-86K')).toBeInTheDocument()

    expect(screen.getByText('Referrer Earnings')).toBeInTheDocument()
    expect(screen.getByText('$19K-49K')).toBeInTheDocument()

    // Check for specific earning streams
    expect(screen.getAllByText('Placement referrals')).toHaveLength(2)
    expect(screen.getByText('Advisory services ($500/hr)')).toBeInTheDocument()
    expect(screen.getByText('Performance bonuses (top 20%)')).toBeInTheDocument()
    expect(screen.getByText('Coaching income ($400/hr)')).toBeInTheDocument()
  })

  it('renders CTA section', () => {
    render(<HowItWorksPage />)

    expect(screen.getByText('Ready to Transform Your Network?')).toBeInTheDocument()
    expect(screen.getByText('Join an exclusive community where professional relationships create substantial value')).toBeInTheDocument()

    expect(screen.getByText('Apply for Referrer Network')).toBeInTheDocument()
    expect(screen.getByText('Learn About Client Access')).toBeInTheDocument()
    expect(screen.getByText('Invitation-only platform • Currently accepting applications from senior tech executives')).toBeInTheDocument()
  })

  it('has proper page structure and background styling', () => {
    const { container } = render(<HowItWorksPage />)

    const main = container.querySelector('main')
    expect(main).toHaveClass('min-h-screen', 'bg-gradient-to-b', 'from-slate-50', 'to-white')

    // Check for gradient sections
    const gradientSections = container.querySelectorAll('.bg-gray-50, .bg-gradient-to-r')
    expect(gradientSections.length).toBeGreaterThan(0)
  })

  it('renders all icons in differentiators section', () => {
    render(<HowItWorksPage />)

    expect(screen.getAllByTestId('shield')).toHaveLength(2) // Hero and differentiators
    expect(screen.getAllByTestId('users')).toHaveLength(3) // Select circle, process and differentiators
    expect(screen.getByTestId('zap')).toBeInTheDocument()
    expect(screen.getByTestId('trending-up')).toBeInTheDocument()
  })

  it('maintains proper heading hierarchy', () => {
    render(<HowItWorksPage />)

    const h1 = screen.getByRole('heading', { level: 1 })
    expect(h1).toContainElement(screen.getByText('Your Network Is Your'))

    const h2Elements = screen.getAllByRole('heading', { level: 2 })
    expect(h2Elements.length).toBeGreaterThanOrEqual(5)
    
    const h3Elements = screen.getAllByRole('heading', { level: 3 })
    expect(h3Elements.length).toBeGreaterThan(10)
  })

  it('renders responsive grid layouts', () => {
    const { container } = render(<HowItWorksPage />)

    const mdGridCols3 = container.querySelectorAll('.md\\:grid-cols-3')
    expect(mdGridCols3.length).toBeGreaterThan(0)

    const lgGridCols3 = container.querySelectorAll('.lg\\:grid-cols-3')
    expect(lgGridCols3.length).toBeGreaterThan(0)
  })

  it('includes SVG graphics for process visualization', () => {
    const { container } = render(<HowItWorksPage />)

    const svg = container.querySelector('svg')
    expect(svg).toBeInTheDocument()
    
    const linearGradient = container.querySelector('linearGradient')
    expect(linearGradient).toBeInTheDocument()
  })

  it('displays consistent card styling across sections', () => {
    const { container } = render(<HowItWorksPage />)

    const roundedCards = container.querySelectorAll('.rounded-2xl, .rounded-xl')
    expect(roundedCards.length).toBeGreaterThan(8)
  })

  it('shows multi-stream revenue model explanation', () => {
    render(<HowItWorksPage />)

    expect(screen.getByText((content) => content.includes('multi-stream revenue model'))).toBeInTheDocument()
    expect(screen.getByText((content) => content.includes('The more you contribute to network success'))).toBeInTheDocument()
  })

  it('emphasizes warm introductions over cold applications', () => {
    render(<HowItWorksPage />)

    expect(screen.getByText((content) => content.includes('warm introductions, not cold applications'))).toBeInTheDocument()
    expect(screen.getByText((content) => content.includes('Warm introductions, not cold applications'))).toBeInTheDocument()
  })

  it('maintains accessibility with proper roles', () => {
    render(<HowItWorksPage />)

    const main = screen.getByRole('main')
    expect(main).toBeInTheDocument()

    const buttons = screen.getAllByRole('button')
    expect(buttons.length).toBe(2)
  })

  it('handles dynamic rendering correctly', () => {
    const { container } = render(<HowItWorksPage />)
    expect(container.firstChild).toBeInTheDocument()
  })
})