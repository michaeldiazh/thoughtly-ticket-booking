/**
 * Zod Validator Factory
 * 
 * Factory for creating Validator instances from Zod schemas
 */

import { z } from 'zod';
import { Validator } from './validator.interface';

/**
 * Creates a Validator from a ZodObject schema
 * 
 * @template T - The type that the Zod schema validates to
 * @param schema - The ZodObject schema to use for validation
 * @param errorConverter - Function to convert validation errors (z.ZodError or Error) to custom error types
 * @returns A Validator instance that validates data using the Zod schema
 */
export function createZodValidator<T>(
  schema: z.ZodObject<any, any, any, any, any>,
  errorConverter: (error: z.ZodError | Error) => Error
): Validator<T> {
  return {
    validate(data: unknown): T {
      try {
        return schema.parse(data) as T;
      } catch (error) {
        if (error instanceof z.ZodError || error instanceof Error) {
          throw errorConverter(error);
        }
        // Re-throw if it's not a known error type
        throw error;
      }
    },
  };
}
