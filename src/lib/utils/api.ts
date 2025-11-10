// ============================================================================
// src/lib/utils/api.ts - API Helper Functions
// ============================================================================

/**
 * Fetch with retry logic
 */
export async function fetchWithRetry(
  url: string,
  options: RequestInit = {},
  maxRetries = 3,
  retryDelay = 1000
): Promise<Response> {
  let lastError: Error | null = null;

  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch(url, {
        ...options,
        cache: 'no-store',
      });

      // If response is ok, return it
      if (response.ok) {
        return response;
      }

      // For 4xx errors, don't retry (client errors)
      if (response.status >= 400 && response.status < 500) {
        throw new Error(`Client error: ${response.status} ${response.statusText}`);
      }

      // For 5xx errors, retry
      lastError = new Error(`Server error: ${response.status} ${response.statusText}`);
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Unknown error');
      
      // If it's the last retry, throw the error
      if (i === maxRetries - 1) {
        throw lastError;
      }

      // Wait before retrying (exponential backoff)
      await new Promise(resolve => setTimeout(resolve, retryDelay * Math.pow(2, i)));
    }
  }

  throw lastError || new Error('Max retries reached');
}

/**
 * Check bot health status
 */
export async function checkBotHealth(): Promise<{
  status: 'online' | 'offline';
  data?: Record<string, unknown>;  // FIXED: Ganti 'any' dengan 'Record<string, unknown>' untuk type safety
}> {
  try {
    const response = await fetchWithRetry('/api/bot-status', {}, 2, 1000);
    const data = await response.json();
    
    return {
      status: data.status === 'healthy' ? 'online' : 'offline',
      data,
    };
  } catch (error) {
    console.error('Failed to check bot status:', error);
    return { status: 'offline' };
  }
}

/**
 * Safe JSON parse with fallback
 */
export function safeJsonParse<T>(json: string, fallback: T): T {
  try {
    return JSON.parse(json);
  } catch {
    return fallback;
  }
}

/**
 * Format error message for user display
 */
export function formatErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  return 'An unknown error occurred';
}