/**
 * User Ticket
 * 
 * User ticket information returned after successful ticket purchase
 */

import { z } from 'zod';
import { preprocessToPositiveFloat } from '../../../shared/validator';
import { convertMySQLDatetimeToISO8601 } from '../../../shared/utils/parse.util';

/**
 * Zod schema for UserTicket
 * Handles preprocessing of decimal values from MySQL and validates all fields
 */
export const UserTicketSchema = z.object({
  id: z.number().int().positive(),
  ticketId: z.number().int().positive(),
  userId: z.number().int().positive(),
  unitPrice: z.preprocess(preprocessToPositiveFloat, z.number().positive()),
  ticketAmount: z.number().int().positive(),
  totalPrice: z.preprocess(preprocessToPositiveFloat, z.number().positive()),
  datePurchased: z.preprocess(
    convertMySQLDatetimeToISO8601,
    z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z$/, 'Must be ISO 8601 format')
  ),
});

/**
 * User ticket information returned after successful ticket purchase
 * Type inferred from UserTicketSchema to ensure type safety
 */
export type UserTicket = z.infer<typeof UserTicketSchema>;
