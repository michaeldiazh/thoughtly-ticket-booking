/**
 * Data Transfer Objects (DTOs)
 * 
 * DTOs define the structure of data transferred between frontend and backend.
 * These are separate from domain entities to maintain API contract stability.
 */

export * from './types';
export * from './common.dto';
export * from './ticket/simplified-ticket.dto';
export * from './get-tickets-query.dto';
export * from './ticket/ticket.dto';
export * from './book-ticket-request.dto';
export * from './book-ticket-response.dto';
export * from './get-events-response.dto';
export * from './get-event-by-id-response.dto';

