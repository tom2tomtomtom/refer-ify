# Testing Strategy

> Comprehensive testing approach for Refer-ify platform

## Testing Philosophy

**Executive-Grade Quality**: Every feature must work flawlessly for professional users managing their careers and business relationships.

**Multi-Role Complexity**: Testing must validate that Founding Circle, Select Circle, Client, and Candidate roles all work correctly in isolation and interaction.

**Business-Critical Accuracy**: Financial calculations, referral tracking, and subscription management must be 100% accurate.

## Testing Pyramid

### Unit Tests (70% of tests)
**Framework**: Jest + React Testing Library
**Coverage Target**: 80-90%

#### What to Test
- [ ] **React Components**: Props, state, user interactions
- [ ] **Utility Functions**: Business logic, calculations, validations  
- [ ] **API Route Handlers**: Request/response processing
- [ ] **Database Operations**: CRUD operations and queries
- [ ] **Authentication Logic**: Role verification and permissions

#### Example Unit Test Structure
```typescript
// Component Test
describe('ReferralSubmissionForm', () => {
  it('validates required fields before submission', () => {
    render(<ReferralSubmissionForm jobId="123" />)
    fireEvent.click(screen.getByRole('button', { name: 'Submit Referral' }))
    expect(screen.getByText('Resume is required')).toBeInTheDocument()
  })
})

// Utility Test  
describe('calculateReferralFee', () => {
  it('calculates 40% fee for Select Circle referral', () => {
    const fee = calculateReferralFee(100000, 'select_circle')
    expect(fee).toBe(40000)
  })
})
```

### Integration Tests (20% of tests)
**Framework**: Jest + Supabase Test Client
**Focus**: Component and system interactions

#### What to Test
- [ ] **API Integration**: Frontend → API → Database flows
- [ ] **Authentication Flows**: Login, role switching, permissions
- [ ] **Business Processes**: Complete referral submission flow
- [ ] **Real-time Features**: WebSocket subscription updates
- [ ] **Multi-role Interactions**: Cross-role feature access

#### Example Integration Test
```typescript
describe('Referral Submission Flow', () => {
  it('completes full referral submission for Select Circle member', async () => {
    // Setup authenticated user
    const { user } = await setupTestUser('select_circle')
    
    // Submit referral
    const response = await submitReferral({
      jobId: '123',
      candidateData: mockCandidateData,
      referrerNotes: 'Excellent cultural fit'
    })
    
    // Verify database state
    const referral = await supabase
      .from('referrals')
      .select('*')
      .eq('id', response.id)
      .single()
    
    expect(referral.status).toBe('pending')
    expect(referral.referrer_id).toBe(user.id)
  })
})
```

### E2E Tests (10% of tests)
**Framework**: Playwright
**Focus**: Complete user journeys

#### Critical User Flows
- [ ] **Client Onboarding**: Registration → Subscription → First Job Post
- [ ] **Referral Journey**: Job Discovery → Candidate Outreach → Referral Submission
- [ ] **Review Process**: Client Reviews Referral → Interview → Hiring Decision
- [ ] **Payment Flow**: Successful Hire → Fee Distribution → Payment Processing
- [ ] **Multi-role Experience**: Role switching and access control

#### Example E2E Test
```typescript
test('Complete referral and hiring flow', async ({ page }) => {
  // Client posts job requirement
  await page.goto('/dashboard/client')
  await page.fill('[data-testid="job-title"]', 'Senior Frontend Engineer')
  await page.click('[data-testid="post-job"]')
  
  // Switch to Select Circle member
  await page.goto('/dashboard/select-circle')
  await page.click('[data-testid="job-feed"]')
  
  // Submit referral
  await page.click('[data-testid="refer-candidate"]')
  await page.setInputFiles('[data-testid="resume-upload"]', 'test-resume.pdf')
  await page.click('[data-testid="submit-referral"]')
  
  // Verify referral appears in client dashboard
  await page.goto('/dashboard/client/referrals')
  await expect(page.locator('[data-testid="referral-list"]')).toContainText('Senior Frontend Engineer')
})
```

## Test Data Management

### Test Database
- **Isolated Environment**: Separate test database for each test run
- **Clean State**: Database reset between test suites
- **Realistic Data**: Production-like data structure and constraints
- **Performance**: Fast setup and teardown

### Mock Data Strategy
```typescript
// User Roles Mock Data
export const mockUsers = {
  foundingCircle: {
    id: 'fc-user-1',
    role: 'founding_circle',
    permissions: ['view_all_jobs', 'manage_network']
  },
  selectCircle: {
    id: 'sc-user-1', 
    role: 'select_circle',
    permissions: ['view_tiered_jobs', 'submit_referrals']
  },
  client: {
    id: 'client-1',
    role: 'client',
    subscription_tier: 'priority'
  }
}

// Job Requirements Mock Data
export const mockJobs = {
  connectTier: {
    id: 'job-1',
    tier: 'connect',
    salary_min: 120000,
    visibility: ['select_circle', 'founding_circle']
  }
}
```

## Testing Commands

### Development Testing
```bash
# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run E2E tests with UI
npm run test:e2e:ui

# Run specific test file
npm run test ReferralForm.test.tsx
```

### CI/CD Testing
```bash
# Full test suite (runs in CI)
npm run test:ci

# E2E tests in headless mode
npm run test:e2e

# All tests together
npm run test:all
```

## Quality Gates

### Pull Request Requirements
- [ ] **Unit Test Coverage**: Minimum 80% for new code
- [ ] **Integration Tests**: All new API routes tested
- [ ] **E2E Tests**: Critical paths updated if modified
- [ ] **Test Performance**: Test suite runs in <5 minutes

### Deployment Requirements
- [ ] **All Tests Pass**: 100% pass rate in CI environment
- [ ] **No Flaky Tests**: Tests consistently pass across runs
- [ ] **Performance**: No test performance regressions
- [ ] **Coverage Maintained**: Coverage doesn't decrease

## Testing Best Practices

### Test Organization
- [ ] **Clear Naming**: Descriptive test names explaining behavior
- [ ] **AAA Pattern**: Arrange, Act, Assert structure
- [ ] **Single Responsibility**: Each test validates one behavior
- [ ] **Independent Tests**: Tests don't depend on each other

### Mock Strategy
- [ ] **External Dependencies**: API calls, third-party services
- [ ] **Database Operations**: Use test database, not mocks
- [ ] **Authentication**: Mock auth tokens and user sessions
- [ ] **Real-time Features**: Mock WebSocket connections

### Error Testing
- [ ] **Network Failures**: Test offline scenarios
- [ ] **Authentication Errors**: Test expired tokens, unauthorized access
- [ ] **Validation Errors**: Test form validation and error messages
- [ ] **Business Rule Violations**: Test subscription limits, role restrictions

## Specialized Testing Areas

### Multi-Role Testing
- [ ] **Access Control**: Each role sees appropriate content
- [ ] **Permission Boundaries**: Users can't access unauthorized features
- [ ] **Data Isolation**: Users only see their own data
- [ ] **Role Switching**: Founding Circle can switch contexts properly

### Financial Testing
- [ ] **Fee Calculations**: Referral fees calculated correctly
- [ ] **Subscription Billing**: Recurring payments processed accurately
- [ ] **Payment Distribution**: Fees distributed to correct network members
- [ ] **Currency Handling**: Multi-currency support works correctly

### Performance Testing
- [ ] **Load Testing**: Handle expected concurrent users
- [ ] **Database Performance**: Queries execute within acceptable time
- [ ] **Real-time Performance**: WebSocket connections scale properly
- [ ] **Memory Usage**: No memory leaks in long-running tests