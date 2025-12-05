/**
 * Event-related error classes
 */

import { AppError } from './base.error';

/**
 * Error thrown when an event is not found
 */
export class EventNotFoundError extends AppError {
  constructor(eventId: number | string) {
    super(
      'EVENT_NOT_FOUND',
      `Event with ID ${eventId} not found`,
      { eventId }
    );
  }
}

/**
 * Error thrown when event ID format is invalid
 */
export class InvalidEventIdError extends AppError {
  constructor(eventId: unknown) {
    super(
      'INVALID_EVENT_ID',
      'Invalid event ID format',
      { eventId }
    );
  }
}

