import { setupWorker } from 'msw/browser'
import { handlers } from './handlers'

// Setup MSW worker for browser environment (development/debugging)
export const worker = setupWorker(...handlers)

// Start the worker if in development mode
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  worker.start({
    onUnhandledRequest: 'warn',
    serviceWorker: {
      url: '/mockServiceWorker.js',
    },
  })
}