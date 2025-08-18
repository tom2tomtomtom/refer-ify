# Refer-ify Tech Stack

> Created: August 18, 2025
> Environment: Development → Production Ready
> Version: Next.js 15 + Supabase Architecture

## Frontend Architecture

### Core Framework
- **Next.js 15.4.6** - React framework with App Router
- **React 19.1.0** - Latest React with concurrent features
- **TypeScript 5.x** - Type safety and developer experience

### Styling & UI
- **Tailwind CSS 4.x** - Utility-first CSS framework
- **Shadcn/ui Components** - High-quality component library
- **Radix UI Primitives** - Accessible component foundation
- **Lucide React Icons** - Beautiful icon system
- **Next Themes** - Dark/light mode support

### Key Frontend Dependencies
```json
{
  "next": "15.4.6",
  "react": "19.1.0", 
  "typescript": "^5",
  "tailwindcss": "^4",
  "@radix-ui/react-*": "^1.x-2.x",
  "class-variance-authority": "^0.7.1",
  "clsx": "^2.1.1",
  "tailwind-merge": "^3.3.1"
}
```

## Backend Architecture

### API Layer
- **Next.js API Routes** - Serverless API endpoints
- **TypeScript** - Full type safety on backend
- **Middleware** - Authentication and request validation

### Database & Backend Services
- **Supabase** - Backend-as-a-Service platform
  - **PostgreSQL** - Primary database with RLS policies
  - **Supabase Auth** - Authentication and user management
  - **Supabase Storage** - File storage for resumes/profiles
  - **Real-time Subscriptions** - Live updates for job feed
  - **Row Level Security** - Multi-tenant data isolation

### Authentication
- **Supabase Auth** - Primary authentication provider
- **LinkedIn OAuth** - Professional network integration
- **Email Magic Links** - Passwordless authentication
- **Multi-Role System** - Founding/Select/Client/Candidate roles

## Payment & AI Integration

### Payment Processing
- **Stripe** - Payment processing and subscriptions
- **Stripe Connect** - Marketplace fee distribution
- **Multi-Currency Support** - Global payment handling

### AI & Machine Learning
- **OpenAI GPT-4** - Resume analysis and matching
- **Vector Embeddings** - Semantic job-candidate matching
- **AI-Enhanced Recommendations** - Smart referral suggestions

## Testing Infrastructure

### Testing Framework
- **Jest 30.x** - Unit and integration testing
- **React Testing Library 16.x** - Component testing
- **Playwright 1.54.x** - End-to-end testing
- **MSW (Mock Service Worker) 2.x** - API mocking

### Testing Coverage
- **Unit Tests** - Components, utilities, API routes
- **Integration Tests** - Complete user flows
- **E2E Tests** - Critical business processes
- **Coverage Reporting** - 80-90% coverage requirements

### CI/CD Pipeline
```yaml
# Testing Commands
"test": "jest",
"test:e2e": "playwright test", 
"test:coverage": "jest --coverage",
"test:all": "npm run test:ci && npm run test:e2e"
```

## Development Tools

### Code Quality
- **ESLint** - Code linting and standards
- **TypeScript** - Static type checking
- **Prettier** - Code formatting (integrated)
- **Husky** - Git hooks for quality gates

### Development Experience
- **Next.js Turbopack** - Fast development builds
- **Hot Module Replacement** - Instant development feedback
- **TypeScript Language Server** - IDE integration
- **Autocomplete & IntelliSense** - Full type awareness

## Infrastructure & Deployment

### Hosting
- **Vercel** - Next.js optimized hosting platform
- **Edge Runtime** - Global edge deployment
- **Serverless Functions** - Auto-scaling API routes

### Database Hosting
- **Supabase Cloud** - Managed PostgreSQL
- **Connection Pooling** - Optimized database connections
- **Automatic Backups** - Data protection and recovery

### Monitoring & Performance
- **Vercel Analytics** - Web Vitals and performance metrics
- **Lighthouse CI** - Automated performance auditing
- **Error Tracking** - Production error monitoring

## Security

### Authentication Security
- **Row Level Security (RLS)** - Database-level access control
- **JWT Tokens** - Secure session management
- **OAuth 2.0** - Industry standard authentication
- **CSRF Protection** - Cross-site request forgery prevention

### Data Security
- **HTTPS Everywhere** - End-to-end encryption
- **Environment Variables** - Secure configuration management
- **SQL Injection Prevention** - Parameterized queries
- **Data Validation** - Input sanitization and validation

## Performance Optimizations

### Frontend Performance
- **Code Splitting** - Automatic bundle optimization
- **Image Optimization** - Next.js Image component
- **Static Generation** - Pre-rendered marketing pages
- **Edge Caching** - Global content distribution

### Backend Performance
- **Database Indexing** - Optimized query performance
- **Connection Pooling** - Efficient database connections
- **API Response Caching** - Reduced server load
- **Real-time Optimization** - Efficient WebSocket usage

## Development Environment

### Local Development
```bash
# Development server with Turbopack
npm run dev

# Testing commands
npm run test:watch
npm run test:e2e:ui

# Build and production preview
npm run build
npm run start
```

### Required Environment Variables
```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Stripe Configuration  
STRIPE_SECRET_KEY=sk_test_or_live_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_or_live_key

# OpenAI Integration
OPENAI_API_KEY=your_openai_key
```

## Scalability Considerations

### Current Capacity
- **Concurrent Users:** 10,000+ (Vercel + Supabase scaling)
- **Database:** PostgreSQL with automatic scaling
- **File Storage:** Unlimited with Supabase Storage
- **API Requests:** Serverless auto-scaling

### Future Scaling Plans
- **CDN Integration** - Global asset distribution
- **Database Sharding** - Multi-region data distribution  
- **Microservices Migration** - Service-oriented architecture
- **Caching Layers** - Redis for high-frequency data