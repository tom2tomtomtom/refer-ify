# Error Handling Patterns

> Comprehensive error handling strategy for Refer-ify platform

## Error Handling Philosophy

**Executive-Grade Reliability**: Errors should never surprise users or leave them in broken states. Every error should provide clear guidance for resolution.

**Business-Critical Protection**: Financial operations, referral submissions, and subscription management must have robust error handling to prevent data corruption or revenue loss.

**Professional Communication**: Error messages should be professional, helpful, and appropriate for executive users.

## Frontend Error Handling

### React Error Boundaries
```typescript
// Global Error Boundary
class AppErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log to monitoring service
    logErrorToService(error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback error={this.state.error} />
    }
    return this.props.children
  }
}

// Feature-Specific Error Boundaries
const ReferralSubmissionBoundary = ({ children }) => (
  <ErrorBoundary 
    fallback={<ReferralErrorFallback />}
    onError={(error) => logError('referral_submission', error)}
  >
    {children}
  </ErrorBoundary>
)
```

### API Error Handling
```typescript
// Centralized API Error Handler
export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
    public details?: any
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

// API Client with Error Handling
export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  try {
    const response = await fetch(`/api${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new ApiError(
        response.status,
        errorData.code,
        errorData.message,
        errorData.details
      )
    }

    return await response.json()
  } catch (error) {
    if (error instanceof ApiError) {
      throw error
    }
    
    // Network or parsing errors
    throw new ApiError(
      500,
      'NETWORK_ERROR',
      'Unable to connect to server. Please check your connection.',
      error
    )
  }
}
```

### Form Error Handling
```typescript
// Form Error State Management
interface FormError {
  field?: string
  message: string
  code: string
}

const useFormErrors = () => {
  const [errors, setErrors] = useState<FormError[]>([])

  const addError = (field: string, message: string, code: string) => {
    setErrors(prev => [...prev.filter(e => e.field !== field), { field, message, code }])
  }

  const clearError = (field: string) => {
    setErrors(prev => prev.filter(e => e.field !== field))
  }

  const clearAllErrors = () => setErrors([])

  return { errors, addError, clearError, clearAllErrors }
}

// Field-Level Error Display
const FormField = ({ name, error, children }) => (
  <div className="space-y-2">
    {children}
    {error && (
      <div className="text-red-600 text-sm flex items-center space-x-1">
        <AlertCircle size={16} />
        <span>{error.message}</span>
      </div>
    )}
  </div>
)
```

### Loading and Error States
```typescript
// Unified Loading/Error State Hook
const useAsyncOperation = <T>() => {
  const [state, setState] = useState<{
    data: T | null
    loading: boolean
    error: ApiError | null
  }>({ data: null, loading: false, error: null })

  const execute = async (operation: () => Promise<T>) => {
    setState({ data: null, loading: true, error: null })
    
    try {
      const result = await operation()
      setState({ data: result, loading: false, error: null })
      return result
    } catch (error) {
      const apiError = error instanceof ApiError ? error : new ApiError(
        500, 
        'UNKNOWN_ERROR', 
        'An unexpected error occurred'
      )
      setState({ data: null, loading: false, error: apiError })
      throw apiError
    }
  }

  return { ...state, execute }
}
```

## Backend Error Handling

### API Route Error Handler
```typescript
// Centralized API Route Error Handler
export function withErrorHandler<T extends NextRequest>(
  handler: (req: T, context: any) => Promise<Response>
) {
  return async (req: T, context: any): Promise<Response> => {
    try {
      return await handler(req, context)
    } catch (error) {
      console.error(`API Error in ${req.url}:`, error)
      
      if (error instanceof ValidationError) {
        return NextResponse.json(
          { 
            error: 'Validation Error',
            message: error.message,
            code: 'VALIDATION_ERROR',
            details: error.details
          },
          { status: 400 }
        )
      }
      
      if (error instanceof AuthenticationError) {
        return NextResponse.json(
          { 
            error: 'Authentication Required',
            message: 'Please log in to access this resource',
            code: 'AUTH_REQUIRED'
          },
          { status: 401 }
        )
      }
      
      if (error instanceof AuthorizationError) {
        return NextResponse.json(
          { 
            error: 'Access Denied',
            message: 'You do not have permission to perform this action',
            code: 'ACCESS_DENIED'
          },
          { status: 403 }
        )
      }
      
      // Unknown errors
      return NextResponse.json(
        { 
          error: 'Internal Server Error',
          message: 'An unexpected error occurred. Please try again.',
          code: 'INTERNAL_ERROR'
        },
        { status: 500 }
      )
    }
  }
}
```

### Database Error Handling
```typescript
// Database Operation with Error Handling
export async function createReferral(data: ReferralData) {
  try {
    const { data: referral, error } = await supabase
      .from('referrals')
      .insert(data)
      .select()
      .single()

    if (error) {
      // Handle specific Postgres errors
      if (error.code === '23505') { // Unique violation
        throw new ValidationError(
          'You have already referred a candidate for this position',
          'DUPLICATE_REFERRAL'
        )
      }
      
      if (error.code === '23503') { // Foreign key violation
        throw new ValidationError(
          'Invalid job or user reference',
          'INVALID_REFERENCE'
        )
      }
      
      // Generic database error
      throw new DatabaseError(
        'Unable to create referral',
        'DATABASE_ERROR',
        error
      )
    }

    return referral
  } catch (error) {
    // Re-throw known errors
    if (error instanceof ValidationError || error instanceof DatabaseError) {
      throw error
    }
    
    // Log and wrap unexpected errors
    console.error('Unexpected database error:', error)
    throw new DatabaseError(
      'An unexpected database error occurred',
      'UNKNOWN_DATABASE_ERROR',
      error
    )
  }
}
```

### Authentication Error Handling
```typescript
// Authentication Middleware with Error Handling
export async function requireAuth(
  req: NextRequest,
  requiredRole?: UserRole
): Promise<User> {
  try {
    const token = req.headers.get('authorization')?.replace('Bearer ', '')
    
    if (!token) {
      throw new AuthenticationError('No authentication token provided')
    }

    const { data: user, error } = await supabase.auth.getUser(token)
    
    if (error || !user) {
      throw new AuthenticationError('Invalid or expired token')
    }

    if (requiredRole && user.user_metadata.role !== requiredRole) {
      throw new AuthorizationError(
        `Access denied. Required role: ${requiredRole}`
      )
    }

    return user as User
  } catch (error) {
    if (error instanceof AuthenticationError || error instanceof AuthorizationError) {
      throw error
    }
    
    console.error('Authentication error:', error)
    throw new AuthenticationError('Authentication failed')
  }
}
```

## Business Logic Error Handling

### Subscription Validation
```typescript
// Subscription Access Validation
export function validateSubscriptionAccess(
  userSubscription: Subscription,
  requiredTier: SubscriptionTier
): void {
  if (!userSubscription.active) {
    throw new SubscriptionError(
      'Your subscription is not active. Please update your billing information.',
      'SUBSCRIPTION_INACTIVE'
    )
  }

  if (userSubscription.tier_level < TIER_LEVELS[requiredTier]) {
    throw new SubscriptionError(
      `This feature requires ${requiredTier} tier subscription or higher.`,
      'SUBSCRIPTION_TIER_INSUFFICIENT',
      { 
        current: userSubscription.tier,
        required: requiredTier,
        upgradeUrl: '/subscription/upgrade'
      }
    )
  }

  if (userSubscription.expires_at < new Date()) {
    throw new SubscriptionError(
      'Your subscription has expired. Please renew to continue access.',
      'SUBSCRIPTION_EXPIRED',
      { renewUrl: '/subscription/renew' }
    )
  }
}
```

### Payment Processing Errors
```typescript
// Payment Error Handling
export async function processReferralFee(
  referralId: string,
  feeAmount: number
): Promise<PaymentResult> {
  try {
    const payment = await stripe.paymentIntents.create({
      amount: feeAmount,
      currency: 'usd',
      metadata: { referralId }
    })

    return { success: true, paymentId: payment.id }
  } catch (error) {
    if (error instanceof Stripe.errors.StripeCardError) {
      throw new PaymentError(
        'Payment failed: ' + error.message,
        'CARD_ERROR',
        { decline_code: error.decline_code }
      )
    }
    
    if (error instanceof Stripe.errors.StripeInvalidRequestError) {
      throw new PaymentError(
        'Invalid payment request',
        'INVALID_PAYMENT_REQUEST',
        error
      )
    }
    
    console.error('Payment processing error:', error)
    throw new PaymentError(
      'Payment processing failed. Please try again.',
      'PAYMENT_PROCESSING_ERROR'
    )
  }
}
```

## Error Monitoring and Logging

### Error Logging Service
```typescript
// Error Logging with Context
interface ErrorContext {
  userId?: string
  userRole?: UserRole
  feature?: string
  action?: string
  metadata?: Record<string, any>
}

export function logError(
  error: Error,
  context: ErrorContext = {}
): void {
  const errorLog = {
    timestamp: new Date().toISOString(),
    message: error.message,
    stack: error.stack,
    name: error.name,
    ...context,
    environment: process.env.NODE_ENV,
    version: process.env.npm_package_version
  }

  // Send to monitoring service (e.g., Sentry, LogRocket)
  if (process.env.NODE_ENV === 'production') {
    // Sentry.captureException(error, { contexts: { custom: context } })
    console.error('Error logged:', errorLog)
  } else {
    console.error('Development Error:', errorLog)
  }
}
```

### User-Facing Error Messages
```typescript
// Error Message Mapping for Professional Communication
const ERROR_MESSAGES: Record<string, string> = {
  NETWORK_ERROR: 'Unable to connect to our servers. Please check your internet connection and try again.',
  VALIDATION_ERROR: 'Please check the information you entered and correct any errors.',
  AUTH_REQUIRED: 'Please sign in to continue.',
  ACCESS_DENIED: 'You do not have permission to access this feature.',
  SUBSCRIPTION_INACTIVE: 'Your subscription is not active. Please contact support or update your billing information.',
  DUPLICATE_REFERRAL: 'You have already submitted a referral for this position.',
  FILE_TOO_LARGE: 'The file you selected is too large. Please select a file under 10MB.',
  INVALID_FILE_TYPE: 'Please upload a PDF, DOC, or DOCX file.',
  RATE_LIMIT_EXCEEDED: 'Too many requests. Please wait a moment before trying again.',
  MAINTENANCE_MODE: 'Refer-ify is temporarily unavailable for maintenance. We\'ll be back shortly.'
}

export function getUserFriendlyMessage(errorCode: string): string {
  return ERROR_MESSAGES[errorCode] || 'An unexpected error occurred. Please try again or contact support if the problem persists.'
}
```

## Error Recovery Strategies

### Retry Logic
```typescript
// Automatic Retry for Transient Errors
export async function withRetry<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> {
  let lastError: Error
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation()
    } catch (error) {
      lastError = error as Error
      
      // Don't retry for certain error types
      if (error instanceof ValidationError || 
          error instanceof AuthenticationError ||
          error instanceof AuthorizationError) {
        throw error
      }
      
      if (attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, delay * attempt))
      }
    }
  }
  
  throw lastError!
}
```

### Graceful Degradation
```typescript
// Feature Degradation Strategy
export function withGracefulDegradation<T>(
  primaryOperation: () => Promise<T>,
  fallbackOperation: () => Promise<T> | T,
  errorMessage?: string
) {
  return async (): Promise<T> => {
    try {
      return await primaryOperation()
    } catch (error) {
      logError(error as Error, { feature: 'graceful_degradation' })
      
      if (errorMessage) {
        // Show user-friendly message while using fallback
        toast.warning(errorMessage)
      }
      
      return await fallbackOperation()
    }
  }
}