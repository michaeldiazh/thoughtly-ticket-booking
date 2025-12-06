import { SucceededPaginatedResponse } from "./types";
/**
 * Common DTOs shared across multiple endpoints
 */

/**
 * Base event fields shared across all event responses
 */
export interface BaseEventFields {
  id: number;
  name: string;
  description: string | null;
  startTime: string; // ISO 8601 format
  endTime: string; // ISO 8601 format
}

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