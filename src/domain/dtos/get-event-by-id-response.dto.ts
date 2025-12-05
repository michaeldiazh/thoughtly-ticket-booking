/**
 * DTOs for GET /event/:id endpoint (Event Detail)
 */

import { BaseEventFields, VenueDetailResponse } from './common.dto';

/**
 * Tier availability information
 */
export interface TierAvailability {
  ticketId: number;
  remaining: number;
  capacity: number;
}

/**
 * Event information with tier availability
 */
export interface EventDetailWithTiersResponse extends BaseEventFields {
  venue: VenueDetailResponse;
  tiers: Record<string, TierAvailability>; // Key is tier code (e.g., "VIP", "FRONT_ROW", "GA")
}

