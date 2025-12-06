/**
 * Shared Zod Schemas
 * 
 * Common Zod schemas that are reused across multiple features
 */

import { z } from 'zod';
import { convertMySQLDatetimeToISO8601 } from '../utils/parse.util';
import { preprocessToPositiveFloat } from './zod-preprocessors.util';

/**
 * Shared Zod schema for ISO 8601 datetime strings
 * Converts MySQL datetime format to ISO 8601 and validates the format
 * 
 * @example
 * ```typescript
 * export const MySchema = z.object({
 *   createdAt: iso8601DatetimeSchema,
 *   updatedAt: iso8601DatetimeSchema,
 * });
 * ```
 */
export const iso8601DatetimeSchema = z.preprocess(
  convertMySQLDatetimeToISO8601,
  z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z$/, 'Must be ISO 8601 format')
);

/**
 * Shared Zod schema for positive price/decimal values
 * Converts MySQL decimal/string values to positive numbers and validates
 * 
 * @example
 * ```typescript
 * export const MySchema = z.object({
 *   price: positivePriceSchema,
 *   unitPrice: positivePriceSchema,
 *   totalPrice: positivePriceSchema,
 * });
 * ```
 */
export const positivePriceSchema = z.preprocess(
  preprocessToPositiveFloat,
  z.number().positive()
);

/**
 * Shared Zod schema for positive integer IDs
 * Used for database IDs, foreign keys, and other positive integer identifiers
 * 
 * @example
 * ```typescript
 * export const MySchema = z.object({
 *   id: positiveIntIdSchema,
 *   userId: positiveIntIdSchema,
 *   ticketId: positiveIntIdSchema,
 * });
 * ```
 */
export const positiveIntIdSchema = z.number().int().positive();

/**
 * Shared Zod schema for non-empty strings
 * Used for names, addresses, codes, and other required string fields
 * 
 * @example
 * ```typescript
 * export const MySchema = z.object({
 *   name: nonEmptyStringSchema,
 *   address: nonEmptyStringSchema,
 *   city: nonEmptyStringSchema,
 * });
 * ```
 */
export const nonEmptyStringSchema = z.string().min(1);

/**
 * Shared Zod schema for non-negative integers
 * Used for counts, capacities, and quantities that can be zero
 * 
 * @example
 * ```typescript
 * export const MySchema = z.object({
 *   capacity: nonNegativeIntSchema,
 *   remaining: nonNegativeIntSchema,
 * });
 * ```
 */
export const nonNegativeIntSchema = z.number().int().nonnegative();

/**
 * Shared Zod schema for nullable strings
 * Used for optional text fields like descriptions and regions
 * 
 * @example
 * ```typescript
 * export const MySchema = z.object({
 *   description: nullableStringSchema,
 *   region: nullableStringSchema,
 * });
 * ```
 */
export const nullableStringSchema = z.string().nullable();

/**
 * Shared Zod schema for country codes
 * Validates 2 or 4 character country codes (ISO 3166-1 alpha-2 or alpha-4)
 * 
 * @example
 * ```typescript
 * export const MySchema = z.object({
 *   countryCode: countryCodeSchema,
 * });
 * ```
 */
export const countryCodeSchema = z.string().min(2).max(4);

/**
 * Shared Zod schema for arrays of positive integer IDs
 * Used for comma-separated ID lists in query parameters
 * Requires at least 1 element if provided
 * 
 * @example
 * ```typescript
 * export const MySchema = z.object({
 *   ticketIds: arrayOfPositiveIntIdsSchema,
 *   eventIds: arrayOfPositiveIntIdsSchema,
 * });
 * ```
 */
export const arrayOfPositiveIntIdsSchema = z.array(positiveIntIdSchema).min(1).optional();

/**
 * Shared Zod schema for arrays of non-empty strings
 * Used for comma-separated string lists in query parameters
 * Requires at least 1 element if provided
 * 
 * @example
 * ```typescript
 * export const MySchema = z.object({
 *   tierCodes: arrayOfNonEmptyStringsSchema,
 *   categories: arrayOfNonEmptyStringsSchema,
 * });
 * ```
 */
export const arrayOfNonEmptyStringsSchema = z.array(nonEmptyStringSchema).min(1).optional();
