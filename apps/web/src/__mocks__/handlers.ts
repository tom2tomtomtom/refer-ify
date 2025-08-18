import { http, HttpResponse } from 'msw'

const mockJobs = [
  {
    id: '1',
    title: 'Senior Software Engineer',
    description: 'Build scalable applications with React and TypeScript',
    location_type: 'remote',
    salary_min: 100000,
    salary_max: 150000,
    currency: 'USD',
    status: 'active',
    subscription_tier: 'priority',
    skills: ['React', 'TypeScript', 'Node.js'],
    experience_level: 'senior',
    job_type: 'full_time',
    created_at: '2023-01-01T00:00:00.000Z',
    client_id: 'client1',
    _count: { referrals: 5 },
  },
  {
    id: '2',
    title: 'Product Manager',
    description: 'Lead product development and strategy',
    location_type: 'hybrid',
    salary_min: 80000,
    salary_max: 120000,
    currency: 'USD',
    status: 'active',
    subscription_tier: 'connect',
    skills: ['Product Management', 'Analytics', 'Strategy'],
    experience_level: 'mid',
    job_type: 'full_time',
    created_at: '2023-01-02T00:00:00.000Z',
    client_id: 'client1',
    _count: { referrals: 3 },
  },
]

const mockReferrals = [
  {
    id: '1',
    job_id: '1',
    candidate_name: 'John Doe',
    candidate_email: 'john@example.com',
    candidate_phone: '+1234567890',
    candidate_linkedin: 'https://linkedin.com/in/johndoe',
    referrer_notes: 'Excellent candidate with strong technical skills',
    expected_salary: 120000,
    availability: '2_weeks',
    consent_given: true,
    referrer_id: 'referrer1',
    created_at: '2023-01-03T00:00:00.000Z',
    status: 'pending',
  },
]

const mockUsers = {
  'client@example.com': {
    id: 'client1',
    email: 'client@example.com',
    role: 'client',
    subscription: { plan: 'connect', status: 'active' },
    usage: { job_posts: 3, limit: 10 },
  },
  'referrer@example.com': {
    id: 'referrer1',
    email: 'referrer@example.com',
    role: 'candidate',
    subscription: null,
  },
  'founding@example.com': {
    id: 'founding1',
    email: 'founding@example.com',
    role: 'founding_circle',
    subscription: { plan: 'exclusive', status: 'active' },
  },
}

export const handlers = [
  // Authentication endpoints
  http.post('/auth/v1/token', ({ request }) => {
    return HttpResponse.json({
      access_token: 'mock-access-token',
      refresh_token: 'mock-refresh-token',
      user: {
        id: 'mock-user-id',
        email: 'test@example.com',
        email_confirmed_at: '2023-01-01T00:00:00.000Z',
      },
    })
  }),

  http.get('/auth/v1/user', () => {
    return HttpResponse.json({
      id: 'mock-user-id',
      email: 'test@example.com',
      email_confirmed_at: '2023-01-01T00:00:00.000Z',
    })
  }),

  // Jobs API
  http.get('/api/jobs', ({ request }) => {
    const url = new URL(request.url)
    const search = url.searchParams.get('search')
    const status = url.searchParams.get('status')
    const tier = url.searchParams.get('tier')
    const page = parseInt(url.searchParams.get('page') || '1')
    const limit = parseInt(url.searchParams.get('limit') || '12')

    let filteredJobs = [...mockJobs]

    if (search) {
      filteredJobs = filteredJobs.filter(job =>
        job.title.toLowerCase().includes(search.toLowerCase()) ||
        job.description.toLowerCase().includes(search.toLowerCase())
      )
    }

    if (status && status !== 'all') {
      filteredJobs = filteredJobs.filter(job => job.status === status)
    }

    if (tier && tier !== 'all') {
      filteredJobs = filteredJobs.filter(job => job.subscription_tier === tier)
    }

    const offset = (page - 1) * limit
    const paginatedJobs = filteredJobs.slice(offset, offset + limit)

    return HttpResponse.json({
      jobs: paginatedJobs,
      total: filteredJobs.length,
      page,
      limit,
      hasMore: offset + limit < filteredJobs.length,
    })
  }),

  http.post('/api/jobs', async ({ request }) => {
    const jobData = await request.json()
    const newJob = {
      id: `job_${Date.now()}`,
      ...jobData,
      client_id: 'client1',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      status: jobData.status || 'draft',
      _count: { referrals: 0 },
    }

    mockJobs.push(newJob)

    return HttpResponse.json({ job: newJob }, { status: 201 })
  }),

  http.get('/api/jobs/:id', ({ params }) => {
    const job = mockJobs.find(j => j.id === params.id)
    if (!job) {
      return HttpResponse.json({ error: 'Job not found' }, { status: 404 })
    }
    return HttpResponse.json({ job })
  }),

  // Referrals API
  http.get('/api/referrals', ({ request }) => {
    const url = new URL(request.url)
    const page = parseInt(url.searchParams.get('page') || '1')
    const limit = parseInt(url.searchParams.get('limit') || '20')

    const offset = (page - 1) * limit
    const paginatedReferrals = mockReferrals.slice(offset, offset + limit)

    return HttpResponse.json({
      referrals: paginatedReferrals,
      total: mockReferrals.length,
      page,
      limit,
    })
  }),

  http.post('/api/referrals', async ({ request }) => {
    const referralData = await request.json()
    const newReferral = {
      id: `ref_${Date.now()}`,
      ...referralData,
      referrer_id: 'referrer1',
      consent_timestamp: new Date().toISOString(),
      created_at: new Date().toISOString(),
      status: 'pending',
    }

    mockReferrals.push(newReferral)

    return HttpResponse.json({ referral: newReferral }, { status: 201 })
  }),

  http.get('/api/referrals/:id', ({ params }) => {
    const referral = mockReferrals.find(r => r.id === params.id)
    if (!referral) {
      return HttpResponse.json({ error: 'Referral not found' }, { status: 404 })
    }
    return HttpResponse.json({ referral })
  }),

  // Storage API
  http.post('/api/storage/resumes', async ({ request }) => {
    const { fileName } = await request.json()
    return HttpResponse.json({
      signedUrl: `https://storage.example.com/upload/${fileName}`,
      token: 'mock-token',
      path: `/resumes/${fileName}`,
    })
  }),

  // File upload to signed URL (mock)
  http.put('https://storage.example.com/upload/*', () => {
    return HttpResponse.json({}, { status: 200 })
  }),

  // Users API
  http.get('/api/users', () => {
    return HttpResponse.json({
      user: mockUsers['client@example.com'],
    })
  }),

  // Payments API
  http.post('/api/payments', async ({ request }) => {
    const paymentData = await request.json()
    
    // Simulate different payment scenarios
    if (paymentData.card?.number === '4000000000000002') {
      return HttpResponse.json(
        { error: 'Your card was declined.', code: 'card_declined' },
        { status: 400 }
      )
    }

    return HttpResponse.json({
      success: true,
      subscription: {
        id: 'sub_123',
        status: 'active',
        plan: paymentData.plan || 'priority',
      },
      payment: {
        id: 'pi_123',
        status: 'succeeded',
      },
    })
  }),

  // Webhooks API
  http.post('/api/webhooks', () => {
    return HttpResponse.json({ received: true })
  }),

  // Auth API
  http.get('/api/auth', () => {
    return HttpResponse.json({
      user: {
        id: 'mock-user-id',
        email: 'test@example.com',
        role: 'client',
      },
    })
  }),

  // Dev API
  http.post('/api/dev/switch-role', async ({ request }) => {
    const { role } = await request.json()
    return HttpResponse.json({
      success: true,
      user: {
        id: 'mock-user-id',
        email: 'test@example.com',
        role,
      },
    })
  }),

  // Error scenarios
  http.get('/api/error-test', () => {
    return HttpResponse.json(
      { error: 'Test error' },
      { status: 500 }
    )
  }),
]

// Network error simulation
export const networkErrorHandlers = [
  http.get('/api/network-error', () => {
    return HttpResponse.error()
  }),
]

// Slow response simulation
export const slowResponseHandlers = [
  http.get('/api/slow', async () => {
    await new Promise(resolve => setTimeout(resolve, 3000))
    return HttpResponse.json({ data: 'slow response' })
  }),
]