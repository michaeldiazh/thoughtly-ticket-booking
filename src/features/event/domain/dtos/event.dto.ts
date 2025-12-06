/**
 * Event DTO
 * 
 * Complete event information with venue and tier availability
 */

import { z } from 'zod';
import { SimplifiedEvent, SimplifiedEventSchema } from './simplified-event.dto';
import { VenueDetailResponse } from '../../../../domain/common.dto';
import { InvalidRequestError, FieldIssues } from '../../../../domain/errors';
import { preprocessToPositiveFloat } from '../../../../shared/validator';

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
  ticketId: z.number().int().positive(),
  price: z.preprocess(preprocessToPositiveFloat, z.number().positive()),
  remaining: z.number().int().min(0),
  capacity: z.number().int().positive(),
});

/**
 * Zod schema for VenueDetailResponse
 */
export const VenueDetailResponseSchema = z.object({
  id: z.number().int().positive(),
  name: z.string().min(1),
  address: z.string().min(1),
  city: z.string().min(1),
  region: z.string().nullable(),
  countryCode: z.string().min(2).max(4),
  timezone: z.string().min(1),
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
