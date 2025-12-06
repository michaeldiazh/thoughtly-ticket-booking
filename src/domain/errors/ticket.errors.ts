/**
 * Ticket-related error classes
 */

import { AppError } from './base.error';

/**
 * Error thrown when a ticket is not found
 */
export class TicketNotFoundError extends AppError {
  constructor(ticketId: number | string) {
    super(
      'TICKET_NOT_FOUND',
      `Ticket with ID ${ticketId} not found`,
      { ticketId }
    );
  }
}

/**
 * Error thrown when there are insufficient tickets available
 */
export class InsufficientTicketsError extends AppError {
  constructor(ticketId: number, requested: number, remaining?: number) {
    const message = remaining !== undefined
      ? `Not enough tickets available. Remaining: ${remaining}, Requested: ${requested}`
      : `Not enough tickets available. Requested: ${requested}`;
    super(
      'INSUFFICIENT_TICKETS',
      message,
      {
        ticketId,
        requested,
        ...(remaining !== undefined && { remaining }),
      }
    );
  }
}

/**
 * Error thrown when ticket ID format is invalid
 */
export class InvalidTicketIdError extends AppError {
  constructor(ticketId: unknown) {
    super(
      'INVALID_TICKET_ID',
      'Invalid ticket ID format',
      { ticketId }
    );
  }
}

