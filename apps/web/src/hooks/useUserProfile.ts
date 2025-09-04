import { useEffect, useState } from 'react';
import { useSupabaseQuery } from './useSupabaseQuery';

interface UserProfile {
  id: string;
  role: 'select_circle' | 'founding_circle' | 'client';
  first_name?: string;
  last_name?: string;
  email?: string;
  company?: string;
}

/**
 * Custom hook for fetching and managing user profile data
 * 
 * @param userId - The user ID to fetch profile for
 * @returns Object with profile data, loading state, and error
 */
export function useUserProfile(userId?: string) {
  const [profile, setProfile] = useState<UserProfile | null>(null);

  const { data, loading, error } = useSupabaseQuery(
    async (supabase) => {
      if (!userId) {
        return { data: null, error: null };
      }

      return await supabase
        .from('profiles')
        .select('id, role, first_name, last_name, email, company')
        .eq('id', userId)
        .single();
    },
    {
      immediate: !!userId,
      dependencies: [userId]
    }
  );

  useEffect(() => {
    if (data) {
      setProfile(data);
    }
  }, [data]);

  return {
    profile,
    loading,
    error,
    isSelectCircle: profile?.role === 'select_circle',
    isFoundingCircle: profile?.role === 'founding_circle',
    isClient: profile?.role === 'client',
  };
}