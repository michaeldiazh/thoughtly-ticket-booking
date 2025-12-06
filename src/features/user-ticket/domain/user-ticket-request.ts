/**
 * User Ticket Request
 * 
 * Request body for booking tickets
 */

import { z } from 'zod';

/**
 * Zod schema for UserTicketRequest
 * Validates request body for booking tickets
 */
export const UserTicketRequestSchema = z.object({
  ticketId: z.number().int().positive(),
  userId: z.number().int().positive(),
  quantity: z.number().int().positive().min(1),
});

/**
 * Request body for booking tickets
 * Type inferred from UserTicketRequestSchema to ensure type safety
 */
export type UserTicketRequest = z.infer<typeof UserTicketRequestSchema>;
