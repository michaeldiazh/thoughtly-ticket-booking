/**
 * DTOs for GET /event query parameters
 */

import { z } from 'zod';
import { preprocessCommaSeparatedPositiveInts, positiveIntIdSchema, nonNegativeIntSchema, arrayOfPositiveIntIdsSchema } from '../../../../shared/validator';
import { parseNonNegativeInt, parsePositiveInt } from '../../../../shared/utils';

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
