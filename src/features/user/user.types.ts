/**
 * User Types
 * 
 * Type definitions and Zod schemas for user feature
 */

import { z } from 'zod';
import { positiveIntIdSchema, nonEmptyStringSchema, nullableStringSchema, countryCodeSchema } from '../../shared/validator';

/**
 * Zod schema for SimplifiedUser
 * Basic user information for listing
 */
export const SimplifiedUserSchema = z.object({
  id: positiveIntIdSchema,
  firstName: nonEmptyStringSchema,
  lastName: nonEmptyStringSchema,
  city: nonEmptyStringSchema,
  countryCode: countryCodeSchema,
});

/**
 * Type inference from SimplifiedUserSchema
 */
export type SimplifiedUser = z.infer<typeof SimplifiedUserSchema>;

/**
 * Zod schema for User
 * Complete user information
 */
export const UserSchema = z.object({
  id: positiveIntIdSchema,
  firstName: nonEmptyStringSchema,
  lastName: nonEmptyStringSchema,
  address: nonEmptyStringSchema,
  city: nonEmptyStringSchema,
  region: nullableStringSchema,
  countryCode: countryCodeSchema,
  timezone: nonEmptyStringSchema,
});

/**
 * Type inference from UserSchema
 */
export type User = z.infer<typeof UserSchema>;
