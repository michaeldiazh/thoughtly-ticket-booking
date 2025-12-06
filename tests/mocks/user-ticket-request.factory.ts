/**
 * Mock Factory for UserTicketRequest
 * 
 * Provides factory function to create UserTicketRequest instances for testing
 */

import { UserTicketRequest } from '../../src/features/user-ticket/domain';

/**
 * Creates a UserTicketRequest instance
 * 
 * @param userId - The user ID making the booking
 * @param ticketId - The ticket ID to book
 * @param quantity - The quantity to book
 * @returns UserTicketRequest instance
 * 
 * @example
 * ```typescript
 * // Create a request
 * const request = createUserTicketRequest(1, 1, 1);
 * // Returns: { userId: 1, ticketId: 1, quantity: 1 }
 * ```
 */
export const createUserTicketRequest = (
  userId: number,
  ticketId: number,
  quantity: number
): UserTicketRequest => ({
  userId,
  ticketId,
  quantity,
});
