/**
 * DTOs for GET /tickets endpoint
 */

import { VenueResponse } from './common.dto';

/**
 * Individual ticket information
 */
export interface TicketResponse {
  id: number;
  eventId: number;
  eventName: string;
  tierCode: string;
  tierDisplayName: string;
  capacity: number;
  remaining: number;
  price: number;
  venue: VenueResponse;
  eventStartTime: string; // ISO 8601 format
  eventEndTime: string; // ISO 8601 format
}

