/**
 * Simplified Event DTO
 * 
 * Base event fields shared across all event responses
 */

/**
 * Simplified event information
 */
export interface SimplifiedEvent {
  id: number;
  name: string;
  description: string | null;
  startTime: string; // ISO 8601 format
  endTime: string; // ISO 8601 format
}

/**
 * Event list item with venue information
 * Used for GET /api/v1/event endpoint
 */
export interface EventListItem extends SimplifiedEvent {
  venueName: string;
  venueCity: string;
  venueCountryCode: string;
}
