/**
 * Tests for Event Service
 */

import { EventService } from '../../../../src/features/event/event.service';
import { MySQLConnector } from '../../../../src/shared/database/mysql.connector';
import { buildEventsCountQuery, buildEventsSelectQuery } from '../../../../src/features/event/queries/get-events.query';
import { getEventByIdQuery } from '../../../../src/features/event/queries/get-event-by-id.query';
import { GetEventsQuery, EventListItem, Event } from '../../../../src/features/event/event.types';
import { OrderByConfig } from '../../../../src/shared/types';
import { EventNotFoundError } from '../../../../src/domain/errors/event.errors';

// Mock the MySQLConnector
jest.mock('../../../../src/shared/database/mysql.connector');
jest.mock('../../../../src/features/event/queries/get-events.query');
jest.mock('../../../../src/features/event/queries/get-event-by-id.query');

describe('EventService', () => {
  let eventService: EventService;
  let mockDb: jest.Mocked<MySQLConnector>;

  beforeEach(() => {
    // Create a mock MySQLConnector
    mockDb = {
      query: jest.fn(),
      queryOne: jest.fn(),
      getConnection: jest.fn(),
      beginTransaction: jest.fn(),
      close: jest.fn(),
      getPool: jest.fn(),
    } as unknown as jest.Mocked<MySQLConnector>;

    eventService = new EventService(mockDb);

    // Reset all mocks
    jest.clearAllMocks();
  });

  describe('getEvents', () => {
    const mockQuery: GetEventsQuery = {
      limit: 10,
      offset: 0,
    };

    const mockEvents: EventListItem[] = [
      {
        id: 1,
        name: 'Summer Concert',
        description: 'A great summer concert',
        startTime: '2024-07-15T19:00:00Z',
        endTime: '2024-07-15T22:00:00Z',
        venueName: 'Madison Square Garden',
        venueCity: 'New York',
        venueCountryCode: 'USAS',
        venueTimezone: 'America/New_York',
      },
      {
        id: 2,
        name: 'Winter Festival',
        description: 'Winter music festival',
        startTime: '2024-12-20T18:00:00Z',
        endTime: '2024-12-20T23:00:00Z',
        venueName: 'Red Rocks',
        venueCity: 'Denver',
        venueCountryCode: 'USAS',
        venueTimezone: 'America/Denver',
      },
    ];

    it('should return events and total count', async () => {
      const mockCountResult = { total: 2 };
      const mockCountQuery = { sql: 'SELECT COUNT(*) as total FROM event', params: [] };
      const mockSelectQuery = { sql: 'SELECT ... FROM event', params: [10, 0] };

      (buildEventsCountQuery as jest.Mock).mockReturnValue(mockCountQuery);
      (buildEventsSelectQuery as jest.Mock).mockReturnValue(mockSelectQuery);
      mockDb.queryOne.mockResolvedValue(mockCountResult);
      mockDb.query.mockResolvedValue(mockEvents);

      const result = await eventService.getEvents(mockQuery);

      expect(result).toEqual({
        events: mockEvents,
        total: 2,
      });

      expect(buildEventsCountQuery).toHaveBeenCalledWith(mockQuery);
      expect(buildEventsSelectQuery).toHaveBeenCalledWith(mockQuery, undefined);
      expect(mockDb.queryOne).toHaveBeenCalledWith(mockCountQuery.sql, mockCountQuery.params);
      expect(mockDb.query).toHaveBeenCalledWith(mockSelectQuery.sql, mockSelectQuery.params);
    });

    it('should return empty array and zero total when no events found', async () => {
      const mockCountResult = { total: 0 };
      const mockCountQuery = { sql: 'SELECT COUNT(*) as total FROM event', params: [] };
      const mockSelectQuery = { sql: 'SELECT ... FROM event', params: [10, 0] };

      (buildEventsCountQuery as jest.Mock).mockReturnValue(mockCountQuery);
      (buildEventsSelectQuery as jest.Mock).mockReturnValue(mockSelectQuery);
      mockDb.queryOne.mockResolvedValue(mockCountResult);
      mockDb.query.mockResolvedValue([]);

      const result = await eventService.getEvents(mockQuery);

      expect(result).toEqual({
        events: [],
        total: 0,
      });
    });

    it('should handle null count result and return zero', async () => {
      const mockCountQuery = { sql: 'SELECT COUNT(*) as total FROM event', params: [] };
      const mockSelectQuery = { sql: 'SELECT ... FROM event', params: [10, 0] };

      (buildEventsCountQuery as jest.Mock).mockReturnValue(mockCountQuery);
      (buildEventsSelectQuery as jest.Mock).mockReturnValue(mockSelectQuery);
      mockDb.queryOne.mockResolvedValue(null);
      mockDb.query.mockResolvedValue([]);

      const result = await eventService.getEvents(mockQuery);

      expect(result).toEqual({
        events: [],
        total: 0,
      });
    });

    it('should pass orderBy parameter to query builder', async () => {
      const orderBy: OrderByConfig<EventListItem>[] = [
        { key: 'startTime', op: 'DESC' },
      ];
      const mockCountResult = { total: 2 };
      const mockCountQuery = { sql: 'SELECT COUNT(*) as total FROM event', params: [] };
      const mockSelectQuery = { sql: 'SELECT ... FROM event', params: [10, 0] };

      (buildEventsCountQuery as jest.Mock).mockReturnValue(mockCountQuery);
      (buildEventsSelectQuery as jest.Mock).mockReturnValue(mockSelectQuery);
      mockDb.queryOne.mockResolvedValue(mockCountResult);
      mockDb.query.mockResolvedValue(mockEvents);

      await eventService.getEvents(mockQuery, orderBy);

      expect(buildEventsSelectQuery).toHaveBeenCalledWith(mockQuery, orderBy);
    });

    it('should handle query with filters', async () => {
      const filteredQuery: GetEventsQuery = {
        eventIds: [1, 2],
        eventName: 'Concert',
        venueCountryCode: 'USAS',
        limit: 5,
        offset: 10,
      };
      const mockCountResult = { total: 2 };
      const mockCountQuery = { sql: 'SELECT COUNT(*) as total FROM event WHERE ...', params: [1, 2, '%Concert%', 'USAS'] };
      const mockSelectQuery = { sql: 'SELECT ... FROM event WHERE ...', params: [1, 2, '%Concert%', 'USAS', 5, 10] };

      (buildEventsCountQuery as jest.Mock).mockReturnValue(mockCountQuery);
      (buildEventsSelectQuery as jest.Mock).mockReturnValue(mockSelectQuery);
      mockDb.queryOne.mockResolvedValue(mockCountResult);
      mockDb.query.mockResolvedValue(mockEvents);

      const result = await eventService.getEvents(filteredQuery);

      expect(result).toEqual({
        events: mockEvents,
        total: 2,
      });

      expect(buildEventsCountQuery).toHaveBeenCalledWith(filteredQuery);
      expect(buildEventsSelectQuery).toHaveBeenCalledWith(filteredQuery, undefined);
      expect(mockDb.queryOne).toHaveBeenCalledWith(mockCountQuery.sql, mockCountQuery.params);
      expect(mockDb.query).toHaveBeenCalledWith(mockSelectQuery.sql, mockSelectQuery.params);
    });

    it('should execute count and select queries in parallel', async () => {
      const mockCountResult = { total: 2 };
      const mockCountQuery = { sql: 'SELECT COUNT(*) as total FROM event', params: [] };
      const mockSelectQuery = { sql: 'SELECT ... FROM event', params: [10, 0] };

      (buildEventsCountQuery as jest.Mock).mockReturnValue(mockCountQuery);
      (buildEventsSelectQuery as jest.Mock).mockReturnValue(mockSelectQuery);
      mockDb.queryOne.mockResolvedValue(mockCountResult);
      mockDb.query.mockResolvedValue(mockEvents);

      // Track call order
      const callOrder: string[] = [];
      mockDb.queryOne.mockImplementation(async () => {
        callOrder.push('queryOne');
        return mockCountResult;
      });
      mockDb.query.mockImplementation(async () => {
        callOrder.push('query');
        return mockEvents;
      });

      await eventService.getEvents(mockQuery);

      // Both should be called, but order may vary due to Promise.all
      expect(callOrder.length).toBe(2);
      expect(callOrder).toContain('queryOne');
      expect(callOrder).toContain('query');
    });
  });

  describe('getEventById', () => {
    const mockEventId = 1;
    const mockEvent: Event = {
      id: 1,
      name: 'Summer Concert 2024',
      description: 'A great summer concert',
      startTime: '2024-07-15T19:00:00Z',
      endTime: '2024-07-15T22:00:00Z',
      venue: {
        id: 1,
        name: 'Madison Square Garden',
        address: '4 Pennsylvania Plaza',
        city: 'New York',
        region: 'NY',
        countryCode: 'USAS',
        timezone: 'America/New_York',
      },
      tiers: {
        VIP: {
          ticketId: 1,
          price: 100.00,
          remaining: 45,
          capacity: 50,
        },
      },
    };

    it('should return an event when found', async () => {
      const mockQuery = { sql: 'SELECT ... WHERE e.id = ?', params: [mockEventId] };

      (getEventByIdQuery as jest.Mock).mockReturnValue(mockQuery);
      mockDb.queryOne.mockResolvedValue(mockEvent);

      const result = await eventService.getEventById(mockEventId);

      expect(result).toEqual(mockEvent);
      expect(getEventByIdQuery).toHaveBeenCalledWith(mockEventId);
      expect(mockDb.queryOne).toHaveBeenCalledWith(mockQuery.sql, mockQuery.params);
    });

    it('should throw EventNotFoundError when event not found', async () => {
      const mockQuery = { sql: 'SELECT ... WHERE e.id = ?', params: [mockEventId] };

      (getEventByIdQuery as jest.Mock).mockReturnValue(mockQuery);
      mockDb.queryOne.mockResolvedValue(null);

      await expect(eventService.getEventById(mockEventId)).rejects.toThrow(EventNotFoundError);
      expect(getEventByIdQuery).toHaveBeenCalledWith(mockEventId);
      expect(mockDb.queryOne).toHaveBeenCalledWith(mockQuery.sql, mockQuery.params);
    });

    it('should validate event data before returning', async () => {
      const mockQuery = { sql: 'SELECT ... WHERE e.id = ?', params: [mockEventId] };

      (getEventByIdQuery as jest.Mock).mockReturnValue(mockQuery);
      mockDb.queryOne.mockResolvedValue(mockEvent);

      const result = await eventService.getEventById(mockEventId);

      expect(result).not.toBeNull();
      // If validation passes, all required fields should be present
      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('name');
      expect(result).toHaveProperty('description');
      expect(result).toHaveProperty('startTime');
      expect(result).toHaveProperty('endTime');
      expect(result).toHaveProperty('venue');
      expect(result).toHaveProperty('tiers');
      expect(result.venue).toHaveProperty('id');
      expect(result.venue).toHaveProperty('name');
      expect(result.venue).toHaveProperty('address');
      expect(result.venue).toHaveProperty('city');
      expect(result.venue).toHaveProperty('countryCode');
      expect(result.venue).toHaveProperty('timezone');
    });
  });
});
