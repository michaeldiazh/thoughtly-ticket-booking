/**
 * Generic API Response Types
 * 
 * Provides type-safe response structures for all API endpoints
 */

/**
 * Base error/exception structure
 */
export interface Exception {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

/**
 * Error response structure
 */
export interface ErrorResponse<E extends Exception> {
  status: 'ERROR';
  error: E;
}

/**
 * Paginated data structure for list responses
 * Helper type for internal use
 */
export interface PaginatedData<T> {
  data: T[];
  perPage: number;
  offset: number;
  total: number;
}

/**
 * Paginated success response with status OK
 * Has data, perPage, offset, and total at the same level as status
 */
export interface SucceededPaginatedResponse<T> {
  status: 'OK';
  data: T[];
  perPage: number;
  offset: number;
  total: number;
}

/**
 * Single data success response with status OK
 */
export interface SucceededSingleResponse<T> {
  status: 'OK';
  data: T;
}

/**
 * Success response structure
 * Union of paginated and single data responses
 */
export type SucceededResponse<T> =
  | SucceededPaginatedResponse<T>
  | SucceededSingleResponse<T>;

/**
 * Generic API Response type
 * 
 * Discriminated union that ensures type safety:
 * - If status is 'OK', returns SucceededResponse<T>
 * - If status is 'ERROR', returns ErrorResponse<E>
 * - Otherwise never
 */
export type APIResponse<T, E extends Exception = Exception> =
  | SucceededResponse<T>
  | ErrorResponse<E>;

