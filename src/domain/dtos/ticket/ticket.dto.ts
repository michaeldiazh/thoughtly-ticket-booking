/**
 * DTOs for GET /tickets/:id endpoint
 */

import { z } from 'zod';
import { BaseEventFields, VenueDetailResponse } from '../common.dto';
import { InvalidRequestError, FieldIssues } from '../../errors';

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
 * Zod schema for EventDetailResponse
 */
export const EventDetailResponseSchema = z.object({
  id: z.number().int().positive(),
  name: z.string().min(1),
  description: z.string().nullable(),
  startTime: z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/, 'Must be ISO 8601 format'),
  endTime: z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/, 'Must be ISO 8601 format'),
  venue: VenueDetailResponseSchema,
});

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
    id: z.number().int().positive(),
    eventId: z.number().int().positive(),
    tierCode: z.string().min(1),
    tierDisplayName: z.string().min(1),
    capacity: z.number().int().nonnegative(),
    remaining: z.number().int().nonnegative(),
    price: z.preprocess((data) => {
      if (typeof data === 'string') {
        return Number.parseFloat(data);
      }
      return data;
    },z.number().positive()),
    createdAt: z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/, 'Must be ISO 8601 format'),
    lastUpdated: z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/, 'Must be ISO 8601 format'),
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
 * Error converter for Ticket validation
 * Converts Zod validation errors to InvalidRequestError
 */
export const ticketErrorConverter = (error: z.ZodError | Error): Error => {
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

/**
 * Event information with nested venue details
 */
export interface EventDetailResponse extends BaseEventFields {
  venue: VenueDetailResponse;
}
