import { ErrorResponse, Exception, SucceededPaginatedResponse, SucceededSingleResponse } from "./types";
/**
 * Common DTOs shared across multiple endpoints
 */

/**
 * Simplified venue information
 */
export interface VenueResponse {
  id: number;
  name: string;
  city: string;
  countryCode: string;
  timezone: string;
}

/**
 * Detailed venue information
 */
export interface VenueDetailResponse extends VenueResponse {
  address: string;
  region: string | null;
}

export const buildSucceededPaginatedResponse = <T>(data: T[], perPage: number, offset: number, total: number): SucceededPaginatedResponse<T> => {
  return {
    status: 'OK',
    data,
    perPage,
    offset,
    total,
  };
}

export const buildSucceededSingleResponse = <T>(data: T): SucceededSingleResponse<T> => {
  return {
    status: 'OK',
    data,
  };
}

export const buildErrorResponse = <E extends Exception>(error: E): ErrorResponse<E> => {
  return {
    status: 'ERROR',
    error,
  };
}