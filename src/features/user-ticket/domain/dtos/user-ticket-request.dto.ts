/**
 * DTOs for POST /user/ticket endpoint (User Ticket Request)
 */

import { z } from 'zod';
import { InvalidRequestError, FieldIssues } from '../../../../domain/errors';

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

/**
 * Error converter for UserTicketRequest validation
 * Converts Zod validation errors to InvalidRequestError
 */
export const userTicketRequestErrorConverter = (error: z.ZodError | Error): Error => {
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
