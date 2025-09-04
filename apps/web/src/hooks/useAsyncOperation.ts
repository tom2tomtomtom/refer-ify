import { useState, useCallback } from 'react';
import { formatErrorForToast } from '@/lib/error-messages';

/**
 * Custom hook for managing async operations with loading state and error handling
 * 
 * @param asyncFunction - The async function to execute
 * @returns Object with execute function, loading state, error state, and data
 */
export function useAsyncOperation<T = any, P extends any[] = any[]>(
  asyncFunction: (...args: P) => Promise<T>
) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<T | null>(null);

  const execute = useCallback(
    async (...args: P) => {
      try {
        setLoading(true);
        setError(null);
        const result = await asyncFunction(...args);
        setData(result);
        return result;
      } catch (err) {
        const errorMessage = formatErrorForToast(err);
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [asyncFunction]
  );

  const reset = useCallback(() => {
    setLoading(false);
    setError(null);
    setData(null);
  }, []);

  return {
    execute,
    loading,
    error,
    data,
    reset,
  };
}