/**
 * DTOs for GET /tickets endpoint
 */

/**
 * Simplified ticket information for listing
 */
export interface SimplifiedTicket {
  id: number;
  eventName: string;
  tierDisplayName: string;
  remaining: number;
  price: number;
  venueName: string;
  venueCity: string;
  venueCountryCode: string;
  eventStartTime: string; // ISO 8601 format
}
