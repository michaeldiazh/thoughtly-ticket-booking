/**
 * Error Converter Utilities
 * 
 * Shared utilities for converting validation errors to application-specific errors
 */

import { z } from 'zod';
import { InvalidRequestError, FieldIssues } from '../../domain/errors';

/**
 * Converts ZodError to FieldIssues format
 * 
 * Extracts field-level validation issues from ZodError and formats them
 * into the application's standard FieldIssues format.
 * 
 * @param error - The ZodError to convert
 * @returns FieldIssues object with field-level validation errors
 * 
 * @example
 * ```typescript
 * if (error instanceof z.ZodError) {
 *   const fieldIssues = convertZodErrorToFieldIssues(error);
 *   return new InvalidRequestError(fieldIssues);
 * }
 * ```
 */
function convertZodErrorToFieldIssues(error: z.ZodError): FieldIssues {
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
  
  return fieldIssues;
}

/**
 * Converts validation errors to InvalidRequestError
 * 
 * This is a common pattern used across all error converters in the application.
 * It handles both ZodError and regular Error types, converting them to
 * the application's standard InvalidRequestError format.
 * 
 * @param error - The error to convert (ZodError or regular Error)
 * @returns InvalidRequestError with field-level issues
 * 
 * @example
 * ```typescript
 * export const myErrorConverter = (error: z.ZodError | Error): Error => {
 *   return convertValidationErrorToInvalidRequestError(error);
 * };
 * ```
 */
export function convertValidationErrorToInvalidRequestError(error: z.ZodError | Error): InvalidRequestError {
  if (error instanceof z.ZodError) {
    const fieldIssues = convertZodErrorToFieldIssues(error);
    return new InvalidRequestError(fieldIssues);
  }
  
  // Regular Error from validation
  return new InvalidRequestError({
    unknown: {
      issue: error.message,
      detail: error.message,
    },
  });
}
