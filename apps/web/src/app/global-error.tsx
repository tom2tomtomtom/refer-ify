'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error for debugging
    console.error('Global application error:', error);
    
    // Report to monitoring service in production
    if (process.env.NODE_ENV === 'production') {
      // This is where you'd send to your error monitoring service
      // e.g., Sentry, LogRocket, etc.
    }
  }, [error]);

  return (
    <html>
      <body>
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="max-w-md w-full text-center space-y-4">
            <div className="bg-white shadow-lg rounded-lg p-8">
              <div className="text-red-600 mb-4">
                <svg
                  className="mx-auto h-12 w-12"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Application Error
              </h2>
              <p className="text-gray-600 mb-4">
                Something went wrong with the application. Please try refreshing the page.
              </p>
              <div className="space-y-2">
                <Button onClick={reset} className="w-full">
                  Try again
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => window.location.href = '/'} 
                  className="w-full"
                >
                  Go home
                </Button>
              </div>
              {process.env.NODE_ENV === 'development' && (
                <details className="mt-4 text-xs text-left">
                  <summary className="cursor-pointer text-gray-500">
                    Error Details (dev only)
                  </summary>
                  <pre className="mt-2 p-2 bg-gray-100 rounded text-red-600 overflow-auto text-[10px]">
                    {error.message}
                    {error.stack && `\n\nStack trace:\n${error.stack}`}
                    {error.digest && `\nDigest: ${error.digest}`}
                  </pre>
                </details>
              )}
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}