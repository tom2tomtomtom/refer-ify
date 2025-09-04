import { useEffect, useRef } from 'react';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import type { RealtimeChannel } from '@supabase/supabase-js';

interface UseSupabaseRealtimeOptions {
  /**
   * The channel name for the subscription
   */
  channelName: string;
  /**
   * The table to listen for changes on
   */
  table: string;
  /**
   * The event type to listen for
   */
  event: 'INSERT' | 'UPDATE' | 'DELETE' | '*';
  /**
   * Optional filter for the subscription
   */
  filter?: string;
  /**
   * Callback function when changes occur
   */
  onPayload: (payload: any) => void;
  /**
   * Whether the subscription is enabled
   */
  enabled?: boolean;
}

/**
 * Custom hook for managing Supabase real-time subscriptions
 * 
 * @param options - Configuration options for the subscription
 */
export function useSupabaseRealtime({
  channelName,
  table,
  event,
  filter,
  onPayload,
  enabled = true,
}: UseSupabaseRealtimeOptions) {
  const channelRef = useRef<RealtimeChannel | null>(null);
  const supabase = getSupabaseBrowserClient();

  useEffect(() => {
    if (!enabled) return;

    const channel = supabase.channel(channelName);

    channel.on(
      'postgres_changes' as any,
      {
        event,
        schema: 'public',
        table,
        ...(filter && { filter }),
      },
      onPayload
    );

    channel.subscribe();
    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [channelName, table, event, filter, onPayload, enabled, supabase]);

  const unsubscribe = () => {
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }
  };

  return { unsubscribe };
}