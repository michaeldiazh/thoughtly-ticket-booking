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
 * UserTicketInfo - User ticket information in user detail response
 */
export interface UserTicketInfo {
  userTicketId: number;
  eventName: string;
  venueName: string;
  tier: string;
  ticketAmount: number;
  totalPrice: number;
  datePurchased: string; // ISO 8601 format
}

/**
 * User - Complete user information with user tickets
 * Returned from GET /api/v1/user/:id
 */
export interface User {
  id: number;
  firstName: string;
  lastName: string;
  address: string;
  city: string;
  region: string | null;
  countryCode: string;
  timezone: string;
  userTickets: UserTicketInfo[];
}
