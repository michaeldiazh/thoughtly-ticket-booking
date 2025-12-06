/**
 * Tests for User Ticket Controller
 */

import { Request, Response } from 'express';
import { UserTicketController } from '../../../../src/features/user-ticket/user-ticket.controller';
import { UserTicketService } from '../../../../src/features/user-ticket/user-ticket.service';
import { InvalidRequestError } from '../../../../src/domain/errors';
import { handleError } from '../../../../src/shared/utils';

// Mock dependencies
jest.mock('../../../../src/shared/utils', () => ({
  ...jest.requireActual('../../../../src/shared/utils'),
  handleError: jest.fn(),
}));

jest.mock('../../../../src/features/user-ticket/user-ticket.service');

const mockHandleError = handleError as jest.MockedFunction<typeof handleError>;

// Mock Express Request and Response
const createMockRequest = (body: any = {}): Partial<Request> => {
  return {
    body,
  } as Request;
};

const createMockResponse = (): Partial<Response> => {
  const res: any = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  };
  return res as Response;
};

describe('UserTicketController', () => {
  let controller: UserTicketController;
  let mockUserTicketService: jest.Mocked<UserTicketService>;
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;

  beforeEach(() => {
    // Create a mock UserTicketService
    mockUserTicketService = {
      addNewUserTicket: jest.fn().mockResolvedValue({
        id: 1,
        ticketId: 1,
        userId: 1,
        unitPrice: 100.00,
        ticketAmount: 2,
        totalPrice: 200.00,
        datePurchased: '2024-01-15T10:00:00.000Z',
      }),
    } as unknown as jest.Mocked<UserTicketService>;

    controller = new UserTicketController(mockUserTicketService);
    mockReq = createMockRequest();
    mockRes = createMockResponse();
    jest.clearAllMocks();
  });

  describe('addNewUserTicket', () => {
    it('should return success response with user ticket data', async () => {
      const requestBody = {
        ticketId: 1,
        userId: 1,
        quantity: 2,
      };
      mockReq.body = requestBody;

      await controller.addNewUserTicket(mockReq as Request, mockRes as Response);

      expect(mockUserTicketService.addNewUserTicket).toHaveBeenCalledWith(requestBody);
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: 'OK',
        data: {
          id: 1,
          ticketId: 1,
          userId: 1,
          unitPrice: 100.00,
          ticketAmount: 2,
          totalPrice: 200.00,
          datePurchased: '2024-01-15T10:00:00.000Z',
        },
      });
    });

    it('should handle validation errors for missing ticketId', async () => {
      const requestBody = {
        userId: 1,
        quantity: 2,
      };
      mockReq.body = requestBody;

      await controller.addNewUserTicket(mockReq as Request, mockRes as Response);

      expect(mockHandleError).toHaveBeenCalled();
      const errorCall = (mockHandleError as jest.Mock).mock.calls[0][0];
      expect(errorCall).toBeInstanceOf(InvalidRequestError);
      expect(mockRes.status).not.toHaveBeenCalledWith(201);
      expect(mockUserTicketService.addNewUserTicket).not.toHaveBeenCalled();
    });

    it('should handle validation errors for missing userId', async () => {
      const requestBody = {
        ticketId: 1,
        quantity: 2,
      };
      mockReq.body = requestBody;

      await controller.addNewUserTicket(mockReq as Request, mockRes as Response);

      expect(mockHandleError).toHaveBeenCalled();
      const errorCall = (mockHandleError as jest.Mock).mock.calls[0][0];
      expect(errorCall).toBeInstanceOf(InvalidRequestError);
      expect(mockRes.status).not.toHaveBeenCalledWith(201);
      expect(mockUserTicketService.addNewUserTicket).not.toHaveBeenCalled();
    });

    it('should handle validation errors for missing quantity', async () => {
      const requestBody = {
        ticketId: 1,
        userId: 1,
      };
      mockReq.body = requestBody;

      await controller.addNewUserTicket(mockReq as Request, mockRes as Response);

      expect(mockHandleError).toHaveBeenCalled();
      const errorCall = (mockHandleError as jest.Mock).mock.calls[0][0];
      expect(errorCall).toBeInstanceOf(InvalidRequestError);
      expect(mockRes.status).not.toHaveBeenCalledWith(201);
      expect(mockUserTicketService.addNewUserTicket).not.toHaveBeenCalled();
    });

    it('should handle validation errors for invalid ticketId (non-positive)', async () => {
      const requestBody = {
        ticketId: 0,
        userId: 1,
        quantity: 2,
      };
      mockReq.body = requestBody;

      await controller.addNewUserTicket(mockReq as Request, mockRes as Response);

      expect(mockHandleError).toHaveBeenCalled();
      const errorCall = (mockHandleError as jest.Mock).mock.calls[0][0];
      expect(errorCall).toBeInstanceOf(InvalidRequestError);
      expect(mockRes.status).not.toHaveBeenCalledWith(201);
      expect(mockUserTicketService.addNewUserTicket).not.toHaveBeenCalled();
    });

    it('should handle validation errors for invalid userId (non-positive)', async () => {
      const requestBody = {
        ticketId: 1,
        userId: -1,
        quantity: 2,
      };
      mockReq.body = requestBody;

      await controller.addNewUserTicket(mockReq as Request, mockRes as Response);

      expect(mockHandleError).toHaveBeenCalled();
      const errorCall = (mockHandleError as jest.Mock).mock.calls[0][0];
      expect(errorCall).toBeInstanceOf(InvalidRequestError);
      expect(mockRes.status).not.toHaveBeenCalledWith(201);
      expect(mockUserTicketService.addNewUserTicket).not.toHaveBeenCalled();
    });

    it('should handle validation errors for invalid quantity (less than 1)', async () => {
      const requestBody = {
        ticketId: 1,
        userId: 1,
        quantity: 0,
      };
      mockReq.body = requestBody;

      await controller.addNewUserTicket(mockReq as Request, mockRes as Response);

      expect(mockHandleError).toHaveBeenCalled();
      const errorCall = (mockHandleError as jest.Mock).mock.calls[0][0];
      expect(errorCall).toBeInstanceOf(InvalidRequestError);
      expect(mockRes.status).not.toHaveBeenCalledWith(201);
      expect(mockUserTicketService.addNewUserTicket).not.toHaveBeenCalled();
    });

    it('should handle validation errors for invalid quantity (negative)', async () => {
      const requestBody = {
        ticketId: 1,
        userId: 1,
        quantity: -1,
      };
      mockReq.body = requestBody;

      await controller.addNewUserTicket(mockReq as Request, mockRes as Response);

      expect(mockHandleError).toHaveBeenCalled();
      const errorCall = (mockHandleError as jest.Mock).mock.calls[0][0];
      expect(errorCall).toBeInstanceOf(InvalidRequestError);
      expect(mockRes.status).not.toHaveBeenCalledWith(201);
      expect(mockUserTicketService.addNewUserTicket).not.toHaveBeenCalled();
    });

    it('should handle validation errors for non-integer values', async () => {
      const requestBody = {
        ticketId: 1.5,
        userId: 1,
        quantity: 2,
      };
      mockReq.body = requestBody;

      await controller.addNewUserTicket(mockReq as Request, mockRes as Response);

      expect(mockHandleError).toHaveBeenCalled();
      const errorCall = (mockHandleError as jest.Mock).mock.calls[0][0];
      expect(errorCall).toBeInstanceOf(InvalidRequestError);
      expect(mockRes.status).not.toHaveBeenCalledWith(201);
      expect(mockUserTicketService.addNewUserTicket).not.toHaveBeenCalled();
    });

    it('should handle validation errors for string values instead of numbers', async () => {
      const requestBody = {
        ticketId: '1',
        userId: '1',
        quantity: '2',
      };
      mockReq.body = requestBody;

      await controller.addNewUserTicket(mockReq as Request, mockRes as Response);

      expect(mockHandleError).toHaveBeenCalled();
      const errorCall = (mockHandleError as jest.Mock).mock.calls[0][0];
      expect(errorCall).toBeInstanceOf(InvalidRequestError);
      expect(mockRes.status).not.toHaveBeenCalledWith(201);
      expect(mockUserTicketService.addNewUserTicket).not.toHaveBeenCalled();
    });

    it('should handle service errors', async () => {
      const requestBody = {
        ticketId: 1,
        userId: 1,
        quantity: 2,
      };
      mockReq.body = requestBody;

      const serviceError = new Error('Service error');
      mockUserTicketService.addNewUserTicket.mockRejectedValue(serviceError);

      await controller.addNewUserTicket(mockReq as Request, mockRes as Response);

      expect(mockHandleError).toHaveBeenCalledWith(serviceError, mockRes);
      expect(mockRes.status).not.toHaveBeenCalledWith(201);
    });

    it('should handle empty request body', async () => {
      mockReq.body = {};

      await controller.addNewUserTicket(mockReq as Request, mockRes as Response);

      expect(mockHandleError).toHaveBeenCalled();
      const errorCall = (mockHandleError as jest.Mock).mock.calls[0][0];
      expect(errorCall).toBeInstanceOf(InvalidRequestError);
      expect(mockRes.status).not.toHaveBeenCalledWith(201);
      expect(mockUserTicketService.addNewUserTicket).not.toHaveBeenCalled();
    });

    it('should handle null request body', async () => {
      mockReq.body = null;

      await controller.addNewUserTicket(mockReq as Request, mockRes as Response);

      expect(mockHandleError).toHaveBeenCalled();
      expect(mockRes.status).not.toHaveBeenCalledWith(201);
      expect(mockUserTicketService.addNewUserTicket).not.toHaveBeenCalled();
    });
  });
});
