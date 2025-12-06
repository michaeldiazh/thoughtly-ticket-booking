/**
 * Event DTO
 * 
 * Complete event information with venue and tier availability
 */

import { z } from 'zod';
import { SimplifiedEvent, SimplifiedEventSchema } from './simplified-event.dto';
import { VenueDetailResponse } from '../../../../domain/common.dto';
import { InvalidRequestError, FieldIssues } from '../../../../domain/errors';
import { positivePriceSchema, positiveIntIdSchema, nonEmptyStringSchema, nonNegativeIntSchema, nullableStringSchema, countryCodeSchema } from '../../../../shared/validator';

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
 * Event information with tier availability
 * Type is inferred from EventSchema below
 */

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
 * Error converter for Event validation errors
 * Converts Zod validation errors to InvalidRequestError
 */
export const eventErrorConverter = (error: z.ZodError | Error): Error => {
  if (error instanceof z.ZodError) {
    const fieldIssues: FieldIssues = {};
    
    for (const issue of error.issues) {
      const fieldName = issue.path.length > 0 
        ? issue.path.join('.') 
        : 'unknown';
      if (!fieldIssues[fieldName]) {
        fieldIssues[fieldName] = {
          issue: issue.message,
          detail: issue.code === 'custom' 
            ? issue.message 
            : issue.code,
        };
      }
    }
    return new InvalidRequestError(fieldIssues);
  }
  // Regular Error from validation
  return new InvalidRequestError({
    unknown: {
      issue: error.message,
      detail: error.message,
    },
  });
};
