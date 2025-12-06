/**
 * Ticket Types
 * 
 * Type definitions and Zod schemas for ticket feature
 */

import { z } from 'zod';
import { SimplifiedEvent } from '../event/event.types';
import { VenueDetailResponse } from '../../domain/common.dto';
import { preprocessCommaSeparatedStrings, preprocessCommaSeparatedPositiveInts, iso8601DatetimeSchema, positivePriceSchema, positiveIntIdSchema, nonEmptyStringSchema, nonNegativeIntSchema, nullableStringSchema, countryCodeSchema, arrayOfPositiveIntIdsSchema, arrayOfNonEmptyStringsSchema } from '../../shared/validator';
import { parseNonNegativeInt, parsePositiveInt } from '../../shared/utils';

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
 * Zod schema for EventDetailResponse
 */
export const EventDetailResponseSchema = z.object({
  id: positiveIntIdSchema,
  name: nonEmptyStringSchema,
  description: nullableStringSchema,
  startTime: iso8601DatetimeSchema,
  endTime: iso8601DatetimeSchema,
  venue: VenueDetailResponseSchema,
});

/**
 * Event information with nested venue details
 */
export interface EventDetailResponse extends SimplifiedEvent {
  venue: VenueDetailResponse;
}

/**
 * Raw ticket data from database with stringified event JSON
 * This represents the structure returned directly from MySQL before preprocessing
 */
export interface StringifiedTicket {
  id: number;
  eventId: number;
  tierCode: string;
  tierDisplayName: string;
  capacity: number;
  remaining: number;
  price: number;
  createdAt: string;
  lastUpdated: string;
  event: string; // JSON string from MySQL JSON_OBJECT
}

/**
 * Zod schema for Ticket with preprocessing to parse JSON event string
 */
export const TicketSchema = 
  z.object({
    id: positiveIntIdSchema,
    tierCode: nonEmptyStringSchema,
    tierDisplayName: nonEmptyStringSchema,
    capacity: nonNegativeIntSchema,
    remaining: nonNegativeIntSchema,
    price: positivePriceSchema,
    createdAt: iso8601DatetimeSchema,
    lastUpdated: iso8601DatetimeSchema,
    event: z.preprocess(
      (data) => {
        if (typeof data === 'string') {
          return JSON.parse(data);
        }
        return data;
      },
      EventDetailResponseSchema
    ),
  });

/**
 * Ticket type inferred from TicketSchema
 * This ensures the TypeScript type stays in sync with the Zod schema
 */
export type Ticket = z.infer<typeof TicketSchema>;

/**
 * Zod schema for query parameters
 * Handles comma-separated values and type conversions
 */
export const GetTicketsQuerySchema = z.object({
  // Optional: comma-separated ticket IDs
  ticketIds: z
    .preprocess(
      preprocessCommaSeparatedPositiveInts,
      arrayOfPositiveIntIdsSchema
    ),

  // Optional: comma-separated tier codes
  tierCodes: z
    .preprocess(
      (val) => {
        const result = preprocessCommaSeparatedStrings(val);
        return result?.map((code: string) => code.toUpperCase());
      },
      arrayOfNonEmptyStringsSchema
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

  // Optional: venue country code (2 or 4 characters)
  venueCountryCode: z.preprocess(
    (val) => (val && typeof val === 'string' ? val.trim().toUpperCase() : undefined),
    z
      .string()
      .optional()
      .refine(
        (val) => !val || val.length === 2 || val.length === 4,
        {
          message: 'Expected 2 or 4 character country code',
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
export type GetTicketsQuery = z.infer<typeof GetTicketsQuerySchema>;
