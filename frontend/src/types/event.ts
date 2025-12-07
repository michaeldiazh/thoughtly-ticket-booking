/**
 * Event Types
 * Copied from backend event.types.ts
 */

/**
 * SimplifiedEvent - Base event fields
 */
export interface SimplifiedEvent {
  id: number;
  name: string;
  description: string | null;
  startTime: string; // ISO 8601 format
  endTime: string; // ISO 8601 format
}

/**
 * EventListItem - Event with venue information
 */
export interface EventListItem extends SimplifiedEvent {
  venueName: string;
  venueCity: string;
  venueCountryCode: string;
  venueTimezone: string;
}

/**
 * GetEventsQuery - Query parameters for fetching events
 */
export interface GetEventsQuery {
  eventIds?: string;
  eventName?: string;
  eventStartDate?: string;
  eventEndDate?: string;
  venueName?: string;
  venueCountryCode?: string;
  limit?: number;
  offset?: number;
}

/**
 * VenueDetailResponse - Venue information
 */
export interface VenueDetailResponse {
  id: number;
  name: string;
  address: string;
  city: string;
  region: string | null;
  countryCode: string;
  timezone: string;
}

/**
 * TierAvailability - Ticket tier availability information
 */
export interface TierAvailability {
  ticketId: number;
  price: number | string; // Backend may return as string from MySQL DECIMAL
  remaining: number;
  capacity: number;
}

/**
 * Event - Complete event information with venue and tiers
 */
export interface Event extends SimplifiedEvent {
  venue: VenueDetailResponse;
  tiers?: Record<string, TierAvailability>;
}

