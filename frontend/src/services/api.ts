/**
 * API Service
 * Handles all HTTP requests to the backend
 */

import type { GetEventsQuery, Event } from '../types/event';

export interface ApiResponse<T> {
  status: 'OK' | 'ERROR';
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  perPage: number;
  offset: number;
  total: number;
}

const API_BASE_URL = 'http://localhost:3000/api/v1';

/**
 * Builds query string from parameters object
 * @param params - Object with query parameters
 * @returns URLSearchParams object
 */
function buildQueryParams(params?: Record<string, string | number | undefined>): URLSearchParams {
  const queryParams = new URLSearchParams();
  
  if (!params) {
    return queryParams;
  }

  try {
    Object.keys(params).forEach((key) => {
      const value = params[key];
      if (value !== undefined && value !== null) {
        queryParams.append(key, value.toString());
      }
    });
  } catch (error) {
    console.error('Error building query params:', error);
    throw new Error('Failed to build query parameters');
  }

  return queryParams;
}

/**
 * Get all events with optional filtering
 */
export async function getEvents(params?: Partial<GetEventsQuery>): Promise<PaginatedResponse<any>> {
  const queryParams = buildQueryParams(params);
  const queryString = queryParams.toString();
  const url = `${API_BASE_URL}/event${queryString ? `?${queryString}` : ''}`;
  
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
}

/**
 * Get a single event by ID with complete details
 */
export async function getEventById(id: number): Promise<ApiResponse<Event>> {
  const url = `${API_BASE_URL}/event/${id}`;
  
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
}
