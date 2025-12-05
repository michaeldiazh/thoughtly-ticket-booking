/**
 * DTOs for POST /user/ticket endpoint (Booking)
 */

/**
 * Request body for booking tickets
 */
export interface BookTicketRequest {
  ticketId: number;
  userId: number;
  quantity: number;
}

