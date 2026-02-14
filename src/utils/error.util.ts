/**
 * Error handling utilities for safe operation execution
 */

/**
 * Result type for safe operations
 */
export type SafeResult<T> =
  | { success: true; data: T }
  | { success: false; error: Error }

/**
 * Safely executes a function and returns result or error
 * @param fn - Function to execute
 * @param errorMessage - Optional custom error message
 * @returns Safe result with data or error
 */
export function tryCatch<T>(
  fn: () => T,
  errorMessage?: string,
): SafeResult<T> {
  try {
    const data = fn()
    return { success: true, data }
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err))
    if (errorMessage) {
      error.message = `${errorMessage}: ${error.message}`
    }
    console.error('Error caught:', error)
    return { success: false, error }
  }
}

/**
 * Safely executes an async function and returns result or error
 * @param fn - Async function to execute
 * @param errorMessage - Optional custom error message
 * @returns Promise with safe result containing data or error
 */
export async function tryCatchAsync<T>(
  fn: () => Promise<T>,
  errorMessage?: string,
): Promise<SafeResult<T>> {
  try {
    const data = await fn()
    return { success: true, data }
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err))
    if (errorMessage) {
      error.message = `${errorMessage}: ${error.message}`
    }
    console.error('Async error caught:', error)
    return { success: false, error }
  }
}

/**
 * Safely accesses localStorage with fallback
 * @param key - Storage key
 * @param fallback - Fallback value if operation fails
 * @returns Value from storage or fallback
 */
export function safeLocalStorageGet(key: string, fallback: string | null = null): string | null {
  const result = tryCatch(() => localStorage.getItem(key), 'localStorage.getItem failed')
  return result.success ? result.data : fallback
}

/**
 * Safely sets localStorage with error handling
 * @param key - Storage key
 * @param value - Value to store
 * @returns True if successful
 */
export function safeLocalStorageSet(key: string, value: string): boolean {
  const result = tryCatch(() => {
    localStorage.setItem(key, value)
    return true
  }, 'localStorage.setItem failed')
  return result.success
}

/**
 * Safely removes from localStorage with error handling
 * @param key - Storage key
 * @returns True if successful
 */
export function safeLocalStorageRemove(key: string): boolean {
  const result = tryCatch(() => {
    localStorage.removeItem(key)
    return true
  }, 'localStorage.removeItem failed')
  return result.success
}

/**
 * Safely parses JSON with fallback
 * @param json - JSON string to parse
 * @param fallback - Fallback value if parsing fails
 * @returns Parsed data or fallback
 */
export function safeJSONParse<T>(json: string, fallback: T): T {
  const result = tryCatch<T>(() => JSON.parse(json), 'JSON.parse failed')
  return result.success ? result.data : fallback
}

/**
 * Safely stringifies JSON with fallback
 * @param data - Data to stringify
 * @param fallback - Fallback string if stringification fails
 * @returns JSON string or fallback
 */
export function safeJSONStringify(data: unknown, fallback: string = '{}'): string {
  const result = tryCatch(() => JSON.stringify(data), 'JSON.stringify failed')
  return result.success ? result.data : fallback
}
