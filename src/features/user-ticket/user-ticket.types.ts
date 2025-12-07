/**
 * User Ticket Types
 * 
 * Type definitions and Zod schemas for user ticket feature
 */

import { z } from 'zod';
import { iso8601DatetimeSchema, positivePriceSchema, positiveIntIdSchema, nonEmptyStringSchema } from '../../shared/validator';

/**
 * Zod schema for UserTicketRequest
 * Validates request body for booking tickets
 */
export const UserTicketRequestSchema = z.object({
  ticketId: positiveIntIdSchema,
  userId: positiveIntIdSchema,
  quantity: positiveIntIdSchema.min(1),
});

/**
 * Request body for booking tickets
 * Type inferred from UserTicketRequestSchema to ensure type safety
 */
export type UserTicketRequest = z.infer<typeof UserTicketRequestSchema>;

/**
 * Zod schema for UserTicket
 * Handles preprocessing of decimal values from MySQL and validates all fields
 */
export const UserTicketSchema = z.object({
  id: positiveIntIdSchema,
  ticketId: positiveIntIdSchema,
  userId: positiveIntIdSchema,
  unitPrice: positivePriceSchema,
  ticketAmount: positiveIntIdSchema,
  totalPrice: positivePriceSchema,
  datePurchased: iso8601DatetimeSchema,
  eventName: nonEmptyStringSchema,
  venueName: nonEmptyStringSchema,
  startTime: iso8601DatetimeSchema,
  endTime: iso8601DatetimeSchema,
});

/**
 * User ticket information returned after successful ticket purchase
 * Type inferred from UserTicketSchema to ensure type safety
 */
export type UserTicket = z.infer<typeof UserTicketSchema>;
