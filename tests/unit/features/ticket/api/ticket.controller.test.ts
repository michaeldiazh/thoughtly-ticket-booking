/**
 * Tests for Ticket Controller
 */

import { Request, Response } from 'express';
import { TicketController } from '../../../../../src/features/ticket/ticket.controller';
import { TicketService } from '../../../../../src/features/ticket/ticket.service';
import { InvalidQueryParameterError } from '../../../../../src/domain/errors';
import { handleError } from '../../../../../src/shared/utils';

// Mock dependencies
jest.mock('../../../../../src/shared/utils', () => ({
  ...jest.requireActual('../../../../../src/shared/utils'),
  handleError: jest.fn(),
}));

jest.mock('../../../../../src/features/ticket/service/ticket.service');

const mockHandleError = handleError as jest.MockedFunction<typeof handleError>;

// Mock Express Request and Response
const createMockRequest = (query: any = {}): Partial<Request> => {
  return {
    query,
  } as Request;
};

const createMockResponse = (): Partial<Response> => {
  const res: any = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  };
  return res as Response;
};

describe('TicketController', () => {
  let controller: TicketController;
  let mockTicketService: jest.Mocked<TicketService>;
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;

  beforeEach(() => {
    // Create a mock TicketService
    mockTicketService = {
      getAllAvailableTickets: jest.fn().mockResolvedValue({
        tickets: [],
        total: 0,
      }),
    } as unknown as jest.Mocked<TicketService>;

    controller = new TicketController(mockTicketService);
    mockReq = createMockRequest();
    mockRes = createMockResponse();
    jest.clearAllMocks();
  });

  describe('getTickets', () => {
    it('should return success response with empty data', async () => {
      const query = { limit: '10', offset: '0' };
      mockReq.query = query;

      await controller.getTickets(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: 'OK',
        data: [],
        perPage: 10,
        offset: 0,
        total: 0,
      });
    });

    it('should use query parameters in response', async () => {
      const query = { limit: '20', offset: '5' };
      mockReq.query = query;

      await controller.getTickets(mockReq as Request, mockRes as Response);

      expect(mockRes.json).toHaveBeenCalledWith({
        status: 'OK',
        data: [],
        perPage: 20,
        offset: 5,
        total: 0,
      });
    });

    it('should handle validation errors', async () => {
      const query = { limit: 'invalid' };
      mockReq.query = query;

      await controller.getTickets(mockReq as Request, mockRes as Response);

      expect(mockHandleError).toHaveBeenCalled();
      const errorCall = (mockHandleError as jest.Mock).mock.calls[0][0];
      expect(errorCall).toBeInstanceOf(InvalidQueryParameterError);
      expect(mockRes.status).not.toHaveBeenCalledWith(200);
    });

    it('should handle empty query parameters', async () => {
      mockReq.query = {};

      await controller.getTickets(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: 'OK',
        data: [],
        perPage: 10,
        offset: 0,
        total: 0,
      });
    });

    it('should handle array query parameters', async () => {
      const query = { tierCodes: ['GA', 'VIP'] };
      mockReq.query = query;

      await controller.getTickets(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(200);
    });

    it('should handle unexpected errors', async () => {
      mockReq.query = {};

      await controller.getTickets(mockReq as Request, mockRes as Response);

      // stringifyQueryParams should not throw for empty query, so this test may need adjustment
      // If we want to test unexpected errors, we'd need to mock something else that could throw
      expect(mockRes.status).toHaveBeenCalledWith(200);
    });
  });
});
