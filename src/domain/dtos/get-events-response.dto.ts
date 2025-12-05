/**
 * DTOs for GET /event endpoint (Event List)
 */

import { BaseEventFields } from './common.dto';

/**
 * Simplified event information for browsing
 */
export interface EventListItemResponse extends BaseEventFields {
  venueId: number;
  venueName: string;
  venueCity: string;
}
