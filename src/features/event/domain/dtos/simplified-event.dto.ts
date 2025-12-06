/**
 * Simplified Event DTO
 * 
 * Base event fields shared across all event responses
 */

import { z } from 'zod';
import { iso8601DatetimeSchema, positiveIntIdSchema, nonEmptyStringSchema, nullableStringSchema, countryCodeSchema } from '../../../../shared/validator';

/**
 * Zod schema for SimplifiedEvent
 * Base event fields shared across all event responses
 */
export const SimplifiedEventSchema = z.object({
  id: positiveIntIdSchema,
  name: nonEmptyStringSchema,
  description: nullableStringSchema,
  startTime: iso8601DatetimeSchema,
  endTime: iso8601DatetimeSchema,
});

/**
 * Type inference from SimplifiedEventSchema
 * This ensures the TypeScript type stays in sync with the Zod schema
 */
export type SimplifiedEvent = z.infer<typeof SimplifiedEventSchema>;

/**
 * Zod schema for EventListItem
 * Event list item with venue information
 * Used for GET /api/v1/event endpoint
 */
export const EventListItemSchema = SimplifiedEventSchema.extend({
  venueName: nonEmptyStringSchema,
  venueCity: nonEmptyStringSchema,
  venueCountryCode: countryCodeSchema,
  venueTimezone: nonEmptyStringSchema,
});

/**
 * Type inference from EventListItemSchema
 * This ensures the TypeScript type stays in sync with the Zod schema
 */
export type EventListItem = z.infer<typeof EventListItemSchema>;
