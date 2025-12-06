/**
 * DTOs for POST /user/ticket endpoint (User Ticket)
 */

import { z } from 'zod';
import { InvalidRequestError, FieldIssues } from '../../errors';
import { preprocessToPositiveFloat } from '../../validator';

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
  datePurchased: z.preprocess((data) => {
    // Convert MySQL datetime to ISO 8601 format
    if (data instanceof Date) {
      return data.toISOString();
    }
    if (typeof data === 'string') {
      // MySQL returns: '2024-01-15 14:30:00.000' or similar
      // Convert to: '2024-01-15T14:30:00.000Z'
      let dateStr = data.trim();
      // Replace space with T
      dateStr = dateStr.replace(' ', 'T');
      // Add Z if not present
      if (!dateStr.endsWith('Z')) {
        // If it has milliseconds, keep them, otherwise add .000
        if (!dateStr.includes('.')) {
          dateStr = dateStr + '.000';
        }
        dateStr = dateStr + 'Z';
      }
      return dateStr;
    }
    // If it's already in the right format, return as-is
    return data;
  }, z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z$/, 'Must be ISO 8601 format')),
});

/**
 * User ticket information returned after successful ticket purchase
 * Type inferred from UserTicketSchema to ensure type safety
 */
export type UserTicket = z.infer<typeof UserTicketSchema>;

/**
 * Error converter for UserTicket validation
 * Converts Zod validation errors to InvalidRequestError
 */
export const userTicketErrorConverter = (error: z.ZodError | Error): Error => {
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
