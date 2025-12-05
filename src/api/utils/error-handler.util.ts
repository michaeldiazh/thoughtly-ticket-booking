/**
 * Error Handler Utility
 * 
 * Provides error handling functionality for controllers using a dictionary pattern
 */

import { Response } from 'express';
import { APIResponse } from '../../domain/dtos';
import {
  AppError,
  InvalidQueryParameterError,
  InvalidRequestError,
  TicketNotFoundError,
  EventNotFoundError,
  InsufficientTicketsError,
} from '../../domain/errors';

/**
 * Error handler function type
 * Takes a narrowed error type and returns status code and response
 */
type ErrorHandler<T extends AppError | (Error & { toException: () => any })> = (
  error: T
) => { statusCode: number; response: APIResponse<never> };

/**
 * Dictionary mapping error types to their handlers
 * Uses a function that checks instanceof and returns the handler
 */
const errorHandlers: Array<{
  check: (error: unknown) => boolean;
  handler: ErrorHandler<any>;
}> = [
  // Validation errors (400 Bad Request)
  {
    check: (error): error is InvalidQueryParameterError | InvalidRequestError =>
      error instanceof InvalidQueryParameterError || error instanceof InvalidRequestError,
    handler: (error: InvalidQueryParameterError | InvalidRequestError) => ({
      statusCode: 400,
      response: {
        status: 'ERROR',
        error: error.toException(),
      },
    }),
  },
  // Not found errors (404 Not Found)
  {
    check: (error): error is TicketNotFoundError | EventNotFoundError =>
      error instanceof TicketNotFoundError || error instanceof EventNotFoundError,
    handler: (error: TicketNotFoundError | EventNotFoundError) => ({
      statusCode: 404,
      response: {
        status: 'ERROR',
        error: error.toException(),
      },
    }),
  },
  // Conflict errors (409 Conflict)
  {
    check: (error): error is InsufficientTicketsError =>
      error instanceof InsufficientTicketsError,
    handler: (error: InsufficientTicketsError) => ({
      statusCode: 409,
      response: {
        status: 'ERROR',
        error: error.toException(),
      },
    }),
  },
  // Other AppError instances (500 Internal Server Error)
  {
    check: (error): error is AppError => error instanceof AppError,
    handler: (error: AppError) => ({
      statusCode: 500,
      response: {
        status: 'ERROR',
        error: error.toException(),
      },
    }),
  },
  // Errors with toException method
  {
    check: (error): error is Error & { toException: () => any } =>
      error instanceof Error && 'toException' in error,
    handler: (error: Error & { toException: () => any }) => {
      const statusCode = error.constructor.name.includes('NotFound') ? 404 : 500;
      return {
        statusCode,
        response: {
          status: 'ERROR',
          error: error.toException(),
        },
      };
    },
  },
];

/**
 * Handle errors and send appropriate response
 * Determines HTTP status code based on error type using dictionary lookup
 * 
 * @param error - The error to handle
 * @param res - Express response object
 */
export function handleError(error: unknown, res: Response): void {
  // Find the first matching handler
  const handlerEntry = errorHandlers.find((entry) => entry.check(error));

  if (handlerEntry) {
    const { statusCode, response } = handlerEntry.handler(error);
    res.status(statusCode).json(response);
    return;
  }

  // Unknown error (500 Internal Server Error)
  const response: APIResponse<never> = {
    status: 'ERROR',
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: 'An unexpected error occurred',
    },
  };
  res.status(500).json(response);
}
