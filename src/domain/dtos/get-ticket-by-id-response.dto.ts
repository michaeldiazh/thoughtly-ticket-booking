/**
 * DTOs for GET /tickets/:id endpoint
 */

import { BaseEventFields, VenueDetailResponse } from './common.dto';

/**
 * Event information with nested venue details
 */
export interface EventDetailResponse extends BaseEventFields {
  venue: VenueDetailResponse;
}

/**
 * Ticket detail information with nested event
 */
export interface TicketDetailResponse {
  id: number;
  eventId: number;
  tierCode: string;
  tierDisplayName: string;
  capacity: number;
  remaining: number;
  price: number;
  createdAt: string; // ISO 8601 format
  lastUpdated: string; // ISO 8601 format
  event: EventDetailResponse;
}
