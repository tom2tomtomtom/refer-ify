# Testing Guide for Refer-ify

This document provides comprehensive information about the testing infrastructure and best practices for the Refer-ify application.

## Overview

Our testing strategy includes:
- **Unit Tests**: Component and utility function testing with Jest and React Testing Library
- **Integration Tests**: Full-flow testing with API integration
- **E2E Tests**: End-to-end user journey testing with Playwright
- **API Tests**: Backend route testing with mock databases
- **Performance Tests**: Lighthouse audits for web performance
- **Security Tests**: Dependency auditing and vulnerability scanning

## Test Structure

```
src/
├── __tests__/
│   ├── components/          # Component unit tests
│   ├── api/                # API route tests
│   ├── lib/                # Utility function tests
│   ├── integration/        # Integration tests
│   └── setup/              # Test utilities and database setup
├── __mocks__/              # Mock configurations
│   ├── handlers.ts         # MSW API handlers
│   ├── server.ts           # MSW server setup
│   ├── browser.ts          # MSW browser setup
│   └── supabase.ts         # Supabase client mocks
└── e2e/                    # End-to-end tests
    ├── authentication.spec.ts
    ├── referral-flow.spec.ts
    └── subscription-management.spec.ts
```

## Running Tests

### Unit and Integration Tests

```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run tests in CI mode
npm run test:ci
```

### End-to-End Tests

```bash
# Run all E2E tests
npm run test:e2e

# Run E2E tests in headed mode (see browser)
npm run test:e2e:headed

# Run E2E tests with UI
npm run test:e2e:ui

# Debug E2E tests
npm run test:e2e:debug
```

### All Tests

```bash
# Run complete test suite
npm run test:all
```

## Writing Tests

### Component Tests

Use React Testing Library for component testing:

```typescript
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'
import { JobCard } from '@/components/jobs/JobCard'

describe('JobCard', () => {
  const mockJob = {
    id: '1',
    title: 'Software Engineer',
    description: 'Build amazing apps',
    // ... other job properties
  }

  it('renders job information correctly', () => {
    render(<JobCard job={mockJob} />)
    
    expect(screen.getByText('Software Engineer')).toBeInTheDocument()
    expect(screen.getByText('Build amazing apps')).toBeInTheDocument()
  })

  it('handles user interactions', async () => {
    const user = userEvent.setup()
    const mockOnClick = jest.fn()
    
    render(<JobCard job={mockJob} onClick={mockOnClick} />)
    
    await user.click(screen.getByRole('button'))
    expect(mockOnClick).toHaveBeenCalledWith('1')
  })
})
```

### API Route Tests

Test API routes with request/response mocking:

```typescript
import { NextRequest } from 'next/server'
import { GET, POST } from '@/app/api/jobs/route'

describe('/api/jobs', () => {
  it('returns jobs for authenticated user', async () => {
    const request = new NextRequest('http://localhost/api/jobs')
    const response = await GET(request)

    expect(response.status).toBe(200)
    
    const body = await response.json()
    expect(body.jobs).toBeDefined()
  })
})
```

### Integration Tests

Test complete user flows:

```typescript
import { render, screen, waitFor } from '@testing-library/react'
import { ReferralForm } from '@/components/referrals/ReferralForm'

describe('Referral Flow Integration', () => {
  it('completes full referral submission', async () => {
    const user = userEvent.setup()
    
    // Mock API responses
    global.fetch = jest.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ signedUrl: 'https://example.com' })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ referral: { id: 'ref123' } })
      })

    render(<ReferralForm job={mockJob} />)

    // Fill form and submit
    await user.type(screen.getByLabelText('Name'), 'John Doe')
    await user.click(screen.getByRole('button', { name: 'Submit' }))

    await waitFor(() => {
      expect(screen.getByText('Success')).toBeInTheDocument()
    })
  })
})
```

### E2E Tests

Test complete user journeys:

```typescript
import { test, expect } from '@playwright/test'

test.describe('Authentication Flow', () => {
  test('should login successfully', async ({ page }) => {
    await page.goto('/login')
    
    await page.fill('[data-testid="email"]', 'user@example.com')
    await page.fill('[data-testid="password"]', 'password123')
    await page.click('[data-testid="signin"]')
    
    await expect(page).toHaveURL('/dashboard')
  })
})
```

## Test Data Management

### Mock Data

Use MSW handlers for consistent API mocking:

```typescript
// src/__mocks__/handlers.ts
export const handlers = [
  http.get('/api/jobs', () => {
    return HttpResponse.json({ jobs: mockJobs })
  }),
  
  http.post('/api/referrals', async ({ request }) => {
    const data = await request.json()
    return HttpResponse.json({ referral: { id: 'ref123', ...data } })
  }),
]
```

### Test Database

For integration tests requiring database access:

```typescript
import { createTestSupabaseClient, cleanupTestData } from '../setup/test-db'

describe('Database Integration', () => {
  let testClient: ReturnType<typeof createTestSupabaseClient>

  beforeAll(() => {
    testClient = createTestSupabaseClient()
  })

  afterEach(async () => {
    await cleanupTestData(testClient)
  })
})
```

## Best Practices

### General Testing

1. **Test Behavior, Not Implementation**: Focus on what the component does, not how it does it
2. **Use Semantic Queries**: Prefer `getByRole`, `getByLabelText` over `getByTestId`
3. **Test User Interactions**: Simulate real user behavior with userEvent
4. **Mock External Dependencies**: Use MSW for API calls, mock Supabase client
5. **Clean Up**: Always clean up after tests (timers, subscriptions, test data)

### Component Testing

1. **Test Props and State Changes**: Verify components respond correctly to prop changes
2. **Test Error States**: Include tests for error boundaries and loading states
3. **Test Accessibility**: Use `getByRole` and ensure ARIA attributes work
4. **Test Responsive Behavior**: Test different viewport sizes when relevant

### API Testing

1. **Test All HTTP Methods**: Cover GET, POST, PUT, DELETE endpoints
2. **Test Authentication**: Verify auth requirements and role-based access
3. **Test Validation**: Include tests for input validation and error responses
4. **Test Edge Cases**: Handle malformed data, missing fields, large payloads

### E2E Testing

1. **Test Critical Paths**: Focus on key user journeys and business logic
2. **Use Stable Selectors**: Prefer `data-testid` or semantic selectors
3. **Test Across Browsers**: Run tests on different browsers and devices
4. **Handle Async Operations**: Use proper waits for network requests and animations

## Coverage Requirements

We maintain high test coverage standards:

- **Global Coverage**: Minimum 80% for all metrics
- **Components**: Minimum 85% coverage
- **Utilities**: Minimum 90% coverage
- **API Routes**: Minimum 85% coverage

Coverage is enforced in CI and will fail builds that don't meet thresholds.

## Debugging Tests

### Unit Tests

```bash
# Run specific test file
npm test JobCard.test.tsx

# Run tests in debug mode
npm test -- --detectOpenHandles --forceExit

# Run with verbose output
npm test -- --verbose
```

### E2E Tests

```bash
# Run in headed mode to see browser
npm run test:e2e:headed

# Run with debug mode
npm run test:e2e:debug

# Run specific test file
npx playwright test authentication.spec.ts
```

### Common Issues

1. **Async Issues**: Use `waitFor` for async operations
2. **Memory Leaks**: Clean up subscriptions and timers
3. **Mock Issues**: Reset mocks between tests
4. **Flaky Tests**: Add proper waits and stable selectors

## Continuous Integration

Tests run automatically on:
- Pull requests to main/develop
- Pushes to main/develop branches

The CI pipeline includes:
1. Unit and integration tests
2. E2E tests
3. Security audits
4. Build verification
5. Performance audits (Lighthouse)
6. Coverage reporting

## Performance Testing

We use Lighthouse CI for performance monitoring:

```json
{
  "assertions": {
    "categories:performance": ["error", {"minScore": 0.8}],
    "categories:accessibility": ["error", {"minScore": 0.9}],
    "categories:best-practices": ["error", {"minScore": 0.9}],
    "categories:seo": ["error", {"minScore": 0.8}]
  }
}
```

## Security Testing

Security testing includes:
- NPM audit for known vulnerabilities
- Dependency scanning
- OWASP security headers validation
- Authentication and authorization testing

## Contributing

When adding new features:

1. **Write Tests First**: Consider TDD approach
2. **Update Existing Tests**: Ensure changes don't break existing functionality
3. **Add E2E Tests**: For new user-facing features
4. **Update Documentation**: Keep this guide current
5. **Check Coverage**: Ensure new code meets coverage requirements

## Tools and Libraries

- **Jest**: Test runner and assertion library
- **React Testing Library**: Component testing utilities
- **Playwright**: E2E testing framework
- **MSW**: API mocking for tests
- **Lighthouse CI**: Performance and accessibility auditing
- **Codecov**: Coverage reporting and visualization

## Environment Variables

Test environment requires these variables:

```env
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=test-anon-key
SUPABASE_SERVICE_ROLE_KEY=test-service-key
STRIPE_SECRET_KEY=sk_test_test
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_test
NODE_ENV=test
```

## Troubleshooting

### Common Errors

1. **Module not found**: Check import paths and Jest module mapping
2. **Async timeout**: Increase timeout or add proper waits
3. **Memory leaks**: Clean up subscriptions and event listeners
4. **Flaky tests**: Add stability waits and better selectors

For additional help, check the test logs and GitHub Actions output for detailed error information.