/**
 * Event DTO
 * 
 * Complete event information with venue and tier availability
 */

import { SimplifiedEvent } from './simplified-event.dto';
import { VenueDetailResponse } from '../../../../domain/common.dto';

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
export interface Event extends SimplifiedEvent {
  venue: VenueDetailResponse;
  tiers: Record<string, TierAvailability>; // Key is tier code (e.g., "VIP", "FRONT_ROW", "GA")
}
