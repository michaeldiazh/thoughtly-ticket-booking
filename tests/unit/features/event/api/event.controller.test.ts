/**
 * Tests for Event Controller
 */

import { Request, Response } from 'express';
import { EventController } from '../../../../../src/features/event/event.controller';
import { EventService } from '../../../../../src/features/event/event.service';
import { InvalidQueryParameterError } from '../../../../../src/domain/errors';
import { handleError } from '../../../../../src/shared/utils';

// Mock dependencies
jest.mock('../../../../../src/shared/utils', () => ({
  ...jest.requireActual('../../../../../src/shared/utils'),
  handleError: jest.fn(),
}));

jest.mock('../../../../../src/features/event/service/event.service');

const mockHandleError = handleError as jest.MockedFunction<typeof handleError>;

// Mock Express Request and Response
const createMockRequest = (query: any = {}, params: any = {}): Partial<Request> => {
  return {
    query,
    params,
  } as Request;
};

const createMockResponse = (): Partial<Response> => {
  const res: any = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  };
  return res as Response;
};

describe('EventController', () => {
  let controller: EventController;
  let mockEventService: jest.Mocked<EventService>;
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;

  beforeEach(() => {
    // Create a mock EventService
    mockEventService = {
      getEvents: jest.fn().mockResolvedValue({
        events: [],
        total: 0,
      }),
      getEventById: jest.fn().mockResolvedValue({
        id: 1,
        name: 'Test Event',
        description: 'Test Description',
        startTime: '2024-12-31T20:00:00Z',
        endTime: '2024-12-31T22:00:00Z',
        venue: {
          id: 1,
          name: 'Test Venue',
          address: '123 Test St',
          city: 'Test City',
          region: null,
          countryCode: 'USAS',
          timezone: 'America/New_York',
        },
        tiers: {},
      }),
    } as unknown as jest.Mocked<EventService>;

    controller = new EventController(mockEventService);
    mockReq = createMockRequest();
    mockRes = createMockResponse();
    jest.clearAllMocks();
  });

  describe('getEvents', () => {
    it('should return success response with empty data', async () => {
      const query = { limit: '10', offset: '0' };
      mockReq.query = query;

      await controller.getEvents(mockReq as Request, mockRes as Response);

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

      await controller.getEvents(mockReq as Request, mockRes as Response);

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

      await controller.getEvents(mockReq as Request, mockRes as Response);

      expect(mockHandleError).toHaveBeenCalled();
      const errorCall = (mockHandleError as jest.Mock).mock.calls[0][0];
      expect(errorCall).toBeInstanceOf(InvalidQueryParameterError);
      expect(mockRes.status).not.toHaveBeenCalledWith(200);
    });

    it('should handle empty query parameters', async () => {
      mockReq.query = {};

      await controller.getEvents(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: 'OK',
        data: [],
        perPage: 10,
        offset: 0,
        total: 0,
      });
    });

    it('should handle filtered query parameters', async () => {
      const query = { eventName: 'Concert', venueCountryCode: 'USAS' };
      mockReq.query = query;

      await controller.getEvents(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockEventService.getEvents).toHaveBeenCalled();
    });

    it('should handle array query parameters (eventIds)', async () => {
      const query = { eventIds: ['1', '2', '3'] };
      mockReq.query = query;

      await controller.getEvents(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(200);
    });
  });

  describe('getEventById', () => {
    it('should return success response with event data', async () => {
      const eventId = '1';
      mockReq.params = { id: eventId };

      await controller.getEventById(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: 'OK',
        data: expect.objectContaining({
          id: 1,
          name: 'Test Event',
        }),
      });
      expect(mockEventService.getEventById).toHaveBeenCalledWith(1);
    });

    it('should handle invalid event ID', async () => {
      mockReq.params = { id: 'invalid' };

      await controller.getEventById(mockReq as Request, mockRes as Response);

      expect(mockHandleError).toHaveBeenCalled();
      expect(mockRes.status).not.toHaveBeenCalledWith(200);
    });

    it('should handle negative event ID', async () => {
      mockReq.params = { id: '-1' };

      await controller.getEventById(mockReq as Request, mockRes as Response);

      expect(mockHandleError).toHaveBeenCalled();
      expect(mockRes.status).not.toHaveBeenCalledWith(200);
    });

    it('should handle missing event ID parameter', async () => {
      mockReq.params = {};

      await controller.getEventById(mockReq as Request, mockRes as Response);

      expect(mockHandleError).toHaveBeenCalled();
    });
  });
});
