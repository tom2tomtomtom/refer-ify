import { useState, useEffect, useCallback } from 'react';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import { formatErrorForToast } from '@/lib/error-messages';

interface UseSupabaseQueryOptions {
  /**
   * Whether to execute the query immediately on mount
   */
  immediate?: boolean;
  /**
   * Dependencies that trigger a refetch when changed
   */
  dependencies?: any[];
}

/**
 * Custom hook for Supabase queries with loading states and error handling
 * 
 * @param queryFn - Function that returns a Supabase query
 * @param options - Configuration options
 * @returns Object with data, loading state, error, and refetch function
 */
export function useSupabaseQuery<T = any>(
  queryFn: (supabase: ReturnType<typeof getSupabaseBrowserClient>) => Promise<{ data: T | null; error: any }>,
  options: UseSupabaseQueryOptions = {}
) {
  const { immediate = true, dependencies = [] } = options;
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(immediate);
  const [error, setError] = useState<string | null>(null);

  const supabase = getSupabaseBrowserClient();

  const execute = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await queryFn(supabase);
      
      if (result.error) {
        throw new Error(result.error.message || 'Database query failed');
      }
      
      setData(result.data);
      return result.data;
    } catch (err) {
      const errorMessage = formatErrorForToast(err, { action: 'database_query' });
      setError(errorMessage);
      console.error('Supabase query error:', err);
    } finally {
      setLoading(false);
    }
  }, [queryFn, supabase]);

  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, [execute, ...dependencies]);

  const refetch = useCallback(() => {
    return execute();
  }, [execute]);

  return {
    data,
    loading,
    error,
    refetch,
  };
}