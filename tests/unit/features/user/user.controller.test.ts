/**
 * Tests for User Controller
 */

import { Request, Response } from 'express';
import { UserController } from '../../../../src/features/user/user.controller';
import { UserService } from '../../../../src/features/user/user.service';
import { UserNotFoundError, InvalidUserIdError } from '../../../../src/domain/errors';
import { handleError, parsePositiveInt } from '../../../../src/shared/utils';

// Mock dependencies
jest.mock('../../../../src/shared/utils', () => ({
  ...jest.requireActual('../../../../src/shared/utils'),
  handleError: jest.fn(),
  parsePositiveInt: jest.fn(),
}));

jest.mock('../../../../src/features/user/user.service');

const mockHandleError = handleError as jest.MockedFunction<typeof handleError>;
const mockParsePositiveInt = parsePositiveInt as jest.MockedFunction<typeof parsePositiveInt>;

// Mock Express Request and Response
const createMockRequest = (params: any = {}, body: any = {}): Partial<Request> => {
  return {
    params,
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

describe('UserController', () => {
  let controller: UserController;
  let mockUserService: jest.Mocked<UserService>;
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;

  beforeEach(() => {
    // Create a mock UserService
    mockUserService = {
      getAllUsers: jest.fn().mockResolvedValue([
        {
          id: 1,
          firstName: 'John',
          lastName: 'Doe',
          city: 'New York',
          countryCode: 'US',
        },
        {
          id: 2,
          firstName: 'Jane',
          lastName: 'Smith',
          city: 'Los Angeles',
          countryCode: 'US',
        },
      ]),
      getUserById: jest.fn().mockResolvedValue({
        id: 1,
        firstName: 'John',
        lastName: 'Doe',
        address: '123 Main Street',
        city: 'New York',
        region: 'NY',
        countryCode: 'US',
        timezone: 'America/New_York',
        userTickets: [
          {
            userTicketId: 1,
            eventName: 'Summer Concert',
            venueName: 'Madison Square Garden',
            tier: 'VIP',
            ticketAmount: 2,
            totalPrice: 200.00,
            datePurchased: '2024-07-15T14:30:00Z',
          },
        ],
      }),
    } as unknown as jest.Mocked<UserService>;

    controller = new UserController(mockUserService);
    mockReq = createMockRequest();
    mockRes = createMockResponse();
    jest.clearAllMocks();
  });

  describe('getUsers', () => {
    it('should return success response with simplified users list', async () => {
      await controller.getUsers(mockReq as Request, mockRes as Response);

      expect(mockUserService.getAllUsers).toHaveBeenCalledTimes(1);
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: 'OK',
        data: [
          {
            id: 1,
            firstName: 'John',
            lastName: 'Doe',
            city: 'New York',
            countryCode: 'US',
          },
          {
            id: 2,
            firstName: 'Jane',
            lastName: 'Smith',
            city: 'Los Angeles',
            countryCode: 'US',
          },
        ],
      });
    });

    it('should return empty array when no users found', async () => {
      mockUserService.getAllUsers.mockResolvedValueOnce([]);

      await controller.getUsers(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: 'OK',
        data: [],
      });
    });

    it('should handle service errors', async () => {
      const serviceError = new Error('Database connection failed');
      mockUserService.getAllUsers.mockRejectedValueOnce(serviceError);

      await controller.getUsers(mockReq as Request, mockRes as Response);

      expect(mockHandleError).toHaveBeenCalledWith(serviceError, mockRes);
      expect(mockRes.status).not.toHaveBeenCalledWith(200);
    });
  });

  describe('getUserById', () => {
    it('should return success response with user data', async () => {
      mockReq.params = { id: '1' };
      mockParsePositiveInt.mockReturnValueOnce(1);

      await controller.getUserById(mockReq as Request, mockRes as Response);

      expect(mockParsePositiveInt).toHaveBeenCalledWith('1', 'id');
      expect(mockUserService.getUserById).toHaveBeenCalledWith(1);
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: 'OK',
        data: {
          id: 1,
          firstName: 'John',
          lastName: 'Doe',
          address: '123 Main Street',
          city: 'New York',
          region: 'NY',
          countryCode: 'US',
          timezone: 'America/New_York',
          userTickets: [
            {
              userTicketId: 1,
              eventName: 'Summer Concert',
              venueName: 'Madison Square Garden',
              tier: 'VIP',
              ticketAmount: 2,
              totalPrice: 200.00,
              datePurchased: '2024-07-15T14:30:00Z',
            },
          ],
        },
      });
    });

    it('should handle UserNotFoundError', async () => {
      mockReq.params = { id: '999' };
      mockParsePositiveInt.mockReturnValueOnce(999);
      const notFoundError = new UserNotFoundError(999);
      mockUserService.getUserById.mockRejectedValueOnce(notFoundError);

      await controller.getUserById(mockReq as Request, mockRes as Response);

      expect(mockHandleError).toHaveBeenCalledWith(notFoundError, mockRes);
      expect(mockRes.status).not.toHaveBeenCalledWith(200);
    });

    it('should handle InvalidUserIdError from parsePositiveInt', async () => {
      mockReq.params = { id: 'invalid' };
      const invalidIdError = new InvalidUserIdError('invalid');
      mockParsePositiveInt.mockImplementationOnce(() => {
        throw invalidIdError;
      });

      await controller.getUserById(mockReq as Request, mockRes as Response);

      expect(mockHandleError).toHaveBeenCalledWith(invalidIdError, mockRes);
      expect(mockUserService.getUserById).not.toHaveBeenCalled();
      expect(mockRes.status).not.toHaveBeenCalledWith(200);
    });

    it('should handle different user IDs correctly', async () => {
      mockReq.params = { id: '42' };
      mockParsePositiveInt.mockReturnValueOnce(42);
      mockUserService.getUserById.mockResolvedValueOnce({
        id: 42,
        firstName: 'Jane',
        lastName: 'Smith',
        address: '456 Oak Avenue',
        city: 'Los Angeles',
        region: 'CA',
        countryCode: 'US',
        timezone: 'America/Los_Angeles',
        userTickets: [],
      });

      await controller.getUserById(mockReq as Request, mockRes as Response);

      expect(mockParsePositiveInt).toHaveBeenCalledWith('42', 'id');
      expect(mockUserService.getUserById).toHaveBeenCalledWith(42);
      expect(mockRes.status).toHaveBeenCalledWith(200);
    });

    it('should handle service errors', async () => {
      mockReq.params = { id: '1' };
      mockParsePositiveInt.mockReturnValueOnce(1);
      const serviceError = new Error('Database error');
      mockUserService.getUserById.mockRejectedValueOnce(serviceError);

      await controller.getUserById(mockReq as Request, mockRes as Response);

      expect(mockHandleError).toHaveBeenCalledWith(serviceError, mockRes);
      expect(mockRes.status).not.toHaveBeenCalledWith(200);
    });
  });
});
