/**
 * User Types
 * Based on backend API responses
 */

/**
 * SimplifiedUser - Basic user information returned from GET /api/v1/user
 */
export interface SimplifiedUser {
  id: number;
  firstName: string;
  lastName: string;
  city: string;
  countryCode: string;
}

/**
 * User - Alias for SimplifiedUser (used in context)
 * Full user details available via GET /api/v1/user/:id
 */
export type User = SimplifiedUser;
