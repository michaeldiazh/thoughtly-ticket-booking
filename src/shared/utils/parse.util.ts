/**
 * Parsing Utilities
 * 
 * Common parsing functions for converting strings to numbers with validation.
 * Used in both controllers (for route/query parameters) and Zod preprocessing.
 */

import { InvalidRequestError } from '../../domain/errors';

/**
 * Parses a string or number to a positive integer
 * Throws InvalidRequestError if parsing fails or value is not positive
 * 
 * @param value - The value to parse (string or number)
 * @param fieldName - The name of the field (for error messages)
 * @returns The parsed positive integer
 * @throws InvalidRequestError if value cannot be parsed or is not positive
 * 
 * @example
 * ```typescript
 * // In controller
 * const ticketId = parsePositiveInt(req.params.id, 'id');
 * 
 * // In Zod preprocessing
 * z.preprocess((val) => parsePositiveInt(val, 'limit'), z.number().int().positive())
 * ```
 */
export function parsePositiveInt(value: unknown, fieldName: string = 'value'): number {
  if (typeof value === 'number') {
    if (isNaN(value) || value <= 0 || !Number.isInteger(value)) {
      throw new InvalidRequestError({
        [fieldName]: {
          issue: `Invalid ${fieldName}. Must be a positive integer.`,
          detail: `The ${fieldName} must be a valid positive integer.`,
        },
      });
    }
    return value;
  }

  if (typeof value === 'string') {
    const num = parseInt(value.trim(), 10);
    if (isNaN(num) || num <= 0) {
      throw new InvalidRequestError({
        [fieldName]: {
          issue: `Invalid ${fieldName}. Must be a positive integer.`,
          detail: `The ${fieldName} must be a valid positive integer.`,
        },
      });
    }
    return num;
  }

  throw new InvalidRequestError({
    [fieldName]: {
      issue: `Invalid ${fieldName}. Must be a positive integer.`,
      detail: `The ${fieldName} must be a valid positive integer.`,
    },
  });
}

/**
 * Parses a string or number to a non-negative integer
 * Throws InvalidRequestError if parsing fails or value is negative
 * 
 * @param value - The value to parse (string or number)
 * @param fieldName - The name of the field (for error messages)
 * @returns The parsed non-negative integer
 * @throws InvalidRequestError if value cannot be parsed or is negative
 * 
 * @example
 * ```typescript
 * // In controller
 * const offset = parseNonNegativeInt(req.query.offset, 'offset');
 * 
 * // In Zod preprocessing
 * z.preprocess((val) => parseNonNegativeInt(val, 'offset'), z.number().int().nonnegative())
 * ```
 */
export function parseNonNegativeInt(value: unknown, fieldName: string = 'value'): number {
  if (typeof value === 'number') {
    if (isNaN(value) || value < 0 || !Number.isInteger(value)) {
      throw new InvalidRequestError({
        [fieldName]: {
          issue: `Invalid ${fieldName}. Must be a non-negative integer.`,
          detail: `The ${fieldName} must be a valid non-negative integer.`,
        },
      });
    }
    return value;
  }

  if (typeof value === 'string') {
    const num = parseInt(value.trim(), 10);
    if (isNaN(num) || num < 0) {
      throw new InvalidRequestError({
        [fieldName]: {
          issue: `Invalid ${fieldName}. Must be a non-negative integer.`,
          detail: `The ${fieldName} must be a valid non-negative integer.`,
        },
      });
    }
    return num;
  }

  throw new InvalidRequestError({
    [fieldName]: {
      issue: `Invalid ${fieldName}. Must be a non-negative integer.`,
      detail: `The ${fieldName} must be a valid non-negative integer.`,
    },
  });
}

/**
 * Parses a string or number to a positive float/decimal
 * Throws InvalidRequestError if parsing fails or value is not positive
 * 
 * @param value - The value to parse (string or number)
 * @param fieldName - The name of the field (for error messages)
 * @returns The parsed positive float
 * @throws InvalidRequestError if value cannot be parsed or is not positive
 * 
 * @example
 * ```typescript
 * // In controller
 * const price = parsePositiveFloat(req.body.price, 'price');
 * 
 * // In Zod preprocessing
 * z.preprocess((val) => parsePositiveFloat(val, 'unitPrice'), z.number().positive())
 * ```
 */
export function parsePositiveFloat(value: unknown, fieldName: string = 'value'): number {
  if (typeof value === 'number') {
    if (isNaN(value) || value <= 0) {
      throw new InvalidRequestError({
        [fieldName]: {
          issue: `Invalid ${fieldName}. Must be a positive number.`,
          detail: `The ${fieldName} must be a valid positive number.`,
        },
      });
    }
    return value;
  }

  if (typeof value === 'string') {
    const num = Number.parseFloat(value.trim());
    if (isNaN(num) || num <= 0) {
      throw new InvalidRequestError({
        [fieldName]: {
          issue: `Invalid ${fieldName}. Must be a positive number.`,
          detail: `The ${fieldName} must be a valid positive number.`,
        },
      });
    }
    return num;
  }

  throw new InvalidRequestError({
    [fieldName]: {
      issue: `Invalid ${fieldName}. Must be a positive number.`,
      detail: `The ${fieldName} must be a valid positive number.`,
    },
  });
}
