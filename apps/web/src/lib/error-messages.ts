/**
 * User-Friendly Error Messages
 * 
 * Centralizes error message formatting to provide consistent, helpful
 * error messages throughout the application. Maps technical errors
 * to user-friendly explanations with actionable guidance.
 */

export interface ErrorContext {
  action?: string;
  details?: string;
  code?: string;
}

/**
 * Common error types and their user-friendly messages
 */
export const ERROR_MESSAGES = {
  // Network and API errors
  NETWORK_ERROR: {
    title: "Connection Problem",
    message: "We're having trouble connecting to our servers. Please check your internet connection and try again.",
    action: "Retry in a few moments"
  },
  
  API_ERROR: {
    title: "Service Unavailable", 
    message: "Our service is temporarily unavailable. We're working to fix this quickly.",
    action: "Please try again in a few minutes"
  },

  TIMEOUT_ERROR: {
    title: "Request Timed Out",
    message: "The request is taking longer than expected. This might be due to a slow connection.",
    action: "Try again with a stable internet connection"
  },

  // Authentication errors
  AUTH_REQUIRED: {
    title: "Sign In Required",
    message: "You need to be signed in to access this feature.",
    action: "Please sign in to continue"
  },

  SESSION_EXPIRED: {
    title: "Session Expired",
    message: "Your session has expired for security reasons.",
    action: "Please sign in again to continue"
  },

  UNAUTHORIZED: {
    title: "Access Denied",
    message: "You don't have permission to perform this action.",
    action: "Contact support if you believe this is an error"
  },

  // Data validation errors
  VALIDATION_ERROR: {
    title: "Invalid Information",
    message: "Some of the information you entered isn't valid. Please check and try again.",
    action: "Review the highlighted fields"
  },

  REQUIRED_FIELDS: {
    title: "Missing Information",
    message: "Please fill in all required fields to continue.",
    action: "Complete all fields marked with *"
  },

  FILE_TOO_LARGE: {
    title: "File Too Large",
    message: "File too large. Max 5MB",
    action: "Choose a file under 5MB"
  },

  INVALID_FILE_TYPE: {
    title: "Invalid File Type",
    message: "Invalid file type. Upload PDF, DOC or DOCX",
    action: "Supported formats: PDF, DOC, DOCX"
  },

  // Job posting errors
  JOB_CREATE_FAILED: {
    title: "Job Posting Failed",
    message: "We couldn't create your job posting right now. Your information has been saved as a draft.",
    action: "Try publishing again or contact support"
  },

  PAYMENT_FAILED: {
    title: "Payment Issue",
    message: "There was a problem processing your payment. No charge has been made.",
    action: "Please check your payment method and try again"
  },

  JOB_UPDATE_FAILED: {
    title: "Update Failed", 
    message: "We couldn't save your changes right now.",
    action: "Your changes are preserved - try saving again"
  },

  // Referral errors
  REFERRAL_SUBMIT_FAILED: {
    title: "Referral Not Submitted",
    message: "We couldn't submit your referral at the moment. Don't worry, your information is saved.",
    action: "Try submitting again in a few minutes"
  },

  DUPLICATE_REFERRAL: {
    title: "Already Referred",
    message: "This candidate has already been referred for this position.",
    action: "Check your referrals dashboard for updates"
  },

  INVALID_EMAIL: {
    title: "Invalid Email",
    message: "The email address you entered doesn't look right. Please check and try again.",
    action: "Use format: name@example.com"
  },

  // AI service errors
  AI_SERVICE_ERROR: {
    title: "AI Analysis Unavailable",
    message: "Our AI matching service is temporarily unavailable. You can still submit referrals normally.",
    action: "AI features will return shortly"
  },

  SUGGESTIONS_FAILED: {
    title: "Suggestions Unavailable",
    message: "We couldn't generate candidate suggestions right now.",
    action: "Try refreshing or check back later"
  },

  // Database errors
  DATABASE_ERROR: {
    title: "Data Issue",
    message: "We're having trouble accessing your data. This is usually temporary.",
    action: "Please try again in a moment"
  },

  NOT_FOUND: {
    title: "Not Found",
    message: "We couldn't find what you're looking for. It might have been moved or deleted.",
    action: "Check the URL or go back to the previous page"
  },

  // Generic fallback
  UNKNOWN_ERROR: {
    title: "Something Went Wrong",
    message: "An unexpected error occurred. We've been notified and are working on a fix.",
    action: "Please try again or contact support if the problem persists"
  }
} as const;

/**
 * Get a user-friendly error message from a technical error
 */
export function getUserFriendlyError(
  error: Error | string | unknown,
  context?: ErrorContext
): { title: string; message: string; action?: string } {
  const errorString = error instanceof Error ? error.message : String(error);
  const lowerError = errorString.toLowerCase();

  // Match specific error patterns to user-friendly messages
  if (lowerError.includes('network') || lowerError.includes('fetch')) {
    return ERROR_MESSAGES.NETWORK_ERROR;
  }

  if (lowerError.includes('timeout')) {
    return ERROR_MESSAGES.TIMEOUT_ERROR;
  }

  if (lowerError.includes('unauthorized') || lowerError.includes('401')) {
    return ERROR_MESSAGES.UNAUTHORIZED;
  }

  if (lowerError.includes('session') || lowerError.includes('auth')) {
    return ERROR_MESSAGES.SESSION_EXPIRED;
  }

  if (lowerError.includes('validation') || lowerError.includes('invalid')) {
    return ERROR_MESSAGES.VALIDATION_ERROR;
  }

  if (lowerError.includes('file too large') || lowerError.includes('5mb')) {
    return ERROR_MESSAGES.FILE_TOO_LARGE;
  }

  if (lowerError.includes('payment')) {
    return ERROR_MESSAGES.PAYMENT_FAILED;
  }

  if (lowerError.includes('not found') || lowerError.includes('404')) {
    return ERROR_MESSAGES.NOT_FOUND;
  }

  // Context-specific errors
  if (context?.action) {
    switch (context.action) {
      case 'job_create':
        return ERROR_MESSAGES.JOB_CREATE_FAILED;
      case 'referral_submit':
        return ERROR_MESSAGES.REFERRAL_SUBMIT_FAILED;
      case 'ai_suggestions':
        return ERROR_MESSAGES.SUGGESTIONS_FAILED;
      case 'database_query':
        return ERROR_MESSAGES.DATABASE_ERROR;
    }
  }

  // Fallback to generic error
  return ERROR_MESSAGES.UNKNOWN_ERROR;
}

/**
 * Format error for toast notifications
 */
export function formatErrorForToast(error: Error | string | unknown, context?: ErrorContext): string {
  const friendlyError = getUserFriendlyError(error, context);
  return `${friendlyError.title}: ${friendlyError.message}`;
}

/**
 * Get detailed error information for debugging
 */
export function getErrorDetails(error: Error | string | unknown): {
  userMessage: string;
  technicalDetails: string;
  timestamp: string;
} {
  const friendlyError = getUserFriendlyError(error);
  const technicalDetails = error instanceof Error ? error.stack || error.message : String(error);

  return {
    userMessage: `${friendlyError.title}: ${friendlyError.message}`,
    technicalDetails,
    timestamp: new Date().toISOString()
  };
}