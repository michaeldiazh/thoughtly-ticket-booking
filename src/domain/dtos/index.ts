/**
 * Data Transfer Objects (DTOs)
 * 
 * DTOs define the structure of data transferred between frontend and backend.
 * These are separate from domain entities to maintain API contract stability.
 * 
 * Note: Feature-specific DTOs (ticket, user-ticket) have been moved to their respective feature directories.
 * This index only exports shared/legacy DTOs.
 */

export * from './get-events-response.dto';
export * from './get-event-by-id-response.dto';

