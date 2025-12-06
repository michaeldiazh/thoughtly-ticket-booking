/**
 * Zod Preprocessing Utilities
 * 
 * Common preprocessing functions for Zod schemas to handle type conversions
 * and validations that are used across multiple DTOs.
 * 
 * These functions wrap the parse utilities from api/utils/parse.util.ts,
 * converting InvalidRequestError to generic Error for Zod error handling.
 */

import { parsePositiveInt, parseNonNegativeInt, parsePositiveFloat } from '../utils';
import { InvalidRequestError, FieldIssues } from '../../domain/errors';

/**
 * Converts InvalidRequestError to a generic Error for Zod preprocessing
 * Extracts the error message from the first field issue
 */
function convertToZodError(error: InvalidRequestError, defaultMessage: string): Error {
  if (error.details && typeof error.details === 'object') {
    const fieldIssues = error.details as FieldIssues;
    const fieldNames = Object.keys(fieldIssues);
    if (fieldNames.length > 0) {
      const firstField = fieldIssues[fieldNames[0]];
      if (firstField && firstField.issue) {
        return new Error(firstField.issue);
      }
      if (firstField && firstField.detail && typeof firstField.detail === 'string') {
        return new Error(firstField.detail);
      }
    }
  }
  return new Error(error.message || defaultMessage);
}

/**
 * Preprocesses a value to a positive integer
 * Handles string to number conversion with validation
 * Uses parsePositiveInt from api/utils/parse.util.ts
 * 
 * @param data - The value to preprocess (string or number)
 * @returns The parsed integer
 * @throws Error if the value cannot be parsed or is not positive
 * 
 * @example
 * ```typescript
 * z.preprocess(preprocessToPositiveInt, z.number().int().positive())
 * ```
 */
export function preprocessToPositiveInt(data: unknown): number {
  try {
    return parsePositiveInt(data, 'value');
  } catch (error) {
    if (error instanceof InvalidRequestError) {
      throw convertToZodError(error, 'must be a positive number');
    }
    throw error;
  }
}

/**
 * Preprocesses a value to a non-negative integer
 * Handles string to number conversion with validation
 * Uses parseNonNegativeInt from api/utils/parse.util.ts
 * 
 * @param data - The value to preprocess (string or number)
 * @returns The parsed integer
 * @throws Error if the value cannot be parsed or is negative
 * 
 * @example
 * ```typescript
 * z.preprocess(preprocessToNonNegativeInt, z.number().int().nonnegative())
 * ```
 */
export function preprocessToNonNegativeInt(data: unknown): number {
  try {
    return parseNonNegativeInt(data, 'value');
  } catch (error) {
    if (error instanceof InvalidRequestError) {
      throw convertToZodError(error, 'must be a non-negative number');
    }
    throw error;
  }
}

/**
 * Preprocesses a value to a positive float/decimal
 * Handles string to number conversion with validation
 * Uses parsePositiveFloat from api/utils/parse.util.ts
 * Commonly used for price fields from MySQL
 * 
 * @param data - The value to preprocess (string or number)
 * @returns The parsed float
 * @throws Error if the value cannot be parsed or is not positive
 * 
 * @example
 * ```typescript
 * z.preprocess(preprocessToPositiveFloat, z.number().positive())
 * ```
 */
export function preprocessToPositiveFloat(data: unknown): number {
  try {
    return parsePositiveFloat(data, 'value');
  } catch (error) {
    if (error instanceof InvalidRequestError) {
      throw convertToZodError(error, 'must be a positive number');
    }
    throw error;
  }
}

/**
 * Preprocesses a comma-separated string to an array of positive integers
 * Useful for query parameters like ?ticketIds=1,2,3
 * Uses parsePositiveInt from api/utils/parse.util.ts for each item
 * 
 * @param val - The value to preprocess (string or undefined)
 * @returns Array of positive integers, or undefined if val is empty/undefined
 * @throws Error if any value cannot be parsed or is not positive
 * 
 * @example
 * ```typescript
 * z.preprocess(
 *   preprocessCommaSeparatedPositiveInts,
 *   z.array(z.number().int().positive()).optional()
 * )
 * ```
 */
export function preprocessCommaSeparatedPositiveInts(val: unknown): number[] | undefined {
  if (!val || typeof val !== 'string') return undefined;
  return val
    .split(',')
    .map((item) => {
      try {
        return parsePositiveInt(item.trim(), 'ticketId');
      } catch (error) {
        if (error instanceof InvalidRequestError) {
          throw convertToZodError(error, `Invalid number: ${item.trim()}`);
        }
        throw error;
      }
    });
}

/**
 * Preprocesses a comma-separated string to an array of strings
 * Useful for query parameters like ?tierCodes=GA,VIP
 * 
 * @param val - The value to preprocess (string or undefined)
 * @returns Array of trimmed strings, or undefined if val is empty/undefined
 * 
 * @example
 * ```typescript
 * z.preprocess(
 *   preprocessCommaSeparatedStrings,
 *   z.array(z.string()).optional()
 * )
 * ```
 */
export function preprocessCommaSeparatedStrings(val: unknown): string[] | undefined {
  if (!val || typeof val !== 'string') return undefined;
  return val
    .split(',')
    .map((item) => item.trim())
    .filter((item) => item.length > 0);
}
