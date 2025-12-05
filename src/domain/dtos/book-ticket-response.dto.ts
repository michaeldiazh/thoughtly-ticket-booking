/**
 * DTOs for POST /user/ticket endpoint (Booking Response)
 */

import { SucceededSingleResponse } from './types';

/**
 * Booking information returned after successful ticket purchase
 */
export interface BookingResponse {
  id: number;
  ticketId: number;
  userId: number;
  unitPrice: number;
  ticketAmount: number;
  totalPrice: number;
  datePurchased: string; // ISO 8601 format
}
