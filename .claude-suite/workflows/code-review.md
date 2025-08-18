# Code Review Workflow

> Systematic approach to code review for Refer-ify development

## Pre-Review Checklist (Author)

### Code Quality
- [ ] **Self-Review**: Author has reviewed their own changes thoroughly
- [ ] **Testing**: All tests pass locally and in CI
- [ ] **TypeScript**: No type errors, strict typing maintained
- [ ] **Linting**: ESLint passes with no errors or warnings
- [ ] **Build**: `npm run build` completes successfully

### Feature Completeness
- [ ] **Requirements Met**: All acceptance criteria fulfilled
- [ ] **Edge Cases**: Error handling and edge cases covered
- [ ] **Multi-role Support**: Appropriate access controls implemented
- [ ] **Responsive Design**: Works across desktop and mobile
- [ ] **Performance**: No significant performance impact

## Review Process

### 1. Architecture Review
- [ ] **Design Patterns**: Follows established patterns in codebase
- [ ] **SOLID Principles**: Code follows SOLID design principles
- [ ] **DRY Principle**: No unnecessary code duplication
- [ ] **Separation of Concerns**: Clear boundaries between components
- [ ] **Database Design**: Schema changes are normalized and efficient

### 2. Security Review
- [ ] **Authentication**: Proper authentication checks in place
- [ ] **Authorization**: RLS policies and role-based access implemented
- [ ] **Data Validation**: Input validation and sanitization
- [ ] **SQL Injection**: Parameterized queries used
- [ ] **XSS Prevention**: Output encoding and CSP headers

### 3. Business Logic Review
- [ ] **Referral Flow**: Maintains referral-only platform integrity
- [ ] **Fee Calculations**: Payment logic is accurate and tested
- [ ] **Multi-tier Access**: Subscription tiers respected correctly
- [ ] **Network Hierarchy**: Founding/Select Circle rules enforced
- [ ] **Executive Focus**: Maintains professional, executive-grade experience

### 4. Technical Implementation
- [ ] **Next.js Best Practices**: Server/client components used appropriately
- [ ] **Supabase Integration**: Database operations follow RLS patterns
- [ ] **Real-time Features**: WebSocket subscriptions optimized
- [ ] **Error Handling**: Graceful error handling and user feedback
- [ ] **Loading States**: Proper loading and skeleton states

## Testing Review

### Unit Tests
- [ ] **Coverage**: New code has >80% test coverage
- [ ] **Test Quality**: Tests cover both happy path and error cases
- [ ] **Mocking**: External dependencies properly mocked
- [ ] **Assertions**: Tests have meaningful assertions

### Integration Tests  
- [ ] **API Tests**: All new API routes tested
- [ ] **Component Tests**: React components tested with RTL
- [ ] **Database Tests**: Database operations tested with test DB
- [ ] **Business Logic**: Complex business rules validated

### E2E Tests
- [ ] **Critical Paths**: Important user flows tested
- [ ] **Multi-role Flows**: Different user types tested
- [ ] **Error Scenarios**: Error handling tested end-to-end

## Performance Review

### Frontend Performance
- [ ] **Bundle Size**: No significant bundle size increase
- [ ] **Render Optimization**: Unnecessary re-renders avoided
- [ ] **Image Optimization**: Images properly optimized
- [ ] **Code Splitting**: Large dependencies code-split appropriately

### Backend Performance
- [ ] **Database Queries**: Efficient queries with proper indexing
- [ ] **API Response Time**: No degradation in API response times  
- [ ] **Memory Usage**: No memory leaks or excessive memory usage
- [ ] **Concurrent Users**: Can handle expected concurrent load

## Documentation Review

### Code Documentation
- [ ] **Complex Logic**: Non-obvious code is commented
- [ ] **API Documentation**: New endpoints documented
- [ ] **Type Definitions**: Complex types have JSDoc comments
- [ ] **Architecture**: Significant architectural changes documented

### User Documentation
- [ ] **Feature Documentation**: New features documented for users
- [ ] **API Changes**: Breaking changes documented for API consumers
- [ ] **Deployment Notes**: Any deployment considerations noted

## Review Feedback Categories

### Must Fix (Blocking)
- Security vulnerabilities
- Breaking changes without migration
- Test failures
- Type errors
- Performance regressions

### Should Fix (Important)
- Code style violations
- Missing error handling
- Incomplete test coverage
- Accessibility issues
- Performance optimizations

### Consider (Optional)
- Code organization improvements
- Alternative implementation approaches  
- Documentation enhancements
- Future refactoring opportunities

## Approval Criteria

### Required for Merge
- [ ] **No Blocking Issues**: All "Must Fix" items resolved
- [ ] **Tests Pass**: All automated tests pass in CI
- [ ] **Security Review**: No security vulnerabilities identified
- [ ] **Performance**: No significant performance degradation
- [ ] **Documentation**: Adequate documentation provided

### Quality Gates
- [ ] **Two Approvals**: At least two team members approve
- [ ] **Senior Review**: Senior engineer approval for architectural changes
- [ ] **Product Review**: Product owner approval for user-facing changes
- [ ] **Security Review**: Security review for authentication/authorization changes