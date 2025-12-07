/**
 * User Types
 * 
 * Type definitions and Zod schemas for user feature
 */

import { z } from 'zod';
import { positiveIntIdSchema, nonEmptyStringSchema, nullableStringSchema, countryCodeSchema, positivePriceSchema, iso8601DatetimeSchema } from '../../shared/validator';

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
 * Zod schema for UserTicketInfo
 * User ticket information in user detail response
 */
export const UserTicketInfoSchema = z.object({
  userTicketId: positiveIntIdSchema,
  eventName: nonEmptyStringSchema,
  venueName: nonEmptyStringSchema,
  tier: nonEmptyStringSchema,
  ticketAmount: positiveIntIdSchema,
  totalPrice: positivePriceSchema,
  datePurchased: iso8601DatetimeSchema,
});

/**
 * Type inference from UserTicketInfoSchema
 */
export type UserTicketInfo = z.infer<typeof UserTicketInfoSchema>;

/**
 * Zod schema for User
 * Complete user information with user tickets
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
  userTickets: z.array(UserTicketInfoSchema),
});

/**
 * Type inference from UserSchema
 */
export type User = z.infer<typeof UserSchema>;
