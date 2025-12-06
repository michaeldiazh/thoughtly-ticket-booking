/**
 * DTOs for GET /tickets query parameters
 */

import { z } from 'zod';
import { createZodValidator } from '../validator';
import { InvalidQueryParameterError, FieldIssues } from '../errors';

/**
 * Zod schema for query parameters
 * Handles comma-separated values and type conversions
 */
export const GetTicketsQuerySchema = z.object({
  // Optional: comma-separated ticket IDs
  ticketIds: z
    .preprocess(
      (val) => {
        if (!val || typeof val !== 'string') return undefined;
        return val
          .split(',')
          .map((id) => {
            const num = parseInt(id.trim(), 10);
            if (isNaN(num) || num <= 0) {
              throw new Error(`Invalid ticket ID: ${id}`);
            }
            return num;
          });
      },
      z.array(z.number().int().positive()).min(1).optional()
    ),

  // Optional: comma-separated tier codes
  tierCodes: z
    .preprocess(
      (val) => {
        if (!val || typeof val !== 'string') return undefined;
        return val
          .split(',')
          .map((code) => code.trim().toUpperCase());
      },
      z.array(z.string()).min(1).optional()
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

  // Optional: venue country code (2 or 4 characters)
  venueCountryCode: z.preprocess(
    (val) => (val && typeof val === 'string' ? val.trim().toUpperCase() : undefined),
    z
      .string()
      .optional()
      .refine(
        (val) => !val || val.length === 2 || val.length === 4,
        {
          message: 'Expected 2 or 4 character country code',
        }
      )
  ),

  // Limit with default
  limit: z.preprocess(
    (val) => {
      if (!val) return 10;
      const num = parseInt(String(val), 10);
      if (isNaN(num) || num <= 0) {
        throw new Error('must be a positive number');
      }
      return num;
    },
    z.number().int().positive().default(10)
  ),

  // Offset with default
  offset: z.preprocess(
    (val) => {
      if (!val) return 0;
      const num = parseInt(String(val), 10);
      if (isNaN(num) || num < 0) {
        throw new Error('must be a non-negative number');
      }
      return num;
    },
    z.number().int().nonnegative().default(0)
  ),
});

/**
 * TypeScript type inferred from Zod schema
 */
export type GetTicketsQuery = z.infer<typeof GetTicketsQuerySchema>;

/**
 * Error converter for GetTicketsQuery validation
 * Handles both ZodError and regular Errors from preprocess functions
 */
export const getTicketsQueryErrorConverter = (error: z.ZodError | Error): InvalidQueryParameterError => {
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
    return new InvalidQueryParameterError(fieldIssues);
  }
  // Regular Error from preprocess functions
  const fieldIssues: FieldIssues = {
    unknown: {
      issue: error.message,
      detail: error.message,
    },
  };
  return new InvalidQueryParameterError(fieldIssues);
};

