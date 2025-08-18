# Feature Development Workflow

> Standard workflow for implementing new features in Refer-ify

## Pre-Development Checklist

- [ ] **Requirements Analysis**: Clear understanding of feature scope
- [ ] **Architecture Review**: Impact on existing systems assessed
- [ ] **Business Logic**: Integration with referral-based model confirmed
- [ ] **Database Design**: Schema changes planned and reviewed
- [ ] **UI/UX Design**: Executive-grade interface requirements defined

## Development Process

### 1. Setup & Planning
- [ ] Create feature branch from `main`
- [ ] Update todo list with specific implementation steps
- [ ] Review existing patterns and conventions in codebase
- [ ] Identify dependencies and integration points

### 2. Implementation
- [ ] **Backend First**: API routes and database operations
- [ ] **Frontend Components**: React components with TypeScript
- [ ] **Real-time Features**: Supabase subscriptions if needed
- [ ] **Authentication**: Role-based access control integration
- [ ] **Testing**: Unit tests for each component/function

### 3. Integration Testing
- [ ] **API Integration**: Test all new API endpoints
- [ ] **Component Integration**: Test React component interactions
- [ ] **Database Operations**: Verify RLS policies work correctly
- [ ] **Real-time Updates**: Test WebSocket subscriptions
- [ ] **Multi-role Testing**: Verify access controls across user types

### 4. Quality Assurance
- [ ] **Code Review**: Self-review before requesting team review
- [ ] **Test Coverage**: Minimum 80% coverage for new code
- [ ] **E2E Testing**: Critical user flows tested with Playwright
- [ ] **Performance**: No significant performance degradation
- [ ] **Security**: No security vulnerabilities introduced

## Testing Strategy

### Unit Tests (Jest + RTL)
```bash
npm run test:watch
npm run test:coverage
```

### Integration Tests
- API route testing with test database
- Component integration with mocked services
- Business logic validation

### E2E Tests (Playwright)
```bash
npm run test:e2e
npm run test:e2e:ui
```

## Code Quality Standards

### TypeScript Requirements
- [ ] Strict type safety enforced
- [ ] No `any` types without justification
- [ ] Database types generated from Supabase schema
- [ ] Component props fully typed

### React Best Practices
- [ ] Functional components with hooks
- [ ] Proper error boundaries
- [ ] Optimized re-renders
- [ ] Accessibility standards met

### Next.js Patterns
- [ ] Server components when possible
- [ ] Client components marked with 'use client'
- [ ] Proper data fetching patterns
- [ ] Route handlers follow REST conventions

## Deployment Checklist

- [ ] **Environment Variables**: All required env vars documented
- [ ] **Migration Scripts**: Database schema changes prepared
- [ ] **Build Success**: `npm run build` completes without errors
- [ ] **Type Check**: `npm run type-check` passes
- [ ] **Lint Check**: `npm run lint` passes with no errors
- [ ] **Test Suite**: All tests pass in CI environment

## Post-Deployment Verification

- [ ] **Feature Functionality**: Core feature works as expected
- [ ] **Performance Metrics**: No degradation in key metrics
- [ ] **Error Monitoring**: No new errors in production logs
- [ ] **User Experience**: Executive-grade polish maintained
- [ ] **Multi-role Testing**: All user types can access appropriately

## Documentation Requirements

- [ ] **API Documentation**: New endpoints documented
- [ ] **Component Documentation**: Props and usage examples
- [ ] **Architecture Updates**: Decision records updated if needed
- [ ] **User Documentation**: Help content updated if user-facing