/**
 * Simplified Event DTO
 * 
 * Base event fields shared across all event responses
 */

import { z } from 'zod';

/**
 * Zod schema for SimplifiedEvent
 * Base event fields shared across all event responses
 */
export const SimplifiedEventSchema = z.object({
  id: z.number().int().positive(),
  name: z.string().min(1),
  description: z.string().nullable(),
  startTime: z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/, 'Must be ISO 8601 format'),
  endTime: z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/, 'Must be ISO 8601 format'),
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
  venueName: z.string().min(1),
  venueCity: z.string().min(1),
  venueCountryCode: z.string().min(2).max(4),
  venueTimezone: z.string().min(1),
});

/**
 * Type inference from EventListItemSchema
 * This ensures the TypeScript type stays in sync with the Zod schema
 */
export type EventListItem = z.infer<typeof EventListItemSchema>;
