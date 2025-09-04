"use client";

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error?: Error;
}

/**
 * ErrorBoundary - Catches JavaScript errors in child components
 * 
 * Prevents component crashes from breaking the entire page by providing
 * a fallback UI and error recovery mechanism.
 * 
 * @param children - Components to wrap with error protection
 * @param fallback - Custom fallback UI (optional)
 * @param onError - Error reporting callback (optional)
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    // Call optional error reporting callback
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // In production, you might want to send this to an error reporting service
    if (process.env.NODE_ENV === 'production') {
      // Example: Send to error tracking service
      // errorReportingService.captureException(error, { extra: errorInfo });
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default fallback UI
      return (
        <Card className="border-destructive/50 bg-destructive/5">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-4 w-4" />
              Something went wrong
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-sm text-muted-foreground mb-3">
              This component encountered an error. You can try refreshing or continue using other features.
            </p>
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mt-2 text-xs text-muted-foreground">
                <summary className="cursor-pointer font-medium">Technical Details</summary>
                <pre className="mt-2 p-2 bg-muted rounded overflow-x-auto">
                  {this.state.error.toString()}
                </pre>
              </details>
            )}
            <Button 
              size="sm" 
              variant="outline" 
              onClick={this.handleReset}
              className="mt-2"
            >
              <RefreshCw className="h-3 w-3 mr-1" />
              Try Again
            </Button>
          </CardContent>
        </Card>
      );
    }

    return this.props.children;
  }
}

/**
 * AIErrorFallback - Specialized error fallback for AI components
 * 
 * Provides context-specific messaging for AI-related failures
 */
export function AIErrorFallback({ error, onRetry }: { error?: Error; onRetry?: () => void }) {
  return (
    <Card className="border-orange-200 bg-orange-50">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2 text-orange-700">
          <AlertTriangle className="h-4 w-4" />
          AI Service Temporarily Unavailable
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <p className="text-sm text-orange-600 mb-3">
          The AI matching service is currently experiencing issues. Your other features continue to work normally.
        </p>
        <div className="flex gap-2">
          {onRetry && (
            <Button size="sm" variant="outline" onClick={onRetry}>
              <RefreshCw className="h-3 w-3 mr-1" />
              Retry AI Analysis
            </Button>
          )}
          <Button size="sm" variant="ghost" asChild>
            <a href="/help" target="_blank">Get Help</a>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * withErrorBoundary - Higher-order component for easy error boundary wrapping
 * 
 * @param WrappedComponent - Component to wrap with error protection
 * @param fallback - Optional custom fallback UI
 */
export function withErrorBoundary<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  fallback?: ReactNode
) {
  return function WithErrorBoundaryComponent(props: P) {
    return (
      <ErrorBoundary fallback={fallback}>
        <WrappedComponent {...props} />
      </ErrorBoundary>
    );
  };
}