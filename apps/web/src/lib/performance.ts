// Performance optimization utilities

// Reduce timeouts in production for faster failure detection
export const NETWORK_TIMEOUT = process.env.NODE_ENV === 'production' ? 8000 : 10000;
export const DB_TIMEOUT = process.env.NODE_ENV === 'production' ? 3000 : 5000;

// Wrap database calls with timeout to prevent hanging
export async function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number = DB_TIMEOUT,
  errorMessage?: string
): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(
        () => reject(new Error(errorMessage || `Operation timed out after ${timeoutMs}ms`)),
        timeoutMs
      )
    ),
  ]);
}

// Optimize Supabase client connections
export function optimizeSupabaseClient<T>(client: T): T {
  // Set shorter timeout for database operations
  if (client && typeof client === 'object' && 'rest' in client && client.rest) {
    (client as any).rest.timeout = DB_TIMEOUT;
  }
  
  // Configure realtime connection limits
  if (client && typeof client === 'object' && 'realtime' in client && client.realtime) {
    (client as any).realtime.timeout = NETWORK_TIMEOUT;
    (client as any).realtime.heartbeatIntervalMs = 30000;
    (client as any).realtime.reconnectAfterMs = () => 5000;
  }
  
  return client;
}

// Performance monitoring helper
export function measurePerformance<T>(
  operation: () => Promise<T>,
  operationName: string
): Promise<T> {
  const startTime = performance.now();
  
  return operation()
    .then((result) => {
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      if (duration > 1000) {
        console.warn(`⚠️ Slow operation ${operationName}: ${duration.toFixed(2)}ms`);
      }
      
      return result;
    })
    .catch((error) => {
      const endTime = performance.now();
      const duration = endTime - startTime;
      console.error(`❌ Failed operation ${operationName} after ${duration.toFixed(2)}ms:`, error);
      throw error;
    });
}

// Network request optimization
export const fetchWithTimeout = (
  url: string,
  options: RequestInit = {},
  timeout = NETWORK_TIMEOUT
): Promise<Response> => {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  
  return fetch(url, {
    ...options,
    signal: controller.signal
  }).finally(() => {
    clearTimeout(id);
  });
};

// Prevent memory leaks in client components
export function useCleanupEffect(cleanup: () => void) {
  if (typeof window !== 'undefined') {
    window.addEventListener('beforeunload', cleanup);
    window.addEventListener('pagehide', cleanup);
    
    return () => {
      window.removeEventListener('beforeunload', cleanup);
      window.removeEventListener('pagehide', cleanup);
    };
  }
  
  return cleanup;
}