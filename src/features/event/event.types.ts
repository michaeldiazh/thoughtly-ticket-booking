/**
 * Event Types
 * 
 * Type definitions and Zod schemas for event feature
 */

import { z } from 'zod';
import { iso8601DatetimeSchema, positiveIntIdSchema, nonEmptyStringSchema, nonNegativeIntSchema, nullableStringSchema, countryCodeSchema, positivePriceSchema, arrayOfPositiveIntIdsSchema } from '../../shared/validator';
import { parseNonNegativeInt, parsePositiveInt } from '../../shared/utils';
import { preprocessCommaSeparatedPositiveInts } from '../../shared/validator';

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

/**
 * Tier availability information
 */
export interface TierAvailability {
  ticketId: number;
  price: number;
  remaining: number;
  capacity: number;
}

/**
 * Zod schema for TierAvailability
 */
export const TierAvailabilitySchema = z.object({
  ticketId: positiveIntIdSchema,
  price: positivePriceSchema,
  remaining: nonNegativeIntSchema,
  capacity: positiveIntIdSchema,
});

/**
 * Zod schema for VenueDetailResponse
 */
export const VenueDetailResponseSchema = z.object({
  id: positiveIntIdSchema,
  name: nonEmptyStringSchema,
  address: nonEmptyStringSchema,
  city: nonEmptyStringSchema,
  region: nullableStringSchema,
  countryCode: countryCodeSchema,
  timezone: nonEmptyStringSchema,
});

/**
 * Zod schema for Event
 */
export const EventSchema = SimplifiedEventSchema.extend({
  venue: VenueDetailResponseSchema,
  tiers: z.record(z.string(), TierAvailabilitySchema),
});

/**
 * Type inference from EventSchema
 */
export type Event = z.infer<typeof EventSchema>;

/**
 * Zod schema for query parameters
 * Handles type conversions and validation
 */
export const GetEventsQuerySchema = z.object({
  // Optional: comma-separated event IDs
  eventIds: z
    .preprocess(
      preprocessCommaSeparatedPositiveInts,
      arrayOfPositiveIntIdsSchema
    ),
  // Optional: event name
  eventName: z.preprocess(
    (val) => (val && typeof val === 'string' ? val.trim() : undefined),
    z.string().optional()
  ),

  // Optional: event start date (ISO 8601)
  eventStartDate: z.preprocess(
    (val) => {
      if (!val || typeof val !== 'string') return undefined;
      const date = new Date(val);
      if (isNaN(date.getTime())) {
        throw new Error('Expected ISO 8601 format (YYYY-MM-DDTHH:mm:ssZ)');
      }
      return date;
    },
    z.date().optional()
  ),

  // Optional: event end date (ISO 8601)
  eventEndDate: z.preprocess(
    (val) => {
      if (!val || typeof val !== 'string') return undefined;
      const date = new Date(val);
      if (isNaN(date.getTime())) {
        throw new Error('Expected ISO 8601 format (YYYY-MM-DDTHH:mm:ssZ)');
      }
      return date;
    },
    z.date().optional()
  ),

  // Optional: venue name
  venueName: z.preprocess(
    (val) => (val && typeof val === 'string' ? val.trim() : undefined),
    z.string().optional()
  ),

  // Optional: venue country code (4 characters)
  venueCountryCode: z.preprocess(
    (val) => (val && typeof val === 'string' ? val.trim().toUpperCase() : undefined),
    z
      .string()
      .optional()
      .refine(
        (val) => !val || val.length === 4,
        {
          message: 'Expected 4 character country code',
        }
      )
  ),

  // Limit with default
  limit: z.preprocess(
    (val) => {
      if (!val) return 10;
      return parsePositiveInt(val, 'limit');
    },
    positiveIntIdSchema.default(10)
  ),

  // Offset with default
  offset: z.preprocess(
    (val) => {
      if (!val) return 0;
      return parseNonNegativeInt(val, 'offset');
    },
    nonNegativeIntSchema.default(0)
  ),
});

/**
 * TypeScript type inferred from Zod schema
 */
export type GetEventsQuery = z.infer<typeof GetEventsQuerySchema>;
