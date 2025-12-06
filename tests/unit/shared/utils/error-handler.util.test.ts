/**
 * Tests for error handler utility
 */

import { Response } from 'express';
import { handleError } from '../../../../src/shared/utils/error-handler.util';
import {
  InvalidQueryParameterError,
  InvalidRequestError,
  TicketNotFoundError,
  EventNotFoundError,
  InsufficientTicketsError,
  AppError,
} from '../../../../src/domain/errors';

// Mock Express Response
const createMockResponse = (): Partial<Response> => {
  const res: any = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  };
  return res as Response;
};

class CustomAppError extends AppError {
  constructor() {
    super('CUSTOM_ERROR', 'A custom error occurred');
  }
}

type TestCase = {
  description: string;
  input: unknown;
  output: {
    statusCode: number;
    response: {
      status: 'ERROR';
      error: unknown;
    };
  };
};

const testCases: TestCase[] = [
  {
    description: 'should handle InvalidQueryParameterError with 400 status',
    input: new InvalidQueryParameterError({
      ticketIds: { issue: 'Invalid format', detail: 'Expected comma-separated integers' },
    }),
    output: {
      statusCode: 400,
      response: {
        status: 'ERROR',
        error: (() => {
          const error = new InvalidQueryParameterError({
            ticketIds: { issue: 'Invalid format', detail: 'Expected comma-separated integers' },
          });
          return error.toException();
        })(),
      },
    },
  },
  {
    description: 'should handle InvalidRequestError with 400 status',
    input: new InvalidRequestError({
      eventName: { issue: 'Required field', detail: 'Event name is required' },
    }),
    output: {
      statusCode: 400,
      response: {
        status: 'ERROR',
        error: (() => {
          const error = new InvalidRequestError({
            eventName: { issue: 'Required field', detail: 'Event name is required' },
          });
          return error.toException();
        })(),
      },
    },
  },
  {
    description: 'should handle TicketNotFoundError with 404 status',
    input: new TicketNotFoundError(123),
    output: {
      statusCode: 404,
      response: {
        status: 'ERROR',
        error: (() => {
          const error = new TicketNotFoundError(123);
          return error.toException();
        })(),
      },
    },
  },
  {
    description: 'should handle EventNotFoundError with 404 status',
    input: new EventNotFoundError(456),
    output: {
      statusCode: 404,
      response: {
        status: 'ERROR',
        error: (() => {
          const error = new EventNotFoundError(456);
          return error.toException();
        })(),
      },
    },
  },
  {
    description: 'should handle InsufficientTicketsError with 409 status',
    input: new InsufficientTicketsError(1, 5, 2),
    output: {
      statusCode: 409,
      response: {
        status: 'ERROR',
        error: (() => {
          const error = new InsufficientTicketsError(1, 5, 2);
          return error.toException();
        })(),
      },
    },
  },
  {
    description: 'should handle other AppError instances with 500 status',
    input: new CustomAppError(),
    output: {
      statusCode: 500,
      response: {
        status: 'ERROR',
        error: (() => {
          const error = new CustomAppError();
          return error.toException();
        })(),
      },
    },
  },
  {
    description: 'should handle unknown errors with 500 status',
    input: new Error('Some unexpected error'),
    output: {
      statusCode: 500,
      response: {
        status: 'ERROR',
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'An unexpected error occurred',
        },
      },
    },
  },
  {
    description: 'should handle non-Error objects with 500 status',
    input: { message: 'Something went wrong' },
    output: {
      statusCode: 500,
      response: {
        status: 'ERROR',
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'An unexpected error occurred',
        },
      },
    },
  },
  {
    description: 'should handle null/undefined with 500 status',
    input: null,
    output: {
      statusCode: 500,
      response: {
        status: 'ERROR',
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'An unexpected error occurred',
        },
      },
    },
  },
  {
    description: 'should prioritize validation errors over generic AppError',
    input: new InvalidQueryParameterError({
      limit: { issue: 'Invalid', detail: 'Must be positive' },
    }),
    output: {
      statusCode: 400,
      response: {
        status: 'ERROR',
        error: (() => {
          const error = new InvalidQueryParameterError({
            limit: { issue: 'Invalid', detail: 'Must be positive' },
          });
          return error.toException();
        })(),
      },
    },
  },
  {
    description: 'should prioritize not found errors over generic AppError',
    input: new TicketNotFoundError(123),
    output: {
      statusCode: 404,
      response: {
        status: 'ERROR',
        error: (() => {
          const error = new TicketNotFoundError(123);
          return error.toException();
        })(),
      },
    },
  },
];

describe('handleError', () => {
  let mockRes: Partial<Response>;

  beforeEach(() => {
    mockRes = createMockResponse();
  });

  testCases.forEach(({ description, input, output }) => {
    it(description, () => {
      handleError(input, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(output.statusCode);
      expect(mockRes.json).toHaveBeenCalledWith(output.response);
    });
  });
});
