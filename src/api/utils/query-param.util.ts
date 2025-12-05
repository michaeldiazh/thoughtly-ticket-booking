/**
 * Query Parameter Utilities
 * 
 * Helper functions for processing Express query parameters
 */

/**
 * Stringify Express query parameters to a format suitable for Zod validation
 * Express query params can be strings or arrays, this converts them all to strings or undefined
 * Arrays are joined with commas to support both ?key=1,2,3 and ?key=1&key=2&key=3 formats
 * 
 * @param query - Express query object (can contain strings, arrays, or undefined values)
 * @returns Query object with all values as strings or undefined
 */
export const stringifyQueryParams = (query: unknown): Record<string, string | undefined> =>
  Object.entries(query as Record<string, unknown>).reduce(
    (acc, [key, value]) => {
      if (value === undefined || value === null) {
        acc[key] = undefined;
      } else if (Array.isArray(value)) {
        // If it's an array, join with commas (supports ?key=1&key=2&key=3 → '1,2,3')
        acc[key] = value.map(String).join(',');
      } else {
        acc[key] = String(value);
      }
      return acc;
    },
    {} as Record<string, string | undefined>
  );
